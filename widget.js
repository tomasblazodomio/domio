(function () {
  "use strict";

  var API_URL = "https://x8ki-letl-twmt.n7.xano.io/api:PaI_PX__/calculate-widget-floor";

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
    var containerId = scriptTag.getAttribute("data-container") || "domio-widget-container";

    if (!apiKey) {
      console.error("[DOMIO widget] Chybi data-api-key atribut.");
      return;
    }

    var container = document.getElementById(containerId);
    if (!container) {
      console.error("[DOMIO widget] Kontejner #" + containerId + " nenalezen na strance.");
      return;
    }

    var productCategory = container.getAttribute("data-product-category") || "";

    var domain = window.location.hostname;

    injectStyles();
    container.innerHTML = buildMarkup();
    wireUpWidget(container, apiKey, domain, productCategory);
  }

  function injectStyles() {
    if (document.getElementById("domio-widget-styles")) return;
    var style = document.createElement("style");
    style.id = "domio-widget-styles";
    style.textContent =
      ".domio-widget{--domio-primary:#1a7f5a;--domio-primary-dark:#145f43;--domio-bg:#ffffff;--domio-border:#e2e2e2;--domio-text:#1f1f1f;--domio-muted:#6b6b6b;--domio-radius:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;background:var(--domio-bg);border:1px solid var(--domio-border);border-radius:var(--domio-radius);padding:24px;color:var(--domio-text);box-sizing:border-box;box-shadow:0 16px 40px rgba(15,46,34,0.08);}" +
      ".domio-widget *{box-sizing:border-box;}" +
      ".domio-title{font-size:18px;font-weight:700;margin:0 0 4px 0;color:var(--domio-text);}" +
      ".domio-subtitle{font-size:13px;color:var(--domio-muted);margin:0 0 20px 0;}" +
      ".domio-field{margin-bottom:14px;}" +
      ".domio-field label{display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:var(--domio-text);}" +
      ".domio-field input{width:100%;padding:10px 12px;border:1px solid var(--domio-border);border-radius:6px;font-size:14px;font-family:inherit;}" +
      ".domio-field input:focus{outline:none;border-color:var(--domio-primary);}" +
      ".domio-row{display:flex;gap:12px;}" +
      ".domio-row .domio-field{flex:1;}" +
      ".domio-btn{width:100%;padding:12px;background:var(--domio-primary);color:#fff;border:none;border-radius:6px;font-size:15px;font-weight:600;cursor:pointer;margin-top:4px;font-family:inherit;}" +
      ".domio-btn:hover{background:var(--domio-primary-dark);}" +
      ".domio-btn:disabled{opacity:0.6;cursor:not-allowed;}" +
      ".domio-error{background:#fdecea;color:#a12b1f;border-radius:6px;padding:10px 12px;font-size:13px;margin-top:12px;display:none;}" +
      ".domio-results{margin-top:20px;border-top:1px solid var(--domio-border);padding-top:16px;display:none;}" +
      ".domio-results-title{font-size:14px;font-weight:700;margin:0 0 12px 0;color:var(--domio-text);}" +
      ".domio-item{display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px dashed var(--domio-border);}" +
      ".domio-item:last-child{border-bottom:none;}" +
      ".domio-item-label{color:var(--domio-muted);}" +
      ".domio-item-value{font-weight:600;color:var(--domio-text);}" +
      ".domio-summary{background:#eaf6f0;border:1px solid #cfe9db;border-radius:8px;padding:14px 16px;font-size:14px;line-height:1.5;color:var(--domio-primary-dark);margin-bottom:16px;}" +
      ".domio-summary strong{font-weight:700;}" +
      ".domio-cart-btn{width:100%;padding:13px;background:#ff7a00;color:#fff;border:none;border-radius:6px;font-size:15px;font-weight:700;cursor:pointer;margin-top:16px;display:none;font-family:inherit;}" +
      ".domio-cart-btn:hover{background:#e56d00;}" +
      ".domio-cart-btn.added{background:var(--domio-primary);}" +
      ".domio-loading{text-align:center;font-size:13px;color:var(--domio-muted);padding:8px 0;display:none;}" +
      ".domio-badge{display:inline-block;font-size:11px;background:#eaf6f0;color:var(--domio-primary-dark);padding:3px 8px;border-radius:12px;margin-bottom:10px;font-weight:600;}" +
      ".domio-label-row{display:flex;align-items:center;gap:5px;margin-bottom:6px;}" +
      ".domio-label-row label{margin-bottom:0;}" +
      ".domio-tooltip{position:relative;display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;background:#d8d8d8;color:#fff;font-size:10px;font-weight:700;font-style:normal;cursor:help;flex-shrink:0;user-select:none;}" +
      ".domio-tooltip:hover{background:var(--domio-primary);}" +
      ".domio-tooltip .domio-tooltip-bubble{display:none;position:absolute;bottom:22px;left:50%;transform:translateX(-50%);width:220px;background:#2a2a2a;color:#fff;font-size:12px;font-weight:400;line-height:1.4;padding:10px 12px;border-radius:6px;z-index:10;}" +
      ".domio-tooltip .domio-tooltip-bubble::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:6px solid transparent;border-top-color:#2a2a2a;}" +
      ".domio-tooltip:hover .domio-tooltip-bubble{display:block;}" +
      ".domio-area-toggle{display:flex;gap:8px;margin-bottom:10px;}" +
      ".domio-area-toggle-btn{flex:1;padding:6px;border:1px solid var(--domio-border);border-radius:6px;background:#fff;font-size:11px;cursor:pointer;text-align:center;color:var(--domio-muted);}" +
      ".domio-area-toggle-btn.active{border-color:var(--domio-primary);background:#eaf6f0;color:var(--domio-primary-dark);font-weight:600;}" +
      ".domio-dims-row{display:none;}" +
      ".domio-dims-row.visible{display:flex;gap:12px;}" +
      ".domio-computed-area{font-size:12px;color:var(--domio-muted);margin-top:4px;display:none;}" +
      ".domio-computed-area.visible{display:block;}" +
      ".domio-computed-area strong{color:var(--domio-text);}";
    document.head.appendChild(style);
  }

  function buildMarkup() {
    return (
      '<div class="domio-widget">' +
      '<span class="domio-badge">DOMIO Premium widget</span>' +
      '<p class="domio-title">Kalkulacka materialu na podlahu</p>' +
      '<p class="domio-subtitle">Zadejte rozmery mistnosti a spocitame presny nakupni seznam.</p>' +
      '<div class="domio-field">' +
      '<div class="domio-label-row">' +
      '<label for="domio-plocha">Plocha podlahy (m2) *</label>' +
      '<span class="domio-tooltip">i<span class="domio-tooltip-bubble">Pokud presnou plochu neznate, prepnete na "Z rozmeru" a zadejte delku a sirku mistnosti - plochu spocitame za vas.</span></span>' +
      "</div>" +
      '<div class="domio-area-toggle">' +
      '<div class="domio-area-toggle-btn active" id="domioAreaManual" data-mode="manual">Zadat rucne</div>' +
      '<div class="domio-area-toggle-btn" id="domioAreaDims" data-mode="dims">Z rozmeru (delka x sirka)</div>' +
      "</div>" +
      '<input type="number" id="domio-plocha" placeholder="napr. 20" min="0.1" step="0.1">' +
      '<div class="domio-row domio-dims-row" id="domioDimsRow">' +
      '<div class="domio-field" style="margin-bottom:0;">' +
      '<label for="domio-delka">Delka (m)</label>' +
      '<input type="number" id="domio-delka" placeholder="napr. 5" min="0.1" step="0.1">' +
      "</div>" +
      '<div class="domio-field" style="margin-bottom:0;">' +
      '<label for="domio-sirka">Sirka (m)</label>' +
      '<input type="number" id="domio-sirka" placeholder="napr. 4" min="0.1" step="0.1">' +
      "</div>" +
      "</div>" +
      '<div class="domio-computed-area" id="domioComputedArea">Spocitana plocha: <strong id="domioComputedAreaValue">-</strong></div>' +
      "</div>" +
      '<div class="domio-row">' +
      '<div class="domio-field">' +
      '<div class="domio-label-row">' +
      '<label for="domio-obvod">Obvod mistnosti (bm)</label>' +
      '<span class="domio-tooltip">i<span class="domio-tooltip-bubble">Obvod = soucet delek vsech sten mistnosti. U obdelnikove mistnosti: (delka + sirka) x 2. Pokud ho nezadate, hrube ho odhadneme z plochy.</span></span>' +
      "</div>" +
      '<input type="number" id="domio-obvod" placeholder="volitelne" min="0" step="0.1">' +
      "</div>" +
      '<div class="domio-field">' +
      '<div class="domio-label-row">' +
      '<label for="domio-dvere">Pocet dveri</label>' +
      '<span class="domio-tooltip">i<span class="domio-tooltip-bubble">Pocet dvernich otvoru v mistnosti - u nich se obvykle nepoklada lista, proto to ovlivnuje spotrebu list.</span></span>' +
      "</div>" +
      '<input type="number" id="domio-dvere" placeholder="0" min="0" step="1">' +
      "</div>" +
      "</div>" +
      '<div class="domio-row">' +
      '<div class="domio-field">' +
      '<div class="domio-label-row">' +
      '<label for="domio-vnitrni">Vnitrni rohy</label>' +
      '<span class="domio-tooltip">i<span class="domio-tooltip-bubble">Bezny roh mistnosti, kde se dve steny styka "dovnitr" (typicky obdelnikovy pokoj jich ma 4).</span></span>' +
      "</div>" +
      '<input type="number" id="domio-vnitrni" placeholder="0" min="0" step="1">' +
      "</div>" +
      '<div class="domio-field">' +
      '<div class="domio-label-row">' +
      '<label for="domio-vnejsi">Vnejsi rohy</label>' +
      '<span class="domio-tooltip">i<span class="domio-tooltip-bubble">Roh vycnivajici do mistnosti, napr. sloup nebo vystupek steny (L-tvar). Bezna obdelnikova mistnost jich nema zadny.</span></span>' +
      "</div>" +
      '<input type="number" id="domio-vnejsi" placeholder="0" min="0" step="1">' +
      "</div>" +
      "</div>" +
      '<button class="domio-btn" id="domioCalcBtn">Spocitat material</button>' +
      '<div class="domio-loading" id="domioLoading">Pocitame...</div>' +
      '<div class="domio-error" id="domioError"></div>' +
      '<div class="domio-results" id="domioResults">' +
      '<p class="domio-results-title">Nakupni seznam</p>' +
      '<div class="domio-summary" id="domioSummary"></div>' +
      '<div class="domio-item"><span class="domio-item-label">Plocha vc. prorezu</span><span class="domio-item-value" id="domioOutPlocha">-</span></div>' +
      '<div class="domio-item"><span class="domio-item-label">Pocet baleni podlahy</span><span class="domio-item-value" id="domioOutBaleni">-</span></div>' +
      '<div class="domio-item"><span class="domio-item-label">Listy</span><span class="domio-item-value" id="domioOutListy">-</span></div>' +
      '<div class="domio-item"><span class="domio-item-label">Vnitrni / vnejsi rohy</span><span class="domio-item-value" id="domioOutRohy">-</span></div>' +
      '<div class="domio-item"><span class="domio-item-label">Rohove spojky (celkem)</span><span class="domio-item-value" id="domioOutSpojky">-</span></div>' +
      '<div class="domio-item"><span class="domio-item-label">Nivelacni sterka</span><span class="domio-item-value" id="domioOutSterka">-</span></div>' +
      '<button class="domio-cart-btn" id="domioCartBtn">Pridat do kosiku</button>' +
      "</div>" +
      "</div>"
    );
  }

  function wireUpWidget(root, apiKey, domain, productCategory) {
    var lastResult = null;
    var areaMode = "manual";

    var plochaInput = root.querySelector("#domio-plocha");
    var delkaInput = root.querySelector("#domio-delka");
    var sirkaInput = root.querySelector("#domio-sirka");
    var dimsRow = root.querySelector("#domioDimsRow");
    var areaManualBtn = root.querySelector("#domioAreaManual");
    var areaDimsBtn = root.querySelector("#domioAreaDims");
    var computedAreaEl = root.querySelector("#domioComputedArea");
    var computedAreaValueEl = root.querySelector("#domioComputedAreaValue");

    function setAreaMode(mode) {
      areaMode = mode;
      areaManualBtn.classList.toggle("active", mode === "manual");
      areaDimsBtn.classList.toggle("active", mode === "dims");
      dimsRow.classList.toggle("visible", mode === "dims");
      computedAreaEl.classList.toggle("visible", mode === "dims");

      if (mode === "manual") {
        plochaInput.readOnly = false;
        plochaInput.style.background = "";
      } else {
        plochaInput.readOnly = true;
        plochaInput.style.background = "#f7f7f7";
        recomputeAreaFromDims();
      }
    }

    function recomputeAreaFromDims() {
      var delka = parseFloat(delkaInput.value);
      var sirka = parseFloat(sirkaInput.value);
      if (delka > 0 && sirka > 0) {
        var plocha = Math.round(delka * sirka * 100) / 100;
        plochaInput.value = plocha;
        computedAreaValueEl.textContent = plocha + " m2";
      } else {
        plochaInput.value = "";
        computedAreaValueEl.textContent = "-";
      }
    }

    areaManualBtn.addEventListener("click", function () { setAreaMode("manual"); });
    areaDimsBtn.addEventListener("click", function () { setAreaMode("dims"); });
    delkaInput.addEventListener("input", recomputeAreaFromDims);
    sirkaInput.addEventListener("input", recomputeAreaFromDims);

    var calcBtn = root.querySelector("#domioCalcBtn");
    var cartBtn = root.querySelector("#domioCartBtn");
    var loadingEl = root.querySelector("#domioLoading");
    var errorEl = root.querySelector("#domioError");
    var resultsEl = root.querySelector("#domioResults");
    var summaryEl = root.querySelector("#domioSummary");

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.style.display = "block";
    }
    function hideError() {
      errorEl.style.display = "none";
    }

    function renderResults(data) {
      lastResult = data;

      var pocetBaleni = data.baleni_var1;

      summaryEl.innerHTML =
        "Potrebujete <strong>" + pocetBaleni + " baleni podlahy</strong>, " +
        "<strong>" + data.listy_bm + " bm list</strong> a " +
        "<strong>" + data.sterka_baleni + " baleni sterky</strong>.";

      root.querySelector("#domioOutPlocha").textContent = data.plocha_s_odpadem + " m2";
      root.querySelector("#domioOutBaleni").textContent = pocetBaleni + " ks";
      root.querySelector("#domioOutListy").textContent = data.listy_bm + " bm / " + data.listy_ks + " ks";
      root.querySelector("#domioOutRohy").textContent = data.pocet_vnitrni_rohy + " / " + data.pocet_vnejsi_rohy;
      root.querySelector("#domioOutSpojky").textContent = data.rohove_spojky + " ks";
      root.querySelector("#domioOutSterka").textContent = data.sterka_kg + " kg (" + data.sterka_baleni + " baleni)";

      resultsEl.style.display = "block";
      cartBtn.style.display = "block";
      cartBtn.classList.remove("added");
      cartBtn.textContent = "Pridat do kosiku";
    }

    function calculate() {
      hideError();

      var plocha = parseFloat(plochaInput.value);
      if (!plocha || plocha <= 0) {
        showError("Zadejte platnou plochu podlahy.");
        return;
      }

      var obvod = root.querySelector("#domio-obvod").value;
      var dvere = root.querySelector("#domio-dvere").value;
      var vnitrni = root.querySelector("#domio-vnitrni").value;
      var vnejsi = root.querySelector("#domio-vnejsi").value;

      var params = new URLSearchParams();
      params.append("plocha_m2", plocha);
      if (obvod) params.append("obvod_m", obvod);
      if (dvere) params.append("pocet_dveri", dvere);
      if (vnitrni) params.append("pocet_vnitrni_rohy", vnitrni);
      if (vnejsi) params.append("pocet_vnejsi_rohy", vnejsi);
      params.append("api_key", apiKey);
      params.append("domain", domain);
      params.append("product_category", productCategory);

      calcBtn.disabled = true;
      loadingEl.style.display = "block";
      resultsEl.style.display = "none";
      cartBtn.style.display = "none";

      fetch(API_URL + "?" + params.toString(), { method: "GET" })
        .then(function (res) {
          return res.json().then(function (body) {
            if (!res.ok) {
              throw new Error(body.message || "Chyba pri vypoctu.");
            }
            return body;
          });
        })
        .then(function (data) {
          renderResults(data);
        })
        .catch(function (err) {
          showError(err.message || "Nepodarilo se spocitat material. Zkuste to prosim znovu.");
        })
        .finally(function () {
          calcBtn.disabled = false;
          loadingEl.style.display = "none";
        });
    }

    function addToCart() {
      if (!lastResult) return;

      var eventDetail = {
        plocha_m2: lastResult.plocha_m2,
        plocha_s_odpadem: lastResult.plocha_s_odpadem,
        pocet_baleni: lastResult.baleni_var1,
        listy_bm: lastResult.listy_bm,
        listy_ks: lastResult.listy_ks,
        pocet_vnitrni_rohy: lastResult.pocet_vnitrni_rohy,
        pocet_vnejsi_rohy: lastResult.pocet_vnejsi_rohy,
        rohove_spojky: lastResult.rohove_spojky,
        sterka_kg: lastResult.sterka_kg,
        sterka_baleni: lastResult.sterka_baleni
      };

      root.dispatchEvent(new CustomEvent("domioWidgetAddToCart", { bubbles: true, detail: eventDetail }));

      cartBtn.classList.add("added");
      cartBtn.textContent = "Pridano do kosiku";
    }

    calcBtn.addEventListener("click", calculate);
    cartBtn.addEventListener("click", addToCart);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
