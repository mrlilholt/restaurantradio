import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase'; 

const functions = getFunctions(app);

export const startCheckout = async (planType) => {
  const checkoutFunction = httpsCallable(functions, 'createStripeCheckout');

  // === REPLACE WITH YOUR ACTUAL STRIPE PRICE IDs ===
  const PRICE_MONTHLY  = "price_1SoGlI5o6c8X0AngseFkqk5z"; 
  const PRICE_ANNUAL   = "price_1SoP6W5o6c8X0AngnFUHPbwj"; // NEW ID
  const PRICE_LIFETIME = "price_1SoGmr5o6c8X0Angqv5bADcy"; 

  let priceId;
  let mode;

  // Logic to determine Price ID and Mode
  switch (planType) {
    case 'monthly':
      priceId = PRICE_MONTHLY;
      mode = 'subscription';
      break;
    case 'annual':
      priceId = PRICE_ANNUAL;
      mode = 'subscription';
      break;
    case 'lifetime':
      priceId = PRICE_LIFETIME;
      mode = 'payment'; // One-time payment
      break;
    default:
      console.error("Invalid plan type");
      return;
  }

  try {
    const response = await checkoutFunction({ priceId, mode });
    if (response.data.url) {
      window.location.assign(response.data.url);
    }
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    alert("Payment initialization failed. Please try again.");
  }
};

export const handleManageBilling = async () => {
  const functions = getFunctions();
  const createPortal = httpsCallable(functions, 'createStripePortal');

  try {
    const result = await createPortal();
    window.location.assign(result.data.url); 
  } catch (error) {
    console.error("Portal Error:", error);
    alert("Could not open billing management. Ensure you have an active subscription.");
  }
};