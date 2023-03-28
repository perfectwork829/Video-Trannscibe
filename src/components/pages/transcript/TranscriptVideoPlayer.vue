<template>
  <div class="video_player">
    <video
      v-if="
        transcriptInfo.transcriptItemData &&
        transcriptInfo.transcriptItemData.filePath
      "
      id="video_player"
      ref="video"
      :controls="true"
      :autoplay="false"
      :src="transcriptInfo.transcriptItemData.filePath"
      @seeked="videoSeeked"
      @timeupdate="videoTimeUpdate"
      v-playback-rate="transcriptInfo.video.playbackRate"
      :currentTime="transcriptInfo.video.currentTime"
      disablePictureInPicture
      controlsList="nodownload noremoteplayback noplaybackrate"
    ></video>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { SET_TRANSCRIPT_PROJECT_VIDEOINFO } from 'app/store/transcript.module';

export default {
  name: 'TranscriptVideoPlayer',
  directives: {
    playbackRate(el, binding) {
      el.playbackRate = binding.value;
    },
  },
  computed: {
    ...mapGetters(['transcriptInfo']),
  },
  methods: {
    videoTimeUpdate: function (event) {
      if (event.target.currentTime) {
        this.$store.dispatch(SET_TRANSCRIPT_PROJECT_VIDEOINFO, {
          currentTime: event.target.currentTime,
        });
      }
    },
    videoSeeked: function (event) {
      if (event.target.currentTime) {
        this.$store.dispatch(SET_TRANSCRIPT_PROJECT_VIDEOINFO, {
          currentTime: event.target.currentTime,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.video_player {
  background-color: black;
  video {
    width: 100%;
    height: 100%;
  }
}
</style>
