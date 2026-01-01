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
    /* ensure the picker and its dropdown sit above the summary pane */
    z-index: 20;
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
    /* sit above everything else in the card */
    z-index: 99999;
    display: none;
    padding: 16px;
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
    gap: 4px;
  }
  .date-picker-day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    background: white;
    color: #111827;
    position: relative;
  }
  .date-picker-day:hover:not(.disabled):not(.empty) {
    background: #f3f4f6;
  }
  .date-picker-day.selected {
    background: var(--brand);
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
          '<div><label>Country Code</label><select id="gCountryCode"></select></div>' +
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


  function openDatePicker(pickerId) {
    closeDatePicker();
    activePickerId = pickerId;
    var picker = $('#' + pickerId + '-picker');
    picker.classList.add('active');
    
    var baseDate = selectedDates[pickerId] ? new Date(selectedDates[pickerId] + 'T00:00:00') : new Date();
    currentPickerMonth[pickerId] = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    
    renderCalendar(pickerId);
  }

  function closeDatePicker() {
    if (activePickerId) {
      var picker = $('#' + activePickerId + '-picker');
      picker.classList.remove('active');
      activePickerId = null;
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
      
      html += '<button class="' + classes + '" data-date="' + dateStr + '"' +
              (isDisabled ? ' disabled' : '') + '>' + day + '</button>';
    }
    
    html += '</div>';
    picker.innerHTML = html;
    
    // Add event listeners
    picker.querySelectorAll('[data-action="prev"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentPickerMonth[pickerId] = new Date(month.getFullYear(), month.getMonth() - 1, 1);
        renderCalendar(pickerId);
      });
    });
    
    picker.querySelectorAll('[data-action="next"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentPickerMonth[pickerId] = new Date(month.getFullYear(), month.getMonth() + 1, 1);
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

    return roomsWithPricing;
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
    if (!list.length) { host.innerHTML = '<div class="notice err" style="display:block">No extras available right now.</div>'; return; }
    host.innerHTML = '';
    list.forEach(function (x) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-bottom:10px;background:#fff';
      var descriptionHtml = x.description ? '<div class="desc" style="margin-top:4px">' + x.description + '</div>' : '';
      row.innerHTML =
        '<div><div style="font-weight:700">' + x.name + '</div>' + descriptionHtml + '<div class="muted" style="color:#6b7280;font-size:14px;margin-top:4px">' + formatCurrency(x.price, selected ? selected.currency : CURRENCY) + '</div></div>' +
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

  // ====== EXPERIENCES CAROUSEL ======
  var COUNTRY_OPTIONS = [
    { region: "Africa", code: "+233", label: "🇬🇭 Ghana (+233)" },
    { region: "Africa", code: "+234", label: "🇳🇬 Nigeria (+234)" },
    { region: "Africa", code: "+27", label: "🇿🇦 South Africa (+27)" },
    { region: "Africa", code: "+254", label: "🇰🇪 Kenya (+254)" },
    { region: "Africa", code: "+256", label: "🇺🇬 Uganda (+256)" },
    { region: "Africa", code: "+255", label: "🇹🇿 Tanzania (+255)" },
    { region: "Africa", code: "+20", label: "🇪🇬 Egypt (+20)" },
    { region: "Africa", code: "+213", label: "🇩🇿 Algeria (+213)" },
    { region: "Africa", code: "+244", label: "🇦🇴 Angola (+244)" },
    { region: "Africa", code: "+229", label: "🇧🇯 Benin (+229)" },
    { region: "Africa", code: "+267", label: "🇧🇼 Botswana (+267)" },
    { region: "Africa", code: "+226", label: "🇧🇫 Burkina Faso (+226)" },
    { region: "Africa", code: "+257", label: "🇧🇮 Burundi (+257)" },
    { region: "Africa", code: "+237", label: "🇨🇲 Cameroon (+237)" },
    { region: "Africa", code: "+238", label: "🇨🇻 Cape Verde (+238)" },
    { region: "Africa", code: "+236", label: "🇨🇫 Central African Republic (+236)" },
    { region: "Africa", code: "+235", label: "🇹🇩 Chad (+235)" },
    { region: "Africa", code: "+269", label: "🇰🇲 Comoros (+269)" },
    { region: "Africa", code: "+242", label: "🇨🇬 Congo (+242)" },
    { region: "Africa", code: "+243", label: "🇨🇩 Congo (DRC) (+243)" },
    { region: "Africa", code: "+225", label: "🇨🇮 Côte d'Ivoire (+225)" },
    { region: "Africa", code: "+253", label: "🇩🇯 Djibouti (+253)" },
    { region: "Africa", code: "+240", label: "🇬🇶 Equatorial Guinea (+240)" },
    { region: "Africa", code: "+291", label: "🇪🇷 Eritrea (+291)" },
    { region: "Africa", code: "+251", label: "🇪🇹 Ethiopia (+251)" },
    { region: "Africa", code: "+241", label: "🇬🇦 Gabon (+241)" },
    { region: "Africa", code: "+220", label: "🇬🇲 Gambia (+220)" },
    { region: "Africa", code: "+224", label: "🇬🇳 Guinea (+224)" },
    { region: "Africa", code: "+245", label: "🇬🇼 Guinea-Bissau (+245)" },
    { region: "Africa", code: "+266", label: "🇱🇸 Lesotho (+266)" },
    { region: "Africa", code: "+231", label: "🇱🇷 Liberia (+231)" },
    { region: "Africa", code: "+218", label: "🇱🇾 Libya (+218)" },
    { region: "Africa", code: "+261", label: "🇲🇬 Madagascar (+261)" },
    { region: "Africa", code: "+265", label: "🇲🇼 Malawi (+265)" },
    { region: "Africa", code: "+223", label: "🇲🇱 Mali (+223)" },
    { region: "Africa", code: "+222", label: "🇲🇷 Mauritania (+222)" },
    { region: "Africa", code: "+230", label: "🇲🇺 Mauritius (+230)" },
    { region: "Africa", code: "+212", label: "🇲🇦 Morocco (+212)" },
    { region: "Africa", code: "+258", label: "🇲🇿 Mozambique (+258)" },
    { region: "Africa", code: "+264", label: "🇳🇦 Namibia (+264)" },
    { region: "Africa", code: "+227", label: "🇳🇪 Niger (+227)" },
    { region: "Africa", code: "+250", label: "🇷🇼 Rwanda (+250)" },
    { region: "Africa", code: "+239", label: "🇸🇹 Sao Tome & Principe (+239)" },
    { region: "Africa", code: "+221", label: "🇸🇳 Senegal (+221)" },
    { region: "Africa", code: "+248", label: "🇸🇨 Seychelles (+248)" },
    { region: "Africa", code: "+232", label: "🇸🇱 Sierra Leone (+232)" },
    { region: "Africa", code: "+252", label: "🇸🇴 Somalia (+252)" },
    { region: "Africa", code: "+211", label: "🇸🇸 South Sudan (+211)" },
    { region: "Africa", code: "+249", label: "🇸🇩 Sudan (+249)" },
    { region: "Africa", code: "+268", label: "🇸🇿 Eswatini (+268)" },
    { region: "Africa", code: "+216", label: "🇹🇳 Tunisia (+216)" },
    { region: "Africa", code: "+260", label: "🇿🇲 Zambia (+260)" },
    { region: "Africa", code: "+263", label: "🇿🇼 Zimbabwe (+263)" },
    { region: "Europe", code: "+44", label: "🇬🇧 United Kingdom (+44)" },
    { region: "Europe", code: "+33", label: "🇫🇷 France (+33)" },
    { region: "Europe", code: "+49", label: "🇩🇪 Germany (+49)" },
    { region: "Europe", code: "+34", label: "🇪🇸 Spain (+34)" },
    { region: "Europe", code: "+39", label: "🇮🇹 Italy (+39)" },
    { region: "Europe", code: "+31", label: "🇳🇱 Netherlands (+31)" },
    { region: "Europe", code: "+41", label: "🇨🇭 Switzerland (+41)" },
    { region: "Europe", code: "+46", label: "🇸🇪 Sweden (+46)" },
    { region: "Europe", code: "+47", label: "🇳🇴 Norway (+47)" },
    { region: "Europe", code: "+45", label: "🇩🇰 Denmark (+45)" },
    { region: "Europe", code: "+48", label: "🇵🇱 Poland (+48)" },
    { region: "Europe", code: "+351", label: "🇵🇹 Portugal (+351)" },
    { region: "Europe", code: "+30", label: "🇬🇷 Greece (+30)" },
    { region: "Europe", code: "+43", label: "🇦🇹 Austria (+43)" },
    { region: "Europe", code: "+32", label: "🇧🇪 Belgium (+32)" },
    { region: "Europe", code: "+353", label: "🇮🇪 Ireland (+353)" },
    { region: "Europe", code: "+358", label: "🇫🇮 Finland (+358)" },
    { region: "Europe", code: "+420", label: "🇨🇿 Czechia (+420)" },
    { region: "Europe", code: "+40", label: "🇷🇴 Romania (+40)" },
    { region: "Europe", code: "+36", label: "🇭🇺 Hungary (+36)" },
    { region: "Europe", code: "+7", label: "🇷🇺 Russia (+7)" },
    { region: "Europe", code: "+380", label: "🇺🇦 Ukraine (+380)" },
    { region: "Europe", code: "+355", label: "🇦🇱 Albania (+355)" },
    { region: "Europe", code: "+359", label: "🇧🇬 Bulgaria (+359)" },
    { region: "Europe", code: "+385", label: "🇭🇷 Croatia (+385)" },
    { region: "Europe", code: "+357", label: "🇨🇾 Cyprus (+357)" },
    { region: "Europe", code: "+372", label: "🇪🇪 Estonia (+372)" },
    { region: "Europe", code: "+354", label: "🇮🇸 Iceland (+354)" },
    { region: "Europe", code: "+371", label: "🇱🇻 Latvia (+371)" },
    { region: "Europe", code: "+370", label: "🇱🇹 Lithuania (+370)" },
    { region: "Europe", code: "+352", label: "🇱🇺 Luxembourg (+352)" },
    { region: "Europe", code: "+356", label: "🇲🇹 Malta (+356)" },
    { region: "Europe", code: "+373", label: "🇲🇩 Moldova (+373)" },
    { region: "Europe", code: "+377", label: "🇲🇨 Monaco (+377)" },
    { region: "Europe", code: "+382", label: "🇲🇪 Montenegro (+382)" },
    { region: "Europe", code: "+381", label: "🇷🇸 Serbia (+381)" },
    { region: "Europe", code: "+421", label: "🇸🇰 Slovakia (+421)" },
    { region: "Europe", code: "+386", label: "🇸🇮 Slovenia (+386)" },
    { region: "Americas", code: "+1", label: "🇺🇸 United States (+1)" },
    { region: "Americas", code: "+1", label: "🇨🇦 Canada (+1)" },
    { region: "Americas", code: "+52", label: "🇲🇽 Mexico (+52)" },
    { region: "Americas", code: "+55", label: "🇧🇷 Brazil (+55)" },
    { region: "Americas", code: "+54", label: "🇦🇷 Argentina (+54)" },
    { region: "Americas", code: "+57", label: "🇨🇴 Colombia (+57)" },
    { region: "Americas", code: "+56", label: "🇨🇱 Chile (+56)" },
    { region: "Americas", code: "+51", label: "🇵🇪 Peru (+51)" },
    { region: "Americas", code: "+58", label: "🇻🇪 Venezuela (+58)" },
    { region: "Asia", code: "+91", label: "🇮🇳 India (+91)" },
    { region: "Asia", code: "+86", label: "🇨🇳 China (+86)" },
    { region: "Asia", code: "+81", label: "🇯🇵 Japan (+81)" },
    { region: "Asia", code: "+82", label: "🇰🇷 South Korea (+82)" },
    { region: "Asia", code: "+65", label: "🇸🇬 Singapore (+65)" },
    { region: "Asia", code: "+971", label: "🇦🇪 United Arab Emirates (+971)" },
    { region: "Asia", code: "+966", label: "🇸🇦 Saudi Arabia (+966)" },
    { region: "Asia", code: "+62", label: "🇮🇩 Indonesia (+62)" },
    { region: "Asia", code: "+60", label: "🇲🇾 Malaysia (+60)" },
    { region: "Asia", code: "+66", label: "🇹🇭 Thailand (+66)" },
    { region: "Asia", code: "+63", label: "🇵🇭 Philippines (+63)" },
    { region: "Asia", code: "+84", label: "🇻🇳 Vietnam (+84)" },
    { region: "Asia", code: "+92", label: "🇵🇰 Pakistan (+92)" },
    { region: "Asia", code: "+880", label: "🇧🇩 Bangladesh (+880)" },
    { region: "Asia", code: "+90", label: "🇹🇷 Turkey (+90)" },
    { region: "Asia", code: "+972", label: "🇮🇱 Israel (+972)" },
    { region: "Asia", code: "+98", label: "🇮🇷 Iran (+98)" },
    { region: "Asia", code: "+964", label: "🇮🇶 Iraq (+964)" },
    { region: "Asia", code: "+962", label: "🇯🇴 Jordan (+962)" },
    { region: "Asia", code: "+965", label: "🇰🇼 Kuwait (+965)" },
    { region: "Asia", code: "+961", label: "🇱🇧 Lebanon (+961)" },
    { region: "Asia", code: "+968", label: "🇴🇲 Oman (+968)" },
    { region: "Asia", code: "+974", label: "🇶🇦 Qatar (+974)" },
    { region: "Asia", code: "+94", label: "🇱🇰 Sri Lanka (+94)" },
    { region: "Asia", code: "+886", label: "🇹🇼 Taiwan (+886)" },
    { region: "Asia", code: "+93", label: "🇦🇫 Afghanistan (+93)" },
    { region: "Asia", code: "+374", label: "🇦🇲 Armenia (+374)" },
    { region: "Asia", code: "+994", label: "🇦🇿 Azerbaijan (+994)" },
    { region: "Asia", code: "+975", label: "🇧🇹 Bhutan (+975)" },
    { region: "Asia", code: "+673", label: "🇧🇳 Brunei (+673)" },
    { region: "Asia", code: "+855", label: "🇰🇭 Cambodia (+855)" },
    { region: "Asia", code: "+7", label: "🇰🇿 Kazakhstan (+7)" },
    { region: "Asia", code: "+996", label: "🇰🇬 Kyrgyzstan (+996)" },
    { region: "Asia", code: "+856", label: "🇱🇦 Laos (+856)" },
    { region: "Asia", code: "+960", label: "🇲🇻 Maldives (+960)" },
    { region: "Asia", code: "+976", label: "🇲🇳 Mongolia (+976)" },
    { region: "Asia", code: "+977", label: "🇳🇵 Nepal (+977)" },
    { region: "Asia", code: "+998", label: "🇺🇿 Uzbekistan (+998)" },
    { region: "Oceania", code: "+61", label: "🇦🇺 Australia (+61)" },
    { region: "Oceania", code: "+64", label: "🇳🇿 New Zealand (+64)" },
    { region: "Oceania", code: "+679", label: "🇫🇯 Fiji (+679)" },
    { region: "Oceania", code: "+685", label: "🇼🇸 Samoa (+685)" },
    { region: "Oceania", code: "+676", label: "🇹🇴 Tonga (+676)" }
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

  // ====== COUNTRY CODE DROPDOWN ======
  var countryCodeSelect = $('#gCountryCode');
  if (countryCodeSelect) {
    // Populate country code dropdown
    COUNTRY_OPTIONS.forEach(function(country) {
      var option = document.createElement('option');
      option.value = country.code;
      option.textContent = country.label;
      countryCodeSelect.appendChild(option);
    });
    // Set Ghana as default
    countryCodeSelect.value = '+233';
  }

  // ====== TERMS MODAL ======
  var termsModal = $('#terms-modal');
  var termsBody = $('#terms-body');
  
  var termsContent = '<div style="max-width:800px"><h2 style="font-size:24px;font-weight:300;font-family:serif;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb">Introduction</h2><p style="color:#6b7280;line-height:1.7;margin-bottom:16px">These Booking Terms & Conditions and the General Booking Information contained on our web site will form the basis of your agreement with Sojourn Cabins ("the Company"). They apply only to holiday arrangements which you book with us and which we agree to make, provide or perform as applicable as part of our agreement with you and no other third party. This Agreement shall be governed and construed in all respects in accordance with the laws of Ghana. The parties hereto submit to the exclusive jurisdiction of the Ghanaian Courts.</p><h2 style="font-size:24px;font-weight:300;font-family:serif;margin:32px 0 24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb">Contract</h2><p style="color:#6b7280;line-height:1.7;margin-bottom:16px">A contract only exists between Sojourn Cabins ("we/our/us") and the "clients" from the time a Confirmation Invoice is dispatched / received and a payment must be made by the available means on our payment portal.</p><h2 style="font-size:24px;font-weight:300;font-family:serif;margin:32px 0 24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb">Payment</h2><p style="color:#6b7280;line-height:1.7;margin-bottom:16px">Full payment is required at the time of booking to confirm your reservation.</p><h2 style="font-size:24px;font-weight:300;font-family:serif;margin:32px 0 24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb">Cancellation Policy</h2><p style="color:#6b7280;line-height:1.7;margin-bottom:16px">Cancellations made more than 30 days before check-in will receive a full refund minus a 10% processing fee. Cancellations made 15-30 days before check-in will receive a 50% refund. Cancellations made less than 15 days before check-in are non-refundable.</p><h2 style="font-size:24px;font-weight:300;font-family:serif;margin:32px 0 24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb">Check-in and Check-out</h2><p style="color:#6b7280;line-height:1.7;margin-bottom:16px">Check-in time is 3:00 PM and check-out time is 11:00 AM. Early check-in or late check-out may be arranged subject to availability and additional charges.</p><h2 style="font-size:24px;font-weight:300;font-family:serif;margin:32px 0 24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb">Guest Responsibilities</h2><p style="color:#6b7280;line-height:1.7;margin-bottom:16px">Guests are responsible for any damage to the property beyond normal wear and tear. Guests must comply with all house rules and local regulations.</p></div>';

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