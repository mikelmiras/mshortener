import { BAD_REQUEST, basicAuth, generateAccessToken, generateUserId, UNAUTHORIZED } from "../../../util";

export default async function handler(req, res){
    const auth = req.headers.authorization
    if (!auth || auth?.split(" ")[0] !== "Basic"){
        res.status(400).json(BAD_REQUEST)
        return;
    }
    const [public_id, secret] = basicAuth(auth)
    if (public_id !== process.env.APP_PUBLIC || secret !== process.env.APP_SECRET){
        res.status(401).json(UNAUTHORIZED)
        return;
    }
    res.status(200).json({"id":generateUserId(9999, 99999999), "private_token":generateAccessToken()})
}