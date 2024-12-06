const { handlePostPrediction, handleGetPrediction } = require("../server/handler");

const routes = [
  {
    path: "/predict",
    method: "POST",
    handler: handlePostPrediction,
    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: true,
      },
    },
  },
  {
    path: "/predict/histories",
    method: "GET",
    handler: handleGetPrediction,
    options: {},
  },
];

module.exports = routes;
