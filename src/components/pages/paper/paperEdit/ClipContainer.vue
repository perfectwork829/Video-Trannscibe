<template>
  <div class="clip-component-container">
    <div class="clip-component-header btn-group">
      <b-button variant="light" class="btn-add-section" @click="addSection">
        <fa-icon :icon="['fas', 'plus']" />
        Add selection to Rough Cut
      </b-button>
      <b-dropdown variant="light" class="edmon-b-dropdown">
        <template #button-content>
          <fa-icon :icon="['fas', 'share']" />
        </template>
        <b-dropdown-item @click="exportText">
          <fa-icon :icon="['fas', 'file-alt']" /> Text File <fa-icon :icon="['fas', 'info-circle']" />
        </b-dropdown-item>
        <b-dropdown-item @click="exportPDF">
          <fa-icon :icon="['fas', 'file-alt']" /> PDF File <fa-icon :icon="['fas', 'info-circle']" />
        </b-dropdown-item>
      </b-dropdown>
      <b-button variant="light" disabled>10:01:04 AM</b-button>
      <b-button variant="light"><fa-icon :icon="['fas', 'trash']" @click="deleteAllItems" /></b-button>
    </div>
    <div class="clip-content-wrapper">
      <div :class="`script_content_final ${paperInfo.bPostit ? 'script_content_postit' : ''}`">
        <clip-item
          v-for="(item, idx) in clipsArray"
          :key="idx"
          :selected="idx === selectedIndex"
          :orderIndex="idx"
          :dragClipIndex="dragIndex"
          :clipData="item"
          @delete="deleteItem"
          @changeOrder="changeOrder"
          @setDragIndex="setDragIndex"
          @onSelect="onSelect(idx)"
        ></clip-item>
      </div>
    </div>
    <radial-progress-bar v-if="showProgress" :diameter="100" :completed-steps="progressSteps" :total-steps="totalSteps">
      <p>{{ progressSteps }}%</p>
    </radial-progress-bar>
    <section-title-modal
      :createType="'create'"
      :clipId="''"
      :clipType="sectionModalInfo.type"
      :propShowModal="sectionModalInfo.bShow"
      :propTitleValue="''"
      @onHide="hideSectionModal"
    ></section-title-modal>
    <alert-modal componentId="no-paper-alert-modal" header="" :content="alertMessage" @onOk="() => {}"></alert-modal>
  </div>
</template>

<script>
  import ClipItem from './ClipItem.vue';
  import SectionTitleModal from './SectionTitleModal.vue';
  import AlertModal from 'app/components/sharedComponents/AlertModal.vue';
  import { mapGetters } from 'vuex';
  import { formatTime, getVideoImage, showImageAt } from 'app/utils';
  import { SET_PAPER_INFO, SET_SELECTED_INDEX } from 'app/store/paper.module';
  import { SET_SEARCH_LOADING } from 'app/store/search.module';
  import {
    saveClipsAPI,
    updatePaperAPI,
    getProjectPapersAPI,
    createGoogleDocAPI,
    EditGoogleDocAPI,
    getGoogleAccessToken,
  } from 'app/api';
  import { callMFCFunction } from 'app/utils';
  import { getFullPath, getFullPath2, getThumbnailUrl, removeHtmlTags, replaceHtmlCharacters } from 'app/utils';
  import jsPDF from 'jspdf';
  // import $ from 'jquery'
  import RadialProgressBar from 'vue-radial-progress';
  import { PAGES } from 'app/constants/index';
  const gauthOption = {
    clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
    scope: 'email https://www.googleapis.com/auth/drive',
    prompt: 'consent',
  };

  const cloud_base_url = 'http://localhost:5002/logmonster-51e0a/us-central1/';

  export default {
    name: 'ClipContainer',
    components: {
      ClipItem,
      SectionTitleModal,
      RadialProgressBar,
      AlertModal,
    },
    data: function () {
      return {
        sectionModalInfo: {
          bShow: false,
          type: 'heading',
        },
        dragIndex: -1,
        selectedIndex: 0,
        totalSteps: 100,
        progressSteps: 0,
        showProgress: false,
        alertMessage: '',
      };
    },
    computed: {
      ...mapGetters(['transcriptInfo', 'paperInfo', 'curPage', 'search']),
      clipsArray: function () {
        return [
          ...this.paperInfo.clips,
          // {
          //   type: 'final',
          // },
        ];
      },
    },
    methods: {
      addSection: async function (event) {
        const selections = window.getSelection();
        if (this.curPage === PAGES.SEARCH) {
          let transcriptIndex = selections.anchorNode.parentNode.getAttribute('transcript-index');
          const path = getFullPath2(this.search.transcriptData[transcriptIndex]);
          if (selections) {
            if (!this.paperInfo.curPaperId) {
              this.alertMessage = 'Please create or select a Paper Edit';
              this.$bvModal.show('no-paper-alert-modal');
              return;
            }
            try {
              let transcriptItemData = this.search.transcriptData[transcriptIndex];
              let content = transcriptItemData.content_detail;

              let startNode = selections.anchorNode.parentNode;
              let endNode = selections.focusNode.parentNode;
              let startOffset = selections.anchorOffset;
              let endOffset = selections.focusOffset;

              let firstIndex = startNode.getAttribute('data-index');
              let firstElemId = startNode.getAttribute('data-elemind');
              if (!firstIndex) {
                let tmpNode = startNode.lastElementChild;

                firstIndex = parseInt(tmpNode.getAttribute('data-index'));
                firstElemId = parseInt(tmpNode.getAttribute('data-elemind')) + 1;

                if (content.monologues[firstIndex].elements.length <= firstElemId) {
                  firstIndex++;
                  firstElemId = 0;
                }
              }

              let secondIndex = endNode.getAttribute('data-index');
              let secondElemId = endNode.getAttribute('data-elemind');
              if (secondIndex == undefined) {
                let tmpNode = endNode.firstElementChild.lastElementChild;
                if (tmpNode == null) {
                  tmpNode = endNode.lastElementChild;
                }
                secondIndex = tmpNode.getAttribute('data-index');
                secondElemId = tmpNode.getAttribute('data-elemind');
              }

              let sentence = '';
              let sentenceId = 0;
              let start_time = 0;
              let end_time = 0;
              let item_content = '';
              let speaker = '';
              for (let i = firstIndex; i <= secondIndex; i++) {
                let item = content.monologues[i];

                let rowStart = 0;
                let rowEnd = item.elements.length - 1;

                let swap = false;

                if (rowStart > rowEnd) {
                  let tmp = rowStart;
                  rowStart = rowEnd;
                  rowEnd = tmp;
                  swap = true;
                }

                for (let j = rowStart; j <= rowEnd; j++) {
                  let el = item.elements[j];

                  if (sentence == '') {
                    if (el.type == 'text') {
                      start_time = el.ts;
                      speaker = item.speaker;
                    } else {
                      continue;
                    }
                  }
                  let value = el.value;

                  if (i == firstIndex && j == firstElemId) {
                    value = value.substr(startOffset);
                  } else if (i == secondIndex && j == secondElemId) {
                    if (swap) {
                      value = value.substr(endOffset);
                    } else {
                      value = value.substr(0, endOffset);
                    }
                  }

                  if (value !== undefined) {
                    item_content += value;
                  }

                  if (el.type == 'text' && value !== undefined) {
                    sentence +=
                      '<span data-type="text" ondblclick="onDblclickWord(event)" data-index=' +
                      i +
                      ' data-elemInd=' +
                      j +
                      ' data-ts=' +
                      el.ts +
                      ' data-end-ts=' +
                      el.end_ts +
                      '>' +
                      value +
                      '</span>';
                    end_time = el.end_ts;
                  } else if (el.type === 'punct') {
                    sentence += '<span data-type="punct">' + (value || '') + '</span>';
                  } else if (el.type === 'silent') {
                    sentence +=
                      '<span ' +
                      "class='text-span' " +
                      'data-type=' +
                      el.type +
                      ' data-index=' +
                      i +
                      ' data-elemInd=' +
                      j +
                      ' data-ts=' +
                      el.ts +
                      ' data-end-ts=' +
                      el.end_ts +
                      '>' +
                      '<i class="fas fa-stop-circle mr-2"></i>' +
                      '</span>';
                  }
                }

                let newClip;
                if (sentence != '') {
                  newClip = {
                    type: 'clip',
                    name: transcriptItemData.title,
                    path: path,
                    videoPath: transcriptItemData.filePath,
                    mpdFilePath: transcriptItemData.mpdFilePath,
                    start_time: start_time,
                    end_time: end_time,
                    elements: sentence,
                    back_color: '',
                    mob_id: transcriptItemData.mob_id,
                    avb_path: transcriptItemData.avb_path,
                    sentence: item_content,
                    speaker: speaker,
                    thumbnail: getThumbnailUrl(transcriptItemData.mpdFilePath),
                  };
                  // console.log('start time', start_time);

                  // $('#video_player_paperedit2')[0].currentTime = start_time;

                  // newClip.thumbnail = thumb;
                  let tempClips = this.paperInfo.clips;
                  tempClips.splice(this.paperInfo.cur_clip_index, 0, newClip);

                  sentence = '';
                  item_content = '';
                  sentenceId++;
                  start_time = 0;
                  end_time = 0;
                  speaker = '';
                  try {
                    const res = await saveClipsAPI(transcriptItemData.project_id, this.paperInfo.curPaperId, tempClips);
                    this.$store.dispatch(SET_PAPER_INFO, {
                      clips: tempClips.map((item, idx) => {
                        return {
                          ...item,
                          id: res[idx],
                        };
                      }),

                      cur_clip_index: this.paperInfo.cur_clip_index + 1,
                    });

                    // this.progressSteps = 0;
                  } catch (err) {
                    console.log(err);
                  }
                }
              }
            } catch (err) {
              console.log('Error occured when add selection', err);
              // alert('Add clips error occured');
            }
          }
        } else {
          const path = getFullPath(this.transcriptInfo);
          if (selections) {
            if (!this.paperInfo.curPaperId) {
              this.alertMessage = 'Please create or select a Paper Edit';
              this.$bvModal.show('no-paper-alert-modal');
              return;
            }
            try {
              this.progressSteps = 0;
              this.showProgress = true;
              let transcriptItemData = this.transcriptInfo.transcriptItemData;
              let content = transcriptItemData.content;

              let startNode = selections.anchorNode.parentNode;
              let endNode = selections.focusNode.parentNode;
              let startOffset = selections.anchorOffset;
              let endOffset = selections.focusOffset;

              let firstIndex = startNode.getAttribute('data-index');
              let firstElemId = startNode.getAttribute('data-elemind');
              if (!firstIndex) {
                let tmpNode = startNode.lastElementChild;

                firstIndex = parseInt(tmpNode.getAttribute('data-index'));
                firstElemId = parseInt(tmpNode.getAttribute('data-elemind')) + 1;

                if (content.monologues[firstIndex].elements.length <= firstElemId) {
                  firstIndex++;
                  firstElemId = 0;
                }
              }

              let secondIndex = endNode.getAttribute('data-index');
              let secondElemId = endNode.getAttribute('data-elemind');
              if (secondIndex == undefined) {
                let tmpNode = endNode.firstElementChild.lastElementChild;
                if (tmpNode == null) {
                  tmpNode = selections.focusNode.lastElementChild.parentNode.lastElementChild;
                }
                secondIndex = tmpNode.getAttribute('data-index');
                secondElemId = tmpNode.getAttribute('data-elemind');
              }

              let sentence = '';
              let sentenceId = 0;
              let start_time = 0;
              let end_time = 0;
              let item_content = '';
              let speaker = '';
              for (let i = firstIndex; i <= secondIndex; i++) {
                let item = content.monologues[i];

                let rowStart = parseInt(i == firstIndex ? firstElemId : 0);
                let rowEnd = parseInt(i == secondIndex ? secondElemId : content.monologues[i].elements.length - 1);

                let swap = false;

                if (rowStart > rowEnd) {
                  let tmp = rowStart;
                  rowStart = rowEnd;
                  rowEnd = tmp;
                  swap = true;
                }

                for (let j = rowStart; j <= rowEnd; j++) {
                  let el = item.elements[j];

                  if (sentence == '') {
                    if (el.type == 'text') {
                      start_time = el.ts;
                      speaker = item.speaker;
                    } else {
                      continue;
                    }
                  }
                  let value = el.value;

                  if (i == firstIndex && j == firstElemId) {
                    value = value.substr(startOffset);
                  } else if (i == secondIndex && j == secondElemId) {
                    if (swap) {
                      value = value.substr(endOffset);
                    } else {
                      value = value.substr(0, endOffset);
                    }
                  }

                  if (value !== undefined) {
                    item_content += value;
                  }

                  if (el.type == 'text' && value !== undefined) {
                    sentence +=
                      '<span data-type="text" ondblclick="onDblclickWord(event)" data-index=' +
                      i +
                      ' data-elemInd=' +
                      j +
                      ' data-ts=' +
                      el.ts +
                      ' data-end-ts=' +
                      el.end_ts +
                      '>' +
                      value +
                      '</span>';
                    end_time = el.end_ts;
                  } else if (el.type === 'punct') {
                    sentence += '<span data-type="punct">' + (value || '') + '</span>';
                  } else if (el.type === 'silent') {
                    sentence +=
                      '<span ' +
                      "class='text-span' " +
                      'data-type=' +
                      el.type +
                      ' data-index=' +
                      i +
                      ' data-elemInd=' +
                      j +
                      ' data-ts=' +
                      el.ts +
                      ' data-end-ts=' +
                      el.end_ts +
                      '>' +
                      '<i class="fas fa-stop-circle mr-2"></i>' +
                      '</span>';
                  }
                }

                let newClip;
                if (sentence != '') {
                  const thumbnailStr = transcriptItemData.filePath.replace('/\\/g', '\\\\') + ',' + start_time;
                  newClip = {
                    type: 'clip',
                    name: transcriptItemData.title,
                    path: path,
                    videoPath: transcriptItemData.filePath,
                    mpdFilePath: transcriptItemData.mpdFilePath,
                    start_time: start_time,
                    end_time: end_time,
                    elements: sentence,
                    back_color: '',
                    mob_id: this.transcriptInfo.mob_id,
                    avb_path: this.transcriptInfo.avb_path,
                    sentence: item_content,
                    speaker: speaker,
                    thumbnail:
                      'https://firebasestorage.googleapis.com/v0/b/logmonster-51e0a.appspot.com/o/thumbnails%2F' +
                      thumbnailStr +
                      '?alt=media',
                  };
                  // console.log('start time', start_time);

                  // $('#video_player_paperedit2')[0].currentTime = start_time;
                  document.getElementById('video_player_paperedit2').currentTime = start_time;
                  const video = document.getElementById('video_player_paperedit2');
                  var that = this;
                  video.onprogress = function () {
                    var range = 0;
                    var bf = this.buffered;
                    var time = this.currentTime;
                    that.progressSteps = parseInt(that.progressSteps + (100 - that.progressSteps) * Math.random());
                  };
                  const thumb = await this.captureAsCanvas(video, {
                    width: 160,
                    height: 50,
                  });

                  newClip.thumbnail = thumb;
                  let tempClips = this.paperInfo.clips;
                  tempClips.splice(this.paperInfo.cur_clip_index, 0, newClip);

                  this.progressSteps = 100;
                  setTimeout(() => {
                    this.showProgress = false;
                    this.progressSteps = 0;
                  }, 1000);

                  sentence = '';
                  item_content = '';
                  sentenceId++;
                  start_time = 0;
                  end_time = 0;
                  speaker = '';
                  console.log('clips', tempClips);
                  try {
                    const res = await saveClipsAPI(
                      this.transcriptInfo.curProjectId,
                      this.paperInfo.curPaperId,
                      tempClips
                    );
                    this.$store.dispatch(SET_PAPER_INFO, {
                      clips: tempClips.map((item, idx) => {
                        return {
                          ...item,
                          id: res[idx],
                        };
                      }),

                      cur_clip_index: this.paperInfo.cur_clip_index + 1,
                    });

                    // this.progressSteps = 0;
                  } catch (err) {
                    console.log(err);
                  }
                  // this.showProgress = false;
                }
              }
            } catch (err) {
              console.log('Error occured when add selection', err);
              this.showProgress = false;
              this.progressSteps = 0;
              // alert('Add clips error occured');
            }
          }
        }
      },
      addAllSearch: async function () {
        console.log('add all search', this.search);
        console.log('paper info', this.paperInfo);
        if (!this.paperInfo.curPaperId) {
          this.alertMessage = 'Please create or select a Paper Edit';
          this.$bvModal.show('no-paper-alert-modal');
          return;
        }
        this.$store.dispatch(SET_SEARCH_LOADING, true);
        let includeRange = 5;
        // let transcriptIndex = 0;
        let tempClips = this.paperInfo.clips;
        let cur_clip_index = this.paperInfo.cur_clip_index;
        for (let transcriptIndex = 0; transcriptIndex < this.search.transcriptData.length; transcriptIndex++) {
          const path = getFullPath2(this.search.transcriptData[transcriptIndex]);

          try {
            let transcriptItemData = this.search.transcriptData[transcriptIndex];
            let content = transcriptItemData.content_detail;

            let firstIndex = 0;
            let secondIndex = content.monologues.length - 1;

            let sentence = '';
            let sentenceId = 0;
            let start_time = 0;
            let end_time = 0;
            let item_content = '';
            let speaker = '';
            for (let i = firstIndex; i <= secondIndex; i++) {
              let item = content.monologues[i];
              if (!this.checkSearchItem(item)) continue;
              let rowStart = 0;
              let rowEnd = item.elements.length - 1;
              let searchedWordsIndex = [];
              let text = '';
              let candidates = [];
              for (let j = rowStart; j <= rowEnd; j++) {
                text += replaceHtmlCharacters(removeHtmlTags(item.elements[j].value));

                if (this.search.searchTxt.indexOf(text) === 0) {
                  candidates.push(j);
                  if (this.search.searchTxt === text) {
                    searchedWordsIndex.push({
                      start: candidates[0],
                      end: candidates[candidates.length - 1],
                    });
                    candidates = [];
                    text = '';
                  }
                } else if (text.indexOf(this.search.searchTxt) > -1) {
                  // console.log(text.indexOf(this.searchTxt))
                  candidates.push(j);
                  searchedWordsIndex.push({
                    start: candidates[0],
                    end: candidates[candidates.length - 1],
                  });
                  candidates = [];
                  text = '';
                } else {
                  candidates = [];
                  text = '';
                }
              }
              console.log('searched index', searchedWordsIndex);
              for (let i = 0; i < searchedWordsIndex.length; i++) {
                item_content = '';
                sentence = '';
                let startIndex = Math.max(searchedWordsIndex[i].start - includeRange * 2, 0);
                let endIndex = Math.min(searchedWordsIndex[i].end + includeRange * 2, item.elements.length - 1);
                for (let j = startIndex; j <= endIndex; j++) {
                  let el = item.elements[j];

                  if (sentence == '') {
                    if (el.type == 'text') {
                      start_time = el.ts;
                      speaker = item.speaker;
                    } else {
                      continue;
                    }
                  }
                  let value = el.value;
                  if (value !== undefined) {
                    item_content += value;
                  }

                  if (el.type == 'text' && value !== undefined) {
                    sentence +=
                      '<span data-type="text" ondblclick="onDblclickWord(event)" data-index=' +
                      i +
                      ' data-elemInd=' +
                      j +
                      ' data-ts=' +
                      el.ts +
                      ' data-end-ts=' +
                      el.end_ts +
                      '>' +
                      value +
                      '</span>';
                    end_time = el.end_ts;
                  } else if (el.type === 'punct') {
                    sentence += '<span data-type="punct">' + (value || '') + '</span>';
                  } else if (el.type === 'silent') {
                    sentence +=
                      '<span ' +
                      "class='text-span' " +
                      'data-type=' +
                      el.type +
                      ' data-index=' +
                      i +
                      ' data-elemInd=' +
                      j +
                      ' data-ts=' +
                      el.ts +
                      ' data-end-ts=' +
                      el.end_ts +
                      '>' +
                      '<i class="fas fa-stop-circle mr-2"></i>' +
                      '</span>';
                  }
                }
                let newClip;
                if (sentence != '') {
                  newClip = {
                    type: 'clip',
                    name: transcriptItemData.title,
                    path: path,
                    videoPath: transcriptItemData.filePath,
                    mpdFilePath: transcriptItemData.mpdFilePath,
                    start_time: start_time,
                    end_time: end_time,
                    elements: sentence,
                    back_color: '',
                    mob_id: transcriptItemData.mob_id,
                    avb_path: transcriptItemData.avb_path,
                    sentence: item_content,
                    speaker: speaker,
                    thumbnail: getThumbnailUrl(transcriptItemData.mpdFilePath),
                  };
                  tempClips.splice(cur_clip_index, 0, newClip);
                  cur_clip_index++;

                  sentence = '';
                  item_content = '';
                  sentenceId++;
                  start_time = 0;
                  end_time = 0;
                  speaker = '';
                  console.log('new clip', newClip);
                }
              }
            }
          } catch (err) {
            console.log('Error ocurred when add selection', err);
          }
        }
        try {
          const res = await saveClipsAPI(this.transcriptInfo.curProjectId, this.paperInfo.curPaperId, tempClips);
        } catch (err) {
          console.log(err);
        }
        this.$store.dispatch(SET_SEARCH_LOADING, false);
      },
      changeOrder: async function (dropOrder) {
        if (this.dragIndex === -1) return;
        const tempClips = this.paperInfo.clips.map((item, idx) => {
          if (idx === dropOrder) {
            return this.paperInfo.clips[this.dragIndex];
          } else if (idx === this.dragIndex) {
            return this.paperInfo.clips[dropOrder];
          } else return item;
        });

        try {
          const res = await saveClipsAPI(this.transcriptInfo.curProjectId, this.paperInfo.curPaperId, tempClips);
          this.$store.dispatch(SET_PAPER_INFO, {
            clips: tempClips.map((item, idx) => {
              return {
                ...item,
                id: res[idx],
              };
            }),
          });
        } catch (err) {
          console.log('Chnage clips order issue');
        }

        this.dragIndex = -1;
      },
      onHeading: function (strType) {
        this.sectionModalInfo.type = strType;
        this.sectionModalInfo.bShow = true;
      },
      hideSectionModal: function () {
        this.sectionModalInfo.bShow = false;
      },
      deleteItem: async function (nIndex) {
        let temp = [...this.paperInfo.clips];
        temp.splice(nIndex, 1);

        try {
          const res = await saveClipsAPI(this.transcriptInfo.curProjectId, this.paperInfo.curPaperId, temp);
          this.$store.dispatch(SET_PAPER_INFO, {
            clips: temp.map((item, idx) => {
              return { ...item, id: res[idx] };
            }),
          });
        } catch (err) {
          console.log('Delete Clip item error');
        }
      },
      insertInterval: async function () {
        let tempClips = [
          ...this.paperInfo.clips,
          {
            type: 'interval',
            name: 'interval',
            videoPath: '',
            start_time: 0,
            end_time: 0,
            elements: '',
            back_color: '',
          },
        ];

        try {
          const res = await saveClipsAPI(this.transcriptInfo.curProjectId, this.paperInfo.curPaperId, tempClips);

          this.$store.dispatch(SET_PAPER_INFO, {
            clips: tempClips.map((item, idx) => {
              return {
                ...item,
                id: res[idx],
              };
            }),
          });
        } catch (err) {
          console.log('Insert clip item issue');
        }
      },
      transcode: function () {
        const currentProjectId = this.transcriptInfo.curProjectId;
        const currentPaperId = this.paperInfo.curPaperId;
        const clips = this.paperInfo.clips.map((clip) => {
          return {
            videoPath: clip.videoPath,
            mpdFilePath: clip.mpdFilePath,
            startTime: clip.start_time,
            endTime: clip.end_time,
          };
        });
        fetch(
          `${cloud_base_url}concatenate?currentProjectId=${currentProjectId}&currentPaperId=${currentPaperId}&clips=${JSON.stringify(
            clips
          )}`
        ).then((res) => {
          updatePaperAPI({
            project_id: currentProjectId,
            id: currentPaperId,
            mpdFilePath:
              'gs://logmonster-51e0a.appspot.com/paper_videos/' + currentProjectId + '_' + currentPaperId + '/',
          });
        });
        // updatePaperAPI({
        //   project_id: currentProjectId,
        //   id: currentPaperId,
        //   mpdFilePath: 'gs://logmonster-51e0a.appspot.com/paper_videos/' + currentProjectId + '_' + currentPaperId + '/'
        // }).then(res => console.log('res', res))
        // fetch(`${cloud_base_url}concatenate?currentProjectId=${currentProjectId}&currentPaperId=${currentPaperId}&clips=${JSON.stringify(clips)}`)
        //   .then(res => {
        //     updatePaperAPI({
        //       project_id: currentProjectId,
        //       id: currentPaperId,
        //       mpdFilePath: 'gs://logmonster-51e0a.appspot.com/paper_videos/' + currentProjectId + '_' + currentPaperId + '/'
        //     })
        //   })
      },
      exportAvb: function () {
        let str = '';
        this.paperInfo.clips.forEach((clip) => {
          if (clip.type == 'clip') {
            str += clip.avb_path + '|' + clip.mob_id + '|' + clip.start_time + '|' + clip.end_time + '\n';
          }
        });
        callMFCFunction('exportAvb', str);
      },
      exportText: function () {
        let str = '';
        this.paperInfo.clips.forEach((clip) => {
          console.log(clip);
          if (clip.type == 'clip') {
            const path = clip.path || clip.name;
            const startTime = `In: ${formatTime(clip.start_time)}`;
            const endTime = `Out: ${formatTime(clip.end_time)}`;
            const speaker =
              'Speaker: ' + (isNaN(clip.speaker) ? clip.speaker : 'Speaker ' + (parseInt(clip.speaker) + 1));
            str += `${path}\n${startTime}\n${endTime}\n${speaker}\n${clip.sentence}\n\n`;
          }
        });
        let blob = new Blob([str], { type: 'text/plain' });
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = this.getPaperName() + '.txt';
        link.click();
      },
      exportPDF: function () {
        var pageWidth = 8.5,
          pageHeight = 11.5,
          lineHeight = 1.2,
          margin = 0.5,
          maxLineWidth = pageWidth - margin * 2,
          metaFontSize = 12,
          fontSize = 13,
          titleFontSize = 16,
          metaFontName = 'Arial',
          fontName = 'Open Sans',
          ptsPerInch = 72,
          // metaOneLineHeight = (metaFontSize * lineHeight) / ptsPerInch,
          oneLineHeight = (fontSize * lineHeight) / ptsPerInch,
          doc = new jsPDF({
            unit: 'in',
            lineHeight: lineHeight,
          }).setProperties({ title: this.getPaperName() });
        const maxRows = pageHeight / oneLineHeight;
        let currentLine = 0;

        this.paperInfo.clips.forEach((clip, index) => {
          if (clip.type == 'clip') {
            const path = clip.path || clip.name;
            const startTime = `In: ${formatTime(clip.start_time)}`;
            const endTime = `Out: ${formatTime(clip.end_time)}`;
            const speaker =
              'Speaker: ' + (isNaN(clip.speaker) ? clip.speaker : 'Speaker ' + (parseInt(clip.speaker) + 1));
            const meta = `${path}\n${startTime}\n${endTime}\n${speaker}\n`;
            doc
              .setFont(fontName, 'italic')
              .setFontSize(metaFontSize)
              .text(meta, margin, margin + oneLineHeight * currentLine);
            currentLine += (4 * metaFontSize) / fontSize;

            var textLines = doc
              .setFont(fontName, 'normal')
              .setFontSize(fontSize)
              .splitTextToSize(replaceHtmlCharacters(removeHtmlTags(clip.sentence)) + '\n', maxLineWidth);

            if (currentLine + textLines.length + 1 > maxRows) {
              doc.addPage();
              currentLine = 0;
            }
            doc.text(textLines, margin, margin + oneLineHeight * currentLine);
            currentLine += textLines.length;
          }
        });
        // console.log('currentLine', currentLine)
        doc.save(this.getPaperName() + '.pdf');
      },
      exportGoogleDoc: async function () {
        if (!this.paperInfo.clips.length) {
          alert("You don't have any contents to export");
        } else {
          const ElectronGoogleOAuth2 = require('@getstation/electron-google-oauth2').default;
          const myApiOauth = new ElectronGoogleOAuth2(
            process.env.VUE_APP_GOOGLE_CLIENT_ID,
            process.env.VUE_APP_GOOGLE_CLIENT_SECRET,
            ['https://www.googleapis.com/auth/drive'],
            { successRedirectURL: 'https://docs.google.com/document/u/0/?tgif=d' }
          );
          const access_token = await new Promise((resolve, reject) => {
            myApiOauth
              .openAuthWindowAndGetTokens()
              .then((token) => {
                // use your token.access_token
                resolve(token.access_token);
              })
              .catch((err) => {
                reject(err);
              });
          });
          const title = this.getPaperName();
          const res = await createGoogleDocAPI(access_token, title);
          const documentID = res.data.documentId;
          // const documentID = '1m-sIopS5eivFIhS0dTLmswjBcDFDJcQ5Lxo_k7GZ5sg';
          const requests = [];
          let location = 1;
          this.paperInfo.clips.forEach((clip, index) => {
            if (clip.type == 'clip') {
              const path = clip.path || clip.name;
              const path_array = path.split(' / ');
              let avb_index = 0;
              let avb_length = 0;
              path_array.forEach((it) => {
                if (it.substr(it.length - 4) === '.avb') {
                  avb_index = path.indexOf(it);
                  avb_length = it.length;
                }
              });
              const startTime = `In: ${formatTime(clip.start_time)}`;
              const endTime = `Out: ${formatTime(clip.end_time)}`;
              const duration = `Dur: ${formatTime(clip.end_time - clip.start_time)}`;
              const meta = `${path}\n${startTime}  ${endTime}  ${duration}\n`;
              const speaker =
                'Speaker: ' + (isNaN(clip.speaker) ? clip.speaker : 'Speaker ' + (parseInt(clip.speaker) + 1)) + '\n\n';
              requests.push({
                insertText: {
                  text: meta,
                  location: {
                    index: location,
                  },
                },
              });
              requests.push({
                updateTextStyle: {
                  textStyle: {
                    bold: false,
                    italic: true,
                    weightedFontFamily: {
                      fontFamily: 'Arial',
                    },
                    fontSize: {
                      magnitude: 9,
                      unit: 'PT',
                    },
                  },
                  fields: 'bold,italic,fontSize, weightedFontFamily',
                  range: {
                    startIndex: location,
                    endIndex: location + meta.length,
                  },
                },
              });
              if (avb_index) {
                requests.push({
                  updateTextStyle: {
                    textStyle: {
                      bold: true,
                      italic: true,
                      weightedFontFamily: {
                        fontFamily: 'Arial',
                      },
                      fontSize: {
                        magnitude: 9,
                        unit: 'PT',
                      },
                    },
                    fields: 'bold,italic,fontSize, weightedFontFamily',
                    range: {
                      startIndex: location + avb_index,
                      endIndex: location + avb_index + avb_length,
                    },
                  },
                });
              }
              location += meta.length;
              // add speaker
              requests.push({
                insertText: {
                  text: speaker,
                  location: {
                    index: location,
                  },
                },
              });
              requests.push({
                updateTextStyle: {
                  textStyle: {
                    bold: true,
                    italic: true,
                    weightedFontFamily: {
                      fontFamily: 'Arial',
                    },
                    fontSize: {
                      magnitude: 10,
                      unit: 'PT',
                    },
                  },
                  fields: 'bold,italic,fontSize, weightedFontFamily',
                  range: {
                    startIndex: location,
                    endIndex: location + speaker.length,
                  },
                },
              });
              location += speaker.length;
              const text = '- ' + replaceHtmlCharacters(removeHtmlTags(clip.sentence)) + '\n' + '\n';
              requests.push({
                insertText: {
                  text: text,
                  location: {
                    index: location,
                  },
                },
              });
              requests.push({
                updateTextStyle: {
                  textStyle: {
                    bold: false,
                    italic: false,
                    weightedFontFamily: {
                      fontFamily: 'Courier New',
                    },
                    fontSize: {
                      magnitude: 11,
                      unit: 'PT',
                    },
                  },
                  fields: 'bold,italic,fontSize, weightedFontFamily',
                  range: {
                    startIndex: location,
                    endIndex: location + text.length,
                  },
                },
              });
              // requests.push({
              //   createParagraphBullets: {
              //     bulletPreset: 'BULLET_ARROW_DIAMOND_DISC',
              //     range: {
              //       startIndex: location,
              //       endIndex: location + clip.sentence.length,
              //     }
              //   }
              // })
              location += text.length;
            }
          });
          await EditGoogleDocAPI(documentID, access_token, requests);
          const docLink = `https://docs.google.com/document/d/${documentID}/edit`;
          console.log('docLink', docLink);
          require('electron').shell.openExternal(docLink);
          // window.open(docLink, '_blank')
        }
      },
      exportGoogleDoc1: async function () {
        // console.log('export google doc')
        const googleUser = await this.$gAuth.signIn();
        if (!googleUser) {
          return null;
        }
        const access_token = googleUser.getAuthResponse().access_token;
        // console.log('token', access_token)
        const title = this.getPaperName();
        const res = await createGoogleDocAPI(access_token, title);
        const documentID = res.data.documentId;
        // const documentID = '1QOk30hztzOrDGHuZ_nzqR5q7Y-XU10DQrHv1AUsUI5Q'
        // console.log('documentID', documentID);
        const requests = [];
        let location = 1;
        this.paperInfo.clips.forEach((clip, index) => {
          if (clip.type == 'clip') {
            const path = clip.path || clip.name;
            const startTime = `In: ${formatTime(clip.start_time)}`;
            const endTime = `Out: ${formatTime(clip.end_time)}`;
            const meta = `${path}\n${startTime}\n${endTime}\n`;
            requests.push({
              insertText: {
                text: meta,
                location: {
                  index: location,
                },
              },
            });
            requests.push({
              updateTextStyle: {
                textStyle: {
                  bold: false,
                  italic: true,
                  fontSize: {
                    magnitude: 12,
                    unit: 'PT',
                  },
                },
                fields: 'bold,italic,fontSize',
                range: {
                  startIndex: location,
                  endIndex: location + meta.length,
                },
              },
            });
            location += meta.length;

            const text = clip.sentence + '\n' + '\n';
            requests.push({
              insertText: {
                text: text,
                location: {
                  index: location,
                },
              },
            });
            requests.push({
              updateTextStyle: {
                textStyle: {
                  bold: true,
                  italic: false,
                  fontSize: {
                    magnitude: 16,
                    unit: 'PT',
                  },
                },
                fields: 'bold,italic,fontSize',
                range: {
                  startIndex: location,
                  endIndex: location + text.length,
                },
              },
            });
            location += text.length;
          }
        });
        await EditGoogleDocAPI(documentID, access_token, requests);
        const docLink = `https://docs.google.com/document/d/${documentID}/edit`;
        console.log('docLink', docLink);
        // require("electron").shell.openExternal(docLink);
        window.open(docLink, '_blank');
      },
      updateScope: async function () {
        const option = new window.gapi.auth2.SigninOptionBuilder();
        option.setScope('email https://www.googleapis.com/auth/drive');
        const googleUser = this.$gAuth.GoogleAuth.currentUser.get();
        await googleUser.grant(option);
      },
      getPaperName: function () {
        let paperName =
          this.paperInfo.paperData.filter((it) => it.id === this.paperInfo.curPaperId)[0].title || 'export';
        return paperName;
      },
      deleteAllItems: function () {
        this.$store.dispatch(SET_PAPER_INFO, {
          clips: [],
        });
        saveClipsAPI(this.transcriptInfo.curProjectId, this.paperInfo.curPaperId, this.paperInfo.clips);
      },
      setDragIndex: function (nIndex) {
        this.dragIndex = nIndex;
      },
      onSelect: function (index) {
        this.selectedIndex = index;
        this.$store.dispatch(SET_SELECTED_INDEX, index);
        console.log('changed selected', index);
      },
      captureAsCanvas: async function (video, size) {
        return await new Promise((resolve, reject) => {
          video.onseeked = function (e) {
            console.log('seeked');
            // var canvas = $('<canvas />').attr({ width: size.width, height: size.height })[0];
            var canvas = document.createElement('canvas');
            canvas.setAttribute('width', size.width);
            canvas.setAttribute('height', size.height);

            canvas.getContext('2d').drawImage(video, 0, 0, size.width, size.height);
            var src = canvas.toDataURL();
            resolve(src);
          };
        });
      },
      checkSearchItem: function (item) {
        let bVisible = false;
        const typeOfVal = typeof item;
        if (typeOfVal === 'object' && Object.keys(item).includes('elements')) {
          let text = '';
          item.elements.forEach((elem) => {
            text += elem.value;
          });
          if (text.includes(this.search.searchTxt)) bVisible = true;
          // if (bVisible) console.log("item", item);
        }
        return bVisible;
      },
    },
  };
</script>

<style lang="scss">
  .clip-component-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    .clip-component-header {
      display: flex;
      align-items: center;
      background: #f8f9fa;
      flex: 0 0 auto;
      .posist-check-wrapper {
        display: flex;
        align-items: center;
        color: black;
        margin-right: 15px;
      }
    }
    .clip-content-wrapper {
      flex: 1 1 100%;
      overflow-y: auto;
      border: 1px solid;
    }
    .radial-progress-container {
      position: absolute;
      z-index: 999;
    }
  }
</style>
