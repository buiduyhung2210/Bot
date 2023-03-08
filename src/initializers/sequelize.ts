import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';

const env: any = process.env.NODE_ENV || 'development';
// eslint-disable-next-line node/no-path-concat
const config = require(`${__dirname}/../configs/database`)[env];

const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);

const models: any = [];

const modelsDir = [path.join(__dirname, '../models')];
modelsDir.forEach((dir) => {
  fs.readdirSync(dir)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js'))
    .forEach((file) => {
      const model = require(path.join(dir, file));
      models.push(model.default);
    });
});

models.forEach((model :any) => {
  model.initialize(sequelize);
});

models.forEach((model :any) => {
  model.associate();
});

export default sequelize;
