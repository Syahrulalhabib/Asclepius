const tf = require("@tensorflow/tfjs-node");
const InputError = require("../exceptions/InputError");

async function classifyImage(model, imageData) {
  try {
    // Validate the image size
    if (imageData.length > 1024 * 1024) {
      throw new InputError("Ukuran gambar terlalu besar. Maksimum 1MB.");
    }

    // Decode and preprocess the image into a tensor
    const imageTensor = tf.node.decodeJpeg(imageData)
                                .resizeNearestNeighbor([224, 224])
                                .expandDims()
                                .toFloat();
    
    // Perform the prediction with the model
    const predictionResult = model.predict(imageTensor);
    
    // Extract prediction scores
    const scores = await predictionResult.data();
    const maxConfidence = Math.max(...scores) * 100;

    // Determine the label and suggestion based on confidence score
    let classification = {
      confidence: maxConfidence,
      label: maxConfidence < 1 ? "Non-cancer" : "Cancer",
      suggestion: maxConfidence < 1 ? "Penyakit kanker tidak terdeteksi." : "Segera periksa ke dokter!"
    };

    return classification;
  } catch (err) {
    throw new InputError("Terjadi kesalahan dalam melakukan prediksi");
  }
}

module.exports = classifyImage;
