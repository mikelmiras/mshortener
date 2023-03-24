const { Pool, Client } = require('pg')
const bcrypt = require('bcrypt');
import { hashPassword, validatePassword, getDB } from './util';
export default async function handler(req, res){
if (!req.body.pass) 
{
res.status(400).json({"error":{
    "code":400,
    "message":"Bad request"
}})
return;
}
const client = await getDB()
 
let resp = await client.query('SELECT * FROM users;')
await client.end()
const hash = await hashPassword("mikel")
const matches = await validatePassword(req.body.pass, hash);
res.status(200).json({"rows":resp.rows, matches})
}

