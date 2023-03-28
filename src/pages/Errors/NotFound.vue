<template>
  <div id="main-wrapper" class="show justify-content-center">
    <div class="text-center">
      <h1>404</h1>

      <h5>
        <span class="text-warning"> <fa-icon icon="exclamation-triangle" /></span>
        <span> The page you were looking for is not found!</span>
      </h5>

      <p>You may have mistyped the address or the page may be have moved.</p>

      <b-button variant="primary" class="my-3 py-2" @click="goHome">
        <fa-icon icon="home"></fa-icon>
        <span class="pl-2"> Back to Home </span>
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goHome() {
      this.$router.replace('/');
    },
  },
};
</script>
