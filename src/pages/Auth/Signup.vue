<template>
  <div id="signup-page">
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
                    <h4 class="card-title">Create Account</h4>
                  </div>
                  <div class="card-body">
                    <template v-if="!success && !error">
                      <form name="myform" class="signup_validate">
                        <!-- Username -->
                        <b-form-group label="Username">
                          <b-form-input
                            :state="formData.username.validate"
                            v-model="formData.username.value"
                            placeholder="What should we call you?"
                            autocomplete="new-password"
                            @blur="onChange($event, 'username')"
                            tabindex="0"
                          />
                        </b-form-group>

                        <!-- Email -->
                        <b-form-group label="Email">
                          <b-form-input
                            type="email"
                            v-model="formData.email.value"
                            :state="formData.email.validate"
                            placeholder="Ex: hello@example.com"
                            autocomplete="new-password"
                            @blur="onChange($event, 'email')"
                          />
                          <b-form-invalid-feedback>Please enter a valid email</b-form-invalid-feedback>
                        </b-form-group>

                        <!-- Password -->
                        <b-form-group label="Password">
                          <b-form-input
                            v-model="formData.password.value"
                            :state="formData.password.validate"
                            type="password"
                            placeholder="Min. 8 characters"
                            autocomplete="new-password"
                            @blur="onChange($event, 'password')"
                          />
                          <b-form-invalid-feedback>Password should be at least 8 characters</b-form-invalid-feedback>
                        </b-form-group>

                        <!-- Confirm Password -->
                        <b-form-group label="Confirm Password">
                          <b-form-input
                            v-model="formData.confirmPassword.value"
                            :state="formData.confirmPassword.validate"
                            type="password"
                            placeholder="Type your password again"
                            autocomplete="new-password"
                            @blur="onChange($event, 'confirmPassword')"
                          />
                          <b-form-invalid-feedback>Password didn't match</b-form-invalid-feedback>
                        </b-form-group>
                      </form>

                      <div class="text-center my-4">
                        <button
                          id="btnSignup"
                          class="btn btn-success btn-block"
                          @click="onSignup"
                          :disabled="!validateFormData()"
                        >
                          Sign up
                        </button>
                      </div>

                      <div class="new-account mt-3">
                        <p class="text-center mb-2">
                          Already have an account?
                          <a class="text-primary link">
                            <span @click="onLogin">Sign in</span>
                          </a>
                        </p>
                      </div>
                    </template>

                    <div class="py-5" v-if="success">
                      <SuccessMessage message="Please, check your email to verify your account." />
                    </div>

                    <div class="py-5" v-if="error">
                      <ErrorMessage message="We couldn't create your account. Please, contact your admin." />
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
  import { validateEmail, validatePassowrd } from 'app/utils';
  import AuthService from 'app/services/AuthService.js';
  import UserService from '../../services/UserService';
  import SuccessMessage from 'app/components/sharedComponents/SuccessMessage.vue';
  import ErrorMessage from 'app/components/sharedComponents/ErrorMessage.vue';
  export default {
    name: 'Signup',
    components: {
      PreLoader,
      ErrorMessage,
      SuccessMessage,
    },
    data: function () {
      return {
        error: false,
        success: false,
        showLoading: true,
        submitted: false,
        alertMessage: 'Please, check your email to verify your account.',
        formData: {
          username: { value: '', validate: null, errorMsg: '' },
          email: { value: '', validate: null, errorMsg: '' },
          password: { value: '', validate: null, errorMsg: '' },
          confirmPassword: { value: '', validate: null, errorMsg: '' },
        },
      };
    },
    mounted() {
      this.showLoading = false;
    },
    methods: {
      onChange(e, keyName) {
        this.validateField(e.target.value, keyName);
      },
      validateField(value, keyName) {
        // Reset input on clear
        if (value.length === 0) {
          this.formData[keyName].validate = null;
          this.formData[keyName].errorMsg = '';

          return;
        }

        switch (keyName) {
          case 'username':
            return (this.formData[keyName].validate = true);
          case 'email':
            return (this.formData.email.validate = validateEmail(value));
          case 'password':
            return (this.formData.password.validate = validatePassowrd(value));
          case 'confirmPassword':
            return (this.formData.confirmPassword.validate = this.formData.password.value === value);
        }
      },
      onLogin() {
        this.$router.push('/login');
      },
      validateFormData() {
        Object.keys(this.formData).forEach((item) => {
          this.validateField(this.formData[item].value, item);
        });

        let validate = true;

        Object.keys(this.formData).forEach((item) => {
          if (!this.formData[item].validate) validate = false;
        });

        return validate;
      },
      handleSuccess() {
        this.error = false;
        this.success = true;
      },
      handleFailure(e) {
        console.log(e);
        this.error = true;
        this.success = false;
      },
      async onSignup() {
        const validate = this.validateFormData();

        if (!validate) return;

        this.submitted = true;
        this.showLoading = true;

        AuthService.signup(this.formData.email.value, this.formData.password.value)
          .then(({ user }) => UserService.createSolo(user, this.formData.username.value || ''))
          .then(() => AuthService.verifyEmail())
          .then(() => AuthService.logout())
          .then(this.handleSuccess)
          .catch(this.handleFailure)
          .finally(() => (this.showLoading = false));
      },
    },
  };
</script>

<style lang="scss">
  input::placeholder {
    font-size: 0.8rem;
    color: var(--gray) !important;
  }
</style>
