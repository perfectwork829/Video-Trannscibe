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
                    <h4 class="card-title">Reset Password</h4>
                  </div>
                  <div class="card-body">
                    <div class="form" v-if="!success && !error">
                      <form name="myform" class="signin_validate">
                        <div class="form-group">
                          <label class="text-small">Please enter your email to reset password</label>
                          <input type="email" class="form-control" placeholder="Email" id="email" v-model="email" />
                        </div>
                      </form>

                      <div class="text-center">
                        <button
                          id="btnSendLink"
                          class="btn btn-success btn-block my-4"
                          @click="onSendLink()"
                          :disabled="!hasValidEmail()"
                        >
                          Send Link
                        </button>
                      </div>
                    </div>

                    <div class="py-5" v-if="success">
                      <SuccessMessage
                        message="We have sent you a password reset email. Please, follow the instructions stated in the email."
                      />
                    </div>

                    <div class="py-5" v-if="error">
                      <ErrorMessage
                        message="We weren't able to reset the password for this email address. Please, check the entered email
                        and try again."
                      />
                    </div>

                    <div class="text-right">
                      <a class="text-primary link">
                        <router-link to="login">
                          <small>{{ success || error ? 'Ready to Login?' : 'Login Instead?' }}</small>
                        </router-link>
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
import AuthService from 'app/services/AuthService';
import { validateEmail } from 'app/utils';
import PreLoader from 'app/components/sharedComponents/PreLoader.vue';
import ErrorMessage from 'app/components/sharedComponents/ErrorMessage.vue';
import SuccessMessage from 'app/components/sharedComponents/SuccessMessage.vue';

export default {
  name: 'ForgotPassword',
  components: {
    PreLoader,
    ErrorMessage,
    SuccessMessage,
  },
  data: function () {
    return {
      showLoading: true,
      success: false,
      error: false,
      email: '',
    };
  },
  mounted() {
    this.showLoading = false;
  },
  methods: {
    hasValidEmail() {
      return validateEmail(this?.email);
    },
    handleSuccess() {
      this.error = false;
      this.success = true;
    },
    handleFailure() {
      this.success = false;
      this.error = true;
    },
    async onSendLink() {
      AuthService.forgetPassowrd(this.email)
        .then(this.handleSuccess)
        .catch(this.handleFailure)
        .finally(() => (this.showLoading = false));
    },
  },
};
</script>

<style scoped lang="scss"></style>
