const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DEBAL API',
      version: '1.0.0',
      description: 'Property listing management',
    },
    servers: [
      { url: process.env.NODE_ENV === 'production' ? 'https://debal-api.onrender.com' : 'http://localhost:5000/api' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [
    path.join(__dirname, './swagger/*.docs.js'),
    './routes/*.js' // Optional: Can still read JSDoc from routes
  ]
};

module.exports = swaggerJsdoc(options);