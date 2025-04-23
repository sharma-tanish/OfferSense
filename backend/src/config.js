import dotenv from 'dotenv';

dotenv.config();

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  server: {
    port: process.env.PORT || 5000,
  },
}; 