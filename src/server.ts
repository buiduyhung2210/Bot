/* eslint-disable import/first */
require('module-alias/register');
import path from 'path';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import sequelize from './initializers/sequelize';
import routes from './configs/routes';

const port = process.env.PORT || 3000;

const app = express();
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));
app.use(express.static(path.join(__dirname, '../public')));


app.use(cors());
app.options('*', cors());


app.use('/api', routes);


app.use((req, res) => {
  res.status(404).send({ url: `${req.path} nelpot found` });
});


sequelize.authenticate().then(() => {
  app.listen(port, () => {
    console.log(`App is running localhost:${port}`);
    console.log('  Press CTRL-C to stop\n');
  });
});
