<template>
  <b-modal :id="componentId" centered @hidden="resetModal">
    <template #modal-header="{ close }">
      <h4 class="modal-title" id="paperModalHeader">
        {{ formData.id === -1 ? 'New Paper' : 'Edit Paper' }}
      </h4>
      <button type="button" class="close" data-dismiss="modal" @click="close()">
        &times;
      </button>
    </template>
    <form id="paperForm">
      <b-form-group
        label="Title"
        label-for="paperTitle"
        :state="formData.title.length > 0 && submitted"
        :invalid-feedback="
          formData.title.length === 0 && submitted ? 'Please input title' : ''
        "
        autocomplete="off"
      >
        <input
          id="paperTitle"
          type="text"
          placeholder="Enter a paper title"
          name="paperTitle"
          :class="getInputValidateClass('title')"
          v-model="formData.title"
        />
      </b-form-group>
      <b-form-group
        label="Description"
        label-for="paperDescription"
        description="Chose an optional description"
        autocomplete="off"
      >
        <input
          type="text"
          placeholder="Enter a paper description"
          id="paperDescription"
          class="form-control"
          name="paperDescription"
          v-model="formData.description"
        />
      </b-form-group>
    </form>
    <template #modal-footer="{ ok, cancel }">
      <div class="w-100 d-flex justify-content-end">
        <button
          type="button"
          class="btn btn-primary mr-1"
          id="btnPaperSave"
          @click="savePaper(ok)"
        >
          Save
        </button>
        <button
          type="button"
          class="btn btn-outline-primary ml-1"
          data-dismiss="modal"
          @click="cancel()"
        >
          Close
        </button>
      </div>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'PaperModal',
  data: function () {
    return {
      submitted: false,
      formData: {
        id: -1,
        title: '',
        description: '',
      },
    };
  },
  props: {
    componentId: {
      type: String,
      default: 'paper-modal',
    },
    paper: {
      type: Object,
      default: function () {
        return {
          id: -1,
          title: '',
          description: '',
        };
      },
    },
  },
  watch: {
    paper: {
      handler(newVal) {
        this.formData = {
          ...newVal,
        };
      },
      deep: true,
    },
  },
  computed: {
    titleInputValidate: function () {
      if (!this.submitted) return '';
      if (this.formData.title.length > 0) return 'is-valid';
      else return 'is-invalid';
    },
  },
  methods: {
    getInputValidateClass: function (keyName) {
      let returnClassStr = 'form-control ';
      if (this.submitted) {
        if (this.formData[keyName].trim().length > 0)
          returnClassStr += 'is-valid';
        else returnClassStr += 'is-invalid';
      }
      return returnClassStr;
    },

    resetModal() {
      this.formData = {
        title: '',
        description: '',
      };
      this.submitted = false;
    },
    savePaper(closeModal) {
      this.submitted = true;
      if (this.formData.title.length === 0) return;
      this.$emit('createPaper', {
        ...this.formData,
      });
      closeModal();
    },
  },
};
</script>
