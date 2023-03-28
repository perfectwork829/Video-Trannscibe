<template>
  <div class="w-100">
    <div class="search_player" :style="customStyle" ref="videoContainer">
      <video
        ref="video"
        id="search_player"
        :controls="false"
        :autoplay="false"
        @timeupdate="videoTimeUpdate"
        disablePictureInPicture
        controlsList="nodownload noremoteplayback noplaybackrate"
      ></video>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "SearchPlayer",
  props: {
    customStyle: {
      type: String,
      default: "",
    },
  },
  watch: {
    searchPlayer: async function (n, o) {
      if (n && n.videoPath != o.videoPath) {
        await this.loadNewVideo(this.getManifestUrl(n.videoPath));
        this.$refs.video.currentTime = n.currentTime;
        this.$refs.video.play();
      } else if (n && n.videoPath == o.videoPath) {
        this.$refs.video.currentTime = n.currentTime;
        this.$refs.video.play();
      }
    },
  },
  computed: {
    ...mapGetters(["searchPlayer"]),
  },
  methods: {
    getManifestUrl: function (gsPath) {
      const manifestUrl =
        gsPath.replace("gs://", "https://storage.googleapis.com/") +
        "manifest.mpd";
      return manifestUrl;
    },
    loadNewVideo: async function (manifestUrl) {
      const shaka = require("shaka-player/dist/shaka-player.ui.js");
      const player = new shaka.Player(this.$refs.video);
      const ui = new shaka.ui.Overlay(
        player,
        this.$refs.videoContainer,
        this.$refs.video
      );
      ui.configure({
        controlPanelElements: [
          "play_pause",
          "time_and_duration",
          "mute",
          "volume",
          "spacer",
        ],
        addSeekBar: true,
      });
      // ui.getControls();
      // // console.log(Object.keys(shaka.ui));
      // player.configure({
      //   drm: {
      //     servers: { 'com.widevine.alpha': this.licenseServer }
      //   }
      // });
      // player.load('https://dash.akamaized.net/dash264/TestCases/1c/qualcomm/2/MultiRate.mpd')
      try {
        await player.load(manifestUrl)
      } catch (err){
        console.log('err', err)
      }
    },
    videoTimeUpdate(event) {
      if (event.target.currentTime >= this.searchPlayer.endTime) event.target.pause();
    }
  },
};
</script>

<style lang="scss" scoped>
@import "../../../../node_modules/shaka-player/dist/controls.css";
.search_player {
  width: 100%;
  height: 150px;
  border: 1px solid;
}
#search_player {
  width: 100%;
  height: 100%;
}
</style>
