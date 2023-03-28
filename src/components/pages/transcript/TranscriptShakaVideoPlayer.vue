<template>
  <div ref="videoContainer" class="video_player">
    <video
      v-if="
        transcriptInfo.transcriptItemData &&
        transcriptInfo.transcriptItemData.mpdFilePath
      "
      ref="video"
      :controls="false"
      :autoplay="false"
      @seeked="videoSeeked"
      @timeupdate="videoTimeUpdate"
      @play="onPlay"
      @pause="onPause"
      v-playback-rate="transcriptInfo.video.playbackRate"
      disablePictureInPicture
      controlsList="nodownload noremoteplayback noplaybackrate"
    ></video>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { 
  SET_TRANSCRIPT_INFO, 
  SET_TRANSCRIPT_PROJECT_VIDEOINFO, 
  SWITCH_TRANSCRIPT_PLAYING 
} from 'app/store/transcript.module';
import {
  SWITCH_PAPER_PLAYING
} from 'app/store/paper.module'
export default {
  name: 'TranscriptVideoPlayer',
  directives: {
    playbackRate(el, binding) {
      el.playbackRate = binding.value;
    },
  },
  data: function (){
    return {
      shaka: null,
      monologues: []
    }
  },
  mounted() {
    const manifestUrl = this.getManifestUrl(this.transcriptInfo.transcriptItemData.mpdFilePath)
    this.shaka = require('shaka-player/dist/shaka-player.ui.js');
    this.loadNewVideo(manifestUrl)
  },
  watch: {
    transcriptInfo: function (n, o) {
      this.$refs.video.currentTime = n.video.currentTime
    },
    ['transcriptInfo.video.currentTime']: function (n, o) {
      // this.$refs.video.currentTime = n
    },
    ['transcriptInfo.transcriptItemData.content.monologues']: function (n, o) {
      this.monologues = n;
    },
    isTranscriptPlaying: function(n, o) {
      console.log('new', n)
      if (n) {
        this.$refs.video.play();
      } else {
        this.$refs.video.pause();
      }
    }
  },
  computed: {
    ...mapGetters(['transcriptInfo', 'isTranscriptPlaying']),
  },
  methods: {
    test (event) {
      console.log(event)
    },
    getManifestUrl: function (gsPath) {
      const manifestUrl = gsPath.replace('gs://', 'https://storage.googleapis.com/') + 'manifest.mpd'
      return manifestUrl
    },
    loadNewVideo: function (manifestUrl) {
      // const shaka = require('shaka-player/dist/shaka-player.ui.js');
      const player = new this.shaka.Player(this.$refs.video);
      const ui = new this.shaka.ui.Overlay(
        player,
        this.$refs.videoContainer,
        this.$refs.video
      )
      ui.configure({
        controlPanelElements: ['play_pause', 'time_and_duration', 'mute', 'volume', 'spacer'],
        addSeekBar: true,
        overflowMenuButtons: [],
      })
      ui.getControls();
      // console.log(Object.keys(this.shaka.ui));
      // player.configure({
      //   drm: {
      //     servers: { 'com.widevine.alpha': this.licenseServer }
      //   }
      // });
      // player.load('https://dash.akamaized.net/dash264/TestCases/1c/qualcomm/2/MultiRate.mpd')
      player
        .load(manifestUrl)
        .then(() => {
        })
        .catch(this.onError);
    },
    startTime: function (monologuesItem) {
      let tempTime = 0;
      let checked = false;
      if (Object.keys(monologuesItem).indexOf('elements') >= 0) {
        monologuesItem.elements.forEach((itemElem) => {
          if (checked) return;
          if (itemElem.ts) {
            tempTime = itemElem.ts;
            checked = true;
          }
        });
        return parseFloat(tempTime);
      }
      return 0;
    },
    endTime: function (monologuesItem) {
      let tempTime = 0;
      // let checked = false;
      if (Object.keys(monologuesItem).indexOf('elements') >= 0) {
        for (let i = 0; i< monologuesItem.elements.length; i++) {
          let itemElem = monologuesItem.elements[monologuesItem.elements.length - 1 -i];
          if (itemElem.end_ts) {
            tempTime = itemElem.end_ts;
            break;
          }
        }
        return parseFloat(tempTime);
      }
      return 0;
    },
    skipSilent: function (currentTime) {
      const remainMonologues = this.monologues.filter(it => {
        return this.startTime(it) > currentTime
      });
      if (remainMonologues[0].speaker == 'NO SPEECH/SILENCE'){
        console.log(remainMonologues[0])
        const newTime = this.startTime(remainMonologues[1]);
        // this.$store.dispatch(SET_TRANSCRIPT_PROJECT_VIDEOINFO, {
        //   currentTime: newTime,
        // });
        this.$refs.video.currentTime = newTime;     
      }
      // const n = this.monologues.length;
      // for (let i=0; i< n; i++) {
      //   const sTime = this.startTime(this.monologues[i]);
      //   const eTime = this.endTime(this.monologues[i]);
      //   // const next_sTime = this.startTime(this.monologues[i+1]) || 0;
      //   if (this.monologues[i].speaker == 'NO SPEECH/SILENCE') {
      //     if (currentTime>sTime && currentTime< eTime) {
      //       this.$store.dispatch(SET_TRANSCRIPT_PROJECT_VIDEOINFO, {
      //         currentTime: eTime,
      //       });
      //       this.$refs.video.currentTime = eTime;
      //       break;
      //     }
      //   }
      // }
    },
    videoTimeUpdate: function (event) {
      if (event.target.currentTime) {
        this.$store.dispatch(SET_TRANSCRIPT_PROJECT_VIDEOINFO, {
          currentTime: event.target.currentTime,
        });
        if (this.transcriptInfo.skipSilent) {
          this.skipSilent(event.target.currentTime)
        }
      }
    },
    videoSeeked: function (event) {
      
    },
    onError: function (error) {
      console.error('Error code', error.code, 'object', error)
    },
    onKeyDown: function(event) {
      console.log('shaka with tab', event)
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
@import '../../../../node_modules/shaka-player/dist/controls.css';
.video_player {
  background-color: black;
  video {
    width: 100%;
    height: 100%;
  }
}
</style>
