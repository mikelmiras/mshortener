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

  export function generateUserId(minim, maxim) {
    return Math.floor(Math.random() * (maxim - minim + 1)) + minim;
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

export const BAD_REQUEST = {"error":{
  "code":400,
  "message":"Bad request"
}}
export const NOT_FOUND = {"error":{
  "code":404,
  "message":"Not found"
}}

export const UNAUTHORIZED = {"error":{
  "code":401,
  "message":"Unauthorized"
}}

export const FORBIDDEN = {"error":{
  "code":403,
  "message":"Forbidden"
}}

export function generateAccessToken() {
  const length = 64;
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

/**
 * This method returns true if appid app exixts, false otherwise.
 * @param {Client} client 
 * @param {Int} appid 
 * @return boolean
 */
export async function doesAppExist(client, appid){
    const data = await client.query('SELECT * FROM application WHERE public_id = $1;', [appid])
    return data.rowCount === 1;
}
/**
 * This method returns true if specified redirection URI is allowed by specified app and false otherwise.
 * @param {Client} client 
 * @param {Int} appid 
 * @param {String} uri 
 */
export async function isURIValid(client, appid, uri){
  const data = await client.query('SELECT 0 from application_uri WHERE app_id = $1 AND uri = $2;', [appid, uri])
  return data.rowCount == 1;
}

/**
 * This function generates a one-time-use code that can be exchanged for an access token
 * @returns 
 */
export function generateCode(){
  const length = 20;
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

/**
 * This method gets authorization headers encoded in base64 and returns an array with them decoded. First element is
 * application's public id, and second is the secret key.
 * @param {Header} auth 
 * @returns Array
 */
export function basicAuth(auth){
  const type = auth?.split(" ")[0]
  if (type !== "Basic") return [undefined, undefined]
  const basic = auth?.split(" ")[1]
  const decoded = Buffer.from(basic, "base64").toString()
  const public_id = decoded.split(":")[0]
  const secret = decoded.split(":")[1]
  return [public_id, secret];
}

/**
 * This function searches secret token for given app id. 
 * @param {Client} client Active DB connection.
 * @param {Int} public_id App's public token.
 * @returns Secret token if public_id exists, undefined otherwise.
 */
export async function getSecretFromPublic(client, public_id){
  let returns = undefined
  const resp = await client.query('SELECT secret FROM application WHERE public_id = $1', [public_id])
  if (resp.rowCount === 1){
    returns = resp.rows[0].secret
  }
    return returns
}

/**
 * This function determines if a token has specified scope allowed.
 * @param {*} client Active DB Connection
 * @param {*} token Access token
 * @param {*} scope Scope
 */
export async function allowedScope(client, token, scope){
 const query = await client.query('SELECT 0 FROM access_token_scopes INNER JOIN access_token ON access_token_scopes.token = access_token.token WHERE access_token_scopes.token = $1 AND access_token_scopes.scope = $2 AND access_token.expire > CURRENT_TIMESTAMP;', [token, scope])
 return query.rowCount === 1;
}
/**
 * This function returns an object with the token's user data.
 * Provided token must be valid. 
 * Disclaimer: This method does not validate user-info scope, so this method's output should not be sent directly
 * to the client before validating the scope. This method is for internal use only.
 * @param {*} client Active DB connection
 * @param {*} token Access token
 */
export async function getUserFromToken(client, token){
  const resp = await client.query('SELECT id, username, email, admin FROM users INNER JOIN access_token ON access_token.user_id = users.id WHERE access_token.token = $1 AND access_token.expire > CURRENT_TIMESTAMP;', [token])
  if (resp.rowCount !== 1){
    return undefined
  }
  return resp.rows[0]
}


/**
 * This function generates a random shortid for redirect links
 * @returns Random, unique redirect link's id
 */
export function generateShortUrlId() {
  const length = 9;
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}
/**
 * This function determines if a specified token was made by the native app or a third party client **and if it it's still valid** .
 * If it's a native app or not is determined by using the app id provided on the .env file.
 * @param {Client} client Active DB connection
 * @param {String} token Valid access token
 */
export async function isNativeToken(client, token){
  const resp = await client.query('SELECT 0 from access_token WHERE token = $1 AND app_id = $2 AND expire > CURRENT_TIMESTAMP;' ,[token, process.env.APP_PUBLIC])
  return resp.rowCount === 1;
}

/**
 * This function determines if a token exists and if it is still valid.
 * @param {*} client Active DB conncetion
 * @param {*} token Access token to validate
 * @returns 
 */
export async function isTokenValid(client, token){
  const resp = await client.query('SELECT 0 FROM access_token WHERE token = $1 AND expire > CURRENT_TIMESTAMP;', [token])
  return resp.rowCount === 1;
}
