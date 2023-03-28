<template>
  <!-- <div class=""> -->
    
    <div class="script">
      <div class="script_name">
        <p>{{clipName}}</p>
      </div>
      <div class="script_content">
      <div  v-if="monologues && monologues.length > 0" :key="JSON.stringify(monologues)">
        <template v-for="(item, idx) in monologues">
          <template v-if="checkTranscriptItemVisible(item)">
            <transcript-item
              :key="idx"
              :dataIndex="idx"
              :transcriptItem="item"
              :data-index="idx"
              :currentTime="currentTime"
              :page="page"
            ></transcript-item>
          </template>
        </template>
      </div>
      </div>
    </div>
  <!-- </div> -->
</template>

<script>
import { mapGetters } from 'vuex';
import TranscriptItem from './TranscriptItem.vue';
import { SET_TRANSCRIPT_PROJECT_VIDEOINFO } from 'app/store/transcript.module';
import { getFullPath } from 'app/utils'
export default {
  name: 'TranscriptContent',
  components: { TranscriptItem },
  props: {
    currentTime: {
      type: Number,
      default: 0,
    },
    page: {
      type: String,
      default: 'transcript'
    }
  },
  data: function () {
    return {
      monologues: [],
    };
  },
  computed: {
    ...mapGetters(['transcriptInfo']),
    // checkVisible: function () {
    //   if (!this.transcriptInfo.transcriptItemData) return false;
    //   if (!this.transcriptInfo.transcriptItemData.content) return false;
    //   if (!this.transcriptInfo.transcriptItemData.content.monologues)
    //     return false;
    //   return true;
    // },
    clipName: function() {
      if (!this.transcriptInfo.transcriptItemData) return '';
      if (!this.transcriptInfo.transcriptItemData.content) return '';
      if (!this.transcriptInfo.transcriptItemData.content.monologues)
        return '';
      return getFullPath(this.transcriptInfo)
    }
  },
  watch: {
    transcriptInfo: {
      handler(newVal, oldVal) {
        // if (newVal.skipSilent) {
        //   this.skipSilent(newVal.video.currentTime, newVal.transcriptItemData.content.monologues)
        // }
        if (
          newVal &&
          newVal.transcriptItemData &&
          newVal.transcriptItemData.content &&
          newVal.transcriptItemData.content.monologues &&
          newVal !== oldVal
        ) {
          this.monologues = [];
          this.monologues = newVal.transcriptItemData.content.monologues.map(
            (v) => JSON.stringify(v)
          );
        } else {
          if (!newVal || (newVal && !newVal.transcriptItemData) || (newVal && newVal.transcriptItemData && !newVal.transcriptItemData.content)) this.monologues = [];
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getStartTime: function (monologuesItem) {
      let sTime = 0;
      let checked = false;
      if (Object.keys(monologuesItem).indexOf('elements') >= 0) {
        monologuesItem.elements.forEach((itemElem) => {
          if (checked) return;
          if (itemElem.ts) {
            sTime = itemElem.ts;
            checked = true;
          }
        });
        return {
          startTime: sTime,
        };
      }
      return null;
    },
    getSentence: function (monologuesItem) {
      return '';
    },
    checkTranscriptItemVisible: function (item) {
      let bVisible = false;
      const typeOfVal = typeof item;
      if (typeOfVal === 'string' && item.includes('elements')) bVisible = true;
      else if (typeOfVal === 'object' && Object.keys(item).includes('elements'))
        bVisible = true;
      return bVisible;
    },
  },
};
</script>

<style lang="scss" scoped>
.pb-7 {
  padding-bottom: 4rem !important
}
.script {
  height: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
  .script_name {
    height: 3rem;
  }
  .script_content {
    height: calc( 100% - 3rem);
      overflow-x: hidden;
    overflow-y: scroll;
    background-color: white;
    color: black;
    font-size: 0.8rem;
  }
}

</style>
