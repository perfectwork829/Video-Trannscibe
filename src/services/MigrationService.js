import { PERMISSION, ROLE } from 'app/constants';
import firebase from 'app/plugins/firebase';

class MigrationService {
  constructor() {
    this.db = firebase.database().ref();
  }

  // !!! TO BE MOVED TO THE ADMIN DASHBOARD CODEBASE
  syncRolesAndPermissions() {
    const roles = [ROLE.OWNER, ROLE.ADMIN, ROLE.EDITOR, ROLE.VIEWER];

    const viewerPermissions = [PERMISSION.READ_PROJECT];

    const editorPermissions = [
      PERMISSION.CREATE_PROJECT,
      PERMISSION.READ_PROJECT,
      PERMISSION.UPDATE_PROJECT,
      PERMISSION.DELETE_PROJECT,
    ];

    const adminPermissions = [
      PERMISSION.READ_ORGANISATION,
      PERMISSION.UPDATE_ORGANISATION,

      PERMISSION.CREATE_PROJECT,
      PERMISSION.READ_PROJECT,
      PERMISSION.UPDATE_PROJECT,
      PERMISSION.DELETE_PROJECT,

      PERMISSION.CREATE_USER,
      PERMISSION.READ_USER,
      PERMISSION.UPDATE_USER,
      PERMISSION.DELETE_USER,
    ];

    const ownerPermissions = [
      PERMISSION.CREATE_ORGANISATION,
      PERMISSION.READ_ORGANISATION,
      PERMISSION.UPDATE_ORGANISATION,
      PERMISSION.DELETE_ORGANISATION,

      PERMISSION.CREATE_PROJECT,
      PERMISSION.READ_PROJECT,
      PERMISSION.UPDATE_PROJECT,
      PERMISSION.DELETE_PROJECT,

      PERMISSION.CREATE_USER,
      PERMISSION.READ_USER,
      PERMISSION.UPDATE_USER,
      PERMISSION.DELETE_USER,
    ];

    const permissions = {
      [ROLE.OWNER]: ownerPermissions,
      [ROLE.ADMIN]: adminPermissions,
      [ROLE.EDITOR]: editorPermissions,
      [ROLE.VIEWER]: viewerPermissions,
    };

    roles.forEach((role) => {
      this.db.child('roles').child(role).set({
        uid: role,
        permissions: permissions[role],
      });
    });
  }
}
export default new MigrationService();
