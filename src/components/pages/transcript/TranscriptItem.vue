<template>
  <div class="row script_item" v-if="startTime.number">
    <div class="col-md-3">
      <div class="speaker-list-wrapper">
        <template v-if="page === 'transcript'">
          <input
            list="speaker-list"
            class="speaker from-control"
            style="height: 24px; background-color: #fff"
            :data-speaker="items.speaker"
            :placeholder="
              isNaN(items.speaker)
                ? items.speaker
                : 'Speaker ' + (parseInt(items.speaker) + 1)
            "
            v-model="speaker"
            :diabled="
              items.speaker == 'NO SPEECH/SILENCE' ||
              curPage === pages.TRANSCRIPT
                ? true
                : false
            "
            @blur="onChangeSpeakerList"
          />
          <datalist id="speaker-list">
            <template
              v-if="
                !!transcriptInfo.transcriptItemData.participants &&
                transcriptInfo.transcriptItemData.participants.length > 0
              "
            >
              <option
                v-for="(itemParticipant, idxOne) in transcriptInfo
                  .transcriptItemData.participants"
                :value="itemParticipant"
                :key="`participants-${idxOne}`"
              >
                {{ itemParticipant }}
              </option>
            </template>
            <template
              v-for="(itemParticipant, idxOne) in transcriptInfo.participants"
            >
              <option
                v-if="
                  !transcriptInfo.transcriptItemData.participants ||
                  transcriptInfo.transcriptItemData.participants.indexOf(
                    itemParticipant
                  ) < 0
                "
                :key="`transcriptItemData-participants-${idxOne}`"
                :value="itemParticipant"
              >
                {{ itemParticipant }}
              </option>
            </template>
          </datalist>
        </template>
        <template v-else>
          <div class="speaker-name">
            {{ isNaN(items.speaker) ? items.speaker : "" }}
          </div>
        </template>
      </div>
    </div>
    <div class="col-md-9">
      <div class="sentence-content-wrapper">
        <a
          href="#"
          class="movePosition"
          :value="startTime.string"
          @click="onMovePosition"
        >
          {{ startTime.string }}
        </a>
        <template
          v-if="
            items.speaker === 'NO SPEECH/SILENCE' ||
            curPage === pages.TRANSCRIPT ||
            curPage === pages.PAPER_EDIT
          "
        >
          <div
            class="content"
            contenteditable="true"
            @keydown="onKeyDown"
            @blur="blurContent"
          >
            <template v-for="(item, idx) in items.elements">
              <svg-star
                :key="`prev-star-${idx}`"
                v-if="isStartStarItem(item, idx)"
              ></svg-star>
              <transcript-item-span
                :key="idx"
                :itemData="item"
                :dataIndex="dataIndex"
                :dataElemInd="idx"
                :currentTime="currentTime"
                :page="page"
              ></transcript-item-span>
              <svg-star
                :key="`after-star-${idx}`"
                v-if="isEndStarItem(item, idx)"
              ></svg-star>
            </template>
          </div>
        </template>
        <!-- <template v-if="curPage === pages.PAPER_EDIT">
          <div
            class="content"
          >
            <template v-for="(item, idx) in items.elements">
              <svg-star
                :key="`prev-star-${idx}`"
                v-if="isStartStarItem(item, idx)"
              ></svg-star>
              <transcript-item-span
                :key="idx"
                :itemData="item"
                :dataIndex="dataIndex"
                :dataElemInd="idx"
                :currentTime="currentTime"
              ></transcript-item-span>
              <svg-star
                :key="`after-star-${idx}`"
                v-if="isEndStarItem(item, idx)"
              ></svg-star>
            </template>
          </div>
        </template> -->
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import TranscriptItemSpan from "./TranscriptItemSpan.vue";
import SvgStar from "app/components/sharedComponents/SvgStar.vue";
import { formatTime } from "app/utils";
import { SET_TRANSCRIPT_INFO } from "app/store/transcript.module";
import {
  SET_PAPER_VIDEOINFO,
  SET_PAPER_INFO,
} from "app/store/paper.module";
import { saveContentAPI } from "app/api";
import { PAGES, silentIconStr, starIconStr } from "app/constants/index";
import { removeHtmlTags, replaceHtmlCharacters } from "app/utils";
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
      lineBreak: false,
    };
  },
  computed: {
    ...mapGetters(["transcriptInfo", "curPage"]),
    startTime: function () {
      try {
        let tempTime = 0;
        let checked = false;
        if (Object.keys(this.items).indexOf("elements") >= 0) {
          this.items.elements.forEach((itemElem) => {
            if (checked) return;
            if (itemElem.ts) {
              tempTime = itemElem.ts;
              checked = true;
            }
          });
          return { number: tempTime, string: formatTime(tempTime) };
        }
        return "";
      } catch (err) {
        console.log("TranscriptItem: startTime computed error");
        return "";
      }
    },
    // renderSentence: function () {
    //   let isStar = false;
    //   let sentence = '';
    //   let searchSentence = '';
    //   try {
    //     if (!this.items.elements) return '';
    //     this.items.elements.forEach((el, elemInd) => {
    //       if (el.type == 'text') {
    //         sentence +=
    //           '<span data-type="text"' +
    //           `class="${this.getClassName(el)}"` +
    //           ' data-index=' +
    //           this.dataIndex +
    //           ' data-elemInd=' +
    //           elemInd +
    //           ' data-ts=' +
    //           el.ts +
    //           ' data-end-ts=' +
    //           el.end_ts;
    //         if (el.tag_type == 'color') {
    //           sentence += " style='background-color: " + el.attr + "'";
    //         } else if (el.tag_type == 'strong') {
    //           sentence +=
    //             " style='font-weight: bold;text-decoration: underline;'";
    //         } else if (el.tag_type == 'strike') {
    //           sentence += " data-strike='1'";
    //           sentence += " style='text-decoration: line-through;'";
    //         }
    //         sentence += '>';
    //         if (el.tag_type == 'strong' && !isStar) {
    //           sentence +=
    //             "<svg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='star' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512' color='black' class='svg-inline--fa fa-star fa-w-18'><path data-v-f7dda52c='' fill='currentColor' d='M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z' class=''></path></svg>";
    //           isStar = true;
    //         }
    //         sentence += el.value;
    //         // if (el.tag_type == 'strong') {
    //         //     sentence += "<i class='fa fa-star' style='font-size:10px'></i>";
    //         // }
    //         sentence += '</span>';
    //       } else if (el.type == 'punct') {
    //         if (el.tag_type != 'strong' && isStar) {
    //           sentence +=
    //             "<svg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='star' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512' color='black' class='svg-inline--fa fa-star fa-w-18'><path data-v-f7dda52c='' fill='currentColor' d='M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z' class=''></path></svg>";
    //           isStar = false;
    //         }

    //         sentence +=
    //           '<span class="' +
    //           this.getClassName(el.ts) +
    //           '" data-type="punct"' +
    //           ' data-index=' +
    //           this.dataIndex +
    //           ' data-elemInd=' +
    //           elemInd;
    //         if (el.tag_type == 'color') {
    //           sentence += " style='background-color: " + el.attr + "'";
    //         } else if (el.tag_type == 'strong') {
    //           sentence +=
    //             " style='font-weight: bold;text-decoration: underline;'";
    //         } else if (el.tag_type == 'strike') {
    //           sentence += " data-strike='1'";
    //           sentence += " style='text-decoration: line-through;'";
    //         }
    //         sentence += '>' + el.value + '</span>';
    //       } else if (el.type == 'tag') {
    //         sentence +=
    //           "<span class='tag pl-1 pr-1 ml-2 " +
    //           this.getClassName(el.ts) +
    //           "' data-type=" +
    //           el.type +
    //           ' data-tag-type' +
    //           el.tag_type +
    //           ' data-index=' +
    //           this.dataIndex +
    //           " contenteditable='false'" +
    //           ' data-elemInd=' +
    //           elemInd +
    //           " contenteditable='false'" +
    //           '>' +
    //           el.tag_type +
    //           " - <span class='value'>" +
    //           el.tag_value +
    //           '</span>' +
    //           '</span>';
    //       } else if (el.type == 'silent') {
    //         sentence +=
    //           '<span ' +
    //           "class='text-span " +
    //           this.getClassName(el.ts) +
    //           "' " +
    //           'data-type=' +
    //           el.type +
    //           ' data-index=' +
    //           this.dataIndex +
    //           ' data-elemInd=' +
    //           elemInd +
    //           ' data-ts=' +
    //           el.ts +
    //           ' data-end-ts=' +
    //           el.end_ts +
    //           '>' +
    //           '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="stop-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-stop-circle fa-w-16"><path data-v-f7dda52c="" fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm96 328c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V176c0-8.8 7.2-16 16-16h160c8.8 0 16 7.2 16 16v160z" class=""></path></svg>' +
    //           '</span>';
    //       }
    //       searchSentence += el.value;
    //     });
    //   } catch (err) {
    //     console.log('TranscriptItem: Render sentence error in');
    //   }
    //   return sentence;
    // },
  },
  props: {
    transcriptItem: {
      type: String,
    },
    dataIndex: {
      type: Number,
    },
    currentTime: {
      type: Number,
      default: 0,
    },
    page: {
      type: String,
      default: "transcript",
    },
  },
  watch: {
    transcriptItem: function (n, o) {
      if (
        n !== o &&
        JSON.parse(n).elements.length === JSON.parse(o).elements.length
      ) {
        this.items = JSON.parse(n);
      }
      // if ( n !== o && n.elements.length === o.elements.length) {
      //   this.items = n;
      // }
    },
  },
  mounted() {
    this.items = JSON.parse(this.transcriptItem);
    // this.items = this.transcriptItem;
    this.speaker = isNaN(this.items.speaker) ? this.items.speaker : "";
  },
  methods: {
    getClassName: function (spanEl) {
      if (!spanEl || !spanEl.end_ts) return "";
      if (parseFloat(spanEl.end_ts) <= this.currentTime) return "dark-color";
      else return "";
    },
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
    // getSentence: function () {},
    onMovePosition: function (event) {
      event.preventDefault();
      // let element = document.getElementById('video_player');
      // if (element) {
      //   element.currentTime = this.items.elements[0].ts;
      // }
      if (this.curPage === PAGES.TRANSCRIPT) {
        this.$store.dispatch(SET_TRANSCRIPT_INFO, {
          video: {
            currentTime: this.startTime.number - 0, // convert to number in case of string
            playbackRate: this.transcriptInfo.video.playbackRate,
          },
        });
      } else if (this.curPage == PAGES.PAPER_EDIT) {
        console.log("paper edit move");
        this.$store.dispatch(SET_PAPER_INFO, {
          paperEditVideo: {
            currentTime: this.startTime.number - 0,
          },
        });
        // this.$store.dispatch(SET_PAPER_VIDEOINFO, this.startTime.number - 0);
      }

      // $("#transcript_window .script_item span").css("color", "gray");
      // $(this).closest("#transcript_window .script_item").prevAll().find("span").css("color", "black");
    },
    onChangeSpeakerList: function (event) {
      if (this.page !== "transcript") return;
      console.log("current speaker", this.items.speaker);
      const new_speaker = event.target.value;
      if (
        !this.transcriptInfo.transcriptItemData.participants ||
        !this.transcriptInfo.transcriptItemData.participants.length
      ) {
        this.transcriptInfo.transcriptItemData.participants = [];
        this.transcriptInfo.transcriptItemData.participants.push(new_speaker);
      } else if (
        this.transcriptInfo.transcriptItemData.participants.indexOf(
          new_speaker
        ) < 0
      ) {
        this.transcriptInfo.transcriptItemData.participants.push(new_speaker);
      }
      this.$store.dispatch(SET_TRANSCRIPT_INFO, {
        transcriptItemData: {
          ...this.transcriptInfo.transcriptItemData,
          content: {
            ...this.transcriptInfo.transcriptItemData.content,
            monologues:
              this.transcriptInfo.transcriptItemData.content.monologues.map(
                (item, idx) => {
                  if (idx === this.dataIndex) {
                    return {
                      ...item,
                      speaker: new_speaker,
                    };
                  } else if (
                    item.speaker == this.items.speaker &&
                    !isNaN(item.speaker)
                  ) {
                    return {
                      ...item,
                      speaker: new_speaker,
                    };
                  }
                  return item;
                }
              ),
          },
        },
      });
      saveContentAPI(
        this.transcriptInfo.content_id,
        this.transcriptInfo.transcriptItemData.content
      );
    },
    blurContent: function (event) {
      event.preventDefault();
      if (this.lineBreak) {
        this.lineBreak = false;
        return;
      }
      if (this.curPage !== PAGES.TRANSCRIPT) return;
      try {
        // const selection = document.getSelection();
        // var node = selection.anchorNode.parentNode;
        // const subIndex = node.getAttribute('data-elemind');
        let monologues = [
          ...this.transcriptInfo.transcriptItemData.content.monologues,
        ];

        // let originContent =
        //   monologues[this.dataIndex].elements[parseInt(subIndex)].value;
        // let newContent = node.innerHTML;
        // if (originContent === newContent) return;

        const contentSpans = event.target.getElementsByClassName(
          "transcript-span-item-wrapper"
        );
        let originContent = monologues[this.dataIndex].elements
          .map((item) => item.value)
          .join("");

        let newContent = [];
        for (let i = 0; i < contentSpans.length; i++) {
          let contentSpanItem = contentSpans[i];
          newContent.push(contentSpanItem.innerHTML);
        }

        newContent = newContent.join("");

        if (originContent === newContent) return;

        const monologueElement = [];

        for (let i = 0; i < contentSpans.length; i++) {
          let contentSpanItem = contentSpans[i];
          let spanItem = {};
          spanItem.type = contentSpanItem.getAttribute("data-type") || "";
          spanItem.value =
            replaceHtmlCharacters(contentSpanItem.innerHTML) || "";
          spanItem.ts = contentSpanItem.getAttribute("data-ts") || "";
          spanItem.end_ts = contentSpanItem.getAttribute("data-end-ts") || "";
          spanItem.tag_type =
            contentSpanItem.getAttribute("data-tag-type") || "";
          if (spanItem.type === "tag")
            spanItem.tag_value = replaceHtmlCharacters(
              contentSpanItem.innerHTML
            );

          const item_array = spanItem.value.split(/\s{1,}/);
          // console.log('item', item_array)
          if (spanItem.type == "text" && item_array.length > 1) {
            // add new word to text item
            const new_count = item_array.length;
            let new_start_ts = parseFloat(spanItem.end_ts);
            let new_end_ts = parseFloat(spanItem.end_ts);

            for (let j = i + 1; j < contentSpans.length; j++) {
              if (
                contentSpans[j] &&
                contentSpans[j].getAttribute("data-ts") &&
                !isNaN(contentSpans[j].getAttribute("data-ts"))
              ) {
                new_end_ts = parseFloat(
                  contentSpans[j].getAttribute("data-ts")
                );
                break;
              }
            }

            let new_ts_interval = (new_end_ts - new_start_ts) / (new_count - 1);
            spanItem.value = item_array[0];
            monologueElement.push(spanItem);
            for (let j = 1; j < new_count; j++) {
              const punctItem = {
                type: "punct",
                value: " ",
                ts: null,
                end_ts: null,
              };
              monologueElement.push(punctItem);
              // console.log('item', item_array[j])
              const newSpanItem = {
                type: spanItem.type,
                value: item_array[j],
                ts: new_start_ts,
                end_ts: new_start_ts + new_ts_interval,
              };
              new_start_ts += new_ts_interval;
              monologueElement.push(newSpanItem);
            }
          } else if (
            spanItem.type == "punct" &&
            item_array.length > 1 &&
            spanItem.value.replace(/\s/g, "").length
          ) {
            // add new word to punct item
            let new_count = 0;
            let real_words = [];
            item_array.forEach((it) => {
              if (it != "") {
                new_count++;
                real_words.push(it);
              }
            });
            let new_start_ts = null;
            let new_end_ts = null;
            for (let j = i - 1; j >= 0; j--) {
              if (
                contentSpans[j] &&
                contentSpans[j].getAttribute("data-end-ts") &&
                !isNaN(contentSpans[j].getAttribute("data-end-ts"))
              ) {
                new_start_ts = parseFloat(
                  contentSpans[j].getAttribute("data-end-ts")
                );
                break;
              }
            }
            for (let j = i + 1; j < contentSpans.length; j++) {
              if (
                contentSpans[j] &&
                contentSpans[j].getAttribute("data-ts") &&
                !isNaN(contentSpans[j].getAttribute("data-ts"))
              ) {
                new_end_ts = parseFloat(
                  contentSpans[j].getAttribute("data-ts")
                );
                break;
              }
            }
            let new_ts_interval = (new_end_ts - new_start_ts) / new_count;

            if (item_array[0] == "") {
              spanItem.value = " ";
              monologueElement.push(spanItem);
            }
            for (let j = 0; j < new_count; j++) {
              const newSpanItem = {
                type: "text",
                value: real_words[j],
                ts: new_start_ts,
                end_ts: new_start_ts + new_ts_interval,
              };
              new_start_ts += new_ts_interval;
              monologueElement.push(newSpanItem);
              if (j < new_count - 1) {
                const punctItem = {
                  type: "punct",
                  value: " ",
                  ts: null,
                  end_ts: null,
                };
                monologueElement.push(punctItem);
              }
            }
            if (item_array[item_array.length - 1] == "") {
              monologueElement.push(spanItem);
            }
          } else {
            monologueElement.push(spanItem);
          }
        }
        monologues = [
          ...monologues.map((item, idx) => {
            if (idx === this.dataIndex)
              return {
                ...item,
                elements: [...monologueElement],
              };
            return item;
          }),
        ];

        const data = {
          transcriptItemData: {
            ...this.transcriptInfo.transcriptItemData,
            content: {
              ...this.transcriptInfo.transcriptItemData.content,
              monologues: [...monologues],
            },
          },
        };

        this.$store.dispatch(SET_TRANSCRIPT_INFO, data);
        saveContentAPI(this.transcriptInfo.content_id, {
          ...this.transcriptInfo.transcriptItemData.content,
          monologues: [...monologues],
        });
      } catch (err) {
        console.log(err);
      }
    },
    getRenderSpanItem() {
      let innerHtml = "";
      if (!this.items.elements || this.items.elements.length === 0)
        return innerHtml;

      this.items.elements.forEach((item, idx) => {
        let className = "transcript-span-item-wrapper";
        if (item.type === "tag") {
          className += " tag pl-1 pr-1 ml-2 ";
        }
        if (item.type === "silent") className += " text-span";
        if (parseFloat(item.end_ts) <= this.currentTime)
          className += " dark-color";

        let dataType = item.type || "";
        let dataTagType = item.tag_type || "";
        let dataTs = item.ts || "";

        let dataEndTs = item.end_ts || "";
        let dataStrike = 0;
        if (
          (item.type === "text" && item.tag_type === "strike") ||
          (item.type === "punct" && item.tag_type === "strike")
        )
          dataStrike = 1;

        let attrVal = item.attr || "";

        let compStyle = "";
        if (item.type === "text" || item.type === "punct") {
          if (item.tag_type === "color") {
            compStyle += `background-color: ${item.attr};`;
          } else if (item.tag_type === "strong") {
            compStyle += `font-weight: bold; text-decoration: underline;`;
          } else if (item.tag_type === "strike") {
            compStyle += `text-decoration: line-through;`;
          }
        }

        let textValue = "";
        if (item.type === "text" || item.type === "punct") {
          textValue = item.value;
        } else if (item.type === "tag") {
          textValue = `<span class="value">${item.tag_value}</span>`;
        } else if (item.type === "silent") {
          textValue = silentIconStr;
        }
        if (this.isStarItem(item)) innerHtml += starIconStr;
        innerHtml += `<span class="${className}" data-type="${dataType}"
          data-tag-type="${dataTagType}"
          data-index="${this.dataIndex}"
          data-elemInd="${idx}"
          data-ts="${dataTs}"
          data-end-ts="${dataEndTs}"
          style="${compStyle}"
          data-strike="${dataStrike}"
          attr-val="${attrVal}"
          @click="onClickSpan(${dataTs})"
          >${textValue}</span>`;
        if (this.isStarItem(item)) innerHtml += starIconStr;
      });
      return innerHtml;
    },
    onClickSpan(time) {
      console.log("time", time);
    },
    onKeyDown(event) {
      if (event.keyCode == 13 && event.shiftKey) {
        this.lineBreak = true;
        var selection = document.getSelection();
        var node = window.getSelection().anchorNode.parentNode;
        var index = node.getAttribute("data-index");
        var subIndex = node.getAttribute("data-elemind");
        var content = { ...this.transcriptInfo.transcriptItemData.content };
        var item = { ...content.monologues[index].elements[subIndex] };
        var firstValue = item.value.substr(0, selection.anchorOffset);
        var lastValue = item.value.substr(selection.anchorOffset);
        //console.log(firstValue, ", ", lastValue);
        var newElements = content.monologues[index].elements.splice(
          0,
          subIndex
        );
        item.value = firstValue;
        newElements.push(item);
        content.monologues[index].elements[0].value = lastValue;
        content.monologues.splice(index, 0, {
          speaker: content.monologues[index].speaker,
          elements: newElements,
        });
        const data = {
          transcriptItemData: {
            ...this.transcriptInfo.transcriptItemData,
            content: {
              ...content,
              monologues: [...content.monologues],
            },
          },
        };
        this.$store.dispatch(SET_TRANSCRIPT_INFO, data);
        saveContentAPI(this.transcriptInfo.content_id, content);
        // refreshTranscriptData(transcriptItemData);
        // saveContent();
      } else if (event.keyCode == 13) event.preventDefault();
    },
    // onMenu: function (selectedHighlight) {
    //   this.open = false;
    //   console.log('current page', this.curPage)
    //   if (this.curPage !== PAGES.TRANSCRIPT) return;

    //   const startNodeTemp = window.getSelection().anchorNode.parentNode;
    //   this.startNode = null;
    //   this.endNode = null;
    //   if (
    //     !startNodeTemp ||
    //     !endNodeTemp ||
    //     !this.transcriptInfo.content_id ||
    //     !this.transcriptInfo.transcriptItemData.content
    //   )
    //     return;
    //   try {
    //     let content = this.transcriptInfo.transcriptItemData.content;

    //     let firstIndex = startNodeTemp.getAttribute("data-index");
    //     let firstElemId = startNodeTemp.getAttribute("data-elemind");

    //     if (!firstIndex) {
    //       let tmpNode = startNodeTemp.lastElementChild;
    //       firstIndex = parseInt(tmpNode.getAttribute("data-index"));
    //       firstElemId = parseInt(tmpNode.getAttribute("data-elemind")) + 1;
    //       if (content.monologues[firstIndex].elements.length <= firstElemId) {
    //         firstIndex++;
    //         firstElemId = 0;
    //       }
    //     }

    //     firstIndex = parseInt(firstIndex);
    //     firstElemId = parseInt(firstElemId);

    //     let secondIndex = endNodeTemp.getAttribute("data-index");
    //     let secondElemId = endNodeTemp.getAttribute("data-elemind");
    //     if (secondIndex == undefined) {
    //       let tmpNode = endNodeTemp.lastElementChild;
    //       secondIndex = tmpNode.getAttribute("data-index");
    //       secondElemId = tmpNode.getAttribute("data-elemind");
    //     }
    //     secondIndex = parseInt(secondIndex);
    //     secondElemId = parseInt(secondElemId);

    //     for (var i = firstIndex; i <= secondIndex; i++) {
    //       // let item = content.monologues[i];

    //       let rowStart = parseInt(i == firstIndex ? firstElemId : 0);
    //       let rowEnd = parseInt(
    //         i == secondIndex
    //           ? secondElemId
    //           : content.monologues[i].elements.length - 1
    //       );

    //       let swap = false;

    //       if (rowStart > rowEnd) {
    //         let tmp = rowStart;
    //         rowStart = rowEnd;
    //         rowEnd = tmp;
    //         swap = true;
    //       }

    //       for (let j = rowStart; j <= rowEnd; j++) {
    //         if (selectedHighlight.value == -3) {
    //           content.monologues[i].elements[j].tag_type =
    //             content.monologues[i].elements[j].tag_type == "strike"
    //               ? "normal"
    //               : "strike";
    //         } else if (selectedHighlight.value == -2) {
    //           // strong tag must be started and ended at the text to show star correctly
    //           if (
    //             j == rowStart &&
    //             content.monologues[i].elements[j].type == "punct"
    //           )
    //             continue;
    //           if (
    //             j == rowEnd &&
    //             content.monologues[i].elements[j].type == "punct"
    //           )
    //             continue;
    //           content.monologues[i].elements[j].tag_type = "strong";
    //         } else if (selectedHighlight.value == -1) {
    //           content.monologues[i].elements[j].tag_type = "normal";
    //         } else {
    //           content.monologues[i].elements[j].tag_type = "color";
    //           content.monologues[i].elements[j].attr = selectedHighlight.color;
    //         }
    //       }
    //     }
    //     // transcriptItemData.content = JSON.stringify(content);
    //     // saveContent();
    //     // refreshTranscriptData(transcriptItemData);
    //     const data = {
    //       transcriptItemData: {
    //         ...this.transcriptInfo.transcriptItemData,
    //         content: {
    //           ...this.transcriptInfo.transcriptItemData.content,
    //           monologues: [...content.monologues],
    //         },
    //       },
    //     };
    //     this.$store.dispatch(SET_TRANSCRIPT_INFO, data);
    //     saveContentAPI(this.transcriptInfo.content_id, content);
    //   } catch (e) {
    //     alert(e);
    //   }
    // },
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
    user-select: text;
    -ms-user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
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
