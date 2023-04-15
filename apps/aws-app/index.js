const {Firestore} = require('@google-cloud/firestore')

const data = {
  name: 'Los Angeles',
  state: 'CA',
  country: 'USA'
};

const firestore = new Firestore(
  {
    projectId: 'auth-poc-12222',
    keyFilename: 'sts-creds.json'
  }
);

exports.handler = async function (event) {
  const ref = firestore.collection('cities')
  ref.doc('LA').set(data)
    .catch(err => {throw err})

  const doc = await ref.doc('LA').get()
  return JSON.stringify(doc.data());
};
