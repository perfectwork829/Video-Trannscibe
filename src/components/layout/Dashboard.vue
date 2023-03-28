<template>
  <div id="dashboard-page" @keydown="onKeyDown" @keyup="onKeyUp">
    <transition name="fade">
      <pre-loader v-if="dashboardLoading"></pre-loader>
    </transition>

    <transition name="fade">
      <div id="main-wrapper" class="show" v-if="!dashboardLoading">
        <div class="container-fluid edmon-container-fluid">
          <div class="dash-header">
            <page-header>
              <router-link class="project_nav" :to="{ name: 'dashboard' }">Projects</router-link>

              <div v-html="pageDetailLabel"></div>
            </page-header>

            <top-tab :tabs="tabs" :activeTab="curTab" @onChange="changeTab"> </top-tab>
          </div>
          <router-view></router-view>
        </div>
        <edmon-footer></edmon-footer>

        <save-modal componentId="save-search-modal" @saveSearch="saveSearch"></save-modal>

        <paper-modal
          componentId="paper-modal-top-navbar"
          @createPaper="createPaper"
          :paper="{
            id: -1,
            clips: [],
            title: '',
            description: '',
            filePath: '',
            project_id: this.transcriptInfo.curProjectId,
          }"
        ></paper-modal>
        <alert-modal componentId="dashboard-alert-modal" :content="alertMessage" @onOk="showAlertModal"></alert-modal>
      </div>
    </transition>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import axios from 'axios';
  import PreLoader from 'app/components/sharedComponents/PreLoader.vue';
  import PageHeader from 'app/components/sharedComponents/PageHeader.vue';
  import TopTab from 'app/components/sharedComponents/TopTab.vue';
  import EdmonFooter from 'app/components/sharedComponents/EdmonFooter.vue';
  import PaperModal from 'app/components/pages/paper/paperList/PaperModal.vue';
  import AlertModal from 'app/components/sharedComponents/AlertModal.vue';
  import SaveModal from 'app/components/pages/search/SaveModal.vue';

  import {
    SET_TRANSCRIPT_INFO,
    CLEAR_TRANSCRIPT_INFO,
    SET_TRANSCRIPT_PROJECT_SETTINGS,
    SWITCH_TRANSCRIPT_PLAYING,
  } from 'app/store/transcript.module';
  import { SET_PAPER_INFO, CLEAR_PAPER_INFO, SWITCH_PAPER_PLAYING } from 'app/store/paper.module';
  import { CLEAR_SEARCH_VALUE, SET_SEARCHED_LIST, ADD_SEARCHED_LIST } from 'app/store/search.module';
  import { CLEAR_FOLDER_TAB } from 'app/store/folderTab.module';
  import { PAGES } from 'app/constants/index';
  import { createPaperAPI, createSearchAPI } from 'app/api';
  import ProjectService from '../../services/ProjectService';
  import TokenService from '../../services/TokenService';
  import AuthService from 'app/services/AuthService';

  export default {
    name: 'Transcript',
    components: {
      PreLoader,
      PageHeader,
      TopTab,
      EdmonFooter,
      PaperModal,
      AlertModal,
      SaveModal,
    },
    data: function () {
      return {
        showLoading: true,
        apiToken: '',
        alertMessage: '',
        dashboardLoading: false,
      };
    },
    computed: {
      ...mapGetters(['curPage', 'transcriptInfo', 'paperInfo', 'currentUser', 'search']),
      pageDetailLabel: function () {
        return `&nbsp;/&nbsp;${this.transcriptInfo.curProjectName}`;
      },
      tabs: function () {
        return [
          { value: 'transcript', label: PAGES.TRANSCRIPT },
          { value: 'paperedit', label: PAGES.PAPER_EDIT },
          { value: 'mediafiles', label: PAGES.MEDIA_FILES },
          { value: 'search', label: PAGES.SEARCH },
        ];
      },
      curTab: function () {
        const paths = this.$route.path.split('/');
        const curPage = paths[paths.length - 1];
        return {
          value: curPage,
          label: curPage,
        };
      },
    },
    destroyed: function () {
      this.$store.dispatch(CLEAR_TRANSCRIPT_INFO, {});
      this.$store.dispatch(CLEAR_PAPER_INFO, {});
      this.$store.dispatch(CLEAR_SEARCH_VALUE, {});
      this.$store.dispatch(CLEAR_FOLDER_TAB, {});
    },
    async mounted() {
      TokenService.getAll().once(
        'value',
        (snapShot) => {
          this.apiToken = snapShot.val().token;
        },
        () => {
          this.alertMessage = `Get Api Token Error`;
          this.$bvModal.show('project-alert-modal');
        }
      );
      await this.openTranscriptList();
      this.fillHighlightColors();
      const resparticipants = await ProjectService.getParticipants(this.transcriptInfo.curProjectId);
      this.$store.dispatch(SET_TRANSCRIPT_INFO, {
        participants: resparticipants,
      });

      const resTags = await ProjectService.getTags(this.transcriptInfo.curProjectId);
      this.$store.dispatch(SET_TRANSCRIPT_INFO, {
        fieldSettings: resTags,
      });
      const searchResult = await ProjectService.getSearchs(this.transcriptInfo.curProjectId);
      this.$store.dispatch(SET_SEARCHED_LIST, searchResult);
      this.dashboardLoading = false;
    },
    methods: {
      openTranscriptList: async function () {
        const resProject = await ProjectService.getById(this.transcriptInfo.curProjectId);
        this.$store.dispatch(SET_TRANSCRIPT_PROJECT_SETTINGS, {
          ...resProject,
          id: this.transcriptInfo.curProjectId,
        });
        let transcriptData;
        transcriptData = Object.keys(resProject.transcripts).map((item) => {
          return {
            ...resProject.transcripts[item],
            filePath: decodeURI(resProject.transcripts[item].filePath),
            id: item,
          };
        });

        for (let i = 0; i < transcriptData.length; i++) {
          if (transcriptData[i].status && transcriptData[i].status === 'in_progress') {
            try {
              const res = await axios.get(
                'https://peaceful-waters-76804.herokuapp.com/https://api.rev.ai/speechtotext/v1/jobs/' +
                  transcriptData[i].revai_id +
                  '/transcript',
                {
                  headers: {
                    authorization: 'Bearer ' + this.apiToken,
                    'cache-control': 'no-cache',
                    'X-Requested-With': 'XMLHttpRequest',
                  },
                }
              );
              if (res.status === 200) {
                transcriptData[i].status = 'success';
                const sentences = [];
                res.monologues.forEach((item) => {
                  let sentence = [];
                  item.elements.forEach((element) => {
                    if (element.type == 'text' || element.type == 'punct') {
                      sentence.push(element);
                    }
                    if (element.value == '.') {
                      sentences.push({
                        speaker: item.speaker,
                        elements: sentence,
                      });
                      sentence = [];
                    }
                  });
                  sentences.push({
                    speaker: item.speaker,
                    elements: sentence,
                  });
                  sentence = [];
                });

                let transcription = {
                  monologues: sentences,
                };
                transcriptData[i].content = JSON.stringify(transcription);

                await axios.patch(
                  'https://logmonster-51e0a-default-rtdb.firebaseio.com/projects/' +
                    this.transcriptInfo.curProjectId +
                    '/transcripts/' +
                    transcriptData[i].id +
                    '.json?auth=' +
                    process.env.VUE_APP_DB_SECRET,
                  transcriptData[i],
                  {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  }
                );
              }
            } catch (error) {
              if (error.responseJSON.current_value !== 'in_progress') {
                transcriptData[i].status = 'failed';
                await axios.patch(
                  'https://logmonster-51e0a-default-rtdb.firebaseio.com/projects/' +
                    this.transcriptInfo.curProjectId +
                    '/transcripts/' +
                    transcriptData[i].id +
                    '.json?auth=' +
                    process.env.VUE_APP_DB_SECRET,
                  transcriptData[i],
                  {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  }
                );
              }
            }
          }
        }

        this.$store.dispatch(SET_TRANSCRIPT_INFO, {
          transcriptData,
        });

        const resPapers = await ProjectService.getPapers(this.transcriptInfo.curProjectId);
        this.$store.dispatch(SET_PAPER_INFO, {
          paperData: [
            ...Object.keys(resPapers).map((item) => {
              return {
                ...resPapers[item],
                id: item,
              };
            }),
          ],
          folderStructure: resPapers.folder,
        });
        const paperData = await ProjectService.loadPaperData(
          this.transcriptInfo.curProjectId,
          this.paperInfo.curPaperId
        );
        let data = [];
        Object.keys(paperData).forEach((item) => {
          data.push({ ...paperData[item], id: item });
        });
        this.$store.dispatch(SET_PAPER_INFO, {
          clips: data,
          cur_clip_index: data.length,
        });

        const resFieldSettings = await ProjectService.getTags(this.transcriptInfo.curProjectId);
        this.$store.dispatch(SET_TRANSCRIPT_INFO, {
          fieldSettings: resFieldSettings,
        });
        this.showLoading = false;
      },
      fillHighlightColors: function () {},
      changeTab: function (selectedTab, e) {
        if (e) e.preventDefault();
        this.$router.push(`/projects/${this.transcriptInfo.curProjectId}/${selectedTab.value}`);
      },
      createPaper: async function (paper) {
        try {
          const res = await createPaperAPI({
            ...paper,
            title: paper.title.trim(),
          });
          if (res.status === 200) {
            this.$store.dispatch(SET_PAPER_INFO, {
              paperData: [{ ...paper, id: res.data.name }, ...this.paperInfo.paperData],
              folderStructure: [
                { data: { ...paper, id: res.data.name }, title: paper.title.trim(), isLeaf: true },
                ...this.paperInfo.folderStructure,
              ],
            });
          } else {
            this.alertMessage = 'Create a Paper Failed';
            this.$bvModal.show('dashboard-alert-modal');
          }
        } catch (err) {
          console.log('err', err);
          this.alertMessage = 'Create a Paper Failed';
          this.$bvModal.show('dashboard-alert-modal');
        }
      },
      async saveSearch(data) {
        console.log('save search', this.search);
        try {
          const res = await createSearchAPI({
            result: this.search,
            title: data.title.trim(),
            project_id: this.transcriptInfo.curProjectId,
          });
          if (res.status === 200) {
            const search = { result: this.search, title: data.title.trim() };
            // search.title = data.title.trim();
            this.$store.dispatch(ADD_SEARCHED_LIST, { [res.data.name]: search });
          } else {
            this.alertMessage = 'Create a Search Failed';
            this.$bvModal.show('dashboard-alert-modal');
          }
        } catch (err) {
          console.log('err', err);
          this.alertMessage = 'Create a Search Failed';
          this.$bvModal.show('dashboard-alert-modal');
        }
      },
      showAlertModal: function () {
        this.$bvModal.show('dashboard-alert-modal');
      },
      onKeyDown: function (event) {
        // event.preventDefault();
        if (event.code == 'Space') {
          // disable space key on play, pause video
          if (document.activeElement.classList.contains('shaka-small-play-button')) {
            event.preventDefault();
            event.stopPropagation();
          }
        }

        if (event.code == 'Tab') {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      onKeyUp: async function (event) {
        // event.preventDefault();
        if (event.code == 'Tab') {
          event.preventDefault();
          event.stopPropagation();
          if (event.shiftKey) {
            console.log('shift tab');
            this.$store.dispatch(SWITCH_PAPER_PLAYING, !this.$store.getters.isPaperPlaying);
            this.$store.dispatch(SWITCH_TRANSCRIPT_PLAYING, false);
          } else {
            console.log('tab');
            this.$store.dispatch(SWITCH_TRANSCRIPT_PLAYING, !this.$store.getters.isTranscriptPlaying);
            this.$store.dispatch(SWITCH_PAPER_PLAYING, false);
          }
        }

        if (event.key == 'd' && event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();
          const copy_paper = this.paperInfo.paperData.filter((it) => it.id == this.paperInfo.curPaperId)[0];

          const paper = {
            clips: copy_paper.clips,
            description: copy_paper.description,
            filePath: '',
            id: -1,
            project_id: copy_paper.project_id,
            title: copy_paper.title + '_copy',
          };
          this.createPaper(paper);
          // console.log(event.ctrlKey)
        }
      },
      async logOut() {
        await AuthService.logout();

        await this.$store.dispatch('logout');

        this.$router.push('/login');
      },
    },
  };
</script>

<style lang="scss">
  #dashboard-page {
    .page-content {
      // height: calc(100vh - 253px);
      overflow: hidden;
      flex: 1 1 100%;
    }
  }
</style>
