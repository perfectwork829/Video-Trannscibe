import Vue from 'vue';

import store from 'app/store';
import router from 'app/router';

import 'app/plugins/axios.js';
import 'app/plugins/firebase.js';
import 'app/plugins/font-awesome.js';
import 'app/plugins/bootstrap-vue.js';
import 'app/directives/ClickOutsideElement';

import App from 'app/App.vue';

import './styles.scss';

Vue.config.productionTip = false;

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
