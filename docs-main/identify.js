// /identify.js  (Mintlify will load this site-wide)
(function () {
  // ---- Config (adjust if your keys differ) ----
  var COOKIE_KEY = "md_uid";           // e.g. md_uid=user@example.com
  var LS_UID_KEY = "md_user_id";       // e.g. localStorage.setItem("md_user_id", email)
  var LS_TRAITS_KEY = "md_user_traits";// e.g. localStorage.setItem("md_user_traits", JSON.stringify({...}))
  var HOST_LIMIT = "docs.messagedesk.com"; // only run on docs

  if (location.hostname !== HOST_LIMIT) return;

  function normalizeEmail(v) {
    return (v || "").toString().trim().toLowerCase() || null;
  }

  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&') + '=([^;]*)'));
    if (!m) return null;
    try { return decodeURIComponent(m[1]); } catch (_) { return m[1]; }
  }

  // Pull ID & traits from first-party storage
  var uid = normalizeEmail(getCookie(COOKIE_KEY)) || normalizeEmail(localStorage.getItem(LS_UID_KEY));
  var traits = {};
  try {
    var raw = localStorage.getItem(LS_TRAITS_KEY);
    traits = raw ? JSON.parse(raw) : {};
  } catch (_) {}

  // Nothing to do if we don't have a usable ID
  if (!uid) return;

  // Wait for analytics.js to be ready, with a light fallback poll
  function whenAnalyticsReady(cb) {
    if (window.analytics && typeof window.analytics.ready === "function") {
      window.analytics.ready(cb);
      return;
    }
    var tries = 0;
    (function wait() {
      if (window.analytics && typeof window.analytics.identify === "function") return cb();
      if (tries++ < 40) setTimeout(wait, 250); // up to ~10s
    })();
  }

  function alreadyIdentifiedSameUser() {
    try {
      if (!window.analytics || typeof window.analytics.user !== "function") return false;
      var currentId = window.analytics.user().id && window.analytics.user().id();
      // If currentId looks like an email, compare normalized
      return currentId && normalizeEmail(currentId) === uid;
    } catch (_) {
      return false;
    }
  }

  whenAnalyticsReady(function () {
    try {
      if (alreadyIdentifiedSameUser()) return; // avoid duplicate identify
      // Ensure email also exists in traits (normalized)
      traits = traits && typeof traits === "object" ? traits : {};
      if (!traits.email) traits.email = uid;

      window.analytics.identify(uid, traits);
    } catch (_) {
      // swallow
    }
  });
})();
