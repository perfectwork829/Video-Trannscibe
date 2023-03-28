<template>
  <div class="edmon-custom-select" v-click-outside="hide">
    <div class="selected" :style="customStyle" :class="{ open: open }" @click="open = !open" ref="anchor-div">
      {{ selected.label || placeholder }}
    </div>
    <div class="items" :class="{ selectHide: !open }" ref="anchro-dropdown">
      <div
        v-for="(option, i) of options"
        :key="i"
        @click="() => onChange(option)"
        :class="option.value === selected.value ? 'active' : ''"
        :style="customStyle"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'EdmonSelect',
    props: {
      placeholder: {
        type: String,
        default: 'Please select',
      },
      options: {
        type: Array,
        required: true,
      },
      value: {
        type: Object,
        required: false,
        default: null,
      },
      customStyle: {
        type: String,
        default: '',
      },
    },
    data: function () {
      return {
        selected: this.value ? this.value : this.options.length > 0 ? this.options[0] : null,
        open: false,
      };
    },
    watch: {
      value: {
        handler(val) {
          this.selected = val;
        },
        deep: true,
      },
      open: function (newVal) {
        if (newVal) {
          const anchorRef = this.$refs['anchor-div'];
          const anchroDropdownRef = this.$refs['anchro-dropdown'];

          const left = anchorRef.getBoundingClientRect().left;
          const right = anchorRef.getBoundingClientRect().right;
          const bottom = anchorRef.getBoundingClientRect().bottom;

          anchroDropdownRef.style.left = `${left}px`;
          anchroDropdownRef.style.top = `${bottom}px`;
          anchroDropdownRef.style.width = `${right - left}px`;
        }
      },
    },
    mounted() {},
    methods: {
      onChange(value) {
        this.open = false;
        this.$emit('onChange', value);
      },
      hide() {
        this.open = false;
      },
    },
  };
</script>
<style scoped lang="scss">
  .edmon-custom-select {
    position: relative;
    width: 100%;
    text-align: left;
    outline: none;
    height: 38px;
    line-height: 38px;
  }

  .edmon-custom-select .selected {
    background-color: #000;
    border-radius: 4px;
    border: 1px solid transparent;
    color: var(--gray);
    padding-left: 1em;
    padding-right: 1.5rem;
    cursor: pointer;
    user-select: none;
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 38px;
  }

  .edmon-custom-select .selected.open {
    border: 1px solid #5d78ff !important;
    border-radius: 4px 4px 0px 0px;
  }

  .edmon-custom-select .selected:after {
    position: absolute;
    content: '';
    top: 60%;
    transform: translateY(-50%);
    right: 1em;
    width: 0;
    height: 0;
    border: 5px solid transparent;
    border-color: var(--gray) transparent transparent transparent;
  }

  .edmon-custom-select .items {
    position: fixed;
    color: var(--gray);
    border-radius: 0px 0px 4px 4px;
    overflow: hidden;
    border-right: 1px solid #5d78ff;
    border-left: 1px solid #5d78ff;
    border-bottom: 1px solid #5d78ff;
    background-color: #0a0a0a;
    z-index: 1;
    max-height: 320px;
    overflow-y: auto;
  }

  .edmon-custom-select .items > div {
    color: var(--gray);
    padding-left: 1em;
    cursor: pointer;
    user-select: none;
    font-size: 0.8rem;
  }

  .edmon-custom-select .items > div.active {
    background-color: #5d78ff;
    color: white;
  }

  .edmon-custom-select .items > div:hover {
    background-color: #5d78ff;
    color: white;
  }

  .selectHide {
    display: none;
  }
</style>
