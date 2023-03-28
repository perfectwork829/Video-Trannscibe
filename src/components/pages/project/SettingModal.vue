<template>
  <b-modal id="setting-modal" @shown="modelShown" centered>
    <template #modal-header="{ close }">
      <h4 class="modal-title">Settings</h4>
      <button type="button" class="close" data-dismiss="modal" @click="close()">
        &times;
      </button>
    </template>
    <b-form-group
      label="API Token"
      label-for="apiToken"
      :state="apiToken.length > 0"
      :invalid-feedback="apiToken.length > 0 ? '' : 'Field is required'"
    >
      <input
        id="apiToken"
        type="text"
        placeholder="API Token"
        name="apiToken"
        :class="`form-control ${
          apiToken.length > 0 ? 'is-valid' : 'is-invalid'
        }`"
        v-model="apiToken"
        required
      />
    </b-form-group>
    <template #modal-footer="{ ok, cancel }">
      <div class="w-100 d-flex justify-content-end">
        <button
          type="button"
          class="btn btn-primary mr-1"
          id="btnProjectSave"
          @click="onSave(ok)"
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
import { updateApiTokenAPI } from 'app/api';

export default {
  name: 'SettingModal',
  props: ['apiTokenProp'],
  data: function () {
    return {
      apiToken: '',
    };
  },
  methods: {
    modelShown() {
      this.apiToken = this.apiTokenProp;
    },
    async onSave(closeModal) {
      try {
        if (this.apiToken !== this.apiTokenProp) {
          const res = await updateApiTokenAPI(this.apiToken);
          if (res.status === 200) {
            this.$emit('updateApiToken', this.apiToken);
            closeModal();
          } else {
            alert('Update api token failed');
          }
        }
      } catch (err) {
        alert('Update api token failed');
      }
    },
  },
};
</script>
