#!/usr/local/bin/node

const admin = require('firebase-admin');

let serviceAccount = require('./trees-1543002995860-8f25f5986e29.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();
db.settings({timestampsInSnapshots: true});

db.collection('tree').get().then(
  (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let data = doc.data();
      console.log(`${doc.id} => ${data.latitude},${data.longitude} ${data.species.get('common name')}`);
    });
    console.log('done');
  }
);

