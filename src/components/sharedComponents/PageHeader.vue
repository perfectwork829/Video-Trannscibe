<template>
  <div id="page-header" class="card sub-menu">
    <div class="card-body top-bar">
      <div class="slot-container">
        <slot></slot>
      </div>

      <div class="d-flex align-items-center">
        <div class="alert-trial" v-if="dayDiff < 31 && totalDuration < 5">
          {{ 5 - totalDuration }} hours/{{ 30 - dayDiff }} days left
          <b-button variant="success" class="input-group-text ml-3 p-2" @click="onPucrchasePremium"> Upgrade </b-button>
        </div>
        <div v-else class="alert alert-danger h6 my-0">Your free trial has been exprired.</div>
        <div class="d-flex h-75 align-items-center">
          <b-button variant="primary" class="input-group-text ml-3" @click="onSetting">
            <fa-icon :icon="['fas', 'cog']" class="project-icon text-white" />
          </b-button>

          <b-button variant="primary" class="input-group-text ml-3" @click="logOut">
            <fa-icon :icon="['fas', 'sign-out-alt']" class="project-icon text-white" />
          </b-button>
        </div>
      </div>
    </div>

    <setting-modal :apiTokenProp="apiToken" @updateApiToken="($event) => (apiToken = $event)"></setting-modal>
    <purchase-premium-modal @checkout="checkOutStripe"></purchase-premium-modal>
  </div>
</template>

<script>
import AuthService from 'app/services/AuthService';
import SettingModal from 'app/components/pages/project/SettingModal.vue';
import PurchasePremiumModal from 'app/components/pages/user/PurchasePremiumModal.vue';
import TokenService from 'app/services/TokenService';
import { mapGetters } from 'vuex';

export default {
  name: 'PageHeader',
  components: {
    SettingModal,
    PurchasePremiumModal,
  },
  data: () => ({
    apiToken: '',
    dayDiff: 0,
    totalDuration: 0,
  }),

  ...mapGetters(['paperInfo']),

  mounted() {
    // get api token
    TokenService.getAll().once(
      'value',
      (snapShot) => {
        this.apiToken = snapShot.val().token;
      },
      (err) => {
        console.log(err);
      }
    );
    this.calculateTranscript();
  },

  methods: {
    async calculateTranscript() {
      var date1 = new Date(this.currentUser.createdAt);
      var date2 = new Date();
      this.dayDiff = this.timeDifference(date2, date1);

      // total duration
      let totalDuration = 0;
      this.paperInfo.clips.forEach((clip) => {
        totalDuration += clip.end_time - clip.start_time - 0;
      });
      var sec_num = Math.floor(totalDuration); 
      var hours = Math.floor(sec_num / 3600);
      this.totalDuration = hours;
    },
    timeDifference(date1, date2) {
      var difference = date1.getTime() - date2.getTime();

      var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
      difference -= daysDifference * 1000 * 60 * 60 * 24;

      var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
      difference -= hoursDifference * 1000 * 60 * 60;

      var minutesDifference = Math.floor(difference / 1000 / 60);
      difference -= minutesDifference * 1000 * 60;

      var secondsDifference = Math.floor(difference / 1000);

      console.log(
        'difference = ' +
          daysDifference +
          ' day/s ' +
          hoursDifference +
          ' hour/s ' +
          minutesDifference +
          ' minute/s ' +
          secondsDifference +
          ' second/s '
      );

      return daysDifference;
    },
    async logOut() {
      await AuthService.logout();

      await this.$store.dispatch('logout');

      this.$router.push('/login');
    },
    onSetting() {
      this.$bvModal.show('setting-modal');
    },
    onPucrchasePremium() {
      this.$bvModal.show('purchase-premium-modal');
    },
    checkOutStripe() {
      // console.log(['sdjfklasjfsl;afjsl']);
      this.$bvModal.hide('purchase-premium-modal');
      this.$router.push('/check-out');
    },
  },
};
</script>

<style lang="scss" scoped>
#page-header {
  .slot-container {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 20px;
  }

  .alert-trial {
    display: flex;
    padding: 5px;
    color: rgb(223, 223, 223);
    font-size: 15px;
    border-radius: 5px;
    border: solid 1px rgb(115, 0, 247);
    align-items: center;
  }
}
</style>
