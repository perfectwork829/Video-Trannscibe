<template>
  <div class="video_player_paperedit">
    <video
      v-if="
        transcriptInfo.transcriptItemData &&
        transcriptInfo.transcriptItemData.filePath
      "
      id="video_player_paperedit"
      :src="transcriptInfo.transcriptItemData.filePath"
      :controls="true"
      :autoplay="false"
      @seeked="videoSeeked"
      @timeupdate="videoTimeUpdate"
      :currentTime="paperInfo.paperEditVideo.currentTime"
      disablePictureInPicture
      controlsList="nodownload noremoteplayback noplaybackrate"
    ></video>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { SET_PAPER_INFO } from 'app/store/paper.module';

export default {
  name: 'VideoPlayerPaperEditWrapper',
  computed: {
    ...mapGetters(['transcriptInfo', 'paperInfo']),
  },
  methods: {
    videoTimeUpdate: function (event) {
      if (event.target.currentTime) {
        this.$store.dispatch(SET_PAPER_INFO, {
          paperEditVideo: {
            currentTime: event.target.currentTime,
          },
        });
      }
    },
    videoSeeked: function (event) {
      if (event.target.currentTime) {
        this.$store.dispatch(SET_PAPER_INFO, {
          paperEditVideo: {
            currentTime: event.target.currentTime,
          },
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
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
