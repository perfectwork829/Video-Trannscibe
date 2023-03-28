<template>
  <div id="folder-tab" class="row">
    <div class="col-xl-12">
      <div
        class="card tab-body"
        style="border-top-left-radius: 'calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0'"
      >
        <div
          class="card-header"
          style="border-top-left-radius: 'calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0'"
        >
          <div class="search-bar">
            <div class="input-group justify-content-stretch">
              <div
                type="button"
                :class="`btn ${curTab=='search' ? 'btn-primary': 'btn-outline-primary'}`"
                @click="curTab='search'"
              >
                Search
              </div>
              <div
                type="button"
                :class="`btn ${curTab=='saved_searches' ? 'btn-primary': 'btn-outline-primary'}`"
                @click="curTab='saved_searches'"
              >
                Saved Searches
              </div>
            </div>
          </div>
        </div>
        <div class="card-body" style="overflow-y: auto" v-if="curTab==='saved_searches'">
          
          <div
            class="project-list row paperEdit"
          >
            <edmon-tree :treeData="searchedList" @onItem="onSelectSearch"/>
          </div>
        </div>
        <div class="card-body" style="overflow-y: auto" v-if="curTab==='search'">
          <b-button
            variant="primary"
            class="ml-1 mb-3"
            size="sm"
            @click="onSaveSearch"
          >
            <fa-icon :icon="['fas', 'plus']"></fa-icon>
            Save Search
          </b-button>
          <search-section></search-section>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { PAGES, FOLDER_TABS } from 'app/constants/index';
import SearchSection from 'app/components/pages/search/SearchSection'
import EdmonTree from '../../core/EdmonTree.vue';
import {
  SET_SEARCH_VALUE,
} from 'app/store/search.module';
export default {
  components: { 
    EdmonTree,
    SearchSection
    // SaveModal
  },
  name: 'SearchFolderTab',
  data: function () {
    return {
      curTab: 'search'
    };
  },
  computed: {
    ...mapGetters([
      'transcriptInfo',
      'paperInfo',
      'searchedList',
      'curPage',
      'curFolderTab',
    ]),
  },
  mounted() {
    
  },
  methods: {
    onSaveSearch() {
      this.$bvModal.show('save-search-modal');
    },
    onSelectSearch(value) {
      console.log('value', value);
      this.$store.dispatch(SET_SEARCH_VALUE, value.data.result);
    }
  },
};
</script>

<style lang="scss">
#folder-tab {
  .project-item-content {
    margin-bottom: 0.5rem;
    .project-icon {
      width: 20px;
      height: 15px;
      margin: 0 0.5rem 0 0;
    }
    .media-body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 100%;

      &.with-delete {
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        &:hover {
          .edmon-btn-trash,
          .edmon-btn-pencil {
            display: inline-block;
          }
        }
        .edmon-btn-trash,
        .edmon-btn-pencil {
          flex-grow: 0;
          display: none;
        }
      }

      .tree-info-wrapper {
        display: flex;
        flex-direction: column;
        flex: 1 1 100%;
      }

      .project-item-title {
        margin: 0;
        font-weight: normal;
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }
      }
      h5.project-item-title {
        font-size: 0.75rem;
      }
      h6.project-item-title {
        font-size: 0.7rem;
      }
      .project-item-description {
        font-size: 0.75rem;
        line-height: 1.2;
        margin: 0.25rem 0 0 0;
      }
    }
  }
}
</style>
<style scoped lang="scss">
#folder-tab {
  height: 100%;
  > .col-xl-12 {
    height: 100%;
  }
  .card {
    margin-bottom: 0;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    > .card-body {
      overflow-y: auto;
      flex: 1 1 100%;
    }
  }
  .card-header {
    width: 100%;
    flex-grow: 0;

    .search-bar {
      width: 100%;
      .input-group {
        flex-wrap: nowrap;
        .btn {
          border-radius: 0;
          flex: 0 1 100%;
        }
      }
    }
  }
}

.project-item {
  margin: 5px 0px;
}

.project-item-action {
  font-size: 16px;
}

.project-item-title {
  cursor: pointer;
}

.project-item-title:hover {
  text-decoration: underline;
}

.clip-item-title {
  cursor: pointer;
}

.clip-item-title:hover {
  text-decoration: underline;
}

.project-item-status-avb {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 2px 5px;
  border-radius: 3px;
}

.modal-content {
  background-color: #131722;
}

.project-item-postit {
  display: flex;
  padding: 15px;
  width: 100%;
  position: relative;
  padding: 10px;
  height: 300px;
  align-items: flex-start;
}

.project-item-content-postit {
  width: 100%;
  height: 100%;
  border: 1px solid black;
  border-radius: 5px;
  padding: 10px;
}

.project-item-content-item-postit {
  width: 100%;
  height: calc(100% - 45px);
  overflow-y: scroll;
}

.project-item-action-postit {
  position: absolute;
  right: 15px;
  top: 15px;
}

.project-item-title-postit {
  width: 70%;
  font-size: 20px;
  color: #007bff;
  cursor: pointer;
}

.project-item-title-postit i {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  display: inherit;
}

.video_player {
  background-color: black;
  /*width: 250px;*/
  /* height: 250px; */
}

.video_player_paperedit {
  background-color: black;
  width: 100%;
  height: 150px;
  border: 1px solid;
  min-height: 150px;
}

.video_player_final {
  background-color: black;
  width: 100%;
  height: 150px;
  border: 1px solid;
  min-height: 150px;
}

.script_item {
  padding: 10px;
  border-bottom: 1px solid lightgray;
}

/* .dropdown-menu {
			left: -80px !important;
		} */

.dropdown {
  margin-bottom: 10px;
  display: block;
}

.modal-content {
  background-color: #131722;
}

.script_content_postit {
  display: flex;
  flex-wrap: wrap;
}
</style>
