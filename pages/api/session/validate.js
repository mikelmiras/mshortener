// This function validates a login made from native app. Returns User object if access token's app matches with
// native app's credentials.
import { getDB } from "../util";
export default async function handler(req, res){
    const credential = req.body.token
    if (req.method !== "POST"){
        res.status(400).json()
        return;
    }
    if (!credential){
        res.status(400).json()
        return;
    }

    const client = await getDB();
    const user = await client.query('select username, email from access_token INNER JOIN users on users.id = access_token.user_id WHERE access_token.token = $1 AND access_token.expire > current_timestamp AND access_token.app_id = $2', [credential, process.env.APP_PUBLIC])
    await client.end()
    if (user.rowCount === 1){
        res.status(200).json({user:user.rows[0]})
    }else{
        res.status(401).json()
    }
    res.status(500).json()

}