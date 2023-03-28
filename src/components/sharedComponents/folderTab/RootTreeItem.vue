<template>
  <div class="project-list col-12">
    <span
      :class="`caret project-list-name ${collapsed ? '' : 'caret-down'}`"
      @click="
        () => {
          collapsed = !collapsed;
          subProject(project.name);
        }
      "
    >
      <template v-if="collapsed">
        <fa-icon :icon="['fas', 'folder']" class="project-icon" />
      </template>
      <template v-else>
        <fa-icon :icon="['fas', 'folder-open']" class="project-icon" />
      </template>

      <h5 class="mb-0">{{ project.name }}</h5>
      <!-- <div class="ml-auto">
        <b-button class="edmon-btn-trash ml-1" @click="onDeleteProject(item)">
          <fa-icon :icon="['fas', 'trash']" />
        </b-button>
      </div> -->
    </span>

    <template v-if="!collapsed">
      <template v-for="(item, idx) in project.items">
        <template v-if="!item.parent_id && checkVisible(item)">
          <tree-item :trash="trash" :key="idx" :projectItem="item"></tree-item>
        </template>
      </template>
    </template>
  </div>
</template>

<script>
import TreeItem from "./TreeItem.vue";
import { getResource } from "app/utils";
import { SET_TRANSCRIPT_INFO } from "app/store/transcript.module";
export default {
  name: "RootTreeItem",
  components: { TreeItem },
  props: {
    trash: {
      type: Boolean,
      default: false
    },
    project: {
      project: {
        type: Object,
        default: function () {
          return {};
        },
      },
    },
  },
  data: function () {
    return {
      collapsed: true,
    };
  },
  methods: {
    getImgResource(srcImg) {
      return getResource(srcImg);
    },
    subProject(name) {
      this.$store.dispatch(SET_TRANSCRIPT_INFO, {
        curProjectSubName: name,
      });
    },
    checkVisible(item) {
      let visible = false;
      if (this.trash && item.trash) visible = true;
      if (!this.trash && !item.trash) visible = true;
      let clip_trashed = false;
      item.clips && Object.keys(item.clips).forEach(key=> {
        if (item.clips[key].trash) clip_trashed = true;
      })
      if (this.trash && clip_trashed) visible = true;
      return visible;
    }
  },
};
</script>

<style lang="scss" scoped>
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
</style>
