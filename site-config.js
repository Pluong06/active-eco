/*
 * Edit these links once — every page on the site uses them.
 * Checkout links must match ecom-affiliate-assistant/config.js.
 */
window.SITE = {
  chromeStoreUrl: "https://chromewebstore.google.com/detail/YOUR-EXTENSION-ID",
  supportEmail: "luongshinichi@gmail.com",
  customerPortalUrl: "https://app.lemonsqueezy.com/my-orders",
  checkout: {
    weekly: "https://yourstore.lemonsqueezy.com/buy/WEEKLY-VARIANT-ID",
    monthly: "https://yourstore.lemonsqueezy.com/buy/MONTHLY-VARIANT-ID",
    yearly: "https://yourstore.lemonsqueezy.com/buy/YEARLY-VARIANT-ID",
    lifetime: "https://yourstore.lemonsqueezy.com/buy/LIFETIME-VARIANT-ID"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const S = window.SITE;

  // Opened by the extension right after install → show the welcome / setup mode.
  const params = new URLSearchParams(location.search);
  if (params.has("installed") || location.hash === "#welcome") {
    document.body.classList.add("installed");
    document.title = "Welcome! 🎉 — E-Com & Affiliate Assistant";
  }

  document.querySelectorAll("[data-checkout]").forEach(a => (a.href = S.checkout[a.dataset.checkout]));
  document.querySelectorAll("[data-store]").forEach(a => (a.href = S.chromeStoreUrl));
  document.querySelectorAll("[data-portal]").forEach(a => (a.href = S.customerPortalUrl));
  document.querySelectorAll("[data-email]").forEach(a => {
    a.href = `mailto:${S.supportEmail}`;
    if (!a.textContent.trim()) a.textContent = S.supportEmail;
  });
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
});
