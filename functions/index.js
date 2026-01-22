const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Set global options
setGlobalOptions({ region: "us-central1" });

// ==========================================
// 1. STRIPE PAYMENTS
// ==========================================

// Function 1: Create Checkout
exports.createStripeCheckout = onCall(async (request) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); 
  const { data, auth } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in');
  }

  const userId = auth.uid;
  const { priceId, mode } = data;

  const userSnap = await db.collection('users').doc(userId).get();
  const userEmail = userSnap.data().email;

  try {
    const sessionConfig = {
      payment_method_types: ["card"],
      mode: mode, 
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: userId, type: mode },
      success_url: "http://restaurantradio.netlify.app/profile?success=true",
      cancel_url: "http://restaurantradio.netlify.app/profile?canceled=true",
    };

    if (mode === 'payment') {
      sessionConfig.customer_creation = 'always';
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return { url: session.url };
  } catch (error) {
    console.error("Stripe Error:", error);
    throw new HttpsError('internal', error.message);
  }
});

// Function 2: Webhook
exports.stripeWebhook = onRequest(async (req, res) => {
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

    await db.collection('users').doc(userId).update({
      isPro: true,
      stripeCustomerId: session.customer, 
      subscriptionStatus: 'active',
      planType: session.metadata.type,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  res.json({received: true});
});

// Function 3: Create Billing Portal
exports.createStripePortal = onCall(async (request) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const { auth } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in');
  }

  const userDoc = await db.collection('users').doc(auth.uid).get();
  const customerId = userDoc.data().stripeCustomerId;

  if (!customerId || customerId.startsWith('gcus_')) {
    throw new HttpsError('invalid-argument', 'No valid Stripe Customer found. Try a new test purchase.');
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'http://restaurantradio.netlify.app/profile', 
    });
    return { url: session.url };
  } catch (error) {
    console.error("Portal Error:", error);
    throw new HttpsError('internal', error.message);
  }
});


// ==========================================
// 2. REFERRAL LOGIC
// ==========================================

exports.handleReferralReward = onDocumentUpdated("users/{userId}", async (event) => {
    // In v2, we access data via event.data
    const newData = event.data.after.data();
    const oldData = event.data.before.data();
    
    // Safety check for deletions
    if (!newData || !oldData) return null;

    // 1. CHECK CONVERSION: Did they just switch from Free -> Pro?
    const wasPro = oldData.isPro || false;
    const isNowPro = newData.isPro || false;

    if (wasPro || !isNowPro) return null;

    // 2. CHECK REFERRAL: Were they referred by anyone?
    const referrerId = newData.referredBy;
    if (!referrerId) return null; 

    // Access wildcard param via event.params
    console.log(`User ${event.params.userId} upgraded. Crediting referrer: ${referrerId}`);

    // 3. UPDATE THE REFERRER
    const referrerRef = db.collection("users").doc(referrerId);

    try {
      await db.runTransaction(async (t) => {
        const referrerDoc = await t.get(referrerRef);
        
        if (!referrerDoc.exists) {
            console.log("Referrer doc not found"); 
            return;
        }

        const currentData = referrerDoc.data();
        const currentCount = currentData.referralCount || 0;
        const newCount = currentCount + 1;

        let updates = { referralCount: newCount };

        // 4. THE REWARD LOGIC: If they hit 2 referrals, grant free access
        if (newCount >= 2) {
            updates.earnedFreeAccess = true;
            updates.isPro = true; 
            console.log(`Referrer ${referrerId} has earned Lifetime Access!`);
        }

        t.update(referrerRef, updates);
      });
    } catch (error) {
      console.error("Referral Transaction failure:", error);
    }
    
    return null;
  });
