import 'firebase/compat/auth';
import 'firebase/compat/storage';
import 'firebase/compat/database';
import firebase from 'firebase/compat/app';

const config = {
  apiKey: process.env.VUE_APP_API_KEY,
  authDomain: process.env.VUE_APP_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DB_URL,
  projectId: 'logmonster-51e0a',
  storageBucket: 'newlogmonster-51e0a',
  messagingSenderId: '824799785966',
  appId: '1:824799785966:web:58d583b7edc562f40c54ff',
  measurementId: 'G-7T960CYL90',
};

firebase.initializeApp(config);

export default firebase;
