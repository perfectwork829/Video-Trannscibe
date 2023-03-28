<template>
  <div id="login-page">
    <transition name="fade">
      <pre-loader v-if="showLoading"></pre-loader>
    </transition>
    <transition name="fade">
      <div id="main-wrapper" class="show" v-if="!showLoading">
        <div class="authincation section-padding">
          <div class="container h-100">
            <div class="row justify-content-center h-100 align-items-center">
              <div class="col-xl-5 col-md-6">
                <div class="auth-form card">
                  <div class="card-header justify-content-center">
                    <h4 class="card-title">Welcome Back!</h4>
                  </div>
                  <div class="card-body">
                    <form name="myform" class="signin_validate">
                      <div class="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          class="form-control"
                          placeholder="Email"
                          id="email"
                          v-model="email"
                          autocomplete="username"
                        />
                      </div>
                      <div class="form-group">
                        <div class="d-flex justify-content-between">
                          <label>Password</label>

                          <p class="text-right mb-0">
                            <a class="link">
                              <small @click="onForgotPassword">Forgot password?</small>
                            </a>
                          </p>
                        </div>

                        <input
                          type="password"
                          class="form-control"
                          placeholder="Password"
                          id="password"
                          v-model="password"
                          autocomplete="current-password"
                        />
                      </div>
                    </form>
                    <div class="text-center my-4">
                      <button
                        id="btnLogin"
                        class="btn btn-success btn-block"
                        @click="onLogin()"
                        :disabled="!hasValidCredentials()"
                      >
                        Sign in
                      </button>
                    </div>

                    <p class="text-center mb-2">
                      Don't have an account?
                      <a class="text-primary link">
                        <span @click="onSignup">Sign up</span>
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <alert-modal componentId="login-alert-modal" header="Invalid Credentials" :content="alertMessage"></alert-modal>
  </div>
</template>

<script>
  import AuthService from 'app/services/AuthService.js';
  import PreLoader from 'app/components/sharedComponents/PreLoader.vue';
  import AlertModal from 'app/components/sharedComponents/AlertModal.vue';
  import { validateEmail, validatePassowrd } from 'app/utils';

  export default {
    name: 'Login',
    components: {
      PreLoader,
      AlertModal,
    },
    data: function () {
      return {
        showLoading: true,
        email: '',
        password: '',
        alertMessage: '',
      };
    },
    mounted() {
      this.showLoading = false;
    },
    methods: {
      hasValidCredentials() {
        return validateEmail(this?.email) && validatePassowrd(this?.password);
      },
      onForgotPassword() {
        this.$router.push('/forgot-password');
      },
      onSignup() {
        this.$router.push('/signup');
      },
      handleSuccess() {
        this.$router.push({ name: 'dashboard' }).catch(this.handleError);
      },
      handleError() {
        this.alertMessage = 'Please try again with correct username and password.';

        this.$bvModal.show('login-alert-modal');

        this.showLoading = false;
      },
      checkEmailVerificationStatus({ user }) {
        return new Promise((resolve, reject) => {
          const isVerified = user?.emailVerified || false;

          if (!isVerified) {
            AuthService.logout().then(() => {
              this.$router.push('/email-verification-failed');
            });

            reject();
          } else {
            resolve();
          }
        });
      },
      async onLogin() {
        this.showLoading = true;

        AuthService.login(this.email, this.password)
          .then(this.checkEmailVerificationStatus)
          .then(this.handleSuccess)
          .catch(this.handleError);
      },
    },
  };
</script>

<style scoped lang="scss"></style>
