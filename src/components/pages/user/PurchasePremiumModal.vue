<template>
  <b-modal id="purchase-premium-modal" centered>
    <template #modal-header="{ close }">
      <h4 class="modal-title">Upgrade to your unlimited use</h4>
      <button type="button" class="close" data-dismiss="modal" @click="close()">
        &times;
      </button>
    </template>
    <div>
      <p><fa-icon :icon="['fas', 'check']" class="project-icon text-success" /> 25$/month</p>
      <p><fa-icon :icon="['fas', 'check']" class="project-icon text-success" /> 5hours/free</p>
      <p><fa-icon :icon="['fas', 'check']" class="project-icon text-success" /> 5$/1hour</p>
      <p><fa-icon :icon="['fas', 'check']" class="project-icon text-success" /> 100hour limit/1month</p>
    </div>

    <template #modal-footer="{ ok, cancel }">
      <div class="w-100 d-flex justify-content-end">
        <button type="button" class="btn btn-primary mr-1" id="btnProjectUpgrade" @click="onUpgrade(ok)">
          Upgrade
        </button>
        <button type="button" class="btn btn-outline-primary ml-1" data-dismiss="modal" @click="cancel()">
          Close
        </button>
      </div>
    </template>
  </b-modal>

</template>

<script>



export default {
  name: 'PurchasePremiumModal',
  components: {
  },
  props: [],
  data: function () {
    return {
    };
  },
  methods: {
    async onUpgrade(closeModal) {
      console.log('sdjflsajflsafjs');
      this.$emit('checkout');
    },
  },
};
</script>
