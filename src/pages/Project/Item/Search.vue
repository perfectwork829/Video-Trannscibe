<template>
  <div
    id="advanced-search-page"
    class="row page-content advanced-search-page-wrapper"
  >
    <div class="col-md-3 h-100">
      <search-folder-tab></search-folder-tab>
    </div>
    <div class="col-md-9 h-100">
      <div class="row h-100">
        <div class="col-md-6 left-section h-100">
          <div class="row search-video-wrapper">
            <div class="col-12 h-150px">
              <search-player></search-player>
            </div>
            <div class="col-12 my-3">
              <b-button variant="primary" @click="addToPaper"
                >Add to Paper Edit</b-button
              >
            </div>
          </div>
          <div class="row transcript-content-row">
            <div class="col-12 h-100">
              <search-result></search-result>
              <!-- <transcript-content class="w-100 mt-3"></transcript-content> -->
            </div>
          </div>
        </div>
        <div class="col-md-6 h-100">
          <div class="d-flex flex-column h-100">
            <video-shaka-player-final
              class="video-shaka-player-wrapper"
            ></video-shaka-player-final>
            <clip-container
              ref="clip_container"
              class="clip-container-wrapper mt-3"
            ></clip-container>
          </div>
        </div>
      </div>
    </div>
    <transition name="fade">
      <pre-loader v-if="search.loading"></pre-loader>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import SearchFolderTab from "app/components/sharedComponents/folderTab/SearchFolderTab.vue";
// import VideoPlayerShakaPaperEditWrapper from 'app/components/pages/paper/paperEdit/VideoShakaPlayerPaperEditWrapper.vue';
// import TranscriptContent from 'app/components/pages/transcript/TranscriptContent.vue';
import VideoShakaPlayerFinal from "app/components/pages/paper/paperEdit/VideoShakaPlayerFinal.vue";
import ClipContainer from "app/components/pages/paper/paperEdit/ClipContainer.vue";
import PreLoader from "app/components/sharedComponents/PreLoader.vue";
import SearchResult from "app/components/pages/search/SearchResult.vue";
import SearchPlayer from "app/components/pages/search/SearchPlayer.vue";
import { SET_CUR_PAGE } from "app/store/page.module";
import { PAGES } from "app/constants/index";
export default {
  components: {
    SearchFolderTab,
    SearchPlayer,
    // VideoPlayerShakaPaperEditWrapper,
    // TranscriptContent,
    VideoShakaPlayerFinal,
    ClipContainer,
    PreLoader,
    SearchResult,
  },
  name: "Search",
  computed: {
    ...mapGetters(["search", "transcriptInfo"]),
  },
  mounted() {
    this.$store.dispatch(SET_CUR_PAGE, PAGES.SEARCH);
  },
  methods: {
    addToPaper() {
      this.$refs.clip_container.addAllSearch()
    },
  },
};
</script>

<style lang="scss" scoped>
#advanced-search-page {
  .video-shaka-player-wrapper {
    flex-grow: 0;
  }
  .clip-container-wrapper {
    width: 100%;
    flex: 1 1 100%;
  }
  .left-section {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    > .search-video-wrapper {
      flex: 0 0 150px;
    }
    .transcript-content-row {
      flex: 1 1 100%;
      overflow: hidden;
    }
  }
}
</style>
