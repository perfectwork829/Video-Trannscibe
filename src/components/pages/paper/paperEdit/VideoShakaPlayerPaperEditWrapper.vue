<template>
<div class="w-100">
  <div class="video_player_paperedit" :style="customStyle"  ref="videoContainer">
    <video
      v-if="
        transcriptInfo.transcriptItemData &&
        transcriptInfo.transcriptItemData.mpdFilePath
      "
      ref="video"
      id="video_player_paperedit"
      :controls="false"
      :autoplay="false"
      @seeked="videoSeeked"
      @timeupdate="videoTimeUpdate"
      @play="onPlay"
      @pause="onPause"
      :currentTime="paperInfo.paperEditVideo.currentTime"
      disablePictureInPicture
      controlsList="nodownload noremoteplayback noplaybackrate"
    ></video>
  </div>
  <div class="video_player_paperedit" style="display:none;" ref="videoContainer2">
    <video
      v-if="
        transcriptInfo.transcriptItemData &&
        transcriptInfo.transcriptItemData.mpdFilePath
      "
      ref="video2"
      id="video_player_paperedit2"
      :controls="false"
      :autoplay="false"
      disablePictureInPicture
      controlsList="nodownload noremoteplayback noplaybackrate"
    ></video>
  </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { 
  SET_PAPER_INFO, 
  SET_PAPER_VIDEOINFO,
  SWITCH_PAPER_PLAYING  
} from 'app/store/paper.module';
import { 
  SWITCH_TRANSCRIPT_PLAYING 
} from 'app/store/transcript.module';
export default {
  name: 'VideoPlayerShakaPaperEditWrapper',
    props: {
    customStyle: {
      type: String,
      default: ''
    }
  },
  watch: {
    transcriptInfo: function(n, o) {
      // if (
      //   this.transcriptInfo.transcriptItemData &&
      //   this.transcriptInfo.transcriptItemData.mpdFilePath
      // ) {
      //   const manifestUrl = this.getManifestUrl(
      //     this.transcriptInfo.transcriptItemData.mpdFilePath
      //   );
      //   this.loadNewVideo(manifestUrl);
      //   this.loadNewVideo2(manifestUrl);
      // }
    },
    ['transcriptInfo.transcriptItemData.mpdFilePath']: function () {
      if (
        this.transcriptInfo.transcriptItemData &&
        this.transcriptInfo.transcriptItemData.mpdFilePath
      ) {
        const manifestUrl = this.getManifestUrl(
          this.transcriptInfo.transcriptItemData.mpdFilePath
        );
        this.loadNewVideo(manifestUrl);
        this.loadNewVideo2(manifestUrl);
      }
    },
    paperInfo: function(n, o) {
      if (n.paperEditVideo.currentTime !== o.paperEditVideo.currentTime) {
        this.$refs.video.currentTime = n.paperEditVideo.currentTime
      }
    },
    isTranscriptPlaying: function(n, o) {
      if (n) {
        if (this.$refs.video) this.$refs.video.play();
      } else {
        if (this.$refs.video) this.$refs.video.pause();
      }
    }
  },
  computed: {
    ...mapGetters(['transcriptInfo', 'paperInfo', 'isTranscriptPlaying']),
  },
  mounted() {
    if (
        this.transcriptInfo.transcriptItemData &&
        this.transcriptInfo.transcriptItemData.mpdFilePath
      ) {
        const manifestUrl = this.getManifestUrl(
          this.transcriptInfo.transcriptItemData.mpdFilePath
        );
        this.loadNewVideo(manifestUrl);
        this.loadNewVideo2(manifestUrl);
      }
  },
  methods: {
    getManifestUrl: function (gsPath) {
      const manifestUrl =
        gsPath.replace('gs://', 'https://storage.googleapis.com/') +
        'manifest.mpd';
      return manifestUrl;
    },
    loadNewVideo: function (manifestUrl) {
      const shaka = require('shaka-player/dist/shaka-player.ui.js');
      const player = new shaka.Player(this.$refs.video);
      const ui = new shaka.ui.Overlay(
        player,
        this.$refs.videoContainer,
        this.$refs.video
      );
      ui.configure({
        controlPanelElements: ['play_pause','time_and_duration', 'mute', 'volume', 'spacer'],
        addSeekBar: true,
      })
      // ui.getControls();
      // // console.log(Object.keys(shaka.ui));
      // player.configure({
      //   drm: {
      //     servers: { 'com.widevine.alpha': this.licenseServer }
      //   }
      // });
      // player.load('https://dash.akamaized.net/dash264/TestCases/1c/qualcomm/2/MultiRate.mpd')
      player
        .load(manifestUrl)
        .then(() => {
          console.log('The video has been loaded');
        })
        .catch(this.onError);
    },
    loadNewVideo2: function (manifestUrl) {
      const shaka = require('shaka-player/dist/shaka-player.ui.js');
      const player = new shaka.Player(this.$refs.video2);
      const ui = new shaka.ui.Overlay(
        player,
        this.$refs.videoContainer2,
        this.$refs.video2
      );
      ui.configure({
        controlPanelElements: ['play_pause', 'mute', 'volume', 'spacer'],
        addSeekBar: true,
      })
      // ui.getControls();
      // // console.log(Object.keys(shaka.ui));
      // player.configure({
      //   drm: {
      //     servers: { 'com.widevine.alpha': this.licenseServer }
      //   }
      // });
      // player.load('https://dash.akamaized.net/dash264/TestCases/1c/qualcomm/2/MultiRate.mpd')
      player
        .load(manifestUrl)
        .then(() => {
          console.log('The video has been loaded');
        })
        .catch(this.onError);
    },
    videoTimeUpdate: function (event) {
      if (event.target.currentTime) {
        console.log('update')
        // this.$store.dispatch(SET_PAPER_INFO, {
        //   paperEditVideo: {
        //     currentTime: event.target.currentTime,
        //   },
        // });
        this.$store.dispatch(SET_PAPER_VIDEOINFO, event.target.currentTime);
      }
    },
    videoSeeked: function (event) {
      if (event.target.currentTime) {
        // this.$store.dispatch(SET_PAPER_INFO, {
        //   paperEditVideo: {
        //     currentTime: event.target.currentTime,
        //   },
        // });
      }
    },
    onPlay: function(event){
      this.$store.dispatch(SWITCH_TRANSCRIPT_PLAYING, true);
      this.$store.dispatch(SWITCH_PAPER_PLAYING, false);
    },
    onPause: function(event){
      this.$store.dispatch(SWITCH_TRANSCRIPT_PLAYING, false);
      // this.$store.dispatch(SWITCH_PAPER_PLAYING, false);
    }
  },
};
</script>

<style lang="scss" scoped>
@import '../../../../../node_modules/shaka-player/dist/controls.css';
.video_player_paperedit {
  width: 100%;
  height: 150px;
  border: 1px solid;
}
#video_player_paperedit {
  width: 100%;
  height: 100%;
}
</style>
