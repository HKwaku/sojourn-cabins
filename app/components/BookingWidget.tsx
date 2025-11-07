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

  // IMPORTANT: keep <style> wrapper, but quote CSS safely with \`...\`
  root.innerHTML =
    '<style>' +
    \`
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

/* ---------- Theme ---------- */
:root{
  --bg:#ffffff; --panel:#ffffff; --text:#0f172a; --muted:#475569; --line:#e5e7eb;
  --brand:#0f172a; --brand-hover:#111827; --ok:#16a34a; --err:#dc2626;
  --radius:12px; --radius-lg:16px;
  --shadow:0 1px 4px rgba(0,0,0,.06),0 6px 18px rgba(0,0,0,.06);
  --shadow-lg:0 12px 28px rgba(0,0,0,.10);
  --surface:#f8fafc;
}

/* ---------- Base ---------- */
*{box-sizing:border-box;margin:0;padding:0;font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}
html,body{background:var(--bg);color:var(--text);overflow-x:hidden}

/* ---------- Container (no markup changes) ---------- */
.wrap{max-width:960px;margin:0 auto;padding:24px}
@media (max-width:640px){ .wrap{max-width:640px;padding:16px} }
.card{
  background:var(--panel);
  border:1px solid var(--line);
  border-radius:var(--radius-lg);
  box-shadow:var(--shadow);
  padding:24px;
}
@media (max-width:640px){ .card{padding:18px} }

/* ---------- Type ---------- */
h1{font-size:28px;line-height:1.15;font-weight:700;margin:0 0 6px;letter-spacing:-0.01em}
.sub{color:var(--muted);font-size:15px;line-height:1.6;margin:0 0 18px}

/* ---------- Grid (search row) ---------- */
.grid{display:grid;gap:16px;margin-bottom:16px;min-width:0}
@media (min-width:880px){ .grid.cols-4{grid-template-columns:1fr 1fr 0.8fr auto} }

/* ---------- Fields ---------- */
label{display:block;font-size:12px;color:#64748b;margin:0 0 8px;font-weight:600;letter-spacing:.03em}
input,select{
  width:100%;max-width:100%;min-width:0;
  padding:14px 14px;
  border:1px solid var(--line);
  border-radius:12px;
  background:#fff;
  color:var(--text);
  font-size:16px; /* prevents iOS zoom */
  line-height:1.3;
  transition:border-color .2s, box-shadow .2s;
}
input:hover,select:hover{border-color:#cbd5e1}
input:focus,select:focus{border-color:#94a3b8;box-shadow:0 0 0 3px rgba(148,163,184,.25);outline:none}

input[type="date"]{
  -webkit-appearance:none; appearance:none;
  width:100%; min-width:0; background-clip:padding-box;
  font-variant-numeric:tabular-nums;
}
@supports (-webkit-touch-callout:none){ input[type="date"]{ padding-right:42px } }

/* ---------- Inline layout ---------- */
.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.pill{
  display:inline-flex;gap:8px;align-items:center;
  padding:8px 12px;border-radius:999px;background:var(--surface);
  border:1px solid var(--line);color:#334155;font-weight:600;font-size:13px;
}

/* ---------- Buttons ---------- */
.btn{
  appearance:none;border:0;cursor:pointer;
  background:var(--brand);color:#fff;
  padding:12px 20px;border-radius:14px;
  font-weight:700;font-size:15px;letter-spacing:.02em;
  transition:transform .1s, box-shadow .2s, background .2s;
}
.btn:hover:not(:disabled){background:var(--brand-hover);transform:translateY(-1px);box-shadow:0 6px 16px rgba(0,0,0,.12)}
.btn:disabled{opacity:.55;cursor:not-allowed}
.btn.secondary{
  background:#fff;color:#0f172a;border:1px solid var(--line);box-shadow:none
}
.btn.secondary:hover{background:#f8fafc}

/* ---------- Notices ---------- */
.notice{display:none;margin-top:14px;padding:12px 14px;border-radius:12px;font-size:14px}
.notice.err{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c}
.notice:not(.err){background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46}

/* ---------- Results grid ---------- */
.results{display:grid;gap:16px;margin-top:16px}
@media (min-width:880px){ .results{grid-template-columns:repeat(3,minmax(0,1fr))} }
@media (min-width:640px) and (max-width:879px){ .results{grid-template-columns:repeat(2,minmax(0,1fr))} }

/* ---------- Room card ---------- */
.room{
  border:1px solid var(--line);border-radius:16px;background:#fff;
  overflow:hidden;display:flex;flex-direction:column;
  transition:transform .15s, box-shadow .2s, border-color .2s; box-shadow:var(--shadow);
}
.room:hover{transform:translateY(-2px);border-color:#cbd5e1;box-shadow:var(--shadow-lg)}
.hero{width:100%;aspect-ratio:16/10;object-fit:cover;background:#f1f5f9}
.body{padding:16px;display:flex;flex-direction:column;gap:6px;flex:1}
.name{font-weight:700;font-size:17px}
.desc{color:#64748b;font-size:14px;line-height:1.5;min-height:2.6em}
.foot{display:flex;gap:12px;align-items:center;justify-content:space-between;margin-top:auto;padding-top:12px;border-top:1px solid var(--line)}
.price{font-weight:800;font-size:15px}
.price-breakdown{color:#64748b;font-size:12.5px}
.chip{display:inline-flex;min-width:44px;justify-content:center;padding:8px 12px;border:1px solid var(--line);border-radius:10px;background:#fff;font-weight:700}

/* ---------- Skeletons ---------- */
.skeleton{
  position:relative;overflow:hidden;border-radius:12px;height:140px;
  background:linear-gradient(90deg,#f1f5f9 0%,#e5e7eb 50%,#f1f5f9 100%);background-size:200% 100%;
  animation:shimmer 1.4s infinite;
}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* ---------- Summary panel ---------- */
.summary{
  margin-top:18px;border:1px solid var(--line);border-radius:16px;padding:16px;background:#fbfdff
}
.kv{display:flex;justify-content:space-between;gap:12px;padding:8px 0;align-items:center;font-size:15px}
.kv span{color:#64748b;font-weight:600}
.kv strong{font-weight:800}
.total{font-weight:900;font-size:18px;padding-top:10px;border-top:2px solid var(--line);margin-top:6px}

/* ---------- Overlay & modal ---------- */
.overlay{position:fixed;inset:0;display:none;background:rgba(15,23,42,.56);backdrop-filter:blur(6px);z-index:9998}
.modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:9999;padding:16px}
.sheet{
  width:100%;max-width:720px;max-height:92vh;background:#fff;border-radius:18px;border:1px solid var(--line);
  box-shadow:0 24px 60px rgba(0,0,0,.18);display:flex;flex-direction:column;overflow:hidden
}
.sheet header{
  padding:18px 20px;border-bottom:1px solid var(--line);
  font-weight:800;font-size:20px;letter-spacing:-0.01em;display:flex;justify-content:space-between;align-items:center
}
.sheet main{padding:18px 16px;overflow:auto;flex:1;background:#fff}
.sheet footer{padding:14px 16px;border-top:1px solid var(--line);display:flex;gap:10px;justify-content:space-between;background:#fff}
.x{
  background:transparent;border:0;font-size:26px;cursor:pointer;line-height:1;color:#64748b;
  width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s
}
.x:hover{color:#0f172a;background:#f1f5f9}

/* ---------- Qty controls ---------- */
.qty{display:inline-flex;gap:12px;align-items:center}
.qty button{width:36px;height:36px;border-radius:10px;border:1px solid var(--line);background:#fff;font-weight:800}
.qty input{width:48px;text-align:center}

/* ---------- Coupon row: prevent squish ---------- */
.coupon-input{display:flex;gap:12px;margin-top:10px;flex-wrap:wrap}
.coupon-input input{flex:1;min-width:200px}
.coupon-input .btn{padding:12px 18px}
@media (max-width:520px){
  .coupon-input{flex-direction:column}
  .coupon-input input{min-width:0}
  .coupon-input .btn{width:100%}
}

/* Applied coupon badge */
.applied-coupon{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  margin-top:10px;padding:10px 12px;border-radius:12px;background:#ecfdf5;border:1px solid #a7f3d0
}
.applied-coupon code{font-weight:900;color:#065f46;font-size:14px}
.remove-coupon{background:var(--err);color:#fff;border:0;padding:6px 12px;border-radius:8px;font-size:13px;font-weight:800}

/* ---------- Extras list: de-clutter ---------- */
#extras-list{display:grid;gap:12px}
#extras-list > *{
  border:1px solid var(--line);border-radius:16px;background:#fff;box-shadow:var(--shadow);
  padding:14px 12px
}
#extras-list .name{font-size:16px}
#extras-list .desc{font-size:13.5px}
#extras-list .price{font-size:14px}
#extras-list .qty{margin-left:auto}

/* ---------- Responsive tighten ---------- */
@media (max-width:380px){
  .wrap{padding-left:12px;padding-right:12px}
  input,select{padding:12px}
  .btn{padding:12px 16px}
}

/* Prevent horizontal scroll on very narrow screens */
#booking-search, .wrap, .card, .grid, .grid > div { min-width:0; }
html, body { overflow-x:hidden; }
    \` +
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
 // ---- existing style injector useEffect (kept) ----
  useEffect(() => {
    if (document.getElementById('booking-widget-light-styles')) return

    const style = document.createElement('style')
    style.id = 'booking-widget-light-styles'
    style.textContent = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

:root {
  --bg:#ffffff; --panel:#ffffff; --text:#0f172a; --muted:#64748b; --line:#e5e7eb;
  --brand:#000000; --brand-hover:#1f2937; --ok:#16a34a; --err:#dc2626;
  --radius:12px; --shadow:0 1px 4px rgba(0,0,0,.08),0 4px 10px rgba(0,0,0,.05);
  --shadow-lg:0 10px 25px rgba(0,0,0,.12);
  --success:#dcfce7; --success-border:#86efac; --success-text:#166534;
}

* { box-sizing:border-box; margin:0; padding:0; font-family:"Inter",sans-serif; }
body { background:var(--bg); color:var(--text); }

.wrap { max-width:1200px; margin:0 auto; padding:24px; }
.card { background:transparent; border:none; padding:0; }

h1 { margin-bottom:8px; font-size:32px; font-weight:600; color:var(--text); line-height:1.2; }
.sub { color:var(--muted); margin-bottom:24px; font-size:16px; line-height:1.5; }

.grid { display:grid; gap:20px; margin-bottom:24px; }
@media(min-width:860px){ .grid.cols-4{ grid-template-columns:1fr 1fr 0.8fr auto; } }

label { display:block; font-size:13px; color:var(--muted); margin-bottom:6px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; }

input, select {
  width:100%; max-width:100%; min-width:0;
  padding:14px 16px; border:1px solid var(--line); border-radius:10px;
  background:#f8fafc; color:var(--text);
  font-size:15px; transition:border-color .2s, box-shadow .2s;
}
input:hover, select:hover { border-color:#cbd5e1; }
input:focus, select:focus { border-color:var(--brand); box-shadow:0 0 0 3px rgba(0,0,0,.05); outline:none; }

/* fix iOS date input overflow */
input[type="date"] {
  -webkit-appearance:none; appearance:none;
  width:100%; min-width:0; font-variant-numeric:tabular-nums; background-clip:padding-box;
}
@supports (-webkit-touch-callout:none) {
  input[type="date"] { padding-right:44px; }
}

.row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
.pill {
  display:inline-flex; gap:8px; align-items:center;
  border:1px solid var(--line); background:#fff;
  padding:10px 16px; border-radius:999px; color:var(--text);
  font-size:14px; font-weight:500; white-space:nowrap;
}

.btn {
  border:0; background:var(--brand); color:#fff;
  padding:14px 22px; border-radius:10px; cursor:pointer;
  font-weight:600; font-size:14px; text-transform:uppercase;
  transition:transform .1s, background .2s, box-shadow .2s;
}
.btn:hover:not(:disabled){ background:var(--brand-hover); transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.12); }
.btn:disabled { opacity:.5; cursor:not-allowed; }
.btn.secondary { background:#f3f4f6; color:var(--text); border:1px solid var(--line); }
.btn.secondary:hover { background:#e5e7eb; border-color:#cbd5e1; }

.results { display:grid; gap:20px; margin-top:20px; }
@media(min-width:820px){ .results{ grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); } }

.room {
  border:1px solid var(--line); border-radius:12px; background:#fff;
  overflow:hidden; display:flex; flex-direction:column;
  transition:transform .15s ease, box-shadow .2s ease;
}
.room:hover { box-shadow:var(--shadow-lg); transform:translateY(-2px); border-color:#cbd5e1; }

.hero { width:100%; height:240px; object-fit:cover; background:#f3f4f6; }
.body { padding:20px; flex:1; display:flex; flex-direction:column; }
.name { font-weight:700; font-size:18px; margin-bottom:6px; }
.desc { color:var(--muted); font-size:14px; margin-bottom:14px; line-height:1.6; flex:1; }

.foot { display:flex; gap:12px; align-items:center; justify-content:space-between; flex-wrap:wrap;
  margin-top:auto; padding-top:14px; border-top:1px solid var(--line); }
.price { font-weight:700; font-size:15px; }

.summary { margin-top:20px; border:1px solid var(--line); border-radius:12px; padding:16px; background:#fafafa; }
.kv { display:flex; justify-content:space-between; padding:8px 0; font-size:15px; }
.kv span { color:var(--muted); font-weight:500; }
.total { font-weight:800; font-size:18px; padding-top:10px; border-top:2px solid var(--line); margin-top:6px; }

@media(max-width:860px){
  .grid.cols-4 { grid-template-columns:1fr; }
  .row { flex-direction:column; align-items:stretch; }
  .pill { justify-content:center; }
  .btn { width:100%; }
  .foot { flex-direction:column; align-items:flex-start; }
}

/* prevent horizontal scroll */
#booking-search, .wrap, .card, .grid, .grid > div { min-width:0; }
html, body { overflow-x:hidden; }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  return <div id="booking-search" />
}
