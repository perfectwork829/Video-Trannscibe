<template>
  <b-modal id="project-modal" centered>
    <template #modal-header="{ close }">
      <h4 class="modal-title" id="projectModalHeader">
        {{ formData.id === -1 ? 'New Project' : 'Edit Project' }}
      </h4>
      <button type="button" class="close" data-dismiss="modal" @click="close()">&times;</button>
    </template>

    <form id="projectForm">
      <!-- Title -->
      <b-form-group label="Title" autocomplete="off">
        <b-form-input v-model="formData.title" placeholder="Ex: Awesome project" autofocus required />
      </b-form-group>
    </form>

    <template #modal-footer="{ ok, cancel }">
      <div class="w-100 d-flex justify-content-between">
        <button type="button" class="btn btn-outline-primary" data-dismiss="modal" @click="cancel()">Close</button>
        <b-button variant="primary" class="ml-2" @click="saveProject(ok)" :disabled="!hasValidTitle()"> Save </b-button>
      </div>
    </template>
  </b-modal>
</template>

<script>
  export default {
    name: 'ProjectModal',
    data: function () {
      return {
        formData: {
          id: -1,
          title: '',
          description: '',
          type: { value: '', label: 'None' },
          participants: [],
          sharing: false,
        },
      };
    },
    props: {
      project: {
        type: Object,
        default: function () {
          return {
            id: -1,
            title: '',
            description: '',
            type: { value: '', label: 'None' },
            participants: [],
            sharing: false,
          };
        },
      },
    },
    watch: {
      project: {
        handler(newVal) {
          this.formData = {
            ...newVal,
            type: newVal.type ? { value: newVal.type, label: newVal.type } : { value: '', label: 'None' },
            participants:
              typeof newVal.participants === 'string'
                ? newVal.participants.length > 0
                  ? newVal.splite(',')
                  : []
                : newVal.participants,
          };
        },
        deep: true,
      },
    },
    methods: {
      hasValidTitle() {
        return this.formData?.title?.trim()?.length > 0;
      },
      saveProject(closeModal) {
        this.$emit('createProject', {
          ...this.formData,
          type: this.formData.type.value,
        });

        closeModal();
      },
    },
  };
</script>
