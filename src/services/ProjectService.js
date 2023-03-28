import firebase from 'app/plugins/firebase';
import { currentTimestamp } from 'app/utils';

class ProjectService {
  constructor() {
    this.db = firebase.database().ref('/projects');
  }

  all(organisationId, userId) {
    if (!organisationId || !userId) return [];

    return this.db
      .orderByChild('organisation')
      .equalTo(organisationId)
      .once('value')
      .then((snapshot) => {
        const projects = Object.entries(snapshot.val() || {});

        return projects
          .filter(([, project]) => project?.users?.includes(userId))
          .map(([id, project]) => ({
            id,
            ...project,
          }))
          .sort((a, b) => a?.updatedAt - b?.updatedAt);
      });
  }

  async create(data) {
    return this.db.push({
      creator: data?.creator,
      organisation: data?.organisation,
      title: data?.title?.trim() || null,
      description: data?.description?.trim() || null,
      sharing: data?.sharing || false,
      logo: data?.logo?.trim() || null,
      type: data?.type?.trim() || null,
      participants: data?.participants || [],
      createdAt: currentTimestamp(),
      updatedAt: currentTimestamp(),
      users: [data.creator],
    });
  }

  async update(projectId, data) {
    return this.db.child(projectId).update({
      title: data?.title?.trim() || null,
      description: data?.description?.trim() || null,
      sharing: data?.sharing || false,
      logo: data?.logo?.trim() || null,
      type: data?.type?.trim() || null,
      participants: data?.participants || [],
      updatedAt: currentTimestamp(),
    });
  }

  async delete(projectId) {
    return this.db.child(projectId).remove();
  }

  // TODO: REFACTOR BELOW
  async getParticipants(projectId) {
    return await new Promise((resolve) => {
      this.db
        .child(projectId)
        .child('participants')
        .once('value', (snapShot) => {
          resolve(snapShot.val());
        });
    });
  }

  async getTags(projectId) {
    return await new Promise((resolve) => {
      this.db
        .child(projectId)
        .child('tags')
        .once('value', (snapShot) => {
          resolve(snapShot.val());
        });
    });
  }

  async getById(projectId) {
    return new Promise((resolve) => {
      this.db.child(projectId).once('value', (snapShot) => {
        resolve(snapShot.val());
      });
    });
  }

  deleteAll() {
    return this.db.remove();
  }

  async getSearchs(projectId) {
    return await new Promise((resolve) => {
      this.db
        .child(projectId)
        .child('searches')
        .once('value', (snapShot) => {
          resolve(snapShot.val());
        });
    });
  }

  async getPapers(projectId) {
    return await new Promise((resolve) => {
      this.db
        .child(projectId)
        .child('papers')
        .once('value', (snapShot) => {
          resolve(snapShot.val());
        });
    });
  }

  async loadPaperData(projectId, paperId) {
    return await new Promise((resolve) => {
      this.db
        .child(projectId)
        .child('papers')
        .child(paperId)
        .child('clips')
        .once('value', (snapShot) => {
          resolve(snapShot.val());
        });
    });
  }

  async getTranscript(params) {
    return await new Promise((resolve) => {
      const clipId = params.is_avb.toString() === '0' ? params.clipId : params.parentId + '/clips/' + params.clipId;
      this.db
        .child(params.projectId)
        .child('transcripts')
        .child(clipId)
        .once('value', (snapShot) => {
          resolve(snapShot.val());
        });
    });
  }
}

export default new ProjectService();
