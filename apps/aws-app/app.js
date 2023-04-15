const {Firestore} = require('@google-cloud/firestore');

const firestore = new Firestore();

exports.handler = async function (event) {
  const ref = firestore.collection('data-collection').doc('my-doc-1')
  const doc = await ref.get();
  if (!doc.exists) {
    return {
      statusCode: 404,
      message: 'document not found',
      data: {}
    }
  } else {
    return {
      statusCode: 200,
      message: 'document found',
      data: doc.data()
    }
  }
};
