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
    tabs.innerHTML = '<button id="tab-floor" class="domio-mode-tab active" onclick="domioSetMode(\'floor\')">🪵 Podlahy</button><button id="tab-painting" class="domio-mode-tab" onclick="domioSetMode(\'painting\')">🖌️ Malování & Obklady</button>';
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
      updateBlurLabels('floor');
      updateTeaserContent('floor');
    } else {
      if (tabPainting) tabPainting.className = 'domio-mode-tab active';
      if (tabFloor) tabFloor.className = 'domio-mode-tab';
      if (cardPainting) cardPainting.className = 'domio-calc-item is-active';
      if (cardFloor) cardFloor.className = 'domio-calc-item';
      showPaintingInputs();
      updateBlurLabels('painting');
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

  function updateBlurLabels(mode) {
    var lblMaterial = document.getElementById('blur-label-material');
    var lblExtra = document.getElementById('blur-label-extra');
    var areaLabel = document.getElementById('area-label-text');
    if (mode === 'floor') {
      if (lblMaterial) lblMaterial.innerHTML = '📦 Materiál';
      if (lblExtra) lblExtra.innerHTML = '📐 S odpadem';
      if (areaLabel) areaLabel.textContent = 'Vaše místnost';
    } else {
      if (lblMaterial) lblMaterial.innerHTML = '🖌️ Barva a materiál';
      if (lblExtra) lblExtra.innerHTML = '📐 Plocha stropu';
      if (areaLabel) areaLabel.textContent = 'Plocha k malování';
    }
  }

  function updateTeaserContent(mode) {
    var headline = document.getElementById('teaser-headline');
    var body = document.getElementById('teaser-body');
    var badge = document.getElementById('teaser-badge');
    if (mode === 'painting') {
      if (headline) headline.innerHTML = 'Kolik přesně zaplatíte za<br><span>malování místnosti?</span>';
      if (body) body.innerHTML = 'Vypočítali jsme vám <strong style="color:#fff">cenu barvy, materiálu a práce</strong> — s ohledem na <strong style="color:#fff">aktuální ceny</strong> z tohoto týdne.';
      if (badge) badge.textContent = '🖌️ Malování';
    } else {
      if (headline) headline.innerHTML = 'Kolik přesně zaplatíte za<br><span>rekonstrukci podlahy?</span>';
      if (body) body.innerHTML = 'Vypočítali jsme vám <strong style="color:#fff">cenu materiálu, cenu práce</strong> a celkovou sumu — s ohledem na <strong style="color:#fff">aktuální ceny</strong> z tohoto týdne.';
      if (badge) badge.textContent = '🔍 Víme vše!';
    }
  }

  function resetResults() {
    document.getElementById('domio-area-box').classList.remove('visible');
    document.getElementById('domio-blur-box').classList.remove('visible');
    document.getElementById('domio-teaser-box').classList.remove('visible');
    document.getElementById('domio-craftsman-box').classList.remove('visible');
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
      heightLabel.style.cssText = 'display:block;font-size:13px;font-weight:600;color:#6B7280;margin-bottom:4px;';
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
    var nameEl   = document.getElementById('input-name');
    var emailEl  = document.getElementById('input-email');
    var submitEl = document.getElementById('btn-submit');
    if (nameEl   && document.getElementById('domio-name-slot'))   document.getElementById('domio-name-slot').appendChild(nameEl);
    if (emailEl  && document.getElementById('domio-email-slot'))  document.getElementById('domio-email-slot').appendChild(emailEl);
    if (submitEl && document.getElementById('domio-submit-slot')) document.getElementById('domio-submit-slot').appendChild(submitEl);
  }

  function showResults() {
    document.getElementById('domio-area-box').classList.add('visible');
    document.getElementById('domio-blur-box').classList.add('visible');
    document.getElementById('domio-teaser-box').classList.add('visible');
    document.getElementById('domio-success-msg').classList.remove('visible');
    document.getElementById('domio-craftsman-box').classList.remove('visible');
    setTimeout(function() {
      document.getElementById('domio-area-box').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
      document.getElementById('blur-total').textContent    = fmt(d.total_price);
      document.getElementById('blur-material').textContent = fmt(d.material_price);
      document.getElementById('blur-work').textContent     = fmt(d.work_price);
      document.getElementById('blur-waste').textContent    = parseFloat(d.area_with_waste).toFixed(2) + ' m²';
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
      document.getElementById('blur-total').textContent    = fmt(d.total_price);
      document.getElementById('blur-material').textContent = fmt(d.material_price);
      document.getElementById('blur-work').textContent     = fmt(d.labor_price);
      document.getElementById('blur-waste').textContent    = paintingAreaMode === 'custom' ? '—' : parseFloat(d.ceiling_area).toFixed(2) + ' m²';
      showResults();
      if (typeof gtag !== 'undefined') gtag('event', 'calculator_calculated', { painting_type: paintingType, net_area: d.net_area });
    } catch(e) { alert('Chyba při výpočtu. Zkuste to prosím znovu.'); }
    finally { setLoading(btn, false); }
  }

  function bindSubmit() {
    var btn = document.getElementById('btn-submit');
    if (!btn) return;
    btn.addEventListener('click', async function() {
      var name  = (document.getElementById('input-name')  || {}).value || '';
      var email = (document.getElementById('input-email') || {}).value || '';
      var valid = true;
      if (!name.trim())  { showError('input-name',  'Zadejte své jméno'); valid = false; }
      if (!email.trim()) { showError('input-email', 'Zadejte platný e-mail'); valid = false; }
      if (!calcData) { alert('Nejprve vypočítejte cenu.'); return; }
      if (!valid) return;
      setLoading(btn, true);
      submittedName = name.trim();
      submittedEmail = email.trim();
      var body;
      if (calcData._mode === 'painting') {
        body = { name: submittedName, email: submittedEmail, calc_type: 'painting',
          sub_type: calcData.display_name, area_m2: calcData.net_area,
          material_price: calcData.material_price, work_price: calcData.labor_price,
          unit_material_price: 0, unit_labor_price: 0 };
      } else {
        body = { name: submittedName, email: submittedEmail, calc_type: 'floor',
          sub_type: calcData.display_name || calcData.sub_type, area_m2: calcData.area_m2,
          material_price: calcData.material_price, work_price: calcData.work_price,
          unit_material_price: calcData.unit_material_price, unit_labor_price: calcData.unit_labor_price };
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
      if (!phone.trim()) { alert('Zadejte prosím telefon.'); return; }
if (!psz.trim()) { alert('Zadejte prosím PSČ.'); return; }
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
    ['input-subtype','input-painting-type','input-length','input-width','input-height','input-name','input-email','input-custom-area'].forEach(function(id) {
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
    injectSpinners();
    moveFormElements();
    bindCalculate();
    bindSubmit();
    bindCraftsmanSubmit();
    bindClearErrors();
  });
})();
