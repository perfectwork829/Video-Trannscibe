<template>
  <nav class="navbar navbar-expand header">
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav ml-auto">
        <li class="nav-item active">
          <b-button variant="primary" class="input-group-text" @click="logOut">
            <fa-icon :icon="['fas', 'sign-out-alt']" class="project-icon text-white" />
          </b-button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import AuthService from 'app/services/AuthService';

export default {
  name: 'EdmonHeader',
  methods: {
    async logOut() {
      await AuthService.logout();

      await this.$store.dispatch('logout');

      this.$router.push('/login');
    },
  },
};
</script>

<style lang="scss" scoped>
.header {
  margin-right: 15px;
  margin-left: 15px;
  background: #131722;
  border-radius: 15px;
}
</style>
