import firebase from 'app/plugins/firebase';

class RoleService {
  constructor() {
    this.db = firebase.database().ref('/roles');
  }

  get(roleId) {
    return this.db
      .child(roleId)
      .once('value')
      .then((snapchat) => {
        return snapchat.val();
      });
  }
}
export default new RoleService();
