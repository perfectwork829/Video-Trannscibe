import store from 'app/store';
import { ROLE } from 'app/constants';
import RoleService from './RoleService';
import firebase from 'app/plugins/firebase';
import { currentTimestamp } from 'app/utils';
import OrganisationService from './OrganisationService';

class UserService {
  constructor() {
    this.db = firebase.database().ref('/users');
  }

  create(key, value) {
    return this.db.child(key).set(value);
  }

  async createSolo(userCredentials, username = '') {
    const uid = userCredentials?.uid;

    const orgRef = await OrganisationService.createSolo(uid);

    return this.create(uid, {
      username: username,
      email: userCredentials?.email,
      createdAt: currentTimestamp(),
      updatedAt: currentTimestamp(),
      organisation: {
        [`${orgRef.key}`]: ROLE.OWNER,
      },
    });
  }

  async getCurrentUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = firebase.auth().onAuthStateChanged(async (userCredentials) => {
        let authUserData = null;

        if (userCredentials) {
          const userData = await this._getUserDetails(userCredentials.uid);

          if (userData) {
            const userRole = await this._getUserRole(userData);

            authUserData = await this._constructUserData(userCredentials, userData, userRole);
          }
        }

        store.dispatch('login', authUserData);

        unsubscribe();

        resolve(authUserData);
      }, reject);
    });
  }

  async _getUserDetails(userId) {
    const userDataRef = await this.db.child(userId).once('value');

    return userDataRef.val();
  }

  async _constructUserData(userCredentials, userData, roleData) {
    if (!userCredentials) return null;

    return {
      ...userData,
      role: roleData,
      uid: userCredentials?.uid || null,
      email: userCredentials?.email || null,
      emailVerified: userCredentials?.emailVerified || false,
      stsTokenManager: (await userCredentials.getIdTokenResult()) || null,
      createdAt: userCredentials?.metadata?.creationTime || null,
      lastLoginAt: userCredentials?.metadata?.lastSignInTime || null,
    };
  }

  async _getUserRole(userData) {
    const userRole = userData?.organisation ? Object.values(userData?.organisation).at(0) : null;

    if (!userRole) return null;

    return await RoleService.get(userRole);
  }
}

export default new UserService();
