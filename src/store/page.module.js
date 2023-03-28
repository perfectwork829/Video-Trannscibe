import { PAGES } from 'app/constants/index';
export const SET_CUR_PAGE = 'setCurrentPage';

const state = {
  curPage: PAGES.LOGIN,
};

const getters = {
  curPage: (state) => state.curPage,
};

const actions = {
  [SET_CUR_PAGE]({ commit }, payload) {
    commit(SET_CUR_PAGE, payload);
  },
};

const mutations = {
  [SET_CUR_PAGE](state, data) {
    state.curPage = data;
  },
};

export default {
  state,
  actions,
  mutations,
  getters,
};
