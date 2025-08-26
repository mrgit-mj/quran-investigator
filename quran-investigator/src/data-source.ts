const { DataSource } = require('typeorm');
require('dotenv').config(); // Load environment variables from .env

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/entities/*.js'], // Adjust for compiled JS files
  migrations: [__dirname + '/migrations/*.js'], // Adjust for compiled JS files
  synchronize: false,
});

module.exports = AppDataSource;
