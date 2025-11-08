const admin = require('firebase-admin');
const serviceAccount = require('../../service-account-firebase.json');

// Inicializa o Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Exporta todas as instâncias
module.exports = {
  db: admin.firestore(),
  auth: admin.auth(),
  storage: admin.storage()
};
