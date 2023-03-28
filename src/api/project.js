import axios from 'axios';

export const getProjectParticipantsAPI = (projectId) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .get(
          process.env.VUE_APP_FIREBASE_DB_URL +
            'projects/' +
            projectId +
            '/participants.json?auth=' +
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

export const getProjectTagsAPI = (projectId) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .get(
          process.env.VUE_APP_FIREBASE_DB_URL +
            'projects/' +
            projectId +
            '/tags.json/?auth=' +
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

export const getProjectByIdAPI = (projectId) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .get(
          process.env.VUE_APP_FIREBASE_DB_URL +
            'projects/' +
            projectId +
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

export const getProjectListAPI = (email) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .get(process.env.VUE_APP_FIREBASE_DB_URL + 'projects.json/?auth=' + process.env.VUE_APP_FIREBASE_DB_SECRET)
        .then((res) => {
          // const list = [];
          if (res.status === 200) {
            const list = Object.keys(res.data).map((item) => {
              return {
                id: item,
                title: res.data[item].title,
                owner: res.data[item].owner,
                isDemo: res.data[item].isDemo,
                demoSource: res.data[item].demoSource,
              };
            });
            const filteredList = list.filter((item) => {
              if (item.demoSource) return false;
              if (item.isDemo && item.owner !== email) return false;
              return true;
            });
            console.log('fitlered list', filteredList);
            resolve(filteredList);
          } else {
            resolve([]);
          }
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};

export const getProjectsAPI = () => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .get(process.env.VUE_APP_FIREBASE_DB_URL + 'projects.json/?auth=' + process.env.VUE_APP_FIREBASE_DB_SECRET)
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

export const createProjectAPI = (project) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .post(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects.json?auth=' + process.env.VUE_APP_FIREBASE_DB_SECRET,
          {
            title: project.title.trim(),
            description: project.description,
            type: project.type,
            owner: project.owner,
            sharing: project.sharing,
            participants: project.participants,
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

export const updateProjectAPI = (project) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .patch(
          process.env.VUE_APP_FIREBASE_DB_URL +
            'projects/' +
            project.id +
            '.json?auth=' +
            process.env.VUE_APP_FIREBASE_DB_SECRET,
          {
            title: project.title,
            description: project.description,
            type: project.type,
            participants: project.participants,
            owner: project.owner,
            sharing: project.sharing,
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

export const deleteProjectAPI = (projectId) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .delete(
          process.env.VUE_APP_FIREBASE_DB_URL +
            'projects/' +
            projectId +
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

export const getMultiTrascriptAPI = (transcriptData, apiToken) => {
  return new Promise((resolve, reject) => {
    try {
      const apiCalls = transcriptData.map((item) => {
        return axios.get(
          'https://peaceful-waters-76804.herokuapp.com/https://api.rev.ai/speechtotext/v1/jobs/' +
            item.revai_id +
            '/transcript',
          {
            headers: {
              authorization: 'Bearer ' + apiToken,
              'cache-control': 'no-cache',
              'X-Requested-With': 'XMLHttpRequest',
            },
          }
        );
      });
      axios.all(apiCalls).then(
        axios
          .spread((...responses) => {
            return responses;
          })
          .catch(() => {
            return [];
          })
      );
    } catch (err) {
      reject(err);
    }
  });
};

export const updateFieldSettingAPI = ({ projectId, fieldSettings }) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .put(
          process.env.VUE_APP_FIREBASE_DB_URL +
            'projects/' +
            projectId +
            '/tags.json?auth=' +
            process.env.VUE_APP_FIREBASE_DB_SECRET,
          { ...fieldSettings },
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

export const saveContentAPI = (content_id, content) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .put(
          process.env.VUE_APP_FIREBASE_DB_URL +
            'script_contents/' +
            content_id +
            '.json?auth=' +
            process.env.VUE_APP_FIREBASE_DB_SECRET,
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
