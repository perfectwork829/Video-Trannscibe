<template>
  <div class="check-out-page">
    <section class="payment-form">
      <h5 class="#e0e0e0 grey lighten-4">
        Payment Method
        <span class="right">${{ amount }}</span>
      </h5>
      <div class="error red center-align white-text">{{ stripeValidationError }}</div>
      <div class="row">
        <div class="col-md-12 card-element">
          <label>Card Number</label>
          <div id="card-number-element" class="input-value"></div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 card-element">
          <label>Expiry Date</label>
          <div id="card-expiry-element"></div>
        </div>

        <div class="col-md-6 card-element">
          <label>CVC</label>
          <div id="card-cvc-element"></div>
        </div>
      </div>
      <div class="place-order-button-block ">
        <button type="button" class="btn btn-primary col-md-12" id="btnProjectUpgrade"
          @click="placeOrderButtonPressed()">
          Place Order
        </button>
        <button type="button" class="btn btn-success col-md-12" id="btnProjectBack" @click="backButtonPressed()">
          Back
        </button>
      </div>
    </section>

  </div>

</template>
<script>
import axios from 'axios';
// import firebase from 'firebase/app';
// import 'firebase/firestore';
import firebase from 'firebase/compat/app';
import "firebase/compat/firestore";
import { loadStripe } from '@stripe/stripe-js';


export default {
  name: 'checkstripe',
  components: {

  },
  data() {
    return {
      stripe: null,
      cardNumberElement: null,
      cardExpiryElement: null,
      cardCVCElement: null,
      stripeValidationError: "",
      amount: 25,
      // storgeRef:
    };
  },
  async mounted() {
    // this.stripe = Stripe("pk_test_51MSofNBwpFz7RAPIVUlXrKHcP7aQQmeByFOrRgivjZQMVsk4pEIquAWmHc5eShpqs4jheQ2JKAl2GdavNPYgsIKl00GIOMktRW");
    this.stripe = await loadStripe('pk_test_51MSofNBwpFz7RAPIVUlXrKHcP7aQQmeByFOrRgivjZQMVsk4pEIquAWmHc5eShpqs4jheQ2JKAl2GdavNPYgsIKl00GIOMktRW');
    console.log("asdfasdfasdfasdf", this.stripe);
    this.createAndMountFormElements();
  },
  methods: {
    createAndMountFormElements() {
      var elements = this.stripe.elements();

      this.cardNumberElement = elements.create("cardNumber");
      this.cardNumberElement.mount("#card-number-element");

      this.cardExpiryElement = elements.create("cardExpiry");
      this.cardExpiryElement.mount("#card-expiry-element");

      this.cardCvcElement = elements.create("cardCvc");
      this.cardCvcElement.mount("#card-cvc-element");

      this.cardNumberElement.on("change", this.setValidationError);
      this.cardExpiryElement.on("change", this.setValidationError);
      this.cardCvcElement.on("change", this.setValidationError);
    },

    setValidationError(event) {
      this.stripeValidationError = event.error ? event.error.message : "";
    },
    placeOrderButtonPressed() {
      this.stripe.createToken(this.cardNumberElement).then(result => {
        if (result.error) {
          this.stripeValidationError = result.error.message;
        } else {
          var stripeObject = {
            amount: this.amount,
            source: result.token
          };
          this.saveDataToFireStore(stripeObject);
        }
      });
    },
    backButtonPressed() {
      this.$router.go(-1);
    },

    saveDataToFireStore(stripeObject) {
      console.log("stripe object", stripeObject);
      const db = firebase.firestore();
      const chargesRef = db.collection("charges")
      const pushId = chargesRef.doc().id

      db.collection("charges").doc(pushId).set(stripeObject)

      chargesRef.doc(pushId).onSnapshot(snapShot => {

        const charge = snapShot.data();

        if (charge.error) {
          alert(charge.error);
          chargesRef
            .doc(pushId)
            .delete();
          return;
        }else{
          alert (charge.amount);
        }

        if (charge.status && charge.status == "succeeded") {
          alert(charge.status);
        }
      })

    }
  }
};
</script>

<style>
.check-out-page {
  width: 450px;
  height: 100%;
  position: relative;
  margin: auto;
}

.payment-form {
  width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1rem;
  border: 1px solid #ececec;
}

.payment-form h5 {
  margin: 0;
  padding: 10px;
  font-size: 1.2rem;
}

.payment-form h5 span {
  float: right;
}

.card-element {
  margin-top: 5px;
}

#card-number-element,
#card-expiry-element,
#card-cvc-element {
  background: white;
  padding: 5px;
  border: 1px solid #ececec;
  height: 30px;
}

#btnProjectBack {
  margin-top: 1rem;
}

.place-order-button-block {
  margin: 30px 0;
}
</style>