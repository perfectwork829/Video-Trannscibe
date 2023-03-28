<template>
  <div
    class="edmon-btn-dropdown-wrapper highlight-dropdown-wrapper"
    v-click-outside="hideDropdown"
  >
    <button
      :class="`btn edmon-dropdown-anchorbtn ${variant}`"
      @click="clickButton"
    >
      <fa-icon :icon="['fas', 'pen-alt']" />
      {{ showText ? "Highlight" : "" }}
    </button>
    <ul
      :class="`edmon-dropdown-menu ${
        open ? 'open' : ''
      } dropdown-anchor-${anchorPos}`"
    >
      
      <li class="item" @click="onMenu({ value: -2, color: '' })">
        <fa-icon :icon="['fas', 'star']" color="white" />
        Star
      </li>
      <li
        class="item"
        v-for="(item, idx) in menus"
        :key="idx"
        @click="onMenu({ value: item.name, color: item.color })"
      >
        <fa-icon :icon="['fas', 'square']" :color="item.color" />
        {{ item.name }}
      </li>
      <li class="item" @click="onGlobalMenu(1)">
        <fa-icon :icon="['fas', 'square']" color="white" />
        Clear All Highlights
      </li>
      <li class="item" @click="onGlobalMenu(2)">
        <fa-icon :icon="['fas', 'square']" color="white" />
        Clear All Stars
      </li>
      <li class="item" @click="onMenu({ value: -1, color: '' })">
        <fa-icon :icon="['fas', 'square']" color="white" />
        Clear Selected
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
  name: "HightlightDropdown",
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
      menus: [
        { name: "Yellow", color: "#FFEAA0" },
        { name: "Green", color: "#C0DAA0" },
        { name: "Blue", color: "#C2DDFF" },
        { name: "Red", color: "#FFA8BD" },
        { name: "Brown", color: "#A52A2A" },
        { name: "Pink", color: "#FFC0CB" },
      ],
      open: false,
      startNode: null,
      endNode: null,
    };
  },
  computed: {
    ...mapGetters(["transcriptInfo", "curPage"]),
  },
  methods: {
    clickButton: function (event) {
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
    hideDropdown: function () {
      this.open = false;
      this.startNode = null;
      this.endNode = null;
    },
    onMenu: function (selectedHighlight) {
      this.open = false;
      console.log('current page', this.curPage)
      if (this.curPage !== PAGES.TRANSCRIPT) return;

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

        firstIndex = parseInt(firstIndex);
        firstElemId = parseInt(firstElemId);

        let secondIndex = endNodeTemp.getAttribute("data-index");
        let secondElemId = endNodeTemp.getAttribute("data-elemind");
        
        if (secondIndex == undefined || secondIndex == null) {
          // let tmpNode = endNodeTemp.lastElementChild;
          let tmpNode = endNodeTemp.firstElementChild.lastElementChild;
          
          if (tmpNode == null) {
            tmpNode = window.getSelection().focusNode.lastElementChild.parentNode.lastElementChild

          }
          secondIndex = tmpNode.getAttribute("data-index");
          secondElemId = tmpNode.getAttribute("data-elemind");
        }
        secondIndex = parseInt(secondIndex);
        secondElemId = parseInt(secondElemId);
        for (var i = firstIndex; i <= secondIndex; i++) {
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
            if (selectedHighlight.value == -3) {
              content.monologues[i].elements[j].tag_type =
                content.monologues[i].elements[j].tag_type == "strike"
                  ? "normal"
                  : "strike";
            } else if (selectedHighlight.value == -2) {
              // strong tag must be started and ended at the text to show star correctly
              if (
                j == rowStart &&
                content.monologues[i].elements[j].type == "punct"
              )
                continue;
              if (
                j == rowEnd &&
                content.monologues[i].elements[j].type == "punct"
              )
                continue;
              content.monologues[i].elements[j].tag_type = "strong";
            } else if (selectedHighlight.value == -1) {
              content.monologues[i].elements[j].tag_type = "normal";
            } else {
              content.monologues[i].elements[j].tag_type = "color";
              content.monologues[i].elements[j].attr = selectedHighlight.color;
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
    onGlobalMenu: function(mode) {
      const content = this.transcriptInfo.transcriptItemData.content
      content.monologues.forEach(monologue => {
        monologue.elements && monologue.elements.forEach(elm => {
          if (mode === 1) { // remove highlights
            if(elm.tag_type == 'color') elm.tag_type = "normal";
          }
          if (mode === 2) { // remove starts
            if (elm.tag_type == 'strong') elm.tag_type = "normal";
          }
        })
      })
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
    }
  },
};
</script>
