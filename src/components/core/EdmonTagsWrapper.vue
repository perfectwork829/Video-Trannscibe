<template>
  <div class="edmon-tags-wrapper-component">
    <span class="edmon-tag-item" v-for="(item, idx) in tags" :key="idx">
      {{ `${item.type} - ${item.label}` }}
      <fa-icon
        class="remove-tag"
        :icon="['fas', 'times']"
        @click="removeTag(item)"
      ></fa-icon>
    </span>
  </div>
</template>

<script>
export default {
  name: 'EdmonTagsWrapper',
  props: {
    tags: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  methods: {
    removeTag: function (selectedTag) {
      this.$emit('removeTag', selectedTag);
    },
  },
};
</script>

<style lang="scss" scoped>
.edmon-tags-wrapper-component {
  display: flex;
  flex-wrap: wrap;

  .edmon-tag-item {
    display: flex;
    font-size: 0.7rem;
    line-height: 1.2;
    font-weight: 300;
    color: white;
    padding: 2.5px 7.5px;
    align-items: center;
    justify-content: flex-start;
    background-color: #5d78ff;
    border-radius: 4px;
    margin: 5px;

    .remove-tag {
      font-weight: bold;
      color: white;
      font-size: 0.9rem;
      margin-left: 5px;
      cursor: pointer;
    }
  }
}
</style>
