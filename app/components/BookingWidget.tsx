'use client'
import { useEffect } from 'react'

export default function BookingWidget() {
  useEffect(() => {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    // Full widget, written as *plain JS* (no TS syntax) and avoiding template literals inside
    const code = `
(function () {
  // ====== CONFIG ======
  var SUPABASE_URL = '${SUPABASE_URL}';
  var SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';
  var CURRENCY = 'GHS';

  // ====== SUPABASE CLIENT ======
  function SupabaseClient(url, key) {
    this.url = url;
    this.key = key;
    this.headers = {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    };
  }

  SupabaseClient.prototype.query = async function (table, params) {
    params = params || {};
    var qs = new URLSearchParams();
    if (params.select) qs.set('select', params.select);
    if (params.eq) Object.keys(params.eq).forEach(function (k) { qs.set(k, 'eq.' + params.eq[k]); });
    if (params.order) qs.set('order', params.order);
    if (params.gte) Object.keys(params.gte).forEach(function (k) { qs.set(k, 'gte.' + params.gte[k]); });
    if (params.lte) Object.keys(params.lte).forEach(function (k) { qs.set(k, 'lte.' + params.lte[k]); });

    var url = this.url + '/rest/v1/' + table + '?' + qs.toString();
    var res = await fetch(url, { headers: this.headers });
    if (!res.ok) throw new Error('Supabase error: ' + res.status);
    return res.json();
  };

  SupabaseClient.prototype.rpc = async function (fnName, args) {
    var url = this.url + '/rest/v1/rpc/' + fnName;
    var res = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(args || {})
    });
    if (!res.ok) throw new Error('RPC error: ' + res.status);
    return res.json();
  };

  SupabaseClient.prototype.insert = async function (table, data) {
    var url = this.url + '/rest/v1/' + table;
    var res = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Insert error: ' + (await res.text()));
    return res.json();
  };

  SupabaseClient.prototype.update = async function (table, data, match) {
    var qs = new URLSearchParams();
    Object.keys(match || {}).forEach(function (k) { qs.set(k, 'eq.' + match[k]); });
    var url = this.url + '/rest/v1/' + table + '?' + qs.toString();
    var res = await fetch(url, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Update error: ' + res.status);
    return res.json();
  };

  var supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ====== UI BOOTSTRAP ======
  var root = document.getElementById('booking-search');
  if (!root) return;

  root.innerHTML =
    '<style>' +
    ':root{--bg:#f7f9fc;--panel:#fff;--text:#0f172a;--muted:#64748b;--line:#e5e7eb;--brand:#111827;--ok:#16a34a;--err:#b91c1c;--radius:18px;--shadow:0 14px 34px rgba(15,23,42,.08);--success:#dcfce7;--success-border:#86efac;--success-text:#166534}' +
    '*{box-sizing:border-box} .wrap{max-width:1120px;margin:24px auto;padding:0 16px}' +
    '.card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:18px}' +
    'h1{margin:0 0 6px;font:600 28px/1.2 Inter,system-ui,Segoe UI,Roboto,Arial}.sub{color:#64748b;margin:0 0 12px}' +
    '.grid{display:grid;gap:12px}@media(min-width:860px){.grid.cols-4{grid-template-columns:1.1fr 1.1fr .8fr auto}}' +
    'label{display:block;font-size:13px;color:#334155;margin:0 0 6px;font-weight:500}' +
    'input,select,button{font:inherit} input,select{width:100%;padding:12px;border:1px solid var(--line);border-radius:12px;background:#fff;outline:none;transition:all .2s}' +
    'input:focus,select:focus{box-shadow:0 0 0 4px rgba(17,24,39,.06);border-color:#111827}' +
    '.row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}' +
    '.pill{display:inline-flex;gap:8px;align-items:center;border:1px solid var(--line);background:#fff;padding:8px 12px;border-radius:999px;color:#334155;font-size:13px}' +
    '.btn{border:0;background:var(--brand);color:#fff;padding:12px 18px;border-radius:12px;cursor:pointer;font-weight:600;transition:all .2s}' +
    '.btn:hover:not(:disabled){filter:brightness(1.05);transform:translateY(-1px)} .btn:disabled{opacity:.5;cursor:not-allowed}' +
    '.btn.secondary{background:#1118270d;color:#111;border:1px solid var(--line)} .btn.small{padding:8px 12px;font-size:13px}' +
    '.notice{display:none;margin-top:12px;padding:12px;border-radius:12px;border:1px solid var(--success-border);background:var(--success);color:var(--success-text)}' +
    '.notice.err{border-color:#ffe1e1;background:#fff3f3;color:#b91c1c}' +
    '.results{display:grid;gap:14px;margin-top:16px}@media(min-width:820px){.results{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
    '.room{border:1px solid var(--line);border-radius:16px;background:#fff;overflow:hidden;display:flex;flex-direction:column;transition:all .2s}' +
    '.room:hover{box-shadow:0 4px 12px rgba(0,0,0,.08)} .hero{width:100%;height:220px;object-fit:cover;background:#eef2f7;display:block}' +
    '.body{padding:14px}.name{font-weight:800;font-size:18px;margin:0 0 4px}.desc{color:#6b7280;font-size:14px;margin:0 0 10px;min-height:2.4em}' +
    '.foot{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}.price{font-weight:600;font-size:14px;line-height:1.4}' +
    '.price-breakdown{color:#6b7280;font-size:12px;margin-top:4px}' +
    '.skeleton{position:relative;overflow:hidden;background:#f3f4f6;border-radius:12px;height:120px}.skeleton:after{content:\"\";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(0,0,0,.05),transparent);transform:translateX(-100%);animation:shimmer 1.2s infinite}@keyframes shimmer{100%{transform:translateX(100%)}}' +
    '.summary{margin-top:12px;border:1px dashed var(--line);border-radius:12px;padding:10px}.kv{display:flex;justify-content:space-between;padding:6px 0;align-items:center}.kv.discount{color:#16a34a;font-weight:600}.total{font-weight:800;font-size:15px;padding-top:8px;border-top:2px solid var(--line);margin-top:4px}' +
    '.overlay{position:fixed;inset:0;display:none;background:rgba(15,23,42,.5);backdrop-filter:saturate(160%) blur(2px);z-index:9998}' +
    '.modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:9999}.sheet{width:90vw;max-width:1000px;max-height:90vh;background:#fff;border-radius:20px;border:1px solid var(--line);box-shadow:var(--shadow);display:flex;flex-direction:column}' +
    '.sheet header{padding:16px 18px;border-bottom:1px solid var(--line);font-weight:800;font-size:18px;display:flex;justify-content:space-between;align-items:center}.sheet main{padding:16px 18px;overflow:auto}.sheet footer{padding:14px 18px;border-top:1px solid var(--line);display:flex;gap:10px;justify-content:flex-end}' +
    '.x{background:transparent;border:0;font-size:22px;cursor:pointer;line-height:1}.qty{display:inline-flex;gap:10px;align-items:center}.chip{display:inline-flex;padding:4px 8px;border:1px solid var(--line);border-radius:999px;background:#fff}' +
    '.coupon-input{display:flex;gap:8px;margin-top:12px}.coupon-input input{flex:1}.applied-coupon{display:flex;align-items:center;justify-content:space-between;padding:10px;background:#dcfce7;border:1px solid #86efac;border-radius:10px;margin-top:8px}.applied-coupon code{font-weight:700;color:#166534}.remove-coupon{background:#ef4444;color:#fff;border:0;padding:4px 10px;border-radius:6px;font-size:12px;cursor:pointer;font-weight:600}' +
    '</style>' +

    '<div class="wrap"><div class="card">' +
    '<h1>Choose your cabin</h1><p class="sub">Pick your dates to see available cabins and prices.</p>' +
    '<div class="grid cols-4">' +
      '<div><label>Check-in</label><input id="ci" type="date"></div>' +
      '<div><label>Check-out</label><input id="co" type="date"></div>' +
      '<div><label>Adults</label><select id="ad"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select></div>' +
      '<div class="row" style="align-items:flex-end;justify-content:flex-end;flex-wrap:wrap">' +
        '<span class="pill">Total: <strong id="nn">—</strong> night<span id="nn-s">s</span></span>' +
        '<span class="pill" id="weekend-pill" style="display:none"><strong id="wd">0</strong> weekday • <strong id="we">0</strong> weekend</span>' +
        '<button id="load" class="btn">See available cabins</button>' +
      '</div>' +
    '</div>' +

    '<div class="summary">' +
      '<div class="kv"><span>Nights</span><strong id="sN">0</strong></div>' +
      '<div class="kv"><span>Room subtotal</span><strong id="sRoom">—</strong></div>' +
      '<div class="kv"><span>Extras</span><strong id="sExtras">£0.00</strong></div>' +
      '<div class="kv discount" id="sDiscountRow" style="display:none"><span>Discount (<span id="sDiscountLabel"></span>)</span><strong id="sDiscount">−£0.00</strong></div>' +
      '<div class="kv total"><span>Estimated total</span><strong id="sTotal">—</strong></div>' +
    '</div>' +

    '<div id="msg" class="notice"></div>' +
    '<div id="results" class="results"></div>' +

    '<div class="row" style="margin-top:14px;justify-content:flex-end">' +
      '<button id="cont" class="btn secondary" disabled>Continue</button>' +
    '</div>' +

    '</div></div>' +

    '<div id="ovl" class="overlay"></div>' +

    '<div id="modal-results" class="modal" aria-hidden="true"><div class="sheet">' +
      '<header><div>Available cabins</div><button class="x" data-close="results">×</button></header>' +
      '<main><div id="results-modal" class="results"></div></main>' +
      '<footer><button class="btn secondary" data-close="results">Close</button></footer>' +
    '</div></div>' +

    '<div id="modal-extras" class="modal" aria-hidden="true"><div class="sheet">' +
      '<header><div>Choose extras</div><button class="x" data-close="extras">×</button></header>' +
      '<main><div id="extras-list"></div>' +
        '<div class="summary" style="margin-top:16px">' +
          '<div class="kv"><span>Nights</span><strong id="mN1">0</strong></div>' +
          '<div class="kv"><span>Room subtotal</span><strong id="mRoom1">—</strong></div>' +
          '<div class="kv"><span>Extras</span><strong id="mExtras1">£0.00</strong></div>' +
          '<div class="kv discount" id="mDiscountRow1" style="display:none"><span>Discount (<span id="mDiscountLabel1"></span>)</span><strong id="mDiscount1">−£0.00</strong></div>' +
          '<div class="kv total"><span>Estimated total</span><strong id="mTotal1">—</strong></div>' +
        '</div>' +
      '</main>' +
      '<footer><button class="btn secondary" data-back="extras">Back</button><button class="btn" id="to-guest">Continue</button></footer>' +
    '</div></div>' +

    '<div id="modal-guest" class="modal" aria-hidden="true"><div class="sheet">' +
      '<header><div>Guest details</div><button class="x" data-close="guest">×</button></header>' +
      '<main>' +
        '<div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">' +
          '<div><label>First name *</label><input id="gFirst" placeholder="Jane" required></div>' +
          '<div><label>Last name *</label><input id="gLast" placeholder="Doe" required></div>' +
          '<div><label>Email *</label><input id="gEmail" type="email" placeholder="jane@example.com" required></div>' +
          '<div><label>Phone</label><input id="gPhone" placeholder="+44 ..."></div>' +
        '</div>' +
        '<div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--line)">' +
          '<label>Have a coupon code?</label>' +
          '<div class="coupon-input"><input id="coupon-code" type="text" placeholder="Enter code" style="text-transform:uppercase"><button id="apply-coupon" class="btn small">Apply</button></div>' +
          '<div id="coupon-msg" style="margin-top:8px;font-size:13px"></div>' +
          '<div id="applied-coupon-display"></div>' +
        '</div>' +
        '<div class="summary" style="margin-top:16px">' +
          '<div class="kv"><span>Dates</span><strong id="mDates2">—</strong></div>' +
          '<div class="kv"><span>Room</span><strong id="mRoomName2">—</strong></div>' +
          '<div class="kv"><span>Nights</span><strong id="mN2">0</strong></div>' +
          '<div class="kv"><span>Room subtotal</span><strong id="mRoom2">—</strong></div>' +
          '<div class="kv"><span>Extras</span><strong id="mExtras2">£0.00</strong></div>' +
          '<div class="kv discount" id="mDiscountRow2" style="display:none"><span>Discount (<span id="mDiscountLabel2"></span>)</span><strong id="mDiscount2">−£0.00</strong></div>' +
          '<div class="kv total"><span>Total to pay</span><strong id="mTotal2">—</strong></div>' +
        '</div>' +
      '</main>' +
      '<footer><button class="btn secondary" data-back="guest">Back</button><button class="btn" id="confirm">Confirm booking</button></footer>' +
    '</div></div>' +

    '<div id="modal-thanks" class="modal" aria-hidden="true"><div class="sheet">' +
      '<header><div>Booking confirmed! 🎉</div><button class="x" data-close="thanks">×</button></header>' +
      '<main>' +
        '<p style="margin:0 0 8px">Thank you! Your reservation is confirmed.</p>' +
        '<div class="summary" style="margin-top:8px">' +
          '<div class="kv"><span>Confirmation code</span><strong id="tCode">—</strong></div>' +
          '<div class="kv"><span>Guest</span><strong id="tName">—</strong></div>' +
          '<div class="kv"><span>Dates</span><strong id="tDates">—</strong></div>' +
          '<div class="kv"><span>Room</span><strong id="tRoom">—</strong></div>' +
          '<div class="kv total"><span>Total paid</span><strong id="tTotal">—</strong></div>' +
        '</div>' +
        '<p class="sub" style="margin-top:10px">A confirmation email will be sent to you shortly.</p>' +
      '</main>' +
      '<footer><button class="btn" id="thanks-close">Close</button></footer>' +
    '</div></div>';

  // ====== HELPERS ======
  function $(s) { return document.querySelector(s); }
  function RESULTS_SEL() { return document.querySelector('#results-modal') || document.querySelector('#results'); }
  function formatCurrency(amount, curr) {
    if (!curr) curr = CURRENCY;
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: curr }).format(Number(amount || 0));
  }
  function iso(d) { return new Date(d).toISOString().slice(0, 10); }
  function nights(a, b) { var A = new Date(a), B = new Date(b); return Math.max(0, Math.round((B - A) / 86400000)); }
  function showMsg(t, type) { var el = $('#msg'); el.className = 'notice' + (type === 'err' ? ' err' : ''); el.style.display = 'block'; el.textContent = t; }
  function hideMsg(){ var el = $('#msg'); el.style.display = 'none'; el.textContent = ''; }

  function setDefaults(){
    var t = new Date();
    var ci = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + 1));
    var co = new Date(ci); co.setUTCDate(co.getUTCDate() + 2);
    $('#ci').value = iso(ci); $('#co').value = iso(co);
    updateNightsDisplay();
  }
  function updateNightsDisplay() {
    var nn = nights($('#ci').value, $('#co').value);
    $('#nn').textContent = nn;
    $('#nn-s').textContent = nn === 1 ? '' : 's';
    $('#sN').textContent = nn;
  }
  function renderSkeletons(){
    var r = RESULTS_SEL(); r.innerHTML = '';
    for (var i = 0; i < 4; i++){
      var w = document.createElement('div');
      w.className = 'room';
      w.innerHTML = '<div class="skeleton" style="height:220px"></div><div class="body">' +
        '<div class="skeleton" style="height:20px;width:60%"></div>' +
        '<div class="skeleton" style="height:14px;margin-top:8px"></div>' +
        '<div class="skeleton" style="height:42px;margin-top:12px"></div></div>';
      r.appendChild(w);
    }
  }

  // ====== STATE ======
  var selected = null;
  var extras = [];
  var extrasTotal = 0;
  var appliedCoupon = null;
  var discountAmount = 0;

  function calculateDiscount() {
    if (!appliedCoupon || !selected) { discountAmount = 0; return 0; }
    var subtotal = selected.total + extrasTotal;
    if (appliedCoupon.min_booking_amount && subtotal < appliedCoupon.min_booking_amount) return 0;
    var discount = 0;
    if (appliedCoupon.applies_to === 'both') {
      var baseAmount = subtotal;
      discount = appliedCoupon.discount_type === 'percentage' ? (baseAmount * appliedCoupon.discount_value / 100) : appliedCoupon.discount_value;
    } else if (appliedCoupon.applies_to === 'rooms') {
      discount = appliedCoupon.discount_type === 'percentage' ? (selected.total * appliedCoupon.discount_value / 100) : appliedCoupon.discount_value;
    } else if (appliedCoupon.applies_to === 'extras') {
      discount = appliedCoupon.discount_type === 'percentage' ? (extrasTotal * appliedCoupon.discount_value / 100) : appliedCoupon.discount_value;
    }
    discount = Math.min(discount, subtotal);
    discountAmount = discount;
    return discount;
  }

  function updateSummary(){
    var room = selected && selected.total ? selected.total : 0;
    var curr = (selected && selected.currency) ? selected.currency : CURRENCY;
    var discount = calculateDiscount();
    var finalTotal = Math.max(0, room + extrasTotal - discount);

    $('#sRoom').textContent = room ? formatCurrency(room, curr) : '—';
    $('#sExtras').textContent = formatCurrency(extrasTotal, curr);

    if (discount > 0) {
      $('#sDiscountRow').style.display = 'flex';
      $('#sDiscountLabel').textContent = appliedCoupon.code;
      $('#sDiscount').textContent = '−' + formatCurrency(discount, curr);
    } else {
      $('#sDiscountRow').style.display = 'none';
    }

    $('#sTotal').textContent = room ? formatCurrency(finalTotal, curr) : '—';
    $('#sN').textContent = String(selected ? selected.nights : $('#nn').textContent);
    $('#cont').disabled = !selected;
  }

  function updateModalSummaries() {
    if (!selected) return;
    var curr = selected.currency || CURRENCY;
    var discount = calculateDiscount();
    var finalTotal = Math.max(0, selected.total + extrasTotal - discount);

    // Modal 1 (Extras)
    $('#mN1').textContent = String(selected.nights || 0);
    $('#mRoom1').textContent = formatCurrency(selected.total, curr);
    $('#mExtras1').textContent = formatCurrency(extrasTotal, curr);
    if (discount > 0) { $('#mDiscountRow1').style.display = 'flex'; $('#mDiscountLabel1').textContent = appliedCoupon.code; $('#mDiscount1').textContent = '−' + formatCurrency(discount, curr); }
    else { $('#mDiscountRow1').style.display = 'none'; }
    $('#mTotal1').textContent = formatCurrency(finalTotal, curr);

    // Modal 2 (Guest)
    $('#mN2').textContent = String(selected.nights || 0);
    $('#mRoom2').textContent = formatCurrency(selected.total, curr);
    $('#mExtras2').textContent = formatCurrency(extrasTotal, curr);
    if (discount > 0) { $('#mDiscountRow2').style.display = 'flex'; $('#mDiscountLabel2').textContent = appliedCoupon.code; $('#mDiscount2').textContent = '−' + formatCurrency(discount, curr); }
    else { $('#mDiscountRow2').style.display = 'none'; }
    $('#mTotal2').textContent = formatCurrency(finalTotal, curr);
  }

  // ====== COUPONS ======
  async function validateCoupon(code) {
    try {
      var url = SUPABASE_URL + '/rest/v1/coupons?select=*';
      var response = await fetch(url, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('HTTP ' + response.status + ': ' + response.statusText);
      var allCoupons = await response.json();
      var coupon = allCoupons.find(function (c) { return c.code && c.code.toUpperCase() === code.toUpperCase(); });
      if (!coupon) return { valid: false, error: 'Invalid coupon code' };
      if (!coupon.is_active) return { valid: false, error: 'This coupon is no longer active' };
      var today = new Date().toISOString().split('T')[0];
      if (coupon.valid_until && coupon.valid_until < today) return { valid: false, error: 'This coupon has expired' };
      if (coupon.max_uses && (coupon.current_uses || 0) >= coupon.max_uses) return { valid: false, error: 'This coupon has reached its usage limit' };
      var subtotal = (selected ? selected.total : 0) + extrasTotal;
      if (coupon.min_booking_amount && subtotal < coupon.min_booking_amount) {
        return { valid: false, error: 'Minimum booking amount of ' + formatCurrency(coupon.min_booking_amount, coupon.currency || CURRENCY) + ' required' };
      }
      return { valid: true, coupon: coupon };
    } catch (err) {
      return { valid: false, error: 'Error: ' + err.message };
    }
  }

  function displayAppliedCoupon() {
    var display = $('#applied-coupon-display');
    if (appliedCoupon) {
      var discountText = appliedCoupon.discount_type === 'percentage'
        ? (appliedCoupon.discount_value + '% off')
        : (formatCurrency(appliedCoupon.discount_value, appliedCoupon.currency) + ' off');
      display.innerHTML =
        '<div class="applied-coupon">' +
          '<div><code>' + appliedCoupon.code + '</code> - ' + discountText + ' ' + appliedCoupon.applies_to + '</div>' +
          '<button class="remove-coupon" id="remove-coupon">Remove</button>' +
        '</div>';
      var rm = document.getElementById('remove-coupon');
      if (rm) rm.addEventListener('click', function () {
        appliedCoupon = null; discountAmount = 0;
        var cEl = document.getElementById('coupon-code'); if (cEl) cEl.value = '';
        var mEl = document.getElementById('coupon-msg'); if (mEl) mEl.textContent = '';
        display.innerHTML = ''; recalcExtras();
      });
    } else { display.innerHTML = ''; }
  }

  // ====== API ======
  async function getAvailableRooms(checkIn, checkOut, adults) {
    var rooms = await supabase.rpc('get_available_rooms', {
      p_check_in: checkIn, p_check_out: checkOut, p_adults: parseInt(adults, 10)
    });
    return rooms.map(function (room) {
      return {
        id: room.id, code: room.code, name: room.name, description: room.description,
        weekdayPrice: parseFloat(room.weekday_price), weekendPrice: parseFloat(room.weekend_price),
        totalPrice: parseFloat(room.total_price),
        weekdayNights: parseInt(room.weekday_nights, 10),
        weekendNights: parseInt(room.weekend_nights, 10),
        nights: parseInt(room.nights, 10),
        imageUrl: room.image_url, currency: room.currency || 'GHS'
      };
    });
  }

  async function getExtras() {
    try {
      var data = await supabase.query('extras', {
        select: 'id,code,name,description,price,category',
        eq: { is_active: true },
        order: 'price.asc'
      });
      return data.map(function (e) {
        return { id: e.id, code: e.code, name: e.name, description: e.description, price: parseFloat(e.price), category: e.category };
      });
    } catch (e) { return []; }
  }

  async function createReservation(payload) {
    try {
      var confirmCode = 'BK' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      var roomTypes = await supabase.query('room_types', { select: 'id', eq: { code: payload.roomTypeCode } });
      if (!roomTypes || roomTypes.length === 0) throw new Error('Room type not found');
      var roomTypeId = roomTypes[0].id;

      var reservationData = {
        confirmation_code: confirmCode,
        room_type_id: roomTypeId,
        room_type_code: payload.roomTypeCode,
        room_name: payload.roomName,
        check_in: payload.checkIn,
        check_out: payload.checkOut,
        nights: payload.nights,
        adults: payload.adults,
        room_subtotal: payload.roomSubtotal,
        extras_total: payload.extrasTotal,
        discount_amount: payload.discountAmount || 0,
        coupon_code: payload.couponCode || null,
        total: payload.finalTotal,
        currency: payload.currency,
        guest_first_name: payload.guest.first,
        guest_last_name: payload.guest.last,
        guest_email: payload.guest.email,
        guest_phone: payload.guest.phone || '',
        status: 'confirmed'
      };

      var newReservations = await supabase.insert('reservations', reservationData);
      if (!newReservations || newReservations.length === 0) throw new Error('Failed to create reservation');
      var newReservation = newReservations[0];

      if (payload.extras && payload.extras.length > 0) {
        var reservationExtras = payload.extras.map(function (extra) {
          return {
            reservation_id: newReservation.id,
            extra_code: extra.code,
            extra_name: extra.name,
            price: extra.price,
            quantity: extra.qty,
            subtotal: extra.price * extra.qty
          };
        });
        await supabase.insert('reservation_extras', reservationExtras);
      }

      if (payload.couponCode && appliedCoupon) {
        await supabase.update('coupons',
          { current_uses: (appliedCoupon.current_uses || 0) + 1 },
          { id: appliedCoupon.id }
        );
      }

      return { confirmation_code: confirmCode, total: payload.finalTotal, currency: payload.currency };
    } catch (e) { throw e; }
  }

  // ====== RENDER ROOMS ======
  async function renderRooms(items, ci, co) {
    var r = RESULTS_SEL(); r.innerHTML = '';
    if (!items || !items.length) { showMsg('No cabins available for those dates.', 'err'); return; }
    if (items[0] && items[0].currency) { CURRENCY = items[0].currency; }
    hideMsg(); showMsg('Availability loaded — ' + items.length + ' option' + (items.length > 1 ? 's' : '') + '.', 'ok');

    items.forEach(function (it) {
      var img = it.imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Crect fill='%23eef2f7' width='100%25' height='100%25'/%3E%3C/svg%3E";
      var priceBreakdown = '';
      if (it.weekdayNights > 0 && it.weekendNights > 0) {
        priceBreakdown = it.weekdayNights + ' weekday × ' + formatCurrency(it.weekdayPrice, it.currency) + ' + ' + it.weekendNights + ' weekend × ' + formatCurrency(it.weekendPrice, it.currency);
      } else if (it.weekdayNights > 0) {
        priceBreakdown = it.weekdayNights + ' night' + (it.weekdayNights > 1 ? 's' : '') + ' × ' + formatCurrency(it.weekdayPrice, it.currency);
      } else if (it.weekendNights > 0) {
        priceBreakdown = it.weekendNights + ' night' + (it.weekendNights > 1 ? 's' : '') + ' × ' + formatCurrency(it.weekendPrice, it.currency);
      }

      var card = document.createElement('div');
      card.className = 'room';
      card.innerHTML =
        '<img class="hero" src="' + img + '" alt="' + (it.name || '') + '" onerror="this.style.display=\\'none\\'">' +
        '<div class="body">' +
          '<div class="name">' + it.name + '</div>' +
          '<div class="desc">' + (it.description || 'Relax in a cozy cabin.') + '</div>' +
          '<div class="foot">' +
            '<div class="price">' +
              '<div>' + it.nights + ' night' + (it.nights > 1 ? 's' : '') + ' • <span class="chip">' + formatCurrency(it.totalPrice, it.currency) + ' total</span></div>' +
              (priceBreakdown ? '<div class="price-breakdown">' + priceBreakdown + '</div>' : '') +
            '</div>' +
            '<button class="btn secondary" ' +
              'data-id="' + it.id + '" data-code="' + it.code + '" data-name="' + it.name + '" data-img="' + img + '" ' +
              'data-total="' + it.totalPrice + '" data-weekday-price="' + it.weekdayPrice + '" data-weekend-price="' + it.weekendPrice + '" ' +
              'data-weekday-nights="' + it.weekdayNights + '" data-weekend-nights="' + it.weekendNights + '" data-nights="' + it.nights + '" data-currency="' + it.currency + '">Select</button>' +
          '</div>' +
        '</div>';
      r.appendChild(card);
    });

    r.querySelectorAll('button[data-code]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var curr = btn.getAttribute('data-currency') || CURRENCY;
        selected = {
          id: btn.getAttribute('data-id'),
          code: btn.getAttribute('data-code'),
          name: btn.getAttribute('data-name'),
          weekdayPrice: parseFloat(btn.getAttribute('data-weekday-price') || '0'),
          weekendPrice: parseFloat(btn.getAttribute('data-weekend-price') || '0'),
          weekdayNights: parseInt(btn.getAttribute('data-weekday-nights') || '0', 10),
          weekendNights: parseInt(btn.getAttribute('data-weekend-nights') || '0', 10),
          total: parseFloat(btn.getAttribute('data-total') || '0'),
          currency: curr,
          imageUrl: btn.getAttribute('data-img'),
          nights: parseInt(btn.getAttribute('data-nights') || '0', 10)
        };
        CURRENCY = curr; extras = []; extrasTotal = 0; appliedCoupon = null; discountAmount = 0;
        updateSummary();
        showMsg((selected.name || 'Room') + ' selected. You can Continue.', 'ok');
        closeModal('results');
        var c = document.getElementById('cont'); if (c) c.click();
      });
    });
  }

  function renderExtrasList(list) {
    var host = $('#extras-list');
    if (!list.length) { host.innerHTML = '<div class="notice err" style="display:block">No extras available right now.</div>'; return; }
    host.innerHTML = '';
    list.forEach(function (x) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-bottom:10px;background:#fff';
      row.innerHTML =
        '<div><div style="font-weight:700">' + x.name + '</div><div class="muted" style="color:#6b7280;font-size:14px">' + formatCurrency(x.price, selected ? selected.currency : CURRENCY) + '</div></div>' +
        '<div class="qty"><button class="btn secondary" data-minus="' + x.code + '">−</button><span id="qty-' + x.code + '">0</span><button class="btn secondary" data-plus="' + x.code + '">+</button></div>';
      host.appendChild(row);
    });

    host.querySelectorAll('[data-plus]').forEach(function (b) {
      b.addEventListener('click', function () {
        var code = b.getAttribute('data-plus');
        var item = extras.find(function (e) { return e.code === code; });
        if (!item) { var base = list.find(function (x) { return x.code === code; }); item = Object.assign({}, base, { qty: 0 }); extras.push(item); }
        item.qty = (item.qty || 0) + 1;
        document.getElementById('qty-' + code).textContent = String(item.qty);
        recalcExtras();
      });
    });
    host.querySelectorAll('[data-minus]').forEach(function (b) {
      b.addEventListener('click', function () {
        var code = b.getAttribute('data-minus');
        var item = extras.find(function (e) { return e.code === code; });
        if (!item) return;
        item.qty = Math.max(0, (item.qty || 0) - 1);
        document.getElementById('qty-' + code).textContent = String(item.qty);
        recalcExtras();
      });
    });
  }

  function recalcExtras() {
    extrasTotal = extras.reduce(function (sum, x) { return sum + (x.price * (x.qty || 0)); }, 0);
    updateSummary();
    updateModalSummaries();
  }

  // ====== MODALS ======
  var ovl = $('#ovl');
  var modResults = $('#modal-results');
  var modExtras = $('#modal-extras');
  var modGuest = $('#modal-guest');
  var modThanks = $('#modal-thanks');

  function openModal(which) {
    ovl.style.display = 'block';
    var el = which === 'results' ? modResults : which === 'extras' ? modExtras : which === 'guest' ? modGuest : modThanks;
    el.style.display = 'flex';
  }
  function closeModal(which) {
    var el = which === 'results' ? modResults : which === 'extras' ? modExtras : which === 'guest' ? modGuest : modThanks;
    el.style.display = 'none';
    if (modResults.style.display === 'none' && modExtras.style.display === 'none' && modGuest.style.display === 'none' && modThanks.style.display === 'none') {
      ovl.style.display = 'none';
    }
  }

  document.querySelectorAll('[data-close="results"]').forEach(function (b) { b.addEventListener('click', function(){ closeModal('results'); }); });
  document.querySelectorAll('[data-close="extras"]').forEach(function (b) { b.addEventListener('click', function(){ closeModal('extras'); }); });
  document.querySelectorAll('[data-close="guest"]').forEach(function (b) { b.addEventListener('click', function(){ closeModal('guest'); }); });
  document.querySelectorAll('[data-close="thanks"]').forEach(function (b) { b.addEventListener('click', function(){ closeModal('thanks'); }); });
  document.querySelectorAll('[data-back="extras"]').forEach(function (b) { b.addEventListener('click', function(){ closeModal('extras'); }); });
  document.querySelectorAll('[data-back="guest"]').forEach(function (b) {
    b.addEventListener('click', function(){ closeModal('guest'); openModal('extras'); });
  });
  document.getElementById('thanks-close').addEventListener('click', function(){ closeModal('thanks'); });

  // ====== COUPON HANDLER ======
  document.getElementById('apply-coupon').addEventListener('click', async function () {
    var code = (document.getElementById('coupon-code') || {}).value || '';
    var msgEl = document.getElementById('coupon-msg');
    if (!code.trim()) { msgEl.style.color = '#b91c1c'; msgEl.textContent = 'Please enter a coupon code'; return; }
    var btn = document.getElementById('apply-coupon'); btn.disabled = true; btn.textContent = 'Checking...';
    var result = await validateCoupon(code.trim());
    if (result.valid) { appliedCoupon = result.coupon; msgEl.style.color = '#166534'; msgEl.textContent = '✓ Coupon applied: ' + (appliedCoupon.description || appliedCoupon.code); displayAppliedCoupon(); recalcExtras(); }
    else { msgEl.style.color = '#b91c1c'; msgEl.textContent = '✗ ' + result.error; appliedCoupon = null; }
    btn.disabled = false; btn.textContent = 'Apply';
  });

  // ====== EVENTS ======
  setDefaults(); updateSummary();

  document.getElementById('ci').addEventListener('change', function () {
    var ci = document.getElementById('ci').value, co = document.getElementById('co').value;
    if (co <= ci) { var d = new Date(ci); d.setDate(d.getDate() + 1); document.getElementById('co').value = iso(d); }
    updateNightsDisplay();
  });
  document.getElementById('co').addEventListener('change', function () { updateNightsDisplay(); });

  document.getElementById('load').addEventListener('click', async function () {
    var ci = document.getElementById('ci').value, co = document.getElementById('co').value;
    var adEl = document.getElementById('ad'); var ad = adEl && adEl.value ? adEl.value : 2;

    if (!ci || !co) { showMsg('Please choose both dates.', 'err'); return; }
    if (new Date(co) <= new Date(ci)) { showMsg('Check-out must be after check-in.', 'err'); return; }

    selected = null; extras = []; extrasTotal = 0; appliedCoupon = null; discountAmount = 0; updateSummary();
    openModal('results'); renderSkeletons();

    try {
      var rooms = await getAvailableRooms(ci, co, ad);
      if (rooms.length > 0) {
        var firstRoom = rooms[0];
        if (firstRoom.weekdayNights > 0 || firstRoom.weekendNights > 0) {
          document.getElementById('wd').textContent = String(firstRoom.weekdayNights);
          document.getElementById('we').textContent = String(firstRoom.weekendNights);
          document.getElementById('weekend-pill').style.display = 'inline-flex';
        }
      }
      await renderRooms(rooms, ci, co);
    } catch (e) {
      showMsg('Error: ' + (e.message || "Couldn't load availability. Please try again."), 'err');
    }
  });

  document.getElementById('cont').addEventListener('click', async function () {
    if (!selected) return;
    try {
      var extrasList = await getExtras();
      var picked = new Map(extras.filter(function (x) { return x.qty > 0; }).map(function (x) { return [x.code, x.qty]; }));
      extras = extrasList.map(function (x) { return Object.assign({}, x, { qty: picked.get(x.code) || 0 }); });
      renderExtrasList(extrasList);
      recalcExtras();
    } catch (e) {
      document.getElementById('extras-list').innerHTML = '<div class="notice err" style="display:block">Couldn\\'t load extras right now.</div>';
    }
    var cEl = document.getElementById('coupon-code'); if (cEl) cEl.value = '';
    var mEl = document.getElementById('coupon-msg'); if (mEl) mEl.textContent = '';
    displayAppliedCoupon();
    updateModalSummaries();
    openModal('extras');
  });

  document.getElementById('to-guest').addEventListener('click', function () {
    if (!selected) return;
    closeModal('extras');
    var ci = document.getElementById('ci').value, co = document.getElementById('co').value;
    document.getElementById('mDates2').textContent = ci + ' → ' + co;
    document.getElementById('mRoomName2').textContent = selected.name;
    updateModalSummaries();
    openModal('guest');
  });

  document.getElementById('confirm').addEventListener('click', async function () {
    var firstEl = document.getElementById('gFirst'), lastEl = document.getElementById('gLast'), emailEl = document.getElementById('gEmail'), phoneEl = document.getElementById('gPhone');
    var first = firstEl && firstEl.value ? firstEl.value.trim() : '';
    var last  = lastEl  && lastEl.value  ? lastEl.value.trim()  : '';
    var email = emailEl && emailEl.value ? emailEl.value.trim() : '';
    if (!first || !last || !email) { alert('Please enter first name, last name, and email.'); return; }
    if (!selected || !selected.code) { alert('Please select a room first.'); return; }

    var discount = calculateDiscount();
    var finalTotal = Math.max(0, (selected.total || 0) + extrasTotal - discount);

    var payload = {
      checkIn: document.getElementById('ci').value,
      checkOut: document.getElementById('co').value,
      adults: Number((document.getElementById('ad') || {}).value || 2),
      nights: selected.nights || 0,
      roomTypeCode: selected.code,
      roomName: selected.name,
      roomSubtotal: selected.total || 0,
      extras: extras.filter(function (x) { return x.qty > 0; }).map(function (x) { return { code: x.code, name: x.name, price: x.price, qty: x.qty }; }),
      extrasTotal: extrasTotal,
      discountAmount: discount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      finalTotal: finalTotal,
      guest: { first: first, last: last, email: email, phone: phoneEl && phoneEl.value ? phoneEl.value.trim() : '' },
      currency: selected.currency || CURRENCY || 'GHS'
    };

    var btn = document.getElementById('confirm'); var old = btn.textContent;
    btn.disabled = true; btn.textContent = 'Confirming…';

    try {
      var res = await createReservation(payload);
      try {
        await fetch(SUPABASE_URL + '/functions/v1/send-booking-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + SUPABASE_ANON_KEY },
          body: JSON.stringify({ booking: {
            confirmation_code: res.confirmation_code,
            guest_first_name: first,
            guest_last_name: last,
            guest_email: email,
            guest_phone: phoneEl && phoneEl.value ? phoneEl.value.trim() : '',
            room_name: payload.roomName,
            check_in: payload.checkIn,
            check_out: payload.checkOut,
            nights: payload.nights,
            adults: payload.adults,
            room_subtotal: payload.roomSubtotal,
            extras_total: payload.extrasTotal,
            discount_amount: discount,
            coupon_code: payload.couponCode,
            total: finalTotal,
            currency: payload.currency
          }})
        });
      } catch (emailErr) {}

      closeModal('guest');
      document.getElementById('tCode').textContent = res.confirmation_code || '—';
      document.getElementById('tName').textContent = first + ' ' + last;
      document.getElementById('tDates').textContent = payload.checkIn + ' → ' + payload.checkOut;
      document.getElementById('tRoom').textContent = payload.roomName || '—';
      document.getElementById('tTotal').textContent = new Intl.NumberFormat('en-GB', { style: 'currency', currency: res.currency || payload.currency }).format(res.total || finalTotal);
      openModal('thanks');
    } catch (e) {
      alert('Error creating reservation: ' + e.message);
    } finally {
      btn.disabled = false; btn.textContent = old;
    }
  });

})();`

  const script = document.createElement('script')
  const blob = new Blob([code], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)
  script.src = url
  document.body.appendChild(script)

  return () => {
  script.remove()
  URL.revokeObjectURL(url)
  const rootDiv = document.getElementById('booking-search')
  if (rootDiv) rootDiv.innerHTML = ''
  ;['ovl','modal-results','modal-extras','modal-guest','modal-thanks'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.remove()
  })
}

  }, [])

  return <div id="booking-search" />
}
