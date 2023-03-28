<template>
  <div class="vue-color-popover-wrapper">
    <div class="poover-anchor" :id="`vue-popover-target-${compId}`">
      <fa-icon :icon="['fas', 'palette']" />
    </div>

    <b-popover
      :target="`vue-popover-target-${compId}`"
      @hidden="onHidden"
      triggers="click blur"
    >
      <Sketch v-model="color"></Sketch>
    </b-popover>
  </div>
</template>
<script>
import { Sketch } from 'vue-color';

export default {
  name: 'VueColorPopover',
  components: { Sketch },
  props: {
    compId: {
      type: String,
      default: new Date().valueOf().toString(),
    },
    propColor: {
      type: String,
      default: 'transparent',
    },
  },
  watch: {
    propColor: function () {
      if (this.propColor) this.color.hex8 = this.propColor;
      else this.color.hex8 = '#00000000';
    },
  },
  data: function () {
    return {
      color: { hex8: '#00000000' },
    };
  },

  methods: {
    onHidden: function () {
      this.$emit('changeColor', this.color.hex8);
    },
  },
};
</script>

<style lang="scss" scoped>
.vue-color-popover-wrapper {
  display: inline-flex;
  .poover-anchor {
    width: 14px;
    height: 14px;
    display: flex;
    align-items: flex-start;
  }
}
</style>
