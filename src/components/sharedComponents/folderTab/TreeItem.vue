<template>
  <div :class="`tree-item-wrapper ${collapsed ? '' : 'acitve'}`">
    <div class="project-item row">
      <div class="project-item-content col-12" @click="
        () => {
          collapsed = !collapsed;
        }
      ">
        <div class="d-flex" style="align-items: center">
          <div v-if="parseInt(projectItem.is_avb)" :class="`expand-icon ${collapsed ? '' : 'expanded'}`">
            <fa-icon :icon="['fas', 'chevron-right']" />
          </div>
          <img class="project-icon" :src="`${projectItem.is_avb
            ? getImgResource('res:/PNG/#163')
            : getImgResource('res:/PNG/#159')
          }`" />

          <div class="media-body">
            <h6 :class="`project-item-title ${projectItem.status !== 'success' &&
              !parseInt(projectItem.is_avb)
              ? 'disabled'
              : ''
            }`" @click="
    () => {
      if (!projectItem.is_avb) onProjectItemTitle(projectItem);
    }
  ">
              {{ projectItem.title }}
            </h6>
            <p class="project-item-description" v-if="projectItem.description">
              {{ projectItem.description }}
            </p>
          </div>
          <div class="ml-auto">
            <b-button v-if="!trash" class="edmon-btn-trash ml-1" @click="onDeleteBin(projectItem)">
              <fa-icon :icon="['fas', 'trash']" />
            </b-button>
          </div>
        </div>
      </div>
      <template v-if="!collapsed">
        <div class="clip-wrapper">
          <div class="project-clip-item col-12" v-for="(key, idx) in Object.keys(projectItem.clips)" :key="idx">
            <div v-if="checkVisible(projectItem.clips[key], projectItem)" class="project-item-content"
              :class="`${key == curClipId ? 'highlight' : ''}`">
              <div class="media">
                <img class="project-icon" :src="getImgResource('res:/PNG/#159')" />
                <div class="media-body">
                  <h6 :class="`project-item-title ${projectItem.clips[key].status !== 'success'
                    ? 'disabled'
                    : ''
                  }`" @click="onProjectItemTitle(projectItem.clips[key], key)">
                    {{ projectItem.clips[key].title }}
                  </h6>
                  <p class="project-item-description" v-if="projectItem.clips[key].description">
                    {{ projectItem.clips[key].description }}
                  </p>
                </div>
                <div class="ml-auto">
                  <!-- <b-button class="edmon-btn-trash ml-1" @click="onCheck(projectItem)">
                    <fa-icon :icon="['fas', 'check']" />
                    <fa-icon :icon="['fas', 'square']" />
                  </b-button> -->
                  <b-form-checkbox class="edmon-btn-trash" v-model="projectItem.clips[key].checked_by_user"
                    @change="val => onCheck(val, projectItem.clips[key], key)">
                  </b-form-checkbox>
                  <b-button v-if="!trash" class="edmon-btn-trash" @click="onDeleteClip(projectItem.clips[key], key)">
                    <fa-icon :icon="['fas', 'trash']" />
                  </b-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { getResource } from "app/utils";
import { mapGetters } from "vuex";
import { SET_TRANSCRIPT_INFO, SET_CUR_CLIP } from "app/store/transcript.module";
import { getTranscriptAPI, getScriptContentsAPI, updateTranscriptAPI, updateClipAPI } from "app/api";
import ProjectService from "../../../services/ProjectService";
import ScriptService from "../../../services/ScriptService";
export default {
  name: "TreeItem",
  props: {
    projectItem: {
      type: Object,
    },
    trash: {
      type: Boolean,
      default: false,
    }
  },
  data: function () {
    return {
      collapsed: true,
      expanded: [],
    };
  },
  computed: {
    ...mapGetters(["transcriptInfo", "curClipId"]),
  },
  watch: {
    'curClipId': function (n, o) {
      // console.log('transcript', n)
    }
  },
  methods: {
    onCheck(val, clip, key) {
      console.log('val', val, clip, key);
      let temp = [...this.transcriptInfo.transcriptData];
      let new_temp = temp.map(it => {
        let new_it = { ...it };
        if (new_it.id == clip.parent_id) new_it.clips[key].checked_by_user = val;
        return new_it;
      });
      this.$store.dispatch(SET_TRANSCRIPT_INFO, {
        transcriptData: new_temp
      });
      updateClipAPI({
        projectId: clip.project_id,
        transcriptId: clip.parent_id,
        clipId: key
      }, { checked_by_user: val });
    },
    getImgResource(srcImg) {
      return getResource(srcImg);
    },
    onExpanded(idx) {
      if (this.expanded.indexOf(idx) >= 0)
        this.expanded = this.expanded.filter((item) => item !== idx);
      else this.expanded = [...this.expanded, idx];
    },
    getExpanded(idx) {
      return this.expanded.indexOf(idx) >= 0;
    },
    checkVisible(clip, projectItem) {
      let visible = false;
      if (this.trash && projectItem.trash) visible = true;
      if (this.trash && clip.trash) visible = true;
      if (!this.trash && !clip.trash) visible = true;
      return visible;
    },
    async onDeleteBin(item) {
      let temp = [...this.transcriptInfo.transcriptData];
      let new_temp = temp.map(it => {
        if (it.id == item.id) return { trash: true, ...it }
        else return it
      });
      this.$store.dispatch(SET_TRANSCRIPT_INFO, {
        transcriptData: new_temp
      });
      const res = await updateTranscriptAPI({
        projectId: item.project_id,
        // trash: true,
        transcriptId: item.id,
      }, { trash: true });
    },
    async onDeleteClip(clip, key) {
      let temp = [...this.transcriptInfo.transcriptData];
      let new_temp = temp.map(it => {
        let new_it = { ...it };
        if (new_it.id == clip.parent_id) new_it.clips[key].trash = true;
        return new_it;
      });
      this.$store.dispatch(SET_TRANSCRIPT_INFO, {
        transcriptData: new_temp
      });
      console.log('clip', clip)
      const res = await updateClipAPI({
        projectId: clip.project_id,
        transcriptId: clip.parent_id,
        clipId: key
      }, { trash: true });
    },
    async onProjectItemTitle(item, itemId = "") {
      this.$store.dispatch(SET_CUR_CLIP, itemId);
      let update = {};
      update = {
        is_avb: item.is_avb,
        ...(item.is_avb.toString() === "1" ? { parentId: item.parent_id } : {}),
      };
      let res;
      try {
        res = await ProjectService.getTranscript({
          clipId: item.id || itemId,
          projectId: item.project_id,
          is_avb: item.is_avb,
          parentId: item.parent_id,
        });
        console.log('content', res)
        if (!res) {
          update = {
            ...update,
            content_id: null,
            transcriptItemData: null,
            mob_id: null,
            avb_path: null,
            video: {
              playbackRate: 1,
              currentTime: 0,
            },
          };
          return;
        }
        update = {
          ...update,
          content_id: res.content,
          transcriptItemData: {
            ...res,
            id: item.id,
            content: null,
          },
          mob_id: res.mob_id,
          avb_path: res.avb_path,
          video: {
            playbackRate: 1,
            currentTime: 0,
          },
        };
      } catch (err) {
        update = {
          ...update,
          content_id: null,
          transcriptItemData: null,
          mob_id: null,
          avb_path: null,
          video: {
            playbackRate: 1,
            currentTime: 0,
          },
        };
      }

      try {
        const resScriptContent = await ScriptService.getScriptContents(res.content);
        if (!resScriptContent) {
          this.$store.dispatch(SET_TRANSCRIPT_INFO, update);
          return;
        }
        update.transcriptItemData.content = resScriptContent;
        this.$store.dispatch(SET_TRANSCRIPT_INFO, update);
      } catch (err) {
        this.$store.dispatch(SET_TRANSCRIPT_INFO, update);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.tree-item-wrapper {
  overflow-x: hidden;

  .expand-icon {
    width: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.15s ease-in-out;
    margin-right: 6px;

    &.expanded {
      -ms-transform: rotate(90deg);
      /* IE 9 */
      -webkit-transform: rotate(90deg);
      /* Safari */
      transform: rotate(90deg);
    }
  }

  .clip-wrapper {
    padding-left: 60px;
    overflow-x: hidden;
    width: 100%;

    .project-clip-item {
      .media {
        display: flex;
        align-items: center;

        // overflow: hidden;
        .media-body {
          width: 100%;
        }
      }
    }
  }
}

.highlight {
  .project-item-title {
    color: yellow;
  }
}
</style>
