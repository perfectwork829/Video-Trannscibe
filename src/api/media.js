import axios from 'axios';

export const getMediaAPI = (params) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .get(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
            params.projectId +
            '/medias/' +
            params.mediaId +
            '.json?auth=' +
            process.env.VUE_APP_FIREBASE_DB_SECRET
        )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};
export const getAllMediasAPI = (projectId) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .get(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
            projectId +
            '/medias.json?auth=' +
            process.env.VUE_APP_FIREBASE_DB_SECRET
        )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};
export const saveMediaAPI = (projectId, mediaUrl, name, language) => {
  return new Promise((resolve, reject) => {
    console.log("resolve data", resolve);
    try {
      axios
        .post(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
            projectId +
            '/medias.json?auth=' + process.env.VUE_APP_FIREBASE_DB_SECRET,
          { mediaUrl: mediaUrl, revId: '', filename:  name, language: language, status: 'transcribing'},
          {
            headers: {
              'Content-Type': 'text/plain',
            },
          }
        )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      console.log("Errror", err);
      reject(err);
    }
  });
};

export const updateTranscriptAPI = (params, update) => {
  return  new Promise((resolve, reject) => {
    try {
      axios
        .patch(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
            params.projectId +
            '/transcripts/' +
            params.transcriptId +
            '.json?auth=' +
            process.env.VUE_APP_FIREBASE_DB_SECRET,
          update,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
}
export const updateClipAPI = (params, update) => {
  return  new Promise((resolve, reject) => {
    try {
      axios
        .patch(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
            params.projectId +
            '/transcripts/' +
            params.transcriptId +
            '/clips/' + 
            params.clipId + 
            '.json?auth=' +
            process.env.VUE_APP_FIREBASE_DB_SECRET,
          update,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
}