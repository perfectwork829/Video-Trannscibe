<template>
  <ul class="nav nav-tab top-tab">
    <li class="nav-item" v-for="item in tabs" :key="item.value">
      <a
        :class="`nav-link ${activeTab.value === item.value ? 'active' : ''}`"
        :active-id="item.value"
        @click="$emit('onChange', item)"
      >
        {{ item.label }}
      </a>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'TopTab',
  props: {
    tabs: {
      type: Array,
      required: true,
      default: function () {
        return [];
      },
    },
    activeTab: {
      type: Object,
      required: true,
      default: function () {
        return { value: '', label: '' };
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.top-tab {
  width: 100%;
  background-color: #000;
  border: none;
  .nav-link {
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    cursor: pointer;

    &.active {
      color: #ffffff;
      background-color: #131722;
      border-color: transparent;
      pointer-events: none;
    }
  }
  .nav-item {
    &.show {
      .nav-link {
        color: #ffffff;
        background-color: #131722;
        border-color: transparent;
      }
    }
  }
}
</style>
