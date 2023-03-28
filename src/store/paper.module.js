// import { set } from "core-js/core/dict";

export const SET_PAPER_INFO = 'setPaperInfo';
export const SET_PAPER_SUBPAGE = 'setPaperSubpage';
export const CLEAR_PAPER_INFO = 'clearPaperInfo';
export const SET_PAPER_VIDEOINFO = 'setPaperVideoInfo';
export const SWITCH_PAPER_PLAYING = 'switchPaperPlaying';
export const SET_PAPER_PLAYER_VOL = 'setPaperPlayerVol';
export const SET_SELECTED_INDEX = 'setSelectedIndex';

import { SWITCH_TRANSCRIPT_PLAYING } from "./transcript.module";

const initialState = {
  paperData: [],
  clips: [],
  cur_clip_index: 0,
  bPostit: false,
  curPaperId: '',
  paperEditVideo: {
    currentTime: 0,
  },
  folderStructure: [],
};

const state = {
  paperInfo: {
    ...initialState,
  },
  isPaperPlaying: false,
  paperPlayerVol: 1,
  selectedIndex: 0,
};

const getters = {
  paperInfo: (state) => state.paperInfo,
  isPaperPlaying: (state) => state.isPaperPlaying,
  paperPlayerVol: (state) => state.paperPlayerVol,
  selectedIndex: (state) => state.selectedIndex
};

const actions = {
  [SET_PAPER_INFO]({ commit }, payload) {
    commit(SET_PAPER_INFO, payload);
  },
  [CLEAR_PAPER_INFO]({ commit }, payload) {
    commit(CLEAR_PAPER_INFO, payload);
  },
  [SET_PAPER_VIDEOINFO]( { commit }, payload) {
    commit(SET_PAPER_VIDEOINFO, payload)
  },
  [SWITCH_PAPER_PLAYING]({ commit }, payload) {
    commit(SWITCH_PAPER_PLAYING, payload);
    // commit(SWITCH_TRANSCRIPT_PLAYING, false);
  },
  [SET_PAPER_PLAYER_VOL]({ commit }, payload) {
    commit(SET_PAPER_PLAYER_VOL, payload);
  },
  [SET_SELECTED_INDEX]({ commit }, payload) {
    commit(SET_SELECTED_INDEX, payload);
  }
};

const mutations = {
  [SET_PAPER_INFO](state, data) {
    state.paperInfo = { ...state.paperInfo, ...data };
  },
  [CLEAR_PAPER_INFO](state, data) {
    state.paperInfo = { ...initialState };
  },
  [SET_PAPER_VIDEOINFO](state, data) {
    state.paperInfo.paperEditVideo.currentTime = data;
  },
  [SWITCH_PAPER_PLAYING](state, data) {
    state.isPaperPlaying = data
  },
  [SET_PAPER_PLAYER_VOL](state, data) {
    state.paperPlayerVol = data
  },
  [SET_SELECTED_INDEX](state, data) {
    state.selectedIndex = data
  }
};

export default {
  state,
  actions,
  mutations,
  getters,
};
