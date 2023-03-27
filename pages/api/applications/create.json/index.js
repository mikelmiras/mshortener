// POST /api/applications/create.json
// This endpoint creates a developer app and it's tokens. 
// Requires bearer token

import { BAD_REQUEST, DUPLICATED_RESOURCE, FORBIDDEN, getDB, getUserFromToken, isNativeToken, METHOD_NOT_ALLOWED, UNAUTHORIZED } from "../../util";

// Requires a native app token
export default async function handler(req, res){
    // Validate post and options method
    if (req.method !== "POST" && req.method !== "OPTIONS"){
        res.status(405).json(METHOD_NOT_ALLOWED)
        return;
    }
    // Preflight: send 200
    if (req.method === "OPTIONS"){
        res.status(200).json({"status":true})
        return;
    }
    // Validate params (access_token, app_name)
    const access_token = req.headers.authorization
    const app_name = req.body.app_name
    if (!access_token || !app_name){
        res.status(400).json(BAD_REQUEST)
        return;
    }
    // Validate access_token
    const [type, token] = access_token.split(" ")
    if (type !== "Bearer"){
        res.status(401).json(UNAUTHORIZED)
        return;
    }
    const client = await getDB()
    const isNative = await isNativeToken(client, token)
    // If token is not native or doesn't exist, return
    if (!isNative){
        res.status(403).json(FORBIDDEN)
        return;
    }
    try {
        const user = await getUserFromToken(client, token)
        const get_id = await fetch(process.env.API_ENDPOINT + "v1/applications/generate.json", {
            headers:{
                "Authorization":"Basic " + btoa(process.env.APP_PUBLIC + ":" + process.env.APP_SECRET)
            }
        })
        const data = await get_id.json()
        const {id, private_token} = data
        const resp = await client.query('INSERT INTO application (public_id, secret, userid, name) VALUES ($1, $2, $3, $4);', [id, private_token, user.id, app_name])
        res.status(200).json({"app":{app_name, id, private_token}})
    }catch (e){
        res.status(405).json({DUPLICATED_RESOURCE})
        return;
    }
}