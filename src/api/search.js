import axios from 'axios';

export const createSearchAPI = (search) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .post(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
            search.project_id +
            '/searches.json?auth=' +
            process.env.VUE_APP_FIREBASE_DB_SECRET,
          {
            result: search.result,
            title: search.title.trim(),
            project_id: search.project_id,
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

export const getProjectSearchesAPI = (curProjectId) => {
  return new Promise((resolve, reject) => {
    try {
      axios
        .get(
          process.env.VUE_APP_FIREBASE_DB_URL + 'projects/' +
            curProjectId +
            '/searches.json?auth=' +
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