<template>
  <div
    :class="wrapperClass"
    draggable
    @dragstart="startDrag"
    @dragend="endDrag"
    @drop="onDrop"
    @click="onClick"
    @dragenter.prevent
    @dragover.prevent
  >
    <template v-if="clipData.type === 'clip'">
      <div
        class="wrapper"
        :style="`background-color: ${clipTypeBackColor}`"
        data-type="clip"
        :data-path="clipData.videoPath"
      >
        <template v-if="paperInfo.bPostit">
          <div class="clip-item-header">
            <div class="drag-item">
              <div class="clip-drag-item"></div>
            </div>
            <!-- <div class="palette-item">
              <vue-color-popover
                :compId="`${clipData.id}-positive`"
                :propColor="clipData.back_color"
                @changeColor="updateColor"
              ></vue-color-popover>
            </div> -->
            <div class="delete-item">
              <fa-icon :icon="['fas', 'trash']" @click="deleteItem" />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="drag-item">
            <div class="clip-drag-item"></div>
          </div>
        </template>

        <div class="img-wrapper">
          <img
            v-if="clipData.thumbnail && clipData.thumbnail.length"
            :src="clipData.thumbnail"
          />
        </div>
        <div class="content">
          <span class="clip-title">{{ title }} <br/> {{meta}} <br/> {{speaker}}</span>
          <!-- <span class="clip-meta"></span> -->
          <br />
          <span v-html="clipData.elements"></span>
        </div>
        <!-- <div class="palette-item">
          <vue-color-popover
            :compId="clipData.id"
            :propColor="clipData.back_color"
            @changeColor="updateColor"
          ></vue-color-popover>
        </div> -->
        <div class="delete-item">
          <fa-icon :icon="['fas', 'trash']" @click="deleteItem" />
        </div>
      </div>
    </template>
    <template v-else-if="clipData.type === 'interval'">
      <div class="wrapper" data-type="interval">
        <template v-if="paperInfo.bPostit">
          <div class="clip-item-header">
            <div class="drag-item">
              <div class="clip-drag-item"></div>
            </div>
            <div class="delete-item">
              <fa-icon :icon="['fas', 'trash']" @click="deleteItem" />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="drag-item">
            <div class="clip-drag-item"></div>
          </div>
        </template>

        <div class="content">
          <fa-icon :icon="['fas', 'arrow-circle-right']" />
          Interval
        </div>
        <div class="delete-item">
          <fa-icon :icon="['fas', 'trash']" @click="deleteItem" />
        </div>
      </div>
    </template>
    <template v-else-if="clipData.type === 'final'">
      <div class="wrapper">
        <template v-if="paperInfo.bPostit">
          <div class="clip-item-header">
            <div class="drag-item">
              <div class="clip-drag-item"></div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="drag-item">
            <div class="clip-drag-item"></div>
          </div>
        </template>

        <div class="content">
          <span>
            <fa-icon :icon="['fas', 'arrow-circle-right']" />
            &nbsp;&nbsp;Insert Point to add selection
            <fa-icon
              :icon="['fas', 'arrow-circle-left']"
              style="margin-left: auto"
            />
          </span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="wrapper" :data-type="clipData.type">
        <template v-if="paperInfo.bPostit">
          <div class="clip-item-header">
            <div class="drag-item">
              <div class="clip-drag-item"></div>
            </div>
            <div class="edit-item">
              <fa-icon :icon="['fas', 'pencil-alt']" @click="onEdit" />
            </div>
            <div class="delete-item">
              <fa-icon :icon="['fas', 'trash']" @click="deleteItem" />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="drag-item">
            <div class="clip-drag-item"></div>
          </div>
        </template>

        <div class="content" v-html="clipData.elements"></div>
        <template v-if="!paperInfo.bPostit">
          <div class="edit-item">
            <fa-icon :icon="['fas', 'pencil-alt']" @click="onEdit" />
          </div>
          <div class="delete-item">
            <fa-icon :icon="['fas', 'trash']" @click="deleteItem" />
          </div>
        </template>
      </div>
    </template>
    <template
      v-if="
        clipData.type !== 'clip' &&
        clipData.type !== 'final' &&
        clipData.type !== 'interval'
      "
    >
      <section-title-modal
        :createType="'edit'"
        :clipId="clipData.id"
        :clipType="clipData.type"
        :propShowModal="showSectionModal"
        :propTitleValue="itemContentStr"
        @onHide="hideSectionModal"
      ></section-title-modal>
    </template>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import { SET_PAPER_INFO } from 'app/store/paper.module';
import { formatTime } from 'app/utils';
import SectionTitleModal from './SectionTitleModal.vue';
// import VueColorPopover from 'app/components/sharedComponents/VueColorPopover.vue';
import { saveClipsAPI } from 'app/api';
import { hexToRGBA } from 'app/utils';
export default {
  name: 'ClipItem',
  components: { 
    SectionTitleModal, 
    // VueColorPopover 
  },
  props: {
    orderIndex: {
      type: Number,
      default: 0,
    },
    dragClipIndex: {
      type: Number,
      default: 0,
    },
    clipData: {
      type: Object,
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      showSectionModal: false,
    };
  },
  computed: {
    ...mapGetters(['transcriptInfo', 'paperInfo']),
    title: function () {
      const title = this.clipData.path || this.clipData.name
      return `${title}`;
    },
    meta: function() {
      return `In: ${formatTime(this.clipData.start_time)} Out: ${formatTime(this.clipData.end_time)} Dur: ${formatTime(this.clipData.end_time - this.clipData.start_time)}`
    },
    speaker: function() {
      const speaker = isNaN(this.clipData.speaker)
                ? this.clipData.speaker
                : 'Speaker ' + (parseInt(this.clipData.speaker) + 1);
      return `Speaker: ${speaker}`
    },
    wrapperClass: function () {
      if (this.clipData.type === 'clip') return 'clip-item-wrapper clip-type';
      else if (this.clipData.type === 'interval')
        return 'clip-item-wrapper clip-interval';
      else if (this.clipData.type === 'final') return 'clip-item-wrapper final';
      return `clip-item-wrapper ${this.clipData.type}`;
    },
    itemContentStr: function () {
      if (!this.clipData) return '';
      if (this.clipData.type === 'heading') {
        let contentStr = this.clipData.elements
          .replace('<h3>', '')
          .replace('</h3>', '');
        return contentStr;
      }
      return '';
    },
    clipTypeBackColor: function () {
      return hexToRGBA(this.clipData.back_color);
    },
  },
  methods: {
    deleteItem: function () {
      this.$emit('delete', this.orderIndex);
    },
    opPalette: function () {},
    onEdit: function () {
      this.showSectionModal = true;
    },
    hideSectionModal: function () {
      this.showSectionModal = false;
    },
    updateColor: async function (updatedColor) {
      const tempClips = this.paperInfo.clips.map((item) => {
        if (item.id === this.clipData.id)
          return {
            ...item,
            back_color: updatedColor,
          };
        return item;
      });

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
      });
    },
    startDrag: function () {
      this.$emit('setDragIndex', this.orderIndex);
    },
    endDrag: function () {
      this.$emit('setDragIndex', -1);
    },
    onDrop: function () {
      this.$emit('changeOrder', this.orderIndex);
    },
    onClick: function() {
      this.$emit('onSelect', true)
    }
  },
};
</script>
<style lang="scss" scoped>
.clip-title {
  font-style: italic;
  font-size: smaller;
}
</style>
