// GET /api/v1/links/fetch.json
// This endpoint returns a user's links.
// Requires OAuth2 and link-edit scope.

import { allowedScope, BAD_REQUEST, FORBIDDEN, getDB, getUserFromToken, isTokenValid, METHOD_NOT_ALLOWED, UNAUTHORIZED } from "../../../util";

// Params: limit (default 20), offset (default 0)

export default async function handler(req, res){
    // Validate method
    if (req.method !== "GET" && req.method !== "OPTIONS"){
        res.status(405).json(METHOD_NOT_ALLOWED)
        return;
    }

    // Validate token and scopes
    const auth = req.headers.authorization
    if (!auth){
        res.status(400).json(BAD_REQUEST)
        return;
    }
    const [auth_type, token] = auth.split(" ")
    if (auth_type !== "Bearer"){
        res.status(400).json(BAD_REQUEST)
        return;
    }
    const client = await getDB()
    const tokenValid = isTokenValid(client, token)
    if (!tokenValid){
        res.status(401).json(UNAUTHORIZED)
        return;
    }
    const valid_scopes = await allowedScope(client, token, "link-edit")
    if (!valid_scopes){
        res.status(403).json(FORBIDDEN)
        return;
    }
    // From here on, user is authenticated: their token is valid and has valid scopes allowed

    // Definition of limit and offset:
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0
    let order = req.query.order || 'recent' // Allowed order params: recent, older. Default: recent

    switch (order){
        case "recent":
        order = 'date DESC'
        break;
        case "older":
        order = 'date ASC'
        break;
        default:
            order = 'date DESC'
    }

    // No param validation is required, because if received param is not a number, default values will be set.

    // Get user data:
    const {id, username, email} = await getUserFromToken(client, token)
    const data = await client.query('SELECT id, url, date FROM link WHERE userid = $1 ORDER BY ' + order + ' LIMIT $2 OFFSET $3;', [id, limit, offset])
    res.status(200).json({limit, offset, "links":data.rows})
    await client.end()
}