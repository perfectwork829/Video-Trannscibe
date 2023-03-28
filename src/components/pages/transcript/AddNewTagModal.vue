<template>
  <b-modal
    id="transcript-window-add-newtag-modal"
    centered
    @hidden="resetModal"
  >
    <template #modal-header="{ close }">
      <h4 class="modal-title">Add New Tag</h4>
      <button type="button" class="close" data-dismiss="modal" @click="close()">
        &times;
      </button>
    </template>
    <div class="row">
      <div class="form-group col-6">
        <label>Tag</label>
        <edmon-select
          :value="tagName"
          :options="
            transcriptInfo.fieldSettings
              ? transcriptInfo.fieldSettings.map((item) => {
                  return { value: item.fieldName, label: item.fieldName };
                })
              : []
          "
          @onChange="changeTagName"
        ></edmon-select>
      </div>
      <div class="form-group col-6">
        <label label-for="add-newtag-value">Value</label>
        <input class="form-control" v-model="tagValue" />
      </div>
    </div>
    <template #modal-footer="{ ok, cancel }">
      <div class="w-100 d-flex justify-content-end">
        <button
          id="btnAddNewTag"
          type="button"
          class="btn btn-primary mr-1"
          @click="onOk(ok)"
        >
          Add
        </button>
        <button
          type="button"
          class="btn btn-outline-primary ml-1"
          @click="cancel()"
        >
          Close
        </button>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters } from 'vuex';
import EdmonSelect from 'app/components/core/EdmonSelect.vue';
import { SET_TRANSCRIPT_INFO } from 'app/store/transcript.module';
import { updateFieldSettingAPI } from 'app/api';
export default {
  name: 'AddNewTagModal',
  components: { EdmonSelect },
  props: {
    mode: {
      type: String,
      default: 'clip',
    },
  },
  computed: {
    ...mapGetters(['transcriptInfo']),
  },
  data: function () {
    return {
      tagName: { value: 'Location', label: 'Location' },
      tagValue: '',
    };
  },
  methods: {
    changeTagName: function (selectedTagName) {
      this.tagName = selectedTagName;
    },
    async onOk(closeModal) {
      if (this.mode === 'text') {
        // var index = parseInt($("#addTagsModal").attr("data-index"));
        // var item = $(".script_content").find(".script_item")[index];
        // var lastSpan = $(item).find(".content span").last();
        // var dataIndex = parseInt($("#addTagsModal").attr("data-index"));
        // var dataElemInd = parseInt($("#addTagsModal").attr("data-elemind"));
        // var data = {
        // 	type: "tag",
        // 	tag_type: tagType,
        // 	tag_value: tagValue,
        // };
        // var content = JSON.parse(transcriptItemData.content);
        // content.monologues[dataIndex].elements.splice(dataElemInd + 1, 0, data);
        // transcriptItemData.content = JSON.stringify(content);
      } else if (this.mode === 'clip') {
        const a = this.transcriptInfo.transcriptItemData;
        console.log('info', this.transcriptInfo)
        if (
          !this.transcriptInfo.transcriptItemData.tags ||
          !this.transcriptInfo.transcriptItemData.tags.length
        ) {
          this.$store.dispatch(SET_TRANSCRIPT_INFO, {
            transcriptItemData: {
              ...this.transcriptInfo.transcriptItemData,
              tags: [{ type: this.tagName.value, value: this.tagValue }],
            },
          });
        } else {
          const findOne = this.transcriptInfo.transcriptItemData.tags.find(
            (item) => {
              const a = this.tagName.value;
              if (
                item.type === this.tagName.value &&
                item.value === this.tagValue
              )
                return true;
              return false;
            }
          );
          if (!findOne)
            this.$store.dispatch(SET_TRANSCRIPT_INFO, {
              transcriptItemData: {
                ...this.transcriptInfo.transcriptItemData,
                tags: [
                  ...this.transcriptInfo.transcriptItemData.tags,
                  { type: this.tagName.value, value: this.tagValue },
                ],
              },
            });
        }
      }

      if (
        this.transcriptInfo.fieldSettings &&
        this.transcriptInfo.fieldSettings.length
      ) {
        let fieldSettings = [...this.transcriptInfo.fieldSettings];

        fieldSettings.forEach((item) => {
          if (item.fieldName === this.tagName.value) {
            if (!item.presets) {
              item.presets = [];
            }
            if (item.presets.indexOf(this.tagValue) < 0) {
              item.presets.push(this.tagValue);
              // var settings = {
              //   url:
              //     'https://logmonster-51e0a-default-rtdb.firebaseio.com/projects/' +
              //     curProjectId +
              //     '/tags.json?auth=' +
              //     dbSecret,
              //   method: 'PUT',
              //   timeout: 0,
              //   headers: {
              //     'Content-Type': 'application/json',
              //   },
              //   data: JSON.stringify(fieldSettings),
              // };

              // $.ajax(settings).done(function (response) {
              //   console.log(response);
              //   refreshFieldSettings();
              // });
            }
          }
        });
        try {
          const res = await updateFieldSettingAPI({
            projectId: this.transcriptInfo.curProjectId,
            fieldSettings,
          });
          if (res.status === 200) {
            // this.fieldSettings = [...fieldSettings];
            this.$store.dispatch(SET_TRANSCRIPT_INFO, {
              fieldSettings: fieldSettings,
            });
          }
        } catch (err) {
          alert('Update field setting failed');
        }
      }

      // 	refreshTranscriptData(transcriptItemData);
      // 	refreshFieldSettings();
      // 	saveContent();
      closeModal();
    },
    resetModal() {
      this.tagName = { value: 'Location', label: 'Location' };
      this.tagValue = '';
    },
  },
};
</script>
