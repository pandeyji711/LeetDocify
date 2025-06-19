// api/index.js
const serverless = require("serverless-http");
const app = require("../app"); // this imports your existing Express app

module.exports = app;
module.exports.handler = serverless(app);
