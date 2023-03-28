<template>
  <div
    :class="`tag-input ${focused ? 'focused' : ''}`"
    @click="clickWrapper"
    @blur="
      () => {
        focused = false;
      }
    "
  >
    <div v-for="(tag, index) in tags" :key="tag + index" class="tag-input__tag">
      {{ tag }}
      <span @click="($event) => removeTag($event, index)">x</span>
    </div>
    <input
      type="text"
      placeholder="Type comma or hit Enter to add"
      class="tag-input__text"
      @keydown.enter="addTag"
      @keydown.188="addTag"
      @keydown.delete="removeLastTag"
      @focus="
        () => {
          focused = true;
        }
      "
      @blur="
        () => {
          focused = false;
        }
      "
    />
  </div>
</template>
<script>
  export default {
    name: 'EdmonTagsInput',
    props: {
      tagsProps: {
        type: Array,
        required: true,
        default: function () {
          return [];
        },
      },
    },
    data: function () {
      return {
        tags: [],
        focused: false,
      };
    },
    watch: {
      tagsProps: {
        handler(val) {
          this.tags = val ? val : [];
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      clickWrapper(event) {
        event.preventDefault();
        this.focused = true;
      },
      addTag(event) {
        event.preventDefault();
        var val = event.target.value.trim();
        if (val.length > 0 && this.tags.indexOf(val) < 0) {
          this.$emit('onChange', [...this.tags, val]);
          event.target.value = '';
        }
      },
      removeTag(event, index) {
        event.preventDefault();
        event.stopPropagation();

        // Remove the item at the given `index`
        this.tags.splice(index, 1);

        this.$emit('onChange', this.tags);
      },
      removeLastTag(event) {
        if (event.target.value.length === 0) {
          this.removeTag(event, this.tags.length - 1);
        }
      },
    },
  };
</script>
<style scoped lang="scss">
  .tag-input {
    width: 100%;
    border: 1px solid transparent;
    font-size: 0.8em;
    min-height: 38px;
    box-sizing: border-box;
    padding: 0 10px;
    border-radius: 4px;
    background-color: rgb(0, 0, 0);
    display: flex;
    flex-wrap: wrap;
    padding-bottom: 6px;
    &.focused {
      border: 1px solid#5d78ff;
    }
  }

  .tag-input__tag {
    height: 24px;
    line-height: 24px;
    float: left;
    margin-right: 10px;
    color: white;
    background-color: rgba(255, 255, 255, 0.2);
    margin-top: 6px;
    padding: 0 30px 0 10px;
    border-radius: 50px;
    font-size: 0.7rem;
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
    font-weight: normal;
    position: relative;

    > span {
      cursor: pointer;
      color: var(--danger);
      font-weight: bold;
      font-size: 0.8rem;
      right: 0px;
      position: absolute;
      width: 24px;
      height: 100%;
      text-align: center;
      border-radius: 50%;

      &:hover {
        color: white;
        background: var(--danger);
      }
    }
  }

  .tag-input__text {
    border: none;
    outline: none;
    font-size: 0.8rem;
    line-height: 20px;
    height: 24px;
    margin-top: 6px;
    background: none;
    color: var(--gray) !important;
    flex: 1 1 auto;
    min-width: 100px;
  }
</style>
