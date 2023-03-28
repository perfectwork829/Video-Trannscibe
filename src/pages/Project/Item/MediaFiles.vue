<template>
  <div class="row page-content transcript-page-wrapper">
    <div class="col-md-3">
      <!-- <folder-tab page="transcript"></folder-tab> -->
      <div class="card">
        <div class="card-header">
          <upload-file />
        </div>
        <div class="card-body">
          <edmon-tree :treeData="medias" @onItem="onSelectMedia"></edmon-tree>
        </div>
      </div>
    </div>
    <div class="col-md-9">
      <div class="transcript_section row">
        <div class="col-md-3">
          <!-- <div class="video_player"></div> -->
          <transcript-shaka-video-player
            v-if="transcriptInfo.transcriptItemData"
            :key="transcriptInfo.transcriptItemData.mpdFilePath"
          ></transcript-shaka-video-player>
          <br />
          <div class="d-flex align-items-center">
            <edmon-select
              id="video-speed-wrapper"
              :value="{
                value: transcriptInfo.video.playbackRate,
                label: `X ${transcriptInfo.video.playbackRate}`,
              }"
              :options="[
                { value: 0.2, label: 'X 0.2' },
                { value: 0.25, label: 'X 0.25' },
                { value: 0.5, label: 'X 0.5' },
                { value: 0.75, label: 'X 0.75' },
                { value: 1, label: 'X 1' },
                { value: 1.25, label: 'X 1.25' },
                { value: 1.5, label: 'X 1.5' },
                { value: 1.75, label: 'X 1.75' },
                { value: 2, label: 'X 2' },
                { value: 2.25, label: 'X 2.25' },
                { value: 2.5, label: 'X 2.5' },
                { value: 3, label: 'X 3' },
                { value: 3.5, label: 'X 3.5' },
              ]"
              @onChange="changePlaySpeed"
            >
            </edmon-select>
            <span @click="playback" class="btn btn-success btnSeek">
              15&nbsp;&nbsp; <fa-icon :icon="['fas', 'undo']" />
            </span>
          </div>
          <label class="toggle silice-toggle-wrapper">
            <input
              class="toggle-checkbox"
              type="checkbox"
              :checked="transcriptInfo.skipSilent"
              @change="changeSkipSilent"
            />
            <span class="toggle-switch"></span>
            <span class="toggle-label">Skip Silent Parts</span>
          </label>
          <label class="toggle silice-toggle-wrapper">
            <input
              class="toggle-checkbox"
              type="checkbox"
              :checked="transcriptInfo.hideSilent"
              @change="changeHideSilent"
            />
            <span class="toggle-switch"></span>
            <span class="toggle-label">Hide Silent Parts</span>
          </label>

          <div class="tags tags-wrapper">
            <div
              class="participants-field"
              v-if="
                transcriptInfo.transcriptItemData &&
                Object.keys(transcriptInfo.transcriptItemData).indexOf('participants') >= 0 &&
                transcriptInfo.transcriptItemData.participants.length > 0
              "
            >
              <p>
                <b>Participants:</b>
                {{ transcriptInfo.transcriptItemData.participants.join(', ') }}
              </p>
            </div>
            <div class="tags-field"></div>
            <div class="clipTags" v-if="transcriptInfo.transcriptItemData && transcriptInfo.transcriptItemData.tags">
              <edmon-tags-wrapper
                :tags="
                  transcriptInfo.transcriptItemData.tags.map((item) => {
                    return {
                      value: item.value,
                      label: item.value,
                      type: item.type,
                    };
                  })
                "
                @removeTag="removeClipTag"
              ></edmon-tags-wrapper>
            </div>
            <button class="btn btn-primary add-field" @click="onAddField">Add Field</button>
          </div>
        </div>
        <div class="col-md-8">
          <transcript-content page="transcript" :currentTime="transcriptInfo.video.currentTime"></transcript-content>
        </div>
        <div class="ctrl-btn-wrapper col-md-1">
          <strike-dropdown
            class="transcript-window-dropdown-one mb-2"
            :variant="'btn-primary'"
            :anchorPos="'right'"
            @onStrike="onLabelClicked({ value: -3, color: '' })"
          ></strike-dropdown>
          <txt-dropdown class="transcript-window-dropdown-one mb-2"></txt-dropdown>
          <button type="button" class="btn btn-primary btnSave" @click="saveContent">
            <fa-icon :icon="['fas', 'save']" />
          </button>
        </div>
        <add-new-tag-modal type="clip"></add-new-tag-modal>
      </div>
    </div>
    <alert-modal componentId="transcript-alert-modal" :content="alertMessage"></alert-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import EdmonTree from 'app/components/core/EdmonTree.vue';
// import FolderTab from 'app/components/sharedComponents/folderTab/FolderTab.vue';
// import VideoPlayer from 'app/components/pages/transcript/VideoPlayer.vue';
// import TranscriptVideoPlayer from 'app/components/pages/transcript/TranscriptVideoPlayer.vue';
import UploadFile from 'app/components/sharedComponents/UploadFile.vue';
import TranscriptShakaVideoPlayer from 'app/components/pages/transcript/TranscriptShakaVideoPlayer.vue';
import EdmonSelect from 'app/components/core/EdmonSelect.vue';
import TranscriptContent from 'app/components/pages/transcript/TranscriptContent.vue';
import StrikeDropdown from 'app/components/sharedComponents/StrikeDropdown.vue';
import TxtDropdown from 'app/components/pages/transcript/TxtDropdown.vue';
import EdmonTagsWrapper from 'app/components/core/EdmonTagsWrapper.vue';
import AddNewTagModal from 'app/components/pages/transcript/AddNewTagModal.vue';
import { saveContentAPI, getAllMediasAPI } from 'app/api';
import { getTranscriptAPI, getScriptContentsAPI, updateTranscriptAPI, updateClipAPI } from 'app/api';
import { PAGES } from 'app/constants/index';
import { SET_TRANSCRIPT_INFO, SET_CUR_CLIP } from 'app/store/transcript.module';
import { SET_CUR_PAGE } from 'app/store/page.module';
import AlertModal from 'app/components/sharedComponents/AlertModal.vue';
import firebase from 'plugins/firebase';
export default {
  name: 'Transcript',
  components: {
    UploadFile,
    EdmonTree,
    // FolderTab,
    TranscriptShakaVideoPlayer,
    // VideoPlayer,
    EdmonSelect,
    TranscriptContent,
    StrikeDropdown,
    TxtDropdown,
    AddNewTagModal,
    EdmonTagsWrapper,
    AlertModal,
  },
  data() {
    return {
      licenseServer: 'https://widevine-proxy.appspot.com/proxy',
      manifestUrl: 'https://dash.akamaized.net/dash264/TestCases/1c/qualcomm/2/MultiRate.mpd',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Big_Buck_Bunny_thumbnail_vlc.png',
      alertMessage: '',
      medias: [],
    };
  },
  computed: {
    ...mapGetters(['transcriptInfo', 'curPage']),
  },
  created() {
    this.$store.dispatch(SET_CUR_PAGE, PAGES.TRANSCRIPT);
  },
  mounted() {
    const mediasRef = firebase.database().ref(`/projects/${this.$route.params.projectId}/medias`);
    mediasRef.on('value', (snapshot) => {
      this.medias = [];
      snapshot.forEach((item) => {
        this.medias.push({
          title: item.val().filename,
          description: item.val().status === 'transcribing' ? 'transcribing' : null,
          data: item.val(),
        });
      });
      console.log('medias', this.medias);
    });
  },
  methods: {
    onSelectMedia: function (val) {
      this.onProjectItemTitle(val.data.data, val.data.data.revId);
    },
    async onProjectItemTitle(item, itemId = '') {
      console.log(itemId);
      this.$store.dispatch(SET_CUR_CLIP, itemId);
      let update = {
        is_avb: 0,
        direct_media: true,
        content_id: itemId,
        transcriptItemData: {
          avb_path: null,
          filePath: item.mediaUrl,
          is_avb: 0,
          mob_id: null,
          mpdFilePath: item.mpdUrl,
          parent_id: null,
          project_id: this.$route.params.projectId,
          revai_id: itemId,
          status: 'success',
          title: item.filename,
          id: itemId,
          content: null,
        },
        mob_id: null,
        avb_path: null,
        video: {
          playbackRate: 1,
          currentTime: 0,
        },
      };
      try {
        const resScriptContent = await getScriptContentsAPI(itemId);
        if (resScriptContent.status !== 200) {
          this.$store.dispatch(SET_TRANSCRIPT_INFO, update);
          return;
        }
        update.transcriptItemData.content = resScriptContent.data;
        console.log('update', update);
        this.$store.dispatch(SET_TRANSCRIPT_INFO, update);
      } catch (err) {
        this.$store.dispatch(SET_TRANSCRIPT_INFO, update);
      }
    },
    changePlaySpeed: function ($event) {
      this.$store.dispatch(SET_TRANSCRIPT_INFO, {
        video: {
          currentTime: this.transcriptInfo.video.currentTime,
          playbackRate: $event.value,
        },
      });
    },

    playback: function () {
      this.$store.dispatch(SET_TRANSCRIPT_INFO, {
        video: {
          currentTime: this.transcriptInfo.video.currentTime - 15,
          playbackRate: this.transcriptInfo.video.playbackRate,
        },
      });
      // this.$store.dispatch(SET_TRANSCRIPT_PROJECT_VIDEOINFO, {
      //   currentTime: this.transcriptInfo.video.currentTime - 15,
      // });
      // const element = document.getElementById('video_player');
      // if (element) {
      //   document.getElementById('video_player').currentTime =
      //     this.transcriptInfo.video.currentTime - 15;
      // }
    },
    changeSkipSilent: function () {
      this.$store.dispatch(SET_TRANSCRIPT_INFO, {
        skipSilent: !this.transcriptInfo.skipSilent,
      });
    },
    changeHideSilent: function () {
      this.$store.dispatch(SET_TRANSCRIPT_INFO, {
        hideSilent: !this.transcriptInfo.hideSilent,
      });
    },
    onAddField: function () {
      this.$bvModal.show('transcript-window-add-newtag-modal');
    },
    removeClipTag: function (removedTag) {
      this.$store.dispatch(SET_TRANSCRIPT_INFO, {
        transcriptItemData: {
          ...this.transcriptInfo.transcriptItemData,
          tags: this.transcriptInfo.transcriptItemData.tags.filter((item) => {
            if (item.value === removedTag.value && item.type === removedTag.type) return false;
            return true;
          }),
        },
      });
    },
    onLabelClicked: function (selectedHighlight) {
      var selections = window.getSelection();
      try {
        if (selections.anchorNode != null && selections.focusNode != null) {
          let startNode = selections.anchorNode.parentNode;
          let endNode = selections.focusNode.parentNode;
          let startOffset = selections.anchorOffset;
          let endOffset = selections.focusOffset;

          let content = this.transcriptInfo.transcriptItemData.content;

          let firstIndex = startNode.getAttribute('data-index');
          let firstElemId = startNode.getAttribute('data-elemind');

          if (!firstIndex) {
            let tmpNode = startNode.lastElementChild;
            firstIndex = parseInt(tmpNode.getAttribute('data-index'));
            firstElemId = parseInt(tmpNode.getAttribute('data-elemind')) + 1;
            if (content.monologues[firstIndex].elements.length <= firstElemId) {
              firstIndex++;
              firstElemId = 0;
            }
          }

          let secondIndex = endNode.getAttribute('data-index');
          let secondElemId = endNode.getAttribute('data-elemind');
          if (secondIndex == undefined) {
            let tmpNode = endNode.lastElementChild;
            secondIndex = tmpNode.getAttribute('data-index');
            secondElemId = tmpNode.getAttribute('data-elemind');
          }

          let sentence = '';
          let sentenceId = 0;
          let start_time = 0;

          for (var i = firstIndex; i <= secondIndex; i++) {
            let item = content.monologues[i];

            let rowStart = parseInt(i == firstIndex ? firstElemId : 0);
            let rowEnd = parseInt(i == secondIndex ? secondElemId : content.monologues[i].elements.length - 1);

            let swap = false;

            if (rowStart > rowEnd) {
              let tmp = rowStart;
              rowStart = rowEnd;
              rowEnd = tmp;
              swap = true;
            }

            for (let j = rowStart; j <= rowEnd; j++) {
              let el = item.elements[j];
              if (selectedHighlight.value == -3) {
                el.tag_type = el.tag_type == 'strike' ? 'normal' : 'strike';
              } else if (selectedHighlight.value == -2) {
                // strong tag must be started and ended at the text to show star correctly
                if (j == rowStart && el.type == 'punct') continue;
                if (j == rowEnd && el.type == 'punct') continue;
                el.tag_type = 'strong';
              } else if (selectedHighlight.value == -1) {
                el.tag_type = 'normal';
              } else {
                el.tag_type = 'color';
                el.attr = selectedHighlight.color;
              }
            }
          }
          // transcriptItemData.content = JSON.stringify(content);
          // saveContent();
          // refreshTranscriptData(transcriptItemData);
          this.$store.dispatch(SET_TRANSCRIPT_INFO, {
            transcriptItemData: {
              ...this.transcriptInfo.transcriptItemData,
              content: content,
            },
          });
          saveContentAPI(this.transcriptInfo.content_id, content);
        }
      } catch (e) {
        // alert(e);
        this.alertMessage = e;
        this.$bvModal.show('transcript-alert-modal');
      }
    },

    saveContent: function () {
      if (!this.transcriptInfo.content_id || !this.transcriptInfo.transcriptItemData.content) return;
      saveContentAPI(this.transcriptInfo.content_id, this.transcriptInfo.transcriptItemData.content);
    },
  },
  destroyed: function () {
    this.$store.dispatch(SET_TRANSCRIPT_INFO, {
      video: { playbackRate: 1, currentTime: 0 },
    });
  },
};
</script>

<style lang="scss">
.transcript-page-wrapper {
  > .col-md-3 {
    height: 100%;
  }
  > .col-md-9 {
    height: 100%;
  }
}

.transcript_section {
  height: 100%;
  > .col-md-3,
  > .col-md-8 {
    height: 100%;
  }
  .btnSeek {
    margin-left: 5px;
    font-size: 0.7rem;
  }
  .tags-wrapper {
    margin: 30px;
    font-size: 0.7rem;
  }
  .silice-toggle-wrapper {
    margin: 1rem 0;
  }

  .btnSave {
    width: 62px;
    display: flex;
    align-items: center;
    justify-content: center;

    .svg-inline--fa {
      width: 16px;
      height: 16px;
    }
  }
}

#video-speed-wrapper {
  width: 100px;
  .selected {
    border: 1px solid #5d78ff !important;
    height: 30px;
  }
}

.transcript-window-dropdown-one {
  width: 62px;
  .edmon-dropdown-anchorbtn {
    width: 100%;
  }
}

.clipTags {
  margin-bottom: 1rem;
}
.add-field {
  font-size: 0.7rem;
}
</style>
