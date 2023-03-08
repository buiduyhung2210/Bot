'use strict';

import dotenv from 'dotenv';
dotenv.config();

const {
  ENV,
  PORT,
  HOST,
  DB_HOST,
  DB_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  DB_PORT,
  BOT_TOKEN
} = process.env;


export default {
  ENV,
  PORT,
  HOST,
  DB_HOST,
  DB_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  DB_PORT,
  BOT_TOKEN
};
