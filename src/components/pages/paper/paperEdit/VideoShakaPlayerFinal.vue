<template>
  <div class="video-player-final-wrapper">
    <div
      class="video-wrapper"
      ref="video_player_final"
      v-for="(item, index) of sentences"
      :key="index"
      :style="[
        index === curClipIndex ? { display: 'flex' } : { display: 'none' },
      ]"
    >
      <video
        class="video_player_final"
        ref="video"
        :controls="false"
        :autoplay="false"
        @play="(e) => videoResume(e, index)"
        @pause="(e) => videoPause(e, index)"
        @timeupdate="(e) => videoTimeUpdate(e, index)"
        @seeked="(e) => videoSeeked(e, index)"
        @volumechange="onVolumeChange"
      ></video>
    </div>
    <div class="video-ctrl-btn-wrapper mt-3">
      <b-button
        class="mr-1"
        variant="primary"
        @click="onPlay"
        @keyup="(e) => e.preventDefault()"
        v-if="videoButtonVisible"
      >
        <fa-icon :icon="['fas', 'play']" /> Play
      </b-button>
      <b-button
        class="mr-1"
        variant="primary"
        @keyup="(e) => e.preventDefault()"
        @click="onPause"
        v-else
      >
        <fa-icon :icon="['fas', 'pause']" /> Pause
      </b-button>
      <b-button variant="danger" @click="onStop">
        <fa-icon :icon="['fas', 'square']" /> Stop
      </b-button>
      <b-button variant="primary" class="ml-1" @click="onCreate">
        <fa-icon :icon="['fas', 'plus']"></fa-icon>
        Paper Edit
      </b-button>
    </div>
    <div class="d-flex mt-3 align-items-center justify-content-between">
      <div class="ml-2 papers">
        <edmon-select
          id="paper-title-wrapper"
          :value="{
            value: paperInfo.curPaperId,
            label: paperTitle,
          }"
          customStyle="font-size: 0.9rem; min-width: 150px;"
          :options="papers"
          @onChange="onPaperItem"
        >
        </edmon-select>
      </div>

      <span>Total Duration: {{ totalDuration }}</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import EdmonSelect from "app/components/core/EdmonSelect.vue";
import { formatTime } from "app/utils";
import { loadPaperDataAPI } from "app/api";
import {
  SET_PAPER_INFO,
  SWITCH_PAPER_PLAYING,
  SET_PAPER_PLAYER_VOL,
} from "app/store/paper.module";
import { SWITCH_TRANSCRIPT_PLAYING } from "app/store/transcript.module";

export default {
  name: "VideoPlayerFinal",
  data: function () {
    return {
      isPlayFinished: true,
      videoButtonVisible: true,
      sentences: [],
      curClipIndex: 0,
      shaka: null,
      player: null,
      currentClip: null,
      paperTitle: "",
      totalDuration: formatTime(0),
      // papers: []
    };
  },
  components: {
    EdmonSelect,
  },
  mounted() {
    this.shaka = require("shaka-player/dist/shaka-player.ui.js");
  },
  computed: {
    ...mapGetters([
      "transcriptInfo",
      "paperInfo",
      "isPaperPlaying",
      "paperPlayerVol",
      "selectedIndex"
    ]),
    clipsArray: function () {
      return [...this.paperInfo.clips];
    },
    papers: function () {
      return [
        ...this.paperInfo.paperData.map((it) => {
          return {
            label: it.title,
            value: it.id,
          };
        }),
      ];
    },
  },
  watch: {
    clipsArray: {
      deep: true,
      handler() {
        let totalDuration = 0;
        this.paperInfo.clips.forEach((clip) => {
          totalDuration += clip.end_time - clip.start_time - 0;
        });
        this.totalDuration = formatTime(totalDuration);
        const curPaper = this.paperInfo.paperData.filter(
          (it) => it.id === this.paperInfo.curPaperId
        )[0];
        this.paperTitle = curPaper ? curPaper.title : "";
        this.sentences = [];
        this.clipsArray.forEach((clipElement) => {
          let sentence = {};
          sentence.startTime = -1;
          sentence.endTime = -1;
          sentence.filePath = clipElement.videoPath;
          sentence.mpdFilePath = clipElement.mpdFilePath;
          var clipElement_type = clipElement.type;
          if (clipElement_type == "interval") {
            // this.sentences.push('interval');
            return;
          } else if (clipElement_type != "clip") {
            return;
          }
          let wordItem = [];
          wordItem = this.getElementInfo(clipElement.elements);
          wordItem.forEach((word) => {
            if (sentence.startTime == -1) {
              sentence.startTime = word.startTime;
            } else {
              sentence.startTime =
                sentence.startTime < word.startTime
                  ? sentence.startTime
                  : word.startTime;
            }
            if (sentence.endTime == -1) {
              sentence.endTime = word.endTime;
            } else {
              sentence.endTime =
                sentence.endTime > word.endTime
                  ? sentence.endTime
                  : word.endTime;
            }
          });
          this.sentences.push(sentence);
        });
        this.isPlayFinished = false;
        setTimeout(() => {
          this.sentences.forEach((sentence, index) => {
            this.loadNewVideo(sentence, index);
          });
        }, 100);
        this.curClipIndex = 0;
        this.isPlayFinished = true;
        this.videoButtonVisible = true;
      },
      immediate: true,
    },
    currentClip: function (n, o) {
      // if (n && n.mpdFilePath) this.loadNewVideo(this.getManifestUrl(n.mpdFilePath))
    },
    isPaperPlaying: function (n, o) {
      if (n) {
        this.onPlay();
      } else {
        this.onPause();
      }
    },
    selectedIndex: function(n , o) {
      this.curClipIndex = n;
    }
  },
  methods: {
    getManifestUrl: function (gsPath) {
      const manifestUrl =
        gsPath.replace("gs://", "https://storage.googleapis.com/") +
        "manifest.mpd";
      return manifestUrl;
    },
    loadNewVideo: function (item, index) {
      const player = new this.shaka.Player(this.$refs.video[index]);
      const ui = new this.shaka.ui.Overlay(
        player,
        this.$refs.video_player_final[index],
        this.$refs.video[index]
      );
      ui.configure({
        controlPanelElements: ["mute", "volume", "spacer"],
        addSeekBar: false,
      });
      // ui.getControls();
      player
        .load(this.getManifestUrl(item.mpdFilePath))
        .then(() => {
          this.$refs.video[index].currentTime = item.startTime;
          this.$refs.video[index].volume = this.paperPlayerVol;
        })
        .catch((err) => console.log(err));
    },
    onPlay: function () {
      this.$store.dispatch(SWITCH_PAPER_PLAYING, true);
      this.$store.dispatch(SWITCH_TRANSCRIPT_PLAYING, false);
      this.videoButtonVisible = false;
      this.$refs.video[this.curClipIndex].play();
      this.$refs.video[this.curClipIndex].volume = this.paperPlayerVol;
    },
    videoLoadedMetaData: function (e) {
      if (this.currentClip == "interval") {
        e.target.setAttribute("type", "interval");
      } else {
        e.target.currentTime = this.currentClip.startTime;
      }
    },
    videoTimeUpdate: function (e, index) {
      if (!this.sentences.length) return;
      if (this.sentences[index] == "interval") {
        e.target.setAttribute("type", "interval");
      } else {
        if (e.target.currentTime >= this.sentences[index].endTime) {
          e.target.pause();
          if (this.sentences.length > 1 && index < this.sentences.length - 1) {
            this.curClipIndex = index + 1;
            this.$refs.video_player_final[index].style.display = "none";
            this.$refs.video_player_final[index + 1].style.display = "flex";
            this.$refs.video[index + 1].currentTime =
              this.sentences[index + 1].startTime;
            this.$refs.video[index + 1].play();
          } else {
            this.onStop();
          }
        }
      }
    },
    videoSeeked: function (e, index) {},
    videoResume: function (e, index) {
      this.videoButtonVisible = false;
    },
    videoPause: function (e, index) {
      this.videoButtonVisible = true;
    },
    onPause: function () {
      this.$store.dispatch(SWITCH_PAPER_PLAYING, false);
      this.$refs.video[this.curClipIndex].pause();
      this.videoButtonVisible = true;
    },
    onStop: function () {
      this.$store.dispatch(SWITCH_PAPER_PLAYING, false);
      this.$refs.video[this.curClipIndex].pause();
      this.$refs.video[this.curClipIndex].currentTime = 0;
      // }
      this.videoButtonVisible = true;
      this.isPlayFinished = true;
      this.curClipIndex = 0;
      this.$refs.video_player_final[this.curClipIndex].style.display = "flex";
    },
    getElementInfo: function (strSpan) {
      let wordItem = [];
      let spanTags = [];
      spanTags = strSpan.split("</span>");
      spanTags.forEach((spanTag) => {
        let spanAttributes = [];
        let word = {};
        spanAttributes = spanTag.split(" ");
        if (spanAttributes[1] === undefined) {
          return;
        }
        // data-type
        if (spanAttributes[1].search("text") === -1) {
          return;
        }
        // data-index
        word.index = spanAttributes[3].split("=")[1];
        // data-elemind
        word.elemInd = spanAttributes[4].split("=")[1];
        // data-ts
        word.startTime = parseFloat(spanAttributes[5].split("=")[1]);
        // data-end-ts
        word.endTime = parseFloat(
          spanAttributes[6]
            .split("=")[1]
            .substr(0, spanAttributes[6].length - 2)
        );
        wordItem.push(word);
      });
      return wordItem;
    },
    onCreate: function () {
      this.$bvModal.show("paper-modal-top-navbar");
    },
    onVolumeChange: function (event) {
      this.$store.dispatch(SET_PAPER_PLAYER_VOL, event.target.volume);
    },
    onPaperItem: async function (selectedItem) {
      // event.preventDefault();
      // pause transcript edit video player
      const transcriptVideo = document.getElementById("video_player");
      if (transcriptVideo) transcriptVideo.pause();

      this.$store.dispatch(SET_PAPER_INFO, {
        curPaperId: selectedItem.value,
      });

      try {
        const res = await loadPaperDataAPI(
          this.transcriptInfo.curProjectId,
          selectedItem.value
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
  },
};
</script>
<style lang="scss" scoped>
.video-player-final-wrapper {
  display: flex;
  flex-direction: column;
  .video-wrapper {
    height: 150px;
    border: 1px solid;
    .video_player_final {
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
  }
  .video-ctrl-btn-wrapper {
    display: flex;
    width: 100%;
    .btn {
      flex: 1 1 auto;
    }
  }
}
</style>
