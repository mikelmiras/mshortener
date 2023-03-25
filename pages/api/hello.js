const { Pool, Client } = require('pg')
const bcrypt = require('bcrypt');
import { hashPassword, validatePassword, getDB } from './util';
export default async function handler(req, res){
    res.status(200).json({"data":req.query})
}

