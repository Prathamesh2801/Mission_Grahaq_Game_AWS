// Card copy from the client's revised question bank (Oct 2026), grouped by its sets.
// Each card: sprite icon + lines of [text, bold]; the situation is regular, the call to action bold.

export const redFlags = [
  // Set 1: Account & Delivery
  {
    icon: "lock",
    lines: [
      ["Your account is locked.", false],
      ["Send ₹100 to verify your identity and unlock it.", true],
    ],
  },
  {
    icon: "box",
    lines: [
      ["Delivery delayed.", false],
      ["Pay ₹100 via this UPI link to reschedule.", true],
    ],
  },
  {
    icon: "card",
    lines: [
      ["Refund pending.", false],
      ["Enter your card details to receive it.", true],
    ],
  },
  {
    icon: "globe",
    lines: [
      ["Anazzom-support-help.in", false],
      ["Log in to verify your account and avoid suspension.", true],
    ],
  },
  {
    icon: "lock",
    lines: [
      ["Urgent:", false],
      [
        "Share your password to verify your account and avoid suspension.",
        true,
      ],
    ],
  },
  {
    icon: "receipt",
    lines: [
      ["Your refund is ready.", false],
      ["Click here and enter your card details to process it.", true],
    ],
  },
  {
    icon: "box",
    lines: [
      ["Your package cannot be delivered.", false],
      [
        "Pay ₹142 in the next 2 minutes via this external link to receive it.",
        true,
      ],
    ],
  },
  {
    icon: "box",
    lines: [
      ["COD parcel awaiting payment.", false],
      [
        "Pay ₹205 in the next 1 minute via this WhatsApp link to release it.",
        true,
      ],
    ],
  },
  {
    icon: "coin",
    lines: [
      ["A gift from your family is ready.", false],
      ["Pay ₹258 in the next 2 minutes to this UPI ID to receive it.", true],
    ],
  },
  {
    icon: "truck",
    lines: [
      ["Unpaid delivery fee.", false],
      [
        "Send ₹96 in the next 1 minute to this bank account to receive your package.",
        true,
      ],
    ],
  },
  {
    icon: "truck",
    lines: [
      ["Delivery failed.", false],
      ["Pay ₹82 in the next 30 seconds via this SMS link to reschedule.", true],
    ],
  },
  {
    icon: "PriceTag",
    lines: [
      ["₹10,000 → ₹999. TODAY ONLY!", false],
      ["Pay now via this external link.", true],
    ],
  },
  {
    icon: "present",
    lines: [
      ["90% OFF + FREE GIFT.", false],
      ["Pay immediately to claim it!", true],
    ],
  },
  // Set 2: Payment & Personal Information
  {
    icon: "card",
    lines: [
      ["Pay via this QR code sent on WhatsApp", false],
      ["to complete your order.", true],
    ],
  },
  {
    icon: "PriceTag",
    lines: [
      ["Pay outside the app", false],
      ["and get an extra 20% off!", true],
    ],
  },
  {
    icon: "link",
    lines: [
      ["Use this link to complete your payment.", false],
      ["Do not use the app.", true],
    ],
  },
  {
    icon: "card",
    lines: [
      ["Your bank server is down.", false],
      ["Pay using this alternate link.", true],
    ],
  },
  {
    icon: "receipt",
    lines: [
      ["Scan this QR code", false],
      ["to receive your refund.", true],
    ],
  },
  {
    icon: "bank",
    lines: [
      ["Send ₹152", false],
      ["to verify your bank account.", true],
    ],
  },
  {
    icon: "moblie",
    lines: [
      ["Share the OTP details", false],
      ["to process your refund.", true],
    ],
  },
  {
    icon: "card",
    lines: [
      ["Share your card CVV", false],
      ["to cancel the order.", true],
    ],
  },
  // Set 3: Urgency & Pressure
  {
    icon: "moblie",
    lines: [
      ["Pay directly to the seller’s personal UPI", false],
      ["to confirm your order.", true],
    ],
  },
  {
    icon: "box",
    lines: [
      ["Pay through this link to unlock your offer.", false],
      ["Offer expires in 2 minutes!", true],
    ],
  },
  {
    icon: "siren",
    lines: [
      ["Click now or lose your discount!", false],
      ["Enter your card details immediately.", true],
    ],
  },
  {
    icon: "coin",
    lines: [
      ["Your refund expires today.", false],
      ["Share your OTP to claim it now!", true],
    ],
  },
  {
    icon: "lock",
    lines: [
      ["Verify your card details now", false],
      ["or your account will be suspended.", true],
    ],
  },
  {
    icon: "siren",
    lines: [
      ["Complete payment via this external link", false],
      ["immediately to avoid cancellation.", true],
    ],
  },
  {
    icon: "PriceTag",
    lines: [
      ["Click this link now to claim your mega offer.", false],
      ["Share your bank details to proceed.", true],
    ],
  },
  // Set 4: Deals & Seller Red Flags
  {
    icon: "watch",
    lines: [
      ["Branded luxury watch for ₹499.", false],
      ["Limited stock, pay seller directly to buy now!", true],
    ],
  },
  {
    icon: "moblie",
    lines: [
      ["Latest premium smartphone for ₹2,999.", false],
      ["Limited time, pay via this Telegram link!", true],
    ],
  },
  {
    icon: "link",
    lines: [
      ["Exclusive offer — available only through this external link.", false],
      ["Not on the app.", true],
    ],
  },
  {
    icon: "present",
    lines: [
      ["FREE product!", false],
      ["Pay only a small processing fee.", true],
    ],
  },
  {
    icon: "coin",
    lines: [
      ["99% extra discount.", false],
      ["Pay the seller directly.", true],
    ],
  },
  {
    icon: "star",
    lines: [
      ["Official seller account. Huge discount —", false],
      ["pay directly to seller's UPI to buy!", true],
    ],
  },
  // Not in the client's revised bank (Oct 2026). Kept for now, may be removed later.
  // { icon: 'link', lines: [["Payment failed.", false], ["Click here to retry.", true]] },
  // { icon: 'box', lines: [["Confirm identity", true], ["to receive package.", false]] },
  // { icon: 'box', lines: [["Parcel waiting.", false], ["Cash payment required.", true]] },
  // { icon: 'box', lines: [["Pay before", false], ["opening package.", true]] },
  // { icon: 'clock', lines: [["Pay in 10 minutes or", false], ["order cancelled.", true]] },
  // { icon: 'clock', lines: [["5 minutes left.", false], ["Pay via this link.", true]] },
  // { icon: 'PriceTag', lines: [["Big brands. Unbelievable price.", false], ["Buy now!", true]] },
];

export const decoys = [
  // Set 1: Orders & Delivery
  {
    icon: "box",
    lines: [
      ["Your order has shipped.", false],
      ["Track it in the app.", true],
    ],
  },
  {
    icon: "truck",
    lines: [
      ["Your delivery is", false],
      ["scheduled for tomorrow.", true],
    ],
  },
  {
    icon: "box",
    lines: [
      ["Your order was delivered.", false],
      ["View details in the app.", true],
    ],
  },
  {
    icon: "moblie",
    lines: [
      ["Your order status has been updated.", false],
      ["View it in the app.", true],
    ],
  },
  {
    icon: "truck",
    lines: [
      ["View your delivery details", false],
      ["in the app.", true],
    ],
  },
  {
    icon: "box",
    lines: [
      ["Your order is ready for delivery.", false],
      ["Track its progress in the app.", true],
    ],
  },
  {
    icon: "truck",
    lines: [
      ["Your delivery is on the way.", false],
      ["View the latest status in your account.", true],
    ],
  },
  // Set 2: Sellers & Products
  {
    icon: "receipt",
    lines: [
      ["Product specifications and", false],
      ["warranty details are available.", true],
    ],
  },
  {
    icon: "star",
    lines: [
      ["View verified product reviews", false],
      ["and customer photos.", true],
    ],
  },
  {
    icon: "badge",
    lines: [
      ["View seller information", false],
      ["and ratings before you buy.", true],
    ],
  },
  {
    icon: "receipt",
    lines: [
      ["Product, seller and return details", false],
      ["are available on the product page.", true],
    ],
  },
  {
    icon: "recycle",
    lines: [
      ["View the seller's", false],
      ["return and refund policy.", true],
    ],
  },
  {
    icon: "PriceTag",
    lines: [
      ["Check product specifications, price", false],
      ["and availability before ordering.", true],
    ],
  },
  // Set 3: Payments & Refunds
  {
    icon: "card",
    lines: [
      ["Payment successful.", false],
      ["View your order details in the app.", true],
    ],
  },
  {
    icon: "receipt",
    lines: [
      ["Your refund has been initiated.", false],
      ["Check your account for details.", true],
    ],
  },
  {
    icon: "moblie",
    lines: [
      ["View your payment details", false],
      ["in your order history.", true],
    ],
  },
  {
    icon: "bank",
    lines: [
      ["Your payment has been received.", false],
      ["View the transaction in your account.", true],
    ],
  },
  {
    icon: "coin",
    lines: [
      ["Refund processed.", false],
      ["Check your account for the latest update.", true],
    ],
  },
  {
    icon: "card",
    lines: [
      ["Payment completed securely.", false],
      ["View the transaction in your account.", true],
    ],
  },
  // Set 4: Customer Support & Returns
  {
    icon: "moblie",
    lines: [
      ["Need help?", false],
      ["Contact customer support through the app.", true],
    ],
  },
  {
    icon: "recycle",
    lines: [
      ["Start your return from", false],
      ["the Returns section in the app.", true],
    ],
  },
  {
    icon: "chat",
    lines: [
      ["View your complaint status", false],
      ["in the app.", true],
    ],
  },
  {
    icon: "chat",
    lines: [
      ["Your support ticket has been created.", false],
      ["View details in the app.", true],
    ],
  },
  {
    icon: "recycle",
    lines: [
      ["View the return and refund policy", false],
      ["before placing your order.", true],
    ],
  },
  {
    icon: "chat",
    lines: [
      ["Need help with your order?", false],
      ["Contact support through the app.", true],
    ],
  },
  {
    icon: "box",
    lines: [
      ["Your return request has been received.", false],
      ["View its status in the app.", true],
    ],
  },
  // Not in the client's revised bank (Oct 2026). Kept for now, may be removed later.
  // { icon: 'badge', lines: [["Seller Profile", true], ["4.7★ | 2,500+ reviews", false]] },
];
