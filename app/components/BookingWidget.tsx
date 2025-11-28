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
    --bg:#f3f4f6;
    --panel:#ffffff;
    --surface:#f9fafb;
    --panel-elevated:#ffffff;
    --text:#111827;
    --muted:#6b7280;
    --line:#e5e7eb;
    --brand:#f97316;
    --brand-soft:rgba(249,115,22,.08);
    --brand-hover:#ea580c;
    --ok:#16a34a;
    --err:#ef4444;
    --radius:14px;
    --radius-lg:18px;
    --shadow:0 18px 45px rgba(15,23,42,.12);
    --shadow-soft:0 10px 30px rgba(15,23,42,.08);
  }

  /* ---------- Base ---------- */
  *{
    box-sizing:border-box;
    margin:0;
    padding:0;
    font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  }
  html,body{
    background:radial-gradient(circle at top,#ffffff 0,#f9fafb 45%,#eef2ff 100%);
    color:var(--text);
    overflow-x:hidden;
  }

  /* ---------- Container ---------- */
  .wrap{
    max-width:960px;
    margin:0 auto;
    padding:40px 20px;
  }
  @media (max-width:640px){
    .wrap{
      padding:12px;
      margin:0;
    }
  }

  .card{
    background:linear-gradient(145deg,#ffffff, #f9fafb);
    border-radius:24px;
    border:1px solid rgba(148,163,184,.35);
    box-shadow:var(--shadow);
    padding:22px 22px 20px;
    position:relative;
    overflow:hidden;
  }
  .card::before{
    content:"";
    position:absolute;
    inset:-40%;
    background:
      radial-gradient(circle at 0 0,rgba(249,115,22,.10) 0,transparent 55%),
      radial-gradient(circle at 90% 120%,rgba(59,130,246,.12) 0,transparent 55%);
    opacity:0.7;
    pointer-events:none;
  }
  .card > *{
    position:relative;
    z-index:1;
  }
  @media (max-width:640px){
    .card{
      padding:18px 16px 18px;
      border-radius:20px;
    }
  }

  /* ---------- Typography ---------- */
  h1{
    font-size:26px;
    line-height:1.15;
    font-weight:700;
    margin:0 0 4px;
    letter-spacing:-0.03em;
  }
  .sub{
    color:var(--muted);
    font-size:14px;
    line-height:1.6;
    margin:0 0 16px;
  }

  /* ---------- Grid (search row) ---------- */
  .grid{
    display:grid;
    gap:14px;
    margin-bottom:14px;
    min-width:0;
  }
  @media (min-width:880px){
    .grid.cols-3{grid-template-columns:1.2fr 1.2fr .9fr;}
  }
  @media (min-width:880px){
    .grid.cols-4{grid-template-columns:1.2fr 1.2fr .9fr auto;}
  }

  /* ---------- Labels & Inputs ---------- */
  label{
    display:block;
    font-size:11px;
    text-transform:uppercase;
    letter-spacing:.12em;
    color:#6b7280;
    margin:0 0 8px;
    font-weight:600;
  }

  input,select{
    width:100%;
    max-width:100%;
    min-width:0;
    padding:11px 12px 11px;
    border-radius:12px;
    border:1px solid rgba(148,163,184,.7);
    background:#ffffff;
    color:var(--text);
    font-size:16px;
    line-height:1.3;
    transition:border-color .18s ease, box-shadow .18s ease, background .18s ease, transform .08s ease;
  }
  input:hover,select:hover{
    border-color:#94a3b8;
    background:#f9fafb;
  }
  input:focus,select:focus{
    border-color:var(--brand);
    box-shadow:0 0 0 1px rgba(249,115,22,.8),0 0 0 6px rgba(249,115,22,.18);
    outline:none;
    transform:translateY(-0.5px);
  }
  input::placeholder{color:#9ca3af;}

  input[type="date"]{
    -webkit-appearance:none;
    appearance:none;
    width:100%;
    min-width:0;
    font-variant-numeric:tabular-nums;
    background-clip:padding-box;
  }
  @supports (-webkit-touch-callout:none){
    input[type="date"]{padding-right:40px;}
  }

  /* ---------- Inline layout ---------- */
  .row{
    display:flex;
    gap:10px;
    align-items:center;
    flex-wrap:wrap;
  }
  .pill{
    display:inline-flex;
    gap:8px;
    align-items:center;
    padding:7px 11px;
    border-radius:999px;
    background:rgba(248,250,252,1);
    border:1px solid rgba(148,163,184,.6);
    color:#111827;
    font-weight:500;
    font-size:12px;
  }
  .pill strong{font-weight:700;}

  /* ---------- Buttons ---------- */
  .btn{
    appearance:none;
    border:0;
    cursor:pointer;
    background:linear-gradient(135deg,var(--brand),#fb923c);
    color:#111827;
    padding:10px 18px;
    border-radius:999px;
    font-weight:700;
    font-size:14px;
    letter-spacing:.05em;
    text-transform:uppercase;
    box-shadow:0 14px 30px rgba(249,115,22,.35);
    transition:transform .12s ease, box-shadow .15s ease, filter .12s ease, background .12s ease;
  }
  .btn:hover:not(:disabled){
    filter:brightness(1.05);
    transform:translateY(-1px);
    box-shadow:0 18px 40px rgba(249,115,22,.4);
  }
  .btn:active:not(:disabled){
    transform:translateY(0);
    box-shadow:0 10px 22px rgba(249,115,22,.3);
  }
  .btn:disabled{
    opacity:.55;
    cursor:not-allowed;
    box-shadow:none;
  }

  .btn.secondary{
    background:#ffffff;
    color:#111827;
    border-radius:999px;
    border:1px solid rgba(148,163,184,.7);
    box-shadow:none;
    text-transform:none;
    letter-spacing:.02em;
    font-size:14px;
  }
  .btn.secondary:hover{
    background:#f3f4f6;
    box-shadow:0 10px 26px rgba(15,23,42,.12);
  }

  /* ---------- Notices ---------- */
  .notice{
    display:none;
    margin-top:14px;
    padding:11px 12px;
    border-radius:12px;
    font-size:13px;
    border:1px solid transparent;
    background:#f9fafb;
  }
  .notice.err{
    background:#fef2f2;
    border-color:#fecaca;
    color:#b91c1c;
  }
  .notice:not(.err){
    background:#ecfdf5;
    border-color:#bbf7d0;
    color:#166534;
  }

  /* ---------- Results grid ---------- */
  .results{
    display:grid;
    gap:14px;
    margin-top:14px;
    grid-template-columns:1fr;
  }

  /* ---------- Room card ---------- */
  .room{
    border-radius:18px;
    border:1px solid rgba(226,232,240,1);
    background:radial-gradient(circle at top,#ffffff,#f9fafb);
    overflow:hidden;
    display:flex;
    flex-direction:column;
    box-shadow:var(--shadow-soft);
    transition:transform .16s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
  }
  .room:hover{
    transform:translateY(-2px);
    box-shadow:0 24px 55px rgba(15,23,42,.14);
    border-color:rgba(249,115,22,.75);
    background:radial-gradient(circle at top,#ffffff,#fef3c7);
  }

  .hero{
    width:100%;
    aspect-ratio:16/10;
    object-fit:cover;
    background:#e5e7eb;
  }

  /* ---------- Room body ---------- */
  .body{
    padding:14px 15px 13px;
    display:flex;
    flex-direction:column;
    gap:6px;
    flex:1;
  }
  .name{
    font-weight:650;
    font-size:16px;
    letter-spacing:-0.01em;
  }
  .desc{
    color:#6b7280;
    font-size:13px;
    line-height:1.55;
    min-height:2.3em;
  }
  .foot{
    display:flex;
    gap:12px;
    align-items:center;
    justify-content:space-between;
    margin-top:auto;
    padding-top:11px;
    border-top:1px dashed rgba(203,213,225,1);
  }
  .room-select{
    display:inline-flex;
    align-items:center;
    gap:6px;
    font-size:13px;
    color:#111827;
  }
  .room-select input[type="checkbox"]{
    width:16px;
    height:16px;
    border-radius:6px;
  }
  @media (max-width:640px){
    .room-select input[type="checkbox"]{
      width:20px;
      height:20px;
      border-radius:7px;
    }
  }
  .price{
    font-weight:700;
    font-size:14px;
  }
  .price-breakdown{
    color:#6b7280;
    font-size:12px;
    margin-top:2px;
  }
  .chip{
    display:inline-flex;
    min-width:44px;
    justify-content:center;
    padding:6px 10px;
    border-radius:999px;
    border:1px solid rgba(203,213,225,1);
    background:#f9fafb;
    font-weight:700;
    font-size:12px;
  }

  /* ---------- Skeletons ---------- */
  .skeleton{
    position:relative;
    overflow:hidden;
    border-radius:14px;
    height:140px;
    background:linear-gradient(90deg,#e5e7eb 0%,#f3f4f6 50%,#e5e7eb 100%);
    background-size:200% 100%;
    animation:shimmer 1.4s infinite linear;
  }
  @keyframes shimmer{
    0%{background-position:200% 0;}
    100%{background-position:-200% 0;}
  }

  /* ---------- Summary panel ---------- */
  .summary{
    margin-top:16px;
    border-radius:18px;
    padding:14px 14px 12px;
    background:#f9fafb;
    border:1px solid rgba(226,232,240,1);
  }

  /* key/value rows */
    .kv{
    display:flex;
    align-items:flex-start;
    gap:12px;
    font-size:14px;
  }
  /* Field names (left) bold, with vertical divider */
  .kv span{
    color:#6b7280;
    font-weight:700;
    min-width:120px;
    padding-right:10px;
    border-right:1px solid #e5e7eb;
  }
  /* Values (right) normal weight, aligned left */
  .kv strong{
    font-weight:400;
    padding-left:10px;
  }

  /* No italics anywhere */
  .kv.extras span,
  .kv.extras strong{
    font-style:normal;
  }

  /* discount rows */
  .kv.discount{
    background:#ecfdf5;
    border-radius:12px;
    padding:9px 11px;
    margin-top:4px;
    border-top:1px dashed #6ee7b7;
  }
  .kv.discount span,
  .kv.discount strong{
    color:#166534;
  }

  /* total row */
  .total{
    font-weight:800;
    font-size:16px;
    padding-top:10px;
    margin-top:8px;
    border-top:2px solid rgba(209,213,219,1);
  }

  /* ---------- Overlay & modal ---------- */
  .overlay{
    position:fixed;
    inset:0;
    display:none;
    background:rgba(15,23,42,.25);
    backdrop-filter:blur(8px);
    z-index:9998;
  }

  .modal{
    position:fixed;
    inset:0;
    display:none;
    align-items:center;
    justify-content:center;
    z-index:9999;
    padding:16px;
  }

  .sheet{
    width:100%;
    max-width:720px;
    max-height:92vh;
    background:#ffffff;
    border-radius:22px;
    border:1px solid rgba(226,232,240,1);
    box-shadow:0 26px 70px rgba(15,23,42,.25);
    display:flex;
    flex-direction:column;
    overflow:hidden;
    overflow-x:hidden;
  }

  .sheet header{
    padding:16px 18px;
    border-bottom:1px solid rgba(226,232,240,1);
    font-weight:700;
    font-size:18px;
    letter-spacing:-0.02em;
    display:flex;
    justify-content:space-between;
    align-items:center;
  }
  .sheet main{
    padding:16px 14px 14px;
    overflow:auto;
    flex:1;
  }
  .sheet footer{
    padding:12px 14px;
    border-top:1px solid rgba(226,232,240,1);
    display:flex;
    gap:10px;
    justify-content:space-between;
    background:#f9fafb;
  }

  /* close button */
  .x{
    background:transparent;
    border:0;
    font-size:22px;
    cursor:pointer;
    line-height:1;
    color:#9ca3af;
    width:34px;
    height:34px;
    border-radius:999px;
    display:flex;
    align-items:center;
    justify-content:center;
    transition:background .15s ease,color .15s ease,transform .1s ease;
  }
  .x:hover{
    color:#111827;
    background:#e5e7eb;
    transform:translateY(-0.5px);
  }

  /* ---------- Qty controls ---------- */
  .qty{
    display:inline-flex;
    gap:10px;
    align-items:center;
  }
  .qty button{
    width:34px;
    height:34px;
    border-radius:999px;
    border:1px solid rgba(209,213,219,1);
    background:#ffffff;
    font-weight:700;
    color:#374151;
  }
  @media (max-width:640px){
    .qty button{
      width:40px;
      height:40px;
      font-size:16px;
    }
  }

  /* ---------- Coupon row ---------- */
  .coupon-input{
    display:flex;
    gap:10px;
    margin-top:9px;
    flex-wrap:wrap;
  }
  .coupon-input input{
    flex:1;
    min-width:200px;
  }
  .coupon-input .btn{
    padding-inline:16px;
  }
  @media (max-width:520px){
    .coupon-input{flex-direction:column;}
    .coupon-input input{min-width:0;}
    .coupon-input .btn{width:100%;}
  }

  /* Applied coupon badge */
  .applied-coupon{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    margin-top:9px;
    padding:9px 11px;
    border-radius:12px;
    background:#ecfdf5;
    border:1px solid #6ee7b7;
  }
  .applied-coupon code{
    font-weight:800;
    color:#065f46;
    font-size:13px;
  }
  .remove-coupon{
    background:#ef4444;
    color:#fff;
    border:0;
    padding:5px 10px;
    border-radius:999px;
    font-size:12px;
    font-weight:700;
  }

  /* ---------- Extras list ---------- */
  #extras-list{
    display:grid;
    gap:12px;
  }
  #extras-list > *{
    border:1px solid rgba(226,232,240,1);
    border-radius:16px;
    background:#ffffff;
    box-shadow:var(--shadow-soft);
    padding:12px 13px;
  }
  #extras-list .name{font-size:15px;}
  #extras-list .desc{font-size:13px;color:#6b7280;}
  #extras-list .price{font-size:13px;}
  #extras-list .qty{margin-left:auto;}

  /* ---------- Responsive tighten ---------- */
  @media (max-width:640px){
    input,select,textarea{
      font-size:16px;
    }
    .btn{
      padding:12px 18px;
      font-size:13px;
      min-height:44px;
    }
    .btn.secondary{
      min-height:44px;
    }
  }
  @media (max-width:380px){
    .wrap{padding-left:10px;padding-right:10px;}
    input,select{padding:10px 11px;}
    .btn{padding:10px 15px;}
  }

  /* Prevent horizontal scroll and zoom on mobile */
  #booking-search, .wrap, .card, .grid, .grid > div { min-width:0; max-width:100%; }
  html, body { overflow-x:hidden; }
  * { box-sizing:border-box; }
  input, select, textarea { max-width:100%; }

    \` +
    '</style>' +

    '<div class="wrap"><div class="card">' +
    '<h1>Choose your cabin</h1><p class="sub">Pick your dates to see available cabins and prices.</p>' +
    '<div class="grid cols-3">' +
      '<div><label>Check-in</label><input id="ci" type="date"></div>' +
      '<div><label>Check-out</label><input id="co" type="date"></div>' +
      '<div><label>Adults</label><select id="ad"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select></div>' +
    '</div>' +
    '<div class="row" style="align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:16px">' +
      '<div class="row" style="gap:10px">' +
        '<span class="pill">Total: <strong id="nn">—</strong> night<span id="nn-s">s</span></span>' +
        '<span class="pill" id="weekend-pill" style="display:none"><strong id="wd">0</strong> weekday • <strong id="we">0</strong> weekend</span>' +
      '</div>' +
      '<button id="load" class="btn">See available cabins</button>' +
    '</div>' +

    '<div class="summary">' +
      '<div class="kv"><span>Nights</span><strong id="sN">0</strong></div>' +
      '<div class="kv"><span>Room subtotal</span><strong id="sRoom">—</strong></div>' +
        '<div class="kv extras"><span>Extras</span><strong id="sExtras">£0.00</strong></div>' +
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
            '<footer>' +
        '<button class="btn secondary" data-close="results">Close</button>' +
        '<button class="btn" id="results-continue">Continue</button>' +
      '</footer>' +
    '</div></div>' +

    '<div id="modal-extras" class="modal" aria-hidden="true"><div class="sheet">' +
      '<header><div>Choose extras</div><button class="x" data-close="extras">×</button></header>' +
      '<main><div id="extras-list"></div>' +
        '<div class="summary" style="margin-top:16px">' +
          '<div class="kv"><span>Nights</span><strong id="mN1">0</strong></div>' +
          '<div class="kv"><span>Room subtotal</span><strong id="mRoom1">—</strong></div>' +
          '<div class="kv extras"><span>Extras</span><strong id="mExtras1">£0.00</strong></div>' +
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
          '<div class="kv extras"><span>Extras</span><strong id="mExtras2">£0.00</strong></div>' +
          '<div class="kv discount" id="mDiscountRow2" style="display:none"><span>Discount</span><strong id="mDiscount2">−£0.00</strong></div>' +
          '<div class="kv total"><span>Total to pay</span><strong id="mTotal2">—</strong></div>' +
        '</div>' +
      '</main>' +
      '<footer><button class="btn secondary" data-back="guest">Back</button><button class="btn" id="confirm">Confirm booking</button></footer>' +
    '</div></div>' +

    '<div id="modal-thanks" class="modal" aria-hidden="true"><div class="sheet">' +
      '<header><div>Booking confirmed! 🎉</div><button class="x" data-close="thanks">×</button></header>' +
      '<main>' +
                '<p style="margin:0 0 8px">Thank you! Your reservation is confirmed.</p>' +
          '<div class="summary summary-confirm" style="margin-top:8px">' +
          // Booking details section
          '<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:8px">' +
            '<div style="font-size:13px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:.08em;margin-bottom:4px">Booking details</div>' +
            '<div class="kv"><span class="label">Confirmation code:</span><span class="divider"></span><span class="value" id="tCode">—</span></div>' +
            '<div class="kv"><span class="label">Guest:</span><span class="divider"></span><span class="value" id="tName">—</span></div>' +
            '<div class="kv"><span class="label">Dates:</span><span class="divider"></span><span class="value" id="tDates">—</span></div>' +
            '<div class="kv"><span class="label">Room:</span><span class="divider"></span><span class="value" id="tRoom">—</span></div>' +
          '</div>' +
          // Divider
          '<div style="border-top:1px solid var(--line);margin:4px 0 10px"></div>' +
          // Payment summary section
          '<div style="font-size:13px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:.08em;margin-bottom:4px">Payment summary</div>' +
          '<div class="kv"><span class="label">Room subtotal:</span><span class="divider"></span><span class="value" id="tRoomSub">—</span></div>' +
          '<div class="kv extras"><span class="label">Extras:</span><span class="divider"></span><span class="value" id="tExtras">—</span></div>' +
          '<div class="kv extras"><span class="label">Extras subtotal:</span><span class="divider"></span><span class="value" id="tExtrasSub">—</span></div>' +
          '<div class="kv discount"><span class="label">Discount:</span><span class="divider"></span><span class="value" id="tDisc">—</span></div>' +
          '<div class="kv total"><span class="label">Total paid:</span><span class="divider"></span><span class="value" id="tTotal">—</span></div>' +
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

  // Match admin: add N days to an ISO date
  function addDaysISO(isoDate, days) {
    var d = new Date(isoDate);
    if (isNaN(d)) return iso(new Date());
    d.setDate(d.getDate() + (Number(days) || 0));
    return iso(d);
  }

  // Match admin: nights = ceil((checkOut - checkIn) / 1 day), min 0
  function nights(a, b) {
    var A = new Date(a), B = new Date(b);
    if (isNaN(A) || isNaN(B) || B <= A) return 0;
    return Math.ceil((B - A) / 86400000);
  }

  // Calculate weekday and weekend nights breakdown
  function calculateWeekdayWeekend(checkIn, checkOut) {
    if (!checkIn || !checkOut) return { weekday: 0, weekend: 0 };
    var start = new Date(checkIn);
    var end = new Date(checkOut);
    if (isNaN(start) || isNaN(end) || end <= start) return { weekday: 0, weekend: 0 };
    
    var weekday = 0;
    var weekend = 0;
    var current = new Date(start);
    
    while (current < end) {
      var day = current.getDay();
      if (day === 5 || day === 6) { // Friday or Saturday
        weekend++;
      } else {
        weekday++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return { weekday: weekday, weekend: weekend };
  }

    function getRequiredCabinsForRoom(totalAdults, maxAdults) {
    var total = parseInt(totalAdults, 10) || 1;
    if (total <= 0) total = 1;

    var cap = parseInt(maxAdults, 10);
    // If capacity is missing/invalid, treat as 1 cabin
    if (!cap || cap <= 0) return 1;

    return Math.ceil(total / cap);
  }

  function showMsg(t, type) { var el = $('#msg'); el.className = 'notice' + (type === 'err' ? ' err' : ''); el.style.display = 'block'; el.textContent = t; }
  function hideMsg(){ var el = $('#msg'); el.style.display = 'none'; el.textContent = ''; }

  function setDefaults(){
    // Keep “start from tomorrow” for guests,
    // but use addDaysISO for consistency with admin logic
    var t = new Date();
    var ci = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + 1));
    var ciIso = iso(ci);
    var coIso = addDaysISO(ciIso, 2); // default 2 nights

    $('#ci').value = ciIso;
    $('#co').value = coIso;
    updateNightsDisplay();
  }

    function updateNightsDisplay() {
    var nn = nights($('#ci').value, $('#co').value);

    // Match admin: never show less than 1 night when dates are set
    if (nn < 1 && $('#ci').value && $('#co').value) nn = 1;

    $('#nn').textContent = nn;
    $('#nn-s').textContent = nn === 1 ? '' : 's';
    $('#sN').textContent = nn;

    // Calculate and show weekday/weekend breakdown
    var breakdown = calculateWeekdayWeekend($('#ci').value, $('#co').value);
    if (breakdown.weekday > 0 || breakdown.weekend > 0) {
      $('#wd').textContent = String(breakdown.weekday);
      $('#we').textContent = String(breakdown.weekend);
      $('#weekend-pill').style.display = 'inline-flex';
    } else {
      $('#weekend-pill').style.display = 'none';
    }

    // Keep selected.nights in sync if a room is already chosen
    if (selected) selected.nights = nn;
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
  var selected = null;          // aggregated selection (summary)
  var selectedRooms = [];       // individual rooms/cabins selected via checkboxes
  var extras = [];
  var extrasTotal = 0;
  var appliedCoupon = null;
  var discountAmount = 0;


  function getCouponScopeLabel() {
    if (!appliedCoupon) return '';
    
    var scopeLabel;
    if (appliedCoupon.applies_to === 'both') {
      // Room + specific extras if configured
      var labels = [];
      
      if (Array.isArray(appliedCoupon.extra_ids) && appliedCoupon.extra_ids.length) {
        labels = appliedCoupon.extra_ids
          .map(function(id) {
            var extra = extras.find(function(e) { return String(e.id) === String(id); });
            return extra ? extra.name : null;
          })
          .filter(function(name) { return name !== null; });
      }
      
      if (labels.length === 0) {
        scopeLabel = 'Room and Extras';
      } else if (labels.length === 1) {
        scopeLabel = 'Room and ' + labels[0];
      } else if (labels.length === 2) {
        scopeLabel = 'Room and ' + labels[0] + ' and ' + labels[1];
      } else {
        scopeLabel = 'Room and ' + labels.slice(0, 2).join(', ') + ' and others';
      }
    } else if (appliedCoupon.applies_to === 'rooms') {
      scopeLabel = 'Room Only';
    } else if (appliedCoupon.applies_to === 'extras') {
      var labels = [];
      
      if (Array.isArray(appliedCoupon.extra_ids) && appliedCoupon.extra_ids.length) {
        labels = appliedCoupon.extra_ids
          .map(function(id) {
            var extra = extras.find(function(e) { return String(e.id) === String(id); });
            return extra ? extra.name : null;
          })
          .filter(function(name) { return name !== null; });
      }
      
      if (labels.length === 0) {
        scopeLabel = 'Extras';
      } else if (labels.length === 1) {
        scopeLabel = labels[0];
      } else if (labels.length === 2) {
        scopeLabel = labels[0] + ' and ' + labels[1];
      } else {
        scopeLabel = labels.slice(0, 2).join(', ') + ' and others';
      }
    } else {
      scopeLabel = appliedCoupon.applies_to || '';
    }
    
    return scopeLabel;
  }

  function calculateDiscount() {
    if (!appliedCoupon || !selected) { discountAmount = 0; return 0; }
    var subtotal = selected.total + extrasTotal;
    if (appliedCoupon.min_booking_amount && subtotal < appliedCoupon.min_booking_amount) return 0;
    
    // Calculate total only for extras that this coupon targets (if defined)
    var extrasTargetTotal = extrasTotal;
    if (
      appliedCoupon &&
      Array.isArray(appliedCoupon.extra_ids) &&
      appliedCoupon.extra_ids.length
    ) {
      var idSet = new Set(appliedCoupon.extra_ids.map(String));
      extrasTargetTotal = extras
        .filter(function(e) { return e.qty > 0 && idSet.has(String(e.id)); })
        .reduce(function(sum, e) { return sum + (e.price * e.qty); }, 0);
    }
    
    var discount = 0;
    if (appliedCoupon.applies_to === 'both') {
      // Room + only the targeted extras (if any are configured)
      var base;
      if (
        Array.isArray(appliedCoupon.extra_ids) &&
        appliedCoupon.extra_ids.length
      ) {
        base = selected.total + extrasTargetTotal;
      } else {
        base = selected.total + extrasTotal;
      }
      discount = appliedCoupon.discount_type === 'percentage' ? (base * appliedCoupon.discount_value / 100) : appliedCoupon.discount_value;
    } else if (appliedCoupon.applies_to === 'rooms') {
      discount = appliedCoupon.discount_type === 'percentage' ? (selected.total * appliedCoupon.discount_value / 100) : appliedCoupon.discount_value;
    } else if (appliedCoupon.applies_to === 'extras') {
      // Only targeted extras
      discount = appliedCoupon.discount_type === 'percentage' ? (extrasTargetTotal * appliedCoupon.discount_value / 100) : appliedCoupon.discount_value;
    }
    discount = Math.min(discount, subtotal);
    discountAmount = discount;
    return discount;
  }

    function getDiscountDescriptionForDisplay(curr) {
    if (!appliedCoupon) return '';

    var currency = curr || (selected && selected.currency) || CURRENCY || 'GHS';
    var scopeLabel = getCouponScopeLabel();
    var base = '';

    if (appliedCoupon.discount_type === 'percentage') {
      base = appliedCoupon.discount_value + '% off';
    } else if (appliedCoupon.discount_type === 'fixed_amount') {
      base = formatCurrency(appliedCoupon.discount_value, currency) + ' off';
    }

    if (scopeLabel) {
      base = base ? base + ' ' + scopeLabel : scopeLabel;
    }

    return base;
  }

    function updateSummary() {
    var curr = selected && selected.currency ? selected.currency : (CURRENCY || 'GHS');
    var roomTotal = selected && selected.total ? selected.total : 0;
    var discount = typeof calculateDiscount === 'function' ? calculateDiscount() : 0;
    var discountDescription = discount ? getDiscountDescriptionForDisplay(curr) : '';
    var finalTotal = Math.max(0, roomTotal + extrasTotal - discount);

    var sRoomEl   = $('#sRoom');
    var sExtrasEl = $('#sExtras');
    var sDiscEl   = $('#sDisc');
    var sTotalEl  = $('#sTotal');
    var sNEl      = $('#sN');

    // Per-room split: if multiple rooms selected, show each line
    if (sRoomEl) {
      if (Array.isArray(selectedRooms) && selectedRooms.length > 1) {
        var lines = selectedRooms.map(function (r) {
          var nm = r.name || r.code || 'Room';
          var amt = r.total || 0;
          var cur = r.currency || curr;
          return nm + ': ' + formatCurrency(amt, cur);
        });
        sRoomEl.innerHTML = lines.join('<br>');
      } else {
        sRoomEl.textContent = roomTotal ? formatCurrency(roomTotal, curr) : '—';
      }
    }

    if (sExtrasEl) {
      sExtrasEl.textContent = extrasTotal ? formatCurrency(extrasTotal, curr) : '—';
    }

    if (sDiscEl) {
      if (discount) {
        sDiscEl.textContent =
          '- ' + formatCurrency(discount, curr) +
          (discountDescription ? ' (' + discountDescription + ')' : '');
      } else {
        sDiscEl.textContent = '—';
      }
    }

    if (sTotalEl) {
      sTotalEl.textContent = roomTotal ? formatCurrency(finalTotal, curr) : '—';
    }

    if (sNEl) {
      sNEl.textContent = String(selected ? selected.nights : ($('#nn') ? $('#nn').textContent : '0'));
    }

       // Capacity check + messaging:
    var contBtn = document.getElementById('cont');
    if (contBtn) {
      var adultsVal = Number((document.getElementById('ad') || {}).value || 2);
      var enoughCapacity =
        !selected || typeof selected.capacity !== 'number'
          ? true
          : (selected.capacity >= adultsVal);

      // Only disable when *no* room is selected. For capacity issues,
      // keep enabled and let the click handler block + show alert.
      contBtn.disabled = !selected;

      // Show inline message about capacity vs allow-continue
      if (selected && !enoughCapacity) {
        showMsg(
          'Number of guests exceed the capacity of the cabin(s) you have selected, please select an additional cabin',
          'err'
        );
      } else if (selected) {
        showMsg((selected.name || 'Rooms') + ' selected. You can Continue.', 'ok');
      } else {
        hideMsg();
      }
    }
  }


        function updateModalSummaries() {
      if (!selected) return;
      var curr = selected.currency || CURRENCY;
      var discount = calculateDiscount();
      var discountDescription = discount ? getDiscountDescriptionForDisplay(curr) : '';
      var finalTotal = Math.max(0, selected.total + extrasTotal - discount);
      var scopeLabel = getCouponScopeLabel();

      // Modal 1 (Extras)
      $('#mN1').textContent = String(selected.nights || 0);

      var mRoom1El = $('#mRoom1');
      if (mRoom1El) {
        if (Array.isArray(selectedRooms) && selectedRooms.length > 1) {
          var lines1 = selectedRooms.map(function (r) {
            var nm = r.name || r.code || 'Room';
            var amt = r.total || 0;
            var cur = r.currency || curr;
            return nm + ': ' + formatCurrency(amt, cur);
          });
          mRoom1El.innerHTML = lines1.join('<br>');
        } else {
          mRoom1El.textContent = formatCurrency(selected.total, curr);
        }
      }

      $('#mExtras1').textContent = formatCurrency(extrasTotal, curr);

      // Modal 1 (Extras) – keep full description
      if (discount > 0) {
        $('#mDiscountRow1').style.display = 'flex';
        $('#mDiscountLabel1').textContent = discountDescription || 'Discount';
        $('#mDiscount1').textContent = '−' + formatCurrency(discount, curr);
      } else {
        $('#mDiscountRow1').style.display = 'none';
      }

      $('#mTotal1').textContent = formatCurrency(finalTotal, curr);

      // Modal 2 (Guest)
      $('#mN2').textContent = String(selected.nights || 0);

      var mRoom2El = $('#mRoom2');
      if (mRoom2El) {
        if (Array.isArray(selectedRooms) && selectedRooms.length > 1) {
          var lines2 = selectedRooms.map(function (r) {
            var nm2 = r.name || r.code || 'Room';
            var amt2 = r.total || 0;
            var cur2 = r.currency || curr;
            return nm2 + ': ' + formatCurrency(amt2, cur2);
          });
          mRoom2El.innerHTML = lines2.join('<br>');
        } else {
          mRoom2El.textContent = formatCurrency(selected.total, curr);
        }
      }

      $('#mExtras2').textContent = formatCurrency(extrasTotal, curr);

      // Modal 2 (Guest) – amount only, no extra description text
      var discRow2 = $('#mDiscountRow2');
      var discVal2 = $('#mDiscount2');
      if (discRow2 && discVal2) {
        if (discount > 0) {
          discRow2.style.display = 'flex';
          discVal2.textContent = '−' + formatCurrency(discount, curr);
        } else {
          discRow2.style.display = 'none';
        }
      }

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
      
      // Check if coupon targets specific extras, ensure at least one is selected
      if (
        (coupon.applies_to === 'extras' || coupon.applies_to === 'both') &&
        Array.isArray(coupon.extra_ids) &&
        coupon.extra_ids.length
      ) {
        var selectedIds = new Set(extras.filter(function(e) { return e.qty > 0; }).map(function(e) { return String(e.id); }));
        var anyMatch = coupon.extra_ids.some(function(id) { return selectedIds.has(String(id)); });
        if (!anyMatch) {
          return {
            valid: false,
            error: 'This coupon does not apply to the selected extras'
          };
        }
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
      
      var scopeLabel = getCouponScopeLabel();
      
      display.innerHTML =
        '<div class="applied-coupon">' +
          '<div><code>' + appliedCoupon.code + '</code> - ' + discountText + ' ' + scopeLabel + '</div>' +
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
    // Front-end now handles multiple cabins for larger groups.
    // The RPC only needs a per-cabin capacity check, so clamp to 2
    // (your current max_adults per room type). This prevents the RPC
    // from filtering everything out when adults > 2.
    var requested = parseInt(adults, 10);
    if (!requested || requested < 1) requested = 1;
    var perRoomAdults = Math.min(requested, 2);

    var rooms = await supabase.rpc('get_available_rooms', {
      p_check_in: checkIn,
      p_check_out: checkOut,
      p_adults: perRoomAdults
    });

    return rooms.map(function (room) {
      return {
        id: room.id,
        code: room.code,
        name: room.name,
        description: room.description,
        weekdayPrice: parseFloat(room.weekday_price),
        weekendPrice: parseFloat(room.weekend_price),
        totalPrice: parseFloat(room.total_price),
        weekdayNights: parseInt(room.weekday_nights, 10),
        weekendNights: parseInt(room.weekend_nights, 10),
        nights: parseInt(room.nights, 10),
        // dynamic max adults per room type from Supabase
        maxAdults: room.max_adults != null ? parseInt(room.max_adults, 10) : null,
        imageUrl: room.image_url,
        currency: room.currency || 'GHS'
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
        status: 'confirmed',
        // 👇 new fields for grouping multi-room bookings
        group_reservation_id: payload.groupReservationId || null,
        group_reservation_code: payload.groupReservationCode || null
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
  async function renderRooms(items, ci, co, adults) {
    var r = RESULTS_SEL(); r.innerHTML = '';
      if (!items || !items.length) {
      // Tell the guest there is no availability for the chosen dates
      showMsg('No cabins available for those dates.', 'err');

      // How many nights is this search for?
      var stayNights = nights(ci, co);
      if (stayNights <= 0) stayNights = 1;

      // Look ahead for the next date that *any* cabin is available
      var anyNext = null;
      var maxLookAhead = 90; // days to scan forward

      for (var offset = 1; offset <= maxLookAhead; offset++) {
        var nextCi = addDaysISO(ci, offset);
        var nextCo = addDaysISO(nextCi, stayNights);

        try {
          var nextRooms = await getAvailableRooms(nextCi, nextCo, adults);
          if (nextRooms && nextRooms.length) {
            anyNext = { ci: nextCi, co: nextCo };
            break;
          }
        } catch (e) {
          // If the lookup fails, stop trying so we don't loop forever
          break;
        }
      }

      var html = '<div class="notice err" style="display:block;text-align:left;line-height:1.6">';
      html += '<p><strong>No cabins are available for ' + ci + ' → ' + co + '.</strong></p>';

      if (anyNext) {
        html += '<p>The next available stay for any cabin is <strong>' +
          anyNext.ci + ' → ' + anyNext.co + '</strong>.</p>';
      } else {
        html += '<p>We couldn\u2019t find another available date in the next few months. ' +
          'Please try different dates.</p>';
      }

      html += '</div>';

      // Show this message inside the results modal instead of leaving it empty
      r.innerHTML = html;
      return;
    }

    if (items[0] && items[0].currency) { CURRENCY = items[0].currency; }
    hideMsg(); showMsg('Availability loaded — ' + items.length + ' option' + (items.length > 1 ? 's' : '') + '.', 'ok');

    // Total adults for this search
    var totalAdults = parseInt(adults, 10) || 1;
    if (totalAdults <= 0) totalAdults = 1;

    // Guests "need more than one room" if no room type alone can host them
    var needsMultipleRooms = items.every(function (it) {
      var cap = it.maxAdults != null ? parseInt(it.maxAdults, 10) : totalAdults;
      return totalAdults > cap;
    });

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
        
      // Per-cabin price for the full stay
      var totalForRoom = it.totalPrice;

      var card = document.createElement('div');
      card.className = 'room';
      card.innerHTML =
        '<img class="hero" src="' + img + '" alt="' + (it.name || '') + '" onerror="this.style.display=\\'none\\'">' +
        '<div class="body">' +
          '<div class="name">' + it.name + '</div>' +
          '<div class="desc">' + (it.description || 'Relax in a cozy cabin.') + '</div>' +
          '<div class="foot">' +
            '<div class="price">' +
              '<div>' +
                it.nights + ' night' + (it.nights > 1 ? 's' : '') +
                ' • <span class="chip">' + formatCurrency(totalForRoom, it.currency) + ' total</span>' +
              '</div>' +
              (priceBreakdown ? '<div class="price-breakdown">' + priceBreakdown + '</div>' : '') +
            '</div>' +
            '<label class="room-select">' +
              '<input type="checkbox" class="room-checkbox" ' +
                'data-id="' + it.id + '" data-code="' + it.code + '" data-name="' + it.name + '" data-img="' + img + '" ' +
                'data-total="' + totalForRoom + '" data-currency="' + it.currency + '" ' +
                'data-max-adults="' + (it.maxAdults != null ? it.maxAdults : '') + '" ' +
                'data-nights="' + it.nights + '">' +
              '<span>Select</span>' +
            '</label>' +
          '</div>' +
        '</div>';
      r.appendChild(card);
    });

        // ----- Preselect cabins based on number of adults -----
    (function preselectCabins() {
      var boxes = r.querySelectorAll('input.room-checkbox');
      if (!boxes || !boxes.length) return;

      var adultsVal = Number((document.getElementById('ad') || {}).value || 2);
      if (!adultsVal || adultsVal <= 0) return;

      // Build array of { cb, cap, price } for sorting
      var arr = Array.prototype.slice.call(boxes).map(function (cb) {
        var cap = parseInt(cb.getAttribute('data-max-adults') || '0', 10);
        if (!Number.isFinite(cap) || cap < 0) cap = 0;
        var price = parseFloat(cb.getAttribute('data-total') || '0');
        if (!Number.isFinite(price) || price < 0) price = 0;
        return { cb: cb, cap: cap, price: price };
      });

      // Sort by most expensive first
      arr.sort(function (a, b) {
        return b.price - a.price;
      });

      var remaining = adultsVal;
      arr.forEach(function (item) {
        if (remaining > 0 && item.cap > 0) {
          item.cb.checked = true;
          remaining -= item.cap;
        }
      });
    })();

    // ---- Sort so preselected rooms come to top ----
    (function sortPreselectedFirst() {
      var cards = Array.from(r.children);
      cards.sort(function (a, b) {
        var aChecked = a.querySelector('.room-checkbox')?.checked ? 1 : 0;
        var bChecked = b.querySelector('.room-checkbox')?.checked ? 1 : 0;
        return bChecked - aChecked; // checked first
      });
      cards.forEach(card => r.appendChild(card));
    })();


    // Recompute aggregate selection from checked checkboxes
    function recomputeSelectionFromCheckboxes() {
      var boxes = r.querySelectorAll('input.room-checkbox');
      selectedRooms = [];
      var totalRoom = 0;
      var totalCapacity = 0;
      var nameParts = [];
      var codes = [];
      var first = null;

      boxes.forEach(function (cb) {
        if (!cb.checked) return;
        if (!first) first = cb;

        var roomTotal = parseFloat(cb.getAttribute('data-total') || '0');
        var maxA = parseInt(cb.getAttribute('data-max-adults') || '0', 10);
        if (!Number.isFinite(maxA) || maxA < 0) maxA = 0;

        totalRoom += roomTotal;
        totalCapacity += maxA;

        var nm = cb.getAttribute('data-name') || '';
        if (nm) nameParts.push(nm);

        var code = cb.getAttribute('data-code');
        if (code) codes.push(code);

        selectedRooms.push({
          id: cb.getAttribute('data-id'),
          code: code,
          name: nm,
          total: roomTotal,
          maxAdults: maxA,
          currency: cb.getAttribute('data-currency') || CURRENCY,
          nights: parseInt(cb.getAttribute('data-nights') || '0', 10)
        });
      });

      if (!selectedRooms.length) {
        selected = null;
        updateSummary();
        return;
      }

      var curr = (first && (first.getAttribute('data-currency') || CURRENCY)) || CURRENCY;
      selected = {
        // For now, use the first room as the canonical room_type for the backend
        id: selectedRooms[0].id,
        code: selectedRooms[0].code,
        name: nameParts.join(' + '),             // e.g. "Cabin A + Cabin B"
        total: totalRoom,                        // combined room subtotal
        currency: curr,
        nights: nights(document.getElementById('ci').value, document.getElementById('co').value),
        capacity: totalCapacity                  // combined adult capacity across selected rooms
      };

      CURRENCY = curr;
      extras = [];
      extrasTotal = 0;
      appliedCoupon = null;
      discountAmount = 0;
      // updateSummary now handles both the capacity error
      // and the "Rooms selected. You can Continue." message.
      updateSummary();
    }

    // Attach checkbox listeners
    r.querySelectorAll('input.room-checkbox').forEach(function (cb) {
      cb.addEventListener('change', recomputeSelectionFromCheckboxes);
    });

    // Initial state (no rooms checked yet)
    recomputeSelectionFromCheckboxes();


        // Normal click behaviour:
    // - If they DON'T need multiple rooms: select + continue (old behaviour)
    // - If they DO need multiple rooms: select but STAY on results (no auto-jump to extras)
    r.querySelectorAll('button[data-code]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applySelectionFromButton(btn, !needsMultipleRooms);
      });
    });


    // If guests NEED more than one room (no single room can host them),
    // sort by most expensive total-for-party and auto-select that option.
    if (needsMultipleRooms) {
      var sorted = items.slice().sort(function (a, b) {
        var cabinsA = getRequiredCabinsForRoom(totalAdults, a.maxAdults);
        var cabinsB = getRequiredCabinsForRoom(totalAdults, b.maxAdults);
        var totalA = a.totalPrice * cabinsA;
        var totalB = b.totalPrice * cabinsB;
        return totalB - totalA; // most expensive first
      });

      if (sorted.length > 0) {
        var best = sorted[0];
        var bestBtn = r.querySelector('button[data-id="' + best.id + '"]');
        if (bestBtn) {
          // Auto-select but DO NOT auto-advance; user still sees options
          applySelectionFromButton(bestBtn, false);
        }
      }
    }

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
    // Always hide overlay when closing a modal - it will be shown again if another modal opens
    ovl.style.display = 'none';
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
    // "Continue" inside the Available cabins modal:
  // if a room is selected, close results and reuse the main Continue logic.
  var resultsContinueBtn = document.getElementById('results-continue');
  if (resultsContinueBtn) {
    resultsContinueBtn.addEventListener('click', function () {
      if (!selected) return; // nothing chosen yet
      closeModal('results');
      var c = document.getElementById('cont');
      if (c) c.click();
    });
  }

  // Close modal when clicking on overlay
  ovl.addEventListener('click', function() {
    if (modResults.style.display === 'flex') closeModal('results');
    else if (modExtras.style.display === 'flex') closeModal('extras');
    else if (modGuest.style.display === 'flex') closeModal('guest');
    else if (modThanks.style.display === 'flex') closeModal('thanks');
  });

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

    // Match admin: whenever check-in changes, set check-out = check-in + 1 day
  document.getElementById('ci').addEventListener('change', function () {
    var ci = document.getElementById('ci').value;
    if (ci) {
      document.getElementById('co').value = addDaysISO(ci, 1);
    }
    updateNightsDisplay();
  });

  // Just recompute nights when check-out changes (validation happens on "See cabins")
  document.getElementById('co').addEventListener('change', function () {
    updateNightsDisplay();
  });

  document.getElementById('load').addEventListener('click', async function () {
    var ci = document.getElementById('ci').value, co = document.getElementById('co').value;
    var adEl = document.getElementById('ad'); var ad = adEl && adEl.value ? adEl.value : 2;

    if (!ci || !co) { showMsg('Please choose both dates.', 'err'); return; }
    if (new Date(co) <= new Date(ci)) { showMsg('Check-out must be after check-in.', 'err'); return; }

    selected = null; extras = []; extrasTotal = 0; appliedCoupon = null; discountAmount = 0; updateSummary();
    openModal('results'); renderSkeletons();

    try {
      var rooms = await getAvailableRooms(ci, co, ad);
      await renderRooms(rooms, ci, co, ad);
    } catch (e) {
      showMsg('Error: ' + (e.message || "Couldn't load availability. Please try again."), 'err');
    }
  });

  document.getElementById('cont').addEventListener('click', async function () {
    if (!selected) return;
    // Capacity check: if guests exceed combined cabin capacity, block and show message
    var adultsVal = Number((document.getElementById('ad') || {}).value || 2);
    if (typeof selected.capacity === 'number' && selected.capacity < adultsVal) {
      alert('number of guests exceed  the capacity of the cabin (s) you have selected, please select an additional cabin');
      return;
    }
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
    var firstEl = document.getElementById('gFirst'),
        lastEl  = document.getElementById('gLast'),
        emailEl = document.getElementById('gEmail'),
        phoneEl = document.getElementById('gPhone');

    var first = firstEl && firstEl.value ? firstEl.value.trim() : '';
    var last  = lastEl  && lastEl.value  ? lastEl.value.trim()  : '';
    var email = emailEl && emailEl.value ? emailEl.value.trim() : '';

    if (!first || !last || !email) {
      alert('Please enter first name, last name, and email.');
      return;
    }
    if (!selected || !selected.code) {
      alert('Please select a room first.');
      return;
    }

    var discount = calculateDiscount();
    var finalTotal = Math.max(0, (selected.total || 0) + extrasTotal - discount);

    // Are there multiple rooms selected via checkboxes?
    var hasMultipleRooms = Array.isArray(selectedRooms) && selectedRooms.length > 1;
    
    // Track the full amount the guest is paying across all rooms
    var groupFinalTotal = 0;

    // Shared group fields for multi-room bookings
    var groupId = null;
    var groupCode = null;
    if (hasMultipleRooms) {
      if (window.crypto && window.crypto.randomUUID) {
        groupId = window.crypto.randomUUID();
      } else {
        groupId = 'grp_' + Math.random().toString(36).slice(2, 10);
      }
      groupCode = 'GRP-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    }

    // Base data shared across all reservations in this booking
    var checkInVal  = document.getElementById('ci').value;
    var checkOutVal = document.getElementById('co').value;
    var adultsVal   = Number((document.getElementById('ad') || {}).value || 2);
    var sharedGuest = {
      first: first,
      last: last,
      email: email,
      phone: phoneEl && phoneEl.value ? phoneEl.value.trim() : ''
    };
    var curr = selected.currency || CURRENCY || 'GHS';

    // Extras lines only once (we'll attach them to the first reservation)
    var extrasLines = extras
      .filter(function (x) { return x.qty > 0; })
      .map(function (x) {
        return { code: x.code, name: x.name, price: x.price, qty: x.qty };
      });

    // Determine which rooms to use:
    // - if checkboxes have been used: selectedRooms[]
    // - else: fall back to the single aggregated "selected" room
    var roomsForPayload = (Array.isArray(selectedRooms) && selectedRooms.length)
      ? selectedRooms
      : [{
          id: selected.id,
          code: selected.code,
          name: selected.name,
          total: selected.total || 0,
          currency: curr
        }];

    // --- Distribute adults across rooms (for multi-cabin bookings) ---
    // Fill one room up to its max adults, then move to the next, until no adults remain.
    var totalAdults = adultsVal;
    var adultsPerRoom = [];

    if (roomsForPayload.length > 1) {
      var remainingAdults = totalAdults;

      for (var i = 0; i < roomsForPayload.length; i++) {
        var room = roomsForPayload[i];

        // maxAdults is set when we build selectedRooms in renderRooms
        var maxA = typeof room.maxAdults === 'number'
          ? room.maxAdults
          : parseInt(room.maxAdults, 10);

        if (!Number.isFinite(maxA) || maxA <= 0) {
          // If we somehow have no capacity info, just put all remaining adults here
          adultsPerRoom.push(remainingAdults);
          remainingAdults = 0;
        } else {
          var assign = Math.min(remainingAdults, maxA);
          adultsPerRoom.push(assign);
          remainingAdults -= assign;
        }

        // If we've allocated everyone already, any remaining rooms get 0 adults
        if (remainingAdults <= 0 && i < roomsForPayload.length - 1) {
          for (var j = i + 1; j < roomsForPayload.length; j++) {
            adultsPerRoom.push(0);
          }
          break;
        }
      }

      // Safety: ensure array length matches roomsForPayload length
      while (adultsPerRoom.length < roomsForPayload.length) {
        adultsPerRoom.push(0);
      }
    } else {
      // Single-room booking: all adults stay on the one room
      adultsPerRoom = [totalAdults];
    }

    // Build one payload per room; first one carries extras + discount
    var roomPayloads = [];

    for (var i = 0; i < roomsForPayload.length; i++) {
      var room = roomsForPayload[i];
      var isPrimary = (i === 0);

      var roomExtrasTotal = isPrimary ? extrasTotal : 0;
      var roomDiscount    = isPrimary ? discount    : 0;
      var roomFinal       = Math.max(0, (room.total || 0) + roomExtrasTotal - roomDiscount);
      
      groupFinalTotal += roomFinal;   // 👈 accumulate full amount
      
      roomPayloads.push({
        checkIn: checkInVal,
        checkOut: checkOutVal,
        adults: adultsPerRoom[i],
        nights: selected.nights || 0,
        roomTypeCode: room.code,
        roomName: room.name,
        roomSubtotal: room.total || 0,
        extras: isPrimary ? extrasLines : [],
        extrasTotal: roomExtrasTotal,
        discountAmount: roomDiscount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        finalTotal: roomFinal,
        guest: sharedGuest,
        currency: curr,
        groupReservationId: groupId,
        groupReservationCode: groupCode
      });
    }

    var btn = document.getElementById('confirm');
    var old = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Confirming…';

    try {
      var primaryRes = null;
      var primaryPayload = null;

      // Create one reservation row per room payload
      for (var j = 0; j < roomPayloads.length; j++) {
        var p = roomPayloads[j];
        var res = await createReservation(p);
        if (j === 0) {
          primaryRes = res;
          primaryPayload = p;
        }
      }

        // Send booking email once, based on the primary reservation/payload
    if (primaryRes && primaryPayload) {
      try {
        // Build per-room data for the email
        function sumField(field) {
          return roomPayloads.reduce(function (sum, p) {
            var v = p[field];
            return sum + (v ? Number(v) : 0);
          }, 0);
        }

        var roomsForEmail = roomPayloads.map(function (p) {
          return {
            room_name: p.roomName,
            check_in: p.checkIn,
            check_out: p.checkOut,
            nights: p.nights,
            adults: p.adults,
            room_subtotal: p.roomSubtotal,
            extras: p.extras,
            extras_total: p.extrasTotal,
            discount_amount: p.discountAmount,
            coupon_code: p.couponCode,
            total: p.finalTotal,
            currency: p.currency
          };
        });

        var aggregateRoomSubtotal   = sumField('roomSubtotal');
        var aggregateExtrasSubtotal = sumField('extrasTotal');
        var aggregateDiscountTotal  = sumField('discountAmount');
        var aggregateTotal          = sumField('finalTotal');

        await fetch('/api/send-booking-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking: {
              // guest + primary reservation info
              confirmation_code: primaryRes.confirmation_code,
              guest_first_name: first,
              guest_last_name: last,
              guest_email: email,
              guest_phone: sharedGuest.phone,

              check_in: primaryPayload.checkIn,
              check_out: primaryPayload.checkOut,
              nights: primaryPayload.nights,
              adults: primaryPayload.adults,
              currency: primaryPayload.currency,

              // keep primary-room fields for backwards compatibility
              room_name: primaryPayload.roomName,
              room_subtotal: primaryPayload.roomSubtotal,
              extras_total: primaryPayload.extrasTotal,
              discount_amount: primaryPayload.discountAmount,
              coupon_code: primaryPayload.couponCode,
              coupon_description: appliedCoupon ? appliedCoupon.description : null,
              total: primaryPayload.finalTotal,

              // NEW: full group details
              is_group_booking: hasMultipleRooms,
              group_room_subtotal: aggregateRoomSubtotal,
              group_extras_total: aggregateExtrasSubtotal,
              group_discount_total: aggregateDiscountTotal,
              group_total: aggregateTotal,
              rooms: roomsForEmail
            }
          })
        });
      } catch (emailErr) {
        console.error('Failed to send booking email', emailErr);
      }
    }


            closeModal('guest');

      // Use the full group total for the thank-you page (even for single-room bookings)
      var thanksTotal = groupFinalTotal || finalTotal;
      var thanksCurrency = curr;

      var codeEl  = document.getElementById('tCode');
      var nameEl  = document.getElementById('tName');
      var datesEl = document.getElementById('tDates');
      var roomEl  = document.getElementById('tRoom');
      var roomSubEl = document.getElementById('tRoomSub');
      var extrasEl = document.getElementById('tExtras');
      var extrasSubEl = document.getElementById('tExtrasSub');
      var discEl  = document.getElementById('tDisc');
      var totalEl = document.getElementById('tTotal');


      if (codeEl) {
        var codeToShow = '—';
        if (hasMultipleRooms && groupCode) {
          // For group bookings, show the group booking code
          codeToShow = groupCode;
        } else if (primaryRes && primaryRes.confirmation_code) {
          // For single-room bookings, show the standard confirmation code
          codeToShow = primaryRes.confirmation_code;
        }
        codeEl.textContent = codeToShow;
      }

      if (nameEl)  nameEl.textContent  = first + ' ' + last;
      if (datesEl) datesEl.textContent = checkInVal + ' → ' + checkOutVal;

      // Per-room split on confirmation page
      if (roomEl) {
        if (Array.isArray(selectedRooms) && selectedRooms.length > 1) {
          var lines = selectedRooms.map(function (r) {
            var nm = r.name || r.code || 'Room';
            var amt = r.total || 0;
            var cur = r.currency || thanksCurrency;
            return nm + ': ' + formatCurrency(amt, cur);
          });
          roomEl.innerHTML = lines.join('<br>');
        } else {
          roomEl.textContent = selected.name || '—';
        }
      }

      // Room subtotal
      if (roomSubEl) {
        var roomSubtotal = selected && selected.total ? selected.total : 0;
        roomSubEl.textContent = formatCurrency(roomSubtotal, thanksCurrency);
      }

      // Extras lines with per-extra amount
      if (extrasEl) {
        if (Array.isArray(extrasLines) && extrasLines.length) {
          var extraLineStrings = extrasLines.map(function (x) {
            var label = (x.name || x.code || 'Extra').trim();
            var qty = x.qty || 0;
            var lineTotal = (x.price || 0) * (x.qty || 0);
            var qtyLabel = qty > 1 ? qty + '× ' : '';
            return qtyLabel + label + ': ' + formatCurrency(lineTotal, thanksCurrency);
          });
          extrasEl.innerHTML = extraLineStrings.join('<br>');
        } else {
          extrasEl.textContent = '—';
        }
      }

      // Extras subtotal
      if (extrasSubEl) {
        extrasSubEl.textContent = extrasTotal
          ? formatCurrency(extrasTotal, thanksCurrency)
          : '—';
      }

      // Discount amount + human description (from getCouponScopeLabel)
      if (discEl) {
        if (discount && discount > 0) {
          var fullDesc = typeof getDiscountDescriptionForDisplay === 'function'
            ? getDiscountDescriptionForDisplay(thanksCurrency)
            : '';

          discEl.textContent =
          '-' + formatCurrency(discount, thanksCurrency) +
          (fullDesc
            ? ' (' + (appliedCoupon && appliedCoupon.code ? appliedCoupon.code + ' – ' : '') + fullDesc + ')'
            : '');

        } else {
          discEl.textContent = '—';
        }
      }

      if (totalEl) {
        totalEl.textContent = new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: thanksCurrency
        }).format(thanksTotal);
      }


      openModal('thanks');

    } catch (e) {
      alert('Error creating reservation: ' + e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = old;
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
@media(min-width:860px){ .grid.cols-3{ grid-template-columns:1fr 1fr 0.8fr; } }
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

.results { display:grid; gap:20px; margin-top:20px; grid-template-columns:1fr; }

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

.summary {
  margin-top:20px;
  border:1px solid var(--line);
  border-radius:12px;
  padding:16px;
  background:#fafafa;
}

/* left-aligned key/value rows */
.kv{
  display:flex;
  justify-content:flex-start;
  align-items:flex-start;
  gap:8px;
  padding:8px 0;
  font-size:15px;
  text-align:left;
}

.kv span{
  color:#64748b;
  font-weight:600;
  min-width:140px;   /* fixed label width so values line up */
}


.kv strong{
  font-weight:400;   /* values regular */
}

/* extras rows – no italics */
.kv.extras span,
.kv.extras strong{
  font-style:normal;
}

/* discount rows: dark green + light green highlight + divider */
.kv.discount {
  background:#ecfdf5;
  border-radius:12px;
  padding:10px 12px;
  margin-top:6px;
  border-top:1px dashed #bbf7d0;
}
.kv.discount span,
.kv.discount strong {
  color:#166534;
}

/* total row separation */
.total {
  font-weight:800;
  font-size:18px;
  padding-top:12px;
  margin-top:10px;
  border-top:2px solid var(--line);
}


@media(max-width:860px){
  .grid.cols-4 { grid-template-columns:1fr; }
  .row { flex-direction:column; align-items:stretch; }
  .pill { justify-content:center; }
  .btn { width:100%; }
  .foot { flex-direction:column; align-items:flex-start; }
}

/* Booking confirmation summary: aligned columns, no bold */
.summary-confirm .kv{
  display:grid;
  grid-template-columns:150px 1px 1fr;
  align-items:flex-start;
  gap:10px;
}

.summary-confirm .kv .label{
  text-align:right;
  color:#6b7280;
  font-weight:400;
}

.summary-confirm .kv .divider{
  width:1px;
  background:var(--line);
}

.summary-confirm .kv .value{
  text-align:left;
  font-weight:400;
}

/* Remove bold from total row inside confirmation summary */
.summary-confirm .kv.total{
  font-weight:400;
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