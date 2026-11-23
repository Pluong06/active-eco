/*
 * Edit these values once — every page on the site uses them.
 * Price IDs must match ecom-affiliate-assistant/config.js and license-worker/worker.js.
 */
window.SITE = {
  chromeStoreUrl: "https://chromewebstore.google.com/detail/YOUR-EXTENSION-ID",
  supportEmail: "luongshinichi@gmail.com",
  activateUrl: "https://pluong06.github.io/active-eco/activate.html",

  paddle: {
    environment: "production",        // "sandbox" while testing with test cards
    clientToken: "live_3528247d6b3daf1a7c411fdedfa" // Paddle → Developer tools → Authentication → Client-side tokens
  },

  // Empty price = plan hidden on the site.
  prices: {
    weekly: "",
    monthly: "pri_01m83q3fybvvmdg9jfe0k08tme",
    yearly: "pri_01m83q9rf2j6ehw2e7b9rfa52m",
    lifetime: "pri_01m83qcgjdej3gyrjjxm0wqqxd"
  }
};

/* ---------------------------------------------------------------------------
 * Paddle checkout
 * ------------------------------------------------------------------------- */
let paddleReady = null;

function paddleConfigured() {
  const t = window.SITE.paddle.clientToken || "";
  return /^(live|test)_/.test(t) && !/X{6,}/.test(t);
}

function loadPaddle() {
  if (paddleReady) return paddleReady;
  paddleReady = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.onload = () => {
      const cfg = window.SITE.paddle;
      if (cfg.environment === "sandbox") Paddle.Environment.set("sandbox");
      Paddle.Initialize({
        token: cfg.clientToken,
        eventCallback: e => {
          if (e.name === "checkout.completed" && e.data && e.data.transaction_id) {
            // The transaction ID is the license key → show it on the activate page.
            setTimeout(() => {
              location.href = `${window.SITE.activateUrl}?key=${encodeURIComponent(e.data.transaction_id)}`;
            }, 1500);
          }
        }
      });
      resolve();
    };
    s.onerror = () => reject(new Error("Could not load Paddle checkout."));
    document.head.appendChild(s);
  });
  return paddleReady;
}

async function openCheckout(plan) {
  const priceId = window.SITE.prices[plan];
  if (!priceId) return;
  if (!paddleConfigured()) {
    alert(`Checkout is opening soon. Email ${window.SITE.supportEmail} to buy now.`);
    return;
  }
  try {
    await loadPaddle();
    Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      settings: { displayMode: "overlay", theme: "light", allowLogout: true }
    });
  } catch (err) {
    alert(err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const S = window.SITE;
  const params = new URLSearchParams(location.search);

  // Opened by the extension right after install → show the welcome / setup mode.
  if (params.has("installed") || location.hash === "#welcome") {
    document.body.classList.add("installed");
    document.title = "Welcome! 🎉 — E-Com & Affiliate Assistant";
  }

  document.querySelectorAll("[data-checkout]").forEach(a => {
    const plan = a.dataset.checkout;
    if (!S.prices[plan]) {
      const box = a.closest(".plan-row, .plan");
      if (box) box.remove();
      return;
    }
    a.href = "#pricing";
    a.addEventListener("click", e => {
      e.preventDefault();
      openCheckout(plan);
    });
  });

  // ?buy=yearly (from the extension's upgrade buttons) → open checkout right away.
  // ?_ptxn=... (Paddle default payment link) → Paddle.js opens that checkout itself.
  const buy = params.get("buy");
  if (buy && S.prices[buy]) openCheckout(buy);
  else if (params.has("_ptxn") && paddleConfigured()) loadPaddle();

  document.querySelectorAll("[data-store]").forEach(a => (a.href = S.chromeStoreUrl));
  document.querySelectorAll("[data-email]").forEach(a => {
    a.href = `mailto:${S.supportEmail}`;
    if (!a.textContent.trim()) a.textContent = S.supportEmail;
  });

  // Activate page: show the license key passed from checkout.
  const key = (params.get("key") || "").trim();
  const keyBox = document.getElementById("keyBox");
  if (keyBox && /^txn_[a-z0-9]{26}$/i.test(key)) {
    document.getElementById("keyValue").textContent = key;
    keyBox.classList.remove("hidden");
    document.getElementById("copyKey").addEventListener("click", async e => {
      try {
        await navigator.clipboard.writeText(key);
        e.target.textContent = "✓ Copied";
      } catch (_) {
        getSelection().selectAllChildren(document.getElementById("keyValue"));
      }
    });
  }

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
});
