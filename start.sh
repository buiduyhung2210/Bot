#!/bin/sh
cd /app
npx sequelize db:migrate
node dist/server.js
