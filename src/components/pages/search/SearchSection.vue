<template>
  <div class="search-section-wrapper h-100">
    <div class="search-bar">
      <b-button variant="primary" class="input-group-text">
        <fa-icon :icon="['fas', 'search']" class="project-icon text-white" />
      </b-button>
      <input
        type="text"
        class="search-input form-control"
        placeholder="Search"
        :value="searchTxt"
        @change="changeSearchTxt"
      />
    </div>
    <div class="condition-list-wrapper">
      <div class="condition-list-wrapper-content">
        <div class="condition-action-wrapper mb-3">
          <!-- <button class="btn btn-info btn-sm" @click="onAddCondition">
            Add Condition
          </button> -->
          <!-- <button class="btn btn-primary btn-sm btn-search" @click="onSearch">
            Search
          </button> -->
          <a href="#" @click="onAddCondition">Add Condition</a>
          <a href="#" class="ml-3" @click="onSearch">Search</a>
        </div>
        <search-condition
          v-for="(item, idx) in conditions"
          :key="idx"
          :inputId="`search-condition-${idx}`"
          :conditionData="item"
          @changeCondition="changeCondition(idx, $event)"
          @changeValue="changeValue(idx, $event)"
          @deleteCondition="deleteCondition(idx)"
        ></search-condition>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SearchCondition from 'app/components/pages/search/SearchCondition.vue';
import { getTranscritpContentAPI } from 'app/api';
import {
  SET_SEARCH_VALUE,
  SET_SEARCH_LOADING,
} from 'app/store/search.module';
import { formatYYYYMMDD } from 'app/utils';
import { SEARCH_CONDTION_TYPE } from 'app/constants/index';

export default {
  name: 'SearchSection',
  components: { SearchCondition },
  data: function () {
    return {
      searchTxt: '',
      conditions: [],
    };
  },
  computed: {
    ...mapGetters(['search', 'transcriptInfo']),
  },
  watch: {
    'search.searchTxt': {
      handler: function (newVal) {
        this.searchTxt = newVal;
      },
      immediate: true
    },
    'search.conditions': {
      handler: function (val) {
        this.conditions = [...val];
      },
      deep: true,
    },
  },
  methods: {
    changeSearchTxt: function (event) {
      if (event.target.value.length > 0)
        this.searchTxt = event.target.value.trim();
      else this.searchTxt = event.target.value;
    },
    onAddCondition: function (e) {
      e.preventDefault();
      this.conditions.push({
        condition: SEARCH_CONDTION_TYPE.TITLE.value,
        value: '',
      });
    },
    changeCondition: function (nIndex, newValue) {
      this.conditions = [
        ...this.conditions.map((item, idx) => {
          if (idx === nIndex)
            return {
              condition: newValue,
              value: '',
            };
          else return item;
        }),
      ];
    },
    changeValue: function (nIndex, newValue) {
      this.conditions = [
        ...this.conditions.map((item, idx) => {
          if (idx === nIndex) return { ...item, value: newValue };
          else return item;
        }),
      ];
    },
    deleteCondition: function (nIndex) {
      this.conditions = [
        ...this.conditions.filter((item, idx) => idx !== nIndex),
      ];
    },
    onSearch: async function (e) {
      e.preventDefault();
      let searchConditions = this.searchTxt
        ? [{ condition: 'content', value: this.searchTxt }]
        : [];
      this.conditions.forEach((item) => {
        if (item.value) searchConditions.push(item);
      });
      let result = [];
      let cnt = 0;

      let transcriptData = this.transcriptInfo.transcriptData;
      console.log('transcript', transcriptData)
      this.$store.dispatch(SET_SEARCH_LOADING, true);

      if (transcriptData) {
        await Promise.all(transcriptData.map( async (transcript, i) => {
             transcript.type = 'transcript';
              let cnt = 0;
              if (transcript.content && transcript.content.length) {
                console.log('content', transcript.content)
                try {
                  for (let j = 0; j < searchConditions.length; j++) {
                    const condition = searchConditions[j];
                    if (
                      condition.condition ===
                      SEARCH_CONDTION_TYPE.PARTICIPANTS.value
                    ) {
                      try {
                        if (
                          transcript.participants &&
                          transcript.participants.length
                        ) {
                          transcript.participants.forEach(function (item) {
                            if (
                              item
                                .toLowerCase()
                                .indexOf(condition.value.toLowerCase()) >= 0
                            ) {
                              throw 'found';
                            }
                          });
                        }
                      } catch (e) {
                        if (e == 'found') {
                          cnt++;
                        }
                      }
                    } else if (
                      condition.condition ===
                      SEARCH_CONDTION_TYPE.CREATED_AT.value
                    ) {
                      const searchData = formatYYYYMMDD(condition.value);
                      if (
                        searchData ===
                        transcript[
                          SEARCH_CONDTION_TYPE.CREATED_AT.value
                        ].substr(0, 10)
                      ) {
                        cnt++;
                      }
                    } else if (
                      transcript[condition.condition] &&
                      transcript[condition.condition]
                        .toLowerCase()
                        .indexOf(condition.value.toLowerCase()) >= 0
                    ) {
                      //result.push(transcript);
                      cnt++;
                    } else {
                      const content =await getTranscritpContentAPI(
                        transcript.content
                      );

                      if (condition.condition === 'content') {
                        let sentence = '';
                        if (content.monologues && content.monologues.length > 0) {
                          content.monologues.forEach(function (item) {
                            if (item.elements && item.elements.length > 0) {
                              item.elements.forEach(function (elem) {
                                if (elem.type !== 'tag') {
                                  sentence += elem.value;
                                }
                              });
                            }
                          });
                        }

                        if (
                          sentence
                            .toLowerCase()
                            .indexOf(condition.value.toLowerCase()) >= 0
                        ) {
                          cnt++;
                        }
                      } else {
                        try {
                          if (content.monologues && content.monologues.length > 0) {
                            content.monologues.forEach(function (item) {
                              if (item.elements && item.elements.length > 0) {
                                item.elements.forEach(function (elem) {
                                  if (elem.type === 'tag') {
                                    if (
                                      elem.tag_type == condition.condition &&
                                      elem.tag_value.toLowerCase() ===
                                        condition.value.toLowerCase()
                                    ) {
                                      throw 'found';
                                    }
                                  }
                                });
                              }
                            });
                          }
                        } catch (e) {
                          if (e == 'found') {
                            cnt++;
                          }
                        }
                      }
                    }
                  }
                  if (cnt == searchConditions.length) {
                    result.push(transcript);
                  }
                } catch (err) {
                  console.log(err);
                }
              }

              if (transcript.is_avb === 1) {
                if (transcript.clips) {
                  await Promise.all(Object.keys(transcript.clips).map(async (clipKey, i) => {
                    // let clipKey = Object.keys(transcript.clips)[i];
                    let clip = transcript.clips[clipKey];
                    clip.id = clipKey;
                    clip.type = 'avb_clip';
                    clip.parentTitle = transcript.title;
                    clip.projectName = this.transcriptInfo.curProjectName;
                    clip.projectSubName = transcript.projectName;
                    let cnt = 0;
                    if (clip.content && clip.content.length) {
                      //var content = JSON.parse(clip.content);

                      try {
                        for (let j = 0; j < searchConditions.length; j++) {
                          const condition = searchConditions[j];
                          if (
                            condition.condition ==
                            SEARCH_CONDTION_TYPE.PARTICIPANTS.value
                          ) {
                            try {
                              clip.participants.forEach(function (item) {
                                if (
                                  item
                                    .toLowerCase()
                                    .indexOf(condition.value.toLowerCase()) >= 0
                                ) {
                                  throw 'found';
                                }
                              });
                            } catch (e) {
                              if (e == 'found') {
                                cnt++;
                              }
                            }
                          } else if (
                            condition.condition ===
                            SEARCH_CONDTION_TYPE.CREATED_AT.value
                          ) {
                            const searchData = formatYYYYMMDD(condition.value);
                            if (
                              searchData ===
                              clip[
                                SEARCH_CONDTION_TYPE.CREATED_AT.value
                              ].substr(0, 10)
                            ) {
                              cnt++;
                            }
                          } else if (
                            clip[condition.condition] &&
                            clip[condition.condition]
                              .toLowerCase()
                              .indexOf(condition.value.toLowerCase()) >= 0
                          ) {
                            //result.push(clip);
                            cnt++;
                            
                          } else {
                            const content = await getTranscritpContentAPI(
                              clip.content
                            );
                            clip.content_detail = content;
                            if (condition.condition === 'content') {
                              let sentence = '';
                              if (
                                content.monologues &&
                                content.monologues.length > 0
                              ) {
                                content.monologues.forEach(function (item) {
                                  item.elements && item.elements.forEach(function (elem) {
                                    if (elem.type !== 'tag') {
                                      sentence += elem.value;
                                    }
                                  });
                                });
                              }
                              if (
                                sentence
                                  .toLowerCase()
                                  .indexOf(condition.value.toLowerCase()) >= 0
                              ) {
                                cnt++;
                              }
                            } else {
                              try {
                                content.monologues.forEach(function (item) {
                                  item.elements.forEach(function (elem) {
                                    if (elem.type === 'tag') {
                                      if (
                                        elem.tag_type == condition.condition &&
                                        elem.tag_value.toLowerCase() ==
                                          condition.value.toLowerCase()
                                      ) {
                                        throw 'found';
                                      }
                                    }
                                  });
                                });
                              } catch (e) {
                                if (e == 'found') {
                                  cnt++;
                                }
                              }
                            }
                          }
                        }
                        if (cnt === searchConditions.length) {
                          result.push(clip);
                        }
                      } catch (err) {
                        console.log(err);
                      }
                    }
                  }))
                  // for (let i = 0; i < Object.keys(transcript.clips).length; i++) {
                    
                  // }
                }
              }
              return;
        }))
      }
      this.$store.dispatch(SET_SEARCH_VALUE, {
        searchTxt: this.searchTxt,
        conditions: this.conditions,
        transcriptData: [...result],
        loading: false,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.search-section-wrapper {
  display: flex;
  flex-direction: column;
  .search-bar {
    width: 100%;
    display: flex;
    margin-bottom: 1rem;
    .input-group-text {
      height: fit-content;
      font-size: small;
      flex: 0 0 45px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    .search-input {
      min-height: auto;
      font-size: small;
      flex: 1 1 100%;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border: 1px solid;
      &:focus {
        border: 1px solid #5d78ff;
      }
    }
  }

  .condition-list-wrapper {
    position: relative;
    width: 100%;
    overflow-y: auto;
    flex: 1 1 100%;
    .condition-list-wrapper-content {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      padding-bottom: 1rem;
    }
    .condition-action-wrapper {
      // flex: 0 0 38px;
      display: flex;
      justify-content: flex-end;
      .btn {
        margin-left: 1rem;
      }
    }
  }
}
</style>

<style lang="scss">
.search-section-wrapper {
  .condition-list-wrapper-content {
    .edmon-custom-select {
      .selected {
        border: 1px solid;
      }
    }
  }
}
</style>
