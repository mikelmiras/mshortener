import { BAD_REQUEST, generateAccessToken, getDB, METHOD_NOT_ALLOWED, NOT_FOUND, UNAUTHORIZED, validatePassword } from "./util";

export default async function handler(req, res){
    if (req.method !== "POST"){
        res.status(405).json(METHOD_NOT_ALLOWED);
        return;
    }
    const credential = req.body.credential
    const pass = req.body.pass
    if (!credential || !pass){
        res.status(400).json(BAD_REQUEST)
        return;
    }

    const client = await getDB();
    const query = await client.query('SELECT id, password FROM users WHERE username = $1 OR email = $1', [credential])

    if (query.rowCount !== 1){
        res.status(404).json(NOT_FOUND)
        return;
    }
    const result = query.rows[0]
    const matches = await validatePassword(pass, result.password)
    if (!matches){
        res.status(401).json(UNAUTHORIZED)
        return;
    }
    const token = generateAccessToken();
    const expire = new Date();
    expire.setFullYear(expire.getFullYear() + 1);
    const savetoken = await client.query('INSERT INTO access_token VALUES($1, $2, $3, $4);', [
        process.env.APP_PUBLIC, token, result.id, expire.toISOString()
    ])
    const saveScopes = await client.query('INSERT INTO access_token_scopes VALUES($1, $2);', [
        'link-edit',
        token
    ])
    await client.query('INSERT INTO access_token_scopes VALUES($1, $2);', [
        'user-info',
        token
    ])
    res.setHeader('Set-cookie', "mshortener_account_auth=" + token + ";path=/;Expires=" + expire.toGMTString())
    res.status(200).json({"status":true, "access_token":token})
}