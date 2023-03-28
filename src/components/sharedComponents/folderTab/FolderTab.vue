<template>
    <div id="folder-tab" class="row">
        <div class="col-xl-12">
            <div class="card tab-body" :style="`border-top-left-radius: ${page === 'transcript' ? '0' : 'calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0'}`">
                <div class="card-header" :style="`border-top-left-radius: ${page === 'transcript' ? '0' : 'calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0'}`">
                    <div class="search-bar">
                        <div class="input-group justify-content-stretch">
                            <div
                                v-if="page === 'paperedit'"
                                id="btnShowPaperEditList"
                                type="button"
                                @click="clickTab('paperedit')"
                                :class="`btn ${curTab === 'paperedit' ? 'btn-primary' : 'btn-outline-primary'}`"
                            >
                                {{ folderTabs.PAPER_EDITS.label }}
                            </div>
                            <div
                                id="btnShowTranscriptList"
                                type="button"
                                @click="clickTab('transcript')"
                                :class="`btn ${curTab === 'transcript' ? 'btn-primary' : 'btn-outline-primary'}`"
                            >
                                {{ folderTabs.TRANSCRIPT.label }}
                            </div>
                            <div
                                v-if="page === 'paperedit'"
                                id="btnShowMediaFiles"
                                type="button"
                                @click="clickTab('media_files')"
                                :class="`btn ${curTab === 'media_files' ? 'btn-primary' : 'btn-outline-primary'}`"
                            >
                                {{ folderTabs.MEDIA_FILES.label }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body" style="overflow-y: auto">
                    <div id="tranScript" class="project-list tranScript row content-container" v-if="curTab === 'transcript'">
                        <template v-for="(project, idx) in projects.filter(it => it.name != 'Trash')">
                            <root-tree-item :trash="false" :project="project" :key="idx"></root-tree-item>
                        </template>
                        <template v-for="(project, idx) in projects.filter(it => it.name == 'Trash')">
                            <root-tree-item :trash="true" :project="project" :key="'trash' + idx"></root-tree-item>
                        </template>
                        <!-- <root-tree-item :project="trashProject"></root-tree-item> -->
                    </div>
                    <div id="paperEdit" class="project-list row paperEdit" v-if="curTab === 'paperedit'">
                        <custom-tree :treeData="paperInfo.paperData" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getResource } from "app/utils";
import RootTreeItem from "./RootTreeItem.vue";
// import PaperTreeWrapper from './PaperTreeWrapper.vue';
import { SET_CUR_PAGE } from "app/store/page.module";
import { SET_CUR_FOLDER_TAB } from "app/store/folderTab.module";
import { PAGES, FOLDER_TABS } from "app/constants/index";
import CustomTree from "../../core/CustomTree.vue";
export default {
    components: {
        RootTreeItem,
        CustomTree,
        // PaperTreeWrapper
    },
    name: "FolderTab",
    props: {
        page: {
            type: String,
            default: "transcript",
        },
    },
    data: function () {
        return {
            pages: PAGES,
            folderTabs: FOLDER_TABS,
            trashProject: {
                name: "Trash",
                items: [],
            },
            curTab: "transcript",
        };
    },
    computed: {
        ...mapGetters(["transcriptInfo", "paperInfo", "search", "curPage", "curFolderTab"]),
        projects: function () {
            let tempProjects = [];
            this.transcriptInfo.transcriptData.forEach(function (item, index, arr) {
                if (tempProjects.length) {
                    let added = false;
                    tempProjects.forEach(function (project) {
                        if (project.items) {
                            // if (item.trash) {
                            //   if (project.name == 'Trash') {
                            //     project.items.push(item);
                            //     added = true;
                            //   }
                            // }
                            // else
                            if (project.name == item.projectName) {
                                project.items.push(item);
                                added = true;
                            } else if (!item.projectName && project.name == "Other") {
                                project.items.push(item);
                                added = true;
                            }
                        } else {
                            project.items = [];
                            project.items.push(item);
                            project.name = item.projectName;
                        }
                    });
                    if (!added) {
                        tempProjects.push({
                            name: item.projectName ? item.projectName : "Other",
                            items: [item],
                        });
                    }
                } else {
                    tempProjects.push({
                        name: item.projectName ? item.projectName : "Other",
                        items: [item],
                    });
                }
                if (!tempProjects.filter(it => it.name == "Trash").length)
                    tempProjects.push({
                        name: "Trash",
                        items: [],
                    });
                tempProjects.filter(it => it.name == "Trash")[0].items.push(item);
            });
            if (this.curPage === PAGES.SEARCH) {
                let isSearched = false;
                if (this.search.searchTxt) {
                    isSearched = true;
                }

                this.search.conditions.forEach(item => {
                    if (isSearched) return;
                    if (item.value) isSearched = true;
                });

                if (!isSearched) return tempProjects;

                let filtedIds = this.search.transcriptData.map(item => item.id);

                let searchTranscript = [];
                tempProjects.forEach(projectItem => {
                    let projectItemTemp = [];

                    projectItem.items.forEach(item => {
                        let clipsTemp = {};
                        Object.keys(item.clips).forEach(clipKey => {
                            const findOne = filtedIds.find(itemFind => itemFind === clipKey);
                            if (findOne) clipsTemp[clipKey] = item.clips[clipKey];
                        });
                        if (Object.keys(clipsTemp).length > 0) {
                            projectItemTemp.push({
                                ...item,
                                clips: clipsTemp,
                            });
                        }
                    });

                    if (Object.keys(projectItemTemp).length > 0)
                        searchTranscript.push({
                            ...projectItem,
                            items: projectItemTemp,
                        });
                });
                return searchTranscript;
            } else {
                return tempProjects;
            }
        },
    },
    mounted() {
        this.curTab = this.page === "transcript" ? "transcript" : "paperedit";
    },
    methods: {
        getImgResource: function (srcImg) {
            return getResource(srcImg);
        },
        clickTab: function (selectedTab) {
            // this.$store.dispatch(SET_CUR_FOLDER_TAB, selectedTab);
            this.curTab = selectedTab;
        },
        setPage(selectedPage) {
            this.$store.dispatch(SET_CUR_PAGE, selectedPage);
        },
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
