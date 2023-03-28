<template>
  <b-modal
    id="section-title-modal"
    centered
    size="md"
    @hidden="resetModal"
    v-model="showModal"
  >
    <template #modal-header="{ close }">
      <h4 class="modal-title">Add some text for a section title</h4>
      <button type="button" class="close" data-dismiss="modal" @click="close()">
        &times;
      </button>
    </template>
    <div class="form-group">
      {{ this.propTitleValue }}
      <label label-for="section-title-input">Label Descriptoin</label>
      <input class="form-control" v-model="title" />
    </div>
    <template #modal-footer="{ cancel }">
      <div class="w-100 d-flex justify-content-end">
        <button
          id="headingSave"
          type="button"
          class="btn btn-primary mr-1"
          @click="onOk"
        >
          Ok
        </button>
        <button
          type="button"
          class="btn btn-outline-primary ml-1"
          @click="cancel"
        >
          Close
        </button>
      </div>
    </template>
  </b-modal>
</template>
<script>
import { mapGetters } from 'vuex';
import { SET_PAPER_INFO } from 'app/store/paper.module';
import { saveClipsAPI } from 'app/api';

export default {
  name: 'SectionTitleModal',
  props: {
    createType: {
      type: String,
      default: 'create',
    },
    clipId: {
      type: String,
      default: '-1',
    },
    clipType: {
      type: String,
      default: 'heading',
    },
    propTitleValue: {
      type: String,
      default: '',
    },
    propShowModal: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters(['transcriptInfo']),
  },
  data: function () {
    return {
      title: '',
      showModal: false,
    };
  },
  watch: {
    propShowModal: function () {
      this.showModal = this.propShowModal;
      if (this.propShowModal) this.title = this.propTitleValue;
    },
    propTitleValue: function () {
      this.title = this.propTitleValue;
    },
  },

  methods: {
    resetModal: function () {
      this.$emit('onHide');
    },
    onOk: async function () {
      if (this.title === this.propTitleValue) {
        this.$emit('onHide');
      } else {
        let content = '';
        if (this.clipType === 'heading') {
          content = `<h3>${this.title}</h3>`;
        } else if (this.clipType === 'voice') {
          content = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="microphone-alt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512" class="svg-inline--fa fa-microphone-alt fa-w-11"><path fill="currentColor" d="M336 192h-16c-8.84 0-16 7.16-16 16v48c0 74.8-64.49 134.82-140.79 127.38C96.71 376.89 48 317.11 48 250.3V208c0-8.84-7.16-16-16-16H16c-8.84 0-16 7.16-16 16v40.16c0 89.64 63.97 169.55 152 181.69V464H96c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16h-56v-33.77C285.71 418.47 352 344.9 352 256v-48c0-8.84-7.16-16-16-16zM176 352c53.02 0 96-42.98 96-96h-85.33c-5.89 0-10.67-3.58-10.67-8v-16c0-4.42 4.78-8 10.67-8H272v-32h-85.33c-5.89 0-10.67-3.58-10.67-8v-16c0-4.42 4.78-8 10.67-8H272v-32h-85.33c-5.89 0-10.67-3.58-10.67-8v-16c0-4.42 4.78-8 10.67-8H272c0-53.02-42.98-96-96-96S80 42.98 80 96v160c0 53.02 42.98 96 96 96z" class="mr-2"></path></svg><span>${this.title}</span>`;
        } else if (this.clipType === 'note') {
          content = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sticky-note" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-sticky-note fa-w-14"><path fill="currentColor" d="M312 320h136V56c0-13.3-10.7-24-24-24H24C10.7 32 0 42.7 0 56v400c0 13.3 10.7 24 24 24h264V344c0-13.2 10.8-24 24-24zm129 55l-98 98c-4.5 4.5-10.6 7-17 7h-6V352h128v6.1c0 6.3-2.5 12.4-7 16.9z" class="mr-2"></path></svg><span>${this.title}</span>`;
        }

        let tempClips = [];
        if (this.createType === 'create') {
          let newClip = {
            type: this.clipType,
            name: this.title,
            videoPath: '',
            start_time: 0,
            end_time: 0,
            elements: content,
            sentence: '',
            back_color: '',
          };
          tempClips = [newClip, ...this.paperInfo.clips];
          // this.$store.dispatch(SET_TRANSCRIPT_INFO, {
          //   clips: [newClip, ...this.paperInfo.clips],
          //   cur_clip_index: this.paperInfo.cur_clip_index + 1,
          // });
        } else {
          tempClips = this.paperInfo.clips.map((item, idx) => {
            if (item.id === this.clipId && item.type === this.clipType) {
              return {
                ...item,
                name: this.title,
                elements: content,
              };
            }
            return item;
          });
        }

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
          cur_clip_index: res.length,
        });

        this.$emit('onHide');
      }
    },
  },
};
</script>
