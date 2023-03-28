<template>
  <span
    :contenteditable="dataType == 'text'?'true':'false'"
    :class="className"
    :data-type="dataType"
    :data-tag-type="dataTagType"
    :transcript-index="transcriptIndex"
    :data-index="dataIndex"
    :data-elemInd="dataElemInd"
    :data-ts="dataTs"
    :data-end-ts="dataEndTs"
    :style="compStyle"
    :data-strike="dataStrike"
    :attr-val="attrVal"
    :data-searched="searched"
    v-html="textValue"
    @click="onClickSpan"
  >
  </span>
  
</template>
<script>
import { mapGetters } from 'vuex';
import { silentIconStr, PAGES } from 'app/constants/index';
import { SET_TRANSCRIPT_INFO } from 'app/store/transcript.module';
import { SET_PAPER_INFO } from 'app/store/paper.module';
export default {
  name: 'TranscriptItemSpan',
  props: {
    transcriptIndex: {
      type: Number,
      default: -1,
    },
    dataIndex: {
      type: Number,
      default: -1,
    },
    dataElemInd: {
      type: Number,
      default: -1,
    },
    itemData: {
      type: Object,
      default: function () {
        return {};
      },
    },
    currentTime: {
      type: Number,
      default: 0,
    },
    page: {
      type: String,
      default: 'transcript'
    },
    searched: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['transcriptInfo', 'curPage']),
    className: function () {
      let className = 'transcript-span-item-wrapper';
      if (this.itemData.type === 'tag') {
        className += ' tag pl-1 pr-1 ml-2 ';
      }
      if (this.itemData.type === 'silent') className += ' text-span';
      if (parseFloat(this.itemData.end_ts) <= this.currentTime)
        className += ' dark-color';
      return className;
    },
    dataType: function () {
      return this.itemData.type || '';
    },
    dataTagType: function () {
      return this.itemData.tag_type || '';
    },
    dataTs: function () {
      return this.itemData.ts || '';
    },
    dataEndTs: function () {
      return this.itemData.end_ts || '';
    },
    dataStrike: function () {
      if (
        (this.itemData.type === 'text' &&
          this.itemData.tag_type === 'strike') ||
        (this.itemData.type === 'punct' && this.itemData.tag_type === 'strike')
      )
        return 1;
      return 0;
    },
    attrVal: function () {
      return this.itemData.attr || '';
    },
    compStyle: function () {
      let styleStr = '';
      if (this.itemData.type === 'text' || this.itemData.type === 'punct') {
        if (this.itemData.tag_type === 'color') {
          styleStr += `background-color: ${this.itemData.attr};`;
        } else if (this.itemData.tag_type === 'strong') {
          styleStr += `font-weight: bold; text-decoration: underline;`;
        } else if (this.itemData.tag_type === 'strike') {
          styleStr += `text-decoration: line-through;`;
        }
        if (this.searched) styleStr+= `background-color: red; color: white`
      }
      return styleStr;
    },
    textValue: function () {
      let returnText = '';
      if (this.itemData.type === 'text' || this.itemData.type === 'punct') {
        returnText = this.itemData.value;
      } else if (this.itemData.type === 'tag') {
        returnText = `<span class="value">${this.itemData.tag_value}</span>`;
      } else if (this.itemData.type === 'silent') {
        returnText = silentIconStr;
      }
      return returnText;
    },
  },
  data: function () {
    return {
      pages: PAGES
    };
  },
  methods: {
    onClickSpan: function(event) {
      if (this.curPage === PAGES.TRANSCRIPT) {
        this.$store.dispatch(SET_TRANSCRIPT_INFO, {
          video: {
            currentTime: this.dataTs - 0, // convert to number in case of string
            playbackRate: this.transcriptInfo.video.playbackRate,
          },
        });
      } else if (this.curPage === PAGES.PAPER_EDIT) {
        this.$store.dispatch(SET_PAPER_INFO, {
          paperEditVideo: {
            currentTime: this.dataTs - 0,
          },
        });
      }
      
    },
    onKeyDown: function(event) {
      console.log('cur page', this.curPage)
      // if (this.curPage == this.pages.PAPER_EDIT) event.preventDefault();
    }
  }
};
</script>

<style lang="scss" scoped>
.transcript-span-item-wrapper {
  border: none !important;
  outline: none !important;
  color: gray;
  // user-select: all;
  user-select: auto;
  -ms-user-select: text;
  // -webkit-user-select: all;
  -webkit-user-select: text;
  -moz-user-select: text;
  svg {
    color: gray;
  }
  &.dark-color {
    color: black;
    svg {
      color: black;
    }
  }
  &.text-span {
    margin-right: 0.125em;
  }
}
</style>
