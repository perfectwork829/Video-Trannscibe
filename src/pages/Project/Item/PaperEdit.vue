<template>
  <div class="row page-content paperedit-page-wrapper">
    <div class="col-md-3">
      <folder-tab page="paperedit"></folder-tab>
    </div>
    <div class="col-md-9">
      <div id="paperedit_transcript" class="row">
        <div class="col-md-6 d-flex flex-column">
          <div class="d-flex w-100 justify-content-center">
            <video-shaka-player-paper-edit-wrapper />
          </div>
          <div class="btn-ctrl-wrapper mt-3">
            <add-paper-edit-dropdown
              :variant="`btn-outline-primary`"
              :showText="true"
            />
          </div>

          <transcript-content
            class="w-100 mt-3"
            :currentTime="paperInfo.paperEditVideo.currentTime"
          />
        </div>
        <div class="col-md-6 d-flex flex-column">
          <video-shaka-player-final class="w-100" />
          <clip-container class="w-100 mt-3 h-100 overflow-hidden" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>

import { mapGetters } from 'vuex';
import FolderTab from 'app/components/sharedComponents/folderTab/FolderTab.vue';
// import HighlightDropdown from 'app/components/sharedComponents/HighlightDropdown.vue';
// import StrikeDropdown from 'app/components/sharedComponents/StrikeDropdown.vue';
import AddPaperEditDropdown from 'app/components/sharedComponents/AddPaperEditDropdown.vue';
import TranscriptContent from 'app/components/pages/transcript/TranscriptContent.vue';
import ClipContainer from 'app/components/pages/paper/paperEdit/ClipContainer.vue';
import VideoShakaPlayerPaperEditWrapper from 'app/components/pages/paper/paperEdit/VideoShakaPlayerPaperEditWrapper.vue';
// import SettingDropdown from 'app/components/pages/paper/paperEdit/SettingDropdown.vue';
// import SearchInput from 'app/components/pages/paper/paperEdit/SearchInput.vue';
import VideoShakaPlayerFinal from 'app/components/pages/paper/paperEdit/VideoShakaPlayerFinal.vue';
import { SET_PAPER_INFO } from 'app/store/paper.module';
import { SET_CUR_PAGE } from 'app/store/page.module';
import { PAGES } from 'app/constants/index';
export default {
  name: 'PaperEdit',
  components: {
    // CustomTree,
    FolderTab,
    VideoShakaPlayerPaperEditWrapper,
    ClipContainer,
    TranscriptContent,
    // HighlightDropdown,
    // StrikeDropdown,
    AddPaperEditDropdown,
    // SettingDropdown,
    // SearchInput,
    VideoShakaPlayerFinal
  },
  computed: {
    ...mapGetters(['paperInfo']),
  },
  data: function() {
    return {
      nodes: [
        {title: 'Item1', isLeaf: true},
        {title: 'Item2', isLeaf: true, data: { visible: false }},
        {title: 'Folder1'},
        {
          title: 'Folder2', isExpanded: true, children: [
            {title: 'Item3', isLeaf: true},
            {title: 'Item4', isLeaf: true}
          ]
        }
      ]
    }

  },
  created() {
    console.log('paper edit')
    this.$store.dispatch(SET_CUR_PAGE, PAGES.PAPER_EDIT);
  },
  destroyed: function () {
    this.$store.dispatch(SET_PAPER_INFO, {
      paperEditVideo: {
        currentTime: 0,
      },
    });
  },
};
</script>

<style lang="scss" scoped>

.paperedit-page-wrapper {
  > .col-md-3 {
    height: 100%;
  }
  > .col-md-9 {
    height: 100%;
  }
}
</style>

<style lang="scss">
#paperedit_transcript {
  height: 100%;
  > .col-md-6 {
    height: 100%;
  }
  .btn-ctrl-wrapper {
    display: flex;
    width: 100%;
    .edmon-btn-dropdown-wrapper {
      flex: 1 1 auto;
      .edmon-dropdown-anchorbtn {
        width: 100%;
      }
    }
    .setting-dropdown-wrapper {
      flex: 0 1 auto;
    }
  }

  .speaker-list-wrapper {
    user-select: none;
    pointer-events: none;
    input {
      user-select: none;
      pointer-events: none;
    }
  }
}
</style>
