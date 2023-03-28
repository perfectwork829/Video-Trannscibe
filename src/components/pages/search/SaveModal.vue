<template>
  <b-modal :id="componentId" centered @hidden="resetModal">
    <template #modal-header="{ close }">
      <h4 class="modal-title">
        Save Search
      </h4>
      <button type="button" class="close" data-dismiss="modal" @click="close()">
        &times;
      </button>
    </template>
    <b-form @submit="e => e.preventDefault()" id="folderForm">
      <b-form-group
        label="Title"
        label-for="SearchTitle"
        :state="formData.title && formData.title.length > 0 && submitted"
        :invalid-feedback="
          formData.title && formData.title.length === 0 && submitted ? 'Please input title' : ''
        "
        autocomplete="off"
      >
        <input
          id="searchTitle"
          type="text"
          placeholder="Enter a search title"
          name="searchTitle"
          :class="getInputValidateClass('title')"
          v-model="formData.title"
        />
      </b-form-group>
    </b-form>
    <template #modal-footer="{ ok, cancel }">
      <div class="w-100 d-flex justify-content-end">
        <button
          type="button"
          class="btn btn-primary mr-1"
          @click="saveSearch(ok)"
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
  name: 'SearchModal',
  data: function () {
    return {
      submitted: false,
      formData: {
        id: -1,
        title: ''
      },
    };
  },
  props: {
    componentId: {
      type: String,
      default: 'search-modal',
    },
    search: {
      type: Object,
      default: () => null
    },
  },
  watch: {
    // folder: {
    //   handler(newVal) {
    //     if (newVal) {
    //       this.formData = {
    //         ...newVal,
    //       };
    //     }
    //   },
    //   deep: true,
      // immediate: true
    // },
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
        id: -1,
        title: '',
      };
      this.submitted = false;
    },
    saveSearch(closeModal) {
      this.submitted = true;
      if (this.formData.title.length === 0) return;
      // console.log('folder', this.formData)
      this.$emit('saveSearch', {
        ...this.formData,
      });
      closeModal();
    },
  },
};
</script>
