require("dotenv").config();
const Hapi = require("@hapi/hapi");
const predictionRoutes = require("../server/routes");
const fetchModel = require("../services/modelService");
const InputError = require("../exceptions/InputError");

(async () => {
  // Initialize Hapi server with configurations
  const appServer = Hapi.server({
    port: process.env.APP_PORT || 8080,
    host: process.env.APP_HOST || "localhost",
    routes: {
      cors: {
        origin: ["*"], // Allow all origins for CORS
      },
      payload: {
        maxBytes: 1 * 1024 * 1024, // Set max payload size to 1MB
      },
    },
  });

  // Load the model and attach it to the server app context
  const aiModel = await fetchModel();
  appServer.app.model = aiModel;

  // Define and assign the routes
  appServer.route(predictionRoutes);

  // Global response error handling
  appServer.ext("onPreResponse", (request, h) => {
    const response = request.response;

    // Handle Payload Too Large error
    if (response.isBoom && response.output.statusCode === 413) {
      const errorResponse = h.response({
        status: "fail",
        message: "Payload content length greater than maximum allowed: 1000000",
      });
      errorResponse.code(413);
      return errorResponse;
    }

    // Handle InputError response
    if (response instanceof InputError) {
      const errorResponse = h.response({
        status: "fail",
        message: response.message,
      });
      errorResponse.code(response.statusCode);
      return errorResponse;
    }

    // Handle generic Boom errors
    if (response.isBoom) {
      const errorResponse = h.response({
        status: "fail",
        message: response.message,
      });
      errorResponse.code(response.output.statusCode);
      return errorResponse;
    }

    // Continue if no error
    return h.continue;
  });

  // Start the server and log the URL
  await appServer.start();
  console.log(`Server is running at: ${appServer.info.uri}`);
})();
