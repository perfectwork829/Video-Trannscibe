<template>
  <div id="paper-list-page" class="row page-content">
    <div class="col-xl-12">
      <div class="card">
        <div class="input-group justify-content-end card-header">
          <b-button
            variant="primary"
            id="btnNewPaper"
            class="input-group-text text-white"
            @click="
              showPaperModal({
                id: -1,
                clips: [],
                title: '',
                description: '',
                filePath: '',
                project_id: transcriptInfo.curProjectId,
              })
            "
          >
            <fa-icon
              :icon="['fas', 'folder-plus']"
              class="text-white"
            />&nbsp;PaperEdit
          </b-button>
        </div>
        <div class="card-footer">
          <paper-table
            :paperData="paperInfo.paperData"
            :showAction="true"
            @onPaper="onPaper"
            @showPaperModal="showPaperModal"
            @onDeletePaper="onDeletePaper"
          ></paper-table>
        </div>
      </div>
    </div>
    <paper-modal
      @createPaper="createPaper"
      :paper="selectedPaper"
    ></paper-modal>
    <alert-modal
      componentId="paper-list-alert-modal"
      :content="alertMessage"
      @onOk="() => {}"
    ></alert-modal>
    <confirm-modal
      componentId="paper-list-confirm-modal"
      title="Are you sure want to delete?"
      @onOk="deletePaper(selectedPaper)"
      @onCancel="cancelDelete"
    ></confirm-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import PaperTable from 'app/components/pages/paper/paperList/PaperTable.vue';
import PaperModal from 'app/components/pages/paper/paperList/PaperModal.vue';
import AlertModal from 'app/components/sharedComponents/AlertModal.vue';
import ConfirmModal from 'app/components/sharedComponents/ConfirmModal.vue';
import { SET_PAPER_INFO } from 'app/store/paper.module';
import { SET_CUR_PAGE } from 'app/store/page.module';
import { SET_CUR_FOLDER_TAB } from 'app/store/folderTab.module';
import {
  createPaperAPI,
  updatePaperAPI,
  deletePaperAPI,
  loadPaperDataAPI,
} from 'app/api';
import { getResource } from 'app/utils';
import { PAGES, FOLDER_TABS } from 'app/constants/index';

export default {
  name: 'PaperList',
  components: {
    PaperTable,
    PaperModal,
    AlertModal,
    ConfirmModal,
  },
  data: function () {
    return {
      selectedPaper: {
        id: -1,
        clips: [],
        title: '',
        description: '',
        filePath: '',
        project_id: -1,
      },
      alertMessage: '',
    };
  },
  computed: {
    ...mapGetters(['curPage', 'transcriptInfo', 'paperInfo']),
  },
  methods: {
    getImgResource: function (srcImg) {
      return getResource(srcImg);
    },

    initSelectedPaper: function () {
      this.selectedPaper = {
        id: -1,
        clips: [],
        title: '',
        description: '',
        filePath: '',
        project_id: this.transcriptInfo.curProjectId,
      };
    },

    showPaperModal: function (paperParam) {
      this.selectedPaper = {
        ...paperParam,
      };
      this.$bvModal.show('paper-modal');
    },

    showAlertModal: function () {
      this.$bvModal.show('paper-list-alert-modal');
    },

    closeAlertModal: function () {
      this.$bvModal.hide('paper-list-alert-modal');
    },

    onPaper: async function (paperId) {
      this.$store.dispatch(SET_CUR_PAGE, PAGES.PAPER_EDIT);
      this.$store.dispatch(SET_CUR_FOLDER_TAB, FOLDER_TABS.PAPER_EDITS);

      this.$store.dispatch(SET_PAPER_INFO, {
        curPaperId: paperId,
      });

      try {
        const res = await loadPaperDataAPI(
          this.transcriptInfo.curProjectId,
          paperId
        );
        if (res.status === 200) {
          let data = [];
          Object.keys(res.data).forEach((item) => {
            data.push({ ...res.data[item], id: item });
          });
          this.$store.dispatch(SET_PAPER_INFO, {
            clips: data,
            cur_clip_index: data.length,
          });
        }
      } catch (err) {
        // alert('Load Paper Data failed.');
        this.alertMessage = 'Load Paper Data failed.';
        this.$bvModal.show('paper-list-alert-modal');
      }
    },

    onDeletePaper: function (paper) {
      this.selectedPaper = { ...paper };
      this.$bvModal.show('paper-list-confirm-modal-modal');
    },

    deletePaper: async function (deletePaperInfo) {
      const res = await deletePaperAPI({
        ...deletePaperInfo,
        project_id:
          deletePaperInfo.project_id || this.transcriptInfo.curProjectId,
      });
      if (res.status === 200) {
        this.$store.dispatch(SET_PAPER_INFO, {
          paperData: this.paperInfo.paperData.filter(
            (item) => item.id !== deletePaperInfo.id
          ),
        });
      } else {
        this.alertMessage = 'Delete a Paper Failed';
        this.$bvModal.show('alert-modal');
      }
    },

    cancelDelete: function () {
      this.initSelectedPaper();
    },

    createPaper: async function (paper) {
      if (paper.id === -1) {
        try {
          const res = await createPaperAPI({
            ...paper,
            title: paper.title.trim(),
          });
          if (res.status === 200) {
            this.$store.dispatch(SET_PAPER_INFO, {
              paperData: [
                { ...this.selectedPaper, id: res.data.name },
                ...this.paperInfo.paperData,
              ],
            });
          } else {
            this.alertMessage = 'Create a Paper Failed';
            this.$bvModal.show('alert-modal');
          }
        } catch (err) {
          this.alertMessage = 'Create a Paper Failed';
          this.$bvModal.show('alert-modal');
        }
      } else {
        try {
          const res = await updatePaperAPI(paper);

          if (res.status === 200) {
            this.$store.dispatch(SET_PAPER_INFO, {
              paperData: this.paperInfo.paperData.map((item) => {
                if (item.id === paper.id) return paper;
                else return item;
              }),
            });
          } else {
            this.alertMessage = 'Edit Paper Failed';
            this.$bvModal.show('alert-modal');
          }
        } catch (err) {
          this.alertMessage = 'Edit Paper Failed';
          this.$bvModal.show('alert-modal');
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#paper-list-page {
  > .col-xl-12 {
    height: 100%;
    overflow: hidden;
  }
  .card {
    height: 100%;
    margin: 0;
    overflow: hidden;
    border-radius: 5px;
    .card-footer {
      overflow-y: auto;
    }
  }
}

#btnNewPaper {
  display: flex;
  align-items: center;
}
</style>
