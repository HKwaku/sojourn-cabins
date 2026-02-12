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

  try {
    ['https://api.paystack.co', 'https://checkout.paystack.com'].forEach(function(href){
      var l = document.createElement('link');
      l.rel = 'preconnect';
      l.href = href;
      l.crossOrigin = 'anonymous';
      document.head.appendChild(l);
    });
  } catch(e) {}


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
    overflow:visible;
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
      .card > .grid{
    z-index: 2; /* ensure date-picker (inside grid) sits above the summary */
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
    .grid.cols-3{grid-template-columns:1fr 1fr 1fr;}
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
    transition:border-color .18s ease, box-shadow .18s ease, background .18s ease;
  }
  input:hover,select:hover{
    border-color:#94a3b8;
    background:#f9fafb;
  }
  input:focus,select:focus{
    border-color:var(--brand);
    box-shadow:0 0 0 1px rgba(249,115,22,.8),0 0 0 6px rgba(249,115,22,.18);
    outline:none;
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
    .date-unavailable{
    text-decoration: line-through;
    color:#9ca3af;
    background:#fef2f2;
    border-color:#fecaca;
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
    -webkit-transform:translateZ(0);
    transform:translateZ(0);
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
    -webkit-overflow-scrolling:touch;
    -webkit-transform:translateZ(0);
    transform:translateZ(0);
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

    /* ---------- Payment loading ---------- */
  .pay-loading{
    position:fixed;
    inset:0;
    display:none;
    align-items:center;
    justify-content:center;
    background:rgba(15,23,42,.35);
    backdrop-filter:blur(10px);
    z-index:10050; /* above modals */
    padding:18px;
  }
  .pay-loading .box{
    width:min(520px, 92vw);
    background:#ffffff;
    border:1px solid rgba(226,232,240,1);
    border-radius:22px;
    box-shadow:0 26px 70px rgba(15,23,42,.25);
    padding:18px 18px 16px;
    display:flex;
    gap:14px;
    align-items:center;
  }
  .pay-loading .spinner{
    width:18px;
    height:18px;
    border-radius:999px;
    border:2px solid rgba(148,163,184,.5);
    border-top-color:var(--brand);
    animation:spin .8s linear infinite;
    flex-shrink:0;
  }
  @keyframes spin{to{transform:rotate(360deg);}}
  .pay-loading .title{
    font-weight:800;
    letter-spacing:-0.01em;
    margin-bottom:2px;
  }
  .pay-loading .hint{
    color:var(--muted);
    font-size:13px;
    line-height:1.45;
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
    gap:14px; /* match results spacing */
  }

  /* extras will render as .room cards now */
  #extras-list .extra-room{}

  /* keep these if you still want them scoped to extras */
  #extras-list .qty{margin-left:auto;}


  /* ---------- Experiences Carousel ---------- */
  .experiences-banner{
    display:flex;
    align-items:center;
    justify-content:space-between;
    background:linear-gradient(to right, #f97316, #fb923c);
    border-radius:16px;
    padding:16px;
    margin-bottom:16px;
    cursor:pointer;
    box-shadow:0 10px 25px rgba(249,115,22,0.3);
    transition:all 0.3s;
    border:0;
    width:100%;
  }
  .experiences-banner:hover{
    box-shadow:0 14px 35px rgba(249,115,22,0.4);
    transform:translateY(-2px);
  }
  .experiences-banner-content{
    display:flex;
    align-items:center;
    gap:12px;
  }
  .experiences-banner-icon{
    width:40px;
    height:40px;
    border-radius:50%;
    background:rgba(255,255,255,0.2);
    display:flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
  }
  .experiences-banner-text{
    text-align:left;
  }
  .experiences-banner-title{
    font-size:14px;
    font-weight:600;
    color:#fff;
    margin-bottom:2px;
  }
  .experiences-banner-subtitle{
    font-size:12px;
    color:rgba(255,255,255,0.9);
  }
  .experiences-banner-arrow{
    color:#fff;
    transition:transform 0.3s;
    flex-shrink:0;
  }
  .experiences-banner:hover .experiences-banner-arrow{
    transform:translateX(4px);
  }
  .experiences-carousel-modal{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.85);
    backdrop-filter:blur(8px);
    z-index:10000;
    display:none;
    align-items:center;
    justify-content:center;
    padding:20px;
  }
  .experiences-carousel-modal.active{
    display:flex;
  }
  .carousel-container{
    position:relative;
    width:100%;
    max-width:600px;
    background:#fff;
    border-radius:24px;
    overflow:hidden;
    box-shadow:0 25px 60px rgba(0,0,0,0.3);
  }
  .carousel-close{
    position:absolute;
    top:16px;
    right:16px;
    z-index:10;
    width:40px;
    height:40px;
    border-radius:50%;
    background:rgba(255,255,255,0.95);
    border:0;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    font-size:24px;
    color:#111827;
    box-shadow:0 4px 12px rgba(0,0,0,0.15);
  }
  .carousel-close:hover{
    background:#fff;
  }
  .carousel-track{
    display:flex;
    transition:transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .carousel-slide{
    min-width:100%;
    padding:40px 30px 30px;
  }
  .carousel-image{
    width:100%;
    height:250px;
    object-fit:cover;
    border-radius:16px;
    margin-bottom:20px;
  }
  .carousel-title{
    font-size:24px;
    font-weight:300;
    font-family:serif;
    margin-bottom:12px;
    color:#111827;
  }
  .carousel-description{
    font-size:15px;
    line-height:1.6;
    color:#6b7280;
    margin-bottom:16px;
  }
  .carousel-nav{
    display:flex;
    justify-content:space-between;
    padding:0 30px 30px;
  }
  .carousel-btn{
    width:44px;
    height:44px;
    border-radius:50%;
    border:2px solid #e5e7eb;
    background:#fff;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    transition:all 0.2s;
  }
  .carousel-btn:disabled{
    opacity:0.3;
    cursor:not-allowed;
  }
  .carousel-btn:not(:disabled):hover{
    border-color:#f97316;
    background:#fef3f2;
  }
  .carousel-indicators{
    display:flex;
    gap:8px;
    align-items:center;
  }
  .carousel-dot{
    width:8px;
    height:8px;
    border-radius:50%;
    background:#d1d5db;
    transition:all 0.2s;
  }
  .carousel-dot.active{
    width:24px;
    border-radius:4px;
    background:#f97316;
  }

  /* ---------- Terms Checkbox ---------- */
  .terms-checkbox-container{
    display:flex;
    align-items:start;
    gap:10px;
    margin:20px 0;
    padding:16px;
    background:#f9fafb;
    border-radius:12px;
    border:1px solid #e5e7eb;
  }
  .terms-checkbox{
    width:18px;
    height:18px;
    margin-top:2px;
    cursor:pointer;
    flex-shrink:0;
  }
  .terms-label{
    font-size:14px;
    line-height:1.5;
    color:#374151;
    cursor:pointer;
  }
  .terms-link{
    color:#f97316;
    text-decoration:underline;
    cursor:pointer;
  }
  .terms-link:hover{
    color:#ea580c;
  }

  /* ---------- Country Code Searchable Dropdown ---------- */
  .cc-select{
    position:relative;
  }
  .cc-selected{
    display:flex;
    align-items:center;
    gap:8px;
    padding:10px 14px;
    background:#fff;
    border:1px solid #d1d5db;
    border-radius:10px;
    font-size:14px;
    cursor:pointer;
    user-select:none;
    transition:border-color 0.2s;
    min-height:42px;
  }
  .cc-selected:hover{
    border-color:#9ca3af;
  }
  .cc-selected::after{
    content:'';
    margin-left:auto;
    border:5px solid transparent;
    border-top:5px solid #6b7280;
    flex-shrink:0;
  }
  .cc-dropdown{
    display:none;
    position:absolute;
    top:calc(100% + 4px);
    left:0;
    right:0;
    background:#fff;
    border:1px solid #d1d5db;
    border-radius:10px;
    box-shadow:0 10px 25px rgba(0,0,0,0.15);
    z-index:50;
    overflow:hidden;
  }
  .cc-dropdown.open{
    display:block;
  }
  .cc-search{
    width:100%;
    padding:10px 14px;
    border:none;
    border-bottom:1px solid #e5e7eb;
    font-size:14px;
    outline:none;
    box-sizing:border-box;
  }
  .cc-search::placeholder{
    color:#9ca3af;
  }
  .cc-list{
    max-height:220px;
    overflow-y:auto;
  }
  .cc-option{
    display:flex;
    align-items:center;
    gap:10px;
    padding:10px 14px;
    font-size:14px;
    cursor:pointer;
    transition:background 0.15s;
  }
  .cc-option:hover{
    background:#f3f4f6;
  }
  .cc-option.active{
    background:#fff7ed;
    font-weight:600;
  }
  .cc-flag{
    font-size:20px;
    line-height:1;
    flex-shrink:0;
  }
  .cc-name{
    flex:1;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .cc-code{
    color:#9ca3af;
    font-size:13px;
    flex-shrink:0;
  }
  .cc-no-results{
    padding:12px 14px;
    color:#9ca3af;
    font-size:13px;
    text-align:center;
  }

  .terms-modal{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.75);
    backdrop-filter:blur(4px);
    z-index:10001;
    display:none;
    align-items:center;
    justify-content:center;
    padding:20px;
    overflow-y:auto;
  }
  .terms-modal.active{
    display:flex;
  }
  .terms-content{
    position:relative;
    width:100%;
    max-width:900px;
    max-height:90vh;
    background:#fff;
    border-radius:24px;
    overflow:hidden;
    box-shadow:0 25px 60px rgba(0,0,0,0.3);
  }
  .terms-header{
    padding:24px 30px;
    border-bottom:1px solid #e5e7eb;
    display:flex;
    justify-content:space-between;
    align-items:center;
    background:#fff;
    position:sticky;
    top:0;
    z-index:10;
  }
  .terms-title{
    font-size:24px;
    font-weight:300;
    font-family:serif;
    color:#111827;
  }
  .terms-close{
    width:36px;
    height:36px;
    border-radius:50%;
    background:#f3f4f6;
    border:0;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    font-size:20px;
    color:#6b7280;
  }
  .terms-close:hover{
    background:#e5e7eb;
    color:#111827;
  }
  .terms-body{
    padding:30px;
    overflow-y:auto;
    max-height:calc(90vh - 88px);
  }

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

  /* Custom Date Picker Styles */
    .date-picker-wrapper {
    position: relative;
    width: 100%;
  }
  .date-picker-input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    background: white;
  }
  .date-picker-input:focus {
    outline: none;
    border-color: var(--brand);
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }
  .date-picker-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 999999 !important;
    display: none;
    padding: 16px;
    min-width: 380px;
  }

  .date-picker-dropdown.active {
    display: block;
    z-index: 9999999 !important;
  }
  
  /* Mobile: Make calendar more prominent */
  @media (max-width: 640px) {
    .date-picker-dropdown {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90vw;
      max-width: 400px;
      margin-top: 0;
      z-index: 99999999 !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }
  }

  .date-picker-dropdown.active {
    display: block;
  }
  .date-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .date-picker-nav {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 4px 8px;
    color: #374151;
  }
  .date-picker-nav:hover {
    color: var(--brand);
  }
  .date-picker-month {
    font-weight: 600;
    font-size: 14px;
    color: #111827;
  }
  .date-picker-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
  }
  .date-picker-weekday {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    padding: 4px;
  }
  .date-picker-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
  }
  .date-picker-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  height: 62px;
  font-size: 13px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  background: white;
  color: #111827;
  position: relative;

  /* ✅ prevent price text spilling outside the tile */
  overflow: hidden;
  min-width: 0;
}

  .date-number {
    font-size: 16px;
    font-weight: 600;
    line-height: 1;
  }
  .date-price {
  font-size: 9px;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
  line-height: 1.05;
  margin-top: 4px;

  /* ✅ allow 2-line wrap instead of squishing/clipping */
  white-space: normal;
  max-width: 100%;
  overflow: hidden;
  word-break: break-word;

  /* keep it visually centered and compact */
  display: block;
  padding: 0 2px;
}


  }
  .date-picker-day.disabled .date-price,
  .date-picker-day.empty .date-price {
    display: none;
  }
  .date-picker-day:hover:not(.disabled):not(.empty) {
    background: #f3f4f6;
  }
  .date-picker-day:hover:not(.disabled):not(.empty) .date-price {
    color: #111827;
  }
  .date-picker-day.selected {
    background: var(--brand);
    color: white;
  }
  .date-picker-day.selected .date-price {
    color: white;
  }
  .date-picker-day.in-range {
    background: rgba(249, 115, 22, 0.1);
  }
  .date-picker-day.disabled {
    color: #d1d5db;
    cursor: not-allowed;
    text-decoration: line-through;
    opacity: 0.5;
  }
  .date-picker-day.empty {
    cursor: default;
    visibility: hidden;
  }
  .date-picker-day.today {
    border: 2px solid var(--brand);
  }

    \` +
    '</style>' +

    '<div class="wrap"><div class="card">' +
    '<h1>Choose your cabin</h1><p class="sub"></p>' +
    '<div style="background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);border-left:4px solid #f59e0b;padding:12px 16px;border-radius:8px;margin:0 0 20px 0;display:flex;align-items:center;gap:12px;">' +
      '<svg style="width:20px;height:20px;color:#f59e0b;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>' +
      '</svg>' +
      '<span style="color:#92400e;font-size:14px;font-weight:500;">Select the number of guests to see availability in the calendar.</span>' +
    '</div>' +
    '<div class="grid cols-3">' +
      '<div><label>Adults</label><select id="ad"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select></div>' +
      '<div class="date-picker-wrapper">' +
        '<label>Check-in</label>' +
        '<input id="ci" type="text" readonly class="date-picker-input" placeholder="Select date">' +
        '<div id="ci-picker" class="date-picker-dropdown"></div>' +
      '</div>' +
      '<div class="date-picker-wrapper">' +
        '<label>Check-out</label>' +
        '<input id="co" type="text" readonly class="date-picker-input" placeholder="Select date">' +
        '<div id="co-picker" class="date-picker-dropdown"></div>' +
      '</div>' +
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
        '<div class="kv extras"><span>Experiences</span><strong id="sExtras">£0.00</strong></div>' +
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

    '<div id="pay-loading" class="pay-loading" aria-hidden="true">' +
      '<div class="box">' +
        '<div class="spinner"></div>' +
        '<div>' +
          '<div class="title">Redirecting to secure payment…</div>' +
          '<div class="hint">One moment — we’re preparing your checkout.</div>' +
        '</div>' +
      '</div>' +
    '</div>' +


    '<div id="modal-results" class="modal" aria-hidden="true"><div class="sheet">' +
      '<header><div>Available cabins</div><button class="x" data-close="results">×</button></header>' +
      '<main><div id="results-modal" class="results"></div></main>' +
            '<footer>' +
        '<button class="btn secondary" data-close="results">Close</button>' +
        '<button class="btn" id="results-continue">Continue</button>' +
      '</footer>' +
    '</div></div>' +

    '<div id="modal-extras" class="modal" aria-hidden="true"><div class="sheet">' +
      '<header><div>Choose Curated Experiences</div><button class="x" data-close="extras">×</button></header>' +
      '<main>' +
        '<button class="experiences-banner" id="view-experiences-link">' +
          '<div class="experiences-banner-content">' +
            '<div class="experiences-banner-icon">' +
              '<svg style="width:20px;height:20px;color:#fff" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>' +
              '</svg>' +
            '</div>' +
            '<div class="experiences-banner-text">' +
              '<div class="experiences-banner-title">View All Experiences</div>' +
              '<div class="experiences-banner-subtitle">Discover all our experiences</div>' +
            '</div>' +
          '</div>' +
          '<svg class="experiences-banner-arrow" style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>' +
          '</svg>' +
        '</button>' +
        '<div id="extras-list"></div>' +
        '<div class="summary" style="margin-top:16px">' +
          '<div class="kv"><span>Nights</span><strong id="mN1">0</strong></div>' +
          '<div class="kv"><span>Room subtotal</span><strong id="mRoom1">—</strong></div>' +
          '<div class="kv extras"><span>Experiences</span><strong id="mExtras1">£0.00</strong></div>' +
          '<div class="kv discount" id="mDiscountRow1" style="display:none"><span>Discount (<span id="mDiscountLabel1"></span>)</span><strong id="mDiscount1">−£0.00</strong></div>' +
          '<div class="kv total"><span>Estimated total</span><strong id="mTotal1">—</strong></div>' +
        '</div>' +
      '</main>' +
      '<footer><button class="btn secondary" data-back="extras">Back</button><button class="btn" id="to-guest">Continue</button></footer>' +
    '</div></div>' +

    '<div id="modal-guest" class="modal" aria-hidden="true"><div class="sheet">' +
      '<header><div>Guest details</div><button class="x" data-close="guest">×</button></header>' +
      '<main>' +
        '<button class="experiences-banner" id="view-experiences-link-guest">' +
          '<div class="experiences-banner-content">' +
            '<div class="experiences-banner-icon">' +
              '<svg style="width:20px;height:20px;color:#fff" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>' +
              '</svg>' +
            '</div>' +
            '<div class="experiences-banner-text">' +
              '<div class="experiences-banner-title">View All Experiences</div>' +
              '<div class="experiences-banner-subtitle">Discover what is included in your booking</div>' +
            '</div>' +
          '</div>' +
          '<svg class="experiences-banner-arrow" style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>' +
          '</svg>' +
        '</button>' +
        '<div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">' +
          '<div><label>First name *</label><input id="gFirst" placeholder="Jane" required></div>' +
          '<div><label>Last name *</label><input id="gLast" placeholder="Doe" required></div>' +
          '<div style="grid-column:span 2"><label>Email *</label><input id="gEmail" type="email" placeholder="jane@example.com" required></div>' +
          '<div><label>Country Code</label>' +
            '<div class="cc-select" id="ccSelect">' +
              '<div class="cc-selected" id="ccSelected">\uD83C\uDDEC\uD83C\uDDED Ghana (+233)</div>' +
              '<input type="hidden" id="gCountryCode" value="+233">' +
              '<div class="cc-dropdown" id="ccDropdown">' +
                '<input type="text" class="cc-search" id="ccSearch" placeholder="Search country...">' +
                '<div class="cc-list" id="ccList"></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div><label>Phone</label><input id="gPhone" placeholder="123456789"></div>' +
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
          '<div class="kv extras"><span>Experiences</span><strong id="mExtras2">£0.00</strong></div>' +
          '<div class="kv discount" id="mDiscountRow2" style="display:none"><span>Discount</span><strong id="mDiscount2">−£0.00</strong></div>' +
          '<div class="kv total"><span>Total to pay</span><strong id="mTotal2">—</strong></div>' +
        '</div>' +
        '<div class="terms-checkbox-container">' +
          '<input type="checkbox" id="terms-checkbox" class="terms-checkbox">' +
          '<label for="terms-checkbox" class="terms-label">' +
            'I have read and agree to the <span class="terms-link" id="open-terms">Terms and Conditions</span>' +
          '</label>' +
        '</div>' +
      '</main>' +
      '<footer><button class="btn secondary" data-back="guest">Back</button><button class="btn" id="confirm">Confirm booking</button></footer>' +
    '</div></div>' +

        // ====== REVIEW MODAL (NEW) ======
    '<div id="modal-review" class="modal" aria-hidden="true"><div class="sheet">' +
      '<header><div>Review your booking</div><button class="x" data-close="review">×</button></header>' +
      '<main>' +
        '<p style="margin:0 0 8px">Please confirm your details before continuing to payment.</p>' +

        // Center + constrain width like callback page
        '<div class="review-wrap">' +
          '<div class="summary summary-confirm" style="margin-top:8px">' +

            // BOOKING DETAILS
            '<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:8px">' +
              '<div style="font-size:13px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:.08em;margin-bottom:4px">Booking details</div>' +
              '<div class="kv"><span class="label">Guest:</span><span class="divider"></span><span class="value" id="rGuest">—</span></div>' +
              '<div class="kv"><span class="label">Email:</span><span class="divider"></span><span class="value" id="rEmail">—</span></div>' +
              '<div class="kv"><span class="label">Phone:</span><span class="divider"></span><span class="value" id="rPhone">—</span></div>' +
              '<div class="kv"><span class="label">Dates:</span><span class="divider"></span><span class="value" id="rDates">—</span></div>' +
              '<div class="kv"><span class="label">Room:</span><span class="divider"></span><span class="value" id="rRoom">—</span></div>' +
              '<div class="kv"><span class="label">Nights:</span><span class="divider"></span><span class="value" id="rNights">0</span></div>' +
              '<div class="kv"><span class="label">Guests:</span><span class="divider"></span><span class="value" id="rGuests">0</span></div>' +
            '</div>' +

            // Divider
            '<div style="border-top:1px solid var(--line);margin:4px 0 10px"></div>' +

            // EXPERIENCES
            '<div style="font-size:13px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:.08em;margin-bottom:4px">Experiences</div>' +
            '<div id="rExtrasList" class="review-items"></div>' +

            // Divider
            '<div style="border-top:1px solid var(--line);margin:10px 0 10px"></div>' +
            
            '<div class="kv extras"><span class="label">Experiences subtotal:</span><span class="divider"></span><span class="value" id="rExtrasSubtotal">—</span></div>' +

            // Divider
            '<div style="border-top:1px solid var(--line);margin:10px 0 10px"></div>' +

            // PAYMENT SUMMARY (match callback)
            '<div style="font-size:13px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:.08em;margin-bottom:4px">Payment summary</div>' +
            '<div class="kv"><span class="label">Room subtotal:</span><span class="divider"></span><span class="value" id="rRoomSubtotal">—</span></div>' +
            '<div class="kv extras"><span class="label">Experiences:</span><span class="divider"></span><span class="value" id="rExtras">—</span></div>' +
            '<div class="kv discount" id="rDiscountRow" style="display:none"><span class="label">Discount:</span><span class="divider"></span><span class="value" id="rDiscount">—</span></div>' +
            '<div class="kv total"><span class="label">Total to pay:</span><span class="divider"></span><span class="value" id="rTotal">—</span></div>' +

          '</div>' +
        '</div>' +
      '</main>' +
      '<footer><button class="btn secondary" id="review-back" data-back="review">Back</button><button class="btn" id="review-continue">Continue to payment</button></footer>' +
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
          '<div class="kv extras"><span class="label">Experiences:</span><span class="divider"></span><span class="value" id="tExtras">—</span></div>' +
          '<div class="kv extras"><span class="label">Experiences subtotal:</span><span class="divider"></span><span class="value" id="tExtrasSub">—</span></div>' +
          '<div class="kv discount"><span class="label">Discount:</span><span class="divider"></span><span class="value" id="tDisc">—</span></div>' +
          '<div class="kv total"><span class="label">Total paid:</span><span class="divider"></span><span class="value" id="tTotal">—</span></div>' +
        '</div>' +

        '<p class="sub" style="margin-top:10px">A confirmation email will be sent to you shortly.</p>' +
      '</main>' +
      '<footer><button class="btn" id="thanks-close">Close</button></footer>' +
    '</div></div>' +

    // Experiences Carousel Modal
    '<div id="experiences-carousel-modal" class="experiences-carousel-modal">' +
      '<div class="carousel-container">' +
        '<button class="carousel-close" id="close-experiences">×</button>' +
        '<div class="carousel-track" id="carousel-track"></div>' +
        '<div class="carousel-nav">' +
          '<button class="carousel-btn" id="carousel-prev">‹</button>' +
          '<div class="carousel-indicators" id="carousel-indicators"></div>' +
          '<button class="carousel-btn" id="carousel-next">›</button>' +
        '</div>' +
      '</div>' +
    '</div>' +

    // Terms and Conditions Modal
    '<div id="terms-modal" class="terms-modal">' +
      '<div class="terms-content">' +
        '<div class="terms-header">' +
          '<div class="terms-title">Terms & Conditions</div>' +
          '<button class="terms-close" id="close-terms">×</button>' +
        '</div>' +
        '<div class="terms-body" id="terms-body"></div>' +
      '</div>' +
    '</div>';

  // ====== HELPERS ======
  function $(s) { return document.querySelector(s); }
  function RESULTS_SEL() { return document.querySelector('#results-modal') || document.querySelector('#results'); }
    function formatCurrency(amount, curr) {
    if (!curr) curr = CURRENCY;
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: curr }).format(Number(amount || 0));
  }

  function showPayLoading() {
    var el = document.getElementById('pay-loading');
    if (el) { el.style.display = 'flex'; el.setAttribute('aria-hidden','false'); }
  }
  function hidePayLoading() {
    var el = document.getElementById('pay-loading');
    if (el) { el.style.display = 'none'; el.setAttribute('aria-hidden','true'); }
  }

  function iso(d) { 
    // Use local timezone instead of UTC to avoid date shifting
    var date = new Date(d);
    var yyyy = date.getFullYear();
    var mm = String(date.getMonth() + 1).padStart(2, '0');
    var dd = String(date.getDate()).padStart(2, '0');
    return yyyy + '-' + mm + '-' + dd;
  }

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

  // ✅ keep state in ISO
  selectedDates.ci = ciIso;
  selectedDates.co = coIso;

  // ✅ show UI as dd-MMM-yyyy
  var ciEl = document.getElementById('ci');
  var coEl = document.getElementById('co');
  if (ciEl) ciEl.value = formatDisplayDate(ciIso);
  if (coEl) coEl.value = formatDisplayDate(coIso);

  updateNightsDisplay();
}


    function updateNightsDisplay() {
    var ciVal = selectedDates.ci || '';
    var coVal = selectedDates.co || '';
    var nn = nights(ciVal, coVal);

    // Match admin: never show less than 1 night when dates are set
    if (nn < 1 && ciVal && coVal) nn = 1;

    $('#nn').textContent = nn;
    $('#nn-s').textContent = nn === 1 ? '' : 's';
    $('#sN').textContent = nn;

    // Calculate and show weekday/weekend breakdown
    var breakdown = calculateWeekdayWeekend(ciVal, coVal);
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

    // ====== CUSTOM DATE PICKER ======
  var disabledDates = [];
  var disabledDatesGeneration = 0;   // track latest async computation
  var currentPickerMonth = { ci: new Date(), co: new Date() };

  var selectedDates = { ci: null, co: null };
  var activePickerId = null;
  var calendarPrices = {}; // Store nightly prices: { 'YYYY-MM-DD': { price: 123.45, currency: 'GHS' } }
  var currentRoomTypeId = null; // Track currently selected room type for pricing

  function initDatePickers() {
    var ciInput = $('#ci');
    var coInput = $('#co');
    var ciPicker = $('#ci-picker');
    var coPicker = $('#co-picker');

    // Set default values
    var t = new Date();
    var ci = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + 1));
    var ciIso = iso(ci);
    var coIso = addDaysISO(ciIso, 2);
    
    selectedDates.ci = ciIso;
    selectedDates.co = coIso;
    ciInput.value = formatDisplayDate(ciIso);
    coInput.value = formatDisplayDate(coIso);

    ciInput.addEventListener('click', function(e) {
      e.stopPropagation();
      if (activePickerId === 'ci') {
        closeDatePicker();
      } else {
        openDatePicker('ci');
      }
    });

    coInput.addEventListener('click', function(e) {
      e.stopPropagation();
      if (activePickerId === 'co') {
        closeDatePicker();
      } else {
        openDatePicker('co');
      }
    });

    document.addEventListener('click', function(e) {
      var isClickInside = ciPicker.contains(e.target) || coPicker.contains(e.target) ||
                          ciInput.contains(e.target) || coInput.contains(e.target);
      if (!isClickInside && activePickerId) {
        closeDatePicker();
      }
    });
  }

  function formatDisplayDate(isoDate) {
    if (!isoDate) return '';
    var d = new Date(isoDate + 'T00:00:00');
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var dd = String(d.getDate()).padStart(2, '0');
    var mmm = months[d.getMonth()];
    var yyyy = d.getFullYear();
    return dd + '-' + mmm + '-' + yyyy;
  }


  async function openDatePicker(pickerId) {
    closeDatePicker();
    activePickerId = pickerId;
    var picker = $('#' + pickerId + '-picker');
    picker.classList.add('active');
    
    var baseDate = selectedDates[pickerId] ? new Date(selectedDates[pickerId] + 'T00:00:00') : new Date();
    currentPickerMonth[pickerId] = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    
    // Fetch pricing for current and next month if we have a room type
    if (currentRoomTypeId) {
      var month = currentPickerMonth[pickerId];
      await fetchCalendarPricing(month.getFullYear(), month.getMonth(), currentRoomTypeId);
      await fetchCalendarPricing(month.getFullYear(), month.getMonth() + 1, currentRoomTypeId);
    }
    
    renderCalendar(pickerId);
  }

  function closeDatePicker() {
    if (activePickerId) {
      var picker = $('#' + activePickerId + '-picker');
      picker.classList.remove('active');
      activePickerId = null;
    }
  }

  async function fetchCalendarPricing(year, month, roomTypeId) {
  // roomTypeId not used anymore; kept to avoid changing call sites
  try {
    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);
    var checkIn = iso(firstDay);
    var checkOut = iso(new Date(lastDay.getTime() + 86400000)); // +1 day

    // 1) Get all active room types (so prices always exist per day)
    var roomTypes = await supabase.query('room_types', {
      select: 'id,currency',
      eq: { is_active: true }
    });

    if (!roomTypes || !roomTypes.length) return;

    // 2) For each room type, fetch nightly rates and keep the MIN per date
    for (var r = 0; r < roomTypes.length; r++) {
      var rt = roomTypes[r];

      try {
        var pricingData = await supabase.rpc('calculate_dynamic_price', {
          p_room_type_id: rt.id,
          p_check_in: checkIn,
          p_check_out: checkOut,
          p_pricing_model_id: null
        });

        if (pricingData && pricingData.nightly_rates) {
          for (var i = 0; i < pricingData.nightly_rates.length; i++) {
            var night = pricingData.nightly_rates[i];
            var nightDate = night.date;
            var nightRate = parseFloat(night.rate || 0);
            var nightCurrency = night.currency || pricingData.currency || rt.currency || 'GHS';

            if (!calendarPrices[nightDate] || nightRate < calendarPrices[nightDate].price) {
              calendarPrices[nightDate] = { price: nightRate, currency: nightCurrency };
            }
          }
        }
      } catch (e) {
        // ignore per-room failures, keep going
      }
    }
  } catch (err) {
    console.warn('Failed to fetch calendar pricing:', err);
  }
}


  function renderCalendar(pickerId) {
    var picker = $('#' + pickerId + '-picker');
    var month = currentPickerMonth[pickerId];
    
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
    
    var html = '<div class="date-picker-header">' +
               '<button type="button" class="date-picker-nav" data-action="prev">‹</button>' +
               '<div class="date-picker-month">' + monthNames[month.getMonth()] + ' ' + month.getFullYear() + '</div>' +
               '<button type="button" class="date-picker-nav" data-action="next">›</button>' +
               '</div>';
    
    html += '<div class="date-picker-weekdays">';
    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(function(day) {
      html += '<div class="date-picker-weekday">' + day + '</div>';
    });
    html += '</div>';
    
    html += '<div class="date-picker-days">';
    
    var firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    var daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    
    // Empty cells before first day
    for (var i = 0; i < firstDay; i++) {
      html += '<button class="date-picker-day empty"></button>';
    }
    
    var today = iso(new Date());
    
    // Days of the month
    for (var day = 1; day <= daysInMonth; day++) {
      var dateObj = new Date(month.getFullYear(), month.getMonth(), day);
      var dateStr = iso(dateObj);
      var isDisabled = false;
      
      // Different blocking logic for check-in vs check-out
      if (pickerId === 'ci') {
        // For check-in: block if that specific date has no availability
        isDisabled = disabledDates.indexOf(dateStr) !== -1 || dateStr < today;
      } else if (pickerId === 'co') {
        // For check-out: block if date is before/equal to check-in, or if there's any blocked date in the interval
        if (!selectedDates.ci || dateStr <= selectedDates.ci) {
          isDisabled = true;
        } else {
          // Check if any date in the interval [check-in, check-out) is blocked
          var checkInDate = selectedDates.ci;
          var hasBlockedDateInInterval = false;
          var currentDate = checkInDate;
          
          while (currentDate < dateStr) {
            if (disabledDates.indexOf(currentDate) !== -1) {
              hasBlockedDateInInterval = true;
              break;
            }
            currentDate = addDaysISO(currentDate, 1);
          }
          
          isDisabled = hasBlockedDateInInterval;
        }
      }
      
      var isSelected = dateStr === selectedDates[pickerId];
      var isToday = dateStr === today;
      var isInRange = false;
      
      if (selectedDates.ci && selectedDates.co) {
        isInRange = dateStr > selectedDates.ci && dateStr < selectedDates.co;
      }
      
      var classes = 'date-picker-day';
      if (isDisabled) classes += ' disabled';
      if (isSelected) classes += ' selected';
      if (isToday) classes += ' today';
      if (isInRange) classes += ' in-range';
      
      // Get price for this date if available
      var priceHtml = '';
      if (!isDisabled && calendarPrices[dateStr]) {
        var priceInfo = calendarPrices[dateStr];
        // Format: "GHS 447" (currency code + rounded price)
        var roundedPrice = Math.round(priceInfo.price);
        priceHtml = '<div class="date-price">' + priceInfo.currency + ' ' + roundedPrice + '</div>';
      }
      
      html += '<button class="' + classes + '" data-date="' + dateStr + '"' +
              (isDisabled ? ' disabled' : '') + '>' +
              '<div class="date-number">' + day + '</div>' +
              priceHtml +
              '</button>';
    }
    
    html += '</div>';
    picker.innerHTML = html;
    
    picker.querySelectorAll('[data-action="prev"]').forEach(function(btn) {
      btn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentPickerMonth[pickerId] = new Date(month.getFullYear(), month.getMonth() - 1, 1);
        
        // Fetch pricing for new month
        if (currentRoomTypeId) {
          var newMonth = currentPickerMonth[pickerId];
          await fetchCalendarPricing(newMonth.getFullYear(), newMonth.getMonth(), currentRoomTypeId);
        }
        
        renderCalendar(pickerId);
      });
    });
    
    
    picker.querySelectorAll('[data-action="next"]').forEach(function(btn) {
      btn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentPickerMonth[pickerId] = new Date(month.getFullYear(), month.getMonth() + 1, 1);
        
        // Fetch pricing for new month
        if (currentRoomTypeId) {
          var newMonth = currentPickerMonth[pickerId];
          await fetchCalendarPricing(newMonth.getFullYear(), newMonth.getMonth(), currentRoomTypeId);
        }
        
        renderCalendar(pickerId);
      });
    });
    
    picker.querySelectorAll('.date-picker-day:not(.disabled):not(.empty)').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var dateStr = btn.getAttribute('data-date');
        selectDate(pickerId, dateStr);
      });
    });
  }

  function selectDate(pickerId, dateStr) {
    selectedDates[pickerId] = dateStr;
    $('#' + pickerId).value = formatDisplayDate(dateStr);
    
    if (pickerId === 'ci') {
      // Find the nearest available checkout date
      if (!selectedDates.co || selectedDates.co <= dateStr) {
        var checkoutDate = addDaysISO(dateStr, 1);
        var maxLookahead = 365; // Look ahead up to 365 days
        var found = false;
        
        // Check each potential checkout date
        for (var i = 1; i <= maxLookahead; i++) {
          checkoutDate = addDaysISO(dateStr, i);
          var hasBlockedDate = false;
          
          // Check if any date in the interval [check-in, checkout) is blocked
          var currentDate = dateStr;
          while (currentDate < checkoutDate) {
            if (disabledDates.indexOf(currentDate) !== -1) {
              hasBlockedDate = true;
              break;
            }
            currentDate = addDaysISO(currentDate, 1);
          }
          
          // If no blocked dates in the interval, this is a valid checkout date
          if (!hasBlockedDate) {
            found = true;
            break;
          }
        }
        
        // Set the checkout date (either found valid date or default to check-in+1)
        selectedDates.co = checkoutDate;
        $('#co').value = formatDisplayDate(checkoutDate);
      }
      // If check-out picker is open, refresh it to show updated blocking
      if (activePickerId === 'co') {
        renderCalendar('co');
      }
    }
    
    closeDatePicker();
    updateNightsDisplay();
  }

    async function updateDisabledDates() {
    var adultsVal = Number(($('#ad') || {}).value || 2) || 1;
    var todayIso = iso(new Date());

    // Start a new generation for this async run
    var gen = ++disabledDatesGeneration;

    var newDisabled = [];

    // 1) Always disable past dates
    for (var i = -365; i < 0; i++) {
      newDisabled.push(addDaysISO(todayIso, i));
    }

    // 2) For the next 365 days, disable any date where the
    //    *combined capacity* of all available cabins is
    //    less than the selected number of adults.
    var MAX_LOOKAHEAD_DAYS = 365;
    var BATCH_SIZE = 30; // process in batches to keep UI responsive

    for (var batchStart = 0; batchStart <= MAX_LOOKAHEAD_DAYS; batchStart += BATCH_SIZE) {
      // If a newer run started, abort this one
      if (gen !== disabledDatesGeneration) return;

      // Create batch of promises
      var promises = [];
      var dates = [];
      
      for (var i = 0; i < BATCH_SIZE && (batchStart + i) <= MAX_LOOKAHEAD_DAYS; i++) {
        var offset = batchStart + i;
        var ciIso = addDaysISO(todayIso, offset);
        var coIso = addDaysISO(ciIso, 1);
        
        dates.push(ciIso);
        promises.push(
          getAvailableRooms(ciIso, coIso, adultsVal).catch(function() { return null; })
        );
      }

      // Wait for all promises in this batch
      try {
        var results = await Promise.all(promises);
        
        // Check each result
        for (var i = 0; i < results.length; i++) {
          var rooms = results[i];
          var ciIso = dates[i];
          
          if (!rooms || !rooms.length) {
            newDisabled.push(ciIso);
          } else {
            var totalCap = 0;
            rooms.forEach(function (room) {
              var cap = room.maxAdults != null ? parseInt(room.maxAdults, 10) : 0;
              if (!Number.isFinite(cap) || cap < 0) cap = 0;
              totalCap += cap;
            });

            if (totalCap < adultsVal) {
              newDisabled.push(ciIso);
            }
          }
        }
      } catch (e) {
        // On error, continue to next batch
      }
    }

    // If another run started while we were waiting, don't overwrite
    if (gen !== disabledDatesGeneration) return;

    disabledDates = newDisabled;

    // Refresh calendar if one is open
    if (activePickerId) {
      renderCalendar(activePickerId);
    }
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
  var roomDiscount = 0;           // ⭐ NEW
  var extrasDiscount = 0;         // ⭐ NEW
  var extrasWithDiscounts = [];   // ⭐ NEW - extras with individual discounts
  var reviewApproved = false; // gate payment until user confirms on Review modal


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
        scopeLabel = 'Room and Experiences';
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
        scopeLabel = 'Experiences';
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
  if (!appliedCoupon || !selected) { 
    discountAmount = 0;
    roomDiscount = 0;
    extrasDiscount = 0;
    
    // ⭐ NEW: Still populate extrasWithDiscounts with zero discounts
    extrasWithDiscounts = extras.map(function(extra) {
      return {
        ...extra,
        discount: 0
      };
    });
    
    return 0;
  }
  
  var subtotal = selected.total + extrasTotal;
  if (appliedCoupon.min_booking_amount && subtotal < appliedCoupon.min_booking_amount) {
    discountAmount = 0;
    roomDiscount = 0;
    extrasDiscount = 0;
    return 0;
  }
  
  // Calculate total only for extras that this coupon targets (if defined)
  var extrasTargetTotal = extrasTotal;
  var targetedExtras = extras; // All extras by default
  
  if (
    appliedCoupon &&
    Array.isArray(appliedCoupon.extra_ids) &&
    appliedCoupon.extra_ids.length
  ) {
    var idSet = new Set(appliedCoupon.extra_ids.map(String));
    targetedExtras = extras.filter(function(e) { 
      return e.qty > 0 && idSet.has(String(e.id)); 
    });
    extrasTargetTotal = targetedExtras.reduce(function(sum, e) { 
      return sum + (e.price * e.qty); 
    }, 0);
  }
  
  // ⭐ Calculate room and extras discounts separately
  roomDiscount = 0;
  extrasDiscount = 0;
  
  if (appliedCoupon.applies_to === 'both') {
    // Apply discount to both room and targeted extras
    var base = selected.total + extrasTargetTotal;
    var totalDiscount = appliedCoupon.discount_type === 'percentage' 
      ? (base * appliedCoupon.discount_value / 100) 
      : appliedCoupon.discount_value;
    
    // Proportionally split discount between room and extras
    if (base > 0) {
      var roomPortion = selected.total / base;
      var extrasPortion = extrasTargetTotal / base;
      
      roomDiscount = totalDiscount * roomPortion;
      extrasDiscount = totalDiscount * extrasPortion;
    }
    
  } else if (appliedCoupon.applies_to === 'rooms') {
    // Apply discount only to rooms
    roomDiscount = appliedCoupon.discount_type === 'percentage' 
      ? (selected.total * appliedCoupon.discount_value / 100) 
      : appliedCoupon.discount_value;
    extrasDiscount = 0;
    
  } else if (appliedCoupon.applies_to === 'extras') {
    // Apply discount only to targeted extras
    roomDiscount = 0;
    extrasDiscount = appliedCoupon.discount_type === 'percentage' 
      ? (extrasTargetTotal * appliedCoupon.discount_value / 100) 
      : appliedCoupon.discount_value;
  }
  
  // Calculate per-extra discounts for extras that are targeted
  extrasWithDiscounts = extras.map(function(extra) {
    var extraDiscount = 0;
    
    if (extrasDiscount > 0 && extrasTargetTotal > 0) {
      // Check if this extra is targeted
      var isTargeted = true;
      if (appliedCoupon.extra_ids && appliedCoupon.extra_ids.length) {
        var idSet = new Set(appliedCoupon.extra_ids.map(String));
        isTargeted = idSet.has(String(extra.id));
      }
      
      if (isTargeted && extra.qty > 0) {
        var extraSubtotal = extra.price * extra.qty;
        extraDiscount = (extraSubtotal / extrasTargetTotal) * extrasDiscount;
      }
    }
    
    return {
      ...extra,
      discount: extraDiscount
    };
  });
  
  // Total discount
  var totalDiscount = roomDiscount + extrasDiscount;
  totalDiscount = Math.min(totalDiscount, subtotal);
  
  discountAmount = totalDiscount;
  return totalDiscount;
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

      // Modal 1 (Experiences)
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

      // Modal 1 (Experiences) – keep full description
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

  function updateReviewModal() {
    if (!selected) return;

    var curr = selected.currency || CURRENCY;
    var ci = selectedDates.ci, co = selectedDates.co;
    var adultsVal = Number((document.getElementById('ad') || {}).value || 2);
    
    // Guest details (from the guest form inputs)
    var firstEl = document.getElementById('gFirst');
    var lastEl  = document.getElementById('gLast');
    var emailEl = document.getElementById('gEmail');
    var phoneEl = document.getElementById('gPhone');

    var guestName = ((firstEl && firstEl.value) ? firstEl.value.trim() : '') +
                    (((lastEl && lastEl.value) ? (' ' + lastEl.value.trim()) : ''));

    var rGuest = document.getElementById('rGuest');
    if (rGuest) rGuest.textContent = guestName.trim() || '—';

    var rEmail = document.getElementById('rEmail');
    if (rEmail) rEmail.textContent = (emailEl && emailEl.value ? emailEl.value.trim() : '') || '—';

    var rPhone = document.getElementById('rPhone');
    if (rPhone) rPhone.textContent = (phoneEl && phoneEl.value ? phoneEl.value.trim() : '') || '—';


    // Dates / nights / guests
    var rDates = document.getElementById('rDates');
    if (rDates) rDates.textContent = formatDisplayDate(ci) + ' → ' + formatDisplayDate(co);

    var rNights = document.getElementById('rNights');
    if (rNights) rNights.textContent = String(selected.nights || 0);

    var rGuests = document.getElementById('rGuests');
    if (rGuests) rGuests.textContent = String(adultsVal);

    // Rooms + room subtotal
    var roomSubtotal = 0;
    var roomsLabel = '';
    if (Array.isArray(selectedRooms) && selectedRooms.length > 1) {
      roomsLabel = selectedRooms.map(function (r) { return r.name || r.code || 'Room'; }).join(', ');
      roomSubtotal = selectedRooms.reduce(function (sum, r) { return sum + (r.total || 0); }, 0);
    } else {
      roomsLabel = selected.name || selected.code || 'Room';
      roomSubtotal = selected.total || 0;
    }

    var rRoom = document.getElementById('rRoom') || document.getElementById('rRooms');
    if (rRoom) rRoom.textContent = roomsLabel;


    var rRoomSubtotal = document.getElementById('rRoomSubtotal') || document.getElementById('rRoomSub');
    if (rRoomSubtotal) rRoomSubtotal.textContent = formatCurrency(roomSubtotal, curr);


    // Extras list + extras subtotal
    var extrasSubtotalText = formatCurrency(extrasTotal || 0, curr);

    var rExtrasSubtotal = document.getElementById('rExtrasSubtotal') || document.getElementById('rExtrasSub');
    if (rExtrasSubtotal) rExtrasSubtotal.textContent = extrasSubtotalText;

    // Also populate the Payment Summary "Experiences:" row (id="rExtras")
    var rExtras = document.getElementById('rExtras');
    if (rExtras) rExtras.textContent = extrasSubtotalText;


    var listEl = document.getElementById('rExtrasList');
    if (listEl) {
      var picked = (extras || []).filter(function (x) { return x && x.qty > 0; });
      if (!picked.length) {
        listEl.innerHTML = '<div class="notice" style="display:block">No experiences selected.</div>';
      } else {
        listEl.innerHTML = picked.map(function (x) {
          var lineTotal = (x.price || 0) * (x.qty || 0);
          return (
            '<div class="kv">' +
              '<span class="label">' + (x.qty || 0) + ' × ' + (x.name || x.code || 'Experience') + '</span>' +
              '<span class="divider"></span>' +
              '<span class="value">' + formatCurrency(lineTotal, curr) + '</span>' +
            '</div>'

          );
        }).join('');
      }
    }

    // Discount + final total
    var discount = calculateDiscount();
    var rDiscountRow = document.getElementById('rDiscountRow');
    var rDiscount = document.getElementById('rDiscount');

    if (rDiscountRow && rDiscount) {
      if (discount > 0) {
        rDiscountRow.style.display = 'flex';
        rDiscount.textContent = '−' + formatCurrency(discount, curr);
      } else {
        rDiscountRow.style.display = 'none';
      }
    }

    var finalTotal = Math.max(0, roomSubtotal + (extrasTotal || 0) - (discount || 0));
    var rTotal = document.getElementById('rTotal');
    if (rTotal) rTotal.textContent = formatCurrency(finalTotal, curr);
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

    // First, get available rooms using the original RPC (for availability checking)
    var availableRooms = await supabase.rpc('get_available_rooms', {
      p_check_in: checkIn,
      p_check_out: checkOut,
      p_adults: perRoomAdults
    });

    // For each available room, get dynamic pricing
    var roomsWithPricing = [];
    
    for (var i = 0; i < availableRooms.length; i++) {
      var room = availableRooms[i];
      
      try {
        // Call dynamic pricing function
        var pricingData = await supabase.rpc('calculate_dynamic_price', {
          p_room_type_id: room.id,
          p_check_in: checkIn,
          p_check_out: checkOut,
          p_pricing_model_id: null // Uses active model automatically
        });
        
        if (pricingData && pricingData.nightly_rates) {
          // Calculate weekday/weekend breakdown from nightly rates
          var weekdayNights = 0;
          var weekendNights = 0;
          var weekdayTotal = 0;
          var weekendTotal = 0;
          
          for (var j = 0; j < pricingData.nightly_rates.length; j++) {
            var nightData = pricingData.nightly_rates[j];
            var nightDate = new Date(nightData.date);
            var dayOfWeek = nightDate.getDay();
            
            if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
              weekendNights++;
              weekendTotal += parseFloat(nightData.rate || 0);
            } else {
              weekdayNights++;
              weekdayTotal += parseFloat(nightData.rate || 0);
            }
          }
          
          var weekdayPrice = weekdayNights > 0 ? weekdayTotal / weekdayNights : 0;
          var weekendPrice = weekendNights > 0 ? weekendTotal / weekendNights : 0;
          
          roomsWithPricing.push({
            id: room.id,
            code: room.code,
            name: room.name,
            description: room.description,
            weekdayPrice: weekdayPrice,
            weekendPrice: weekendPrice,
            totalPrice: parseFloat(pricingData.total || 0),
            weekdayNights: weekdayNights,
            weekendNights: weekendNights,
            nights: parseInt(pricingData.nights || 0),
            maxAdults: room.max_adults != null ? parseInt(room.max_adults, 10) : null,
            imageUrl: room.image_url,
            currency: pricingData.currency || room.currency || 'GHS'
          });
        }
      } catch (err) {
        // If dynamic pricing fails, fall back to original prices from get_available_rooms
        console.warn('Dynamic pricing failed for ' + room.code + ', using base prices:', err);
        
        roomsWithPricing.push({
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
          maxAdults: room.max_adults != null ? parseInt(room.max_adults, 10) : null,
          imageUrl: room.image_url,
          currency: room.currency || 'GHS'
        });
      }
    }
    // Set the first available room as current for calendar pricing
    if (roomsWithPricing.length > 0 && !currentRoomTypeId) {
      currentRoomTypeId = roomsWithPricing[0].id;
      calendarPrices = {}; // Clear existing prices when room changes
    }

    return roomsWithPricing;
  }


  async function getExtras() {
    try {
      var data = await supabase.query('extras', {
        select: 'id,code,name,description,price,category,image_url',
        eq: { is_active: true },
        order: 'price.asc'
      });
      return data.map(function (e) {
        return { id: e.id, code: e.code, name: e.name, description: e.description, price: parseFloat(e.price), category: e.category, image_url: e.image_url || null };
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
        country_code: payload.guest.countryCode || '',
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
    // ===== GROUP BOOKING: Global capacity filter =====
    var totalAdults = parseInt(adults, 10) || 1;
    if (totalAdults <= 0) totalAdults = 1;

    // Compute total max capacity across *all* available rooms
    var totalCapacityAllRooms = 0;
    if (items && items.length) {
      items.forEach(function(it) {
        var cap = it.maxAdults != null ? parseInt(it.maxAdults, 10) : 0;
        if (!Number.isFinite(cap) || cap < 0) cap = 0;
        totalCapacityAllRooms += cap;
      });
    }

    // If even ALL rooms combined cannot fit the adults → no availability
    if (totalCapacityAllRooms < totalAdults) {
      var r = RESULTS_SEL();
      hideMsg();
      showMsg(
        'No cabins available: total capacity (' + totalCapacityAllRooms + ') is below the number of guests (' + totalAdults + ').',
        'err'
      );
      r.innerHTML =
        '<div class="notice err" style="display:block;text-align:left;line-height:1.6">' +
          '<p><strong>No cabins can host your group size for ' + formatDisplayDate(ci) + ' → ' + formatDisplayDate(co) + '.</strong></p>' +
          '<p>Please reduce the number of guests or choose different dates.</p>' +
        '</div>';
      return;
    }

    var r = RESULTS_SEL(); r.innerHTML = '';
      if (!items || !items.length) {
      // Tell the guest there is no availability for the chosen dates
      showMsg('No cabins available for those dates.', 'err');

      // How many nights is this search for?
      var stayNights = nights(ci, co);
      if (stayNights <= 0) stayNights = 1;

      // Look ahead for the next date that *any* cabin is available
      var anyNext = null;
      var maxLookAhead = 365; // days to scan forward

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
      html += '<p><strong>No cabins are available for ' + formatDisplayDate(ci) + ' → ' + formatDisplayDate(co) + '.</strong></p>';

      if (anyNext) {
        html += '<p>The next available stay for any cabin is <strong>' +
          formatDisplayDate(anyNext.ci) + ' → ' + formatDisplayDate(anyNext.co) + '</strong>.</p>';

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
        nights: nights(selectedDates.ci, selectedDates.co),
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
  if (!list.length) {
    host.innerHTML = '<div class="notice err" style="display:block">No extras available right now.</div>';
    return;
  }

  host.innerHTML = '';

  list.forEach(function (x) {
  var card = document.createElement('div');
  card.className = 'room extra-room';

  var placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Crect fill='%23eef2f7' width='100%25' height='100%25'/%3E%3C/svg%3E";
  var img = x.image_url ? x.image_url : placeholder;

  card.innerHTML =
    '<img class="hero" src="' + img + '" alt="' + (x.name || '') + '" onerror="this.src=\\'' + placeholder + '\\'">' +
    '<div class="body">' +
      '<div class="name">' + (x.name || '') + '</div>' +
      '<div class="desc">' + (x.description || '') + '</div>' +
      '<div class="foot">' +
        '<div class="price">' + formatCurrency(x.price, selected ? selected.currency : CURRENCY) + '</div>' +
        '<div class="qty">' +
          '<button class="btn secondary" data-minus="' + x.code + '">−</button>' +
          '<span id="qty-' + x.code + '">0</span>' +
          '<button class="btn secondary" data-plus="' + x.code + '">+</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  host.appendChild(card);
});


  host.querySelectorAll('[data-plus]').forEach(function (b) {
    b.addEventListener('click', function () {
      var code = b.getAttribute('data-plus');
      var item = extras.find(function (e) { return e.code === code; });
      if (!item) {
        var base = list.find(function (x) { return x.code === code; });
        item = Object.assign({}, base, { qty: 0 });
        extras.push(item);
      }
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
  var modReview = $('#modal-review');
  var modThanks = $('#modal-thanks');

  function openModal(which) {
    ovl.style.display = 'block';
    var el = which === 'results' ? modResults : which === 'extras' ? modExtras : which === 'guest' ? modGuest : which === 'review' ? modReview : modThanks;
    el.style.display = 'flex';
  }
  function closeModal(which) {
    var el = which === 'results' ? modResults : which === 'extras' ? modExtras : which === 'guest' ? modGuest : which === 'review' ? modReview : modThanks;
    el.style.display = 'none';
    // Always hide overlay when closing a modal - it will be shown again if another modal opens
    ovl.style.display = 'none';
  }

  document.querySelectorAll('[data-close="results"]').forEach(function (b) { b.addEventListener('click', function(){ closeModal('results'); }); });
  document.querySelectorAll('[data-close="extras"]').forEach(function (b) { b.addEventListener('click', function(){ closeModal('extras'); }); });
  document.querySelectorAll('[data-close="guest"]').forEach(function (b) { b.addEventListener('click', function(){ closeModal('guest'); }); });
  document.querySelectorAll('[data-close="thanks"]').forEach(function (b) { b.addEventListener('click', function(){ closeModal('thanks'); }); });
  document.querySelectorAll('[data-close="review"]').forEach(function (b) { b.addEventListener('click', function(){ closeModal('review'); reviewApproved = false; openModal('guest'); }); });
  document.querySelectorAll('[data-back="extras"]').forEach(function (b) { b.addEventListener('click', function(){ closeModal('extras'); }); });
  document.querySelectorAll('[data-back="guest"]').forEach(function (b) {
    b.addEventListener('click', function(){ closeModal('guest'); openModal('extras'); });
  });

  // ====== EXPERIENCES CAROUSEL ======
  var COUNTRY_OPTIONS = [
    { name: "Afghanistan", flag: "\uD83C\uDDE6\uD83C\uDDEB", code: "+93" },
    { name: "Albania", flag: "\uD83C\uDDE6\uD83C\uDDF1", code: "+355" },
    { name: "Algeria", flag: "\uD83C\uDDE9\uD83C\uDDFF", code: "+213" },
    { name: "Angola", flag: "\uD83C\uDDE6\uD83C\uDDF4", code: "+244" },
    { name: "Argentina", flag: "\uD83C\uDDE6\uD83C\uDDF7", code: "+54" },
    { name: "Armenia", flag: "\uD83C\uDDE6\uD83C\uDDF2", code: "+374" },
    { name: "Australia", flag: "\uD83C\uDDE6\uD83C\uDDFA", code: "+61" },
    { name: "Austria", flag: "\uD83C\uDDE6\uD83C\uDDF9", code: "+43" },
    { name: "Azerbaijan", flag: "\uD83C\uDDE6\uD83C\uDDFF", code: "+994" },
    { name: "Bangladesh", flag: "\uD83C\uDDE7\uD83C\uDDE9", code: "+880" },
    { name: "Belgium", flag: "\uD83C\uDDE7\uD83C\uDDEA", code: "+32" },
    { name: "Benin", flag: "\uD83C\uDDE7\uD83C\uDDEF", code: "+229" },
    { name: "Bhutan", flag: "\uD83C\uDDE7\uD83C\uDDF9", code: "+975" },
    { name: "Botswana", flag: "\uD83C\uDDE7\uD83C\uDDFC", code: "+267" },
    { name: "Brazil", flag: "\uD83C\uDDE7\uD83C\uDDF7", code: "+55" },
    { name: "Brunei", flag: "\uD83C\uDDE7\uD83C\uDDF3", code: "+673" },
    { name: "Bulgaria", flag: "\uD83C\uDDE7\uD83C\uDDEC", code: "+359" },
    { name: "Burkina Faso", flag: "\uD83C\uDDE7\uD83C\uDDEB", code: "+226" },
    { name: "Burundi", flag: "\uD83C\uDDE7\uD83C\uDDEE", code: "+257" },
    { name: "Cambodia", flag: "\uD83C\uDDF0\uD83C\uDDED", code: "+855" },
    { name: "Cameroon", flag: "\uD83C\uDDE8\uD83C\uDDF2", code: "+237" },
    { name: "Canada", flag: "\uD83C\uDDE8\uD83C\uDDE6", code: "+1" },
    { name: "Cape Verde", flag: "\uD83C\uDDE8\uD83C\uDDFB", code: "+238" },
    { name: "Central African Republic", flag: "\uD83C\uDDE8\uD83C\uDDEB", code: "+236" },
    { name: "Chad", flag: "\uD83C\uDDF9\uD83C\uDDE9", code: "+235" },
    { name: "Chile", flag: "\uD83C\uDDE8\uD83C\uDDF1", code: "+56" },
    { name: "China", flag: "\uD83C\uDDE8\uD83C\uDDF3", code: "+86" },
    { name: "Colombia", flag: "\uD83C\uDDE8\uD83C\uDDF4", code: "+57" },
    { name: "Comoros", flag: "\uD83C\uDDF0\uD83C\uDDF2", code: "+269" },
    { name: "Congo", flag: "\uD83C\uDDE8\uD83C\uDDEC", code: "+242" },
    { name: "Congo (DRC)", flag: "\uD83C\uDDE8\uD83C\uDDE9", code: "+243" },
    { name: "C\u00F4te d'Ivoire", flag: "\uD83C\uDDE8\uD83C\uDDEE", code: "+225" },
    { name: "Croatia", flag: "\uD83C\uDDED\uD83C\uDDF7", code: "+385" },
    { name: "Cyprus", flag: "\uD83C\uDDE8\uD83C\uDDFE", code: "+357" },
    { name: "Czechia", flag: "\uD83C\uDDE8\uD83C\uDDFF", code: "+420" },
    { name: "Denmark", flag: "\uD83C\uDDE9\uD83C\uDDF0", code: "+45" },
    { name: "Djibouti", flag: "\uD83C\uDDE9\uD83C\uDDEF", code: "+253" },
    { name: "Egypt", flag: "\uD83C\uDDEA\uD83C\uDDEC", code: "+20" },
    { name: "Equatorial Guinea", flag: "\uD83C\uDDEC\uD83C\uDDF6", code: "+240" },
    { name: "Eritrea", flag: "\uD83C\uDDEA\uD83C\uDDF7", code: "+291" },
    { name: "Estonia", flag: "\uD83C\uDDEA\uD83C\uDDEA", code: "+372" },
    { name: "Eswatini", flag: "\uD83C\uDDF8\uD83C\uDDFF", code: "+268" },
    { name: "Ethiopia", flag: "\uD83C\uDDEA\uD83C\uDDF9", code: "+251" },
    { name: "Fiji", flag: "\uD83C\uDDEB\uD83C\uDDEF", code: "+679" },
    { name: "Finland", flag: "\uD83C\uDDEB\uD83C\uDDEE", code: "+358" },
    { name: "France", flag: "\uD83C\uDDEB\uD83C\uDDF7", code: "+33" },
    { name: "Gabon", flag: "\uD83C\uDDEC\uD83C\uDDE6", code: "+241" },
    { name: "Gambia", flag: "\uD83C\uDDEC\uD83C\uDDF2", code: "+220" },
    { name: "Germany", flag: "\uD83C\uDDE9\uD83C\uDDEA", code: "+49" },
    { name: "Ghana", flag: "\uD83C\uDDEC\uD83C\uDDED", code: "+233" },
    { name: "Greece", flag: "\uD83C\uDDEC\uD83C\uDDF7", code: "+30" },
    { name: "Guinea", flag: "\uD83C\uDDEC\uD83C\uDDF3", code: "+224" },
    { name: "Guinea-Bissau", flag: "\uD83C\uDDEC\uD83C\uDDFC", code: "+245" },
    { name: "Hungary", flag: "\uD83C\uDDED\uD83C\uDDFA", code: "+36" },
    { name: "Iceland", flag: "\uD83C\uDDEE\uD83C\uDDF8", code: "+354" },
    { name: "India", flag: "\uD83C\uDDEE\uD83C\uDDF3", code: "+91" },
    { name: "Indonesia", flag: "\uD83C\uDDEE\uD83C\uDDE9", code: "+62" },
    { name: "Iran", flag: "\uD83C\uDDEE\uD83C\uDDF7", code: "+98" },
    { name: "Iraq", flag: "\uD83C\uDDEE\uD83C\uDDF6", code: "+964" },
    { name: "Ireland", flag: "\uD83C\uDDEE\uD83C\uDDEA", code: "+353" },
    { name: "Israel", flag: "\uD83C\uDDEE\uD83C\uDDF1", code: "+972" },
    { name: "Italy", flag: "\uD83C\uDDEE\uD83C\uDDF9", code: "+39" },
    { name: "Japan", flag: "\uD83C\uDDEF\uD83C\uDDF5", code: "+81" },
    { name: "Jordan", flag: "\uD83C\uDDEF\uD83C\uDDF4", code: "+962" },
    { name: "Kazakhstan", flag: "\uD83C\uDDF0\uD83C\uDDFF", code: "+7" },
    { name: "Kenya", flag: "\uD83C\uDDF0\uD83C\uDDEA", code: "+254" },
    { name: "Kuwait", flag: "\uD83C\uDDF0\uD83C\uDDFC", code: "+965" },
    { name: "Kyrgyzstan", flag: "\uD83C\uDDF0\uD83C\uDDEC", code: "+996" },
    { name: "Laos", flag: "\uD83C\uDDF1\uD83C\uDDE6", code: "+856" },
    { name: "Latvia", flag: "\uD83C\uDDF1\uD83C\uDDFB", code: "+371" },
    { name: "Lebanon", flag: "\uD83C\uDDF1\uD83C\uDDE7", code: "+961" },
    { name: "Lesotho", flag: "\uD83C\uDDF1\uD83C\uDDF8", code: "+266" },
    { name: "Liberia", flag: "\uD83C\uDDF1\uD83C\uDDF7", code: "+231" },
    { name: "Libya", flag: "\uD83C\uDDF1\uD83C\uDDFE", code: "+218" },
    { name: "Lithuania", flag: "\uD83C\uDDF1\uD83C\uDDF9", code: "+370" },
    { name: "Luxembourg", flag: "\uD83C\uDDF1\uD83C\uDDFA", code: "+352" },
    { name: "Madagascar", flag: "\uD83C\uDDF2\uD83C\uDDEC", code: "+261" },
    { name: "Malawi", flag: "\uD83C\uDDF2\uD83C\uDDFC", code: "+265" },
    { name: "Malaysia", flag: "\uD83C\uDDF2\uD83C\uDDFE", code: "+60" },
    { name: "Maldives", flag: "\uD83C\uDDF2\uD83C\uDDFB", code: "+960" },
    { name: "Mali", flag: "\uD83C\uDDF2\uD83C\uDDF1", code: "+223" },
    { name: "Malta", flag: "\uD83C\uDDF2\uD83C\uDDF9", code: "+356" },
    { name: "Mauritania", flag: "\uD83C\uDDF2\uD83C\uDDF7", code: "+222" },
    { name: "Mauritius", flag: "\uD83C\uDDF2\uD83C\uDDFA", code: "+230" },
    { name: "Mexico", flag: "\uD83C\uDDF2\uD83C\uDDFD", code: "+52" },
    { name: "Moldova", flag: "\uD83C\uDDF2\uD83C\uDDE9", code: "+373" },
    { name: "Monaco", flag: "\uD83C\uDDF2\uD83C\uDDE8", code: "+377" },
    { name: "Mongolia", flag: "\uD83C\uDDF2\uD83C\uDDF3", code: "+976" },
    { name: "Montenegro", flag: "\uD83C\uDDF2\uD83C\uDDEA", code: "+382" },
    { name: "Morocco", flag: "\uD83C\uDDF2\uD83C\uDDE6", code: "+212" },
    { name: "Mozambique", flag: "\uD83C\uDDF2\uD83C\uDDFF", code: "+258" },
    { name: "Namibia", flag: "\uD83C\uDDF3\uD83C\uDDE6", code: "+264" },
    { name: "Nepal", flag: "\uD83C\uDDF3\uD83C\uDDF5", code: "+977" },
    { name: "Netherlands", flag: "\uD83C\uDDF3\uD83C\uDDF1", code: "+31" },
    { name: "New Zealand", flag: "\uD83C\uDDF3\uD83C\uDDFF", code: "+64" },
    { name: "Niger", flag: "\uD83C\uDDF3\uD83C\uDDEA", code: "+227" },
    { name: "Nigeria", flag: "\uD83C\uDDF3\uD83C\uDDEC", code: "+234" },
    { name: "Norway", flag: "\uD83C\uDDF3\uD83C\uDDF4", code: "+47" },
    { name: "Oman", flag: "\uD83C\uDDF4\uD83C\uDDF2", code: "+968" },
    { name: "Pakistan", flag: "\uD83C\uDDF5\uD83C\uDDF0", code: "+92" },
    { name: "Peru", flag: "\uD83C\uDDF5\uD83C\uDDEA", code: "+51" },
    { name: "Philippines", flag: "\uD83C\uDDF5\uD83C\uDDED", code: "+63" },
    { name: "Poland", flag: "\uD83C\uDDF5\uD83C\uDDF1", code: "+48" },
    { name: "Portugal", flag: "\uD83C\uDDF5\uD83C\uDDF9", code: "+351" },
    { name: "Qatar", flag: "\uD83C\uDDF6\uD83C\uDDE6", code: "+974" },
    { name: "Romania", flag: "\uD83C\uDDF7\uD83C\uDDF4", code: "+40" },
    { name: "Russia", flag: "\uD83C\uDDF7\uD83C\uDDFA", code: "+7" },
    { name: "Rwanda", flag: "\uD83C\uDDF7\uD83C\uDDFC", code: "+250" },
    { name: "Samoa", flag: "\uD83C\uDDFC\uD83C\uDDF8", code: "+685" },
    { name: "Sao Tome & Principe", flag: "\uD83C\uDDF8\uD83C\uDDF9", code: "+239" },
    { name: "Saudi Arabia", flag: "\uD83C\uDDF8\uD83C\uDDE6", code: "+966" },
    { name: "Senegal", flag: "\uD83C\uDDF8\uD83C\uDDF3", code: "+221" },
    { name: "Serbia", flag: "\uD83C\uDDF7\uD83C\uDDF8", code: "+381" },
    { name: "Seychelles", flag: "\uD83C\uDDF8\uD83C\uDDE8", code: "+248" },
    { name: "Sierra Leone", flag: "\uD83C\uDDF8\uD83C\uDDF1", code: "+232" },
    { name: "Singapore", flag: "\uD83C\uDDF8\uD83C\uDDEC", code: "+65" },
    { name: "Slovakia", flag: "\uD83C\uDDF8\uD83C\uDDF0", code: "+421" },
    { name: "Slovenia", flag: "\uD83C\uDDF8\uD83C\uDDEE", code: "+386" },
    { name: "Somalia", flag: "\uD83C\uDDF8\uD83C\uDDF4", code: "+252" },
    { name: "South Africa", flag: "\uD83C\uDDFF\uD83C\uDDE6", code: "+27" },
    { name: "South Korea", flag: "\uD83C\uDDF0\uD83C\uDDF7", code: "+82" },
    { name: "South Sudan", flag: "\uD83C\uDDF8\uD83C\uDDF8", code: "+211" },
    { name: "Spain", flag: "\uD83C\uDDEA\uD83C\uDDF8", code: "+34" },
    { name: "Sri Lanka", flag: "\uD83C\uDDF1\uD83C\uDDF0", code: "+94" },
    { name: "Sudan", flag: "\uD83C\uDDF8\uD83C\uDDE9", code: "+249" },
    { name: "Sweden", flag: "\uD83C\uDDF8\uD83C\uDDEA", code: "+46" },
    { name: "Switzerland", flag: "\uD83C\uDDE8\uD83C\uDDED", code: "+41" },
    { name: "Taiwan", flag: "\uD83C\uDDF9\uD83C\uDDFC", code: "+886" },
    { name: "Tanzania", flag: "\uD83C\uDDF9\uD83C\uDDFF", code: "+255" },
    { name: "Thailand", flag: "\uD83C\uDDF9\uD83C\uDDED", code: "+66" },
    { name: "Tonga", flag: "\uD83C\uDDF9\uD83C\uDDF4", code: "+676" },
    { name: "Tunisia", flag: "\uD83C\uDDF9\uD83C\uDDF3", code: "+216" },
    { name: "Turkey", flag: "\uD83C\uDDF9\uD83C\uDDF7", code: "+90" },
    { name: "Uganda", flag: "\uD83C\uDDFA\uD83C\uDDEC", code: "+256" },
    { name: "Ukraine", flag: "\uD83C\uDDFA\uD83C\uDDE6", code: "+380" },
    { name: "United Arab Emirates", flag: "\uD83C\uDDE6\uD83C\uDDEA", code: "+971" },
    { name: "United Kingdom", flag: "\uD83C\uDDEC\uD83C\uDDE7", code: "+44" },
    { name: "United States", flag: "\uD83C\uDDFA\uD83C\uDDF8", code: "+1" },
    { name: "Uzbekistan", flag: "\uD83C\uDDFA\uD83C\uDDFF", code: "+998" },
    { name: "Venezuela", flag: "\uD83C\uDDFB\uD83C\uDDEA", code: "+58" },
    { name: "Vietnam", flag: "\uD83C\uDDFB\uD83C\uDDF3", code: "+84" },
    { name: "Zambia", flag: "\uD83C\uDDFF\uD83C\uDDF2", code: "+260" },
    { name: "Zimbabwe", flag: "\uD83C\uDDFF\uD83C\uDDFC", code: "+263" }
  ];

  var experiencesData = [
    {
      title: 'Private Chef Experience',
      image: '/experiences/chef.jpg',
      description: 'Experience the epitome of culinary excellence with our private chef service. Our executive chef crafts personalized menus using the finest locally-sourced ingredients and international flavors.'
    },
    {
      title: 'Wellness & Rejuvenation',
      image: '/experiences/wellness.jpg',
      description: 'Restore balance and tranquility with our comprehensive wellness treatments. Our skilled therapists offer a range of services designed to rejuvenate your body and mind.'
    },
    {
      title: 'Saxophone Experience',
      image: '/experiences/sax.jpg',
      description: 'Elevate your evening with the soulful sounds of our professional saxophonist. Perfect for romantic dinners or special celebrations.'
    },
    {
      title: 'Dinner Under The Stars',
      image: '/experiences/dinner.jpg',
      description: 'Create magical memories with an intimate dinner under the African sky. Our team sets up a beautiful beachside dining experience complete with elegant table settings and a crackling bonfire.'
    },
    {
      title: 'Tour Experience',
      image: '/experiences/tour.jpg',
      description: 'Discover the rich history and culture of Anomabo with our guided tour of the historic Fort William. Our knowledgeable guides bring history to life.'
    },
    {
      title: 'Creative Expression',
      image: '/experiences/paint.jpg',
      description: 'Unleash your inner artist in our relaxed sip and paint sessions. Guided by talented local artists, create your own masterpiece while enjoying refreshing drinks.'
    }
  ];

  var currentSlide = 0;
  var carouselModal = $('#experiences-carousel-modal');
  var carouselTrack = $('#carousel-track');
  var carouselIndicators = $('#carousel-indicators');
  var prevBtn = $('#carousel-prev');
  var nextBtn = $('#carousel-next');

  function renderCarousel() {
    carouselTrack.innerHTML = experiencesData.map(function(exp) {
      return '<div class="carousel-slide">' +
        '<img src="' + exp.image + '" alt="' + exp.title + '" class="carousel-image">' +
        '<h3 class="carousel-title">' + exp.title + '</h3>' +
        '<p class="carousel-description">' + exp.description + '</p>' +
      '</div>';
    }).join('');

    carouselIndicators.innerHTML = experiencesData.map(function(_, i) {
      return '<div class="carousel-dot' + (i === 0 ? ' active' : '') + '"></div>';
    }).join('');

    updateCarousel();
  }

  function updateCarousel() {
    carouselTrack.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === experiencesData.length - 1;
    
    var dots = carouselIndicators.querySelectorAll('.carousel-dot');
    dots.forEach(function(dot, i) {
      if (i === currentSlide) dot.classList.add('active');
      else dot.classList.remove('active');
    });
  }

  $('#view-experiences-link').addEventListener('click', function() {
    carouselModal.classList.add('active');
    renderCarousel();
  });

  // Add click handlers for experiences banners in other modals
  var guestBanner = $('#view-experiences-link-guest');
  if (guestBanner) {
    guestBanner.addEventListener('click', function() {
      carouselModal.classList.add('active');
      renderCarousel();
    });
  }

  $('#close-experiences').addEventListener('click', function() {
    carouselModal.classList.remove('active');
  });

  prevBtn.addEventListener('click', function() {
    if (currentSlide > 0) {
      currentSlide--;
      updateCarousel();
    }
  });

  nextBtn.addEventListener('click', function() {
    if (currentSlide < experiencesData.length - 1) {
      currentSlide++;
      updateCarousel();
    }
  });

  carouselModal.addEventListener('click', function(e) {
    if (e.target === carouselModal) {
      carouselModal.classList.remove('active');
    }
  });

  // ====== COUNTRY CODE SEARCHABLE DROPDOWN ======
  var ccSelect = $('#ccSelect');
  var ccSelected = $('#ccSelected');
  var ccDropdown = $('#ccDropdown');
  var ccSearch = $('#ccSearch');
  var ccList = $('#ccList');
  var ccHidden = $('#gCountryCode');

  function renderCountryList(filter) {
    var q = (filter || '').toLowerCase();
    var html = '';
    var count = 0;
    COUNTRY_OPTIONS.forEach(function(c) {
      if (q && c.name.toLowerCase().indexOf(q) === -1 && c.code.indexOf(q) === -1) return;
      var isActive = ccHidden.value === c.code ? ' active' : '';
      html += '<div class="cc-option' + isActive + '" data-code="' + c.code + '" data-name="' + c.name + '" data-flag="' + c.flag + '">' +
        '<span class="cc-flag">' + c.flag + '</span>' +
        '<span class="cc-name">' + c.name + '</span>' +
        '<span class="cc-code">' + c.code + '</span>' +
      '</div>';
      count++;
    });
    if (!count) html = '<div class="cc-no-results">No countries found</div>';
    ccList.innerHTML = html;
  }

  function selectCountry(code, name, flag) {
    ccHidden.value = code;
    ccSelected.innerHTML = flag + ' ' + name + ' (' + code + ')';
    ccDropdown.classList.remove('open');
    ccSearch.value = '';
  }

  // Toggle dropdown
  ccSelected.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = ccDropdown.classList.contains('open');
    if (isOpen) {
      ccDropdown.classList.remove('open');
    } else {
      renderCountryList('');
      ccDropdown.classList.add('open');
      ccSearch.focus();
    }
  });

  // Search filtering
  ccSearch.addEventListener('input', function() {
    renderCountryList(ccSearch.value);
  });
  ccSearch.addEventListener('click', function(e) { e.stopPropagation(); });

  // Select option
  ccList.addEventListener('click', function(e) {
    var opt = e.target.closest('.cc-option');
    if (opt) {
      selectCountry(opt.dataset.code, opt.dataset.name, opt.dataset.flag);
    }
  });

  // Close on outside click
  document.addEventListener('click', function(e) {
    if (!ccSelect.contains(e.target)) {
      ccDropdown.classList.remove('open');
      ccSearch.value = '';
    }
  });

  // Initial render
  renderCountryList('');

  // ====== TERMS MODAL ======
  var termsModal = $('#terms-modal');
  var termsBody = $('#terms-body');
  
  var sH = '<h2 style="font-size:24px;font-weight:300;font-family:serif;margin:32px 0 24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb">';
  var sP = '<p style="color:#6b7280;line-height:1.7;margin-bottom:16px">';
  var termsContent = '<div style="max-width:800px">' +

    '<h2 style="font-size:24px;font-weight:300;font-family:serif;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb">Introduction</h2>' +
    sP + 'These Booking Terms &amp; Conditions and the General Booking Information contained on our web site will form the basis of your agreement with Sojourn Cabins (\u201Cthe Company\u201D). They apply only to holiday arrangements which you book with us and which we agree to make, provide or perform as applicable as part of our agreement with you and no other third party. This Agreement shall be governed and construed in all respects in accordance with the laws of Ghana. The parties hereto submit to the exclusive jurisdiction of the Ghanaian Courts.</p>' +

    sH + 'Contract</h2>' +
    sP + 'A contract only exists between Sojourn Cabins (\u201Cwe/our/us\u201D) and the \u201Cclients\u201D from the time a Confirmation Invoice is dispatched / received and a payment must be made by the available means on our payment portal.</p>' +

    sH + 'Booking Form</h2>' +
    sP + 'To make a booking with Sojourn Cabins a Booking Form will need to be completed accurately at <a href="https://sojourngh.com" target="_blank" rel="noreferrer" style="color:#111827;font-weight:500;text-decoration:underline">sojourngh.com</a> and submitted. In the event a booking is made without completing a Booking Form, for instance a telephone booking, it is a condition that the information is accurately given. A telephone booking is a contract between us and the \u201Cclients\u201D from the time a Confirmation/Invoice is dispatched when Credit Card / Debit details will be required. We require full payment before a booking will be completed. Until that time no contract or agreement will be considered to exist between us. On all bookings a damage deposit is required.</p>' +

    sH + 'Party Leader and Group Composition</h2>' +
    sP + 'The Party Leader is the person or agency who holds the booking, to whom all correspondence and invoices are addressed and who is responsible for the rental. Spouses\u2019 names are not considered interchangeable. Accommodation is provided only for the number of guests shown on the booking form.</p>' +
    sP + 'Any additional persons wishing to book are required to notify us, as soon as possible and make confirmation in writing with any payment due immediately, unless we advise otherwise, but no later than 8 working days before departure or we reserve the right to refuse any such persons and may cancel the booking.</p>' +
    sP + 'No persons other than those stated on the Booking Form or accepted at such later date by Sojourn Cabins as additional persons shall be entitled to utilise and have the benefit of the accommodation and facilities of the property. The number of people staying in the cabin must not exceed the maximum number as shown in our website. Sojourn Cabins will ask any person to leave the assigned cabin in a case of non-compliance. Subletting, sharing or assigning the accommodation is prohibited.</p>' +
    sP + 'In the event that a person not named on the Booking Form or accepted as an additional person is deemed by us as agents as utilising the accommodation and facilities, we reserve the right to raise an additional charge for such accommodation etc, which shall be the joint and several liability of the clients. Additionally, should any activity or large gathering of people other than those noted on our invoice take place (e.g. party, wedding reception) we must be informed about it at the time of booking or through any of our Representatives beforehand. Our cabins are let for holiday purposes only and commercial activities may only be carried out with our prior knowledge and or written approval on our invoice. This extra charge varies depending on the property and can be deducted from your credit or debit card without further notice.</p>' +

    sH + 'Rental Period</h2>' +
    sP + 'All rental periods are indicated on your final invoice. Prices shown on our website refer to one night rental period. We do not accept bookings that go beyond 7 days at a time. The rental charge includes: the cabin for the rental period; a walking tour of Anomabo; a change of bed linens, bath towels; house wares such as linens, cooking utensils and china; electricity; water and hot water from taps; garden and pool maintenance; all local taxes.</p>' +
    sP + 'It does not include: outgoing telephone calls; Extra Services as requested; eating; chef services; repairs for damages to the property caused by your party; food; travel; car rental; transfers and travel insurance; staff gratuities.</p>' +

    sH + 'Methods of Payment</h2>' +
    sP + 'Payments can be made by: debit/credit card, or mobile money transfer via our booking website. All prices are in GHS and payments have to be received in GHS unless otherwise agreed.</p>' +

    sH + 'Price Guarantee</h2>' +
    sP + 'Once you have made a booking and made all relevant payments, paid a deposit, we guarantee that the cost of your holiday will not change, no matter what happens to exchange rates or aviation fuel costs. The only exception is Government imposed cost increases such as VAT.</p>' +

    sH + 'Holiday Pack</h2>' +
    sP + 'The Holiday Pack includes all vouchers, list of Extra Services requested, driving directions, contact names and telephone numbers, useful information. The Holiday Pack will be provided once the fully completed Booking Form and the total Invoice Price have been received. The Holiday Pack will not be issued if essential information, including group composition, is missing in the Booking Form. Errors or omissions in the Holiday Pack must be noted and conveyed to us immediately.</p>' +

    sH + 'Information Booklet</h2>' +
    sP + 'Please note that the information contained in our Information Booklet is to be considered only as an indication. The information contained in the Information Booklet was accurate at the time of publication and made in good faith. Please check the Invoice and our website as changes might occur and updated information are posted on our website.</p>' +

    sH + 'Payments</h2>' +
    sP + 'All bookings must be paid in full. Sojourn Cabins reserves the right to refuse or terminate any booking where the client has not complied with the payment terms specified. If your bank\u2019s country of issue is not within Ghana, please allow at least 5 to 7 days for final payment clearance. It is the responsibility of the client to ensure that all foreign exchange and bank transfer fees are paid to ensure the amounts due are received in full. We advise, particularly for those booking from overseas to phone your credit / debit card company / bank prior to attempting to make a booking so they are aware you are going to be making a payment to Sojourn Cabins. This will eliminate the possibility of your card being rejected on the grounds of fraud protection.</p>' +
    sP + 'Cancellation by Sojourn Cabins: we reserve the right to cancel your booking if outstanding payments are not received on or before due dates specified on your booking invoice. Where cancellation is required for this reason, all monies already paid less any bank charges and administration costs of GHS 50 will be refunded to you. Should you wish to make alternative payment arrangements, it is your responsibility to contact us immediately to discuss options. We reserve the right in our absolute discretion to refuse a booking without giving reasons.</p>' +
    sP + 'Full Payment date 56 days before departure: The outstanding balance is due 56 days before departure unless otherwise agreed. If your booking is made within 56 days of departure, the total price becomes due at the time of booking. We must receive a cleared payment by the due date stated on the invoice. If we do not receive this payment in time, we reserve the right to cancel your booking and retain your deposit.</p>' +

    sH + 'Changes by You (Client)</h2>' +
    sP + 'Change of dates and cabin size: if you wish to change any part of your booking, you must advise us of any such changes by written notice. We will endeavour to meet reasonable requests for changes, subject to availability, but cannot guarantee to do so. Where it is possible to make changes, we may charge a GHS 50 administration fee unless such changes are outside your control (in which case no fee will be charged). Please note that we are unable to make any changes to bookings within 30 days of departure. We cannot guarantee to make any changes to bookings within 56 days of departure and may charge you for any losses we incur in making changes at that time. If the requested change means that your payment(s) increase, we will advise you of the increase. If the requested change means that the total holiday price is reduced, we are not obliged to refund the difference, but shall use our discretion.</p>' +
    sP + 'Change of party leader or composition: if you wish to transfer your confirmed booking to another person, this can be done provided that we are notified, the full payment is received and an administration charge of GHS 50 is paid. The transferee must provide the information we require and satisfy all the requirements set out in these terms. Both transferor and transferee will be jointly and severally liable for the holiday price and additional charges which will be due at the time of transfer.</p>' +

    sH + 'Cancellation by You (Client)</h2>' +
    sP + 'If you want to cancel your booking, then you or the party leader must contact us immediately in writing (by email or by recorded delivery letter) stating the reason(s). If you do cancel your booking, the following cancellation charges shall apply:</p>' +
    '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:16px">' +
      '<ul style="list-style:none;padding:0;margin:0">' +
        '<li style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb"><span style="color:#6b7280">More than 14 days before check-in</span><strong style="color:#111827">Full refund less transaction and administration fees</strong></li>' +
        '<li style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb"><span style="color:#6b7280">Between 7 and 14 days before check-in</span><strong style="color:#111827">50% of total price less transaction and administration fees</strong></li>' +
        '<li style="display:flex;justify-content:space-between;padding:8px 0"><span style="color:#6b7280">Less than 7 days before check-in</span><strong style="color:#111827">Non-refundable</strong></li>' +
      '</ul>' +
    '</div>' +
    sP + 'If only some members of your group cancel but others decide to continue, no refund will be made for those who cancel but the holiday will continue for the remaining guests. If one of your party is prevented from travelling due to death, injury, illness or other relevant reasons, a refund will not be issued but you may make a claim under your travel insurance policy. If clients reduce group numbers (which causes an increase in price per person) the remaining party must pay the price increase unless we are able to re-let the weeks to other clients. All cancellations must be confirmed in writing to the email address <a href="mailto:theteam@sojourngh.com" style="color:#111827;font-weight:500;text-decoration:underline">theteam@sojourngh.com</a>.</p>' +

    sH + 'Cancellation by Sojourn Cabins</h2>' +
    sP + 'In the unlikely event we have to make a significant change or cancel your confirmed holiday booking, we will let you know as soon as possible and offer an alternative cabin or a full refund. Our liability in such circumstances is limited to a full refund of all monies paid.</p>' +

    sH + 'Arrival &amp; Departure Times</h2>' +
    sP + 'Normal Check in time: Guests can arrive on the cabin at any time after 2pm on the arrival day. Check out must be by 11am on the departure day. If you arrive or depart early or late, you must make prior arrangements with us \u2013 additional charges may apply.</p>' +
    sP + 'The cabins will have been thoroughly cleaned and prepared for your arrival, but if you find anything wrong when you arrive, please inform us immediately. We will use our reasonable endeavours to send someone out to remedy any problem as soon as possible. Please note that arrangements made in respect of departure may be changed at our discretion or by arrangement with us (e.g. you need to leave earlier or later than stated above).</p>' +

    sH + 'Travel Insurance</h2>' +
    sP + 'We strongly recommend that you arrange comprehensive holiday insurance which covers cancellation, medical expenses, repatriation and loss or damage to luggage and personal possessions prior to travelling. The minimum requirement is that you have a policy covering cancellation and medical expenses and repatriation in case of injury or illness. Any decision not to purchase insurance remains at your own discretion and at your own risk. We shall not be liable for any costs, losses or expenses incurred by you which could have been avoided had you taken out appropriate insurance.</p>' +

    sH + 'Your Safety and Security</h2>' +
    sP + 'Sojourn Cabins offer the best value and service for your accommodation and hope that your stay with us is pleasant, safe and trouble free. Please be aware that standards of accommodation and local safety, hygiene and security standards may differ from those you are accustomed to at home in your own country.</p>' +
    sP + 'It remains your responsibility to take all sensible precautions throughout your stay. You are responsible for the safety and behaviour of all members of your party. Our properties are not suitable for people with reduced mobility. You must ensure that you and your party arrive in a fit and sober state when taking possession of your accommodation. Use all electrical equipment with care and caution; report any faulty equipment and do not attempt repairs yourself. Follow all instructions displayed at the properties and in the information packs. Make sure children are supervised at all times and take particular care near swimming pools and the beach. Do not allow children to go to the beach unsupervised or swim in the sea.</p>' +

    sH + 'Special Requests</h2>' +
    sP + 'If you have a special request, such as an anniversary cake, please let us know at the time of booking or when you submit the booking form, and we will note your requirement and inform the owner or property agent. We cannot guarantee that such requests will be met but we will do our best to accommodate them where possible. Any costs incurred for the provision of special requests will be notified to you in advance and confirmed on your invoice. Please note that such requests do not constitute any part of our agreement with you unless we actually confirm to you that we can fulfil the request and accept the relevant cost(s).</p>' +

    sH + 'Security/Damage Deposits</h2>' +
    sP + 'Most cabin owners ask that you agree to a \u201CSecurity Deposit\u201D which is held to cover any loss or damage to their property caused by you or a member of your party. Security deposits are taken on arrival in cash (GHS or USD), by a pre-authorization with a credit or debit card. Deposits will be refunded within 72 hours of departure providing there is no loss or damage caused by you or any of your party. Please inform us immediately if you do cause any damage. Where, with your consent we will/can automatically deduct said charge from the security/damage deposit being held in the form of credit/debit/cash by Sojourn Cabins. No guests other than those on the booking form can sleep at the property. Wedding celebration breakage deposits are to be paid via bank transfer/credit card/debit card with the balance of your cabin rental on the due date shown on your invoice and will be returned no later than 14 days from the date of departure stated on your invoice subject to zero damages/breakages/unlawful celebrations being reported.</p>' +

    sH + 'Complaints and Correspondence</h2>' +
    sP + 'We hope that you enjoy your holiday and the services of Sojourn Cabins, but if you have any complaints, we want to rectify them as quickly as possible. It is our intention that any complaint is resolved quickly and to your satisfaction. Should you have any complaints / issues with your accommodation upon your arrival you must give Sojourn Cabins a reasonable amount of time to rectify / resolve any such issues. Should any clients of Sojourn Cabins vacate said property before Sojourn Cabins has had time to rectify any issues / complaints we will not be responsible for any costs of relocation or compensation.</p>' +
    sP + 'In the unlikely event that you are still dissatisfied with any part of our services, our office team will ask you to record the details by way of photographs and forward these to our Ghana office by email or recorded delivery within 12 days of the complaint or latest, the return date of your holiday with us. Failure to give written notification sent by email / recorded delivery within 12 days of your complaint or latest from the return date of your holiday shall result in our not being liable for any loss or compensation whatsoever or howsoever arising. Sojourn Cabins will respond to your complaint within 14 days of receiving your recorded letter as a management report may be required.</p>' +
    sP + 'We can only correspond and accept complaints in written form from the Party Leader and are only able to correspond with the party leader due to the data protection act on any such matters relating to the booking. Similar or same properties may be advertised with other agents. Not giving Sojourn Cabins the option to book/relocate said property as an alternative option will cancel any option of refund/compensation. The Party Leader is the person or agency who holds the booking, to whom all correspondence and invoices are addressed and who is responsible for the rental. We cannot accept complaints from other members in the party. Our maximum liability to you if we are found to have been at fault in relation to the booking is limited to the commission we have earned or are due to earn in relation to the booking in question.</p>' +

    sH + 'Building Works</h2>' +
    sP + 'There may be new building/renovation work taking place close to your cabin. We take steps to try and monitor this and advise you if any building work is likely to affect your cabin. Should we consider that a neighbouring building plot or plots would seriously affect your property with either noise or dust pollution or both, then we will use our reasonable endeavours to offer you an alternative from the Sojourn Cabins portfolio only. Where works or public works occur at short notice or without notice, and which are outside of our control, we cannot be held liable for any inconvenience to you, but we will ask the owners to compensate you, and if this is agreed, we will pass this on to you on behalf of the property owner.</p>' +
    sP + 'New building work starting after publication of individual cabin descriptions may in some way distort our description of the property we have considered peaceful or quiet. Building or road works may be in progress nearby, a neighbour may start building a swimming pool or wall, or the local water board may decide to drill for water in the vicinity. This work may start early in the morning as it is local practice and can start at any time in the year. As it is not always possible to gauge the extent of such works we regret we cannot advise you of the constantly changing conditions. If within 7 days of the start of your holiday we become aware of such works taking place on a plot immediately adjacent to your property (that is, an adjoining plot - not across the road or merely nearby) that in our opinion could materially spoil your enjoyment of your holiday we will advise you. You may then either a) cancel and receive a full refund for accommodation and car hire if the latter is booked with ourselves or b) change your booking to another available (subject to availability) cabin from Sojourn Cabins portfolio only for the same period either paying the difference if it is more expensive or receiving a refund if it is cheaper, or c) change your booking to another available cabin for a different period either paying the difference if it is more expensive or receiving a refund if it is cheaper or d) leave your reservation as it is and hope that there is not too much noise or dust to spoil your holiday. If you choose option (d), to stay with the reservation, it is extremely unlikely that after arrival we will be able to move you to any alternative accommodation if you suffer any inconvenience as described above, nor will any claim for compensation be accepted for any loss of enjoyment due to building or any other associated works within the vicinity of your holiday cabin. You should note that we are not responsible for such work, are not able to stop such work taking place nor control the noise level. Nor can we be responsible for any building works that start during a holiday and under no circumstances will we pay any compensation at all in such cases.</p>' +

    sH + 'Law and Jurisdiction</h2>' +
    sP + 'This Agreement shall be governed and construed in all respects in accordance with the laws of Ghana. The parties hereto submit to the exclusive jurisdiction of the Ghanaian Courts and not outside of the Ghanaian courts. This applies to consumer claims that are made outside of the Ghanaian Courts and its jurisdiction.</p>' +

    sH + 'Responsibility</h2>' +
    sP + 'By completing and returning the Booking Form, you and all members of your party acknowledge full awareness of these Booking Terms &amp; Conditions and agree to accept and abide by the terms stated.</p>' +

    sH + 'Condition of Cabin on Checkout</h2>' +
    sP + 'On departure you should leave the cabin in a reasonably clean and tidy condition so that it can be efficiently prepared for the next guests. If excess rubbish must be cleared or excessive cleaning of the cabin is necessary following your stay, any charges will either be: (a) deducted from your security deposit; or (b) invoiced to your postal address.</p>' +

    sH + 'Pricing Errors</h2>' +
    sP + 'Whilst we make every effort to ensure the accuracy of the pricing information provided, regrettably errors may occasionally occur. When we become aware of any such error, we will endeavour to notify you at the time of booking (if we are then aware of the mistake), within 7 days of the time of booking or as soon as reasonably possible. If a booking is already in place, you will have the choice to continue with the chosen itinerary at the corrected price or amend to a different holiday. We reserve the right to cancel the booking if you do not wish to accept the price that applies to your holiday or any quoted alternatives.</p>' +

  '</div>';

  $('#open-terms').addEventListener('click', function() {
    termsBody.innerHTML = termsContent;
    termsModal.classList.add('active');
  });

  $('#close-terms').addEventListener('click', function() {
    termsModal.classList.remove('active');
  });

  termsModal.addEventListener('click', function(e) {
    if (e.target === termsModal) {
      termsModal.classList.remove('active');
    }
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
    else if (modReview.style.display === 'flex') closeModal('review');
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
  initDatePickers(); 
  updateDisabledDates();

  // ⭐ ADD THIS:
  window.addEventListener('DOMContentLoaded', function() {
    updateDisabledDates();
  });
  // Update disabled dates when adults selection changes
  $('#ad').addEventListener('change', function() {
    updateDisabledDates();
    // Refresh the calendar if one is currently open
    if (activePickerId) {
      renderCalendar(activePickerId);
    }
  });

  document.getElementById('load').addEventListener('click', async function () {
    var ci = selectedDates.ci, co = selectedDates.co;
    var adEl = document.getElementById('ad'); var ad = adEl && adEl.value ? adEl.value : 2;

    if (!ci || !co) { showMsg('Please choose both dates.', 'err'); return; }
    if (new Date(co) <= new Date(ci)) { showMsg('Check-out must be after check-in.', 'err'); return; }

    selected = null; extras = []; extrasTotal = 0; appliedCoupon = null; discountAmount = 0; roomDiscount = 0; extrasDiscount = 0; extrasWithDiscounts = []; updateSummary();
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
    var ci = selectedDates.ci, co = selectedDates.co;
    document.getElementById('mDates2').textContent = formatDisplayDate(ci) + ' → ' + formatDisplayDate(co);
    document.getElementById('mRoomName2').textContent = selected.name;
    updateModalSummaries();
    openModal('guest');
  });

    var reviewBackBtn = document.getElementById('review-back');
  if (reviewBackBtn) {
    reviewBackBtn.addEventListener('click', function () {
      reviewApproved = false;
      closeModal('review');
      openModal('guest');
    });
  }

  var reviewContinueBtn = document.getElementById('review-continue');
  if (reviewContinueBtn) {
    reviewContinueBtn.addEventListener('click', function () {
      // UX: show immediate feedback before we do the payment init call
      showPayLoading();

      // Prevent double clicks
      reviewContinueBtn.disabled = true;

      // Let the loading UI paint first, then trigger confirm
      setTimeout(function () {
        reviewApproved = true;
        closeModal('review');
        var c = document.getElementById('confirm');
        if (c) c.click();
      }, 0);
    });
  }



    document.getElementById('confirm').addEventListener('click', async function () {
    var firstEl = document.getElementById('gFirst'),
        lastEl  = document.getElementById('gLast'),
        emailEl = document.getElementById('gEmail'),
        phoneEl = document.getElementById('gPhone'),
        termsCheckbox = document.getElementById('terms-checkbox');

    var first = firstEl && firstEl.value ? firstEl.value.trim() : '';
    var last  = lastEl  && lastEl.value  ? lastEl.value.trim()  : '';
    var email = emailEl && emailEl.value ? emailEl.value.trim() : '';

    if (!first || !last || !email) {
      alert('Please enter first name, last name, and email.');
      return;
    }
    if (!termsCheckbox || !termsCheckbox.checked) {
      alert('Please accept the terms and conditions to continue.');
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
    var checkInVal  = selectedDates.ci;
    var checkOutVal = selectedDates.co;
    var adultsVal   = Number((document.getElementById('ad') || {}).value || 2);
    var countryCodeEl = document.getElementById('gCountryCode');
    var sharedGuest = {
      first: first,
      last: last,
      email: email,
      phone: phoneEl && phoneEl.value ? phoneEl.value.trim() : '',
      countryCode: countryCodeEl && countryCodeEl.value ? countryCodeEl.value : ''
    };
    var curr = selected.currency || CURRENCY || 'GHS';

    // Extras lines only once (we'll attach them to the first reservation)
    var extrasLines = extras
      .filter(function (x) { return x.qty > 0; })
      .map(function (x) {
        return { code: x.code, name: x.name, price: x.price, qty: x.qty };
      });

        // --- Review step gate (show review modal before payment) ---
    if (!reviewApproved) {
      updateModalSummaries();
      updateReviewModal();
      closeModal('guest');
      openModal('review');
      return;
    }


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
    var groupFinalTotal = 0;

    // Calculate total room price for proportional discount distribution
    var totalRoomPrice = roomsForPayload.reduce(function(sum, r) {
      return sum + (r.total || 0);
    }, 0);

    for (var i = 0; i < roomsForPayload.length; i++) {
      var room = roomsForPayload[i];
      var isPrimary = (i === 0);

      // ⭐ Calculate proportional room discount for THIS room
      var roomPrice = room.total || 0;
      var roomOnlyDiscount = 0;
      var extrasOnlyDiscount = 0;
      var totalRoomDiscount = 0;
      
      if (isPrimary) {
        // Primary room carries extras
        extrasOnlyDiscount = extrasDiscount;
      }
      
      // Distribute room discount proportionally across all rooms
      if (roomDiscount > 0 && totalRoomPrice > 0) {
        var roomProportion = roomPrice / totalRoomPrice;
        roomOnlyDiscount = roomDiscount * roomProportion;
      }
      
      totalRoomDiscount = roomOnlyDiscount + extrasOnlyDiscount;
      
      var roomExtrasTotal = isPrimary ? extrasTotal : 0;
      var roomFinal = Math.max(0, roomPrice + roomExtrasTotal - totalRoomDiscount);
      
      groupFinalTotal += roomFinal;
      
      roomPayloads.push({
        checkIn: checkInVal,
        checkOut: checkOutVal,
        adults: adultsPerRoom[i],
        nights: selected.nights || 0,
        roomTypeCode: room.code,
        roomName: room.name,
        roomSubtotal: roomPrice,
        extrasTotal: roomExtrasTotal,
        discountAmount: totalRoomDiscount,              // Total discount for this room
        roomDiscount: roomOnlyDiscount,                 // Room portion only
        extrasDiscount: extrasOnlyDiscount,             // Extras portion only
        finalTotal: roomFinal,
        couponCode: isPrimary ? (appliedCoupon ? appliedCoupon.code : null) : null,
        extras: isPrimary ? extrasWithDiscounts : [],
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

      // Prepare payment data from first room (for now, simple single-room support)
      var paymentData = {
        roomTypeCode: roomPayloads[0].roomTypeCode,
        roomName: roomPayloads[0].roomName,
        checkIn: checkInVal,
        checkOut: checkOutVal,
        nights: roomPayloads[0].nights,
        adults: adultsVal,
        roomSubtotal: roomPayloads[0].roomSubtotal,
        extrasTotal: roomPayloads[0].extrasTotal,
        discountAmount: roomPayloads[0].discountAmount,
        roomDiscount: roomPayloads[0].roomDiscount,       // ⭐ NEW
        extrasDiscount: roomPayloads[0].extrasDiscount,   // ⭐ NEW
        isGroupBooking: hasMultipleRooms,
        groupReservationCode: groupCode,
        allRooms: roomPayloads,
        finalTotal: groupFinalTotal,  // Use group total
        currency: curr,
        guest: {
          first: first,
          last: last,
          email: email,
          phone: sharedGuest.phone || '',
          countryCode: sharedGuest.countryCode || ''
        },
        extras: roomPayloads[0].extras || [],
        couponCode: roomPayloads[0].couponCode || null
      };

      console.log('Calling payment API with data:', paymentData);

      // Call payment initialization API
      var paymentResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      console.log('Payment API response status:', paymentResponse.status);

      // Check if response is ok
      if (!paymentResponse.ok) {
        var errorText = await paymentResponse.text();
        console.error('Payment API error:', errorText);
        throw new Error('Payment API returned status ' + paymentResponse.status + ': ' + errorText);
      }

      // Try to parse JSON
      var responseText = await paymentResponse.text();
      console.log('Payment API raw response:', responseText);
      
      var paymentResult;
      try {
        paymentResult = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text was:', responseText);
        throw new Error('Invalid response from payment API: ' + responseText.substring(0, 100));
      }

      console.log('Parsed payment result:', paymentResult);

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment initialization failed');
      }

      hasMultipleRooms = roomPayloads.length > 1;

      // Store booking info for callback page
      sessionStorage.setItem('pending_booking', JSON.stringify({
        reference: paymentResult.reference,
        confirmationCode: paymentResult.confirmationCode,    // ⭐ NEW
        confirmationCodes: paymentResult.confirmationCodes,  // ⭐ NEW
        groupReservationCode: groupCode,
        amount: groupFinalTotal,
        currency: curr,
        guestName: first + ' ' + last,
        guestEmail: email,
        checkIn: checkInVal,
        checkOut: checkOutVal,
        roomName: hasMultipleRooms 
          ? roomPayloads.map(r => r.roomName).join(', ')  // ⭐ CHANGED: Show all rooms
          : roomPayloads[0].roomName,
        roomNames: hasMultipleRooms                       // ⭐ NEW: Array of room names
          ? roomPayloads.map(r => r.roomName)
          : [roomPayloads[0].roomName],
        roomSubtotal: hasMultipleRooms                    // ⭐ NEW
          ? roomPayloads.reduce((sum, r) => sum + (r.roomSubtotal || 0), 0)
          : roomPayloads[0].roomSubtotal,
        nights: roomPayloads[0].nights,
        extras: roomPayloads[0].extras || [],
        extrasTotal: roomPayloads[0].extrasTotal || 0,
        discountAmount: roomPayloads[0].discountAmount || 0,
        couponCode: roomPayloads[0].couponCode || null,
        isPackage: false,
        // ⭐ NEW: Add group booking info
        isGroupBooking: hasMultipleRooms,
        groupCode: hasMultipleRooms ? paymentResult.groupCode : null
      }));

      console.log('Redirecting to Paystack:', paymentResult.authorization_url);

      // Redirect to Paystack
      window.location.href = paymentResult.authorization_url;
      
      // Below code won't execute due to redirect, but keep for structure
      primaryPayload = roomPayloads[0];
      primaryRes = { 
        confirmation_code: paymentResult.reference,
        total: groupFinalTotal,
        currency: curr
      };

        // Send booking email once, based on the primary reservation/payload
    // Email is now sent by webhook after successful payment
    // Keeping this comment as reference
    


    // Thank you page is now shown by callback page after payment
    // Redirect happens in payment initialization code above

    } catch (e) {
      hidePayLoading();
      alert('Error creating reservation: ' + e.message);
    } finally {
      reviewApproved = false; // reset for next attempt / retry
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
    ;['ovl','modal-results','modal-extras','modal-guest','modal-review','modal-thanks'].forEach(id => {
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
@media(min-width:860px){ .grid.cols-3{ grid-template-columns:1fr 1fr 1fr; } }
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

/* Review modal: match callback layout (label left, value right, no divider column) */
#modal-review .summary-confirm .kv{
  grid-template-columns: 1fr auto; /* label | value */
  gap: 16px;
}

#modal-review .summary-confirm .kv .divider{
  display: none;
}

#modal-review .summary-confirm .kv .label{
  text-align: left;
  min-width: 0;
}

/* Values align right like callback */
#modal-review .summary-confirm .kv .value{
  text-align: right;
  white-space: nowrap;
}

/* Keep experience names on one line on desktop (NO ellipsis) */
@media (min-width: 860px){
  #modal-review #rExtrasList .kv .label{
    white-space: nowrap;   /* one line on desktop */
  }
}

/* Allow wrapping only on smaller screens */
@media (max-width: 859px){
  #modal-review #rExtrasList .kv .label{
    white-space: normal;   /* wrap on smaller screens */
  }
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