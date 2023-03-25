import { BAD_REQUEST, basicAuth, UNAUTHORIZED } from "../../../util";

// This function fetches App's information (name and scopes) from given token. Requires Basic auth.
export default async function handler(req, res){
    const auth = req.headers.authorization;
    if (!auth){
        res.status(400).json(BAD_REQUEST)
        return;
    }
    const [public_id, secret] = basicAuth(auth)
    if (public_id !== process.env.APP_PUBLIC || secret !== process.env.APP_SECRET){
        res.status(401).json(UNAUTHORIZED)
        return;
    }
    res.status(200).json()
}