// This endpoint generates a new redirect link. Can be used without token, but if a token is provided 
// scopes must be validated.
// Method: POST
// Auth: none or Bearer
// Scopes: link-edit
import {allowedScope, BAD_REQUEST, FORBIDDEN, generateShortUrlId, getDB, getUserFromToken, INTERNAL_SERVER_ERROR, METHOD_NOT_ALLOWED} from "../../../util"
export default async function handler(req, res){
// Validate method
if (req.method !== 'POST'){
    res.status(405).json(METHOD_NOT_ALLOWED)
    return;
}
// Validate required params:
const redirect_uri = req.body.redirect_uri
if (!redirect_uri){
    res.status(400).json(BAD_REQUEST)
    return;
}

const auth = req.headers.authorization;
const client = await getDB()
let author = undefined
let user = undefined
if (auth){
    // If auth provided, validate and fetch user's id.
    const [method, token] = auth.split(" ");
    if (method!=='Bearer'){
        res.status(400).json(BAD_REQUEST)
        return; 
    }
    // If auth is bearer, validate scope. This function while validating scopes also validates that token
    // exists and it's not expired.
    const scope = 'link-edit'
    const istokenvalid = await allowedScope(client, token, scope)
    if (istokenvalid){
        user = await getUserFromToken(client, token)
        author = parseInt(user?.id)
    }else{
        res.status(403).json(FORBIDDEN)
        return;
    }   
}

const id = generateShortUrlId()
    // Save redirect link
    try {
    await client.query('INSERT INTO link(id, url, userid) VALUES($1, $2, $3);', [id, redirect_uri, author])
}
catch (e){
    res.status(500).json(INTERNAL_SERVER_ERROR)
    return;
}
if (!author){
res.status(200).json({id, redirect_uri})
}else{
    res.status(200).json({id, redirect_uri})
}
}