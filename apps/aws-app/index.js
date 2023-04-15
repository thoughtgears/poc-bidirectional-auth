const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');
const {apps} = require("firebase-admin");

const data = {
  name: 'Los Angeles',
  state: 'CA',
  country: 'USA'
};

exports.handler = async function (event) {
  const service_account_info = process.env.GCP_CONFIG

  fs.writeFile('/tmp/credentials.json', JSON.parse(service_account_info), {}, (err) => {
    if (err) throw err;
  });

  process.env.GOOGLE_APPLICATION_CREDENTIALS = '/tmp/credentials.json';

  initializeApp({
    projectId: 'auth-poc-12222',
    credential: applicationDefault()
  });

  const db = getFirestore();

  const res = await db.collection('cities').doc('LA').set(data);

  console.log(res);
};
