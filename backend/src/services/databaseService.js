const admin = require("firebase-admin");

// Inisialisasi Firestore menggunakan service account
const serviceAccount = require("./ServiceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore();

// Format data dokumen
function formatDocument(doc) {
    return {
        id: doc.id,
        ...doc.data(),
    };
}

// Simpan data ke koleksi Firestore
async function saveData(docId, payload) {
    try {
        const collectionRef = db.collection("predictions");
        await collectionRef.doc(docId).set(payload);
        console.log(`Data with ID ${docId} saved to Firestore.`);
    } catch (error) {
        console.error("Error saving data to Firestore:", error);
        throw new Error("Database error");
    }
}

// Ambil data berdasarkan ID atau semua data
async function fetchData(docId = null) {
    try {
        const collectionRef = db.collection("predictions");
        if (docId) {
            const document = await collectionRef.doc(docId).get();
            if (!document.exists) return null;
            return formatDocument(document);
        } else {
            const querySnapshot = await collectionRef.get();
            const results = [];
            querySnapshot.forEach(doc => results.push(formatDocument(doc)));
            return results;
        }
    } catch (error) {
        console.error("Error fetching data from Firestore:", error);
        throw new Error("Database error");
    }
}

// Ekspor fungsi-fungsi yang tersedia
module.exports = { saveData, fetchData, formatDocument };
