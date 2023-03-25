import { generateAccessToken, generateUserId } from "../../../util";

export default async function handler(req, res){
    const auth = req.headers.authorization
    const type = auth?.split(" ")[0]
    const basic = auth?.split(" ")[1]
    const decoded = Buffer.from(basic, "base64").toString()
    const public_id = decoded.split(":")[0]
    const secret = decoded.split(":")[1]
    if (public_id !== process.env.APP_PUBLIC || secret !== process.env.APP_SECRET){
        res.status(401).json(UNAUTHORIZED)
        return;
    }
    res.status(200).json({"id":generateUserId(9999, 99999999), "private_token":generateAccessToken()})
}