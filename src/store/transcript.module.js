export const SET_TRANSCRIPT_INFO = 'setTransriptInfo';
export const CLEAR_TRANSCRIPT_INFO = 'clearTranscriptInfo';
export const SET_TRANSCRIPT_VIEW_MODE = 'setTranscriptViewMode';
export const SET_TRANSCRIPT_PROJECT_SETTINGS = 'setTranscriptProjectSetting';
export const SET_TRANSCRIPT_PROJECT_VIDEOINFO = 'setTranscriptProjectVideoInfo';
export const SWITCH_TRANSCRIPT_PLAYING = 'switchTranscriptPlaying';
export const SET_CUR_CLIP = 'setCurClip';
import { TRANSCRIPT_VIEW_MODE } from 'app/constants/index';

const initialState = {
  is_avb: '',
  mob_id: '',
  avb_path: '',
  curProjectId: '',
  curProjectName: '',
  curProjectSubName: '',
  curClipId: '',
  parentId: '',
  parentName: '',
  viewMode: TRANSCRIPT_VIEW_MODE.TRANSCRIPT_EDIT,
  projectSettings: {},
  content_id: '',
  video: {
    playbackRate: 1,
    currentTime: 0,
  },
  skipSilent: false,
  hideSilent: false,
  fieldSettings: [],
  transcriptItemData: null,
  participants: [],
  transcriptData: [],
};

const state = {
  transcriptInfo: {
    ...initialState,
  },
  isTranscriptPlaying: false,
};

const getters = {
  transcriptInfo: (state) => state.transcriptInfo,
  is_avb: (state) => state.transcriptInfo.is_avb,
  curProjectId: (state) => state.transcriptInfo.curProjectId,
  curProjectName: (state) => state.transcriptInfo.curProjectName,
  curClipId: (state) => state.transcriptInfo.curClipId,
  parentId: (state) => state.transcriptInfo.parentId,
  parentName: (state) => state.transcriptInfo.parentName,
  viewMode: (state) => state.transcriptInfo.viewMode,
  transcriptProjectSettings: (state) => state.transcriptInfo.projectSettings,
  transcriptVideo: (state) => state.transcriptInfo.video,
  isTranscriptPlaying: (state) => state.isTranscriptPlaying,
};

const actions = {
  [SET_TRANSCRIPT_INFO]({ commit }, payload) {
    // console.log('here: ', payload)
    commit(SET_TRANSCRIPT_INFO, payload);
  },
  [CLEAR_TRANSCRIPT_INFO]({ commit }, payload) {
    commit(CLEAR_TRANSCRIPT_INFO, payload);
  },
  [SET_TRANSCRIPT_VIEW_MODE]({ commit }, payload) {
    commit(SET_TRANSCRIPT_VIEW_MODE, payload);
  },
  [SET_TRANSCRIPT_PROJECT_SETTINGS]({ commit }, payload) {
    commit(SET_TRANSCRIPT_PROJECT_SETTINGS, payload);
  },
  [SET_TRANSCRIPT_PROJECT_VIDEOINFO]({ commit }, payload) {
    commit(SET_TRANSCRIPT_PROJECT_VIDEOINFO, payload);
  },
  [SWITCH_TRANSCRIPT_PLAYING]({ commit }, payload) {
    commit(SWITCH_TRANSCRIPT_PLAYING, payload);
    // commit(SWITCH_PAPER_PLAYING, false);
  },
  [SET_CUR_CLIP]({ commit }, payload) {
    commit(SET_CUR_CLIP, payload);
  },
};

const mutations = {
  [SET_TRANSCRIPT_INFO](state, data) {
    state.transcriptInfo = { ...state.transcriptInfo, ...data };
  },
  [CLEAR_TRANSCRIPT_INFO](state) {
    state.transcriptInfo = {
      ...initialState,
    };
  },
  [SET_TRANSCRIPT_VIEW_MODE](state, data) {
    state.transcriptInfo.viewMode = data;
  },
  [SET_TRANSCRIPT_PROJECT_SETTINGS](state, data) {
    state.transcriptInfo.projectSettings = {
      ...state.transcriptInfo.projectSettings,
      ...data,
    };
  },
  [SET_TRANSCRIPT_PROJECT_VIDEOINFO](state, data) {
    state.transcriptInfo.video = {
      ...state.transcriptInfo.video,
      ...data,
    };
  },
  [SWITCH_TRANSCRIPT_PLAYING](state, data) {
    state.isTranscriptPlaying = data;
  },
  [SET_CUR_CLIP](state, data) {
    state.transcriptInfo.curClipId = data;
  },
};

export default {
  state,
  actions,
  mutations,
  getters,
};
