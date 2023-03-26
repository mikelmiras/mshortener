import { getLocalISOString } from "../code/generate";
import { BAD_REQUEST, basicAuth, doesAppExist, generateAccessToken, getDB, getSecretFromPublic, INTERNAL_SERVER_ERROR, METHOD_NOT_ALLOWED, NOT_FOUND, UNAUTHORIZED } from "../util"

export default async function handler(req, res){
    // Check method: allow POST and OPTIONS (preflight)
    if (req.method !== "POST" && req.method !== "OPTIONS"){
        res.setHeader("Allow", "POST")
        res.status(405).json(METHOD_NOT_ALLOWED)
        return;
    }
    // Check if auth header is set
    const auth = req.headers.authorization
    if (!auth){
        res.status(400).json(BAD_REQUEST)
        return;
    }
    // Check that auth method is Basic
    const type = auth.split(" ")[0]
    if (type !== "Basic"){
        res.status(400).json(BAD_REQUEST)
        return; 
    }
    // Check that query params are given
    const {grant_type, code, redirect_uri} = req.query
    if (!grant_type){
        res.status(400).json(BAD_REQUEST)
        return;
    }
    // Stablish connection to DB
    const client = await getDB()

    // Check Basic authorization credentials, validate and decode them.
    const [app_public, app_secret] = basicAuth(auth)
    
    const appexists = await doesAppExist(client, app_public)
    if (!appexists){
        res.status(401).json(UNAUTHORIZED)
        return;
    }
    switch(grant_type){
        case "authorization_code":
            await getAccessToken(client, req, res, app_public, app_secret, code, redirect_uri)
            break;
        case "refresh_token":
            await generateRefreshToken(client, req, res, app_public, app_secret)
            break;
        default:
            res.status(400).json(BAD_REQUEST)
    }
    
}



async function getAccessToken(client, req, res, app_public, app_secret, redirect_uri){
    const code = req.query.code
    // Check that specific query params are provided 
    if (!redirect_uri || !code){
        res.status(400).json(BAD_REQUEST)
        return;
    }
    // Validate secret token
    const real_secret = await getSecretFromPublic(client, app_public)
    if (real_secret !== app_secret){
        res.status(401).json(UNAUTHORIZED)
        return;
    }
    // Validate code, redirect_uri and app and retrieve user's data
    const auth_user = await client.query('SELECT user_id, app_id FROM code WHERE code = $1 AND expire > CURRENT_TIMESTAMP', [code])
    if (auth_user.rowCount !== 1){
        res.status(404).json(NOT_FOUND)
        return;
    }
    // Get app and user data
    const {user_id, app_id} = auth_user.rows[0]
    // Generate tokens
    const access_token = generateAccessToken()
    const refresh_token = generateAccessToken()
    // Get allowed scopes before removing code
    const scopes = []
    const search_scopes = await client.query('SELECT * FROM code_scopes WHERE code = $1;', [code])
    // Validate that any response has been received (it should be always be at least one scope, but just in case...)
    if (search_scopes.rowCount > 0){
        search_scopes.rows.forEach(row=>{
            scopes.push(row.scope)
        })
    }
    // Remove code
    await client.query('DELETE FROM code WHERE code = $1', [code])
    // Generate expiration dates (access_token will expire in an hour, while refresh token will expire in 6 months)
    const access_token_expire = new Date()
    access_token_expire.setHours(access_token_expire.getHours() + 1)

    const refresh_token_expire = new Date()
    refresh_token_expire.setMonth(refresh_token_expire.getMonth() + 6)

    // Save tokens
    try {
        await client.query('INSERT INTO access_token(app_id, token, user_id, expire) VALUES($1, $2, $3, $4);', [
            app_id, access_token, user_id, getLocalISOString(access_token_expire)
        ]);
        await client.query('INSERT INTO refresh_token(app_id, token, user_id, expires) VALUES($1, $2, $3, $4);', [
            app_id, refresh_token, user_id, getLocalISOString(refresh_token_expire)
        ])
        scopes.forEach(async (scope)=>{
            client.query('INSERT INTO refresh_token_scopes VALUES ($1, $2);', [
                refresh_token, scope
            ])
            client.query('INSERT INTO access_token_scopes VALUES ($1, $2);', [
                scope, access_token
            ])
        })
    }catch (e){
        res.status(500).json(INTERNAL_SERVER_ERROR)
        return;
    }



    res.status(200).json({access_token, "expire":3600 ,refresh_token})
}

async function generateRefreshToken(client, req, res, app_public, app_secret){
    // To request a refreshed access token, client_id and the refresh token must be sent through body
    const client_id = req.body.client_id
    const refresh_token = req.body.refresh_token
    if (!client_id || !refresh_token){
        res.status(400).json(BAD_REQUEST)
        return;
    }
    // Client id and client id from header must be the same.
    if (client_id !== app_public){
        res.status(400).json(BAD_REQUEST)
        return;
    }

    // Validate that the refresh token exists and is not expired, if exists fetch app_data
    const token_data = await client.query('SELECT user_id, app_id FROM refresh_token WHERE token = $1 AND CURRENT_TIMESTAMP < expires;', [refresh_token])
    if (token_data.rowCount !== 1){
        // Token is not valid or has expired
        res.status(400).json(NOT_FOUND)
        return;
    }

    // Get user's and app's id from given refresh token.
    const {user_id, app_id} = token_data.rows[0]
    // Generate new access token
    const access_token = generateAccessToken()
    // Generate new access token's expiration
    const expire = new Date()
    expire.setHours(expire.getHours() + 1)
    // Save new access_token
    try{
        await client.query('INSERT INTO access_token(app_id, token, user_id, expire) VALUES($1, $2, $3, $4);', [
            app_id, access_token, user_id, getLocalISOString(expire)
        ]);
    let scopes = ""
     // Fetch scopes from refresh_token
    const fetch_scopes = await client.query('SELECT scope FROM refresh_token_scopes WHERE token = $1;', [refresh_token])
    if (fetch_scopes.rowCount > 0){
        // Validate that there are scopes (always should be at least one, but just in case)
        for (const scope of fetch_scopes.rows){
            scopes += scope.scope + " "       
            console.log(scope.scope)   
            await client.query('INSERT INTO access_token_scopes VALUES ($1, $2);', [
                scope.scope, access_token
            ])
        }
        scopes.trim()
    }

    res.status(200).json({access_token, "token-type":"Bearer", scopes, "expires":3600})
    await client.end()
    

} catch(e){
    console.log(e)
    res.status(500).json(INTERNAL_SERVER_ERROR)
}    
}
