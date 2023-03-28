<template>
  <div id="dashboard-page">
    <transition name="fade">
      <pre-loader v-if="showLoading"></pre-loader>
    </transition>

    <transition name="fade">
      <div id="main-wrapper" class="show" v-if="!showLoading">
        <div class="container-fluid edmon-container-fluid">
          <page-header>Hi, {{ this.firstName }}</page-header>

          <div class="project-wrapper">
            <div class="card tab-body" id="projects-tab">
              <div class="card-header">
                <div class="search-bar">
                  <b-input-group>
                    <div class="input-group-prepend">
                      <b-button variant="primary" class="input-group-text" id="btnSearch">
                        <fa-icon :icon="['fas', 'search']" class="project-icon text-white" />
                      </b-button>
                    </div>
                    <input
                      type="text"
                      id="searchEdit"
                      class="form-control"
                      placeholder="Search by title or description..."
                      v-model="searchStr"
                    />
                    <div class="input-group-append">
                      <b-button
                        variant="primary"
                        id="btnNewProject"
                        class="input-group-text text-white"
                        @click="
                          showProjectModal({
                            id: -1,
                            title: '',
                            description: '',
                            type: '',
                            participants: '',
                            sharing: false,
                          })
                        "
                      >
                        <fa-icon :icon="['fas', 'folder-plus']" class="project-icon text-white" />
                        <span class="mt-1 ml-2">Create Project</span>
                      </b-button>
                    </div>
                  </b-input-group>
                </div>
              </div>
              <div class="card-body" style="overflow-y: auto">
                <div class="project-list">
                  <div class="project-item" v-for="item in filteredProjects" :key="item.id">
                    <div class="project-item-content">
                      <div class="folder-star-wrapper">
                        <fa-icon :icon="['fas', 'folder']" class="project-icon" />
                        <fa-icon :icon="['fas', 'star']" class="project-star" />
                      </div>

                      <div>
                        <h5 class="project-item-title" @click="clickProject(item)">
                          {{ item.title }}
                        </h5>
                      </div>
                    </div>

                    <div class="project-item-action">
                      <b-button variant="secondary" size="sm" class="ml-2" @click="showProjectModal(item)">
                        <fa-icon :icon="['fas', 'pencil-alt']" />
                      </b-button>
                      <b-button variant="danger" size="sm" class="ml-2" @click="onDeleteProject(item)">
                        <fa-icon :icon="['fas', 'trash']" />
                      </b-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <edmon-footer></edmon-footer>
      </div>
    </transition>

    <project-modal @createProject="saveProject" :project="selectedProject"></project-modal>

    <confirm-modal
      componentId="project-confirm-modal"
      title="Are you sure want to delete?"
      @onOk="deleteProject"
      @onCancel="cancelDelete"
    />

    <alert-modal componentId="project-alert-modal" :content="alertMessage" @onOk="showAlertModal"></alert-modal>
  </div>
</template>

<script>
  import { isEmpty } from 'lodash';
  import { mapGetters } from 'vuex';
  import { PAGES } from 'app/constants/index';
  import { matchIgnoreCase } from 'app/utils';
  import { SET_CUR_PAGE } from 'app/store/page.module';
  import ProjectService from 'app/services/ProjectService';
  import { SET_TRANSCRIPT_INFO } from 'app/store/transcript.module';
  import PageHeader from 'app/components/sharedComponents/PageHeader';
  import PreLoader from 'app/components/sharedComponents/PreLoader.vue';
  import AlertModal from 'app/components/sharedComponents/AlertModal.vue';
  import ProjectModal from 'app/components/pages/project/ProjectModal.vue';
  import EdmonFooter from 'app/components/sharedComponents/EdmonFooter.vue';
  import ConfirmModal from 'app/components/sharedComponents/ConfirmModal.vue';

  export default {
    name: 'Dashboard',
    components: {
      PreLoader,
      PageHeader,
      ProjectModal,
      ConfirmModal,
      AlertModal,
      EdmonFooter,
    },
    data: function () {
      return {
        showLoading: true,
        projects: [],
        searchStr: '',
        selectedProject: {
          id: -1,
          title: '',
          description: '',
          type: '',
          participants: '',
          sharing: false,
        },
        alertMessage: '',
      };
    },
    mounted() {
      this.$store.dispatch(SET_CUR_PAGE, PAGES.PROJECT);

      this.fetchProjects().then(this.hideLoader);
    },
    computed: {
      ...mapGetters(['currentUser', 'currentOrganisation']),
      firstName: function () {
        const fullname = this?.currentUser?.username || '';

        return fullname?.split(' ')?.at(0) || '';
      },
      filteredProjects: function () {
        if (isEmpty(this.searchStr)) return this.projects;

        return this.projects.filter(
          (item) => matchIgnoreCase(item?.title, this.searchStr) || matchIgnoreCase(item?.description, this.searchStr)
        );
      },
    },
    methods: {
      async fetchProjects() {
        const projects = await ProjectService.all(this.currentOrganisation, this.currentUser?.uid);

        this.projects = projects || [];
      },
      hideLoader() {
        this.showLoading = false;
      },
      initSelectedProject() {
        this.selectedProject = {
          id: -1,
          title: '',
          description: '',
          type: '',
          participants: [],
          sharing: false,
        };

        this.hideLoader();
      },
      showProjectModal(projectParam) {
        this.selectedProject = {
          ...projectParam,
        };
        this.$bvModal.show('project-modal');
      },
      showAlertModal() {
        this.$bvModal.show('project-alert-modal');
      },
      validateProject(project) {
        if (project.title == '') {
          this.alertMessage = 'Please fill in the fields';
          this.$bvModal.show('project-alert-modal');
          return false;
        }

        return true;
      },
      handleFailure() {
        this.initSelectedProject();

        this.alertMessage = 'Create a Project Failed';

        this.$bvModal.show('alert-modal');
      },
      async saveProject(project) {
        if (!this.validateProject(project)) return;

        if (project.id === -1) {
          this.createProject(project);
        } else {
          this.updateProject(project);
        }
      },

      async createProject(project) {
        await ProjectService.create({
          ...project,
          organisation: this.currentOrganisation,
          creator: this.currentUser.uid,
        }).catch(this.handleFailure);

        this.fetchProjects();

        this.initSelectedProject();
      },
      async updateProject(project) {
        await ProjectService.update(project.id, project).catch(this.handleFailure);

        this.fetchProjects();

        this.initSelectedProject();
      },
      async deleteProject() {
        const projectId = this.selectedProject?.id;

        if (!projectId || projectId === -1) return;

        await ProjectService.delete(projectId).catch(this.handleFailure);

        this.fetchProjects();
      },
      onDeleteProject(project) {
        this.selectedProject = project;
        this.$bvModal.show('project-confirm-modal');
      },
      cancelDelete() {
        this.initSelectedProject();
      },
      clickProject(project) {
        this.$store.dispatch(SET_TRANSCRIPT_INFO, {
          curProjectId: project.id,
          curProjectName: project.title,
        });

        this.$router.push({ name: 'project-transcript', params: { projectId: project.id } });
      },
    },
  };
</script>

<style lang="scss">
  @import './index.scss';
</style>
