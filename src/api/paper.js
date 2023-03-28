import axios from 'axios';

export const createFolderAPI = (project_id, folder) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .patch(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
            project_id +
            '/papers.json?auth=' +
            process.env.VUE_APP_FIREBASE_DB_SECRET,
          {folder: folder},
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
};
export const createPaperAPI = (paper) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .post(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
            paper.project_id +
            '/papers.json?auth=' +
            process.env.VUE_APP_FIREBASE_DB_SECRET,
          {
            clips: paper.clips,
            title: paper.title.trim(),
            description: paper.description,
            project_id: paper.project_id,
          },
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
};

export const updatePaperAPI = (paper) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .patch(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
            paper.project_id +
            '/papers/' +
            paper.id +
            '.json?auth=' +
            process.env.VUE_APP_FIREBASE_DB_SECRET,
          paper,
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
};

export const deletePaperAPI = (paper) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .delete(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
            paper.project_id +
            '/papers/' +
            paper.id +
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

export const getProjectPapersAPI = (curProjectId) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .get(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
            curProjectId +
            '/papers.json?auth=' +
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

export const loadPaperDataAPI = (projectId, paperId) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .get(
          process.env.VUE_APP_FIREBASE_DB_URL+ 'projects/' +
            projectId +
            '/papers/' +
            paperId +
            '/clips.json?auth=' +
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

export const saveClipsAPI = (projectId, paperId, clipsInfo) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .delete(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
            projectId +
            '/papers/' +
            paperId +
            '/clips.json?auth=' +
            process.env.VUE_APP_FIREBASE_DB_SECRET
        )
        .then(async (res) => {
          if (res.status === 200) {
            const ids = [];
            await Promise.all(clipsInfo.map(async item => {
              const res = await axios.post(
                process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
                  projectId +
                  '/papers/' +
                  paperId +
                  '/clips.json?auth=' +
                  process.env.VUE_APP_FIREBASE_DB_SECRET,
                { ...item },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
              ids.push(res.data.name);
            }))
            resolve(ids);
          }
          reject(false);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};

export const createGoogleDocAPI = (accessToken, title) => {
  return new Promise((resolve, reject) => {
    try {
      axios.post('https://docs.googleapis.com/v1/documents', 
        {
          title: title
        }, 
        {
          headers: { Authorization: `Bearer ${accessToken}`}
        })
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
    } catch (err) {
      reject(err)
    }
  })
}

export const EditGoogleDocAPI = (documentID, accessToken, requests) => {
  return new Promise((resolve, reject) => {
    try {
      axios.post(`https://docs.googleapis.com/v1/documents/${documentID}:batchUpdate`, 
        {
          requests: requests
        }, 
        {
          headers: { Authorization: `Bearer ${accessToken}`}
        })
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
    } catch (err) {
      reject(err)
    }
  })
}
