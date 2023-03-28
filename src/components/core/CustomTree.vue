<template>
  <div class="project-list col-12">
    <b-button
      variant="primary"
      class="ml-1 mb-3"
      size="sm"
      @click="onCreateFolder"
    >
      <fa-icon :icon="['fas', 'plus']"></fa-icon>
      Create Folder
    </b-button>
    <sl-vue-tree ref="SlVueTree" v-model="nodes">
      <template slot="toggle" slot-scope="{ node }">
        <span
          :class="`caret project-list-name ${
            !node.isExpanded ? '' : 'caret-down'
          }`"
        >
          <template v-if="!node.isLeaf">
            <template v-if="!node.isExpanded">
              <fa-icon :icon="['fas', 'folder']" class="project-icon" />
            </template>
            <template v-else>
              <fa-icon :icon="['fas', 'folder-open']" class="project-icon" />
            </template>
          </template>
          <template v-else>
            <fa-icon :icon="['fas', 'file-alt']" class="project-icon" />
          </template>
        </span>
      </template>
      <template slot="title" slot-scope="{ node }">
        <span class="item-icon">
          <template v-if="node.isLeaf">
            <img class="project-icon" :src="getImgResource('res:/PNG/#166')" />
          </template>
        </span>
        <span
          :class="node.isLeaf ? 'leaf-title' : 'no-leaf-title'"
          @click="
            ($event) => {
              onPaperItem($event, node);
            }
          "
          >{{ node.title }}
        </span>
      </template>
      <template slot="sidebar" slot-scope="{ node }">
        <span class="visible-icon">
          <b-button class="edmon-btn-pencil ml-1" @click="() => onEdit(node)"
            ><fa-icon :icon="['fas', 'pencil-alt']"
          /></b-button>
          <b-button class="edmon-btn-trash ml-1" @click="() => onDelete(node)">
            <fa-icon :icon="['fas', 'trash']"></fa-icon>
          </b-button>
        </span>
      </template>
    </sl-vue-tree>
    <folder-modal
      componentId="folder-modal-paper-tree"
      @createFolder="updateFolder"
      :folder="selectedFolder"
    ></folder-modal>
    <paper-modal
      componentId="paper-modal-paper-tree"
      @createPaper="updatePaper"
      :paper="selectedPaper"
    ></paper-modal>
    <confirm-modal
      :componentId="'folder-tree-confirm-modal'"
      title="Are you sure want to delete?"
      @onOk="deleteFolder(selectedFolder)"
      @onCancel="cancelDelete"
    ></confirm-modal>
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
import { mapGetters } from "vuex";
import SlVueTree from "sl-vue-tree";
import { SET_PAPER_INFO } from "app/store/paper.module";
import { loadPaperDataAPI, updatePaperAPI, deletePaperAPI } from "app/api";
import FolderModal from "app/components/pages/paper/paperList/FolderModal.vue";
import PaperModal from "app/components/pages/paper/paperList/PaperModal.vue";
import ConfirmModal from "app/components/sharedComponents/ConfirmModal.vue";
import AlertModal from "app/components/sharedComponents/AlertModal.vue";
import { getResource } from "app/utils";
import { createFolderAPI } from "app/api";
export default {
  name: "CustomTree",
  components: {
    SlVueTree,
    FolderModal,
    PaperModal,
    ConfirmModal,
    AlertModal,
  },
  props: {
    // treeData: {
    //   type: Array,
    //   default: () => [],
    // },
  },
  data() {
    return {
      nodes: [],
      selectedPaper: { id: -1, title: "", description: "" },
      alertMessage: "",
      selectedFolder: null,
    };
  },
  computed: {
    ...mapGetters(["transcriptInfo", "paperInfo"]),
    // nodes: {
    //   get() {
    //     let nodes = [];
    //     if (this.paperInfo.folderStructure) {
    //       nodes = this.paperInfo.folderStructure;
    //       } else {
    //         nodes = this.paperInfo.paperData.filter(it => it.title).map((it) => {
    //           return {
    //             data: {...it},
    //             title: it.title,
    //             isLeaf: true,
    //           };
    //         });
    //     }
    //     return nodes;
    //   },
    //   set(newVal) {
    //     return newVal;
    //   }

    // }
  },
  mounted() {
    if (this.paperInfo.folderStructure) {
      this.nodes = this.paperInfo.folderStructure;
    } else {
      this.nodes = this.paperInfo.paperData
        .sort(function (a, b) {
          if (a.title < b.title) {
            return -1;
          }
          if (a.title > b.title) {
            return 1;
          }
          return 0;
        })
        .filter((it) => it.title)
        .map((it) => {
          return {
            data: { ...it },
            title: it.title,
            isLeaf: true,
          };
        });
    }
  },
  watch: {
    "paperInfo.folderStructure": function (n, o) {
      if (n && o && n.length !== o.length) {
        this.nodes = n;
      }
    },
    nodes: function(n, o) {
      // console.log('node changed',)
      this.$store.dispatch(SET_PAPER_INFO, {
        folderStructure: n
      });
    }
  },
  methods: {
    getImgResource: function (srcImg) {
      return getResource(srcImg);
    },
    onCreateFolder: function () {
      this.selectedFolder = null;
      this.$bvModal.show("folder-modal-paper-tree");
    },
    updateFolder: async function (folder) {
      if (folder.id === -1) {
        this.nodes.push({
          title: folder.title,
          leaf: false,
          isExpanded: true,
        });
      } else {
        this.$refs.SlVueTree.updateNode(folder.path, { title: folder.title });
      }
    },
    onPaperItem: async function (event, selectedItem) {
      if (!selectedItem.isLeaf) return;
      event.preventDefault();
      const transcriptVideo = document.getElementById("video_player");
      if (transcriptVideo) transcriptVideo.pause();

      this.$store.dispatch(SET_PAPER_INFO, {
        curPaperId: selectedItem.data.id,
      });

      try {
        const res = await loadPaperDataAPI(
          this.transcriptInfo.curProjectId,
          selectedItem.data.id
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
        alert("Load Paper Data failed.");
      }
    },
    onEdit: function (item) {
      if (item.isLeaf) {
        this.selectedPaper = item;
        this.$bvModal.show("paper-modal-paper-tree");
      } else {
        // this.selectedFolder = this.getNodeItem(item);
        this.selectedFolder = item;
        this.$bvModal.show("folder-modal-paper-tree");
      }
    },
    onDelete: function (item) {
      if (item.isLeaf) {
        this.selectedPaper = item;
        this.$bvModal.show("paper-tree-confirm-modal");
      } else {
        this.selectedFolder = item;
        this.$bvModal.show("folder-tree-confirm-modal");
      }
    },
    deleteFolder: async function (folder) {
      this.$refs.SlVueTree.remove([folder.path]);
      if (folder.children) {
        folder.children.forEach((children) => {
          this.deletePaper(children);
        });
      }
    },
    deletePaper: async function (deletePaperInfo) {
      this.$refs.SlVueTree.remove([deletePaperInfo.path]);
      const res = await deletePaperAPI({
        ...deletePaperInfo.data,
        project_id:
          deletePaperInfo.data.project_id || this.transcriptInfo.curProjectId,
      });
      if (res.status === 200) {
        this.$store.dispatch(SET_PAPER_INFO, {
          paperData: this.paperInfo.paperData.filter(
            (item) => item.id !== deletePaperInfo.data.id
          ),
          // folderStructure: this.nodes
        });
      } else {
        this.alertMessage = "Delete a Paper Failed";
        this.$bvModal.show("paper-tree-alert-modal");
      }
    },
    cancelDelete: function () {
      this.selectedPaper = { id: -1, title: "", description: "" };
      this.selectedFolder = null;
    },
    updatePaper: async function (paper) {
      this.$refs.SlVueTree.updateNode(paper.path, { title: paper.title });
      try {
        const data = paper.data;
        data.title = paper.title;
        const res = await updatePaperAPI(data);

        if (res.status === 200) {
          this.$store.dispatch(SET_PAPER_INFO, {
            paperData: this.paperInfo.paperData.map((item) => {
              if (item.id === paper.data.id) {
                return data;
              } else return item;
            }),
            // folderStructure: this.nodes
          });
        } else {
          this.alertMessage = "Edit Paper Failed";
          this.$bvModal.show("paper-tree-alert-modal");
        }
      } catch (err) {
        this.alertMessage = "Edit Paper Failed";
        this.$bvModal.show("paper-tree-alert-modal");
      }
    },
    getNodeItem: function (item) {
      let nodeItem = this.nodes[item.path[0]];
      for (let i = 1; i < item.path.length; i++) {
        nodeItem = nodeItem.children[item.path[i]];
      }
      nodeItem.path = item.path;
      return nodeItem;
    },
  },
  async destroyed() {
    this.$store.dispatch(SET_PAPER_INFO, {
      folderStructure: this.nodes,
    });
    const res = await createFolderAPI(
      this.transcriptInfo.curProjectId,
      this.nodes
    );
  },
};
</script>
<style scoped lang="scss">
@import "../../../node_modules/sl-vue-tree/dist/sl-vue-tree-dark.css";
.btn-sm {
  font-size: 75%;
}
.project-list {
  .project-list-name {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    .project-icon {
      // font-size: 35px;
      font-size: 20px;
      margin-right: 0.5rem;
    }
    h5 {
      // font-size: 1rem;
      font-size: 0.75rem;
    }
    &.caret {
      cursor: pointer;
      -webkit-user-select: none; /* Safari 3.1+ */
      -moz-user-select: none; /* Firefox 2+ */
      -ms-user-select: none; /* IE 10+ */
      user-select: none;
      display: flex;
      font-size: 12px;
      color: #858a8e;
    }
    &::before {
      content: "\25B6";
      color: #858a8e;
      display: inline-block;
      margin-right: 6px;
      transition: all 0.15s ease-in-out;
    }
    &.caret-down {
      &::before {
        -ms-transform: rotate(90deg); /* IE 9 */
        -webkit-transform: rotate(90deg); /* Safari */
        transform: rotate(90deg);
      }
    }
  }
  > .tree-item-wrapper {
    margin-left: 20px;
  }
}
img.project-icon {
  width: 20px;
  height: 15px;
  margin: 0 0.5rem 0 0;
}
.leaf-title {
  font-size: 0.75rem;
  color: white;
    &:hover {
      text-decoration: underline;
    }
}
.no-leaf-title {
  font-size: 0.75rem;
  margin-left: 1.5rem;
  color: white;
}

// .sl-vue-tree {
//     position: relative;
//     cursor: default;
//     -webkit-touch-callout: none; /* iOS Safari */
//     -webkit-user-select: none; /* Safari */
//     -khtml-user-select: none; /* Konqueror HTML */
//     -moz-user-select: none; /* Firefox */
//     -ms-user-select: none; /* Internet Explorer/Edge */
//     user-select: none;
// }

// .sl-vue-tree.sl-vue-tree-root {
//     border: 1px solid rgb(9, 22, 29);
//     background-color: rgb(9, 22, 29);
//     color: rgba(255, 255, 255, 0.5);
//     border-radius: 3px;
// }

// .sl-vue-tree-root > .sl-vue-tree-nodes-list {
//     overflow: hidden;
//     position: relative;
//     padding-bottom: 4px;
// }

// .sl-vue-tree-selected > .sl-vue-tree-node-item {
//     background-color: #13242d;
//     color: white;
// }

// .sl-vue-tree-node-item:hover,
// .sl-vue-tree-node-item.sl-vue-tree-cursor-hover {
//     color: white;
// }

// .sl-vue-tree-node-item {
//     position: relative;
//     display: flex;
//     flex-direction: row;

//     padding-left: 10px;
//     padding-right: 10px;
//     line-height: 28px;
//     border: 1px solid transparent;
// }

// .sl-vue-tree-node-item.sl-vue-tree-cursor-inside {
//     border: 1px solid rgba(255, 255, 255, 0.5);
// }

// .sl-vue-tree-gap {
//     width: 25px;
//     min-height: 1px;

// }

// .sl-vue-tree-toggle {
//     display: inline-block;
//     text-align: left;
//     width: 20px;
// }

// .sl-vue-tree-sidebar {
//     margin-left: auto;
// }

// .sl-vue-tree-cursor {
//     position: absolute;
//     border: 1px solid rgba(255, 255, 255, 0.5);
//     height: 1px;
//     width: 100%;
// }

// .sl-vue-tree-drag-info {
//     position: absolute;
//     background-color: rgba(0,0,0,0.5);
//     opacity: 0.5;
//     margin-left: 20px;
//     padding: 5px 10px;
// }
</style>
