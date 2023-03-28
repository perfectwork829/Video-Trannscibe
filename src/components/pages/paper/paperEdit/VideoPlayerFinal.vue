<template>
  <div class="video-player-final-wrapper">
    <div class="video-wrapper" id="video_player_final">
      <!-- <video class="video_player_final"></video> -->
    </div>
    <div class="video-ctrl-btn-wrapper mt-3">
      <b-button
        class="mr-1"
        variant="primary"
        @click="onPlay"
        v-if="videoButtonVisible"
      >
        <fa-icon :icon="['fas', 'play']" /> Play
      </b-button>
      <b-button class="mr-1" variant="primary" @click="onPause" v-else>
        <fa-icon :icon="['fas', 'pause']" /> Pause
      </b-button>
      <b-button variant="danger" @click="onStop">
        <fa-icon :icon="['fas', 'square']" /> Stop
      </b-button>
      <b-button variant="outline-primary ml-1">
        <fa-icon :icon="['fas', 'retweet']" /> Convert
      </b-button>
    </div>
    <div class="d-flex mt-3 align-items-center justify-content-center">
      Total Duration: 00:00:00
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'VideoPlayerFinal',
  data: function () {
    return {
      isPlayFinished: true,
      videoButtonVisible: true,
      sentences: [],
      curClipIndex: 0,
    };
  },
  computed: {
    ...mapGetters(['paperInfo']),
    clipsArray: function () {
      return [...this.paperInfo.clips];
    },
  },
  watch: {
    clipsArray: {
      deep: true,
      handler() {
        const videoElement = document.getElementById('video_player_final');
        videoElement.childNodes.forEach((node) => {
          node.pause();
        });
        videoElement.innerHTML = '';
        this.sentences = [];
        this.curClipIndex = 0;
        this.isPlayFinished = true;
        this.videoButtonVisible = true;
      },
    },
  },
  methods: {
    onPlay: function () {
      const videoElement = document.getElementById('video_player_final');
      this.videoButtonVisible = false;
      if (this.isPlayFinished) {
        this.clipsArray.forEach((clipElement) => {
          let sentence = {};
          sentence.startTime = -1;
          sentence.endTime = -1;
          sentence.filePath = clipElement.videoPath;
          var clipElement_type = clipElement.type;
          if (clipElement_type == 'interval') {
            this.sentences.push('interval');
            return;
          } else if (clipElement_type != 'clip') {
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
        this.sentences.forEach((item, index) => {
          let video = document.createElement('video');
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.display = 'none';
          video.controls = true;
          video.autoplay = false;
          if (item != 'interval') {
            video.src = item.filePath;
            video.onloadedmetadata = function (e) {
              this.currentTime = item.startTime;
            };
            let self = this;
            video.ontimeupdate = function (e) {
              if (this.currentTime >= item.endTime) {
                if (this.parentNode) {
                  this.parentNode.removeChild(this);
                  self.showVideo(index + 1);
                }
              }
            };
          } else {
            video.setAttribute('type', 'interval');
          }
          videoElement.appendChild(video);
        });
        this.showVideo(0);
      } else {
        videoElement.childNodes[0].play();
      }
    },
    onPause: function () {
      const videoElement = document.getElementById('video_player_final');
      videoElement.childNodes[0].pause();
      this.videoButtonVisible = true;
    },
    onStop: function () {
      const videoElement = document.getElementById('video_player_final');
      videoElement.childNodes.forEach((node) => {
        node.pause();
      });
      videoElement.innerHTML = '';
      this.videoButtonVisible = true;
      this.isPlayFinished = true;
      this.sentences = [];
    },
    getElementInfo: function (strSpan) {
      let wordItem = [];
      let spanTags = [];
      spanTags = strSpan.split('</span>');
      spanTags.forEach((spanTag) => {
        let spanAttributes = [];
        let word = {};
        spanAttributes = spanTag.split(' ');
        if (spanAttributes[1] === undefined) {
          return;
        }
        // data-type
        if (spanAttributes[1].search('text') === -1) {
          return;
        }
        // data-index
        word.index = spanAttributes[3].split('=')[1];
        // data-elemind
        word.elemInd = spanAttributes[4].split('=')[1];
        // data-ts
        word.startTime = parseFloat(spanAttributes[5].split('=')[1]);
        // data-end-ts
        word.endTime = parseFloat(
          spanAttributes[6]
            .split('=')[1]
            .substr(0, spanAttributes[6].length - 2)
        );
        wordItem.push(word);
      });
      return wordItem;
    },
    showVideo: function (index) {
      const videoElement = document.getElementById('video_player_final');
      this.videoButtonVisible = false;
      if (index >= this.sentences.length) {
        videoElement.innerHTML = '';
        this.videoButtonVisible = true;
        this.isPlayFinished = true;
        return;
      }
      var item = videoElement.firstChild;
      item.style.display = 'inline-block';
      this.curClipIndex = index;
      if (item.getAttribute('type') == 'interval') {
        setTimeout(function () {
          item.style.display = 'none';
          this.showVideo(index + 1);
        }, 1000);
      } else {
        var interval = setInterval(function () {
          if (item.readyState == 4) {
            item.play();
            clearInterval(interval);
          }
        }, 100);
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
