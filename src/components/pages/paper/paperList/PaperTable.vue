<template>
  <table class="paper-list-table table">
    <tbody>
      <tr v-for="(item, idx) in paperData" :key="idx">
        <td>
          <div class="td-info-content">
            <fa-icon class="info-icon" :icon="['fas', 'file-video']" />

            <div class="info-text-div">
              <h5 @click="onPaper(item.id)">{{ item.title }}</h5>
              <p>{{ item.description || '' }}</p>
            </div>
          </div>
        </td>
        <td v-if="showAction">
          <div class="action-btn-wrapper">
            <div @click="showPaperModal(item)" class="btn-action btn-edit">
              <fa-icon :icon="['fas', 'pencil-alt']" />
            </div>
            <div @click="onDeletePaper(item)" class="btn-action btn-delete">
              <fa-icon :icon="['fas', 'trash']" />
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'PaperTable',
  props: {
    paperData: {
      type: Array,
      default: function () {
        return [];
      },
    },
    showAction: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onPaper: function (paperId) {
      this.$emit('onPaper', paperId);
    },
    showPaperModal: function (paper) {
      this.$emit('showPaperModal', paper);
    },
    onDeletePaper: function (paper) {
      this.$emit('onDeletePaper', paper);
    },
  },
};
</script>
<style lang="scss" scoped>
.paper-list-table {
  width: 100%;
  margin: 0;
  td {
    vertical-align: middle;
    border: none;
  }

  .action-btn-wrapper {
    display: flex;
    justify-content: flex-end;
    .btn-action {
      padding: 5px;
      font-size: 18px;
      display: inline-block;
      cursor: pointer;

      &.btn-edit {
        color: #5d78ff;
      }
      &.btn-delete {
        color: #e50202;
      }
    }
  }
}
</style>
