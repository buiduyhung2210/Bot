/* eslint-disable import/first */
require('module-alias/register');
require('dotenv').config();
import path from 'path';
import express from 'express';
import sequelize from './configs/dbConnect';
const port = process.env.PORT || 3000;


const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));
app.use(express.static(path.join(__dirname, '../public')));


app.use((req, res) => {
  res.status(404).send({ url: `${req.path} not found` });
});

sequelize.authenticate().then(() => {
  app.listen(port, () => {
    console.log(`App is running localhost:${port}`);
    console.log('  Press CTRL-C to stop\n');
  });
});

