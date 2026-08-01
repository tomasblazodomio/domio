(function () {
  "use strict";

  var API_BASE = "https://x8ki-letl-twmt.n7.xano.io/api:PaI_PX__/calculate-widget-floor";

  function getCurrentScript() {
    if (document.currentScript) return document.currentScript;
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf("widget.js") !== -1) {
        return scripts[i];
      }
    }
    return null;
  }

  function init() {
    var scriptTag = getCurrentScript();
    if (!scriptTag) {
      console.error("[DOMIO widget] Nelze najit script tag.");
      return;
    }

    var apiKey = scriptTag.getAttribute("data-api-key");
    var containerId = scriptTag.getAttribute("data-container") || "domio-widget";

    if (!apiKey) {
      console.error("[DOMIO widget] Chybi data-api-key atribut.");
      return;
    }

    var container = document.getElementById(containerId);
    if (!container) {
      console.error("[DOMIO widget] Kontejner #" + containerId + " nenalezen na strance.");
      return;
    }

    var domain = window.location.hostname;

    renderForm(container, apiKey, domain);
  }

  function renderForm(container, apiKey, domain) {
    container.innerHTML =
      '<div class="domio-w-root" style="font-family:Arial,sans-serif;max-width:420px;">' +
      '<div class="domio-w-field" style="margin-bottom:12px;">' +
      '<label style="display:block;font-size:14px;margin-bottom:4px;">Plocha podlahy (m²) *</label>' +
      '<input type="number" id="domio-w-plocha" step="0.1" min="0" style="width:100%;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;" placeholder="napr. 20">' +
      "</div>" +
      '<div class="domio-w-field" style="margin-bottom:12px;">' +
      '<label style="display:block;font-size:14px;margin-bottom:4px;">Obvod mistnosti (bm)</label>' +
      '<input type="number" id="domio-w-obvod" step="0.1" min="0" style="width:100%;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;" placeholder="volitelne">' +
      "</div>" +
      '<div style="display:flex;gap:12px;margin-bottom:12px;">' +
      '<div class="domio-w-field" style="flex:1;">' +
      '<label style="display:block;font-size:14px;margin-bottom:4px;">Pocet dveri</label>' +
      '<input type="number" id="domio-w-dveri" min="0" value="0" style="width:100%;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;">' +
      "</div>" +
      '<div class="domio-w-field" style="flex:1;">' +
      '<label style="display:block;font-size:14px;margin-bottom:4px;">Vnitrni rohy</label>' +
      '<input type="number" id="domio-w-vnitrni" min="0" value="0" style="width:100%;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;">' +
      "</div>" +
      '<div class="domio-w-field" style="flex:1;">' +
      '<label style="display:block;font-size:14px;margin-bottom:4px;">Vnejsi rohy</label>' +
      '<input type="number" id="domio-w-vnejsi" min="0" value="0" style="width:100%;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;">' +
      "</div>" +
      "</div>" +
      '<button id="domio-w-submit" style="width:100%;padding:10px;background:#1a5f4a;color:#fff;border:none;border-radius:4px;font-size:15px;cursor:pointer;">Spocitat material</button>' +
      '<div id="domio-w-error" style="color:#c0392b;font-size:13px;margin-top:8px;display:none;"></div>' +
      '<div id="domio-w-result" style="margin-top:16px;"></div>' +
      "</div>";

    var submitBtn = container.querySelector("#domio-w-submit");
    submitBtn.addEventListener("click", function () {
      handleSubmit(container, apiKey, domain);
    });
  }

  function handleSubmit(container, apiKey, domain) {
    var errorBox = container.querySelector("#domio-w-error");
    var resultBox = container.querySelector("#domio-w-result");
    errorBox.style.display = "none";
    resultBox.innerHTML = "";

    var plocha = container.querySelector("#domio-w-plocha").value;
    if (!plocha || parseFloat(plocha) <= 0) {
      errorBox.textContent = "Zadejte prosim plochu podlahy.";
      errorBox.style.display = "block";
      return;
    }

    var params = new URLSearchParams({
      plocha_m2: plocha,
      obvod_m: container.querySelector("#domio-w-obvod").value || "",
      pocet_dveri: container.querySelector("#domio-w-dveri").value || "0",
      pocet_vnitrni_rohy: container.querySelector("#domio-w-vnitrni").value || "0",
      pocet_vnejsi_rohy: container.querySelector("#domio-w-vnejsi").value || "0",
      api_key: apiKey,
      domain: domain
    });

    var submitBtn = container.querySelector("#domio-w-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Pocitam...";

    fetch(API_BASE + "?" + params.toString(), { method: "GET" })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Spocitat material";

        if (!result.ok) {
          errorBox.textContent =
            (result.data && result.data.message) ||
            "Nepodarilo se nacist vysledek. Zkuste to prosim znovu.";
          errorBox.style.display = "block";
          return;
        }

        renderResult(resultBox, result.data, container);
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Spocitat material";
        errorBox.textContent = "Nepodarilo se spojit se serverem. Zkuste to prosim znovu.";
        errorBox.style.display = "block";
      });
  }

  function renderResult(resultBox, data, container) {
    resultBox.innerHTML =
      '<div style="border:1px solid #e0e0e0;border-radius:6px;padding:16px;background:#f9f9f7;">' +
      '<h4 style="margin:0 0 12px;font-size:16px;">Vas nakupni seznam</h4>' +
      row("Plocha vcetne odpadu", data.plocha_s_odpadem + " m²") +
      row("Baleni (varianta A)", data.baleni_var1 + " ks") +
      row("Baleni (varianta B)", data.baleni_var2 + " ks") +
      row("Listy - bm", data.listy_bm + " bm") +
      row("Listy - kusy", data.listy_ks + " ks") +
      row("Rohove spojky", data.rohove_spojky + " ks") +
      row("Sterka", data.sterka_kg + " kg (" + data.sterka_baleni + " baleni)") +
      "</div>" +
      '<button id="domio-w-addcart" style="width:100%;padding:10px;margin-top:12px;background:#e67e22;color:#fff;border:none;border-radius:4px;font-size:15px;cursor:pointer;">Pridat do kosiku</button>';

    var addCartBtn = resultBox.querySelector("#domio-w-addcart");
    addCartBtn.addEventListener("click", function () {
      var event = new CustomEvent("domioWidgetAddToCart", {
        bubbles: true,
        detail: data
      });
      container.dispatchEvent(event);
    });
  }

  function row(label, value) {
    return (
      '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;border-bottom:1px solid #eee;">' +
      "<span>" + label + "</span><strong>" + value + "</strong></div>"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
