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
      {
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://debal-api.onrender.com/api'
            : 'http://localhost:5000/api',
      },
    ],
    components: {
      securitySchemes: {
        jwtAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
        },
      },
    },
    security: [
      {
        jwtAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, './swagger/*.docs.js'),
    './routes/*.js',
  ],
};

module.exports = swaggerJsdoc(options);
