const functions = require("firebase-functions");
const stripe = require('stripe')('sk_test_51MSofNBwpFz7RAPIQepSWL6ARlRB8JkIeKv9LXYhrbLiInZ6EGs7erFWUafvrlSOOjKx8amInCz6LBXuSMCCE0O2009tihO5B1')
// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


exports.createStripeCharge = functions.firestore
    .document('charges/{pushId}')
    .onCreate(async (snap, context) => {
    try {
        const charge = {
            amount : snap.data().amount * 100,
            source: snap.data().source.id,
            currency: 'cad'
        }
        const idempotencyKey = context.params.pushId
        const response = await stripe.charges.create(charge, {
            idempotency_key: idempotencyKey
        })

        await snap.ref.set(response, {
            merge: true
        })

    }  catch (error) {
        await snap.ref.set({
            error: userFacingMessage(error)
        }, {
            merge: true
        })
    }
})

function userFacingMessage(error) {
    return error.type ? error.message : 'An error occurred, developers have been alerted';

}