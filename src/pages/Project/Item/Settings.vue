<template>
    <div class="card">
        <div class="row page-content settings-page-wrapper mt-5" style="overflow-y: auto">
            <div class="col-md-6 offset-md-3">
                <form id="settingsForm">
                    <b-form-group
                        label="Title"
                        label-for="projectTitle"
                        label-cols-sm="4"
                        :state="formData.title.length > 0"
                        :invalid-feedback="formData.title.length > 0 ? '' : 'Please input title'"
                        autocomplete="off"
                    >
                        <input
                            id="projectTitle"
                            type="text"
                            placeholder="Enter a project title"
                            name="projectTitle"
                            :class="`form-control ${formData.title.length > 0 ? 'is-valid' : 'is-invalid'}`"
                            v-model="formData.title"
                        />
                    </b-form-group>
                    <b-form-group label="Participants" label-cols-sm="4" label-for="inputParticipants" class="edmon-tags-input">
                        <edmon-tags-input
                            :tagsProps="formData.participants"
                            @onChange="
                                $event => {
                                    formData.participants = $event;
                                }
                            "
                        ></edmon-tags-input>
                    </b-form-group>
                </form>

                <div class="text-right mb-3">
                    <b-button variant="primary" @click="saveSettings">Save</b-button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { SET_CUR_PAGE } from "app/store/page.module";
import { PAGES } from "app/constants/index";
import { mapGetters } from "vuex";
import { updateProjectAPI, updateFieldSettingAPI } from "app/api";
import { SET_TRANSCRIPT_PROJECT_SETTINGS, SET_TRANSCRIPT_INFO } from "app/store/transcript.module";
export default {
    data: function () {
        return {
            formData: {
                id: -1,
                title: "",
                participants: [],
            },
        };
    },
    computed: {
        ...mapGetters(["transcriptInfo"]),
    },
    watch: {
        "transcriptInfo.projectSettings": {
            handler(settings) {
                if (settings) {
                    this.formData = {
                        ...settings,
                        participants:
                            typeof settings.participants === "string" ? (settings.participants.length > 0 ? settings.split(",") : []) : settings.participants,
                    };
                }
            },
            immediate: true,
            deep: true,
        },
    },
    created() {
        this.$store.dispatch(SET_CUR_PAGE, PAGES.SETTINGS);
    },
    methods: {
        saveSettings: async function () {
            const project = this.formData;
            const res = await updateProjectAPI({
                id: this.transcriptInfo.curProjectId,
                title: project.title.trim(),
                participants: project.participants,
            });
            this.$store.dispatch(SET_TRANSCRIPT_PROJECT_SETTINGS, res.data);
            const res2 = await updateFieldSettingAPI({
                projectId: this.transcriptInfo.curProjectId,
                fieldSettings: [...this.fieldSettings],
            });
            this.$store.dispatch(SET_TRANSCRIPT_INFO, {
                fieldSettings: [...this.fieldSettings],
                participants: project.participants,
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.settings-page-wrapper {
    fieldSet.tags_field {
        border: 1px solid white;
        border-radius: 5px;
    }
    .form-control.is-valid {
        border-color: #28a745;
        padding-right: calc(1.5em + 0.75rem) !important;
        background: none;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right calc(0.375em + 0.1875rem) center;
        background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
        background-color: #000;
    }
    .deleteField {
        position: absolute;
        right: 0;
        top: -30px;
    }
}
</style>
