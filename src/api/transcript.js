import axios from 'axios';

export const getTranscriptAPI = (params) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .get(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
            params.projectId +
            '/transcripts/' +
            (params.is_avb.toString() === '0'
              ? params.clipId
              : params.parentId + '/clips/' + params.clipId) +
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

export const getScriptContentsAPI = (scriptContent) => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        process.env.VUE_APP_FIREBASE_DB_URL + 'script_contents/' +
          scriptContent +
          '.json?auth=' + process.env.VUE_APP_FIREBASE_DB_SECRET
      )
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getTranscritpContentAPI = (id) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .get(
          process.env.VUE_APP_FIREBASE_DB_URL + 'script_contents/' +
            id +
            '.json?auth=' +
            process.env.VUE_APP_FIREBASE_DB_SECRET
        )
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};

export const saveContentAPI = (content_id, content) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .put(
          process.env.VUE_APP_FIREBASE_DB_URL + 'script_contents/' +
            content_id +
            '.json?auth=' + process.env.VUE_APP_FIREBASE_DB_SECRET,
          { ...content },
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