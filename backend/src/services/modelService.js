const tf = require("@tensorflow/tfjs-node");

async function fetchModel() {
  const modelUri = process.env.APP_ENV === "local" ? process.env.LOCAL_MODEL_URL : process.env.MODEL_URL;
  console.log(`Attempting to load the model from: ${modelUri}`);

  try {
    // Loading the model
    const loadedModel = await tf.loadGraphModel(modelUri);
    return loadedModel;
  } catch (err) {
    console.error("Failed to load model:", err);
    throw new Error("Model loading failed");
  }
}

module.exports = fetchModel;
