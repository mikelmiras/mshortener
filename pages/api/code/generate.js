import { BAD_REQUEST, doesAppExist, generateCode, getDB, isURIValid, UNAUTHORIZED } from "../util";

export default async function handler(req, res){
    // Required params:
    const client_id = req.query.client_id // Public app id
    const response_type = req.query.response_type //Has to becode
    const redirect_uri = req.query.redirect_uri // URI to be redirected to
    const scope = req.query.scope ? req.query.scope : "user-info" //Scopes, if not specified, user-info


    const token = req.body.token; // Logged in user's token

    if (!client_id || !response_type || !redirect_uri || !token){
        res.status(400).json(BAD_REQUEST)
        return;
    }
    
    const client = await getDB()
    try {
    const app_exists = await doesAppExist(client, client_id)
    if (!app_exists){
        res.status(400).json({"erorr":"Specified app doesn't exist"})
        return;
    }
    // Check if uri is valid
    const valid_uri = await isURIValid(client, client_id, redirect_uri);
    if (!valid_uri){
        res.status(401).json(UNAUTHORIZED)
        return;
    }

    const code = generateCode()
    const userExists = await client.query('SELECT users.id, access_token.token FROM users INNER JOIN access_token ON access_token.user_id = users.id WHERE access_token.app_id = $1 AND access_token.token = $2;', [process.env.APP_PUBLIC, token])
    if (userExists.rowCount !== 1){
        res.status(401).json(UNAUTHORIZED)
        return;
    }
    const user_id = userExists.rows[0].id
    const expire = new Date()
    expire.setMinutes(expire.getMinutes() + 5)
    await client.query('DELETE FROM code WHERE expire < CURRENT_TIMESTAMP;');
    await client.query('INSERT INTO code VALUES ($1, $2, $3, $4, $5, $6);', [user_id, getLocalISOString(expire), code, null, client_id, redirect_uri])
    const scopes = scope.split(" ")
    scopes.forEach(async element => {
        client.query('INSERT INTO code_scopes VALUES($1, $2);', [element, code])
    })
    res.status(200).json({"request":{client_id, response_type, redirect_uri, scope}, code, user_id, scopes})
    } catch(e){
        res.status(500).json({"error":"There was an error processing your request"})
    }
    
}


export function getLocalISOString(date) {
    const tzOffset = date.getTimezoneOffset() * 60000; // Get the time zone offset in milliseconds
    const localTime = date.getTime() - tzOffset; // Subtract the time zone offset from the UTC time
    return new Date(localTime).toISOString(); // Convert the local time to ISO 8601 string
  }
  