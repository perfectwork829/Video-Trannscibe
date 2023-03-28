import axios from "axios";

export const getFirebaseUsersAPI = () => {
	return new Promise((resolve, reject) => {
		try {
			axios
				.get(`${process.env.VUE_APP_FIREBASE_DB_URL}users.json/?auth=${process.env.VUE_APP_FIREBASE_DB_SECRET}`)
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

export const getUserDetailsAPI = (id) => {
	return new Promise((resolve, reject) => {
		try {
			axios
				.get(`${process.env.VUE_APP_FIREBASE_DB_URL}users/${id}.json/?auth=${process.env.VUE_APP_FIREBASE_DB_SECRET}`)
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
export const loginGoogleAPI = (email, password) => {
	return new Promise((resolve, reject) => {
		try {
			axios
				.post(
					`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.VUE_APP_API_KEY}`,
					{
						email: email,
						password: password,
						returnSecureToken: true
					},
					{ headers: { "Content-Type": "application/json" } }
				)
				.then(async (res) => {
					const user = await getUserDetailsAPI(res.data.localId);
					resolve(user);
				})
				.catch((err) => {
					reject(err);
				});
		} catch (err) {
			reject(err);
		}
	});
};

export const registerGoogleAPI = (email, password) => {
	return new Promise((resolve, reject) => {
		try {
			axios
				.post(
					"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + process.env.VUE_APP_API_KEY,
					{
						email: email,
						password: password,
						returnSecureToken: true
					},
					{ headers: { "Content-Type": "application/json" } }
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

export const getUserGoogleAPI = (email) => {
	return new Promise((resolve, reject) => {
		try {
			axios
				.post(
					"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + process.env.VUE_APP_API_KEY,
					{
						email: email
					},
					{ headers: { "Content-Type": "application/json" } }
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
export const registerFirebaseAPI = (regInfo) => {
	return new Promise((resolve, reject) => {
		try {
			axios
				.patch(
					`${process.env.VUE_APP_FIREBASE_DB_URL}users.json?auth=` + process.env.VUE_APP_FIREBASE_DB_SECRET,
					{
						[regInfo.localId]: {
							username: regInfo.username,
							email: regInfo.email,
							localId: regInfo.localId,
							idToken: regInfo.idToken,
							refreshToken: regInfo.refreshToken,
							verified: false,
							uid: regInfo.localId,
							emailVerified: false
						}
					},
					{ headers: { "Content-Type": "application/json" } }
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

export const getApiTokenAPI = () => {
	return new Promise((resolve, reject) => {
		try {
			axios
				.get(`${process.env.VUE_APP_FIREBASE_DB_URL}api_token.json/?auth=` + process.env.VUE_APP_FIREBASE_DB_SECRET)
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

export const updateApiTokenAPI = (apiToken) => {
	return new Promise((resolve, reject) => {
		try {
			axios
				.put(
					process.env.VUE_APP_FIREBASE_DB_URL + "api_token.json?auth=" + process.env.VUE_APP_FIREBASE_DB_SECRET,
					{
						token: apiToken
					},
					{
						headers: {
							"Content-Type": "application/json"
						}
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

export const getGoogleAccessToken = async (authCode) => {
	// curl -d "client_id=YOUR_CLIENT_ID&\
	// client_secret=YOUR_CLIENT_SECRET&\
	// redirect_uri=postmessage&\
	// grant_type=authorization_code&\
	// code=YOUR_AUTH_CODE" https://accounts.google.com/o/oauth2/token
	const res = await new Promise((resolve, reject) => {
		axios
			.post(
				"https://accounts.google.com/o/oauth2/token",
				{
					client_id: process.env.VUE_APP_GOOGLE_CLIENT_ID,
					client_secret: process.env.VUE_APP_GOOGLE_CLIENT_SECRET,
					redirect_uri: "postmessage",
					grant_type: "authorization_code",
					code: authCode
				},
				{
					headers: {
						"Content-Type": "application/json"
					}
				}
			)
			.then((res) => {
				resolve(res);
			})
			.catch((err) => {
				reject(err);
			});
	});
	return res;
};
