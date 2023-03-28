import Vue from 'vue';
import Vuex from 'vuex';

import auth from './auth.module';
import page from './page.module';
import transcript from './transcript.module';
import paper from './paper.module';
import search from './search.module';
import folderTab from './folderTab.module';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth,
    page,
    folderTab,
    transcript,
    paper,
    search,
  },
});
