<template>
  <b-modal
    :id="componentId"
    centered
    size="md"
    @hidden="resetModal"
    content-class="confirm-modal-wrapper"
  >
    <h4>{{ title }}</h4>
    <div class="d-flex justify-content-center">
      <b-button class="mr-1 btn-cancel" @click="onCancel">Cancel</b-button>
      <b-button class="ml-1" variant="danger" @click="onOk">Ok</b-button>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    componentId: {
      type: String,
      default: 'confirm-modal',
    },
    title: {
      type: String,
      default: '',
    },
  },
  methods: {
    onOk() {
      this.$emit('onOk');
      this.$bvModal.hide(this.componentId);
    },
    onCancel() {
      this.$emit('onCancel');
      this.$bvModal.hide(this.componentId);
    },
    resetModal() {
      this.$emit('onCancel');
    },
  },
};
</script>

<style lang="scss">
.confirm-modal-wrapper {
  header {
    display: none;
  }
  footer {
    display: none;
  }
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

    .btn-cancel {
      color: white;
      background-color: #6c757d;
      border-color: #6c757d;
    }

    .btn-danger {
      background-color: #bb2d3b;
      border-color: #b02a37;
      color: white;
    }
  }
}
</style>
