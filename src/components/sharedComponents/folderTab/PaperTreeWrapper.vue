<template>
  <div class="treeviewwrapper">
    <div class="proejct-item" v-for="(item, idx) in treeData" :key="idx">
      <div class="project-item-content">
        <div class="d-flex align-items-center">
          <img class="project-icon" :src="getImgResource('res:/PNG/#166')" />
          <div class="media-body with-delete">
            <div class="tree-info-wrapper">
              <h5
                :class="`project-item-title ${
                  paperInfo.curPaperId === item.id
                }`"
                @click="
                  ($event) => {
                    onPaperItem($event, item);
                  }
                "
                :data="
                  JSON.stringify({
                    projectId: transcriptInfo.curProjectId,
                    paperId: item.id,
                  })
                "
              >
                {{ item.title }}
              </h5>
              <p class="project-item-description" v-if="item.description">
                {{ item.description }}
              </p>
            </div>
            <b-button class="edmon-btn-pencil ml-1" @click="() => onEdit(item)"
              ><fa-icon :icon="['fas', 'pencil-alt']"
            /></b-button>
            <b-button
              class="edmon-btn-trash ml-1"
              @click="() => onDelete(item)"
            >
              <fa-icon :icon="['fas', 'trash']"></fa-icon>
            </b-button>
          </div>
        </div>
      </div>
    </div>
    <paper-modal
      componentId="paper-modal-paper-tree"
      @createPaper="updatePaper"
      :paper="selectedPaper"
    ></paper-modal>
    <confirm-modal
      :componentId="'paper-tree-confirm-modal'"
      title="Are you sure want to delete?"
      @onOk="deletePaper(selectedPaper)"
      @onCancel="cancelDelete"
    ></confirm-modal>
    <alert-modal
      componentId="paper-tree-alert-modal"
      :content="alertMessage"
      @onOk="() => {}"
    ></alert-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import PaperModal from 'app/components/pages/paper/paperList/PaperModal.vue';
import ConfirmModal from 'app/components/sharedComponents/ConfirmModal.vue';
import AlertModal from 'app/components/sharedComponents/AlertModal.vue';
import { getResource } from 'app/utils';
import { loadPaperDataAPI, updatePaperAPI, deletePaperAPI } from 'app/api';
import { SET_PAPER_INFO } from 'app/store/paper.module';

export default {
  name: 'PaperTreeWrapper',
  components: { PaperModal, ConfirmModal, AlertModal },
  props: {
    treeData: {
      type: Array,
    },
  },
  computed: {
    ...mapGetters(['transcriptInfo', 'paperInfo']),
  },
  data: function () {
    return {
      selectedPaper: { id: -1, title: '', description: '' },
      alertMessage: '',
    };
  },
  methods: {
    getImgResource: function (srcImg) {
      return getResource(srcImg);
    },
    onPaperItem: async function (event, selectedItem) {
      event.preventDefault();
      // pause transcript edit video player
      const transcriptVideo = document.getElementById('video_player');
      if (transcriptVideo) transcriptVideo.pause();

      this.$store.dispatch(SET_PAPER_INFO, {
        curPaperId: selectedItem.id,
      });

      try {
        const res = await loadPaperDataAPI(
          this.transcriptInfo.curProjectId,
          selectedItem.id
        );
        if (res.status === 200) {
          let data = [];
          if (res.data) {
            Object.keys(res.data).forEach((item) => {
              data.push({ ...res.data[item], id: item });
            });
          }
          this.$store.dispatch(SET_PAPER_INFO, {
            clips: data,
            cur_clip_index: data.length,
          });
        }
      } catch (err) {
        alert('Load Paper Data failed.');
      }
    },
    onEdit: function (item) {
      this.selectedPaper = { ...item };
      this.$bvModal.show('paper-modal-paper-tree');
    },
    onDelete: function (item) {
      this.selectedPaper = item;
      this.$bvModal.show('paper-tree-confirm-modal');
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
        this.$bvModal.show('paper-tree-alert-modal');
      }
    },
    cancelDelete: function () {
      this.selectedPaper = { id: -1, title: '', description: '' };
    },
    updatePaper: async function (paper) {
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
          this.$bvModal.show('paper-tree-alert-modal');
        }
      } catch (err) {
        this.alertMessage = 'Edit Paper Failed';
        this.$bvModal.show('paper-tree-alert-modal');
      }
    },
  },
};
</script>
