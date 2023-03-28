<template>
  <div class="search-condition-wrapper">
    <b-form-group label="" :label-for="conditionId" autocomplete="off">
      <edmon-select
        :id="conditionId"
        class="condition-edmon-select"
        :value="getConditionJson(conditionData.condition)"
        :options="conditionOptions"
        @onChange="($event) => changeCondition($event.value)"
      >
      </edmon-select>
    </b-form-group>
    <template v-if="conditionData.condition === conditionType.CREATED_AT.value">
      <edmon-date-picker
        :componentId="valueId"
        label=""
        :dateValue="conditionData.value"
        @changeDate="changeValue"
      ></edmon-date-picker>
    </template>
    <template
      v-else-if="conditionData.condition === conditionType.PARTICIPANTS.value"
    >
      <b-form-group
        label=""
        :label-for="valueId"
        :state="valueState"
        :invalid-feedback="valueInvalidFeedback"
      >
        <edmon-select
          :id="valueId"
          class="value-edmon-select"
          :placeholder="'Please select a participant'"
          :value="{
            value: conditionData.value,
            label: conditionData.value,
          }"
          :options="participantOptions"
          @onChange="($event) => changeValue($event.value)"
        >
        </edmon-select>
      </b-form-group>
    </template>
    <template
      v-else-if="
        conditionData.condition === conditionType.TITLE.value ||
        conditionData.condition === conditionType.DESCRIPTION.value ||
        conditionData.condition === 'content'
      "
    >
      <b-form-group
        label=""
        :label-for="valueId"
        :state="valueState"
        :invalid-feedback="valueInvalidFeedback"
      >
        <input
          :class="valueClassName"
          :value="conditionData.value"
          @change="($event) => changeValue($event.target.value)"
          autocomplete="off"
        />
      </b-form-group>
    </template>
    <template v-else>
      <b-form-group
        label=""
        :label-for="valueId"
        :state="valueState"
        :invalid-feedback="valueInvalidFeedback"
      >
        <edmon-select
          :id="valueId"
          class="value-edmon-select"
          :placeholder="'Please select a value'"
          :value="{
            value: conditionData.value,
            label: conditionData.value,
          }"
          :options="getFieldSettingValueOptions(conditionData.condition)"
          @onChange="($event) => changeValue($event.value)"
        >
        </edmon-select>
      </b-form-group>
    </template>
    <button class="btn btn-remove" @click="onRemove">
      <fa-icon :icon="['fas', 'times']"></fa-icon>
    </button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import EdmonSelect from 'app/components/core/EdmonSelect.vue';
import EdmonDatePicker from 'app/components/core/EdmonDatePicker.vue';
import { SEARCH_CONDTION_TYPE } from 'app/constants/index';

export default {
  name: 'SearechCondition',
  components: { EdmonSelect, EdmonDatePicker },
  props: {
    inputId: {
      type: String,
      default: new Date().valueOf().toString(),
    },
    conditionData: {
      type: Object,
      default: function () {
        return {
          condition: SEARCH_CONDTION_TYPE.TITLE.value,
          value: '',
        };
      },
    },
  },
  data: function () {
    return {
      conditionType: SEARCH_CONDTION_TYPE,
      participants: [],
    };
  },
  computed: {
    ...mapGetters(['transcriptInfo']),
    conditionOptions: function () {
      let tempOptions = Object.keys(SEARCH_CONDTION_TYPE).map(
        (item) => SEARCH_CONDTION_TYPE[item]
      );
      if (
        this.transcriptInfo.fieldSettings &&
        this.transcriptInfo.fieldSettings.length > 0
      )
        tempOptions = [
          ...tempOptions,
          ...this.transcriptInfo.fieldSettings.map((item) => {
            return { value: item.fieldName, label: item.fieldName };
          }),
        ];
      return tempOptions;
    },
    conditionId: function () {
      return this.inputId + 'condition';
    },
    valueId: function () {
      return this.inputId + 'value';
    },
    valueClassName: function () {
      let returnClassName = 'form-control bordered';
      if (
        this.conditionData.condition ===
        SEARCH_CONDTION_TYPE.CREATED_AT.value
      ) {
        returnClassName += '';
      } else {
        if (this.conditionData.value.length === 0)
          returnClassName += ' is-invalid';
      }
      return returnClassName;
    },
    valueState: function () {
      if (
        this.conditionData.condition ===
        SEARCH_CONDTION_TYPE.CREATED_AT.value
      ) {
        return true;
      } else {
        return this.conditionData.value.length > 0;
      }
    },
    valueInvalidFeedback: function () {
      if (
        this.conditionData.condition ===
        SEARCH_CONDTION_TYPE.CREATED_AT.value
      ) {
        return '';
      } else {
        if (this.conditionData.value.length === 0) return 'Field is required';
        else return '';
      }
    },
    participantOptions: function () {
      return this.participants.map((item) => {
        return { value: item, label: item };
      });
    },
  },
  mounted() {
    let participantsTemp = [];
    this.transcriptInfo.projectSettings.participants && this.transcriptInfo.projectSettings.participants.forEach(function (item) {
      participantsTemp.push(item);
    });
    if (
      this.transcriptInfo.transcriptData &&
      this.transcriptInfo.transcriptData.length
    ) {
      this.transcriptInfo.transcriptData.forEach(function (transcript) {
        if (transcript.participants) {
          transcript.participants.forEach(function (item) {
            if (participantsTemp.indexOf(item) < 0) {
              participantsTemp.push(item);
            }
          });
        }
        if (transcript.is_avb) {
          if (transcript.clips) {
            Object.keys(transcript.clips).forEach(function (clipKey) {
              var clip = transcript.clips[clipKey];
              if (clip.participants) {
                clip.participants.forEach(function (item) {
                  if (participantsTemp.indexOf(item) < 0) {
                    participantsTemp.push(item);
                  }
                });
              }
            });
          }
        }
      });
    }
    this.participants = [...participantsTemp];
  },
  methods: {
    getConditionJson: function (conditionValue) {
      const findOne = this.conditionOptions.find(
        (item) => item.value === conditionValue
      );
      return findOne || '';
    },
    getFieldSettingValueOptions: function (conditionValue) {
      const findOne = this.transcriptInfo.fieldSettings.find(
        (item) => item.fieldName === conditionValue
      );
      if (findOne && findOne.presets && findOne.presets.length > 0) {
        return findOne.presets.map((item) => {
          return { value: item, label: item };
        });
      } else return [];
    },
    changeCondition: function (newValue) {
      this.$emit('changeCondition', newValue);
    },
    changeValue: function (newValue) {
      this.$emit('changeValue', newValue);
    },
    onRemove: function () {
      this.$emit('deleteCondition');
    },
  },
};
</script>

<style lang="scss">
.search-condition-wrapper {
  display: flex;
  align-items: flex-start;
  width: 100%;
  .form-control {
    min-height: 30px;
    height: 30px;
  }
  > .form-group {
    flex: 1 1 100%;
    margin-left: 1rem;
    // overflow-x: hidden;
  }
  .edmon-datepicker-wrapper {
    margin-left: 1rem;
    flex: 1 1 100%;
    .label-input {
      border: 1px solid;
    }
  }
  .btn-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    font-size: 15px;
    color: #a1a0a7;
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    outline: none;
    margin-top: 5px;
    margin-bottom: 1rem;
    margin-left: 0.5rem;
    box-shadow: none;
    &:hover {
      color: #5d78ff;
    }
  }

  .condition-edmon-select {
    .selected {
      height: 30px;
    }
  }
}
</style>
