<template>
  <div class="row script_item">
    <div class="col-md-12">
      <div class="sentence-content-wrapper">
        <div class="content" contenteditable="true">
          <template v-for="(item, idx) in items.elements">
            <template v-if="checkSearchElement(item)">
              <svg-star
                :key="`prev-star-${idx}`"
                v-if="isStartStarItem(item, idx)"
              ></svg-star>
              <transcript-item-span
                :key="idx"
                :itemData="item"
                :transcriptIndex="transcriptIndex"
                :dataIndex="dataIndex"
                :dataElemInd="idx"
                :currentTime="currentTime"
                :searched="item.searched"
              ></transcript-item-span>
              <svg-star
                :key="`after-star-${idx}`"
                v-if="isEndStarItem(item, idx)"
              ></svg-star>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import TranscriptItemSpan from "../transcript/TranscriptItemSpan.vue";
import SvgStar from "app/components/sharedComponents/SvgStar.vue";
import { formatTime } from "app/utils";
import { SET_TRANSCRIPT_INFO } from "app/store/transcript.module";
import {
  SET_PAPER_VIDEOINFO,
  SET_PAPER_INFO,
} from "app/store/paper.module";
import { saveContentAPI } from "app/api";
import { PAGES, silentIconStr, starIconStr } from "app/constants/index";
import {
  removeHtmlTags,
  replaceHtmlCharacters,
} from "app/utils";
export default {
  components: {
    TranscriptItemSpan,
    SvgStar,
  },
  name: "TranscriptItem",
  data() {
    return {
      items: {},
      speaker: "",
      pages: PAGES,
      queries: ["birds"],
      description: "Tropical birds scattered as Drake veered the Jeep",
    };
  },
  computed: {
    ...mapGetters(["transcriptInfo", "curPage"]),
  },
  props: {
    transcriptItem: {
      type: String,
    },
    transcriptIndex: {
      type: Number
    },
    dataIndex: {
      type: Number,
    },
    currentTime: {
      type: Number,
      default: 0,
    },
    searchTxt: {
      type: String,
      default: "",
    },
  },
  watch: {
    // transcriptItem: function (n, o) {
    //   if ( n !== o && JSON.parse(n).elements.length === JSON.parse(o).elements.length) {
    //     this.items = JSON.parse(n);
    //   }
    // },
  },
  mounted() {
    this.items = JSON.parse(this.transcriptItem);
    let text = "";
    let candidates = [];
    this.items.elements.forEach((el, i) => {
      text += replaceHtmlCharacters(removeHtmlTags(el.value));

      if (this.searchTxt.toLowerCase().indexOf(text.toLowerCase()) === 0) {
        candidates.push(i);
        if (this.searchTxt.toLowerCase()=== text.toLocaleLowerCase()) {
          candidates.forEach((cd) => {
            this.items.elements[cd].searched = true;
          });
          candidates = [];
          text = "";
        }
      } else if (text.toLowerCase().indexOf(this.searchTxt.toLowerCase()) > -1) {
        // console.log(text.indexOf(this.searchTxt))
        candidates.push(i);
        candidates.forEach(cd => {
          this.items.elements[cd].searched = true;
        });
        candidates = [];
        text = "";
      } else {
        candidates = [];
        text = "";
      }
    });
    // this.items = this.transcriptItem;
    this.speaker = isNaN(this.items.speaker) ? this.items.speaker : "";
  },
  methods: {
    isStarItem: function (itemSpan) {
      return (
        (itemSpan.type === "text" || itemSpan.type === "punct") &&
        itemSpan.tag_type === "strong"
      );
    },
    isStartStarItem: function (itemSpan, idx) {
      if (idx == 0) {
        return this.isStarItem(itemSpan);
      } else
        return (
          !this.isStarItem(this.items.elements[idx - 1]) &&
          this.isStarItem(itemSpan)
        );
    },
    isEndStarItem: function (itemSpan, idx) {
      if (idx == this.items.elements.length - 1)
        return this.isStarItem(itemSpan);
      else
        return (
          !this.isStarItem(this.items.elements[idx + 1]) &&
          this.isStarItem(itemSpan)
        );
    },
    checkSearchElement(item) {
      // if (item.value.includes('test')) return true;
      // return false;
      return true;
    },
    playVideo(items) {
      console.log(items);
    }
  },
};
</script>
<style lang="scss" scoped>
.script_item {
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid lightgray;
  .speaker-list-wrapper {
    padding-left: 10px;
    padding-right: 10px;
    user-select: none;
    input {
      border: none;
      padding-left: 10px;
      padding-right: 10px;
      width: 100%;
      &:hover {
        border: 1px solid lightgray;
        border-radius: 4.5px;
      }
    }
  }
}
</style>

<style lang="scss">
.sentence-content-wrapper {
  .movePosition {
    cursor: pointer;
    font-weight: 500;
    user-select: none;
  }
  padding-right: 15px;
  .content {
    border: none !important;
    outline: none !important;
    user-select: all;
    -ms-user-select: text;
    -webkit-user-select: all;
    -moz-user-select: all;
    // span {
    //   color: gray;
    //   user-select: all;
    //   -ms-user-select: all;
    //   -webkit-user-select: all;
    //   -moz-user-select: all;

    //   &.dark-color {
    //     color: black;
    //   }
    // }
  }
  .peaker-name {
    user-select: none;
    pointer-events: none;
  }

  // .transcript-span-item-wrapper {
  //   border: none !important;
  //   outline: none !important;
  //   color: gray;
  //   // user-select: all;
  //   user-select: auto;
  //   -ms-user-select: text;
  //   // -webkit-user-select: all;
  //   -webkit-user-select: all;
  //   -moz-user-select: all;
  //   svg {
  //     color: gray;
  //   }
  //   &.dark-color {
  //     color: black;
  //     svg {
  //       color: black;
  //     }
  //   }
  //   &.text-span {
  //     margin-right: 0.125em;
  //   }
  // }
}
</style>
