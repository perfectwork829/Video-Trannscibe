<template>
  <b-modal :id="componentId" centered content-class="alert-modal-wrapper">
    <template #modal-header="{ close }">
      <h4 class="modal-title" id="alertModalHeader">{{ header }}</h4>
      <button type="button" class="close" data-dismiss="modal" @click="close()">&times;</button>
    </template>
    <form id="alertForm">
      <p>{{ content }}</p>
    </form>
    <template #modal-footer="{ ok }">
      <div class="d-flex justify-content-center">
        <b-button class="ml-1 btn-danger" variant="danger" @click="onOk(ok)">OK</b-button>
      </div>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'AlertModal',
  props: {
    header: {
      type: String,
      default: 'Error',
    },
    content: {
      type: String,
      default: '',
    },
    componentId: {
      type: String,
      default: 'alert-modal',
    },
  },
  methods: {
    onOk() {
      this.$emit('onOk');
      this.$bvModal.hide(this.componentId);
    },
    resetModal() {
      this.$emit('onCancel');
    },
  },
};
</script>

<style lang="scss">
.alert-modal-wrapper {
  .modal-content {
    min-height: 160px;
    background-color: #131722;

    .modal-body {
      display: flex;
      flex-direction: column;
      justify-content: center;

      h4 {
        text-align: center;
        margin-bottom: 1rem;
        color: white;
      }

      .btn-danger {
        background-color: #bb2d3b;
        border-color: #b02a37;
        color: white;
      }
    }
  }
}
</style>
