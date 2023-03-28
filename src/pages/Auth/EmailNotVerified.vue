<template>
  <div id="forgotpassword-page">
    <transition name="fade">
      <pre-loader v-if="showLoading"></pre-loader>
    </transition>

    <transition name="fade">
      <div id="main-wrapper" class="show" v-if="!showLoading">
        <div class="authincation section-padding">
          <div class="container h-100">
            <div class="row justify-content-center h-100 align-items-center">
              <div class="col-xl-6 col-md-8">
                <div class="auth-form card">
                  <div class="card-header justify-content-center">
                    <h4 class="card-title">Email Verification Failed</h4>
                  </div>
                  <div class="card-body">
                    <div class="my-5">
                      <ErrorMessage
                        message="You must verify your email first to be able to login. Please, check your inbox for verification instructions."
                      />
                    </div>

                    <div class="text-center mb-5">
                      <a class="text-primary link">
                        <router-link to="login"> Ready to Login? </router-link>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import PreLoader from 'app/components/sharedComponents/PreLoader.vue';
import ErrorMessage from 'app/components/sharedComponents/ErrorMessage.vue';

export default {
  name: 'Login',
  components: {
    PreLoader,
    ErrorMessage,
  },
  data: function () {
    return {
      showLoading: true,
    };
  },
  mounted() {
    this.showLoading = false;
  },
};
</script>

<style scoped lang="scss"></style>
