const { saveData, fetchData } = require("../services/databaseService");
const classifyImage = require("../services/inferenceService");
const crypto = require("crypto");

async function handlePostPrediction(request, h) {
    const { image } = request.payload;
    const { model } = request.server.app;

    try {
        // Get classification result
        const { confidence, label, suggestion } = await classifyImage(model, image);

        // Generate unique ID and timestamp
        const predictionId = crypto.randomUUID();
        const timestamp = new Date().toISOString();

        // Prepare the data to store
        const predictionData = {
            id: predictionId,
            result: label,
            suggestion: suggestion,
            confidenceScore: confidence,
            createdAt: timestamp,
        };

        // Save prediction data to Firestore
        await saveData(predictionId, predictionData);

        // Send response
        const responseMessage = confidence > 0 ? "Model is predicted successfully" : "Please use the correct picture";
        return h.response({
            status: "success",
            message: responseMessage,
            data: predictionData,
        }).code(201);
    } catch (error) {
        console.error("Error handling POST prediction:", error.message);
        return h.response({
            status: "fail",
            message: "Terjadi kesalahan dalam melakukan prediksi",
        }).code(400);
    }
}

async function handleGetPrediction(request, h) {
    const { id } = request.params;

    try {
        // Fetch prediction data from Firestore
        const predictionData = await fetchData(id);

        if (!predictionData) {
            return h.response({
                status: "fail",
                message: "Prediction not found",
            }).code(404);
        }

        return h.response({
            status: "success",
            data: predictionData,
        }).code(200);
    } catch (error) {
        console.error("Error fetching prediction:", error.message);
        return h.response({
            status: "fail",
            message: "Terjadi kesalahan saat mengambil data prediksi",
        }).code(400);
    }
}

module.exports = { handlePostPrediction, handleGetPrediction };
