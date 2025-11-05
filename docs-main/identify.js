// //identify.js
(function () {
  try {
    // Example lookups — replace with your real keys
    // Cookie example: md_uid=user@example.com
    var cookieUid = (document.cookie.match(/(?:^|; )md_uid=([^;]+)/) || [])[1];
    var lsUid = localStorage.getItem("md_user_id"); // e.g., set by app
    var uid = decodeURIComponent(cookieUid || lsUid || "");

    // Optional traits payload from your app
    var traits = {};
    try { traits = JSON.parse(localStorage.getItem("md_user_traits") || "{}"); } catch (_) {}

    if (uid && window.analytics && typeof window.analytics.identify === "function") {
      // If you standardize on email as userId, pass the normalized email here
      window.analytics.identify(uid, traits);
    }
  } catch (e) {
    // swallow
  }
})();
