export const SET_SEARCH_VALUE = 'setSearchValue';
export const SET_SEARCHED_LIST = 'setSearchedList';
export const CLEAR_SEARCH_VALUE = 'clearSearchValue';
export const SET_SEARCH_LOADING = 'setSearchLoading';
export const ADD_SEARCHED_LIST = 'addSearchedList';
export const SET_SEARCH_PLAYER = 'setSearchPlayer';

const state = {
  search: {
    searchTxt: '',
    conditions: [],
    transcriptData: [],
    paperData: [],
    loading: false,
  },
  searchedList: [],
  searchPlayer: {
    videoPath: '',
    currentTime: 0,
    startTime: 0,
    endTime: 0
  }
};

const getters = {
  search: (state) => state.search,
  searchedList: (state) => state.searchedList,
  searchPlayer: (state) => state.searchPlayer
};

const actions = {
  [SET_SEARCH_VALUE]({ commit }, payload) {
    commit(SET_SEARCH_VALUE, payload);
  },
  [SET_SEARCHED_LIST]({ commit }, payload) {
    commit(SET_SEARCHED_LIST, payload);
  },
  [ADD_SEARCHED_LIST]({ commit }, payload) {
    commit(ADD_SEARCHED_LIST, payload);
  },
  [SET_SEARCH_LOADING]({ commit }, payload) {
    commit(SET_SEARCH_LOADING, payload);
  },
  [CLEAR_SEARCH_VALUE]({ commit }, payload) {
    commit(CLEAR_SEARCH_VALUE, payload);
  },
  [SET_SEARCH_PLAYER]({ commit }, payload) {
    commit(SET_SEARCH_PLAYER, payload);
  }
};

const mutations = {
  [SET_SEARCH_VALUE](state, data) {
    state.search = {
      ...state.search,
      ...data,
    };
  },
  [SET_SEARCHED_LIST](state, data) {
    state.searchedList = data;
  },
  [ADD_SEARCHED_LIST](state, data) {
    // console.log('data', data);
    state.searchedList = {
      ...state.searchedList,
      ...data
    };
  },
  [CLEAR_SEARCH_VALUE](state, data) {
    state.search = {
      searchTxt: '',
      conditions: [],
      transcriptData: [],
      paperData: [],
    };
  },
  [SET_SEARCH_LOADING](state, data) {
    state.search.loading = data;
  },
  [SET_SEARCH_PLAYER](state, data) {
    state.searchPlayer = {
      ...state.searchPlayer,
      ...data
    }
  }
};

export default {
  state,
  actions,
  mutations,
  getters,
};
