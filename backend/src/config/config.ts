import { ConfigProps } from 'src/interfaces/config.interface';
import * as dotenv from 'dotenv';
dotenv.config();
export const config = (): ConfigProps => ({
  port: parseInt(process.env.PORT, 10) || 8080,
  api: {
    apiUrl: process.env.API_URL,
    httpTimeout: 1000,
  },
  mongodb: {
    database: {
      connectionString: process.env.MONGODB_CONNECTION_STRING,
      databaseName: process.env.NODE_ENV || 'local',
    },
  },
});
