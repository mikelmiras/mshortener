// GET /api/v1/links/fetch.json
// This endpoint returns a user's links.
// Requires OAuth2 and link-edit scope.

import { allowedScope, BAD_REQUEST, FORBIDDEN, getDB, getUserFromToken, INTERNAL_SERVER_ERROR, isTokenValid, METHOD_NOT_ALLOWED, UNAUTHORIZED } from "../../../util";

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
    const id = req.query.id
    if (!id){
        await noLink(client, token, req, res)
    }else{
        await linkProvided(client, token, req, res, id)
    }
}

// If no link is provided, fetch user's links
async function noLink(client,token,req, res){
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0
    let order = req.query.order || 'recent' // Allowed order params: recent, older. Default: recent

    switch (order){
        case "recent":
        order = ' link.date DESC'
        break;
        case "older":
        order = ' link.date ASC'
        break;
        default:
            order = ' link.date DESC'
    }

    // No param validation is required, because if received param is not a number, default values will be set.

    // Get user data:
    const {id, username, email} = await getUserFromToken(client, token)
    const data = await await client.query(`SELECT
    link.id, link.url,
    COUNT(link_visits.id) AS count
FROM
    link_visits
    RIGHT JOIN link ON link.id = link_visits.id
WHERE
    link.userid = $1
GROUP BY
    link.id
ORDER BY`+ order + `
LIMIT
    $2
OFFSET
    $3;`, [id, limit, offset])
    res.status(200).json({limit, offset, "links":data.rows})
    await client.end()
}

// If link is provided, fetch visit data for last 30 days

async function linkProvided(client, token, req, res, linkid){
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0

        const {id} = await getUserFromToken(client, token)
        const links = await client.query(`SELECT
        EXTRACT(DAY FROM link_visits.date) AS day,
        EXTRACT(MONTH FROM link_visits.date) AS month,
        COUNT(link_visits.id) AS count
    FROM
        link_visits
        INNER JOIN link ON link.id = link_visits.id
    WHERE
        link.userid = $1
        AND link_visits.id = $2
        AND link_visits.date BETWEEN CURRENT_TIMESTAMP - INTERVAL '30 days' AND CURRENT_TIMESTAMP
    GROUP BY
        EXTRACT(DAY FROM link_visits.date),
        EXTRACT(MONTH FROM link_visits.date)
    ORDER BY
        month ASC,
        day ASC
    LIMIT
        $3
    OFFSET
        $4;`, [id, linkid, limit, offset])
        res.status(200).json({limit, offset, "total":links.rows.length ,"impressions":links.rows})
        return;
    
}