import { BAD_REQUEST, basicAuth, doesAppExist, getDB, isURIValid, NOT_FOUND, UNAUTHORIZED } from "../../../util";

// This function fetches App's information (name and scopes) from given token. Requires Basic auth.
export default async function handler(req, res){
    const auth = req.headers.authorization;
    const redirect_uri = req.query.redirect_uri
    const app_public = req.query.client_id
    const scope = req.query.scope ? req.query.scope.split(" ") : ['user-info']
    if (!auth || !app_public ){
        res.status(400).json(BAD_REQUEST)
        return;
    }
    const [public_id, secret] = basicAuth(auth)
    if (public_id !== process.env.APP_PUBLIC || secret !== process.env.APP_SECRET){
        res.status(401).json(UNAUTHORIZED)
        return;
    }
    const client = await getDB()

    if (!doesAppExist(client, app_public)){
        res.status(404).json(NOT_FOUND)
        return;
    }
    const valid_uri = await isURIValid(client, app_public, redirect_uri)
    if (!valid_uri){
        res.status(404).json(NOT_FOUND)
        return;
    }
    const app_r = await client.query('SELECT name FROM application WHERE public_id = $1', [app_public])
    const app = app_r.rows[0]
    const scopes = []
    for (const scope_i of scope) {
        const item = await client.query('SELECT * FROM scopes WHERE name = $1', [scope_i])
        if (item.rowCount !== 1) continue
        scopes.push(item.rows[0])
    }
    if (scopes.length == 0) {
        const default_scope = await client.query('SELECT name, descr FROM scopes WHERE name = $1;', ["user-info"])
        scopes.push(default_scope.rows[0])
    }
    const newapp = {...app, redirect_uri}
    res.status(200).json({"app":newapp, scopes})
}