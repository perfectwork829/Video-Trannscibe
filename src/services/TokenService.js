import firebase from 'app/plugins/firebase';

const db = firebase.database().ref('/api_token');
class TokenService {
  getAll() {
    return db;
  }
  get(key) {
    return db.child(key);
  }
  create(token) {
    return db.push(token);
  }
  update(key, value) {
    return db.child(key).update(value);
  }
  delete(key) {
    return db.child(key).remove();
  }
  deleteAll() {
    return db.remove();
  }
}
export default new TokenService();
