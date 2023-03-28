import firebase from 'app/plugins/firebase';

const db = firebase.database().ref('/script_contents');
class ScriptService {
  async getScriptContents(scriptContent) {
    return await new Promise((resolve, reject) => {
      db.child(scriptContent).once('value', (snapShot) => {
        resolve(snapShot.val());
      });
    });
  }
}
export default new ScriptService();
