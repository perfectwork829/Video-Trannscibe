<template>
  <div>
    <h1>Dev Playground</h1>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import MigrationService from 'app/services/MigrationService';

  export default {
    name: 'Dev',

    computed: {
      ...mapGetters(['currentUser', 'currentOrganisation']),
    },

    async mounted() {
      console.log('mounted', this.currentOrganisation);

      const res = await MigrationService.syncRolesAndPermissions();

      console.log(res);
    },
  };
</script>
