import { DUPLICATED_RESOURCE, generateUserId, getDB, hashPassword, INTERNAL_SERVER_ERROR, METHOD_NOT_ALLOWED } from "../../../util";

export default async function(req, res){
    if (req.method != "POST"){
        res.setHeader("Allow","POST, OPTIONS")
        const date = new Date()
        date.setFullYear(date.getFullYear() + 1)
        res.status(405).json(METHOD_NOT_ALLOWED)
        return;
    }
    // This endpoint creates a new user. No auth is required
    const usname = req.body.usname
    const email = req.body.email
    const pass = req.body.pass
    if (!usname || !email || !pass){
        res.status(400).json({"error":{
            "status":400,
            "message":"Bad request"
        }})
        return;
    }

    const client = await getDB();
    const hash = await hashPassword(pass)
    try {
        const id = generateUserId(999, 9999999)
    let resp = await client.query('INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4);',
    [id, usname, email, hash])
    if (resp.rowCount == 1){
        res.status(200).json({"status":true, "user":{id, usname, email}})
    }
    res.status(500).json(INTERNAL_SERVER_ERROR)
}
catch (e){
    if (e.routine === "_bt_check_unique"){
        res.status(409).json(DUPLICATED_RESOURCE)
        return;
    }
    res.status(500).json(INTERNAL_SERVER_ERROR)
}finally {
    await client.end()
}
    



}