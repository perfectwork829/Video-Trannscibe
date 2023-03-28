import firebase from 'app/plugins/firebase';
import { ROLE } from 'app/constants';
import { currentTimestamp } from 'app/utils';

class OrganisationService {
  constructor() {
    this.db = firebase.database().ref('/organisations');
  }

  createSolo(userId) {
    return this.db.push({
      title: `solo-${userId}`,
      createdAt: currentTimestamp(),
      updatedAt: currentTimestamp(),
      users: {
        [`${userId}`]: ROLE.OWNER,
      },
    });
  }
}
export default new OrganisationService();
