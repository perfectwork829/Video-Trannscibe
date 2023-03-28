<template>
  <div class="h-100">
    <div class="script_content" id="search_result">
      <div v-for="(transcript, index) in results" :key="search.searchTxt + index">
        <div
          v-for="(item, idx) in transcript.content_detail.monologues"
          :key="idx"
        >
          <div class="mx-2 mt-2" v-if="checkSearchItem(item)">
            <div class="row">
            <div class="col-3">
              <img :src="getThumbnailUrl(transcript.mpdFilePath)" @dblclick="playVideo(transcript.mpdFilePath, item)"/>
            </div>
            <div class="col-9">
              <span class="font-weight-bold font-italic">{{
                getFullPath(transcript)
              }}</span
              ><br />
              <span>{{ meta(item) }}</span
              ><br />
              <span class="speaker"
                >Speaker: {{ isNaN(item.speaker) ? item.speaker : "" }}</span
              >
              <search-item
                :key="idx"
                :transcriptIndex="index"
                :dataIndex="idx"
                :transcriptItem="JSON.stringify(item)"
                :data-index="idx"
                :currentTime="currentTime"
                :searchTxt="search.searchTxt"
              ></search-item>
            </div>
            </div>
          </div>
        </div>
      </div>
        <!-- <div
          v-for="(searched, idx) in searchedArray"
          :key="search.searchTxt + idx"
        >
            <div class="row mx-2 mt-2">
            <div class="col-3">
              <img :src="getThumbnailUrl(searched.transcript.mpdFilePath)"/>
            </div>
            <div class="col-9">
              <span class="font-weight-bold font-italic">
                {{getFullPath(searched.transcript)}}
              </span
              ><br />
              <span>{{ meta(searched.monologue) }}</span
              ><br />
              <span class="speaker"
                >Speaker: {{ isNaN(searched.monologue.speaker) ? searched.monologue.speaker : "" }}</span
              >
              <search-item
                :key="idx"
                :dataIndex="idx"
                :transcriptItem="JSON.stringify(searched.monologue)"
                :data-index="idx"
                :currentTime="currentTime"
              ></search-item>
            </div>
            </div>
        </div> -->
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import SearchItem from "./SearchItem.vue";
import { SET_TRANSCRIPT_PROJECT_VIDEOINFO } from "app/store/transcript.module";
import { SET_SEARCH_PLAYER } from 'app/store/search.module';
import { formatTime } from "app/utils";
export default {
  name: "SearchResult",
  components: {
    SearchItem,
  },
  props: {
    currentTime: {
      type: Number,
      default: 0,
    },
  },
  data: function () {
    return {
      // monologues: [],
      results: [],
      searchedArray: []
    };
  },
  computed: {
    ...mapGetters(["transcriptInfo", "search"]),
  },
  watch: {
    search: {
      handler(newVal, oldVal) {
        this.results = newVal.transcriptData;
        this.searchedArray = [];
        for (const [index, item] of newVal.transcriptData.entries()) {
          for (const [j, monologue] of item.content_detail.monologues.entries()) {
            if (this.checkSearchItem(monologue)) {
              if (item.projectSubName == undefined) item.projectSubName = 'Other';
              const searched = {
                transcript: item,
                monologue: monologue
              };
              if (!item.trash) this.searchedArray.push(searched);
            }
          }
        }
        console.log('searched array', this.searchedArray)
      },
      deep: true,
      // immediate: true
    },
  },
  methods: {
    getStartTime: function (monologuesItem) {
      let sTime = 0;
      let checked = false;
      if (Object.keys(monologuesItem).indexOf("elements") >= 0) {
        monologuesItem.elements.forEach((itemElem) => {
          if (checked) return;
          if (itemElem.ts) {
            sTime = itemElem.ts;
            checked = true;
          }
        });
        return sTime;
      }
      return null;
    },
    getEndTime: function (monologuesItem) {
      let eTime = 0;
      // let checked = false;
      if (Object.keys(monologuesItem).indexOf("elements") >= 0) {
        monologuesItem.elements.forEach((itemElem) => {
          // if (checked) return;
          if (itemElem.end_ts) {
            eTime = itemElem.end_ts;
            // checked = true;
          }
        });
        return eTime;
      }
      return null;
    },
    getSentence: function (monologuesItem) {
      return "";
    },
    checkTranscriptItemVisible: function (item) {
      let bVisible = false;
      const typeOfVal = typeof item;
      if (typeOfVal === "string" && item.includes("elements")) bVisible = true;
      else if (typeOfVal === "object" && Object.keys(item).includes("elements"))
        bVisible = true;
      return bVisible;
    },
    checkSearchItem: function (item) {
      let bVisible = false;
      const typeOfVal = typeof item;
      if (typeOfVal === "object" && Object.keys(item).includes("elements")) {
        let text = "";
        item.elements.forEach((elem) => {
          text += elem.value.toLowerCase();
        });
        if (text.includes(this.search.searchTxt.toLowerCase())) bVisible = true;
        // if (bVisible) console.log("item", item);
      }
      return bVisible;
    },
    getFullPath: function (item) {
      let path =
        item.projectName +
        "/" +
        item.projectSubName +
        "/" +
        item.parentTitle +
        "/" +
        item.title;
      return path;
    },
    meta: function (item) {
      const sTime = this.getStartTime(item);
      const eTime = this.getEndTime(item);
      return `In: ${formatTime(sTime)} Out: ${formatTime(
        eTime
      )} Dur: ${formatTime(eTime - sTime)}`;
    },
    getThumbnailUrl: function (gsPath) {
      const manifestUrl =
        gsPath.replace("gs://", "https://storage.googleapis.com/") +
        "small-sprite-sheet0000000000.jpeg";
      return manifestUrl;
    },
    playVideo: function(gsPath, item){
      // const manifestUrl = gsPath.replace("gs://", "https://storage.googleapis.com/") + 'manifest.mpd';
      const sTime = this.getStartTime(item);
      const eTime = this.getEndTime(item);
      this.$store.dispatch(SET_SEARCH_PLAYER, {
        videoPath: gsPath,
        currentTime: sTime,
        startTime: sTime,
        endTime: eTime
      })
    }
  },
};
</script>

<style lang="scss" scoped>
.script_content {
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  background-color: white;
  color: black;
  font-size: 0.8rem;
}
</style>
