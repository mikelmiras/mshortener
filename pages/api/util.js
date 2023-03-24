const { Pool, Client } = require('pg')
const bcrypt = require('bcrypt');

export async function getDB(){
    const client = new Client()
await client.connect()
return client;
}

export async function hashPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }


 export async function validatePassword(password, hash) {
    const match = await bcrypt.compare(password, hash);
    return match;
  }

  export function generateUserId() {
    const min = 999;
    const max = 9999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  

  export const METHOD_NOT_ALLOWED = {"error":{
    "code":405,
    "message":"Method not allowed"
}}
export const DUPLICATED_RESOURCE = {"error":{
    "code":409,
    "message":"Provided resource already exists"
}}
export const INTERNAL_SERVER_ERROR = {"error":{
    "code":500,
    "message":"Internal server error"
}}