import { FOLDER_TABS } from 'app/constants/index';
export const SET_CUR_FOLDER_TAB = 'setCurrentFolderTab';
export const CLEAR_FOLDER_TAB = 'clearCurrentFolderTab';

const state = {
  curFolderTab: FOLDER_TABS.TRANSCRIPT,
};

const getters = {
  curFolderTab: (state) => state.curFolderTab,
};

const actions = {
  [SET_CUR_FOLDER_TAB]({ commit }, payload) {
    commit(SET_CUR_FOLDER_TAB, payload);
  },
  [CLEAR_FOLDER_TAB]({ commit }, payload) {
    commit(CLEAR_FOLDER_TAB, payload);
  },
};

const mutations = {
  [SET_CUR_FOLDER_TAB](state, data) {
    state.curFolderTab = data;
  },
  [CLEAR_FOLDER_TAB](state) {
    state.curFolderTab = FOLDER_TABS.TRANSCRIPT;
  },
};

export default {
  state,
  actions,
  mutations,
  getters,
};
