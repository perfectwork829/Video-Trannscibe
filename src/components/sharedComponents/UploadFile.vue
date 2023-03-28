<template>

  <div class="mt-3">
    <b-alert :show="dismissCountDown" dismissible variant="warning" @dismissed="dismissCountDown = 0"
      @dismiss-count-down="countDownChanged">
      Please select the file {{ dismissCountDown }} ...
    </b-alert>
    <b-form-file v-model="file" :state="Boolean(file)" placeholder="Choose a file or drop it here..."
      drop-placeholder="Drop file here..." class="form-control"></b-form-file>

    <div class="mt-3 text-right">
      <b-button variant="primary" class="text-right" @click="uploadToFirebase">Upload</b-button>
    </div>
    <b-modal ref="uploading-modal" hide-footer title="Upload an audio/video file!">
      <template v-if="uploadingProgress < 100">
        <div class="d-block text-center">
          <h3>Uploading</h3>
          <b-progress :value="uploadingProgress" :max="uploadingMax" height="2rem" show-progress animated></b-progress>
        </div>
        <b-button class="mt-3" variant="outline-danger" block @click="cancelUploading">Cancel</b-button>
      </template>
      <template v-else>
        <div class="d-block text-center">
          <h3>Select language</h3>
          <b-form-select v-model="selectedLanguage" :options="languageOptions" class="mb-3" value-field="item"
            text-field="name" disabled-field="notEnabled"></b-form-select>
        </div>
        <b-button class="mt-3" variant="outline-success" block @click="transcribe">Transcribe</b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import axios from 'axios';
import firebase from 'plugins/firebase';
import { saveMediaAPI } from '../../api';


export default {
  name: 'uploadfile',
  components: {
    // PreLoader
  },
  data() {
    return {
      file: null,
      uploadingProgress: 0,
      uploadingMax: 100,
      uploading: false,
      storageRef: null,
      languageOptions: [
        { item: 'en', name: 'English' },
        { item: 'sv', name: 'Swedish' },
      ],
      selectedLanguage: 'en',
      uploadUrl: null,
      dismissSecs: 5,
      dismissCountDown: 0

    };
  },

  methods: {
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },

    uploadToFirebase: function () {
      // this.dismissCountDown = this.dismissSecs
      // checkFileFlag = true;
      this.uploading = true;

      const timestamp = new Date().getTime();
      if (this.file != null) {
        this.showUploadingModal();
        const splittedName = this.file.name.split('.');
        const ext = splittedName[splittedName.length - 1];
        splittedName.pop();
        const newName = splittedName.join('.') + '_' + timestamp;
        this.storageRef = firebase
          .storage()
          .ref('edmon_videos/' + newName + '.' + ext)
          .put(this.file);
        this.storageRef.on(
          'state_changed',
          (snapShot) => {
            this.uploadingProgress = (snapShot.bytesTransferred / snapShot.totalBytes) * 100;
          },
          (err) => {
            console.log(err.message);
            this.uploading = false;
          },
          () => {
            // this.hideUploadingModal();
            this.storageRef.snapshot.ref.getDownloadURL().then((url) => {
              this.uploadUrl = url;
              this.uploadingProgress = 100;
              this.uploading = false;
            });
          }
        );
      } else {
        this.dismissCountDown = this.dismissSecs
      }

    },
    transcribe() {
      console.log("asdfasdf");
      saveMediaAPI(this.$route.params.projectId, this.uploadUrl, this.file.name, this.selectedLanguage).then((val) => {
        this.hideUploadingModal();
      });
    },
    cancelUploading() {
      this.storageRef.cancel();
      this.hideUploadingModal();
    },
    showUploadingModal() {
      this.$refs['uploading-modal'].show();
    },
    hideUploadingModal() {
      this.$refs['uploading-modal'].hide();
    },
  },
};
</script>
<style lang="scss">
.custom-file-label {
  border-radius: 4px;
  border: 1px solid transparent;
  // padding: 0px 15px;
  font-size: 16px;
  font-weight: 400;
  color: #a1a0a7;
  transition: border 0.3s ease-in-out;
  background-color: #000;
  min-height: 38px;
  box-shadow: none !important;
  outline: none !important;
}

.custom-file-label:after {
  background-color: #000;
  color: #a1a0a7;
}
</style>
