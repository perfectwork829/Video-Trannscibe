<template>
  <div class="project-list">
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
              onItem($event, node);
            }
          "
          >{{ node.title }}
        </span>
        <p class="description">{{node.data.description}}</p>        
      </template>
      <!-- <template slot="sidebar" slot-scope="{ node }">
        <span class="visible-icon">
          <b-button class="edmon-btn-pencil ml-1" @click="() => onEdit(node)"
            ><fa-icon :icon="['fas', 'pencil-alt']"
          /></b-button>
          <b-button class="edmon-btn-trash ml-1" @click="() => onDelete(node)">
            <fa-icon :icon="['fas', 'trash']"></fa-icon>
          </b-button>
        </span>
      </template> -->
    </sl-vue-tree>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import SlVueTree from "sl-vue-tree";
import { SET_PAPER_INFO } from "app/store/paper.module";
import { loadPaperDataAPI, updatePaperAPI, deletePaperAPI } from "app/api";
import { getResource } from "app/utils";
import { createFolderAPI } from "app/api";
export default {
  name: "EdmonTree",
  components: {
    SlVueTree,
  },
  props: {
    treeData: {
      type: [Array, Object],
      default: () => [],
    },
  },
  data() {
    return {
      // nodes: [],
      selectedPaper: { id: -1, title: "", description: "" },
      alertMessage: "",
      selectedFolder: null,
    };
  },
  computed: {
    ...mapGetters(["transcriptInfo", "paperInfo"]),
    nodes: {
      get() {
        const data = this.treeData? Object.values(this.treeData): [];
        const nodes = data.map(it => {
          return {
            title: it.title,
            isLeaf: true,
            data: it
          }
        })
        console.log('nodes', nodes)
        return nodes;
      },
      set(value) {
        return value
      }
    }
  },
  mounted() {
    // console.log('data', this.treeData)
  },
  watch: {
    
  },
  methods: {
    getImgResource: function (srcImg) {
      return getResource(srcImg);
    },
    onCreate: function () {
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
    onItem: async function (event, selectedItem) {
      console.log('click item', event, selectedItem);
      this.$emit('onItem', selectedItem)
    },
    onEdit: function (item) {
      console.log('edit item', item)
    },
    onDelete: function (item) {
      console.log('delete item', item)
    }
  }
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
p.description {
  margin-bottom: 0;
  margin-left: 28px;
  line-height: normal;
  font-size: 0.7rem;
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
