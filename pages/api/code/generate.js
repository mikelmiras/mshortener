import { doesAppExist, getDB, UNAUTHORIZED } from "../util";

export default async function handler(req, res){
    // Required params:
    const client_id = req.query.client_id // Public app id
    const response_type = req.query.response_type //Has to becode
    const redirect_uri = req.query.redirect_uri // URI to be redirected to
    const scope = req.query.scope ? req.query.scope : "user-info" //Scopes, if not specified, user-info

    if (!client_id || !response_type || !redirect_uri){
        res.status(400).json()
        return;
    }
    
    const client = await getDB()
    try {
    const app_exists = await doesAppExist(client, client_id)
    if (!app_exists){
        res.status(400).json({"erorr":"Specified app doesn't exist"})
    }
    res.status(200).json({type, public_id, secret, "request":{client_id, response_type, redirect_uri, scope}})
    
    } catch(e){
        res.status(500).json({"error":"There was an error processing your request"})
    }
    
}