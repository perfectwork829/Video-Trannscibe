<template>
  <div
    class="edmon-btn-dropdown-wrapper strike-dropdown-wrapper"
    v-click-outside="hideDropdown"
  >
    <button
      :class="`btn edmon-dropdown-anchorbtn ${variant}`"
      @click="clickButton"
    >
      <fa-icon :icon="['fas', 'strikethrough']" />
      {{ showText ? "Strike" : "" }}
    </button>
    <ul
      :class="`edmon-dropdown-menu ${
        open ? 'open' : ''
      } dropdown-anchor-${anchorPos}`"
    >
      <li class="item">
        <fa-icon :icon="['fas', 'square']" color="white" />
        Skip Strike
      </li>
      <li
        class="item"
        @click="(event) => onStrike(event, { value: -3, color: '' })"
      >
        <fa-icon :icon="['fas', 'strikethrough']" />
        Strike
      </li>
    </ul>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { SET_TRANSCRIPT_INFO } from "app/store/transcript.module";
import { saveContentAPI } from "app/api";
import { PAGES } from "app/constants/index";

export default {
  name: "StrikeDropdown",
  props: {
    showText: {
      type: Boolean,
      default: false,
    },
    variant: {
      type: String,
      default: "btn-primary",
    },
    anchorPos: {
      type: String,
      default: "left",
    },
  },
  data: function () {
    return {
      open: false,
      selections: null,
    };
  },
  watch: {
    open: function (n) {
      if (!n) this.selections = null;
    }
  },

  computed: {
    ...mapGetters(["transcriptInfo", "curPage"]),
  },
  methods: {
    clickButton: function (event) {
      // event.preventDefault();
      // event.stopPropagation();
      if (this.curPage !== PAGES.TRANSCRIPT) return;
      this.open = !this.open;
      if (this.open) {
        try {
          const selections = window.getSelection();
          if (selections.anchorNode && selections.focusNode) {
            this.startNode = selections.anchorNode.parentNode;
            this.endNode = selections.focusNode.parentNode;
          }
        } catch (err) {
          console.log("Hightlihgt dropdown" + err);
        }
      } else {
        this.startNode = null;
        this.endNode = null;
      }
    },
    onMenu: function (menuItem) {
      this.open = false;
    },
    hideDropdown: function () {
      this.startNode = null;
      this.endNode = null;
      this.open = false;
    },
    onSkipStrike: function () {},
    onStrike: function (event, selectedHighlight) {
      event.preventDefault();
      event.stopPropagation();
      this.open = false;
      const startNodeTemp = this.startNode;
      const endNodeTemp = this.endNode;
      this.startNode = null;
      this.endNode = null;

      if (
        !startNodeTemp ||
        !endNodeTemp ||
        !this.transcriptInfo.content_id ||
        !this.transcriptInfo.transcriptItemData.content
      )
        return;
      console.log('transcript info', this.transcriptInfo);
      try {
        let content = this.transcriptInfo.transcriptItemData.content;

        let firstIndex = startNodeTemp.getAttribute("data-index");
        let firstElemId = startNodeTemp.getAttribute("data-elemind");

        if (!firstIndex) {
          let tmpNode = startNodeTemp.lastElementChild;
          firstIndex = parseInt(tmpNode.getAttribute("data-index"));
          firstElemId = parseInt(tmpNode.getAttribute("data-elemind")) + 1;
          if (content.monologues[firstIndex].elements.length <= firstElemId) {
            firstIndex++;
            firstElemId = 0;
          }
        }

        let secondIndex = endNodeTemp.getAttribute("data-index");
        let secondElemId = endNodeTemp.getAttribute("data-elemind");
        if (secondIndex == undefined) {
          let tmpNode = endNodeTemp.lastElementChild;
          secondIndex = tmpNode.getAttribute("data-index");
          secondElemId = tmpNode.getAttribute("data-elemind");
        }

        let sentence = "";
        let sentenceId = 0;
        let start_time = 0;

        for (var i = firstIndex; i <= secondIndex; i++) {
          let item = content.monologues[i];

          let rowStart = parseInt(i == firstIndex ? firstElemId : 0);
          let rowEnd = parseInt(
            i == secondIndex
              ? secondElemId
              : content.monologues[i].elements.length - 1
          );

          let swap = false;

          if (rowStart > rowEnd) {
            let tmp = rowStart;
            rowStart = rowEnd;
            rowEnd = tmp;
            swap = true;
          }

          for (let j = rowStart; j <= rowEnd; j++) {
            let el = item.elements[j];
            if (selectedHighlight.value == -3) {
              el.tag_type = el.tag_type == "strike" ? "normal" : "strike";
            } else if (selectedHighlight.value == -2) {
              // strong tag must be started and ended at the text to show star correctly
              if (j == rowStart && el.type == "punct") continue;
              if (j == rowEnd && el.type == "punct") continue;
              el.tag_type = "strong";
            } else if (selectedHighlight.value == -1) {
              el.tag_type = "normal";
            } else {
              el.tag_type = "color";
              el.attr = selectedHighlight.color;
            }
          }
        }
        // transcriptItemData.content = JSON.stringify(content);
        // saveContent();
        // refreshTranscriptData(transcriptItemData);
        const data = {
          transcriptItemData: {
            ...this.transcriptInfo.transcriptItemData,
            content: {
              ...this.transcriptInfo.transcriptItemData.content,
              monologues: [...content.monologues],
            },
          },
        };
        this.$store.dispatch(SET_TRANSCRIPT_INFO, data);
        saveContentAPI(this.transcriptInfo.content_id, content);
      } catch (e) {
        alert(e);
      }
    },
  },
};
</script>
