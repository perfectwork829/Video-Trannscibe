<template>
  <div
    class="edmon-btn-dropdown-wrapper addpaper-dropdown-wrapper"
    v-click-outside="hideDropdown"
  >
    <button
      :class="`btn edmon-dropdown-anchorbtn ${variant}`"
      @click="clickButton"
    >
      <fa-icon :icon="['fas', 'plus']" />
      {{ showText ? 'Add to Paper Edit' : '' }}
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
    </ul>
    <radial-progress-bar
      v-if="progressSteps"
      :diameter="100"
      :completed-steps="progressSteps"
      :total-steps="totalSteps">
    <p>{{ progressSteps }}%</p>
    </radial-progress-bar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { SET_TRANSCRIPT_INFO } from 'app/store/transcript.module';
import { SET_PAPER_INFO } from 'app/store/paper.module';
import { saveClipsAPI } from 'app/api';
import { saveContentAPI } from 'app/api';
import { PAGES } from 'app/constants/index';
import { getFullPath } from 'app/utils';
// import $ from 'jquery'
import RadialProgressBar from 'vue-radial-progress'

export default {
  name: 'AddPaperEditDropdown',
  props: {
    showText: {
      type: Boolean,
      default: false,
    },
    variant: {
      type: String,
      default: 'btn-primary',
    },
    anchorPos: {
      type: String,
      default: 'left',
    },
  },
  data: function () {
    return {
      menus: [
        { name: 'Yellow', color: '#FFEAA0' },
        { name: 'Green', color: '#C0DAA0' },
        { name: 'Blue', color: '#C2DDFF' },
        { name: 'Red', color: '#FFA8BD' },
        { name: 'Brown', color: '#A52A2A' },
        { name: 'Pink', color: '#FFC0CB' },
      ],
      open: false,
      startNode: null,
      endNode: null,
      totalSteps: 100,
      progressSteps: 0,
      showProgress: true
    };
  },
  components: {
    RadialProgressBar
  },
  computed: {
    ...mapGetters(['transcriptInfo', 'curPage', 'paperInfo']),
  },
  watch: {
    progressSteps: function(n, o) {
      console.log('progress steps', n)
    }
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
          console.log('Hightlihgt dropdown' + err);
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
    onMenu: async function (selectedHighlight) {
      this.open = false;
      if (this.curPage !== PAGES.PAPER_EDIT) return;

      try {
        // console.log('selected highlight', selectedHighlight);
        this.progressSteps = 0;
        const new_clips = [];
        const path = getFullPath(this.transcriptInfo);
        let transcriptItemData = this.transcriptInfo.transcriptItemData;
        for (const [i, monologue] of this.transcriptInfo.transcriptItemData.content.monologues.entries()) {
        // this.transcriptInfo.transcriptItemData.content.monologues.forEach((monologue, i) => {
            let elements = monologue.elements;
            if (elements && elements.length) {
              let sentence = '';
              let isContinue = 1;
              let sentenceId = 0;
              let start_time = 0;
              let end_time = 0;
              let item_content = '';
              let value = '';
              let thumbnailStr = transcriptItemData.filePath.replace('/\\/g', '\\\\') +
                  ',' +
              start_time;
              for (const [j, el] of elements.entries()) {
                if (!isContinue) {
                  if (sentence !== '') {
                      thumbnailStr = transcriptItemData.filePath.replace('/\\/g', '\\\\') +
                        ',' +
                      start_time;
                      const newClip = {
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
                        thumbnail:
                          'https://firebasestorage.googleapis.com/v0/b/logmonster-51e0a.appspot.com/o/thumbnails%2F' +
                          thumbnailStr +
                          '?alt=media',
                      };
                      const video = document.getElementById('video_player_paperedit2');
                      video.currentTime = start_time;

                      const thumb = await this.captureAsCanvas(video, {width: 160, height: 50});
                      this.progressSteps = parseInt(this.progressSteps + (100 - this.progressSteps)*Math.random());

                      newClip.thumbnail = thumb;
                      new_clips.push(newClip);
                  }
                  
                  sentence = '';
                  sentenceId = 0;
                  start_time = 0;
                  end_time = 0;
                  item_content = '';
                  value = '';
                }
                value = el.value;
                item_content +=value;
                if ((el.tag_type === 'color' && el.attr === selectedHighlight.color)
                  || (el.tag_type === 'strong' && selectedHighlight.value == -2)
                ) {
                  isContinue = 1;
                  if (sentence == '') {
                    if (el.type == 'text') {
                      start_time = el.ts;
                    }
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
                    sentence +=
                      '<span data-type="punct">' + (value || '') + '</span>';
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
                  // console.log('sentence', sentence)                
                  
                } else {
                  isContinue = 0;
                }
              }
              if (isContinue || !isContinue) {
                if (sentence !== '') {
                  
                      thumbnailStr = transcriptItemData.filePath.replace('/\\/g', '\\\\') +
                        ',' +
                      start_time;
                      const newClip = {
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
                        thumbnail:
                          'https://firebasestorage.googleapis.com/v0/b/logmonster-51e0a.appspot.com/o/thumbnails%2F' +
                          thumbnailStr +
                          '?alt=media',
                      };
                      const video = document.getElementById('video_player_paperedit2');
                      video.currentTime = start_time;
                      const thumb = await this.captureAsCanvas(video, {width: 160, height: 50});
                      this.progressSteps = parseInt(this.progressSteps + (100 - this.progressSteps)*Math.random());
                      newClip.thumbnail = thumb;
                      new_clips.push(newClip);
                }
              }
            }
        }
        
        let tempClips = this.paperInfo.clips.concat(new_clips);
        try {
          const res = await saveClipsAPI(
            this.transcriptInfo.curProjectId,
            this.paperInfo.curPaperId,
            tempClips
          );
          this.progressSteps = 100;
          setTimeout(() => {
            // console.log('timeout test', this.progressSteps)
            this.progressSteps = 0
          }, 1000)
          this.$store.dispatch(SET_PAPER_INFO, {
            clips: tempClips.map((item, idx) => {
              return {
                ...item,
                id: res[idx],
              };
            }),
            cur_clip_index: this.paperInfo.cur_clip_index + new_clips.length,
          });
        } catch (err) {
          console.log(err);
        }
      } catch (e) {
        alert(e);
      }
    },
    captureAsCanvas: async function (video, size)
    {
        return await new Promise((resolve, reject) => {
          video.onseeked = function(e) {
            console.log('seeked');
            var canvas = document.createElement('canvas')
            canvas.setAttribute('width', size.width);
            canvas.setAttribute('height', size.height);
            canvas.getContext('2d').drawImage(video, 0, 0, size.width, size.height)
            var src = canvas.toDataURL();
            resolve(src);
          }
        })
    },
  },
};
</script>
<style lang="scss" scoped>
  .radial-progress-container {
    position: absolute;
    z-index: 999;
  }
</style>
