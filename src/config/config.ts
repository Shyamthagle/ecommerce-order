export default () => ({
    port: process.env.PORT || 3002,
  
    DB_PORT: parseInt(process.env.DB_PORT) || 5432,
  
    DB_USERNAME: process.env.DB_USERNAME,
  
    DB_HOST: process.env.DB_HOST,
  
    DB_PASSWORD: process.env.DB_PASSWORD,
  
    DB_NAME: process.env.DB_NAME,
  
    DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE === 'true', // Corrected this line
  });
  