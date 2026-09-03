import { api } from './api';

export function loadRazorpaySDK() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function processPayment({ planId, userEmail, userName, onSuccess, onError, onDismiss }) {
  try {
    const isLoaded = await loadRazorpaySDK();
    if (!isLoaded) {
      throw new Error('Could not load payment gateway. Please check your internet connection.');
    }

    // 1. Create order on backend
    const orderData = await api.createPaymentOrder(planId);

    // 2. Setup Razorpay options
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Prepo.ai',
      description: `${orderData.plan_name} (${orderData.credits} Quiz Credits)`,
      image: '/assets/favicon.png',
      order_id: orderData.order_id,
      handler: async function (response) {
        try {
          const verifyResult = await api.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan_id: planId,
          });
          if (onSuccess) onSuccess(verifyResult);
        } catch (err) {
          if (onError) onError(err);
        }
      },
      prefill: {
        name: userName || '',
        email: userEmail || '',
      },
      theme: {
        color: '#2e73b8',
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) onDismiss();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      if (onError) onError(new Error(response.error.description || 'Payment failed'));
    });
    rzp.open();
  } catch (err) {
    if (onError) onError(err);
  }
}
