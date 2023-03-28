import {NOT_FOUND, FORBIDDEN, METHOD_NOT_ALLOWED, BAD_REQUEST, basicAuth, UNAUTHORIZED, getDB, isNativeToken, getUserFromToken} from "../../util"
// GET /api/applications/fetch.json
// This endpoint fetches a user's developer applications (just public id and name)
// Requires native access token and Basic authentication (this endpoint should be run from server)
// Bearer token must be passed through token param.

export default async function handler(req, res){
    // Validate method
    if (req.method !== "GET"){
        res.status(405).json(METHOD_NOT_ALLOWED)
        return
    }
    const auth = req.headers.authorization
    const user_token = req.query.token
    if (!auth || !user_token){
        res.status(400).json(BAD_REQUEST)
        return
    }

    const [app_public, app_secret] = basicAuth(auth)
    if (app_public !== process.env.APP_PUBLIC || app_secret !== process.env.APP_SECRET){
        res.status(401).json(UNAUTHORIZED)
        return;
    }

    const client = await getDB()
    const isNative = await isNativeToken(client, user_token)
    if (!isNative){
        res.status(403).json(FORBIDDEN)
        return
    }
    const {id} = await getUserFromToken(client, user_token)
    const applications_basic = await client.query('SELECT public_id, date, name FROM application WHERE userid = $1 ORDER BY date DESC;', [id])
    const applications = []
    for (const app of applications_basic.rows){
        const uri = await client.query('select uri from application_uri  where app_id = $1;', [app.public_id])
        const uris = []
        uri.rows.forEach(item => uris.push(item.uri))
        applications.push({...app, uris})
    }
    await client.end()
    res.status(200).json({applications})
}