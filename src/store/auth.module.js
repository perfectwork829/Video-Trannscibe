const state = {
  user: null,
  isAuthReady: false,
};

const getters = {
  currentUser: (state) => state.user,
  isAuthReady: (state) => state.isAuthReady,
  isAuthenticated: (state) => state.user !== null,
  accessToken: (state) => state?.user?.stsTokenManager?.token || null,
  currentOrganisation: (state) => (state?.user?.organisation ? Object.keys(state?.user?.organisation).at(0) : null),
  currentRole: (state) => state?.user?.role?.uid,
  permissions: (state) => state?.user?.role?.permissions,
};

const actions = {
  login(context, payload) {
    context.commit('setUser', payload);
    context.commit('setIsAuthReady', true);
  },
  logout(context) {
    context.commit('setUser', null);
    context.commit('setIsAuthReady', true);
  },
};

const mutations = {
  setUser(state, payload) {
    state.user = payload;
  },
  setIsAuthReady(state, payload) {
    state.isAuthReady = payload;
  },
};

export default {
  state,
  actions,
  mutations,
  getters,
};
