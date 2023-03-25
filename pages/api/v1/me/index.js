import { BAD_REQUEST, getDB, METHOD_NOT_ALLOWED, UNAUTHORIZED } from "../../util";

export default async function handler(req, res){
    if (req.method !== "GET" && req.method !== "OPTIONS"){
        res.status(405).json(METHOD_NOT_ALLOWED)
        return;
    }
    const auth = req.headers.authorization
    if (!auth){
        res.status(400).json(BAD_REQUEST)
        return;
    }
    const auth_method = auth.split(" ")[0]
    const token = auth.split(" ")[1]
    if (auth_method !== "Bearer"){
        res.status(401).json(UNAUTHORIZED)
        return;
    }
    const client = await getDB();
    const user = await client.query('select username, email from access_token INNER JOIN users on users.id = access_token.user_id WHERE access_token.token = $1 AND access_token.expire > current_timestamp;', [token])
    if (user.rowCount !== 1){
        res.status(401).json({"error":{
            "code":401,
            "message":"Token is invalid or has expired"
        }})
        return;
    }
    res.status(200).json({"data":user.rows[0]})
}