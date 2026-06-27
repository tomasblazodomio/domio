(function() {
  const API = 'https://x8ki-letl-twmt.n7.xano.io/api:PaI_PX__';
  let calcData = null;
  let calcMode = 'floor';
  let paintingAreaMode = 'room';
  let submittedName = '';
  let submittedEmail = '';

  function styleNavbar() {
    var nav = document.querySelector('.domio-navbar');
    if (nav) {
      nav.style.backgroundColor = '#1B4332';
      nav.style.boxShadow = 'none';
    }
    document.querySelectorAll('.domio-navbar .w-nav-link').forEach(function(el) {
      el.style.color = '#ffffff';
    });
    var logo = document.querySelector('.domio-logo');
    if (logo) {
      logo.style.color = '#ffffff';
      logo.style.fontFamily = 'Montserrat, sans-serif';
      logo.style.fontWeight = '800';
      logo.style.letterSpacing = '-1px';
    }
    var card = document.querySelector('.domio-form-card');
    if (card) {
      var h = card.querySelector('h1, h2');
      if (h) {
        h.style.fontSize = '22px';
        h.style.fontWeight = '700';
        h.style.textAlign = 'center';
        h.style.marginBottom = '20px';
        h.style.fontFamily = 'DM Sans, sans-serif';
      }
    }
  }

  function injectHeroSubtitle() {
    var h1 = document.querySelector('.domio-h1');
    if (!h1 || document.querySelector('.domio-hero-subtitle')) return;
    var sub = document.createElement('p');
    sub.className = 'domio-hero-subtitle';
    sub.innerHTML = 'Získejte okamžitý přehled o nákladech na materiál a práci řemeslníků. Kompletní rozpočet v PDF vám zašleme obratem na e-mail.';
    h1.parentNode.insertBefore(sub, h1.nextSibling);
  }

  function injectModeTabs() {
    var card = document.querySelector('.domio-form-card');
    if (!card || document.getElementById('domio-mode-tabs')) return;
    var tabs = document.createElement('div');
    tabs.id = 'domio-mode-tabs';
    tabs.className = 'domio-mode-tabs';
    tabs.innerHTML = '<button id="tab-floor" class="domio-mode-tab active" onclick="domioSetMode(\'floor\')">🪵 Podlahy</button><button id="tab-painting" class="domio-mode-tab" onclick="domioSetMode(\'painting\')">🖌️ Malování a Obklady</button>';
    var firstChild = card.firstChild;
    card.insertBefore(tabs, firstChild);
  }

  window.domioSetMode = function(mode) {
    calcMode = mode;
    var tabFloor = document.getElementById('tab-floor');
    var tabPainting = document.getElementById('tab-painting');
    var cardFloor = document.getElementById('calc-card-floor');
    var cardPainting = document.getElementById('calc-card-painting');
    if (mode === 'floor') {
      if (tabFloor) tabFloor.className = 'domio-mode-tab active';
      if (tabPainting) tabPainting.className = 'domio-mode-tab';
      if (cardFloor) cardFloor.className = 'domio-calc-item is-active';
      if (cardPainting) cardPainting.className = 'domio-calc-item';
      showFloorInputs();
      updateTeaserContent('floor');
    } else {
      if (tabPainting) tabPainting.className = 'domio-mode-tab active';
      if (tabFloor) tabFloor.className = 'domio-mode-tab';
      if (cardPainting) cardPainting.className = 'domio-calc-item is-active';
      if (cardFloor) cardFloor.className = 'domio-calc-item';
      showPaintingInputs();
      updateTeaserContent('painting');
    }
    resetResults();
  };

  window.domioSetPaintingAreaMode = function(mode) {
    paintingAreaMode = mode;
    var btnRoom   = document.getElementById('btn-area-mode-room');
    var btnCustom = document.getElementById('btn-area-mode-custom');
    var rowInputs = document.querySelector('.domio-row-inputs');
    var heightLabel = document.getElementById('height-label');
    var heightInput = document.getElementById('input-height');
    var penWrap   = document.getElementById('domio-penetration-wrap');
    var customInput = document.getElementById('input-custom-area');
    if (mode === 'room') {
      if (btnRoom)   btnRoom.className   = 'domio-area-mode-tab active';
      if (btnCustom) btnCustom.className = 'domio-area-mode-tab';
      if (rowInputs)   rowInputs.style.display   = 'grid';
      if (heightLabel) heightLabel.style.display = 'block';
      if (heightInput) heightInput.style.display = 'block';
      if (penWrap)     penWrap.style.display     = 'flex';
      if (customInput) customInput.style.display = 'none';
    } else {
      if (btnCustom) btnCustom.className = 'domio-area-mode-tab active';
      if (btnRoom)   btnRoom.className   = 'domio-area-mode-tab';
      if (rowInputs)   rowInputs.style.display   = 'none';
      if (heightLabel) heightLabel.style.display = 'none';
      if (heightInput) heightInput.style.display = 'none';
      if (penWrap)     penWrap.style.display     = 'none';
      if (customInput) customInput.style.display = 'block';
    }
    resetResults();
  };

  function updateTeaserContent(mode) {
    var headline = document.getElementById('teaser-headline');
    var body = document.getElementById('teaser-body');
    var badge = document.getElementById('teaser-badge');
    var formTitle = document.querySelector('.teaser-form-title');
    if (mode === 'painting') {
      if (headline) headline.innerHTML = 'Váš rozpočet je připraven —<br><span>kam ho máme poslat?</span>';
      if (body) body.innerHTML = 'Kompletní rozpočet <strong style="color:#fff">barvy, materiálu i práce</strong> — do 2 minut ve vaší e-mailové schránce.';
      if (badge) badge.textContent = '🖌️ Malování';
    } else {
      if (headline) headline.innerHTML = 'Váš rozpočet je připraven —<br><span>kam ho máme poslat?</span>';
      if (body) body.innerHTML = 'Kompletní rozpočet <strong style="color:#fff">materiálu, práce i odpadu</strong> — do 2 minut ve vaší e-mailové schránce.';
      if (badge) badge.textContent = '🪵 Podlahy';
    }
    if (formTitle) formTitle.innerHTML = '📩 Zadejte e-mail a dostanete:<br><span style="font-size:13px;font-weight:400;opacity:0.9;display:block;margin-top:6px;line-height:1.6;">✅ Cenu materiálu i práce<br>✅ Kde nejlépe nakoupit (s odkazy)<br>✅ PDF rozpočet do 2 minut</span>';
  }

  function resetResults() {
    var areaBox = document.getElementById('domio-area-box');
    var teaserBox = document.getElementById('domio-teaser-box');
    var craftsmanBox = document.getElementById('domio-craftsman-box');
    if (areaBox) areaBox.classList.remove('visible');
    if (teaserBox) teaserBox.classList.remove('visible');
    if (craftsmanBox) craftsmanBox.classList.remove('visible');
    calcData = null;
  }

  function showFloorInputs() {
    var subtype = document.getElementById('input-subtype');
    if (subtype) subtype.style.display = 'block';
    var paintingType = document.getElementById('input-painting-type');
    if (paintingType) paintingType.style.display = 'none';
    var heightInput = document.getElementById('input-height');
    if (heightInput) heightInput.style.display = 'none';
    var heightLabel = document.getElementById('height-label');
    if (heightLabel) heightLabel.style.display = 'none';
    var penWrap = document.getElementById('domio-penetration-wrap');
    if (penWrap) penWrap.style.display = 'none';
    var areaModeTabs = document.getElementById('painting-area-mode-wrap');
    if (areaModeTabs) areaModeTabs.style.display = 'none';
    var customInput = document.getElementById('input-custom-area');
    if (customInput) customInput.style.display = 'none';
    var rowInputs = document.querySelector('.domio-row-inputs');
    if (rowInputs) rowInputs.style.display = 'grid';
  }

  function showPaintingInputs() {
    var subtype = document.getElementById('input-subtype');
    if (subtype) subtype.style.display = 'none';
    injectPaintingInputs();
    var paintingType = document.getElementById('input-painting-type');
    if (paintingType) paintingType.style.display = 'block';
    var areaModeTabs = document.getElementById('painting-area-mode-wrap');
    if (areaModeTabs) areaModeTabs.style.display = 'block';
    domioSetPaintingAreaMode(paintingAreaMode);
  }

  function injectPaintingInputs() {
    var inputLength = document.getElementById('input-length');
    if (!inputLength) return;
    if (!document.getElementById('input-painting-type')) {
      var select = document.createElement('select');
      select.id = 'input-painting-type';
      select.style.display = 'none';
      select.innerHTML = '<option value="">— Vyberte typ malování / obkladu —</option>' +
        '<optgroup label="🖌️ Malování">' +
        '<option value="standardni_bila">Standardní bílá</option>' +
        '<option value="oteruodolna">Otěruvzdorná barva</option>' +
        '<option value="barevny_nater">Barevný nátěr</option>' +
        '<option value="strukturalni">Strukturální omítka</option>' +
        '<option value="protiplisnova">Protiplísňový nátěr</option>' +
        '<option value="izolacni_na_skvrny">Izolační nátěr (skvrny, nikotin)</option>' +
        '</optgroup>' +
        '<optgroup label="🟦 Obklady">' +
        '<option value="obklad_standard">Obklad standard</option>' +
        '<option value="obklad_velkoformat">Obklad velkého formátu</option>' +
        '</optgroup>';
      inputLength.parentNode.insertBefore(select, inputLength);
    }
    if (!document.getElementById('painting-area-mode-wrap')) {
      var modeWrap = document.createElement('div');
      modeWrap.id = 'painting-area-mode-wrap';
      modeWrap.style.display = 'none';
      modeWrap.innerHTML =
        '<div class="domio-area-mode-tabs">' +
        '<button type="button" id="btn-area-mode-room" class="domio-area-mode-tab active" onclick="domioSetPaintingAreaMode(\'room\')">🏠 Celá místnost</button>' +
        '<button type="button" id="btn-area-mode-custom" class="domio-area-mode-tab" onclick="domioSetPaintingAreaMode(\'custom\')">✏️ Vlastní plocha</button>' +
        '</div>';
      inputLength.parentNode.insertBefore(modeWrap, inputLength);
    }
    if (!document.getElementById('input-custom-area')) {
      var customInput = document.createElement('input');
      customInput.type = 'number';
      customInput.id = 'input-custom-area';
      customInput.placeholder = 'Zadejte plochu v m², např. 15.5';
      customInput.step = '0.1';
      customInput.min = '0.1';
      customInput.style.display = 'none';
      inputLength.parentNode.insertBefore(customInput, inputLength);
    }
    if (!document.getElementById('input-height')) {
      var heightLabel = document.createElement('label');
      heightLabel.id = 'height-label';
      heightLabel.textContent = 'Výška místnosti (m) — standardně 2,5 m';
      heightLabel.style.cssText = 'display:none;font-size:13px;font-weight:600;color:#6B7280;margin-bottom:4px;';
      inputLength.parentNode.insertBefore(heightLabel, inputLength);
      var heightInput = document.createElement('input');
      heightInput.type = 'number';
      heightInput.id = 'input-height';
      heightInput.placeholder = 'Výška místnosti (m), např. 2.5';
      heightInput.value = '2.5';
      heightInput.step = '0.1';
      heightInput.min = '1';
      heightInput.max = '5';
      heightInput.style.display = 'none';
      inputLength.parentNode.insertBefore(heightInput, inputLength);
    }
    if (!document.getElementById('domio-penetration-wrap')) {
      var penWrap = document.createElement('div');
      penWrap.id = 'domio-penetration-wrap';
      penWrap.className = 'domio-penetration-wrap';
      penWrap.style.display = 'none';
      penWrap.innerHTML = '<input type="checkbox" id="include-penetration"><label for="include-penetration">Zahrnout penetraci stěn</label>';
      inputLength.parentNode.insertBefore(penWrap, inputLength);
    }
  }

  function wrapInputRow() {
    var len = document.getElementById('input-length');
    var wid = document.getElementById('input-width');
    if (!len || !wid) return;
    if (len.parentNode === wid.parentNode && !len.parentNode.classList.contains('domio-row-inputs')) {
      var wrap = document.createElement('div');
      wrap.className = 'domio-row-inputs';
      len.parentNode.insertBefore(wrap, len);
      wrap.appendChild(len);
      wrap.appendChild(wid);
    }
  }

  function injectDropdown() {
    var inputLength = document.getElementById('input-length');
    if (!inputLength || document.getElementById('input-subtype')) return;
    var select = document.createElement('select');
    select.id = 'input-subtype';
    select.innerHTML = '<option value="">— Vyberte typ podlahy —</option><option value="plovouci_podlaha">Plovoucí podlaha</option><option value="vinyl">Vinyl / LVT</option><option value="parkety">Parkety</option><option value="dlazdice_obklady">Dlažba / Obklady</option><option value="betonova_podlaha">Betonová podlaha</option><option value="koberec">Koberec</option>';
    inputLength.parentNode.insertBefore(select, inputLength);
  }

  function fmt(n) {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n);
  }
  function setLoading(btn, state) {
    btn.disabled = state;
    btn.classList.toggle('domio-btn-loading', state);
  }
  function showError(inputId, msg) {
    var el = document.getElementById(inputId);
    if (!el) return;
    el.classList.add('domio-input-error');
    var errId = inputId + '-err';
    var err = document.getElementById(errId);
    if (!err) {
      err = document.createElement('div');
      err.id = errId;
      err.className = 'domio-field-error';
      el.parentNode.insertBefore(err, el.nextSibling);
    }
    err.textContent = msg;
    err.style.display = 'block';
  }
  function clearError(inputId) {
    var el = document.getElementById(inputId);
    if (el) el.classList.remove('domio-input-error');
    var err = document.getElementById(inputId + '-err');
    if (err) err.style.display = 'none';
  }

  function injectSpinners() {
    ['btn-calculate', 'btn-submit'].forEach(function(id) {
      var btn = document.getElementById(id);
      if (!btn || btn.querySelector('.domio-spinner')) return;
      var text = btn.innerHTML;
      btn.innerHTML = '<span class="domio-btn-text">' + text + '</span><span class="domio-spinner"></span>';
    });
  }

  function moveFormElements() {
    var emailEl  = document.getElementById('input-email');
    var submitEl = document.getElementById('btn-submit');
    if (emailEl  && document.getElementById('domio-email-slot'))  document.getElementById('domio-email-slot').appendChild(emailEl);
    if (submitEl && document.getElementById('domio-submit-slot')) document.getElementById('domio-submit-slot').appendChild(submitEl);
    if (document.getElementById('domio-consent-text') && document.getElementById('domio-submit-slot')) document.getElementById('domio-submit-slot').appendChild(document.getElementById('domio-consent-text'));
    if (document.getElementById('domio-partner-consent-wrap') && document.getElementById('domio-submit-slot')) document.getElementById('domio-submit-slot').parentNode.insertBefore(document.getElementById('domio-partner-consent-wrap'), document.getElementById('domio-submit-slot'));
  }

  function showResults() {
    var areaBox = document.getElementById('domio-area-box');
    var teaserBox = document.getElementById('domio-teaser-box');
    if (areaBox) areaBox.classList.add('visible');
    if (teaserBox) teaserBox.classList.add('visible');
    // domio-blur-box sa NEZOBRAZUJE — ceny sú skryté, user ich dostane na email
    setTimeout(function() {
      if (areaBox) areaBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
  }

  function showCraftsmanBox() {
    var box = document.getElementById('domio-craftsman-box');
    if (box) {
      box.classList.add('visible');
      setTimeout(function() {
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    }
  }

  function bindCalculate() {
    var btn = document.getElementById('btn-calculate');
    if (!btn) return;
    btn.addEventListener('click', async function() {
      if (calcMode === 'floor') {
        await calculateFloor();
      } else {
        await calculatePainting();
      }
    });
  }

  async function calculateFloor() {
    var btn = document.getElementById('btn-calculate');
    ['input-subtype','input-length','input-width'].forEach(clearError);
    var subtype = (document.getElementById('input-subtype') || {}).value;
    var length  = parseFloat((document.getElementById('input-length') || {}).value);
    var width   = parseFloat((document.getElementById('input-width') || {}).value);
    var valid = true;
    if (!subtype)             { showError('input-subtype', 'Vyberte typ podlahy'); valid = false; }
    if (!length || length<=0) { showError('input-length',  'Zadejte délku místnosti'); valid = false; }
    if (!width  || width<=0)  { showError('input-width',   'Zadejte šířku místnosti'); valid = false; }
    if (!valid) return;
    setLoading(btn, true);
    try {
      var res = await fetch(API + '/calculate-floor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sub_type: subtype, length_m: length, width_m: width })
      });
      if (!res.ok) throw new Error();
      var d = await res.json();
      calcData = d; calcData._mode = 'floor';
      document.getElementById('domio-area-number').innerHTML = d.area_m2 + '<span class="area-unit"> m²</span>';
      showResults();
      if (typeof gtag !== 'undefined') gtag('event', 'calculator_calculated', { floor_type: subtype, area_m2: d.area_m2 });
    } catch(e) { alert('Chyba při výpočtu. Zkuste to prosím znovu.'); }
    finally { setLoading(btn, false); }
  }

  async function calculatePainting() {
    var btn = document.getElementById('btn-calculate');
    ['input-painting-type','input-length','input-width','input-custom-area'].forEach(clearError);
    var paintingType = (document.getElementById('input-painting-type') || {}).value;
    var valid = true;
    if (!paintingType) { showError('input-painting-type', 'Vyberte typ malování / obkladu'); valid = false; }
    var requestBody = { painting_type: paintingType };
    if (paintingAreaMode === 'custom') {
      var customArea = parseFloat((document.getElementById('input-custom-area') || {}).value);
      if (!customArea || customArea <= 0) { showError('input-custom-area', 'Zadejte plochu v m²'); valid = false; }
      if (!valid) return;
      requestBody.custom_area_m2 = customArea;
      requestBody.length_m = 1; requestBody.width_m = 1;
      requestBody.height_m = 2.5; requestBody.include_penetration = false;
    } else {
      var length = parseFloat((document.getElementById('input-length') || {}).value);
      var width  = parseFloat((document.getElementById('input-width') || {}).value);
      var height = parseFloat((document.getElementById('input-height') || {}).value) || 2.5;
      var includePenetration = !!(document.getElementById('include-penetration') || {}).checked;
      if (!length || length<=0) { showError('input-length', 'Zadejte délku místnosti'); valid = false; }
      if (!width  || width<=0)  { showError('input-width',  'Zadejte šířku místnosti'); valid = false; }
      if (!valid) return;
      requestBody.length_m = length; requestBody.width_m = width;
      requestBody.height_m = height; requestBody.include_penetration = includePenetration;
    }
    setLoading(btn, true);
    try {
      var res = await fetch(API + '/calculate-painting', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      if (!res.ok) throw new Error();
      var d = await res.json();
      calcData = d; calcData._mode = 'painting';
      document.getElementById('domio-area-number').innerHTML = parseFloat(d.net_area).toFixed(1) + '<span class="area-unit"> m²</span>';
      showResults();
      if (typeof gtag !== 'undefined') gtag('event', 'calculator_calculated', { painting_type: paintingType, net_area: d.net_area });
    } catch(e) { alert('Chyba při výpočtu. Zkuste to prosím znovu.'); }
    finally { setLoading(btn, false); }
  }

  function bindSubmit() {
    var btn = document.getElementById('btn-submit');
    if (!btn) return;
    
    btn.addEventListener('click', async function() {
      var email = (document.getElementById('input-email') || {}).value || '';
      var partnerConsentElement = document.getElementById('input-partner-consent');
      var partnerConsent = partnerConsentElement ? partnerConsentElement.checked : false;
      var valid = true;

      if (!email.trim()) { showError('input-email', 'Zadejte platný e-mail'); valid = false; }
      if (!calcData) { alert('Nejprve vypočítejte cenu.'); return; }
      if (!valid) return;

      setLoading(btn, true);
      submittedEmail = email.trim();
      
      var body;
      if (calcData._mode === 'painting') {
        body = { 
          email: submittedEmail, 
          calc_type: 'painting',
          sub_type: calcData.display_name, 
          area_m2: calcData.net_area,
          material_price: calcData.material_price, 
          work_price: calcData.labor_price,
          unit_material_price: 0, 
          unit_labor_price: 0,
          link_material: calcData.link_material || '',
          link_accessories: calcData.link_accessories || '',
          link_tools: calcData.link_tools || '',
          partner_consent: partnerConsent
        };
      } else {
        body = { 
          email: submittedEmail, 
          calc_type: 'floor',
          sub_type: calcData.display_name, 
          area_m2: calcData.area_m2,
          material_price: calcData.material_price, 
          work_price: calcData.work_price,
          unit_material_price: calcData.unit_material_price, 
          unit_labor_price: calcData.unit_labor_price,
          link_material: calcData.link_material || '',
          link_accessories: calcData.link_accessories || '',
          link_tools: calcData.link_tools || '',
          partner_consent: partnerConsent
        };
      }

      try {
        var res = await fetch(API + '/submit-lead', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error();
        if (typeof gtag !== 'undefined') {
          gtag('event', 'generate_lead');
          gtag('event', 'lead_submitted', { calc_type: calcData._mode, area_m2: calcData._mode === 'painting' ? calcData.net_area : calcData.area_m2 });
        }
        document.getElementById('domio-teaser-box').innerHTML = '<div style="text-align:center;padding:8px 0"><div style="font-size:36px;margin-bottom:12px">🥳</div><p style="font-size:18px;font-weight:700;color:#fff;margin:0 0 12px">Úspěšně odesláno!</p><p style="font-size:14px;color:rgba(255,255,255,0.85);line-height:1.7;margin:0">Kompletní, detailní rozpočet materiálu a práce v PDF formátu vám dorazí do e-mailu během 2 minut.<br><br><em>Pokud e-mail nevidíte, zkontrolujte prosím složku Promo nebo Spam.</em></p></div>';
        showCraftsmanBox();
      } catch(e) { alert('Chyba při odesílání. Zkuste to prosím znovu.'); }
      finally { setLoading(btn, false); }
    });
  }

  function bindCraftsmanSubmit() {
    var btn = document.getElementById('btn-craftsman');
    if (!btn) return;
    btn.addEventListener('click', async function() {
      var phone = (document.getElementById('input-craftsman-phone') || {}).value || '';
      var psz   = (document.getElementById('input-craftsman-psz')   || {}).value || '';
      if (!phone.trim() || !/^[0-9\s\+\-]{9,15}$/.test(phone.trim())) { alert('Zadejte platné telefonní číslo (pouze číslice, min. 9 znaků).'); return; }
      if (!psz.trim() || !/^[0-9]{3}\s?[0-9]{2}$/.test(psz.trim())) { alert('Zadejte platné PSČ (např. 140 00).'); return; }
      btn.disabled = true;
      btn.textContent = '⏳ Odesílám...';
      var area  = calcData ? (calcData._mode === 'painting' ? calcData.net_area  : calcData.area_m2)    : 0;
      var price = calcData ? (calcData.total_price || 0) : 0;
      try {
        await fetch(API + '/submit-craftsman-lead', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: submittedName, phone: phone.trim(), postal_code: psz.trim(),
            calc_type: calcData ? calcData._mode : '',
            area_m2: parseFloat(area) || 0, estimated_price: parseInt(price) || 0
          })
        });
        btn.style.display = 'none';
        document.getElementById('input-craftsman-phone').style.display = 'none';
        document.getElementById('input-craftsman-psz').style.display = 'none';
        document.getElementById('domio-craftsman-success').style.display = 'block';
      } catch(e) {
        btn.disabled = false;
        btn.textContent = '🔨 Chci být kontaktován řemeslníkem';
        alert('Chyba při odesílání. Zkuste to prosím znovu.');
      }
    });
  }

  function bindClearErrors() {
    ['input-subtype','input-painting-type','input-length','input-width','input-height','input-email','input-custom-area'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', function() { clearError(id); });
    });
    var subtypeEl = document.getElementById('input-subtype');
    if (subtypeEl) subtypeEl.addEventListener('change', function() {
      if (this.value && typeof gtag !== 'undefined') gtag('event', 'calculator_type_selected', { floor_type: this.value });
    });
    var paintingEl = document.getElementById('input-painting-type');
    if (paintingEl) paintingEl.addEventListener('change', function() {
      if (this.value && typeof gtag !== 'undefined') gtag('event', 'calculator_type_selected', { painting_type: this.value });
    });
  }

  window.domioToggleNotify = function(id) {
    var form = document.getElementById('notify-' + id);
    if (!form) return;
    form.classList.toggle('open');
    if (form.classList.contains('open')) {
      var inp = document.getElementById('notify-email-' + id);
      if (inp) inp.focus();
    }
  };

  window.domioNotify = function(id) {
    var inp = document.getElementById('notify-email-' + id);
    if (!inp || !inp.value.includes('@')) { alert('Zadejte platný e-mail'); return; }
    var email = inp.value.trim();
    var form = document.getElementById('notify-' + id);
    fetch(API + '/notify_leads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, calc_type: id })
    }).then(function() {
      if (form) form.innerHTML = '<p style="font-size:13px;color:#2D6A4F;margin:4px 0 0">✓ Upozorníme vás při spuštění!</p>';
    }).catch(function() {
      if (form) form.innerHTML = '<p style="font-size:13px;color:#2D6A4F;margin:4px 0 0">✓ Upozorníme vás při spuštění!</p>';
    });
  };

  document.addEventListener('DOMContentLoaded', function() {
    styleNavbar();
    injectHeroSubtitle();
    injectModeTabs();
    injectDropdown();
    injectPaintingInputs();
    wrapInputRow();
    showFloorInputs();
    updateTeaserContent('floor');
    injectSpinners();
    moveFormElements();
    bindCalculate();
    bindSubmit();
    bindCraftsmanSubmit();
    bindClearErrors();
  });
})();
function injectAffiliateStrip() {
  var hero = document.querySelector('.domio-hero-section');
  if (!hero) return;
  var strip = document.createElement('div');
  strip.className = 'domio-affiliate-strip';
  strip.innerHTML = `
    <p class="domio-affiliate-label">affiliate partneri:</p>
    <div class="domio-marquee-wrapper">
      <div class="domio-marquee-track">
        <img src="https://cdn.prod.website-files.com/6a1a9c2c9b7db52174bdd4ed/6a3abddbbf948e6cf439793f_802d37af89fe8f9a92e026eb205acf7026575939.png" alt="i-PODLAHY">
        <img src="https://cdn.prod.website-files.com/6a1a9c2c9b7db52174bdd4ed/6a3abddb56fc915f8ef4a382_f18e6e1623e00b9db7be077663a04cc8b6ee6e00.png" alt="bauMax">
        <img src="https://cdn.prod.website-files.com/6a1a9c2c9b7db52174bdd4ed/6a3abddb127d02278eee54a2_23d52d6a2a320fefe18ae6a2b555f4927c5b9be6.png" alt="Svět koupelny">
        <img src="https://cdn.prod.website-files.com/6a1a9c2c9b7db52174bdd4ed/6a3abddbc40b5f14b9cabe10_cae32418a0c1fad741e9641a4fd84dfa1b07bc6c.png" alt="Tmnábytek.cz">
        <img src="https://cdn.prod.website-files.com/6a1a9c2c9b7db52174bdd4ed/6a3abddbff2f567f504d240f_b4734958729aa8240749697eca3d4a45492dc766.png" alt="Skladová okna">
        <img src="https://cdn.prod.website-files.com/6a1a9c2c9b7db52174bdd4ed/6a3abddb33d0575512444a13_2f856a4dd1a245ade6dc9efea5bb01cd5905680f.png" alt="Můj koberec">
        <img src="https://cdn.prod.website-files.com/6a1a9c2c9b7db52174bdd4ed/6a3abddbc80c7a13eb9aa091_021e6e5560e89d8916bbe7325bde0e948c4a44db.webp" alt="Deokork">
        <img src="https://cdn.prod.website-files.com/6a1a9c2c9b7db52174bdd4ed/6a3abddbbf948e6cf439793f_802d37af89fe8f9a92e026eb205acf7026575939.png" alt="i-PODLAHY">
        <img src="https://cdn.prod.website-files.com/6a1a9c2c9b7db52174bdd4ed/6a3abddb56fc915f8ef4a382_f18e6e1623e00b9db7be077663a04cc8b6ee6e00.png" alt="bauMax">
        <img src="https://cdn.prod.website-files.com/6a1a9c2c9b7db52174bdd4ed/6a3abddb127d02278eee54a2_23d52d6a2a320fefe18ae6a2b555f4927c5b9be6.png" alt="Svět koupelny">
        <img src="https://cdn.prod.website-files.com/6a1a9c2c9b7db52174bdd4ed/6a3abddbc40b5f14b9cabe10_cae32418a0c1fad741e9641a4fd84dfa1b07bc6c.png" alt="Tmnábytek.cz">
        <img src="https://cdn.prod.website-files.com/6a1a9c2c9b7db52174bdd4ed/6a3abddbff2f567f504d240f_b4734958729aa8240749697eca3d4a45492dc766.png" alt="Skladová okna">
        <img src="https://cdn.prod.website-files.com/6a1a9c2c9b7db52174bdd4ed/6a3abddb33d0575512444a13_2f856a4dd1a245ade6dc9efea5bb01cd5905680f.png" alt="Můj koberec">
        <img src="https://cdn.prod.website-files.com/6a1a9c2c9b7db52174bdd4ed/6a3abddbc80c7a13eb9aa091_021e6e5560e89d8916bbe7325bde0e948c4a44db.webp" alt="Deokork">
      </div>
    </div>`;
  hero.parentNode.insertBefore(strip, hero.nextSibling);
}

window.addEventListener('load', function() {
  setTimeout(injectAffiliateStrip, 300);
});
/* =============================================
   DOMIO — Recenzie "Napsali jste nám"
   ============================================= */
const DOMIO_REVIEWS = {
  podlahy: [
    {
      initials: 'TR', name: 'Tomáš R.', city: 'Praha',
      subject: 'Re: kalkulace podlahy',
      date: 'Po 14. 4. 2025 · 11:32',
      text: 'Dobrý den, chtěl jsem jen dát vědět — zadal jsem 28 metrů, vinylová podlaha, a výsledek se shodoval s nabídkou od řemeslníka skoro na korunu. Nevím jak to děláte, ale funguje to. Díky.'
    },
    {
      initials: 'KN', name: 'Klára N.', city: 'Brno',
      subject: 'Dotaz — podlaha v novém bytě',
      date: 'St 23. 4. 2025 · 16:05',
      text: 'Ahoj, kupujeme s přítelkyní první byt a fakt jsme nevěděly, co dát stranou na podlahy. Tohle nám pomohlo — aspoň jsme věděly, jestli to finančně dává smysl, ještě než jsme cokoliv podepisovaly.'
    },
    {
      initials: 'PH', name: 'Pavel H.', city: 'Zlín',
      subject: 'Kalkulace vs. nabídka od firmy',
      date: 'Čt 8. 5. 2025 · 9:47',
      text: 'Zdravím, píšu jen proto, že mi řemeslník dal nabídku a přišla mi vysoká. Zkusil jsem vaši kalkulačku a vyšlo mi o 4 000 míň. Nakonec jsem s tím číslem šel zpátky a firma slevu dala. Takže díky :)'
    },
    {
      initials: 'JK', name: 'Jiří K.', city: 'Olomouc',
      subject: 'Ušetřil jsem spoustu telefonátů',
      date: 'Pá 23. 5. 2025 · 14:22',
      text: 'Dobrý den, chtěl jsem poděkovat — ušetřil jsem kvůli vám spoustu telefonátů. Místo abych čekal na nabídky od pěti firem, spočítal jsem si to sám a šel rovnou jednat.'
    },
    {
      initials: 'MV', name: 'Michaela V.', city: 'České Budějovice',
      subject: 'Podlaha svépomocí — díky!',
      date: 'Út 10. 6. 2025 · 20:14',
      text: 'Děláme si podlahu sami s přítelem a tohle byl náš první krok. Věděli jsme, kolik materiálu koupit a kolik peněz si dát stranou. Bez toho bychom jen hádali. Super věc.'
    }
  ],
  'malovani-obklady': [
    {
      initials: 'RM', name: 'Radek M.', city: 'Praha',
      subject: 'Rekonstrukce koupelny — obklady i malování',
      date: 'St 2. 4. 2025 · 13:19',
      text: 'Dobrý den, rekonstruujeme koupelnu — obklady i malování najednou. Ocenil jsem, že si to spočítám celé na jednom místě. Číslo sedělo, žádné překvapení od řemeslníka.'
    },
    {
      initials: 'VS', name: 'Veronika S.', city: 'Pardubice',
      subject: 'Malování dětského pokoje',
      date: 'Pá 18. 4. 2025 · 8:55',
      text: 'Ahoj, malovaly jsme s dcerou dětský pokoj a potřebovaly jsme vědět, kolik barvy koupit. Kalkulačka to odhadla líp než prodavač v železářství — a ten tam byl 20 let :D Díky moc.'
    },
    {
      initials: 'MH', name: 'Markéta a Petr H.', city: 'Plzeň',
      subject: 'Obkládání WC poprvé',
      date: 'Po 12. 5. 2025 · 19:33',
      text: 'Dobrý den, obkládali jsme WC sami poprvé v životě a vůbec jsme nevěděli kolik materiálu koupit. Kalkulačka pomohla, nekoupili jsme zbytečně navíc. Dopadlo to dobře.'
    },
    {
      initials: 'MC', name: 'Martin Č.', city: 'Hradec Králové',
      subject: 'Nejlepší kalkulačka co jsem zkoušel',
      date: 'Čt 29. 5. 2025 · 10:08',
      text: 'Zdravím, zkoušel jsem víc kalkulaček online a tohle je jediný web, co mi dal konkrétní číslo bez toho, aby chtěl telefon předem. Docení se to až když to člověk zkusí jinde.'
    },
    {
      initials: 'ZK', name: 'Zdeněk K.', city: 'Olomouc',
      subject: 'Koupelna — obklady a pak malování',
      date: 'Út 17. 6. 2025 · 15:41',
      text: 'Dobrý den, dělám postupně celou koupelnu — nejdřív obklady, pak malování. Tohle spouštím jako první věc než cokoliv objednám. Jako orientace před nákupem výborný.'
    }
  ]
};

function injectReviewsSection() {
  const target = document.getElementById('domio-reviews');
  if (!target) return;

  target.innerHTML = `
    <section class="domio-rv-section">
      <p class="domio-rv-eyebrow">Napsali jste nám</p>
      <div class="domio-rv-carousel">
        <button class="domio-rv-arrow domio-rv-prev" id="domio-rv-prev" aria-label="Předchozí zpráva">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div id="domio-rv-track"></div>
        <button class="domio-rv-arrow domio-rv-next" id="domio-rv-next" aria-label="Další zpráva">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
      <div class="domio-rv-dots" id="domio-rv-dots"></div>
    </section>
  `;

  let cat = 'podlahy';
  let idx = 0;
  let timer = null;

  function getReviews() {
    return DOMIO_REVIEWS[cat] || DOMIO_REVIEWS.podlahy;
  }

  function render() {
    const rv = getReviews();
    const r = rv[idx];
    const track = document.getElementById('domio-rv-track');
    const dots  = document.getElementById('domio-rv-dots');
    if (!track || !dots || !r) return;

    track.innerHTML = `
      <div class="domio-rv-card">
        <div class="domio-rv-header">
          <div class="domio-rv-avatar">${r.initials}</div>
          <div class="domio-rv-meta">
            <div class="domio-rv-nameline">
              <span class="domio-rv-name">${r.name}</span>
              <span class="domio-rv-city"> · ${r.city}</span>
            </div>
            <div class="domio-rv-subject">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              ${r.subject}
            </div>
          </div>
          <div class="domio-rv-date">${r.date}</div>
        </div>
        <div class="domio-rv-body">${r.text}</div>
        <div class="domio-rv-stars">★★★★★</div>
      </div>
    `;

    dots.innerHTML = rv.map((_, i) =>
      `<button class="domio-rv-dot${i === idx ? ' active' : ''}" data-i="${i}" aria-label="Zpráva ${i + 1}"></button>`
    ).join('');
  }

  function move(dir) {
    const rv = getReviews();
    idx = (idx + dir + rv.length) % rv.length;
    render();
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => move(1), 5000);
  }

  function switchCat(newCat) {
    if (newCat === cat) return;
    cat = newCat;
    idx = 0;
    render();
  }

  document.getElementById('domio-rv-prev').addEventListener('click', () => move(-1));
  document.getElementById('domio-rv-next').addEventListener('click', () => move(1));

  document.getElementById('domio-rv-dots').addEventListener('click', (e) => {
    const btn = e.target.closest('.domio-rv-dot');
    if (!btn) return;
    idx = parseInt(btn.dataset.i);
    render();
    resetTimer();
  });

  // Intersection Observer — sleduje ktorá kalkulačka je vo viewport
  const calcs = document.querySelectorAll('[data-calculator]');
  if (calcs.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) switchCat(e.target.dataset.calculator);
      });
    }, { threshold: 0.35 });
    calcs.forEach(el => obs.observe(el));
  }

  render();
  resetTimer();
}

// Spustenie
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectReviewsSection);
} else {
  injectReviewsSection();
}
