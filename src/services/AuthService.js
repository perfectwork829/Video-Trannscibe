import firebase from 'app/plugins/firebase';

class AuthService {
  constructor() {
    this.authRef = firebase.auth();
  }

  async login(email, password) {
    // Set the Authentication persistance is set as local
    // to allow keep user logged in on page reload
    await this.authRef.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    return this.authRef.signInWithEmailAndPassword(email, password);
  }

  async signup(email, password) {
    return this.authRef.createUserWithEmailAndPassword(email, password);
  }

  async verifyEmail() {
    return this.authRef.currentUser.sendEmailVerification({
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    });
  }

  async forgetPassowrd(email) {
    return this.authRef.sendPasswordResetEmail(email, {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    });
  }

  async logout() {
    return this.authRef.signOut();
  }
}

export default new AuthService();
