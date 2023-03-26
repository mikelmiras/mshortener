import {BAD_REQUEST, basicAuth, getDB, METHOD_NOT_ALLOWED, NOT_FOUND, UNAUTHORIZED} from "../../util"
export default async function handler(req, res){
    // Allow only GET method
    if (req.method !== "GET"){
        res.status(405).json(METHOD_NOT_ALLOWED)
        return;
    }
    // Validate required params (id)
    const id = req.query.id
    if (!id){
        res.status(400).json(BAD_REQUEST)
        return;
    }
    // Validate Basic auth
    const auth = req.headers.authorization;
    if (!auth){
        res.status(400).json(BAD_REQUEST)
        return;
    }
    const [app_public, app_secret] = basicAuth(auth)
    if (app_public !== process.env.APP_PUBLIC || app_secret !== process.env.APP_SECRET){
        res.status(401).json(UNAUTHORIZED)
        return;
    }
    const client = await getDB()

    const redirect_query = await client.query('SELECT url from link where id = $1;', [id])
    if (redirect_query.rowCount !== 1){
        res.status(404).json(NOT_FOUND)
        return; 
    }
    await client.query('INSERT INTO link_visits (id) VALUES($1);', [id])
    const redirect_uri = redirect_query.rows[0].url
    res.status(200).json({redirect_uri})
    await client.end()
}