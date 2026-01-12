const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Function 1: Create Checkout
exports.createStripeCheckout = functions.https.onCall(async (request) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); 
  const { data, auth } = request;

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const userId = auth.uid;
  const { priceId, mode } = data;

  const userSnap = await admin.firestore().collection('users').doc(userId).get();
  const userEmail = userSnap.data().email;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: mode, 
      customer_email: userEmail,
      customer_creation: 'always', // CRITICAL: Ensures a 'cus_' ID is created for the portal
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: userId, type: mode },
      success_url: "http://restaurantradio.netlify.app/profile?success=true",
      cancel_url: "http://restaurantradio.netlify.app/profile?canceled=true",
    });

    return { url: session.url };
  } catch (error) {
    console.error("Stripe Error:", error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Function 2: Webhook
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; 

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;

    // Save BOTH Pro status and the Stripe Customer ID for the portal
    await admin.firestore().collection('users').doc(userId).update({
      isPro: true,
      stripeCustomerId: session.customer, 
      subscriptionStatus: 'active',
      planType: session.metadata.type,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  res.json({received: true});
});

// Function 3: Create Billing Portal (This was missing from your file!)
exports.createStripePortal = functions.https.onCall(async (request) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const { auth } = request;

  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const userDoc = await admin.firestore().collection('users').doc(auth.uid).get();
  const customerId = userDoc.data().stripeCustomerId;

  // The portal requires a 'cus_' ID. It will fail with a 'gcus_' Guest ID.
  if (!customerId || customerId.startsWith('gcus_')) {
    throw new functions.https.HttpsError('invalid-argument', 'No valid Stripe Customer found. Try a new test purchase.');
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'http://restaurantradio.netlify.app',
    });
    return { url: session.url };
  } catch (error) {
    console.error("Portal Error:", error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});