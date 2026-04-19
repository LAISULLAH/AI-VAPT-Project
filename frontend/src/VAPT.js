import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';

// ════════════════════════════════════════════════════════════
// WHITENX — ALSyed Initiative Theme
// Pure Black + White Monochrome Premium Cybersecurity UI
// ════════════════════════════════════════════════════════════

const API_BASE   = 'https://ai-vapt-project.onrender.com';
const ACCESS_KEY = 'WX-E4QB-4ZJY-L5UN-WBSK';

// ── Global CSS ───────────────────────────────────────────────
const injectCSS = () => {
  if (document.getElementById('wx-css')) return;
  const s = document.createElement('style');
  s.id = 'wx-css';
  s.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

:root{
  --bg-start:#000000;
  --bg-end:#090909;
  --glass:rgba(255,255,255,.08);
  --glass-strong:rgba(255,255,255,.1);
  --glass-soft:rgba(255,255,255,.06);
  --border:rgba(255,255,255,.14);
  --text:#f7f7f7;
  --text-soft:rgba(255,255,255,.72);
  --text-dim:rgba(255,255,255,.5);
  --accent:#ffffff;
  --accent-soft:rgba(255,255,255,.12);
  --shadow:0 10px 40px rgba(0,0,0,.35);
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{
  height:100%;
  color:var(--text);
  font-family:'Inter',sans-serif;
  background:
    radial-gradient(circle at 18% 16%, rgba(255,255,255,.05), transparent 22%),
    radial-gradient(circle at 82% 12%, rgba(255,255,255,.04), transparent 20%),
    linear-gradient(180deg,var(--bg-start),var(--bg-end));
  user-select:none;
  -webkit-user-select:none;
}
body{background-attachment:fixed}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:rgba(255,255,255,.03)}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.16);border-radius:999px}

/* ── TICKER ── */
@keyframes ticker-scroll{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
.ticker-wrap{
  width:100%;overflow:hidden;background:#050505;border-bottom:1px solid rgba(255,255,255,.12);
  padding:8px 0;backdrop-filter:blur(16px);position:relative;
  box-shadow:0 4px 18px rgba(0,0,0,.28);
}
.ticker-inner{
  display:inline-block;white-space:nowrap;
  animation:ticker-scroll 30s linear infinite;
  font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:var(--text-dim);
}
.ticker-inner span{margin:0 40px;}

/* ── NAV ── */
.wx-nav{
  display:flex;align-items:center;justify-content:space-between;
  padding:0 48px;height:72px;
  background:rgba(0,0,0,.94);border-bottom:1px solid rgba(255,255,255,.12);
  position:sticky;top:0;z-index:50;backdrop-filter:blur(18px);box-shadow:0 10px 30px rgba(0,0,0,.35);
}
.wx-logo{
  font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:6px;
  color:var(--text);flex-shrink:0;text-shadow:0 0 12px rgba(255,255,255,.12);
}
.wx-logo-sub{font-family:'Inter',sans-serif;font-size:8px;letter-spacing:3px;color:var(--text-dim);display:block;margin-top:-3px;}
.wx-tabs{display:flex;gap:8px;overflow-x:auto;flex:1;justify-content:center;scrollbar-width:none;padding:0 20px;}
.wx-tabs::-webkit-scrollbar{display:none;}
.wx-tab{
  font-family:'Inter',sans-serif;font-size:11px;font-weight:600;
  letter-spacing:1px;padding:10px 18px;border-radius:100px;
  border:1px solid rgba(255,255,255,.08);cursor:pointer;white-space:nowrap;
  background:rgba(255,255,255,.03);color:var(--text-soft);transition:all .2s ease;
}
.wx-tab:hover{color:var(--text);background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.14);}
.wx-tab.active{
  color:var(--text);background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.18);
}
.wx-btn{
  font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;
  letter-spacing:1.5px;padding:9px 18px;border-radius:999px;
  border:1px solid rgba(255,255,255,.12);cursor:pointer;flex-shrink:0;
  background:rgba(255,255,255,.05);color:var(--text);transition:all .2s;white-space:nowrap;
}
.wx-btn:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.2);}
.wx-btn-primary{background:#ffffff;color:#000000;border-color:#ffffff;box-shadow:0 0 14px rgba(255,255,255,.14);}
.wx-btn-primary:hover{transform:scale(1.04);box-shadow:0 0 18px rgba(255,255,255,.18),0 12px 36px rgba(0,0,0,.32);filter:brightness(1.05);}

/* ── BODY ── */
.wx-body{flex:1;overflow-y:auto;padding:32px 48px;display:flex;flex-direction:column;gap:20px;position:relative;}
.wx-body::before{
  content:'';
  position:fixed;
  inset:72px 0 0 0;
  pointer-events:none;
  background-image:
    linear-gradient(rgba(255,255,255,.012) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.012) 1px, transparent 1px);
  background-size:56px 56px;
  opacity:.24;
  mask-image:radial-gradient(circle at center, black 38%, transparent 92%);
}
@media(max-width:900px){.wx-body{padding:20px;}.wx-nav{padding:0 20px;}}

/* ── CARDS ── */
.wx-card{
  background:#0a0a0a;border:1px solid #222;
  border-radius:8px;overflow:hidden;
  transition:border-color .2s,transform .15s;
  animation:db-in .4s ease both;
}
.wx-card:hover{border-color:#444;}
.wx-card-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 18px;border-bottom:1px solid #111;
  background:#111;
}
.wx-card-title{font-size:9px;font-weight:700;letter-spacing:2px;color:#fff;}
.wx-card-body{padding:18px;}

/* ── STAT CARDS ── */
.wx-stat-grid{display:grid;gap:12px;}
.wx-stat{
  background:#060606;border:1px solid #1a1a1a;border-radius:8px;
  padding:18px 20px;display:flex;flex-direction:column;gap:6px;
  position:relative;overflow:hidden;transition:all .2s;
}
.wx-stat:hover{border-color:rgba(255,255,255,.18);transform:translateY(-1px);}
.wx-stat::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:rgba(255,255,255,.18);opacity:.6;
}
.wx-stat-label{font-size:8px;font-weight:700;letter-spacing:2px;color:rgba(255,255,255,.6);}
.wx-stat-val{font-size:36px;font-weight:800;line-height:1;color:#fff;}
.wx-stat-sub{font-size:9px;color:rgba(255,255,255,.5);}
.wx-stat-icon{
  position:absolute;right:16px;top:50%;transform:translateY(-50%);
  font-size:32px;opacity:.06;
}

/* ── TABLES ── */
.wx-tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
.wx-tbl{width:100%;border-collapse:collapse;font-size:11px;}
.wx-tbl th{padding:10px 16px;text-align:left;font-size:8px;font-weight:700;letter-spacing:1.5px;color:rgba(255,255,255,.72);border-bottom:1px solid #111;background:#111;}
.wx-tbl td{padding:12px 16px;border-bottom:1px solid #0d0d0d;color:rgba(255,255,255,.68);transition:background .15s;}
.wx-tbl tr:hover td{background:rgba(255,255,255,.04);}
.wx-tbl tr:last-child td{border-bottom:none;}

/* ── BADGES ── */
.wx-badge{display:inline-block;font-size:9px;font-weight:700;letter-spacing:1px;padding:4px 10px;border-radius:100px;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.12);}

/* ── LEGAL PAGE ── */
@keyframes lp-in{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes lp-box-slide{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes lp-item-fade{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
@keyframes rotate-smooth{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

.lp-wrap{
  min-height:100vh;display:flex;flex-direction:column;align-items:center;
  padding:60px 20px;position:relative;overflow:hidden;background:#000;
}
.lp-bg-shapes{position:absolute;inset:0;pointer-events:none;z-index:0;}
.lp-shape-ring{position:absolute;border:1px solid rgba(255,255,255,.1);border-radius:50%;right:6%;top:10%;animation:rotate-smooth 28s linear infinite;opacity:.28;}
.lp-shape-ring-1{width:260px;height:260px;margin-right:-130px;margin-top:-130px;}
.lp-shape-ring-2{width:400px;height:400px;margin-right:-200px;margin-top:-200px;animation:rotate-smooth 35s linear infinite reverse;opacity:.18;}
.lp-shape-orb{position:absolute;border-radius:50%;left:5%;bottom:12%;width:110px;height:110px;background:radial-gradient(circle at 35% 35%, rgba(255,255,255,.14), rgba(255,255,255,.01));opacity:.28;}
.lp-big-circle{position:absolute;border:2px solid #ffffff;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);width:480px;height:480px;animation:rotate-smooth 20s linear infinite reverse;box-shadow:0 0 50px rgba(255,255,255,.45),inset 0 0 70px rgba(0,0,0,.55);opacity:.85;z-index:2;}
.lp-wrap::before{content:'';position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.01) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.01) 1px, transparent 1px);background-size:64px 64px;opacity:.2;}
.lp-bg-diamond{position:absolute;right:-200px;top:50%;transform:translateY(-50%) rotate(45deg);width:600px;height:600px;border:1px solid rgba(255,255,255,.08);pointer-events:none;}
.lp-container{width:100%;max-width:720px;position:relative;z-index:10;animation:lp-in .8s ease both;}
.lp-badge-top{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:100px;padding:8px 16px;margin-bottom:32px;font-size:9px;font-weight:700;letter-spacing:2.2px;color:#fff;backdrop-filter:blur(14px);}
.lp-badge-dot{width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 12px rgba(255,255,255,.5);}
.lp-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(40px,8vw,68px);letter-spacing:5px;color:#ffffff;margin-bottom:12px;line-height:1;text-shadow:0 0 20px rgba(255,255,255,.15);animation:lp-in .8s ease both;animation-delay:.1s;}
.lp-subtitle{font-size:11px;color:rgba(255,255,255,.75);letter-spacing:1.8px;margin-bottom:48px;animation:lp-item-fade .6s ease both;animation-delay:.2s;text-transform:uppercase;font-weight:600;}
.lp-box{background:rgba(20,20,20,.9);border:1px solid rgba(255,255,255,.12);border-radius:16px;overflow:hidden;margin-bottom:24px;backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,.5);transition:all .3s ease;animation:lp-box-slide .6s ease both;}
.lp-box:hover{border-color:rgba(255,255,255,.22);transform:translateY(-3px);}
.lp-box-hdr{padding:18px 24px;border-bottom:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.4);font-size:8.5px;font-weight:800;letter-spacing:2.5px;color:#fff;text-transform:uppercase;}
.lp-box-body{padding:24px;}
.lp-item{display:flex;gap:14px;margin-bottom:16px;animation:lp-item-fade .6s ease both;}
.lp-item:last-child{margin-bottom:0;}
.lp-item-num{width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#fff;flex-shrink:0;margin-top:1px;}
.lp-item-text{font-size:11.5px;color:rgba(255,255,255,.82);line-height:1.8;}
.lp-item-text strong{color:#ffffff;font-weight:700;}
.lp-laws-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
@media(max-width:600px){.lp-laws-grid{grid-template-columns:1fr}}
.lp-law{background:rgba(30,30,30,.8);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;transition:all .3s ease;}
.lp-law:hover{border-color:rgba(255,255,255,.25);transform:translateY(-2px);}
.lp-law-region{font-size:7.8px;font-weight:900;letter-spacing:2.2px;color:rgba(255,255,255,.7);margin-bottom:6px;text-transform:uppercase;}
.lp-law-text{font-size:10.5px;color:rgba(255,255,255,.78);line-height:1.5;}
.lp-accept-btn{width:100%;padding:16px;font-family:'Bebas Neue',sans-serif;font-size:13px;font-weight:900;letter-spacing:2.5px;background:#ffffff;border:1.5px solid rgba(255,255,255,.9);border-radius:100px;color:#000;cursor:pointer;transition:all .3s;text-transform:uppercase;box-shadow:0 0 24px rgba(255,255,255,.2),0 8px 32px rgba(0,0,0,.45);animation:lp-box-slide .8s ease both;animation-delay:.4s;}
.lp-accept-btn:hover{transform:scale(1.05);box-shadow:0 0 40px rgba(255,255,255,.35);}
.lp-footer-text{font-size:8px;color:rgba(255,255,255,.55);letter-spacing:1.2px;text-align:center;margin-top:18px;text-transform:uppercase;font-weight:600;}

/* ── LOGIN PAGE ── */
@keyframes lg-in{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes lg-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes lg-shift-gradient{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes lg-text-glow{0%,100%{text-shadow:0 0 8px rgba(255,255,255,.6)}50%{text-shadow:0 0 16px rgba(255,255,255,.9)}}
@keyframes lg-morph-orb{0%{border-radius:60% 40% 30% 70%}25%{border-radius:30% 60% 70% 40%}50%{border-radius:70% 30% 40% 60%}75%{border-radius:40% 70% 60% 30%}100%{border-radius:60% 40% 30% 70%}}

.lg-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;position:relative;overflow:hidden;background:linear-gradient(-45deg, #000, #0a0a0a, #000, #050505);background-size:300% 300%;animation:lg-shift-gradient 12s ease infinite;}
.lg-wrap::before{content:'';position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.01) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.01) 1px, transparent 1px);background-size:64px 64px;opacity:.18;}
.lg-bg{position:absolute;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse at 70% 50%, rgba(255,255,255,.03) 0%, transparent 50%);}
.lg-diamond{position:absolute;right:10%;top:50%;transform:translateY(-50%) rotate(45deg);z-index:2;width:400px;height:400px;border:1px solid rgba(255,255,255,.08);animation:lg-float 8s ease-in-out infinite;}
.lg-diamond::before{content:'';position:absolute;inset:50px;border:1px solid rgba(255,255,255,.05);}
.lg-diamond::after{content:'';position:absolute;inset:100px;border:1px solid rgba(255,255,255,.04);}
.lg-card{width:100%;max-width:440px;position:relative;z-index:11;background:var(--glass);border:1px solid var(--border);border-radius:24px;overflow:hidden;animation:lg-in .6s ease both;backdrop-filter:blur(12px);box-shadow:var(--shadow);}
.lg-card-top{padding:32px 32px 28px;border-bottom:1px solid rgba(255,255,255,.08);}
.lg-logo{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:8px;color:#ffffff;animation:lg-text-glow 3s ease-in-out infinite;}
.lg-logo-sub{font-size:9px;letter-spacing:3px;color:#ffffff;margin-top:2px;opacity:.8;}
.lg-card-body{padding:32px;}
.lg-red-circle{position:absolute;width:480px;height:480px;border-radius:50%;bottom:10%;right:5%;border:1.5px solid rgba(239,68,68,.6);background:radial-gradient(circle at 30% 30%, rgba(239,68,68,.08), transparent 70%);box-shadow:0 0 40px rgba(239,68,68,.25),0 0 80px rgba(239,68,68,.12);animation:rotate-smooth 25s linear infinite;z-index:1;opacity:.7;}
.lg-morph-orb{position:absolute;width:140px;height:140px;border-radius:60% 40% 30% 70%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);z-index:1;pointer-events:none;animation:lg-morph-orb 6s ease-in-out infinite;box-shadow:0 0 40px rgba(255,255,255,.08);}
.lg-morph-orb-1{bottom:15%;left:8%;animation-delay:0s;}
.lg-morph-orb-2{top:10%;right:12%;animation-delay:2s;}
.lg-err{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:12px 16px;margin-bottom:20px;font-size:11px;color:#ffffff;letter-spacing:.5px;}
.lg-label{font-size:9px;font-weight:700;letter-spacing:2px;color:#ffffff;margin-bottom:10px;text-transform:uppercase;display:block;}
.lg-field-wrap{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px 18px;margin-bottom:20px;transition:all .3s ease;backdrop-filter:blur(12px);}
.lg-field-wrap:focus-within{border-color:var(--accent);box-shadow:0 0 8px rgba(255,255,255,.18);}
.lg-field-static{font-size:12px;color:#ffffff;font-family:'JetBrains Mono',monospace;}
.lg-field-hint{font-size:9px;color:#ffffff;margin-top:4px;opacity:.7;}
.lg-input{width:100%;background:transparent;border:none;outline:none;font-family:'JetBrains Mono',monospace;font-size:13px;color:#ffffff;letter-spacing:2px;}
.lg-input::placeholder{color:#ffffff;opacity:.4;}
.lg-btn{width:100%;padding:16px;font-family:'Bebas Neue',sans-serif;font-size:13px;font-weight:900;letter-spacing:2.5px;background:#ffffff;border:1px solid rgba(255,255,255,.18);border-radius:100px;color:#000;cursor:pointer;transition:all .3s ease;text-transform:uppercase;box-shadow:0 0 12px rgba(255,255,255,.12);}
.lg-btn:hover:not(:disabled){transform:scale(1.04);box-shadow:0 0 24px rgba(255,255,255,.2);}
.lg-btn:disabled{opacity:.65;cursor:not-allowed;}
.lg-status{margin-top:20px;display:flex;align-items:center;justify-content:center;gap:8px;}
.lg-dot{width:5px;height:5px;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.4);}
.lg-status-text{font-size:9px;color:var(--text-dim);letter-spacing:1px;}

/* ── GHOST TERMINAL ── */
@keyframes gt-fadein{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes gt-pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes gt-blink{0%,100%{opacity:1}50%{opacity:0}}
.gt-cursor{animation:gt-blink .9s step-end infinite;color:var(--text);}
.gt-line{animation:gt-fadein .18s ease both;}

/* ── HERO ── */
@keyframes hero-in{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
@keyframes hero-badge-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes hero-typing{from{width:0}to{width:100%}}
@keyframes hero-grid-drift{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(-14px,-10px,0)}100%{transform:translate3d(0,0,0)}}
@keyframes hero-scan-sweep{0%{transform:translate3d(-8%,-120%,0) rotate(8deg)}100%{transform:translate3d(18%,140%,0) rotate(8deg)}}
@keyframes hero-star-drift{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(-10px,8px,0)}100%{transform:translate3d(0,0,0)}}
@keyframes hero-wire-float{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}50%{transform:translate3d(6px,-8px,0) rotate(2deg)}}
@keyframes hero-right-pulse{0%,100%{opacity:.18}50%{opacity:.32}}
@keyframes live-bubble-float-1{0%{transform:translate3d(0,100vh,0) scale(0)}50%{transform:translate3d(90px,0,0) scale(.8)}100%{transform:translate3d(0,-100vh,0) scale(0)}}
@keyframes live-bubble-float-2{0%{transform:translate3d(-80px,100vh,0) scale(0)}50%{transform:translate3d(60px,10vh,0) scale(1)}100%{transform:translate3d(150px,-100vh,0) scale(0)}}
@keyframes live-bubble-float-3{0%{transform:translate3d(150px,100vh,0) scale(0)}50%{transform:translate3d(-40px,5vh,0) scale(.95)}100%{transform:translate3d(-180px,-100vh,0) scale(0)}}
@keyframes live-bubble-float-4{0%{transform:translate3d(60px,100vh,0) scale(0)}50%{transform:translate3d(40px,15vh,0) scale(1)}100%{transform:translate3d(-120px,-100vh,0) scale(0)}}
@keyframes live-bubble-float-5{0%{transform:translate3d(-120px,100vh,0) scale(0)}50%{transform:translate3d(100px,8vh,0) scale(.98)}100%{transform:translate3d(200px,-100vh,0) scale(0)}}
@keyframes rotate-ring-1{from{transform:rotate(0deg) scale(1)}to{transform:rotate(360deg) scale(1.05)}}
@keyframes rotate-ring-2{from{transform:rotate(360deg) scale(.9)}to{transform:rotate(0deg) scale(.95)}}
@keyframes glow-pulse-1{0%,100%{opacity:.2}50%{opacity:.6}}
@keyframes glow-pulse-2{0%,100%{opacity:.15}50%{opacity:.55}}
@keyframes morph-orb{0%{border-radius:50%}25%{border-radius:45% 55% 48% 52%}50%{border-radius:50%}75%{border-radius:52% 48% 55% 45%}100%{border-radius:50%}}
@keyframes search-glow{0%{transform:translateX(-100%) skewX(-18deg);}100%{transform:translateX(100%) skewX(-18deg);}}

.wx-hero{min-height:100vh;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:80px 100px;background:#000;position:relative;overflow:hidden;}
.wx-hero .hero-starfield{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.live-particle-burst{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.live-particle{position:absolute;width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.7);left:50%;bottom:0;box-shadow:0 0 6px rgba(255,255,255,.4);}
.live-particle:nth-child(1){animation:live-bubble-float-1 8s ease-in infinite;}
.live-particle:nth-child(2){animation:live-bubble-float-2 9s ease-in infinite;animation-delay:1s;width:5px;height:5px;}
.live-particle:nth-child(3){animation:live-bubble-float-3 10s ease-in infinite;animation-delay:2s;}
.live-particle:nth-child(4){animation:live-bubble-float-4 8.5s ease-in infinite;animation-delay:.5s;}
.live-particle:nth-child(5){animation:live-bubble-float-5 9.5s ease-in infinite;animation-delay:1.5s;}
.glow-rings-container{position:absolute;width:100%;height:100%;inset:0;pointer-events:none;z-index:0;}
.glow-ring{position:absolute;border:1px solid rgba(255,255,255,.3);border-radius:50%;left:50%;top:50%;transform-origin:center;box-shadow:0 0 20px rgba(255,255,255,.2);}
.glow-ring-1{width:240px;height:240px;margin-left:-120px;margin-top:-120px;animation:rotate-ring-1 12s linear infinite, glow-pulse-1 6s ease-in-out infinite;}
.glow-ring-2{width:360px;height:360px;margin-left:-180px;margin-top:-180px;animation:rotate-ring-2 16s linear infinite, glow-pulse-2 7s ease-in-out infinite;border-color:rgba(255,255,255,.2);}
.glow-ring-3{width:480px;height:480px;margin-left:-240px;margin-top:-240px;animation:rotate-smooth 20s linear infinite reverse;border-color:#ffffff;border-width:2px;box-shadow:0 0 50px rgba(255,255,255,.45),inset 0 0 70px rgba(0,0,0,.55);}
.glow-orb{position:absolute;border-radius:50%;background:radial-gradient(circle at 35% 35%, rgba(255,255,255,.3), rgba(255,255,255,.05));box-shadow:0 0 48px rgba(255,255,255,.25);animation:morph-orb 8s ease-in-out infinite;}
.glow-orb-1{right:18%;top:24%;width:100px;height:100px;}
.glow-orb-2{left:12%;bottom:20%;width:70px;height:70px;animation:morph-orb 11s ease-in-out infinite reverse;animation-delay:2s;}
.wx-hero .hero-starfield::before,.wx-hero .hero-starfield::after{content:'';position:absolute;inset:-8%;background-image:radial-gradient(circle at 8% 12%, rgba(255,255,255,.85) 0 1px, transparent 1.5px),radial-gradient(circle at 22% 58%, rgba(255,255,255,.65) 0 1px, transparent 1.5px),radial-gradient(circle at 36% 72%, rgba(255,255,255,.55) 0 1px, transparent 1.5px),radial-gradient(circle at 52% 48%, rgba(255,255,255,.62) 0 1px, transparent 1.5px),radial-gradient(circle at 66% 66%, rgba(255,255,255,.48) 0 1px, transparent 1.5px),radial-gradient(circle at 82% 54%, rgba(255,255,255,.7) 0 1px, transparent 1.5px),radial-gradient(circle at 12% 84%, rgba(255,255,255,.55) 0 1px, transparent 1.5px),radial-gradient(circle at 68% 88%, rgba(255,255,255,.42) 0 1px, transparent 1.5px);opacity:.58;animation:hero-star-drift 22s linear infinite;}
.wx-hero .hero-starfield::after{transform:scale(1.08);opacity:.36;animation-duration:30s;animation-direction:reverse;}
.hero-constellation{position:absolute;width:260px;height:220px;pointer-events:none;opacity:.62;animation:hero-wire-float 14s ease-in-out infinite;z-index:1;}
.hero-constellation svg{width:100%;height:100%;overflow:visible;}
.hero-constellation polygon,.hero-constellation line{stroke:rgba(255,255,255,.22);stroke-width:1;fill:none;}
.hero-constellation circle{fill:rgba(255,255,255,.28);}
.hero-constellation-a{left:4%;bottom:2%;}
.hero-constellation-b{right:4%;top:1%;width:220px;height:180px;animation-duration:17s;animation-direction:reverse;}
.wx-hero .hero-screen-fx{position:absolute;inset:0;pointer-events:none;z-index:0;}
.wx-hero .hero-screen-fx::after{content:'';position:absolute;top:-35%;left:-20%;width:42%;height:170%;background:linear-gradient(180deg, transparent 0%, rgba(255,255,255,.02) 30%, rgba(255,255,255,.045) 48%, rgba(255,255,255,.02) 66%, transparent 100%);filter:blur(12px);opacity:.22;animation:hero-scan-sweep 9s linear infinite;}
.wx-hero::before{content:'';position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.01) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.01) 1px, transparent 1px);background-size:64px 64px;opacity:.05;mask-image:radial-gradient(circle at center, black 42%, transparent 92%);animation:hero-grid-drift 18s ease-in-out infinite;z-index:0;}
.hero-bg-right{position:absolute;right:0;top:0;bottom:0;width:58%;background:rgba(0,0,0,.95);border-left:1px solid rgba(255,255,255,.06);backdrop-filter:blur(12px);z-index:0;animation:hero-right-pulse 10s ease-in-out infinite;}
.hero-badge{display:inline-flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.1);border-radius:100px;padding:8px 18px;margin-bottom:28px;font-size:10px;font-weight:600;color:var(--text-soft);animation:hero-badge-in .6s ease both;letter-spacing:1px;background:rgba(255,255,255,.04);backdrop-filter:blur(12px);}
.hero-badge-dot{width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.45);}
.hero-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(60px,10vw,118px);letter-spacing:7px;color:#e2e8f0;line-height:.9;margin-bottom:22px;animation:hero-in .8s ease both;animation-delay:.1s;text-shadow:0 0 30px rgba(255,255,255,.14);position:relative;z-index:1;}
.hero-desc{font-size:16px;color:#f8fafc;line-height:1.95;max-width:640px;margin-bottom:44px;animation:hero-in .8s ease both;animation-delay:.2s;}
.hero-status-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:-10px 0 24px;animation:hero-in .8s ease both;animation-delay:.25s;}
.hero-status-chip{display:inline-flex;align-items:center;gap:8px;padding:8px 15px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:rgba(255,255,255,.85);font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;backdrop-filter:blur(10px);}
.hero-status-chip.live{border-color:rgba(255,255,255,.2);box-shadow:0 0 12px rgba(255,255,255,.12);}
.hero-status-dot{width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 10px rgba(255,255,255,.3);animation:gt-pulse 1.6s ease-in-out infinite;}
.hero-typing{display:inline-flex;align-items:center;max-width:100%;overflow:hidden;white-space:nowrap;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1.4px;color:rgba(226,232,240,.72);}
.hero-typing span{display:inline-block;overflow:hidden;white-space:nowrap;border-right:1px solid rgba(255,255,255,.5);width:0;animation:hero-typing 3.6s steps(38,end) .5s forwards, gt-blink .9s step-end infinite;}
.hero-features{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:48px;animation:hero-in .8s ease both;animation-delay:.3s;}
.hero-feature{font-size:10px;font-weight:700;letter-spacing:1.7px;color:#fff;border:1px solid rgba(255,255,255,.12);padding:8px 16px;border-radius:100px;text-transform:uppercase;background:rgba(255,255,255,.03);backdrop-filter:blur(10px);transition:all .3s ease;}
.hero-feature:hover{border-color:rgba(255,255,255,.24);box-shadow:0 0 10px rgba(255,255,255,.1);}
.hero-input-row{position:relative;display:grid;grid-template-columns:1fr auto;align-items:center;gap:20px;width:100%;max-width:none;padding:24px 28px;background:rgba(18,18,20,.94);border:1px solid rgba(255,255,255,.12);border-radius:999px;backdrop-filter:blur(34px);box-shadow:0 24px 72px rgba(0,0,0,.45);animation:hero-in .8s ease both;animation-delay:.4s;overflow:hidden;}
.hero-input-row::after{content:'';position:absolute;left:-40%;top:0;bottom:0;width:120%;background:linear-gradient(90deg, transparent 0%, rgba(255,255,255,.12) 25%, rgba(255,255,255,.24) 50%, rgba(255,255,255,.12) 75%, transparent 100%);transform:skewX(-18deg);opacity:.32;animation:search-glow 5.5s linear infinite;pointer-events:none;}
.wx-input{width:100%;min-width:0;font-family:'JetBrains Mono',monospace;font-size:16px;padding:20px 24px;background:#090909;border:1px solid rgba(255,255,255,.14);border-radius:14px;color:#fff;outline:none;transition:border-color .2s,background .2s;}
.wx-input:focus{border-color:rgba(255,255,255,.5);box-shadow:0 0 24px rgba(255,255,255,.12);background:#0b0b0b;}
.wx-input::placeholder{color:rgba(255,255,255,.42);}
.wx-scan-btn{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:800;letter-spacing:1.8px;padding:20px 42px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:#ffffff;color:#000;cursor:pointer;transition:all .2s;white-space:nowrap;}
.wx-scan-btn:hover{background:#f2f2f2;transform:translateY(-1px);}
.hero-warn{display:flex;align-items:center;gap:8px;margin-top:16px;font-size:10px;color:rgba(255,255,255,.68);animation:hero-in .8s ease both;animation-delay:.5s;}
.hero-warn-dot{width:5px;height:5px;border-radius:50%;background:#fff;flex-shrink:0;}
.hero-terminal{margin-top:18px;width:100%;max-width:540px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.02);backdrop-filter:blur(12px);overflow:hidden;animation:hero-in .8s ease both;animation-delay:.56s;}
.hero-terminal-top{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);}
.hero-terminal-title{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);}
.hero-terminal-state{font-size:9px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:var(--text);}
.hero-terminal-body{padding:12px 14px;display:flex;flex-direction:column;gap:8px;}
.hero-log{display:flex;gap:10px;align-items:flex-start;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.75;color:rgba(255,255,255,.74);}
.hero-log-tag{color:var(--text);min-width:36px;font-weight:700;}
.hero-log-text{color:rgba(255,255,255,.62);}
.hero-feature-card{background:#0a0a0a;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px;transition:all .3s ease;box-shadow:0 8px 24px rgba(0,0,0,.24);position:relative;overflow:hidden;}
.hero-feature-card:hover{border-color:rgba(255,255,255,.16);transform:translateY(-4px);}
.wx-err{font-size:11px;color:#fecaca;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.28);border-radius:12px;padding:12px 18px;margin-bottom:16px;width:100%;max-width:540px;}

/* ── REPORT HEADER ── */
.wx-rpt-hdr{display:flex;align-items:center;justify-content:space-between;padding:0 0 20px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:24px;flex-wrap:wrap;gap:12px;}
.wx-rpt-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(24px,3vw,38px);letter-spacing:5.5px;color:var(--text);}
.wx-rpt-meta{font-size:11px;color:var(--text-dim);margin-top:6px;line-height:1.8;}

/* ── GRIDS ── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
@media(max-width:900px){.g2,.g3,.g4{grid-template-columns:1fr 1fr;}.wx-hero{padding:60px 24px;}.hero-bg-right{display:none;}}
@media(max-width:600px){.g2,.g3,.g4{grid-template-columns:1fr;}.wx-body{padding:16px;}.wx-nav{padding:0 16px;}.hero-input-row{flex-direction:column;}.wx-scan-btn{width:100%;}}

/* ── MISC ── */
.mono{font-family:'JetBrains Mono',monospace;}
@keyframes db-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.wx-section-label{font-size:9px;font-weight:700;letter-spacing:3px;color:var(--text-dim);text-transform:uppercase;display:flex;align-items:center;gap:16px;margin-bottom:16px;}
.wx-section-label::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.08);}
  `;
  document.head.appendChild(s);
};

// ════════════════════════════════════════════════════════════
// TICKER
// ════════════════════════════════════════════════════════════
const Ticker = () => (
  <div className="ticker-wrap">
    <div className="ticker-inner">
      {['WHITENX VAPT PLATFORM','//','RECONNAISSANCE','//','PORT SCANNING','//','CVE DETECTION','//','OSINT INTELLIGENCE','//','SSL ANALYSIS','//','RISK SCORING','//','VULNERABILITY ASSESSMENT','//','PENETRATION TESTING','//'].map((t,i)=>(
        <span key={i}>{t}</span>
      ))}
      {['WHITENX VAPT PLATFORM','//','RECONNAISSANCE','//','PORT SCANNING','//','CVE DETECTION','//','OSINT INTELLIGENCE','//','SSL ANALYSIS','//','RISK SCORING','//','VULNERABILITY ASSESSMENT','//','PENETRATION TESTING','//'].map((t,i)=>(
        <span key={`b${i}`}>{t}</span>
      ))}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════
// LEGAL PAGE
// ════════════════════════════════════════════════════════════
const LegalPage = ({ onAccept }) => {
  const items = [
    <>You have <strong>explicit written authorization</strong> from the target system owner prior to initiating any scan.</>,
    <>You will <strong>NEVER</strong> use this platform against any system without valid legal authorization.</>,
    <>All actions, IPs, timestamps, and session data are <strong>permanently logged and auditable</strong> by law enforcement.</>,
    <>You accept <strong>full criminal, civil, and financial liability</strong> for any misuse or unauthorized access.</>,
    <>You will <strong>immediately cease all activity</strong> and self-report upon discovery of unauthorized access.</>,
    <>You are of <strong>legal age (18+)</strong>, legally competent, and acting within a legitimate engagement.</>,
  ];
  const laws = [
    { region: 'INDIA', text: 'IT Act 2000 — §43, 66, 66F, 67, 69, 70, 72' },
    { region: 'INDIA', text: 'Bharatiya Nyaya Sanhita 2023 — Cybercrime' },
    { region: 'INDIA', text: 'IPC / BNS — Conspiracy, Fraud, Stalking' },
    { region: 'USA', text: 'CFAA — 18 U.S.C. § 1030 (up to 20 years)' },
    { region: 'EU', text: 'GDPR — Up to €20M or 4% annual turnover' },
    { region: 'INTL', text: 'Budapest Convention — 67+ nations' },
  ];
  return (
    <div className="lp-wrap">
      <Ticker />
      <div className="lp-bg-diamond" />
      <div className="lp-bg-shapes">
        <div className="lp-shape-ring lp-shape-ring-1" />
        <div className="lp-shape-ring lp-shape-ring-2" />
        <div className="lp-shape-orb" />
        <div className="lp-big-circle" />
      </div>
      <div className="lp-container" style={{marginTop:48}}>
        <div className="lp-badge-top"><span className="lp-badge-dot"/>RESTRICTED ACCESS — AUTHORIZED PERSONNEL ONLY</div>
        <div className="lp-title">LEGAL<br/>DISCLAIMER</div>
        <div className="lp-subtitle">READ CAREFULLY BEFORE PROCEEDING — ALL ACTIVITY IS MONITORED</div>
        <div className="lp-box">
          <div className="lp-box-hdr">Mandatory Declaration</div>
          <div className="lp-box-body">
            <div style={{fontSize:11,color:'rgba(255,255,255,.72)',marginBottom:20}}>By proceeding, you solemnly declare under penalty of perjury that:</div>
            {items.map((item, i) => (
              <div key={i} className="lp-item" style={{animationDelay:`${0.25+i*0.05}s`}}>
                <div className="lp-item-num">{i+1}</div>
                <div className="lp-item-text">{item}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lp-box" style={{marginBottom:24}}>
          <div className="lp-box-hdr">Applicable Laws — Zero Tolerance</div>
          <div className="lp-box-body">
            <div className="lp-laws-grid">
              {laws.map((l,i)=>(
                <div key={i} className="lp-law" style={{animationDelay:`${0.35+i*0.05}s`}}>
                  <div className="lp-law-region">{l.region}</div>
                  <div className="lp-law-text">{l.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:12,padding:'16px 20px',marginBottom:24,display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}>
          {[{label:'Sessions Monitored',val:'LIVE'},{label:'Jurisdiction',val:'67+ Nations'},{label:'Prosecution Rate',val:'94.2%'}].map((s,i)=>(
            <div key={i} style={{flex:1,minWidth:120,textAlign:'center'}}>
              <div style={{fontSize:7,color:'rgba(255,255,255,.6)',letterSpacing:'2px',marginBottom:4,textTransform:'uppercase'}}>{s.label}</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:'#fff',letterSpacing:2}}>{s.val}</div>
            </div>
          ))}
        </div>
        <button className="lp-accept-btn" onClick={onAccept}>I Accept — I Am Authorized & Assume Full Legal Liability</button>
        <div className="lp-footer-text">SESSION LOGGED &nbsp;·&nbsp; IP RECORDED &nbsp;·&nbsp; {new Date().toISOString()}</div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// LOGIN PAGE
// ════════════════════════════════════════════════════════════
const LoginPage = ({ onLogin }) => {
  const [key, setKey]   = useState('');
  const [auth, setAuth] = useState(false);
  const [err,  setErr]  = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  useEffect(()=>{
    if(!locked) return;
    let t=30; setLockTimer(t);
    const iv=setInterval(()=>{ t--; setLockTimer(t); if(t<=0){clearInterval(iv);setLocked(false);setAttempts(0);} },1000);
    return()=>clearInterval(iv);
  },[locked]);

  const submit = async e => {
    e.preventDefault();
    if(locked) return;
    setErr(''); setAuth(true);
    await new Promise(r=>setTimeout(r,900));
    const normalized = key.trim().toUpperCase();
    if(normalized !== ACCESS_KEY){
      const newAtt = attempts+1; setAttempts(newAtt); setAuth(false);
      if(newAtt>=3){ setLocked(true); setErr('Too many failed attempts — access locked for 30s'); }
      else { setErr(`Invalid access key — ${3-newAtt} attempt${3-newAtt===1?'':'s'} remaining`); }
      return;
    }
    setAuth(false); onLogin();
  };

  return (
    <div className="lg-wrap">
      <div className="lg-bg"/>
      <div className="lg-diamond"/>
      <div className="lg-red-circle"/>
      <div className="lg-morph-orb lg-morph-orb-1"/>
      <div className="lg-morph-orb lg-morph-orb-2"/>
      <div className="lg-card">
        <div className="lg-card-top">
          <div className="lg-logo">WHITENX</div>
          <div className="lg-logo-sub">VULNERABILITY ASSESSMENT PLATFORM</div>
          <div style={{display:'flex',gap:16,marginTop:20,flexWrap:'wrap'}}>
            {['RECON','PORT SCAN','CVE MATCH','OSINT'].map(t=>(
              <span key={t} style={{fontSize:8,color:'#ffffff',letterSpacing:'1.5px',fontWeight:600,opacity:.8}}>{t}</span>
            ))}
          </div>
        </div>
        <div className="lg-card-body">
          {err&&<div className="lg-err">✗ {err}</div>}
          {locked ? (
            <div style={{textAlign:'center',padding:'32px 0'}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:64,color:'rgba(255,255,255,.18)',letterSpacing:4}}>{lockTimer}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.6)',letterSpacing:'2px',marginTop:8}}>ACCESS LOCKED — WAIT TO RETRY</div>
            </div>
          ):(
            <form onSubmit={submit}>
              <label className="lg-label">System Identifier</label>
              <div className="lg-field-wrap">
                <div className="lg-field-static">WHITENX-VAPT-CONSOLE</div>
                <div className="lg-field-hint">Authorized terminal — session logging active</div>
              </div>
              <label className="lg-label">Access Key</label>
              <div className="lg-field-wrap">
                <input className="lg-input" type="password" value={key} onChange={e=>setKey(e.target.value)}
                  placeholder="WX-XXXX-XXXX-XXXX-XXXX" autoFocus required disabled={auth} autoComplete="off" spellCheck={false}/>
              </div>
              <div style={{background:'rgba(255,255,255,.03)',border:'1px dashed rgba(255,255,255,.12)',borderRadius:12,padding:'12px 16px',marginBottom:24}}>
                <div style={{fontSize:8,color:'rgba(255,255,255,.6)',letterSpacing:'2px',marginBottom:6,fontWeight:600}}>KEY FORMAT</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:'rgba(255,255,255,.7)',letterSpacing:3}}>WX — XXXX — XXXX — XXXX — XXXX</div>
              </div>
              <button type="submit" className="lg-btn" disabled={auth}>{auth?'Verifying...':'Authenticate →'}</button>
            </form>
          )}
          <div className="lg-status">
            <div className="lg-dot"/>
            <span className="lg-status-text">{attempts>0?`${attempts} failed attempt${attempts>1?'s':''}`:'Intrusion detection active'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// GHOST TERMINAL
// ════════════════════════════════════════════════════════════
const STAGES = [
  {id:'recon',short:'RECON',full:'RECONNAISSANCE'},
  {id:'ports',short:'PORTS',full:'PORT SCANNING'},
  {id:'svcfp',short:'SVCFP',full:'SERVICE FINGERPRINT'},
  {id:'vulns',short:'VULNS',full:'VULN DETECTION'},
  {id:'osint',short:'OSINT',full:'OSINT INTELLIGENCE'},
  {id:'ssl',  short:'SSL',  full:'SSL ANALYSIS'},
  {id:'score',short:'SCORE',full:'RISK SCORING'},
];

const GhostTerminal = ({ si, progress, target, apiDone, scanResult, onCancel }) => {
  const [entries,  setEntries]  = useState([]);
  const [counts,   setCounts]   = useState({crit:0,high:0,med:0,low:0});
  const [openPorts,setPorts]    = useState([]);
  const [elapsed,  setElapsed]  = useState(0);
  const [disp,     setDisp]     = useState(0);
  const [done,     setDone]     = useState(false);
  const [csi,      setCSI]      = useState(si||0);
  const endRef   = useRef(null);
  const procRef  = useRef(false);
  const phaseRef = useRef({});

  const now=()=>new Date().toLocaleTimeString('en-US',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const push=useCallback(e=>setEntries(p=>[...p,{...e,time:now()}]),[]);
  const line=useCallback((pfx,txt)=>push({type:'line',pfx,txt}),[push]);
  const cmd =useCallback(txt=>push({type:'cmd',txt}),[push]);
  const sp  =useCallback(()=>push({type:'sp'}),[push]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[entries]);
  useEffect(()=>{const t=setInterval(()=>setElapsed(e=>e+1),1000);return()=>clearInterval(t);},[]);
  useEffect(()=>{setCSI(si);},[si]);
  useEffect(()=>{const tgt=apiDone?progress:Math.min(progress,84);setDisp(p=>tgt>p?tgt:p);},[progress,apiDone]);

  useEffect(()=>{
    if(apiDone||phaseRef.current[si]) return;
    phaseRef.current[si]=true;
    const scripts=[
      ()=>{sp();cmd(`whitenx --target ${target} --mode full`);setTimeout(()=>line('INF','Initializing scan engine v2.4.1'),300);setTimeout(()=>line('INF','CVE database loaded — 48,291 entries'),900);setTimeout(()=>line('OK','Engine ready. Full scan takes 5-6 min...'),1400);setTimeout(()=>{sp();cmd(`nmap -sV -sC -T4 ${target}`);},1800);setTimeout(()=>line('INF',`Resolving DNS: ${target}`),2400);setTimeout(()=>line('OK','Host is up — ICMP echo received'),3100);},
      ()=>{sp();cmd(`nmap -p- --min-rate 5000 ${target}`);setTimeout(()=>line('INF','SYN scan — 65535 ports'),400);setTimeout(()=>line('INF','Probing common service ranges'),1500);},
      ()=>{sp();cmd(`nmap -sV --version-intensity 9 ${target}`);setTimeout(()=>line('INF','Banner grabbing active'),1400);},
      ()=>{sp();cmd(`whitenx --cve-match --target ${target}`);setTimeout(()=>line('INF','Querying NVD — matching versions'),400);setTimeout(()=>line('WRN','Potential matches found — verifying'),2500);},
      ()=>{sp();cmd(`whitenx --osint ${target}`);setTimeout(()=>line('INF','WHOIS lookup initiated'),400);setTimeout(()=>line('INF','Certificate transparency — crt.sh'),1200);},
      ()=>{sp();cmd(`whitenx --ssl-check ${target}`);setTimeout(()=>line('INF','TLS handshake initiated'),400);setTimeout(()=>line('INF','Cipher suite enumeration'),2000);},
      ()=>{sp();cmd(`whitenx --risk-score ${target}`);setTimeout(()=>line('INF','Computing CVSS v3.1 base scores'),400);setTimeout(()=>line('INF','Finalizing risk report...'),2000);},
    ];
    scripts[si]?.();
  },[si,apiDone]);

  useEffect(()=>{
    if(!apiDone||!scanResult||procRef.current) return;
    procRef.current=true;
    const r=scanResult;
    const vulns=r.vulnerabilities||[];
    const ports=r.port_scan?.services||r.port_scan?.open_ports||[];
    let delay=400;
    const d=ms=>{delay+=ms;return delay;};
    push({type:'sep',time:now()});
    cmd('# SCAN DATA — rendering results');
    ports.forEach((p,i)=>setTimeout(()=>{
      setPorts(prev=>[...prev,{port:p.port,svc:p.service||'unknown'}]);
      line('OK',`PORT ${p.port}/tcp  OPEN  ${p.service||'unknown'}${p.version?` v${p.version}`:''}`);
    },d(0)+i*380));
    vulns.forEach((v,i)=>{
      const sev=(v.severity||'').toUpperCase();
      setTimeout(()=>{
        if(sev==='CRITICAL'){setEntries(p=>[...p,{type:'crit',time:now(),id:v.type||'CRITICAL',port:v.port,rec:v.recommendation}]);setCounts(c=>({...c,crit:c.crit+1}));}
        else if(sev==='HIGH'){setEntries(p=>[...p,{type:'high',time:now(),id:v.type||'HIGH',port:v.port,rec:v.recommendation}]);setCounts(c=>({...c,high:c.high+1}));}
        else if(sev==='MEDIUM'){line('WRN',`[MED] ${v.type}  port ${v.port||'N/A'}`);setCounts(c=>({...c,med:c.med+1}));}
        else{line('INF',`[LOW] ${v.type}  port ${v.port||'N/A'}`);setCounts(c=>({...c,low:c.low+1}));}
      },d(0)+i*600);
    });
    setTimeout(()=>{sp();line('OK','══════════ SCAN COMPLETE ══════════');setDisp(100);setDone(true);},d(2400));
  },[apiDone,scanResult]);

  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div style={{position:'fixed',inset:0,background:'#000',zIndex:9999,display:'flex',flexDirection:'column',overflow:'hidden',fontFamily:"'JetBrains Mono',monospace"}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56,background:'rgba(0,0,0,.94)',borderBottom:'1px solid rgba(255,255,255,.08)',backdropFilter:'blur(16px)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:18}}>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:'6px',color:'#fff'}}>WHITENX</span>
          <span style={{fontSize:10,color:done?'rgba(255,255,255,.9)':'rgba(255,255,255,.72)',border:`1px solid ${done?'rgba(255,255,255,.3)':'rgba(255,255,255,.1)'}`,padding:'5px 14px',borderRadius:100,letterSpacing:'2px',fontWeight:600,background:'rgba(255,255,255,.04)'}}>{done?'SCAN COMPLETE':'SCANNING'}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:24}}>
          {[{l:'TARGET',v:target},{l:'PHASE',v:`${csi+1}/7`},{l:'THREATS',v:counts.crit+counts.high+counts.med+counts.low},{l:'TIME',v:fmt(elapsed)}].map(s=>(
            <div key={s.l} style={{textAlign:'right'}}>
              <div style={{fontSize:9,color:'rgba(255,255,255,.6)',letterSpacing:'1.5px'}}>{s.l}</div>
              <div style={{fontSize:13,color:'#fff',fontWeight:600}}>{s.v}</div>
            </div>
          ))}
          {!done&&<button onClick={onCancel} style={{fontSize:10,color:'#fff',background:'transparent',border:'1px solid rgba(255,255,255,.18)',padding:'8px 16px',borderRadius:100,cursor:'pointer',whiteSpace:'nowrap'}}>CANCEL</button>}
        </div>
      </div>
      {!done&&(
        <div style={{background:'#0a0a0a',borderBottom:'1px solid #111',padding:'10px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#ffffff',display:'inline-block',animation:'gt-pulse 1.5s ease-in-out infinite',flexShrink:0}}/>
            <span style={{fontSize:11,color:'#ffffff',letterSpacing:'1.5px',fontWeight:600}}>{apiDone?'RENDERING RESULTS...':'DEEP SCAN IN PROGRESS — Keep tab open'}</span>
          </div>
          <span style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>Est. time: 5–6 minutes</span>
        </div>
      )}
      <div style={{flex:1,display:'flex',overflow:'hidden',minHeight:0}}>
        <div style={{width:100,background:'#030303',borderRight:'1px solid #111',padding:'20px 0',display:'flex',flexDirection:'column',gap:4,flexShrink:0}}>
          {STAGES.map((s,i)=>{const isDone=i<csi,isCur=i===csi;return(
            <div key={s.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',background:isCur?'#0a0a0a':'transparent',borderLeft:isCur?'2px solid #fff':'2px solid transparent'}}>
              <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,border:`1px solid ${isDone?'#ffffff':isCur?'#fff':'rgba(255,255,255,.14)'}`,background:isDone?'#ffffff40':isCur?'#ffffff20':'transparent'}}>
                {isDone&&<div style={{width:4,height:4,borderRadius:'50%',background:'#ffffff',margin:'2px'}}/>}
                {isCur&&<div style={{width:4,height:4,borderRadius:'50%',background:'#fff',margin:'2px',animation:'gt-pulse 1s ease-in-out infinite'}}/>}
              </div>
              <span style={{fontSize:10,letterSpacing:'1.5px',fontWeight:700,color:isDone?'rgba(255,255,255,.8)':isCur?'#fff':'rgba(255,255,255,.28)'}}>{s.short}</span>
            </div>
          );})}
        </div>
        <div style={{flex:1,background:'#000',display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 18px',borderBottom:'1px solid #0d0d0d',flexShrink:0}}>
            <span style={{fontSize:12,color:'rgba(255,255,255,.75)'}}>whitenx@probe:<span style={{color:'#fff'}}>~/{target}</span>$</span>
            <span style={{fontSize:9,color:'rgba(255,255,255,.36)',letterSpacing:'1px'}}>{STAGES[csi]?.full}</span>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'14px 18px',scrollbarWidth:'none'}}>
            {entries.map((e,i)=>{
              if(e.type==='sp') return <div key={i} style={{height:10}}/>;
              if(e.type==='sep') return <div key={i} style={{borderTop:'1px solid #0d0d0d',margin:'12px 0'}}/>;
              if(e.type==='cmd') return <div key={i} className="gt-line" style={{display:'flex',gap:8,marginBottom:10,fontSize:13}}><span style={{color:'rgba(255,255,255,.4)'}}>$</span><span style={{color:'rgba(255,255,255,.78)'}}>{e.txt}</span></div>;
              if(e.type==='crit') return <div key={i} style={{margin:'10px 0 14px',borderLeft:'2px solid #ffffff',background:'#0a0a0a',padding:'12px 16px',borderRadius:'0 8px 8px 0'}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><span style={{fontSize:9,fontWeight:700,letterSpacing:'2px',color:'#ffffff',background:'#1a1a1a',border:'1px solid #333',padding:'4px 12px',borderRadius:100}}>CRITICAL</span><span style={{fontSize:12,color:'#ffffff',fontWeight:600}}>{e.id}</span></div>{e.port&&<div style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>Port: <span style={{color:'#fff'}}>{e.port}</span></div>}{e.rec&&<div style={{fontSize:10,color:'rgba(255,255,255,.6)',marginTop:4}}>{e.rec.substring(0,80)}</div>}</div>;
              if(e.type==='high') return <div key={i} style={{margin:'8px 0 12px',borderLeft:'2px solid #cccccc',background:'#0a0a0a',padding:'10px 16px',borderRadius:'0 8px 8px 0'}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}><span style={{fontSize:9,fontWeight:700,letterSpacing:'2px',color:'#cccccc',background:'#1a1a1a',border:'1px solid #333',padding:'4px 10px',borderRadius:100}}>HIGH</span><span style={{fontSize:12,color:'#cccccc'}}>{e.id}</span></div>{e.port&&<div style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>Port: <span style={{color:'#fff'}}>{e.port}</span></div>}</div>;
              const isLast=i===entries.length-1;
              return <div key={i} className="gt-line" style={{display:'flex',gap:8,padding:'2px 0',fontSize:12,lineHeight:1.8}}><span style={{color:'rgba(255,255,255,.28)',fontSize:10,minWidth:60,flexShrink:0}}>[{e.time}]</span><span style={{color:'rgba(255,255,255,.72)',fontWeight:700,fontSize:10,minWidth:32,flexShrink:0}}>{e.pfx||'INF'}</span><span style={{color:'rgba(255,255,255,.68)'}}>{e.txt}{isLast&&!done&&<span className="gt-cursor">█</span>}</span></div>;
            })}
            <div ref={endRef}/>
          </div>
        </div>
        <div style={{width:160,background:'#030303',borderLeft:'1px solid #111',padding:'16px 12px',display:'flex',flexDirection:'column',gap:16,flexShrink:0,overflowY:'auto'}}>
          <div>
            <div style={{fontSize:9,color:'rgba(255,255,255,.28)',letterSpacing:'2px',marginBottom:10,fontFamily:'monospace',fontWeight:600}}>SEVERITY</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
              {[['CRIT',counts.crit,'#ffffff'],['HIGH',counts.high,'#cccccc'],['MED',counts.med,'#999999'],['LOW',counts.low,'#666666']].map(([l,v,c])=>(
                <div key={l} style={{background:'#0a0a0a',borderRadius:8,padding:'8px',borderTop:`2px solid ${c}30`}}>
                  <div style={{fontSize:6,color:'rgba(255,255,255,.6)',letterSpacing:'1px',marginBottom:2}}>{l}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:c,letterSpacing:1}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.28)',letterSpacing:'2px',marginBottom:10,fontFamily:'monospace',fontWeight:600}}>OPEN PORTS</div>
            {openPorts.length===0&&<div style={{fontSize:10,color:'rgba(255,255,255,.28)'}}>scanning...</div>}
            {openPorts.slice(0,6).map((p,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',background:'#0a0a0a',borderRadius:6,padding:'6px 10px',marginBottom:4}}>
                <span style={{fontSize:11,color:'#fff',fontFamily:'monospace'}}>{p.port}</span>
                <span style={{fontSize:9,color:'#ffffff',fontWeight:600}}>OPEN</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:'auto'}}>
            <div style={{fontSize:9,color:'rgba(255,255,255,.28)',letterSpacing:'2px',marginBottom:4,fontFamily:'monospace',fontWeight:600}}>ELAPSED</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:'#fff',letterSpacing:2}}>{fmt(elapsed)}</div>
          </div>
        </div>
      </div>
      <div style={{height:40,background:'#030303',borderTop:'1px solid #111',display:'flex',alignItems:'center',padding:'0 24px',gap:14,flexShrink:0}}>
        <span style={{fontSize:10,color:'rgba(255,255,255,.6)',letterSpacing:'1.5px',minWidth:80,fontFamily:'monospace',fontWeight:600}}>{done?'COMPLETE':apiDone?'PROCESSING':'SCANNING'}</span>
        <div style={{flex:1,height:2,background:'#111',borderRadius:1,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${disp}%`,background:'#ffffff',borderRadius:1,transition:'width .6s ease'}}/>
        </div>
        <span style={{fontSize:12,fontWeight:700,color:'#fff',minWidth:34,textAlign:'right',fontFamily:'monospace'}}>{disp}%</span>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// DASHBOARD COMPONENTS
// ════════════════════════════════════════════════════════════
const SevBadge = ({ s }) => <span className="wx-badge">{s}</span>;

const StatCard = ({ label, val, sub, icon, delay='0s' }) => (
  <div className="wx-stat" style={{animationDelay:delay}}>
    {icon&&<span className="wx-stat-icon">{icon}</span>}
    <div className="wx-stat-label">{label}</div>
    <div className="wx-stat-val">{val}</div>
    {sub&&<div className="wx-stat-sub">{sub}</div>}
  </div>
);

const WxCard = ({ title, badge, children }) => (
  <div className="wx-card">
    <div className="wx-card-hdr">
      <div className="wx-card-title">{title}</div>
      {badge&&<span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{badge}</span>}
    </div>
    <div className="wx-card-body">{children}</div>
  </div>
);

const WxTable = ({ cols, rows, empty = 'No data' }) => (
  <div className="wx-tbl-wrap">
    <table className="wx-tbl">
      <thead>
        <tr>
          {cols.map(c => <th key={c}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={cols.length} style={{textAlign: 'center', color: 'rgba(255,255,255,.4)', padding: 32}}>
              {empty}
            </td>
          </tr>
        ) : (
          rows
        )}
      </tbody>
    </table>
  </div>
);

// ════════════════════════════════════════════════════════════
// PDF GENERATOR — Fixed jsPDF initialization
// ════════════════════════════════════════════════════════════
// eslint-disable-next-line no-unused-vars
const generatePDFLegacy = (result) => {
  // Create PDF with correct initialization
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });
  
  const W = 210;  // width in mm
  const M = 15;   // margin
  const CW = W - M * 2; // content width
  
  let y = 20; // start y position
  
  // ── Color Palette (Premium Black & White) ──
  const C = {
    pureBlack: '#000000',
    richBlack: '#0a0a0a',
    darkBlack: '#111111',
    cardBlack: '#141414',
    borderGray: '#222222',
    lightGray: '#333333',
    mediumGray: '#555555',
    textGray: '#888888',
    textLight: '#bbbbbb',
    textWhite: '#eeeeee',
    pureWhite: '#ffffff'
  };
  
  // ── Helper Functions ──────────────────────────────────────
  const newPage = () => {
    doc.addPage();
    y = 20;
    // Add page background
    doc.setFillColor(C.pureBlack);
    doc.rect(0, 0, W, 297, 'F');
    // Add subtle grid pattern
    doc.setDrawColor(C.darkBlack);
    doc.setLineWidth(0.1);
    for (let i = 0; i < 10; i++) {
      doc.line(M + (i * 18), 0, M + (i * 18), 297);
      doc.line(0, i * 30, W, i * 30);
    }
  };
  
  const guard = (need = 20) => {
    if (y + need > 280) newPage();
  };
  
  const roundedRect = (x, ry, w, h, r, fill, stroke) => {
    doc.setFillColor(fill || C.pureBlack);
    doc.setDrawColor(stroke || C.borderGray);
    doc.setLineWidth(0.3);
    if (stroke) {
      doc.roundedRect(x, ry, w, h, r, r, 'FD');
    } else {
      doc.roundedRect(x, ry, w, h, r, r, 'F');
    }
  };
  
  const txt = (str, x, ty, color, size = 9, style = 'normal', align = 'left') => {
    if (str === null || str === undefined) str = '—';
    if (typeof str !== 'string') str = String(str);
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(color);
    if (align === 'center') {
      doc.text(str, x, ty, { align: 'center' });
    } else if (align === 'right') {
      doc.text(str, x, ty, { align: 'right' });
    } else {
      doc.text(str, x, ty);
    }
  };
  
  const hline = (ly, color = C.borderGray, thickness = 0.2) => {
    doc.setDrawColor(color);
    doc.setLineWidth(thickness);
    doc.line(M, ly, W - M, ly);
  };
  
  const truncate = (s, maxLen) => {
    if (!s) return '—';
    s = String(s);
    return s.length > maxLen ? s.substring(0, maxLen - 2) + '…' : s;
  };
  
  const sevColor = (sev) => {
    const s = (sev || '').toUpperCase();
    if (s === 'CRITICAL') return C.pureWhite;
    if (s === 'HIGH') return C.textWhite;
    if (s === 'MEDIUM') return C.textLight;
    return C.mediumGray;
  };
  
  const sevBgColor = (sev) => {
    const s = (sev || '').toUpperCase();
    if (s === 'CRITICAL') return C.darkBlack;
    if (s === 'HIGH') return C.cardBlack;
    if (s === 'MEDIUM') return C.lightGray;
    return C.mediumGray;
  };
  
  const badge = (label, x, py, width = 20) => {
    const bg = sevBgColor(label);
    const fg = sevColor(label);
    const w = Math.max(width, String(label).length * 2 + 6);
    roundedRect(x, py - 3.5, w, 6, 3, bg, C.borderGray);
    txt(label, x + w / 2, py, fg, 6.5, 'bold', 'center');
  };
  
  const sectionTitle = (title, sub = '') => {
    guard(12);
    y += 4;
    txt(title, M, y, C.pureWhite, 14, 'bold');
    if (sub) {
      txt(sub, M + 70, y, C.textGray, 8, 'normal');
    }
    y += 6;
    hline(y, C.borderGray, 0.3);
    y += 6;
  };
  
  const tableHeader = (cols) => {
    const rowH = 7;
    roundedRect(M, y, CW, rowH, 2, C.darkBlack, C.borderGray);
    let cx = M + 4;
    cols.forEach(({ label, width }) => {
      txt(label.toUpperCase(), cx, y + 4.8, C.textGray, 6.5, 'bold');
      cx += width;
    });
    y += rowH;
    hline(y, C.borderGray, 0.15);
  };
  
  const tableRow = (cells, cols, isAlt = false) => {
    const rowH = 7.5;
    guard(rowH + 2);
    if (isAlt) {
      doc.setFillColor(C.richBlack);
      doc.rect(M, y, CW, rowH, 'F');
    }
    let cx = M + 4;
    cells.forEach((cell, idx) => {
      const col = cols[idx];
      if (cell.type === 'badge') {
        badge(cell.val, cx, y + 5, Math.min(col.width - 4, 22));
      } else {
        txt(truncate(cell.val, Math.floor(col.width / 1.5)), cx, y + 5.2, cell.color || C.textLight, 7, 'normal');
      }
      cx += col.width;
    });
    hline(y + rowH, C.borderGray, 0.1);
    y += rowH;
  };
  
  // ── Decorative Shapes ─────────────────────────────────────
  const addDecorativeShapes = () => {
    // Top accent bar
    doc.setFillColor(C.pureWhite);
    doc.rect(0, 0, W, 1.2, 'F');
    
    // Bottom accent bar
    doc.rect(0, 295.8, W, 1.2, 'F');
    
    // Corner diamonds
    const diamondSize = 8;
    const diamondMargin = 12;
    
    doc.setDrawColor(C.textGray);
    doc.setLineWidth(0.3);
    
    // Top-left diamond
    doc.triangle(diamondMargin, diamondMargin, diamondMargin + diamondSize, diamondMargin - diamondSize, diamondMargin + diamondSize, diamondMargin);
    
    // Top-right diamond
    doc.triangle(W - diamondMargin, diamondMargin, W - diamondMargin - diamondSize, diamondMargin - diamondSize, W - diamondMargin - diamondSize, diamondMargin);
    
    // Bottom-left diamond
    doc.triangle(diamondMargin, 297 - diamondMargin, diamondMargin + diamondSize, 297 - diamondMargin + diamondSize, diamondMargin + diamondSize, 297 - diamondMargin);
    
    // Bottom-right diamond
    doc.triangle(W - diamondMargin, 297 - diamondMargin, W - diamondMargin - diamondSize, 297 - diamondMargin + diamondSize, W - diamondMargin - diamondSize, 297 - diamondMargin);
    
    // Circular rings on corners
    doc.setDrawColor(C.lightGray);
    doc.setLineWidth(0.2);
    doc.circle(diamondMargin + 4, diamondMargin + 4, 12);
    doc.circle(W - diamondMargin - 4, diamondMargin + 4, 12);
    doc.circle(diamondMargin + 4, 297 - diamondMargin - 4, 12);
    doc.circle(W - diamondMargin - 4, 297 - diamondMargin - 4, 12);
  };
  
  // ── Extract Data ──────────────────────────────────────────
  const vulns = result.vulnerabilities || [];
  const svcs = result.fingerprinted_services || result.services || [];
  const ports = result.port_scan?.services || result.port_scan?.open_ports || [];
  const subds = result.subdomain_enum?.subdomains || result.subdomains || [];
  const osint = result.osint || {};
  const sslA = result.ssl_analysis || {};
  const hdrs = osint.http?.security_headers || {};
  const dns = osint.dns || {};
  const whois = osint.whois || {};
  
  // Count vulnerabilities by severity
  const crit = vulns.filter(v => (v.severity || '').toUpperCase() === 'CRITICAL').length;
  const high = vulns.filter(v => (v.severity || '').toUpperCase() === 'HIGH').length;
  const med = vulns.filter(v => (v.severity || '').toUpperCase() === 'MEDIUM').length;
  const low = vulns.filter(v => (v.severity || '').toUpperCase() === 'LOW').length;
  const totalVulns = vulns.length;
  
  // ══════════════════════════════════════════════════════════
  // PAGE 1 — COVER PAGE
  // ══════════════════════════════════════════════════════════
  doc.setFillColor(C.pureBlack);
  doc.rect(0, 0, W, 297, 'F');
  
  // Decorative elements
  addDecorativeShapes();
  
  // Background geometric pattern
  doc.setDrawColor(C.darkBlack);
  doc.setLineWidth(0.2);
  for (let i = 0; i < 5; i++) {
    const size = 30 + i * 20;
    const offset = (W - size) / 2;
    doc.roundedRect(offset, 50 + i * 15, size, size, 4, 'S');
  }
  
  // Main content
  y = 70;
  
  // Logo area
  txt('WHITENX', W / 2, y, C.pureWhite, 52, 'bold', 'center');
  y += 12;
  txt('VULNERABILITY ASSESSMENT', W / 2, y, C.textWhite, 10, 'bold', 'center');
  y += 6;
  txt('PLATFORM', W / 2, y, C.textWhite, 10, 'bold', 'center');
  y += 20;
  
  // Separator line with diamonds
  hline(y, C.borderGray, 0.3);
  doc.setDrawColor(C.textGray);
  doc.setLineWidth(0.3);
  for (let i = 0; i < 3; i++) {
    const xPos = W / 2 - 15 + i * 15;
    doc.triangle(xPos, y - 2, xPos + 3, y - 5, xPos + 6, y - 2);
  }
  y += 15;
  
  // Report Title
  txt('SECURITY ASSESSMENT', W / 2, y, C.pureWhite, 24, 'bold', 'center');
  y += 12;
  txt('REPORT', W / 2, y, C.pureWhite, 24, 'bold', 'center');
  y += 25;
  
  // Scan Info Card
  roundedRect(M + 20, y, CW - 40, 45, 6, C.cardBlack, C.borderGray);
  
  const scanInfo = [
    ['TARGET', result.target || 'N/A'],
    ['SCAN ID', ((result.scan_id || '') + '').substring(0, 32) || 'N/A'],
    ['DATE', new Date().toLocaleString()],
    ['PLATFORM', 'WHITENX VAPT v2.4.1']
  ];
  
  let infoY = y + 10;
  scanInfo.forEach(([k, v]) => {
    txt(k, W / 2 - 45, infoY, C.textGray, 7, 'bold');
    txt(v, W / 2 + 10, infoY, C.textWhite, 8, 'normal');
    infoY += 7;
  });
  
  y += 55;
  
  // Risk Summary Cards
  const riskCards = [
    { label: 'CRITICAL', count: crit, bg: C.darkBlack, color: C.pureWhite },
    { label: 'HIGH', count: high, bg: C.cardBlack, color: C.textWhite },
    { label: 'MEDIUM', count: med, bg: C.lightGray, color: C.textLight },
    { label: 'LOW', count: low, bg: C.mediumGray, color: C.textGray }
  ];
  
  const cardWidth = (CW - 16) / 4;
  riskCards.forEach((card, i) => {
    const x = M + 8 + i * (cardWidth + 4);
    roundedRect(x, y, cardWidth, 22, 4, card.bg, C.borderGray);
    txt(card.label, x + cardWidth / 2, y + 8, card.color, 7, 'bold', 'center');
    txt(String(card.count), x + cardWidth / 2, y + 18, C.pureWhite, 18, 'bold', 'center');
  });
  
  y += 28;
  
  // Stats Row
  const stats = [
    { label: 'OPEN PORTS', value: ports.length },
    { label: 'SERVICES', value: svcs.length },
    { label: 'SUBDOMAINS', value: subds.length },
    { label: 'TOTAL VULNS', value: totalVulns }
  ];
  
  stats.forEach((stat, i) => {
    const x = M + 8 + i * (cardWidth + 4);
    roundedRect(x, y, cardWidth, 18, 4, C.richBlack, C.borderGray);
    txt(stat.label, x + cardWidth / 2, y + 7, C.textGray, 6, 'bold', 'center');
    txt(String(stat.value), x + cardWidth / 2, y + 15, C.pureWhite, 12, 'bold', 'center');
  });
  
  y += 25;
  
  // Footer
  hline(y, C.borderGray, 0.2);
  y += 6;
  txt('CONFIDENTIAL SECURITY REPORT', W / 2, y, C.textGray, 7, 'normal', 'center');
  y += 4;
  txt('AUTHORIZED USE ONLY — UNAUTHORIZED DISTRIBUTION PROHIBITED', W / 2, y, C.textGray, 6, 'normal', 'center');
  
  // ══════════════════════════════════════════════════════════
  // PAGE 2 — VULNERABILITIES
  // ══════════════════════════════════════════════════════════
  newPage();
  addDecorativeShapes();
  
  y = 20;
  txt(result.target || 'Security Report', M, y, C.pureWhite, 18, 'bold');
  txt(new Date().toLocaleDateString(), W - M, y, C.textGray, 8, 'normal', 'right');
  y += 8;
  hline(y, C.borderGray, 0.3);
  y += 12;
  
  sectionTitle('VULNERABILITY FINDINGS', `${totalVulns} total findings`);
  
  if (totalVulns === 0) {
    roundedRect(M, y, CW, 20, 4, C.cardBlack, C.borderGray);
    txt('✓ No vulnerabilities detected', W / 2, y + 13, C.textWhite, 10, 'normal', 'center');
    y += 25;
  } else {
    const vulnCols = [
      { label: 'VULNERABILITY', width: 65 },
      { label: 'SEVERITY', width: 25 },
      { label: 'PORT', width: 20 },
      { label: 'RECOMMENDATION', width: CW - 110 }
    ];
    
    tableHeader(vulnCols);
    
    vulns.forEach((v, idx) => {
      const sev = (v.severity || 'N/A').toUpperCase();
      tableRow([
        { val: v.type || 'Unknown', color: C.textWhite },
        { val: sev, type: 'badge' },
        { val: v.port || '—', color: C.textLight },
        { val: (v.recommendation || 'Review and apply security patches').substring(0, 80), color: C.textGray }
      ], vulnCols, idx % 2 === 1);
    });
  }
  
  // ══════════════════════════════════════════════════════════
  // PAGE 3 — PORTS & SERVICES
  // ══════════════════════════════════════════════════════════
  newPage();
  addDecorativeShapes();
  
  y = 20;
  txt(result.target || 'Security Report', M, y, C.pureWhite, 18, 'bold');
  txt(new Date().toLocaleDateString(), W - M, y, C.textGray, 8, 'normal', 'right');
  y += 8;
  hline(y, C.borderGray, 0.3);
  y += 12;
  
  // Port Scan Section
  sectionTitle('PORT SCAN RESULTS', `${ports.length} open ports`);
  
  if (ports.length === 0) {
    roundedRect(M, y, CW, 15, 4, C.cardBlack, C.borderGray);
    txt('No open ports detected', W / 2, y + 10, C.textGray, 9, 'normal', 'center');
    y += 20;
  } else {
    const portCols = [
      { label: 'PORT', width: 20 },
      { label: 'SERVICE', width: 40 },
      { label: 'STATE', width: 22 },
      { label: 'VERSION', width: 55 },
      { label: 'BANNER', width: CW - 137 }
    ];
    
    tableHeader(portCols);
    
    ports.slice(0, 20).forEach((p, idx) => {
      tableRow([
        { val: p.port, color: C.pureWhite },
        { val: p.service || 'unknown', color: C.textWhite },
        { val: (p.state || 'OPEN').toUpperCase(), type: 'badge' },
        { val: p.version || '—', color: C.textLight },
        { val: truncate(p.banner || '—', 45), color: C.textGray }
      ], portCols, idx % 2 === 1);
    });
    
    if (ports.length > 20) {
      y += 3;
      txt(`+ ${ports.length - 20} more ports`, W / 2, y, C.textGray, 7, 'normal', 'center');
      y += 8;
    }
  }
  
  y += 8;
  
  // Services Section
  sectionTitle('FINGERPRINTED SERVICES', `${svcs.length} services identified`);
  
  if (svcs.length === 0) {
    roundedRect(M, y, CW, 15, 4, C.cardBlack, C.borderGray);
    txt('No services fingerprinted', W / 2, y + 10, C.textGray, 9, 'normal', 'center');
    y += 20;
  } else {
    const svcCols = [
      { label: 'PORT', width: 18 },
      { label: 'SERVICE', width: 38 },
      { label: 'VERSION', width: 45 },
      { label: 'CVEs', width: 18 },
      { label: 'BANNER', width: CW - 119 }
    ];
    
    tableHeader(svcCols);
    
    svcs.slice(0, 15).forEach((s, idx) => {
      const cveCount = (s.cves || []).length;
      tableRow([
        { val: s.port, color: C.pureWhite },
        { val: s.service_name || s.service || 'unknown', color: C.textWhite },
        { val: s.version || '—', color: C.textLight },
        { val: cveCount > 0 ? `${cveCount}` : '0', type: 'badge' },
        { val: truncate(s.banner || '—', 40), color: C.textGray }
      ], svcCols, idx % 2 === 1);
    });
  }
  
  // ══════════════════════════════════════════════════════════
  // PAGE 4 — OSINT & SUBDOMAINS
  // ══════════════════════════════════════════════════════════
  newPage();
  addDecorativeShapes();
  
  y = 20;
  txt(result.target || 'Security Report', M, y, C.pureWhite, 18, 'bold');
  txt(new Date().toLocaleDateString(), W - M, y, C.textGray, 8, 'normal', 'right');
  y += 8;
  hline(y, C.borderGray, 0.3);
  y += 12;
  
  sectionTitle('OSINT INTELLIGENCE', 'Reconnaissance Data');
  
  // Two column layout for WHOIS and DNS
  const colWidth = (CW - 10) / 2;
  
  // Left Column - WHOIS
  roundedRect(M, y, colWidth, 45, 4, C.cardBlack, C.borderGray);
  txt('WHOIS REGISTRATION', M + 6, y + 6, C.textWhite, 8, 'bold');
  hline(y + 9, C.borderGray, 0.15);
  
  const whoisData = [
    ['Registrar', whois.registrar],
    ['Organization', whois.organization],
    ['Country', whois.country],
    ['Created', whois.creation_date],
    ['Expires', whois.expiration_date]
  ];
  
  let whoisY = y + 14;
  whoisData.forEach(([k, v]) => {
    if (v) {
      txt(k + ':', M + 6, whoisY, C.textGray, 6.5, 'bold');
      txt(truncate(v, 25), M + 30, whoisY, C.textLight, 6.5, 'normal');
      whoisY += 5.5;
    }
  });
  
  // Right Column - DNS Records
  roundedRect(M + colWidth + 4, y, colWidth, 45, 4, C.cardBlack, C.borderGray);
  txt('DNS RECORDS', M + colWidth + 10, y + 6, C.textWhite, 8, 'bold');
  hline(y + 9, C.borderGray, 0.15);
  
  const dnsData = [
    ['A', (dns.a_records || []).slice(0, 3).join(', ')],
    ['MX', (dns.mx_records || []).slice(0, 2).map(m => m.exchange || m).join(', ')],
    ['NS', (dns.ns_records || []).slice(0, 3).join(', ')],
    ['TXT', (dns.txt_records || []).slice(0, 2).join(', ')],
    ['SOA', dns.soa_record?.mname]
  ];
  
  let dnsY = y + 14;
  dnsData.forEach(([k, v]) => {
    if (v && v !== '') {
      txt(k + ':', M + colWidth + 10, dnsY, C.textGray, 6.5, 'bold');
      txt(truncate(v, 28), M + colWidth + 28, dnsY, C.textLight, 6.5, 'normal');
      dnsY += 5.5;
    }
  });
  
  y += 52;
  
  // OSINT Score Card
  if (osint.osint_score) {
    const scoreWidth = (CW - 8) / 2;
    roundedRect(M, y, scoreWidth, 22, 4, C.cardBlack, C.borderGray);
    txt('OSINT SCORE', M + 8, y + 8, C.textGray, 7, 'bold');
    txt(String(osint.osint_score), M + 8, y + 18, C.pureWhite, 16, 'bold');
    
    roundedRect(M + scoreWidth + 4, y, scoreWidth, 22, 4, C.cardBlack, C.borderGray);
    txt('TRUST LEVEL', M + scoreWidth + 12, y + 8, C.textGray, 7, 'bold');
    txt(osint.trust_level || 'N/A', M + scoreWidth + 12, y + 18, C.pureWhite, 16, 'bold');
    
    y += 28;
  }
  
  // Subdomains Section
  sectionTitle('SUBDOMAIN ENUMERATION', `${subds.length} subdomains found`);
  
  if (subds.length === 0) {
    roundedRect(M, y, CW, 15, 4, C.cardBlack, C.borderGray);
    txt('No subdomains found', W / 2, y + 10, C.textGray, 9, 'normal', 'center');
    y += 20;
  } else {
    const subCols = [
      { label: 'SUBDOMAIN', width: 70 },
      { label: 'STATUS', width: 22 },
      { label: 'IP ADDRESSES', width: 50 },
      { label: 'URL', width: CW - 142 }
    ];
    
    tableHeader(subCols);
    
    subds.slice(0, 15).forEach((s, idx) => {
      tableRow([
        { val: s.subdomain || s, color: C.textWhite },
        { val: s.alive ? 'ALIVE' : 'DOWN', type: 'badge' },
        { val: (s.dns_ips || []).slice(0, 2).join(', ') || '—', color: C.textLight },
        { val: truncate(s.url || '—', 35), color: C.textGray }
      ], subCols, idx % 2 === 1);
    });
  }
  
  // ══════════════════════════════════════════════════════════
  // PAGE 5 — SSL & SECURITY HEADERS
  // ══════════════════════════════════════════════════════════
  newPage();
  addDecorativeShapes();
  
  y = 20;
  txt(result.target || 'Security Report', M, y, C.pureWhite, 18, 'bold');
  txt(new Date().toLocaleDateString(), W - M, y, C.textGray, 8, 'normal', 'right');
  y += 8;
  hline(y, C.borderGray, 0.3);
  y += 12;
  
  // SSL Analysis
  sectionTitle('SSL / TLS ANALYSIS');
  
  const certs = sslA.certificates || [];
  if (certs.length > 0) {
    const cert = certs[0];
    const certData = [
      ['Subject', cert.subject],
      ['Issuer', cert.issuer],
      ['Valid From', cert.notBefore],
      ['Valid Until', cert.notAfter],
      ['Days Left', cert.expiry_days ? `${cert.expiry_days} days` : 'N/A'],
      ['Version', cert.version],
      ['Serial Number', cert.serial_number]
    ];
    
    certData.forEach(([k, v]) => {
      if (v) {
        guard(6);
        txt(k + ':', M + 6, y, C.textGray, 7, 'bold');
        txt(truncate(v, 65), M + 38, y, C.textLight, 7, 'normal');
        y += 6;
      }
    });
    y += 4;
  } else {
    roundedRect(M, y, CW, 15, 4, C.cardBlack, C.borderGray);
    txt('No SSL certificate data available', W / 2, y + 10, C.textGray, 9, 'normal', 'center');
    y += 20;
  }
  
  y += 8;
  
  // Security Headers
  if (Object.keys(hdrs).length > 0) {
    sectionTitle('HTTP SECURITY HEADERS', `${Object.keys(hdrs).length} headers`);
    
    const headerCols = [
      { label: 'HEADER', width: 70 },
      { label: 'STATUS', width: 25 },
      { label: 'VALUE', width: CW - 95 }
    ];
    
    tableHeader(headerCols);
    
    Object.entries(hdrs).forEach(([k, v], idx) => {
      tableRow([
        { val: k, color: C.textWhite },
        { val: v ? 'ENABLED' : 'MISSING', type: 'badge' },
        { val: v === true ? 'Present' : (v || 'Not configured'), color: C.textGray }
      ], headerCols, idx % 2 === 1);
    });
  }
  
  // ══════════════════════════════════════════════════════════
  // PAGE 6 — EXECUTIVE SUMMARY & RECOMMENDATIONS
  // ══════════════════════════════════════════════════════════
  newPage();
  addDecorativeShapes();
  
  y = 20;
  txt(result.target || 'Security Report', M, y, C.pureWhite, 18, 'bold');
  txt(new Date().toLocaleDateString(), W - M, y, C.textGray, 8, 'normal', 'right');
  y += 8;
  hline(y, C.borderGray, 0.3);
  y += 12;
  
  sectionTitle('EXECUTIVE SUMMARY');
  
  // Risk Summary Card
  roundedRect(M, y, CW, 50, 6, C.cardBlack, C.borderGray);
  
  txt('RISK OVERVIEW', M + 10, y + 8, C.textWhite, 10, 'bold');
  hline(y + 11, C.borderGray, 0.15);
  
  // Risk level determination
  let riskLevel = 'LOW';
  let riskColor = C.textGray;
  if (crit > 0) { riskLevel = 'CRITICAL'; riskColor = C.pureWhite; }
  else if (high > 0) { riskLevel = 'HIGH'; riskColor = C.textWhite; }
  else if (med > 0) { riskLevel = 'MEDIUM'; riskColor = C.textLight; }
  
  txt('OVERALL RISK LEVEL:', M + 10, y + 18, C.textGray, 8, 'bold');
  txt(riskLevel, M + 55, y + 18, riskColor, 10, 'bold');
  
  // Risk distribution bar
  const totalFindings = crit + high + med + low || 1;
  const barWidth = CW - 20;
  const barX = M + 10;
  const barY = y + 26;
  
  roundedRect(barX, barY, barWidth, 8, 2, C.darkBlack, C.borderGray);
  
  let currentX = barX;
  const segments = [
    { count: crit, color: C.pureWhite, label: 'CRITICAL' },
    { count: high, color: C.textWhite, label: 'HIGH' },
    { count: med, color: C.textLight, label: 'MEDIUM' },
    { count: low, color: C.textGray, label: 'LOW' }
  ];
  
  segments.forEach(seg => {
    const width = (seg.count / totalFindings) * barWidth;
    if (width > 0) {
      doc.setFillColor(seg.color);
      doc.rect(currentX, barY, width, 8, 'F');
      currentX += width;
    }
  });
  
  // Legend
  const legendY = barY + 14;
  let legendX = M + 10;
  segments.forEach(seg => {
    if (seg.count > 0) {
      doc.setFillColor(seg.color);
      doc.rect(legendX, legendY - 2, 4, 4, 'F');
      txt(`${seg.label}: ${seg.count}`, legendX + 7, legendY, C.textGray, 6, 'normal');
      legendX += 40;
    }
  });
  
  y += 62;
  
  // Key Findings
  sectionTitle('KEY FINDINGS');
  
  const findings = [];
  if (crit > 0) findings.push(`• ${crit} CRITICAL severity vulnerabilities requiring immediate remediation`);
  if (high > 0) findings.push(`• ${high} HIGH severity vulnerabilities requiring urgent attention`);
  if (ports.length > 0) findings.push(`• ${ports.length} open network ports exposed to potential attackers`);
  if (svcs.length > 0) findings.push(`• ${svcs.length} services identified with version information`);
  if (subds.length > 0) findings.push(`• ${subds.length} subdomains discovered, expanding attack surface`);
  
  if (findings.length === 0) {
    txt('No significant security issues detected', M + 10, y, C.textGray, 9, 'normal');
    y += 10;
  } else {
    findings.forEach((finding, idx) => {
      guard(6);
      txt(finding, M + 10, y, C.textLight, 8, 'normal');
      y += 6;
    });
  }
  
  y += 10;
  
  // Recommendations
  sectionTitle('RECOMMENDATIONS');
  
  const recommendations = [];
  if (crit > 0) recommendations.push('• Immediately patch all CRITICAL vulnerabilities — prioritize based on CVSS score');
  if (high > 0) recommendations.push('• Address HIGH severity findings within 30 days to reduce risk exposure');
  if (ports.filter(p => p.port < 1024).length > 0) recommendations.push('• Review privileged ports (<1024) and implement proper access controls');
  recommendations.push('• Implement security headers (CSP, HSTS, X-Frame-Options) to prevent common attacks');
  recommendations.push('• Conduct regular vulnerability scans and penetration tests quarterly');
  recommendations.push('• Monitor SSL/TLS certificate expiry and rotate before expiration');
  
  recommendations.slice(0, 6).forEach((rec, idx) => {
    guard(6);
    txt(rec, M + 10, y, C.textLight, 8, 'normal');
    y += 6;
  });
  
  y += 15;
  
  // Footer on last page
  y = 280;
  hline(y, C.borderGray, 0.2);
  y += 5;
  txt('Generated by WHITENX VAPT Platform — ALSyed Initiative', M, y, C.textGray, 6.5, 'normal');
  txt('CONFIDENTIAL — AUTHORIZED USE ONLY', W - M, y, C.textGray, 6.5, 'normal', 'right');
  
  // Page numbers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(C.textGray);
    doc.text(`Page ${i} of ${totalPages}`, W / 2, 290, { align: 'center' });
  }
  
  // Save the PDF
  const cleanTarget = (result.target || 'report').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`WHITENX-Report-${cleanTarget}-${Date.now()}.pdf`);
};

// ════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════
const generatePDF = (scanResult) => {
  try {
    if (!scanResult || typeof scanResult !== 'object' || Array.isArray(scanResult)) {
      console.error('generatePDF: invalid scan result payload');
      return false;
    }

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const toNumber = (value, fallback = 0) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    };

    const safeArray = (value) => Array.isArray(value) ? value : [];
    const safeObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

    const safeString = (value, fallback = 'N/A') => {
      if (value === null || value === undefined) return fallback;
      if (Array.isArray(value)) {
        const joined = value.map((item) => safeString(item, '')).filter(Boolean).join(', ');
        return joined || fallback;
      }
      if (typeof value === 'object') {
        try {
          const stringified = JSON.stringify(value);
          return stringified && stringified !== '{}' ? stringified : fallback;
        } catch {
          return fallback;
        }
      }
      const text = String(value).replace(/\s+/g, ' ').trim();
      return text || fallback;
    };

    const clamp = (value, min, max) => Math.min(max, Math.max(min, toNumber(value, min)));

    const pageWidth = toNumber(doc.internal.pageSize.getWidth(), 210);
    const pageHeight = toNumber(doc.internal.pageSize.getHeight(), 297);
    const margin = 14;
    const top = 18;
    const bottom = 16;
    const contentWidth = Math.max(toNumber(pageWidth - (margin * 2), 180), 40);

    let y = top;

    const C = {
      bg: '#060606',
      panel: '#121212',
      panelAlt: '#0d0d0d',
      panelSoft: '#171717',
      border: '#2d2d2d',
      borderSoft: '#3a3a3a',
      text: '#f5f5f5',
      muted: '#a5a5a5',
      mutedSoft: '#7a7a7a',
      white: '#ffffff',
      accent: '#d9d9d9'
    };

    const rawResult = safeObject(scanResult);
    const rawPortScan = safeObject(rawResult.port_scan);
    const rawPorts = safeArray(rawPortScan.services).length
      ? safeArray(rawPortScan.services)
      : safeArray(rawPortScan.open_ports);

    const ports = rawPorts.map((entry) => {
      if (typeof entry === 'number' || typeof entry === 'string') {
        return {
          port: safeString(entry, 'N/A'),
          service: 'unknown',
          state: 'OPEN',
          version: '-',
          banner: '-'
        };
      }

      const item = safeObject(entry);
      return {
        port: safeString(item.port, 'N/A'),
        service: safeString(item.service || item.service_name, 'unknown'),
        state: safeString(item.state, 'OPEN').toUpperCase(),
        version: safeString(item.version, '-'),
        banner: safeString(item.banner, '-')
      };
    });

    const vulnerabilities = safeArray(rawResult.vulnerabilities).map((entry) => {
      const item = safeObject(entry);
      return {
        type: safeString(item.type || item.name, 'Unknown'),
        severity: safeString(item.severity, 'LOW').toUpperCase(),
        port: safeString(item.port, '-'),
        recommendation: safeString(item.recommendation || item.remediation, 'Review and remediate this finding')
      };
    });

    const rawServices = safeArray(rawResult.fingerprinted_services).length
      ? safeArray(rawResult.fingerprinted_services)
      : safeArray(rawResult.services);

    const services = rawServices.map((entry) => {
      const item = safeObject(entry);
      return {
        port: safeString(item.port, '-'),
        service: safeString(item.service_name || item.service, 'unknown'),
        version: safeString(item.version, '-'),
        banner: safeString(item.banner, '-'),
        cves: safeArray(item.cves)
      };
    });

    const rawSubdomains = safeArray(safeObject(rawResult.subdomain_enum).subdomains).length
      ? safeArray(safeObject(rawResult.subdomain_enum).subdomains)
      : safeArray(rawResult.subdomains);

    const subdomains = rawSubdomains.map((entry) => {
      if (typeof entry === 'string') {
        return {
          subdomain: safeString(entry, '-'),
          alive: false,
          dns_ips: [],
          url: '-'
        };
      }

      const item = safeObject(entry);
      return {
        subdomain: safeString(item.subdomain || item.host, '-'),
        alive: Boolean(item.alive),
        dns_ips: safeArray(item.dns_ips).map((ip) => safeString(ip, '')).filter(Boolean),
        url: safeString(item.url, '-')
      };
    });

    const osint = safeObject(rawResult.osint);
    const whois = safeObject(osint.whois);
    const dns = safeObject(osint.dns);
    const http = safeObject(osint.http);
    const headers = safeObject(http.security_headers);
    const sslAnalysis = safeObject(rawResult.ssl_analysis);
    const certificates = safeArray(sslAnalysis.certificates).map((entry) => safeObject(entry));

    const handledKeys = new Set([
      'target',
      'scan_id',
      'id',
      'vulnerabilities',
      'port_scan',
      'fingerprinted_services',
      'services',
      'subdomain_enum',
      'subdomains',
      'osint',
      'ssl_analysis'
    ]);

    const additionalModules = Object.fromEntries(
      Object.entries(rawResult).filter(([key]) => !handledKeys.has(key))
    );

    const whoisRows = [
      { label: 'Registrar', value: safeString(whois.registrar, 'N/A') },
      { label: 'Organization', value: safeString(whois.organization, 'N/A') },
      { label: 'Country', value: safeString(whois.country, 'N/A') },
      { label: 'Created', value: safeString(whois.creation_date, 'N/A') },
      { label: 'Expires', value: safeString(whois.expiration_date, 'N/A') }
    ];

    const dnsRows = [
      { label: 'A Records', value: safeString(safeArray(dns.a_records).join(', '), 'None') },
      { label: 'MX Records', value: safeString(safeArray(dns.mx_records).map((item) => safeObject(item).exchange || item).join(', '), 'None') },
      { label: 'NS Records', value: safeString(safeArray(dns.ns_records).join(', '), 'None') },
      { label: 'TXT Records', value: safeString(safeArray(dns.txt_records).join(', '), 'None') },
      { label: 'SOA', value: safeString(safeObject(dns.soa_record).mname, 'None') }
    ];

    const headerRows = Object.entries(headers).map(([key, value]) => ({
      header: safeString(key, 'Unknown'),
      status: value ? 'ENABLED' : 'MISSING',
      value: value === true ? 'Present' : safeString(value, 'Not configured')
    }));

    const certificateRows = certificates.length > 0 ? [
      { label: 'Subject', value: safeString(certificates[0].subject, 'N/A') },
      { label: 'Issuer', value: safeString(certificates[0].issuer, 'N/A') },
      { label: 'Valid From', value: safeString(certificates[0].notBefore, 'N/A') },
      { label: 'Valid Until', value: safeString(certificates[0].notAfter, 'N/A') },
      { label: 'Days Left', value: safeString(certificates[0].expiry_days, 'N/A') },
      { label: 'Version', value: safeString(certificates[0].version, 'N/A') },
      { label: 'Serial Number', value: safeString(certificates[0].serial_number, 'N/A') }
    ] : [];

    const rawModuleSnapshots = [
      { title: 'Raw Port Scan Module', value: rawPortScan, empty: 'No port scan module available.' },
      { title: 'Raw Services Module', value: rawServices, empty: 'No services module available.' },
      { title: 'Raw Vulnerabilities Module', value: safeArray(rawResult.vulnerabilities), empty: 'No vulnerabilities module available.' },
      { title: 'Raw Subdomain Module', value: safeObject(rawResult.subdomain_enum).subdomains ? rawResult.subdomain_enum : rawResult.subdomains, empty: 'No subdomain module available.' },
      { title: 'Raw OSINT Module', value: osint, empty: 'No OSINT module available.' },
      { title: 'Raw SSL Module', value: sslAnalysis, empty: 'No SSL module available.' },
      { title: 'Additional Modules', value: additionalModules, empty: 'No additional top-level modules available.' }
    ];

    const reportTarget = safeString(rawResult.target, '');
    const scanId = safeString(rawResult.scan_id || rawResult.id, 'N/A').slice(0, 48);
    const generatedAt = new Date().toLocaleString();

    if (!reportTarget && ports.length === 0 && vulnerabilities.length === 0) {
      console.error('generatePDF: no renderable report data');
      return false;
    }

    const crit = vulnerabilities.filter((item) => item.severity === 'CRITICAL').length;
    const high = vulnerabilities.filter((item) => item.severity === 'HIGH').length;
    const med = vulnerabilities.filter((item) => item.severity === 'MEDIUM').length;
    const low = vulnerabilities.filter((item) => item.severity === 'LOW').length;
    const riskLevel = crit > 0 ? 'CRITICAL' : high > 0 ? 'HIGH' : med > 0 ? 'MEDIUM' : 'LOW';

    const getLines = (value, maxWidth, options = {}) => {
      const width = Math.max(toNumber(maxWidth, contentWidth), 8);
      const font = options.font || 'helvetica';
      const style = options.style || 'normal';
      const size = Math.max(toNumber(options.size, 9), 1);

      doc.setFont(font, style);
      doc.setFontSize(size);

      if (Array.isArray(value)) {
        return value.flatMap((line) => {
          const safeLine = safeString(line, '');
          const wrapped = doc.splitTextToSize(safeLine, width);
          return wrapped.length ? wrapped : [''];
        });
      }

      return doc.splitTextToSize(safeString(value), width);
    };

    const drawText = (value, x, textY, options = {}) => {
      const font = options.font || 'helvetica';
      const style = options.style || 'normal';
      const fontSize = Math.max(toNumber(options.size, 9), 1);
      const maxWidth = Math.max(toNumber(options.maxWidth, contentWidth), 8);
      const lineHeight = Math.max(toNumber(options.lineHeight, fontSize * 0.45 + 1.2), 3.2);
      const lines = Array.isArray(value)
        ? getLines(value, maxWidth, { font, style, size: fontSize })
        : getLines(value, maxWidth, { font, style, size: fontSize });

      doc.setFont(font, style);
      doc.setFontSize(fontSize);
      doc.setTextColor(options.color || C.text);
      doc.text(lines, clamp(x, 0, pageWidth), clamp(textY, 0, pageHeight), {
        align: options.align || 'left'
      });

      return lines.length * lineHeight;
    };

    // eslint-disable-next-line no-unused-vars
    const drawLine = (lineY) => {
      doc.setDrawColor(C.border);
      doc.setLineWidth(0.2);
      doc.line(margin, clamp(lineY, 0, pageHeight), pageWidth - margin, clamp(lineY, 0, pageHeight));
    };

    const drawSoftLine = (lineY, inset = 0) => {
      doc.setDrawColor(C.borderSoft);
      doc.setLineWidth(0.15);
      doc.line(
        margin + toNumber(inset, 0),
        clamp(lineY, 0, pageHeight),
        pageWidth - margin - toNumber(inset, 0),
        clamp(lineY, 0, pageHeight)
      );
    };

    const roundedRect = (x, rectY, w, h, r = 2, fillColor = null, strokeColor = C.border, style = 'S') => {
      const safeX = clamp(x, 0, pageWidth);
      const safeY = clamp(rectY, 0, pageHeight);
      const safeW = Math.max(toNumber(w, 0), 0.1);
      const safeH = Math.max(toNumber(h, 0), 0.1);
      const safeR = Math.max(0, Math.min(toNumber(r, 0), safeW / 2, safeH / 2));
      const safeStyle = ['S', 'F', 'FD', 'DF'].includes(style) ? style : 'S';

      if (fillColor && (safeStyle === 'F' || safeStyle === 'FD' || safeStyle === 'DF')) {
        doc.setFillColor(fillColor);
      }
      if (strokeColor && safeStyle !== 'F') {
        doc.setDrawColor(strokeColor);
      }

      doc.setLineWidth(0.25);
      doc.roundedRect(safeX, safeY, safeW, safeH, safeR, safeR, safeStyle);
    };

    const drawStatCard = (x, cardY, width, height, label, value, tone = 'default') => {
      const fill = tone === 'strong' ? C.panelSoft : C.panel;
      const valueColor = tone === 'strong' ? C.white : C.accent;
      roundedRect(x, cardY, width, height, 3, fill, C.border, 'FD');
      drawText(label, x + 4, cardY + 6, {
        size: 6.5,
        style: 'bold',
        color: C.muted,
        maxWidth: width - 8
      });
      drawText(value, x + 4, cardY + 15, {
        size: 13,
        style: 'bold',
        color: valueColor,
        maxWidth: width - 8
      });
    };

    const drawPageShell = () => {
      doc.setFillColor(C.bg);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setFillColor(C.accent);
      doc.rect(0, 0, pageWidth, 1.1, 'F');
      doc.rect(0, pageHeight - 1.1, pageWidth, 1.1, 'F');
      roundedRect(margin - 4, 8, contentWidth + 8, pageHeight - 16, 4, null, C.border, 'S');
      roundedRect(margin - 1.5, 13.5, contentWidth + 3, pageHeight - 27, 3, null, C.border, 'S');
      drawSoftLine(20, 0);
      drawSoftLine(pageHeight - 18, 0);
      drawText('WHITENX', margin, 16, {
        size: 8,
        style: 'bold',
        color: C.accent,
        maxWidth: 30
      });
      drawText('Security Assessment Report', pageWidth - margin, 16, {
        size: 7,
        color: C.muted,
        align: 'right',
        maxWidth: 60
      });
    };

    const startPage = (title, addNewPage = true) => {
      if (addNewPage) doc.addPage();
      drawPageShell();
      y = 28;
      drawText(reportTarget || 'Security Report', margin, y, {
        size: 17,
        style: 'bold',
        color: C.white,
        maxWidth: contentWidth - 56
      });
      drawText(generatedAt, pageWidth - margin, y, {
        size: 7.5,
        color: C.muted,
        align: 'right',
        maxWidth: 52
      });
      y += 8;
      roundedRect(margin, y, contentWidth, 16, 3, C.panel, C.border, 'FD');
      drawText(title, margin + 5, y + 6.5, {
        size: 12,
        style: 'bold',
        color: C.white,
        maxWidth: contentWidth - 10
      });
      drawText(`Target: ${reportTarget || 'N/A'}`, margin + 5, y + 12, {
        size: 7,
        color: C.muted,
        maxWidth: contentWidth - 10
      });
      y += 22;
    };

    const ensureSpace = (needed, continuationTitle) => {
      if ((y + toNumber(needed, 0)) <= (pageHeight - bottom)) return;
      startPage(continuationTitle, true);
    };

    const badgeStyleFor = (label) => {
      const key = safeString(label, 'N/A').toUpperCase();
      if (key === 'CRITICAL') return { fill: '#1a1a1a', text: '#ffffff' };
      if (key === 'HIGH') return { fill: '#222222', text: '#f3f3f3' };
      if (key === 'MEDIUM') return { fill: '#303030', text: '#e0e0e0' };
      if (key === 'LOW') return { fill: '#404040', text: '#d0d0d0' };
      if (key === 'OPEN') return { fill: '#171717', text: '#ffffff' };
      return { fill: '#262626', text: '#e0e0e0' };
    };

    // eslint-disable-next-line no-unused-vars
    const drawBulletList = (items, startX, width, titleForBreaks) => {
      safeArray(items).forEach((item) => {
        const lines = getLines(`• ${safeString(item)}`, width);
        const height = Math.max(lines.length * 4.8, 7);
        ensureSpace(height + 3, `${titleForBreaks} (cont.)`);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(C.text);
        doc.text(lines, startX, y);
        y += height;
      });
    };

    const drawList = (items, startX, width, titleForBreaks) => {
      safeArray(items).forEach((item) => {
        const lines = getLines(`- ${safeString(item)}`, width, {
          font: 'helvetica',
          style: 'normal',
          size: 9
        });
        const height = Math.max(lines.length * 4.8, 7);
        ensureSpace(height + 3, `${titleForBreaks} (cont.)`);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(C.text);
        doc.text(lines, startX, y);
        y += height;
      });
    };

    const renderTable = ({ title, columns, rows, emptyMessage }) => {
      startPage(title, true);

      const drawHeader = () => {
        ensureSpace(13, `${title} (cont.)`);
        roundedRect(margin, y, contentWidth, 9.5, 2.5, C.panelSoft, C.border, 'FD');

        let currentX = margin;
        columns.forEach((column) => {
          const colWidth = Math.max(toNumber(column.width, 20), 10);
          drawText(column.label, currentX + 2.5, y + 5.8, {
            size: 6.8,
            style: 'bold',
            color: C.muted,
            maxWidth: colWidth - 5
          });
          currentX += colWidth;
        });

        y += 12;
      };

      if (!rows.length) {
        roundedRect(margin, y, contentWidth, 15, 3, C.panel, C.border, 'FD');
        drawText(emptyMessage, pageWidth / 2, y + 9, {
          size: 9,
          color: C.muted,
          align: 'center',
          maxWidth: contentWidth - 10
        });
        return;
      }

      drawHeader();

      rows.forEach((row, rowIndex) => {
        const prepared = columns.map((column) => {
          const colWidth = Math.max(toNumber(column.width, 20), 10);
          const rawValue = typeof column.value === 'function' ? column.value(row) : row[column.key];
          const textValue = safeString(rawValue);
          const lines = column.badge ? [textValue.toUpperCase()] : getLines(textValue, colWidth - 4, {
            font: 'helvetica',
            style: 'normal',
            size: 7.5
          });

          return {
            colWidth,
            textValue,
            lines,
            badge: !!column.badge
          };
        });

        const maxLines = prepared.reduce((largest, cell) => Math.max(largest, cell.lines.length || 1), 1);
        const rowHeight = Math.max(10.5, maxLines * 4.7 + 4.5);

        if ((y + rowHeight) > (pageHeight - bottom)) {
          startPage(`${title} (cont.)`, true);
          drawHeader();
        }

        roundedRect(
          margin,
          y,
          contentWidth,
          rowHeight,
          1.5,
          rowIndex % 2 === 0 ? C.panelAlt : C.panel,
          C.border,
          'FD'
        );

        let currentX = margin;
        prepared.forEach((cell) => {
          if (cell.badge) {
            const badgeStyle = badgeStyleFor(cell.textValue);
            const badgeWidth = Math.min(cell.colWidth - 6, Math.max(18, (cell.textValue.length * 2.3) + 8));
            const badgeY = y + (rowHeight / 2) - 3;
            roundedRect(currentX + 2, badgeY, badgeWidth, 6, 3, badgeStyle.fill, C.border, 'FD');
            drawText(cell.textValue, currentX + 2 + (badgeWidth / 2), badgeY + 4.1, {
              size: 6.2,
              style: 'bold',
              color: badgeStyle.text,
              align: 'center',
              maxWidth: badgeWidth - 2
            });
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(C.text);
            doc.text(cell.lines, currentX + 2.5, y + 5.6);
          }

          currentX += cell.colWidth;
        });

        y += rowHeight + 2.4;
      });
    };

    const renderKeyValueTable = ({ title, rows, emptyMessage = 'No data available.' }) => {
      renderTable({
        title,
        columns: [
          { label: 'Field', width: 48, value: (row) => row.label },
          { label: 'Value', width: contentWidth - 48, value: (row) => row.value }
        ],
        rows: safeArray(rows),
        emptyMessage
      });
    };

    const renderJsonBlock = (title, value, emptyMessage = 'No data available.') => {
      startPage(title, true);

      const hasObjectData = value && typeof value === 'object' && Object.keys(safeObject(value)).length > 0;
      const hasArrayData = Array.isArray(value) && value.length > 0;
      if (!hasObjectData && !hasArrayData) {
        roundedRect(margin, y, contentWidth, 14, 3, C.panel, C.border, 'FD');
        drawText(emptyMessage, pageWidth / 2, y + 8.5, {
          size: 9,
          color: C.muted,
          align: 'center',
          maxWidth: contentWidth - 10
        });
        return;
      }

      const jsonText = safeString(JSON.stringify(value, null, 2), '{}');
      const rawLines = jsonText.split('\n');
      const lines = getLines(rawLines, Math.max(contentWidth - 10, 20), {
        font: 'courier',
        style: 'normal',
        size: 6.6
      });
      let index = 0;

      while (index < lines.length) {
        const availableHeight = pageHeight - bottom - y - 4;
        const linesPerPage = Math.max(1, Math.floor(availableHeight / 3.8));
        const chunk = lines.slice(index, index + linesPerPage);
        const blockHeight = Math.max(14, (chunk.length * 3.8) + 12);

        ensureSpace(blockHeight + 2, `${title} (cont.)`);
        roundedRect(margin, y, contentWidth, blockHeight, 2.5, C.panelAlt, C.border, 'FD');
        roundedRect(margin + 3, y + 3, contentWidth - 6, 7, 2, C.panelSoft, C.border, 'FD');
        drawText('JSON MODULE SNAPSHOT', margin + 6, y + 7.5, {
          size: 6.4,
          style: 'bold',
          color: C.muted,
          maxWidth: contentWidth - 12
        });
        doc.setFont('courier', 'normal');
        doc.setFontSize(6.6);
        doc.setTextColor(C.text);
        doc.text(chunk, margin + 5, y + 14);
        y += blockHeight + 3;
        index += chunk.length;
      }
    };

    drawPageShell();
    y = 34;

    drawText('WHITENX', pageWidth / 2, y, {
      size: 34,
      style: 'bold',
      color: C.white,
      align: 'center',
      maxWidth: contentWidth
    });
    y += 11;

    drawText('Vulnerability Assessment Report', pageWidth / 2, y, {
      size: 15.5,
      style: 'bold',
      color: C.accent,
      align: 'center',
      maxWidth: contentWidth
    });
    y += 10;

    roundedRect(margin, y, contentWidth, 42, 5, C.panel, C.border, 'FD');
    drawText('REPORT IDENTITY', margin + 6, y + 7, {
      size: 6.7,
      style: 'bold',
      color: C.muted,
      maxWidth: 40
    });
    drawSoftLine(y + 10.5, 5);
    drawText('Target', margin + 6, y + 16, { size: 7, style: 'bold', color: C.muted, maxWidth: 28 });
    drawText(reportTarget || 'Unknown Target', margin + 36, y + 16, {
      size: 8,
      color: C.text,
      maxWidth: contentWidth - 42
    });
    drawText('Scan ID', margin + 6, y + 24, { size: 7, style: 'bold', color: C.muted, maxWidth: 28 });
    drawText(scanId, margin + 36, y + 24, {
      size: 8,
      color: C.text,
      maxWidth: contentWidth - 42
    });
    drawText('Generated', margin + 6, y + 32, { size: 7, style: 'bold', color: C.muted, maxWidth: 28 });
    drawText(generatedAt, margin + 36, y + 32, {
      size: 8,
      color: C.text,
      maxWidth: contentWidth - 42
    });
    y += 50;

    const cardGap = 3;
    const cardWidth = Math.max(toNumber((contentWidth - (cardGap * 3)) / 4, 40), 20);
    [
      { label: 'Critical', value: crit },
      { label: 'High', value: high },
      { label: 'Medium', value: med },
      { label: 'Low', value: low }
    ].forEach((card, index) => {
      const cardX = margin + (index * (cardWidth + cardGap));
      drawStatCard(cardX, y, cardWidth, 23, card.label.toUpperCase(), String(toNumber(card.value, 0)), index === 0 ? 'strong' : 'default');
    });
    y += 31;

    roundedRect(margin, y, contentWidth, 28, 3.5, C.panelAlt, C.border, 'FD');
    drawText('EXECUTIVE SNAPSHOT', margin + 6, y + 7, {
      size: 6.8,
      style: 'bold',
      color: C.muted,
      maxWidth: 50
    });
    drawSoftLine(y + 10, 5);
    drawText(`Overall risk: ${riskLevel}`, margin + 6, y + 14, {
      size: 10,
      style: 'bold',
      color: C.accent,
      maxWidth: 70
    });
    drawText(
      `Open ports: ${toNumber(ports.length, 0)} | Findings: ${toNumber(vulnerabilities.length, 0)} | Services: ${toNumber(services.length, 0)} | Subdomains: ${toNumber(subdomains.length, 0)}`,
      margin + 6,
      y + 21.5,
      {
      size: 8,
      color: C.muted,
      maxWidth: contentWidth - 12
      }
    );

    startPage('Executive Summary', true);

    roundedRect(margin, y, contentWidth, 26, 4, C.panel, C.border, 'FD');
    drawText('Assessment Overview', margin + 6, y + 7, {
      size: 9,
      style: 'bold',
      color: C.white,
      maxWidth: 60
    });
    drawText(`Overall risk level: ${riskLevel}`, margin + 6, y + 15, {
      size: 10,
      style: 'bold',
      color: C.text,
      maxWidth: contentWidth - 12
    });
    drawText(`Validated findings: ${vulnerabilities.length} | Exposed ports: ${ports.length}`, margin + 6, y + 22, {
      size: 8,
      color: C.muted,
      maxWidth: contentWidth - 12
    });
    y += 34;

    drawText('Priority Actions', margin, y, {
      size: 11,
      style: 'bold',
      color: C.white,
      maxWidth: contentWidth
    });
    y += 8;

    const summaryActions = [];
    if (crit > 0) summaryActions.push(`${crit} critical finding(s) require immediate remediation.`);
    if (high > 0) summaryActions.push(`${high} high severity finding(s) should be addressed urgently.`);
    if (ports.length > 0) summaryActions.push(`Review ${ports.length} exposed port(s) and remove unnecessary services.`);
    if (services.length > 0) summaryActions.push(`${services.length} fingerprinted service(s) were identified from the scan data.`);
    if (subdomains.length > 0) summaryActions.push(`${subdomains.length} subdomain record(s) expand the external attack surface.`);
    if (Object.keys(osint).length > 0) summaryActions.push('OSINT data, WHOIS, DNS, HTTP, and supporting modules are attached in the report.');
    if (summaryActions.length === 0) summaryActions.push('No critical or high-risk findings were present in the current dataset.');
    summaryActions.push('Regenerate this report after remediation to verify risk reduction.');
    drawList(summaryActions, margin + 2, contentWidth - 4, 'Executive Summary');

    renderTable({
      title: 'Open Ports',
      columns: [
        { label: 'Port', width: 22, value: (row) => row.port },
        { label: 'Service', width: 36, value: (row) => row.service },
        { label: 'State', width: 24, value: (row) => row.state, badge: true },
        { label: 'Version', width: 42, value: (row) => row.version },
        { label: 'Banner', width: contentWidth - 124, value: (row) => row.banner }
      ],
      rows: ports,
      emptyMessage: 'No open ports were available in the scan result.'
    });

    renderTable({
      title: 'Vulnerabilities',
      columns: [
        { label: 'Finding', width: 52, value: (row) => row.type },
        { label: 'Severity', width: 28, value: (row) => row.severity, badge: true },
        { label: 'Port', width: 18, value: (row) => row.port },
        { label: 'Recommendation', width: contentWidth - 98, value: (row) => row.recommendation }
      ],
      rows: vulnerabilities,
      emptyMessage: 'No vulnerabilities were available in the scan result.'
    });

    renderTable({
      title: 'Fingerprinted Services',
      columns: [
        { label: 'Port', width: 18, value: (row) => row.port },
        { label: 'Service', width: 34, value: (row) => row.service },
        { label: 'Version', width: 35, value: (row) => row.version },
        { label: 'CVEs', width: 18, value: (row) => safeString(row.cves.length, '0') },
        { label: 'Banner', width: contentWidth - 105, value: (row) => row.banner }
      ],
      rows: services,
      emptyMessage: 'No fingerprinted services were available in the scan result.'
    });

    renderTable({
      title: 'Subdomains',
      columns: [
        { label: 'Subdomain', width: 58, value: (row) => row.subdomain },
        { label: 'Status', width: 24, value: (row) => row.alive ? 'ALIVE' : 'DOWN', badge: true },
        { label: 'IP Addresses', width: 44, value: (row) => row.dns_ips.join(', ') || '-' },
        { label: 'URL', width: contentWidth - 126, value: (row) => row.url }
      ],
      rows: subdomains,
      emptyMessage: 'No subdomains were available in the scan result.'
    });

    renderKeyValueTable({
      title: 'OSINT Summary',
      rows: [
        { label: 'OSINT Score', value: safeString(osint.osint_score, 'N/A') },
        { label: 'Trust Level', value: safeString(osint.trust_level, 'N/A') },
        { label: 'Registrar', value: safeString(whois.registrar, 'N/A') },
        { label: 'Organization', value: safeString(whois.organization, 'N/A') },
        { label: 'Country', value: safeString(whois.country, 'N/A') },
        { label: 'Security Headers', value: safeString(headerRows.length, '0') }
      ],
      emptyMessage: 'No OSINT summary data was available.'
    });

    renderKeyValueTable({
      title: 'WHOIS Details',
      rows: whoisRows,
      emptyMessage: 'No WHOIS data was available.'
    });

    renderKeyValueTable({
      title: 'DNS Records',
      rows: dnsRows,
      emptyMessage: 'No DNS data was available.'
    });

    renderTable({
      title: 'HTTP Security Headers',
      columns: [
        { label: 'Header', width: 64, value: (row) => row.header },
        { label: 'Status', width: 28, value: (row) => row.status, badge: true },
        { label: 'Value', width: contentWidth - 92, value: (row) => row.value }
      ],
      rows: headerRows,
      emptyMessage: 'No HTTP security headers were available.'
    });

    renderKeyValueTable({
      title: 'SSL Certificate',
      rows: certificateRows,
      emptyMessage: 'No SSL certificate data was available.'
    });

    rawModuleSnapshots.forEach((module) => {
      renderJsonBlock(module.title, module.value, module.empty);
    });

    const totalPages = toNumber(doc.getNumberOfPages(), 1);
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      drawText('CONFIDENTIAL', margin, pageHeight - 6, {
        size: 6.5,
        style: 'bold',
        color: C.mutedSoft,
        maxWidth: 28
      });
      drawText(`Page ${page} of ${totalPages}`, pageWidth / 2, pageHeight - 6, {
        size: 7,
        color: C.muted,
        align: 'center',
        maxWidth: 40
      });
      drawText('Generated by WHITENX VAPT', pageWidth - margin, pageHeight - 6, {
        size: 6.5,
        color: C.mutedSoft,
        align: 'right',
        maxWidth: 55
      });
    }

    const cleanTarget = safeString(reportTarget || 'report', 'report').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`WHITENX-Report-${cleanTarget}-${Date.now()}.pdf`);
    return true;
  } catch (error) {
    console.error('generatePDF: failed to create PDF', error);
    return false;
  }
};

const Dashboard = ({ onSessionExpire }) => {
  const [domain,      setDomain]      = useState('');
  const [result,      setResult]      = useState(null);
  const [liveRes,     setLiveRes]     = useState(null);
  const [jsonData,    setJsonData]    = useState(null);
  const [err,         setErr]         = useState('');
  const [tab,         setTab]         = useState('overview');
  const [showJson,    setShowJson]    = useState(false);
  const [scanning,    setScanning]    = useState(false);
  const [si,          setSI]          = useState(0);
  const [prog,        setProg]        = useState(0);
  const [apiDone,     setApiDone]     = useState(false);
  const [domainValid, setDomainValid] = useState(null);
  const [validationMsg, setValidationMsg] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError,   setReportError]   = useState('');
  const [lastActivity,  setLastActivity]  = useState(Date.now());

  const timersRef    = useRef([]);
  const progRef      = useRef(null);
  const scanAbortRef = useRef(null);
  const idleLockRef  = useRef(false);

  const isValidDomain = (input) => {
    const t = input.trim();
    if (!t) return false;
    if (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(t)) return true;
    if (/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(t)) return true;
    if (t === 'localhost' || t.startsWith('localhost:')) return true;
    return false;
  };

  const validateDomainInput = (input) => {
    const t = input.trim();
    if (!t) { setDomainValid(null); setValidationMsg(''); return; }
    if (t.includes(' '))  { setDomainValid(false); setValidationMsg('❌ Spaces detected — remove them'); return; }
    if (t.includes('//')) { setDomainValid(false); setValidationMsg('❌ Remove http:// or https:// prefix'); return; }
    if (t.startsWith('.') || t.endsWith('.')) { setDomainValid(false); setValidationMsg('❌ Domain cannot start or end with a dot'); return; }
    if (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(t)) { setDomainValid(true); setValidationMsg('✓ Valid IPv4 address'); return; }
    if (t === 'localhost' || t.startsWith('localhost:')) { setDomainValid(true); setValidationMsg('✓ Valid localhost'); return; }
    if (/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(t)) { setDomainValid(true); setValidationMsg('✓ Valid domain'); return; }
    if (t.includes('_')) { setDomainValid(false); setValidationMsg('❌ Underscores not allowed — use hyphens'); return; }
    if (!t.includes('.')) { setDomainValid(false); setValidationMsg('❌ Missing domain extension (.com, .org…)'); return; }
    setDomainValid(false); setValidationMsg('❌ Invalid format — use: example.com or 192.168.1.1');
  };

  useEffect(()=>{ injectCSS(); },[]);

  useEffect(()=>{
    const reset=()=>{ setLastActivity(Date.now()); idleLockRef.current=false; };
    const evts=['mousemove','mousedown','keydown','touchstart','scroll'];
    evts.forEach(e=>window.addEventListener(e,reset,{passive:true}));
    const iv=setInterval(()=>{
      if(Date.now()-lastActivity>10*60*1000&&!idleLockRef.current){
        idleLockRef.current=true;
        setErr('Session expired due to inactivity.');
        onSessionExpire();
      }
    },15000);
    return()=>{ evts.forEach(e=>window.removeEventListener(e,reset)); clearInterval(iv); };
  },[lastActivity,onSessionExpire]);

  useEffect(()=>{
    const blockAction=e=>{ e.preventDefault(); setErr('Action blocked for security reasons.'); };
    const blockKey=e=>{ const k=e.key.toLowerCase(); if((e.ctrlKey||e.metaKey)&&['c','s','u','i','j','p','a'].includes(k)){ e.preventDefault(); setErr('Keyboard shortcut disabled.'); } };
    const handleVis=()=>{ if(document.hidden) setErr('Tab hidden — sensitive session activity blocked.'); };
    window.addEventListener('contextmenu',blockAction);
    document.addEventListener('copy',blockAction);
    document.addEventListener('visibilitychange',handleVis);
    window.addEventListener('keydown',blockKey);
    return()=>{ window.removeEventListener('contextmenu',blockAction); document.removeEventListener('copy',blockAction); document.removeEventListener('visibilitychange',handleVis); window.removeEventListener('keydown',blockKey); };
  },[]);

  const handleScan = async () => {
    if(!domain.trim()){ setErr('❌ Target field is empty — enter a domain or IP address'); setDomainValid(false); return; }
    if(!isValidDomain(domain)){ setErr('❌ Invalid format — ensure domain is typed correctly.'); setDomainValid(false); return; }
    setErr('');setResult(null);setLiveRes(null);setJsonData(null);setApiDone(false);
    setScanning(true);setSI(0);setProg(0);
    const scanStart=Date.now();
    const minScanMs=330000;
    scanAbortRef.current=new AbortController();

    if('Notification' in window&&Notification.permission==='default') await Notification.requestPermission();

    const dur=[45000,42000,42000,43000,42000,38000,35000];
    let cum=0;
    timersRef.current=dur.map((d,i)=>{ const t=setTimeout(()=>setSI(i),cum); cum+=d; return t; });
    progRef.current=setInterval(()=>setProg(p=>p>=84?84:+(p+0.087).toFixed(3)),250);

    try {
      const res=await fetch(`${API_BASE}/scan/full?target=${domain}`,{method:'GET',headers:{'Accept':'application/json','x-access-token':ACCESS_KEY},signal:scanAbortRef.current?.signal});
      if(!res.ok) throw new Error(`Scan failed: ${res.status}`);
      const data=await res.json();
      timersRef.current.forEach(clearTimeout);
      clearInterval(progRef.current);
      setSI(6);setProg(90);setApiDone(true);setLiveRes(data);setLastActivity(Date.now());

      if('Notification' in window&&Notification.permission==='granted'){
        const v=data.vulnerabilities||[];
        new Notification('⚡ WHITENX — Scan Complete',{body:`Target: ${domain}\n${v.filter(x=>x.severity==='CRITICAL').length} Critical  ${v.filter(x=>x.severity==='HIGH').length} High`,tag:'whitenx-scan',requireInteraction:true});
      }

      const remaining=Math.max(0,minScanMs-(Date.now()-scanStart));
      const ct=setTimeout(()=>{ setScanning(false);setJsonData(data);setResult(data);scanAbortRef.current=null; },Math.max(4200,remaining));
      timersRef.current.push(ct);
    } catch(e){
      timersRef.current.forEach(clearTimeout);
      clearInterval(progRef.current);
      setErr(e.name==='AbortError'?'⚠ Scan cancelled.':(e.message||'Backend unavailable'));
      setScanning(false);
      scanAbortRef.current=null;
    }
  };

  const handleCancelScan = useCallback(()=>{
    if(scanAbortRef.current) scanAbortRef.current.abort();
    timersRef.current.forEach(clearTimeout);
    timersRef.current=[];
    if(progRef.current){ clearInterval(progRef.current); progRef.current=null; }
    setScanning(false);setApiDone(false);setLiveRes(null);setJsonData(null);
    setErr('⚠ Scan cancelled.');scanAbortRef.current=null;
  },[]);

  const handleGenerateReport = useCallback(()=>{
    if(!result){ setReportError('No scan data available.'); return; }
    setReportError('');setReportSuccess(false);setReportLoading(true);
    try {
      generatePDF(result);
      setReportSuccess(true);
      setTimeout(()=>setReportSuccess(false),5000);
    } catch(e){
      setReportError(e?.message||'Unable to generate report.');
    } finally {
      setReportLoading(false);
    }
  },[result]);

  if(scanning) return <GhostTerminal si={si} progress={Math.round(prog)} target={domain} apiDone={apiDone} scanResult={liveRes} onCancel={handleCancelScan}/>;

  if(showJson&&jsonData) return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#000'}}>
      <Ticker/>
      <nav className="wx-nav">
        <div><div className="wx-logo">WHITENX</div></div>
        <button className="wx-btn" onClick={()=>setShowJson(false)}>← Back</button>
      </nav>
      <div style={{flex:1,overflow:'auto',padding:48}}>
        <div style={{fontSize:11,color:'rgba(255,255,255,.75)',letterSpacing:'2px',marginBottom:18,fontWeight:600,textTransform:'uppercase'}}>Raw Scan Output — JSON</div>
        <pre style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:16,padding:28,overflow:'auto',fontSize:13,color:'rgba(255,255,255,.88)',maxHeight:'80vh',fontFamily:"'JetBrains Mono',monospace"}}>{JSON.stringify(jsonData,null,2)}</pre>
      </div>
    </div>
  );

  if(!result) return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'#000'}}>
      <Ticker/>
      <div className="wx-hero">
        <div className="hero-starfield"/>
        <div className="live-particle-burst">
          {[1,2,3,4,5].map(i=><div key={i} className="live-particle"/>)}
        </div>
        <div className="glow-rings-container">
          <div className="glow-ring glow-ring-1"/>
          <div className="glow-ring glow-ring-2"/>
          <div className="glow-ring glow-ring-3"/>
        </div>
        <div className="glow-orb glow-orb-1"/>
        <div className="glow-orb glow-orb-2"/>
        <div className="hero-screen-fx"/>
        <div className="hero-constellation hero-constellation-a" aria-hidden="true">
          <svg viewBox="0 0 260 220"><polygon points="36,160 84,54 192,78 228,176 120,206"/><line x1="84" y1="54" x2="120" y2="206"/><line x1="36" y1="160" x2="192" y2="78"/><circle cx="36" cy="160" r="2"/><circle cx="84" cy="54" r="2"/><circle cx="192" cy="78" r="2"/><circle cx="228" cy="176" r="2"/><circle cx="120" cy="206" r="2"/></svg>
        </div>
        <div className="hero-constellation hero-constellation-b" aria-hidden="true">
          <svg viewBox="0 0 220 180"><polygon points="40,26 146,12 188,74 94,96"/><line x1="40" y1="26" x2="94" y2="96"/><line x1="146" y1="12" x2="94" y2="96"/><circle cx="40" cy="26" r="2"/><circle cx="146" cy="12" r="2"/><circle cx="188" cy="74" r="2"/><circle cx="94" cy="96" r="2"/></svg>
        </div>
        <div className="hero-bg-right"/>
        <div style={{position:'relative',zIndex:2,width:'100%',maxWidth:'100%',padding:'0 48px'}}>
          <div className="hero-badge"><span className="hero-badge-dot"/>Whitenx VAPT Platform</div>
          <div className="hero-title">VULNERABILITY<br/>ASSESSMENT<br/>PLATFORM</div>
          <div className="hero-desc">Professional penetration testing and security analysis. Full port scanning, CVE detection, OSINT intelligence, and SSL auditing in one platform.</div>
          <div className="hero-status-row">
            <span className="hero-status-chip live"><span className="hero-status-dot"/>Live Scan Active</span>
            <span className="hero-status-chip">Threat Intel Synced</span>
            <div className="hero-typing"><span>root@whitenx: monitoring attack surface signatures</span></div>
          </div>
          <div className="hero-features">
            {['Recon','Port Scan','CVE Match','OSINT','SSL Audit','Risk Score'].map(f=>(
              <span key={f} className="hero-feature">{f}</span>
            ))}
          </div>
          {err&&<div className="wx-err">{err}</div>}
          <div className="hero-input-row">
            <div style={{flex:1,position:'relative'}}>
              <input className="wx-input" placeholder="example.com or 192.168.1.1"
                value={domain}
                onChange={e=>{setDomain(e.target.value);validateDomainInput(e.target.value);}}
                onKeyDown={e=>e.key==='Enter'&&domainValid&&handleScan()}
                style={{borderColor:domainValid===true?'rgba(100,200,100,.4)':domainValid===false?'rgba(200,100,100,.4)':'rgba(255,255,255,.14)'}}
              />
              {validationMsg&&(
                <div style={{fontSize:9,color:domainValid?'rgba(100,200,100,.8)':'rgba(200,100,100,.8)',marginTop:6,letterSpacing:'.5px',fontFamily:'monospace'}}>
                  {validationMsg}
                </div>
              )}
            </div>
            <button className="wx-scan-btn" onClick={handleScan} disabled={domainValid!==true||scanning}
              style={{opacity:(domainValid&&!scanning)?1:0.5,cursor:(domainValid&&!scanning)?'pointer':'not-allowed'}}>
              {scanning?'Scanning...':'Scan →'}
            </button>
          </div>
          <div className="hero-warn"><span className="hero-warn-dot"/>Full scan takes 5–6 minutes — keep this tab open</div>
          <div className="hero-terminal">
            <div className="hero-terminal-top"><span className="hero-terminal-title">Operator Feed</span><span className="hero-terminal-state">Monitoring</span></div>
            <div className="hero-terminal-body">
              <div className="hero-log"><span className="hero-log-tag">INF</span><span className="hero-log-text">Passive recon modules armed for hostname, port, and SSL analysis.</span></div>
              <div className="hero-log"><span className="hero-log-tag">SYS</span><span className="hero-log-text">Telemetry ready. Awaiting target input for full-spectrum assessment.</span></div>
              <div className="hero-log"><span className="hero-log-tag">TIP</span><span className="hero-log-text">Use a domain or IP to launch the live security pipeline.</span></div>
            </div>
          </div>
          <div style={{marginTop:64,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,maxWidth:480}}>
            {[{icon:'🔍',label:'Port Scanning',desc:'Full 65535 port sweep with service detection'},{icon:'🛡️',label:'CVE Detection',desc:'48,000+ vulnerability database matching'},{icon:'🌐',label:'OSINT Intel',desc:'WHOIS, DNS records, crt.sh enumeration'},{icon:'🔒',label:'SSL Analysis',desc:'Certificate & cipher suite inspection'}].map(f=>(
              <div key={f.label} className="hero-feature-card">
                <div style={{fontSize:24,marginBottom:10}}>{f.icon}</div>
                <div style={{fontSize:12,fontWeight:800,letterSpacing:'.8px',color:'#fff',marginBottom:8}}>{f.label}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.68)',lineHeight:1.7}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── REPORT DASHBOARD ──────────────────────────────────────
  const vulns = result.vulnerabilities||[];
  const svcs  = result.fingerprinted_services||result.services||[];
  const ports  = result.port_scan?.services||result.port_scan?.open_ports||[];
  const subds  = result.subdomain_enum?.subdomains||result.subdomains||[];
  const osint  = result.osint||{};
  const sslA   = result.ssl_analysis||{};
  const hdrs   = osint.http?.security_headers||{};

  const crit=vulns.filter(v=>v.severity==='CRITICAL').length;
  const high=vulns.filter(v=>v.severity==='HIGH').length;
  const med =vulns.filter(v=>v.severity==='MEDIUM').length;
  const low =vulns.filter(v=>v.severity==='LOW').length;

  const TABS=['Overview','Vulnerabilities','Services','Ports','Subdomains','OSINT'];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#000'}}>
      <Ticker/>
      <nav className="wx-nav">
        <div>
          <div className="wx-logo">WHITENX</div>
          <span className="wx-logo-sub">VAPT PLATFORM</span>
        </div>
        <div className="wx-tabs">
          {TABS.map(t=>(
            <button key={t}
              className={`wx-tab${tab===t.toLowerCase().replace(' ','')?' active':''}`}
              onClick={()=>setTab(t.toLowerCase().replace(' ',''))}>{t}</button>
          ))}
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button className="wx-btn" onClick={()=>{setDomain('');setResult(null);setJsonData(null);}}>New Scan</button>
          {jsonData&&<button className="wx-btn" onClick={()=>setShowJson(true)}>JSON</button>}
          {result&&(
            <button className="wx-btn wx-btn-primary" onClick={handleGenerateReport} disabled={reportLoading}>
              {reportLoading?'Generating...':'↓ PDF Report'}
            </button>
          )}
        </div>
      </nav>

      {(reportError||reportSuccess)&&(
        <div style={{padding:'8px 48px',background:reportSuccess?'rgba(255,255,255,.05)':'rgba(239,68,68,.08)',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
          <span style={{fontSize:11,color:reportSuccess?'rgba(255,255,255,.8)':'#fca5a5'}}>{reportSuccess?'✓ PDF report generated and downloaded successfully.':reportError}</span>
        </div>
      )}

      <div className="wx-body">
        <div className="wx-rpt-hdr">
          <div>
            <div className="wx-rpt-title">Security Assessment Report</div>
            <div className="wx-rpt-meta">
              Target: <span style={{color:'#fff'}}>{result.target}</span>
              &nbsp;·&nbsp; ID: {result.scan_id?.substring(0,14)}...
              &nbsp;·&nbsp; {new Date().toLocaleDateString()}
            </div>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
            {crit>0&&<span className="wx-badge">{crit} Critical</span>}
            {high>0&&<span className="wx-badge">{high} High</span>}
            {med>0&&<span className="wx-badge">{med} Medium</span>}
          </div>
        </div>

        {tab==='overview'&&(
          <>
            <div className="g4 wx-stat-grid">
              <StatCard label="Critical / High" val={crit+high} sub={`${med} medium, ${low} low`} icon="⚠️" delay="0s"/>
              <StatCard label="Open Ports" val={ports.length} sub="discovered" icon="🔌" delay=".05s"/>
              <StatCard label="Subdomains" val={subds.length} sub="enumerated" icon="🌐" delay=".1s"/>
              <StatCard label="Services" val={svcs.length} sub="fingerprinted" icon="⚙️" delay=".15s"/>
            </div>
            <div className="wx-section-label">Top Issues</div>
            <div className="wx-card">
              <div className="wx-card-hdr"><div className="wx-card-title">Critical Vulnerabilities</div><span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{vulns.length} total</span></div>
              <WxTable cols={['Vulnerability','Severity','Port','Recommendation']}
                rows={vulns.slice(0,8).map((v,i)=>(
                  <tr key={i}>
                    <td style={{color:'rgba(255,255,255,.78)'}}>{v.type}</td>
                    <td><SevBadge s={v.severity}/></td>
                    <td style={{color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{v.port||'—'}</td>
                    <td style={{fontSize:10,color:'rgba(255,255,255,.6)',maxWidth:240}}>{(v.recommendation||'Review configuration').substring(0,60)}</td>
                  </tr>
                ))}
              />
            </div>
            <div className="wx-section-label">Services Detected</div>
            <div className="wx-card">
              <div className="wx-card-hdr"><div className="wx-card-title">Running Services</div><span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{svcs.length} detected</span></div>
              <WxTable cols={['Port','Service','Version','CVEs']}
                rows={svcs.map((s,i)=>(
                  <tr key={i}>
                    <td><strong style={{color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{s.port}</strong></td>
                    <td style={{color:'rgba(255,255,255,.78)'}}>{s.service_name||s.service}</td>
                    <td>{s.version?<span style={{color:'rgba(255,255,255,.85)',fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>{s.version}</span>:<span style={{color:'rgba(255,255,255,.35)'}}>—</span>}</td>
                    <td>{s.cves?.length>0?<span className="wx-badge">{s.cves.length} CVEs</span>:<span className="wx-badge" style={{opacity:.5}}>None</span>}</td>
                  </tr>
                ))}
              />
            </div>
            {osint?.osint_score&&(
              <>
                <div className="wx-section-label">OSINT Summary</div>
                <div className="g3">
                  <WxCard title="OSINT Score">
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:120,gap:8}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:64,color:'#fff',letterSpacing:2,lineHeight:1}}>{osint.osint_score||'—'}</div>
                      <div style={{fontSize:9,color:'rgba(255,255,255,.6)',letterSpacing:'2px',textTransform:'uppercase'}}>Out of 100</div>
                    </div>
                  </WxCard>
                  <WxCard title="Trust Level">
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:120,gap:8}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,letterSpacing:2,color:'#fff'}}>{osint.trust_level||'?'}</div>
                      <div style={{fontSize:9,color:'rgba(255,255,255,.6)',letterSpacing:'2px',textTransform:'uppercase'}}>Reputation</div>
                    </div>
                  </WxCard>
                  <WxCard title="Security Headers">
                    <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:4}}>
                      {Object.entries(hdrs).slice(0,4).map(([k,v])=>(
                        <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:10}}>
                          <span style={{color:'rgba(255,255,255,.6)'}}>{k}</span>
                          <SevBadge s={v?'ENABLED':'MISSING'}/>
                        </div>
                      ))}
                    </div>
                  </WxCard>
                </div>
              </>
            )}
          </>
        )}

        {tab==='vulnerabilities'&&(
          <div className="wx-card">
            <div className="wx-card-hdr"><div className="wx-card-title">All Vulnerabilities</div><span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{vulns.length} total</span></div>
            <WxTable cols={['Type','Severity','Port','Recommendation']}
              rows={vulns.map((v,i)=>(
                <tr key={i}>
                  <td style={{color:'rgba(255,255,255,.78)'}}>{v.type}</td>
                  <td><SevBadge s={v.severity}/></td>
                  <td style={{color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{v.port||'—'}</td>
                  <td style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>{(v.recommendation||'Review configuration').substring(0,70)}</td>
                </tr>
              ))} empty="No vulnerabilities detected"
            />
          </div>
        )}

        {tab==='services'&&(
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="wx-card">
              <div className="wx-card-hdr"><div className="wx-card-title">Fingerprinted Services</div></div>
              <WxTable cols={['Port','Service','Version','Banner','CVEs']}
                rows={svcs.map((s,i)=>(
                  <tr key={i}>
                    <td><strong style={{color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{s.port}</strong></td>
                    <td style={{color:'rgba(255,255,255,.78)'}}>{s.service_name||s.service}</td>
                    <td style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>{s.version||'—'}</td>
                    <td style={{fontSize:10,color:'rgba(255,255,255,.58)',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.banner?s.banner.substring(0,40)+'...':'—'}</td>
                    <td>{s.cves?.length>0?<span className="wx-badge">{s.cves.length}</span>:<span className="wx-badge" style={{opacity:.5}}>0</span>}</td>
                  </tr>
                ))}
              />
            </div>
            {Object.keys(hdrs).length>0&&(
              <div className="wx-card">
                <div className="wx-card-hdr"><div className="wx-card-title">Security Headers</div></div>
                <WxTable cols={['Header','Status']}
                  rows={Object.entries(hdrs).map(([k,v])=>(
                    <tr key={k}><td style={{fontSize:11,color:'rgba(255,255,255,.78)'}}>{k}</td><td><SevBadge s={v?'ENABLED':'MISSING'}/></td></tr>
                  ))}
                />
              </div>
            )}
            {sslA?.certificates?.length>0&&(
              <div className="wx-card">
                <div className="wx-card-hdr"><div className="wx-card-title">SSL Certificate</div></div>
                <div className="wx-card-body">
                  {(()=>{const c=sslA.certificates[0];return(
                    <table className="wx-tbl"><tbody>
                      {[['Subject',c.subject],['Issuer',c.issuer],['Valid From',c.notBefore],['Valid Until',c.notAfter],['Days Left',(c.expiry_days||'?')+'d']].map(([k,v])=>(
                        <tr key={k}><td style={{color:'rgba(255,255,255,.6)',width:100,fontSize:10,textTransform:'uppercase',letterSpacing:'1px'}}>{k}</td><td style={{color:'rgba(255,255,255,.78)',fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>{v||'—'}</td></tr>
                      ))}
                    </tbody></table>
                  );})()}
                </div>
              </div>
            )}
          </div>
        )}

        {tab==='ports'&&(
          <div className="wx-card">
            <div className="wx-card-hdr"><div className="wx-card-title">Port Scan Results</div><span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{ports.length} open</span></div>
            <WxTable cols={['Port','Service','State','Version','Banner']}
              rows={ports.map((p,i)=>(
                <tr key={i}>
                  <td><strong style={{color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{p.port}</strong></td>
                  <td style={{color:'rgba(255,255,255,.78)'}}>{p.service}</td>
                  <td><SevBadge s={(p.state||'OPEN').toUpperCase()}/></td>
                  <td style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>{p.version||'—'}</td>
                  <td style={{fontSize:10,color:'rgba(255,255,255,.58)',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.banner?p.banner.substring(0,45)+'...':'—'}</td>
                </tr>
              ))} empty="No open ports"
            />
          </div>
        )}

        {tab==='subdomains'&&(
          <div className="wx-card">
            <div className="wx-card-hdr"><div className="wx-card-title">Subdomain Enumeration</div><span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{subds.length} found</span></div>
            <WxTable cols={['Subdomain','Status','IP Addresses','URL']}
              rows={subds.map((s,i)=>(
                <tr key={i}>
                  <td style={{color:'#fff',fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>{s.subdomain||s}</td>
                  <td><SevBadge s={s.alive?'ALIVE':'DOWN'}/></td>
                  <td style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>{s.dns_ips?.join(', ')||'—'}</td>
                  <td style={{fontSize:10,color:'rgba(255,255,255,.58)'}}>{s.url||'—'}</td>
                </tr>
              ))} empty="No subdomains found"
            />
          </div>
        )}

        {tab==='osint'&&(
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="g2">
              <WxCard title="WHOIS">
                <table className="wx-tbl"><tbody>
                  {[['Registrar',osint.whois?.registrar],['Organization',osint.whois?.organization],['Country',osint.whois?.country],['Created',osint.whois?.creation_date],['Expires',osint.whois?.expiration_date]].map(([k,v])=>(
                    <tr key={k}><td style={{color:'rgba(255,255,255,.6)',width:100,fontSize:9,textTransform:'uppercase',letterSpacing:'1px'}}>{k}</td><td style={{fontSize:11,color:'rgba(255,255,255,.78)'}}>{v||'N/A'}</td></tr>
                  ))}
                </tbody></table>
              </WxCard>
              <WxCard title="DNS Records">
                <table className="wx-tbl"><tbody>
                  <tr><td style={{color:'rgba(255,255,255,.6)',width:40,fontSize:9}}>A</td><td style={{fontSize:10,color:'rgba(255,255,255,.78)'}}>{osint.dns?.a_records?.join(', ')||'None'}</td></tr>
                  <tr><td style={{color:'rgba(255,255,255,.6)',fontSize:9}}>MX</td><td style={{fontSize:10,color:'rgba(255,255,255,.78)'}}>{osint.dns?.mx_records?.map(m=>m.exchange||m).join(', ')||'None'}</td></tr>
                  <tr><td style={{color:'rgba(255,255,255,.6)',fontSize:9}}>NS</td><td style={{fontSize:10,color:'rgba(255,255,255,.78)'}}>{osint.dns?.ns_records?.slice(0,3).join(', ')||'None'}</td></tr>
                  <tr><td style={{color:'rgba(255,255,255,.6)',fontSize:9}}>TXT</td><td style={{fontSize:10,color:'rgba(255,255,255,.78)'}}>{osint.dns?.txt_records?.slice(0,2).join(', ')||'None'}</td></tr>
                </tbody></table>
              </WxCard>
            </div>
            {Object.keys(hdrs).length>0&&(
              <WxCard title="HTTP Security Headers">
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:8}}>
                  {Object.entries(hdrs).map(([k,v])=>(
                    <div key={k} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.12)',borderLeft:'3px solid rgba(255,255,255,.24)',borderRadius:10,padding:'10px 14px'}}>
                      <div style={{fontSize:7,color:'rgba(255,255,255,.65)',letterSpacing:'1px',marginBottom:4,fontWeight:700,textTransform:'uppercase'}}>{v?'Enabled':'Missing'}</div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.72)'}}>{k}</div>
                    </div>
                  ))}
                </div>
              </WxCard>
            )}
          </div>
        )}

        <div style={{height:40}}/>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════
function App() {
  const [stage, setStage] = useState('legal');
  useEffect(()=>{ injectCSS(); },[]);
  return (
    <>
      {stage==='legal'     && <LegalPage  onAccept={()=>setStage('login')}/>}
      {stage==='login'     && <LoginPage  onLogin={()=>setStage('dashboard')}/>}
      {stage==='dashboard' && <Dashboard  onSessionExpire={()=>setStage('login')}/>}
    </>
  );
}

export default App;

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// // ════════════════════════════════════════════════════════════
// // WHITENX — ALSyed Initiative Theme
// // Pure Black + White Monochrome Premium Cybersecurity UI
// // ════════════════════════════════════════════════════════════

// const API_BASE   = 'https://ai-vapt-project.onrender.com';
// const ACCESS_KEY = 'WX-E4QB-4ZJY-L5UN-WBSK';

// // ── Global CSS ───────────────────────────────────────────────
// const injectCSS = () => {
//   if (document.getElementById('wx-css')) return;
//   const s = document.createElement('style');
//   s.id = 'wx-css';
//   s.textContent = `
// @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

// :root{
//   --bg-start:#000000;
//   --bg-end:#090909;
//   --glass:rgba(255,255,255,.08);
//   --glass-strong:rgba(255,255,255,.1);
//   --glass-soft:rgba(255,255,255,.06);
//   --border:rgba(255,255,255,.14);
//   --text:#f7f7f7;
//   --text-soft:rgba(255,255,255,.72);
//   --text-dim:rgba(255,255,255,.5);
//   --accent:#ffffff; /* Strict B&W */
//   --accent-soft:rgba(255,255,255,.12);
//   --shadow:0 10px 40px rgba(0,0,0,.35);
// }

// *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
// html,body,#root{
//   height:100%;
//   color:var(--text);
//   font-family:'Inter',sans-serif;
//   background:
//     radial-gradient(circle at 18% 16%, rgba(255,255,255,.05), transparent 22%),
//     radial-gradient(circle at 82% 12%, rgba(255,255,255,.04), transparent 20%),
//     linear-gradient(180deg,var(--bg-start),var(--bg-end));
//   user-select:none;
//   -webkit-user-select:none;
// }
// body{background-attachment:fixed}
// ::-webkit-scrollbar{width:6px;height:6px}
// ::-webkit-scrollbar-track{background:rgba(255,255,255,.03)}
// ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.16);border-radius:999px}

// .wx-pdf-report{
//   position:absolute;
//   top:-9999px;
//   left:-9999px;
//   width:1200px;
//   max-width:1200px;
//   opacity:0;
//   pointer-events:none;
// }

// /* ── TICKER ── */
// @keyframes ticker-scroll{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
// .ticker-wrap{
//   width:100%;overflow:hidden;background:#050505;border-bottom:1px solid rgba(255,255,255,.12);
//   padding:8px 0;backdrop-filter:blur(16px);position:relative;
//   box-shadow:0 4px 18px rgba(0,0,0,.28);
// }
// .ticker-wrap::after{
//   content:'';position:absolute;inset:auto 0 0;height:1px;
//   background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),rgba(255,255,255,.16),transparent);
// }
// .ticker-inner{
//   display:inline-block;white-space:nowrap;
//   animation:ticker-scroll 30s linear infinite;
//   font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:var(--text-dim);
// }
// .ticker-inner span{margin:0 40px;}

// /* ── NAV ── */
// .wx-nav{
//   display:flex;align-items:center;justify-content:space-between;
//   padding:0 48px;height:72px;
//   background:rgba(0,0,0,.94);border-bottom:1px solid rgba(255,255,255,.12);
//   position:sticky;top:0;z-index:50;backdrop-filter:blur(18px);box-shadow:0 10px 30px rgba(0,0,0,.35);
// }
// .wx-logo{
//   font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:6px;
//   color:var(--text);flex-shrink:0;text-shadow:0 0 12px rgba(255,255,255,.12);
// }
// .wx-logo-sub{font-family:'Inter',sans-serif;font-size:8px;letter-spacing:3px;color:var(--text-dim);display:block;margin-top:-3px;}
// .wx-tabs{display:flex;gap:8px;overflow-x:auto;flex:1;justify-content:center;scrollbar-width:none;padding:0 20px;}
// .wx-tabs::-webkit-scrollbar{display:none;}
// .wx-tab{
//   font-family:'Inter',sans-serif;font-size:11px;font-weight:600;
//   letter-spacing:1px;padding:10px 18px;border-radius:100px;
//   border:1px solid rgba(255,255,255,.08);cursor:pointer;white-space:nowrap;
//   background:rgba(255,255,255,.03);color:var(--text-soft);transition:all .2s ease;
// }
// .wx-tab:hover{color:var(--text);background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.14);}
// .wx-tab.active{
//   color:var(--text);background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.18);
// }
// .wx-btn{
//   font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;
//   letter-spacing:1.5px;padding:9px 18px;border-radius:999px;
//   border:1px solid rgba(255,255,255,.12);cursor:pointer;flex-shrink:0;
//   background:rgba(255,255,255,.05);color:var(--text);transition:all .2s;white-space:nowrap;
// }
// .wx-btn:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.2);}
// .wx-btn-primary{background:#ffffff;color:#000000;border-color:#ffffff;box-shadow:0 0 14px rgba(255,255,255,.14);}
// .wx-btn-primary:hover{transform:scale(1.04);box-shadow:0 0 18px rgba(255,255,255,.18),0 12px 36px rgba(0,0,0,.32);filter:brightness(1.05);}

// /* ── BODY ── */
// .wx-body{flex:1;overflow-y:auto;padding:32px 48px;display:flex;flex-direction:column;gap:20px;position:relative;}
// .wx-body::before{
//   content:'';
//   position:fixed;
//   inset:72px 0 0 0;
//   pointer-events:none;
//   background-image:
//     linear-gradient(rgba(255,255,255,.012) 1px, transparent 1px),
//     linear-gradient(90deg, rgba(255,255,255,.012) 1px, transparent 1px);
//   background-size:56px 56px;
//   opacity:.24;
//   mask-image:radial-gradient(circle at center, black 38%, transparent 92%);
// }
// @media(max-width:900px){.wx-body{padding:20px;}.wx-nav{padding:0 20px;}}

// /* ── CARDS ── */
// .wx-card{
//   background:#0a0a0a;border:1px solid #222;
//   border-radius:8px;overflow:hidden;
//   transition:border-color .2s,transform .15s;
//   animation:db-in .4s ease both;
// }
// .wx-card:hover{border-color:#444;}
// .wx-card::before{
//   content:'';
//   position:absolute;
//   inset:10px;
//   border:1px solid rgba(255,255,255,.028);
//   border-radius:12px;
//   pointer-events:none;
// }
// .wx-card::after{
//   content:'';
//   position:absolute;
//   top:10px;right:10px;
//   width:22px;height:22px;
//   border-top:1px solid rgba(255,255,255,.12);
//   border-right:1px solid rgba(255,255,255,.12);
//   opacity:.55;
//   pointer-events:none;
// }
// .wx-card-hdr{
//   display:flex;align-items:center;justify-content:space-between;
//   padding:12px 18px;border-bottom:1px solid #0a1628;
//   background:#04091a;
//   background:#111;
// }
// .wx-card-title{font-size:9px;font-weight:700;letter-spacing:2px;color:#fff;}
// .wx-card-body{padding:18px;}

// /* ── STAT CARDS ── */
// .wx-stat-grid{display:grid;gap:12px;}
// .wx-stat{
//   background:#060d1c;border:1px solid #0f2040;border-radius:8px;
//   padding:18px 20px;display:flex;flex-direction:column;gap:6px;
//   position:relative;overflow:hidden;transition:all .2s;
// }
// .wx-stat:hover{border-color:rgba(255,255,255,.18);transform:translateY(-1px);}
// .wx-stat::before{
//   content:'';position:absolute;top:0;left:0;right:0;height:2px;
//   background:rgba(255,255,255,.18);opacity:.6;
// }
// .wx-stat-label{font-size:8px;font-weight:700;letter-spacing:2px;color:#fff;}
// .wx-stat-val{font-size:36px;font-weight:800;line-height:1;color:#fff;}
// .wx-stat-sub{font-size:9px;color:#fff;}
// .wx-stat-icon{
//   position:absolute;right:16px;top:50%;transform:translateY(-50%);
//   font-size:32px;opacity:.06;
// }
// .wx-stat-accent{position:absolute;bottom:0;left:0;right:0;height:2px;background:rgba(255,255,255,.16);opacity:.6;box-shadow:0 0 6px rgba(255,255,255,.16);}

// /* ── TABLES ── */
// .wx-tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
// .wx-tbl{width:100%;border-collapse:collapse;font-size:11px;}
// .wx-tbl th{padding:10px 16px;text-align:left;font-size:8px;font-weight:700;letter-spacing:1.5px;color:rgba(255,255,255,.72);border-bottom:1px solid #0a1628;background:#04091a;}
// .wx-tbl td{padding:12px 16px;border-bottom:1px solid #060d1c;color:rgba(255,255,255,.68);transition:background .15s;}
// .wx-tbl tr:hover td{background:rgba(255,255,255,.06);}
// .wx-tbl tr:last-child td{border-bottom:none;}

// /* ── BADGES ── */
// .wx-badge{display:inline-block;font-size:9px;font-weight:700;letter-spacing:1px;padding:4px 10px;border-radius:100px;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.12);}
// .bc,.bh,.bm,.bl,.bg{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.12);}
// .bn{background:rgba(255,255,255,.05);color:var(--text-dim);border:1px solid rgba(255,255,255,.08);}

// /* ── LEGAL PAGE ── */
// @keyframes lp-in{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
// @keyframes lp-fade{from{opacity:0}to{opacity:1}}
// @keyframes lp-box-slide{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
// @keyframes lp-item-fade{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}

// .lp-wrap{
//   min-height:100vh;
//   display:flex;flex-direction:column;align-items:center;
//   padding:60px 20px;position:relative;overflow:hidden;
//   background:#000;
// }

// .lp-bg-shapes{
//   position:absolute;
//   inset:0;
//   pointer-events:none;
//   z-index:0;
// }

// .lp-shape-ring{
//   position:absolute;
//   border:1px solid rgba(255,255,255,.1);
//   border-radius:50%;
//   right:6%;
//   top:10%;
//   animation:rotate-smooth 28s linear infinite;
//   opacity:.28;
// }

// .lp-shape-ring-1{
//   width:260px;
//   height:260px;
//   margin-right:-130px;
//   margin-top:-130px;
// }

// .lp-shape-ring-2{
//   width:400px;
//   height:400px;
//   margin-right:-200px;
//   margin-top:-200px;
//   animation:rotate-smooth 35s linear infinite reverse;
//   opacity:.18;
// }

// .lp-shape-orb{
//   position:absolute;
//   border-radius:50%;
//   left:5%;
//   bottom:12%;
//   width:110px;
//   height:110px;
//   background:radial-gradient(circle at 35% 35%, rgba(255,255,255,.14), rgba(255,255,255,.01));
//   box-shadow:0 0 36px rgba(255,255,255,.1), inset -6px -6px 18px rgba(0,0,0,.4);
//   opacity:.28;
// }

//   background:
//     radial-gradient(circle at 72% 16%, rgba(255,255,255,.04), transparent 20%),
//     #000;
// }
// .lp-wrap::before{
//   content:'';
//   position:absolute;inset:0;pointer-events:none;
//   background-image:
//     linear-gradient(rgba(255,255,255,.01) 1px, transparent 1px),
//     linear-gradient(90deg, rgba(255,255,255,.01) 1px, transparent 1px);
//   background-size:64px 64px;
//   opacity:.2;
// }
// .lp-bg-diamond{
//   position:absolute;right:-200px;top:50%;transform:translateY(-50%) rotate(45deg);
//   width:600px;height:600px;border:1px solid rgba(255,255,255,.08);
//   pointer-events:none;
// }
// .lp-bg-diamond::before{
//   content:'';position:absolute;inset:60px;border:1px solid rgba(255,255,255,.05);
// }
// .lp-container{
//   width:100%;max-width:720px;position:relative;z-index:10;
//   animation:lp-in .8s ease both;
// }
// .lp-badge-top{
//   display:inline-flex;align-items:center;gap:8px;
//   background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:100px;
//   padding:8px 16px;margin-bottom:32px;
//   font-size:9px;font-weight:700;letter-spacing:2.2px;color:#fff;
//   backdrop-filter:blur(14px);transition:all .3s ease;animation:lp-item-fade .6s ease both;animation-delay:.1s;
// }
// .lp-badge-dot{width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 12px rgba(255,255,255,.5);}
// .lp-title{
//   font-family:'Bebas Neue',sans-serif;font-size:clamp(40px,8vw,68px);
//   letter-spacing:5px;color:#ffffff;margin-bottom:12px;line-height:1;
//   text-shadow:0 0 20px rgba(255,255,255,.15);
//   animation:lp-in .8s ease both;animation-delay:.1s;
//   font-weight:900;
// }
// .lp-subtitle{font-size:11px;color:rgba(255,255,255,.75);letter-spacing:1.8px;margin-bottom:48px;animation:lp-item-fade .6s ease both;animation-delay:.2s;text-transform:uppercase;font-weight:600;}
// .lp-box{
//   background:rgba(20,20,20,.9);border:1px solid rgba(255,255,255,.12);border-radius:16px;
//   overflow:hidden;margin-bottom:24px;
//   backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,.5);transition:all .3s ease;
//   animation:lp-box-slide .6s ease both;font-size:14px;
// }
// .lp-box:hover{border-color:rgba(255,255,255,.22);box-shadow:0 16px 48px rgba(0,0,0,.65),0 0 20px rgba(255,255,255,.08);transform:translateY(-3px);}
// .lp-box-hdr{
//   padding:18px 24px;border-bottom:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.4);
//   font-size:8.5px;font-weight:800;letter-spacing:2.5px;color:#fff;text-transform:uppercase;tracking:wide;
// }
// .lp-box-body{padding:24px;}
// .lp-item{display:flex;gap:14px;margin-bottom:16px;animation:lp-item-fade .6s ease both;}
// .lp-item:last-child{margin-bottom:0;}
// .lp-item-num{
//   width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.2);
//   display:flex;align-items:center;justify-content:center;
//   font-size:9px;font-weight:800;color:#fff;flex-shrink:0;margin-top:1px;
// }
// .lp-item-text{font-size:11.5px;color:rgba(255,255,255,.82);line-height:1.8;}
// .lp-item-text strong{color:#ffffff;font-weight:700;}
// .lp-laws-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
// @media(max-width:600px){.lp-laws-grid{grid-template-columns:1fr}}
// .lp-law{background:rgba(30,30,30,.8);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;transition:all .3s ease;}
// .lp-law:hover{border-color:rgba(255,255,255,.25);box-shadow:0 0 16px rgba(255,255,255,.1);transform:translateY(-2px);}
// .lp-law-region{font-size:7.8px;font-weight:900;letter-spacing:2.2px;color:rgba(255,255,255,.7);margin-bottom:6px;text-transform:uppercase;}
// .lp-law-text{font-size:10.5px;color:rgba(255,255,255,.78);line-height:1.5;}
// .lp-accept-btn{
//   width:100%;padding:16px;
//   font-family:'Bebas Neue',sans-serif;font-size:13px;font-weight:900;letter-spacing:2.5px;
//   background:#ffffff;border:1.5px solid rgba(255,255,255,.9);border-radius:100px;
//   color:#000;cursor:pointer;transition:all .3s cubic-bezier(.25,.46,.45,.94);text-transform:uppercase;
//   box-shadow:0 0 24px rgba(255,255,255,.2),0 8px 32px rgba(0,0,0,.45);
//   animation:lp-box-slide .8s ease both;animation-delay:.4s;
// }
// .lp-accept-btn:hover{transform:scale(1.05);box-shadow:0 0 40px rgba(255,255,255,.35),0 12px 48px rgba(0,0,0,.6);background:#f5f5f5;}
// .lp-accept-btn:active{transform:scale(.98);}
// .lp-footer-text{font-size:8px;color:rgba(255,255,255,.55);letter-spacing:1.2px;text-align:center;margin-top:18px;animation:lp-item-fade .6s ease both;animation-delay:.5s;text-transform:uppercase;font-weight:600;}

// .lp-big-circle{
//   position:absolute;
//   border:2px solid #ffffff;
//   border-radius:50%;
//   top:50%;left:50%;
//   transform:translate(-50%,-50%);
//   width:480px;
//   height:480px;
//   animation:rotate-smooth 20s linear infinite reverse;
//   box-shadow:0 0 50px rgba(255,255,255,.45), 0 0 110px rgba(0,0,0,.75), inset 0 0 70px rgba(0,0,0,.55);
//   opacity:.85;
//   z-index:2;
// }

// /* ── LOGIN PAGE ── */
// @keyframes lg-in{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
// @keyframes lg-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
// @keyframes lg-shift-gradient{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
// @keyframes lg-particle-1{0%{opacity:0;transform:translate(0,0) scale(0)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(120px,-280px) scale(0)}}
// @keyframes lg-particle-2{0%{opacity:0;transform:translate(0,0) scale(0)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(-140px,-240px) scale(0)}}
// @keyframes lg-particle-3{0%{opacity:0;transform:translate(0,0) scale(0)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(180px,120px) scale(0)}}
// @keyframes lg-particle-4{0%{opacity:0;transform:translate(0,0) scale(0)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(-160px,150px) scale(0)}}
// @keyframes lg-particle-5{0%{opacity:0;transform:translate(0,0) scale(0)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(0px,-260px) scale(0)}}
// @keyframes lg-morph-orb{0%{border-radius:60% 40% 30% 70%}25%{border-radius:30% 60% 70% 40%}50%{border-radius:70% 30% 40% 60%}75%{border-radius:40% 70% 60% 30%}100%{border-radius:60% 40% 30% 70%}}
// @keyframes lg-text-glow{0%,100%{text-shadow:0 0 8px rgba(255,255,255,.6)}50%{text-shadow:0 0 16px rgba(255,255,255,.9)}}

// .lg-wrap{
//   min-height:100vh;
//   display:flex;align-items:center;justify-content:center;
//   padding:20px;position:relative;overflow:hidden;
//   background:linear-gradient(-45deg, #000, #0a0a0a, #000, #050505);
//   background-size:300% 300%;
//   animation:lg-shift-gradient 12s ease infinite;
// }
// .lg-wrap::after{
//   content:'';
//   position:absolute;inset:0;
//   background:repeating-linear-gradient(
//     0deg,
//     rgba(0,0,0,.15),
//     rgba(0,0,0,.15) 1px,
//     transparent 1px,
//     transparent 2px
//   );
//   pointer-events:none;
//   z-index:0;
//   animation:lg-scanline 8s linear infinite;
// }
// @keyframes lg-scanline{
//   0%{transform:translateY(0)}
//   100%{transform:translateY(10px)}
// }
// .lg-wrap::before{
//   content:'';
//   position:absolute;inset:0;pointer-events:none;
//   background-image:
//     linear-gradient(rgba(255,255,255,.01) 1px, transparent 1px),
//     linear-gradient(90deg, rgba(255,255,255,.01) 1px, transparent 1px);
//   background-size:64px 64px;
//   opacity:.18;
// }
// .lg-bg{
//   position:absolute;inset:0;pointer-events:none;z-index:1;
//   background:radial-gradient(ellipse at 70% 50%, rgba(255,255,255,.03) 0%, transparent 50%);
// }
// .lg-diamond{
//   position:absolute;right:10%;top:50%;transform:translateY(-50%) rotate(45deg);z-index:2;
//   width:400px;height:400px;border:1px solid rgba(255,255,255,.08);
//   animation:lg-float 8s ease-in-out infinite;
// }
// .lg-diamond::before{content:'';position:absolute;inset:50px;border:1px solid rgba(255,255,255,.05);}
// .lg-diamond::after{content:'';position:absolute;inset:100px;border:1px solid rgba(255,255,255,.04);}
// .lg-card{
//   width:100%;max-width:440px;position:relative;z-index:11;
//   background:var(--glass);border:1px solid var(--border);
//   border-radius:24px;overflow:hidden;
//   animation:lg-in .6s ease both;backdrop-filter:blur(12px);box-shadow:var(--shadow);transition:all .3s ease;
// }
// .lg-card:hover{border-color:rgba(255,255,255,.18);box-shadow:0 16px 44px rgba(0,0,0,.46),0 0 16px rgba(255,255,255,.06);transform:translateY(-2px);}
// .lg-card-top{padding:32px 32px 28px;border-bottom:1px solid rgba(255,255,255,.08);}
// .lg-logo{
//   font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:8px;color:#ffffff;
//   animation:lg-text-glow 3s ease-in-out infinite;
// }
// .lg-logo-sub{font-size:9px;letter-spacing:3px;color:#ffffff;margin-top:2px;opacity:.8;animation:lg-in .6s ease both;animation-delay:.2s;}
// .lg-card-body{padding:32px;}
// .lg-red-circle{
//   position:absolute;
//   width:480px;height:480px;
//   border-radius:50%;
//   bottom:10%;
//   right:5%;
//   border:1.5px solid rgba(239,68,68,.6);
//   background:radial-gradient(circle at 30% 30%, rgba(239,68,68,.08), transparent 70%);
//   box-shadow:0 0 40px rgba(239,68,68,.25), 0 0 80px rgba(239,68,68,.12), inset 0 0 50px rgba(239,68,68,.05);
//   animation:rotate-smooth 25s linear infinite, lg-float 6s ease-in-out infinite;
//   z-index:1;
//   animation-delay:0s, 1s;
//   opacity:.7;
// }
// .lg-particle{
//   position:absolute;width:8px;height:8px;border-radius:50%;
//   background:#ffffff;box-shadow:0 0 12px rgba(255,255,255,.8);
//   pointer-events:none;z-index:0;
// }
// .lg-particles-container{position:absolute;inset:0;pointer-events:none;z-index:1;}

// .lg-particle-1{animation:lg-particle-1 4s ease-out infinite;left:40%;top:20%;animation-delay:0s;}
// .lg-particle-2{animation:lg-particle-2 4s ease-out infinite;left:55%;top:30%;animation-delay:.3s;}
// .lg-particle-3{animation:lg-particle-3 4s ease-out infinite;left:45%;top:25%;animation-delay:.6s;}
// .lg-particle-4{animation:lg-particle-4 4s ease-out infinite;left:50%;top:35%;animation-delay:.9s;}
// .lg-particle-5{animation:lg-particle-5 4s ease-out infinite;left:48%;top:28%;animation-delay:1.2s;}

// .lg-morph-orb{
//   position:absolute;width:140px;height:140px;border-radius:60% 40% 30% 70%;background:rgba(255,255,255,.04);
//   border:1px solid rgba(255,255,255,.12);z-index:1;pointer-events:none;animation:lg-morph-orb 6s ease-in-out infinite;
//   box-shadow:0 0 40px rgba(255,255,255,.08);
// }
// .lg-morph-orb-1{bottom:15%;left:8%;animation-delay:0s;}
// .lg-morph-orb-2{top:10%;right:12%;animation-delay:2s;}
// .lg-err{
//   background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:12px;
//   padding:12px 16px;margin-bottom:20px;
//   font-size:11px;color:#ffffff;letter-spacing:.5px;
// }
// .lg-label{font-size:9px;font-weight:700;letter-spacing:2px;color:#ffffff;margin-bottom:10px;text-transform:uppercase;animation:lg-in .6s ease both;}\n.lg-label:nth-of-type(1){animation-delay:.35s;}\n.lg-label:nth-of-type(2){animation-delay:.45s;}
// .lg-field-wrap{
//   background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);
//   border-radius:12px;padding:14px 18px;margin-bottom:20px;
//   transition:all .3s ease;backdrop-filter:blur(12px);
// }
// .lg-field-wrap:focus-within{border-color:var(--accent);box-shadow:0 0 8px rgba(255,255,255,.18),0 0 18px rgba(255,255,255,.18);}
// .lg-field-static{font-size:12px;color:#ffffff;font-family:'JetBrains Mono',monospace;animation:lg-in .6s ease both;animation-delay:.4s;}
// .lg-field-hint{font-size:9px;color:#ffffff;margin-top:4px;opacity:.7;animation:lg-in .6s ease both;animation-delay:.41s;}
// .lg-input{
//   width:100%;background:transparent;border:none;outline:none;
//   font-family:'JetBrains Mono',monospace;font-size:13px;
//   color:#ffffff;letter-spacing:2px;
//   animation:lg-in .6s ease both;animation-delay:.5s;
// }
// .lg-input::placeholder{color:#ffffff;opacity:.4;}
// .lg-btn{
//   width:100%;padding:16px;
//   font-family:'Bebas Neue',sans-serif;font-size:13px;font-weight:900;
//   letter-spacing:2.5px;background:#ffffff;border:1px solid rgba(255,255,255,.18);
//   border-radius:100px;color:#000;cursor:pointer;
//   transition:all .3s ease;text-transform:uppercase;
//   box-shadow:0 0 12px rgba(255,255,255,.12),0 8px 24px rgba(0,0,0,.32);
//   animation:lg-in .7s ease both;animation-delay:.55s;
// }
// .lg-btn:hover:not(:disabled){transform:scale(1.04);box-shadow:0 0 16px rgba(255,255,255,.2),0 0 24px rgba(255,255,255,.14),0 12px 36px rgba(0,0,0,.42);filter:brightness(1.04);}
// .lg-btn:disabled{opacity:.65;cursor:not-allowed;transform:none;box-shadow:none;}
// .lg-status{
//   margin-top:20px;display:flex;align-items:center;
//   justify-content:center;gap:8px;
//   animation:lg-in .6s ease both;animation-delay:.6s;
// }
// .lg-dot{width:5px;height:5px;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.4);}
// .lg-status-text{font-size:9px;color:var(--text-dim);letter-spacing:1px;}

// /* ── GHOST TERMINAL ── */
// @keyframes gt-fadein{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
// @keyframes gt-pulse{0%,100%{opacity:1}50%{opacity:.3}}
// @keyframes gt-blink{0%,100%{opacity:1}50%{opacity:0}}

// .gt-cursor{animation:gt-blink .9s step-end infinite;color:var(--text);}
// .gt-line{animation:gt-fadein .18s ease both;}

// /* ── HERO ── */
// @keyframes hero-in{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
// @keyframes hero-badge-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
// @keyframes diamond-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
// @keyframes hero-float-text{0%,100%{transform:translate3d(0,-50%,0)}50%{transform:translate3d(0,calc(-50% - 8px),0)}}
// @keyframes hero-typing{from{width:0}to{width:100%}}
// @keyframes hero-grid-drift{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(-14px,-10px,0)}100%{transform:translate3d(0,0,0)}}
// @keyframes hero-glow-shift{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(18px,-12px,0) scale(1.06)}100%{transform:translate3d(0,0,0) scale(1)}}
// @keyframes hero-scan-sweep{0%{transform:translate3d(-8%, -120%, 0) rotate(8deg)}100%{transform:translate3d(18%, 140%, 0) rotate(8deg)}}
// @keyframes hero-noise-pulse{0%,100%{opacity:.18}50%{opacity:.3}}
// @keyframes hero-star-drift{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(-10px,8px,0)}100%{transform:translate3d(0,0,0)}}
// @keyframes hero-twinkle{0%,100%{opacity:.35}50%{opacity:.8}}
// @keyframes hero-wire-float{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}50%{transform:translate3d(6px,-8px,0) rotate(2deg)}}
// @keyframes hero-right-pulse{0%,100%{opacity:.18}50%{opacity:.32}}
// @keyframes hero-right-glow{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
// @keyframes live-bubble-float-1{0%{transform:translate3d(0,100vh,0) scale(0)}25%{transform:translate3d(45px,50vh,0) scale(1)}50%{transform:translate3d(90px,0,0) scale(.8)}75%{transform:translate3d(-30px,-40vh,0) scale(.6)}100%{transform:translate3d(0,-100vh,0) scale(0)}}
// @keyframes live-bubble-float-2{0%{transform:translate3d(-80px,100vh,0) scale(0)}25%{transform:translate3d(-20px,45vh,0) scale(.9)}50%{transform:translate3d(60px,10vh,0) scale(1)}75%{transform:translate3d(100px,-50vh,0) scale(.7)}100%{transform:translate3d(150px,-100vh,0) scale(0)}}
// @keyframes live-bubble-float-3{0%{transform:translate3d(150px,100vh,0) scale(0)}25%{transform:translate3d(80px,50vh,0) scale(.85)}50%{transform:translate3d(-40px,5vh,0) scale(.95)}75%{transform:translate3d(-120px,-35vh,0) scale(.65)}100%{transform:translate3d(-180px,-100vh,0) scale(0)}}
// @keyframes live-bubble-float-4{0%{transform:translate3d(60px,100vh,0) scale(0)}25%{transform:translate3d(120px,55vh,0) scale(.8)}50%{transform:translate3d(40px,15vh,0) scale(1)}75%{transform:translate3d(-80px,-45vh,0) scale(.7)}100%{transform:translate3d(-120px,-100vh,0) scale(0)}}
// @keyframes live-bubble-float-5{0%{transform:translate3d(-120px,100vh,0) scale(0)}25%{transform:translate3d(-40px,40vh,0) scale(.9)}50%{transform:translate3d(100px,8vh,0) scale(.98)}75%{transform:translate3d(160px,-48vh,0) scale(.6)}100%{transform:translate3d(200px,-100vh,0) scale(0)}}
// @keyframes live-bubble-pulse{0%,100%{opacity:.15}50%{opacity:.35}}
// @keyframes rotate-ring-1{from{transform:rotate(0deg) scale(1)}to{transform:rotate(360deg) scale(1.05)}}
// @keyframes rotate-ring-2{from{transform:rotate(360deg) scale(.9)}to{transform:rotate(0deg) scale(.95)}}
// @keyframes rotate-smooth{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
// @keyframes glow-pulse-1{0%,100%{opacity:.2;filter:drop-shadow(0 0 12px rgba(255,255,255,.4))}50%{opacity:.6;filter:drop-shadow(0 0 32px rgba(255,255,255,.8))}}
// @keyframes glow-pulse-2{0%,100%{opacity:.15;filter:drop-shadow(0 0 8px rgba(255,255,255,.3))}50%{opacity:.55;filter:drop-shadow(0 0 28px rgba(255,255,255,.7))}}
// @keyframes glow-pulse-big{0%,100%{box-shadow:0 0 50px rgba(255,255,255,.4), 0 0 110px rgba(0,0,0,.75), inset 0 0 70px rgba(0,0,0,.55)}50%{box-shadow:0 0 65px rgba(255,255,255,.55), 0 0 130px rgba(0,0,0,.8), inset 0 0 85px rgba(0,0,0,.6)}}
// @keyframes morph-orb{0%{border-radius:50% 50% 50% 50%;transform:scale(1) rotate(0deg)}25%{border-radius:45% 55% 48% 52%;transform:scale(1.08) rotate(90deg)}50%{border-radius:50% 50% 50% 50%;transform:scale(1) rotate(180deg)}75%{border-radius:52% 48% 55% 45%;transform:scale(1.08) rotate(270deg)}100%{border-radius:50% 50% 50% 50%;transform:scale(1) rotate(360deg)}}


// .wx-hero{
//   min-height:100vh;display:flex;flex-direction:column;
//   align-items:flex-start;justify-content:center;
//   padding:80px 100px;
//   background:#000;
//   position:relative;overflow:hidden;
// }
// .wx-hero .hero-screen-fx{
//   position:absolute;
//   inset:0;
//   pointer-events:none;
//   z-index:0;
// }
// .wx-hero .hero-starfield{
//   position:absolute;
//   inset:0;
//   pointer-events:none;
//   z-index:0;
//   overflow:hidden;
// }
// .live-particle-burst{
//   position:absolute;
//   inset:0;
//   pointer-events:none;
//   z-index:0;
//   overflow:hidden;
// }
// .live-particle{
//   position:absolute;
//   width:4px;
//   height:4px;
//   border-radius:50%;
//   background:rgba(255,255,255,.7);
//   left:50%;
//   bottom:0;
//   box-shadow:0 0 6px rgba(255,255,255,.4);
//   animation:live-bubble-pulse 8s ease-in-out infinite;
// }
// .live-particle:nth-child(1){
//   animation:live-bubble-float-1 8s ease-in cubic-bezier(.25,.25,.75,.75) infinite;
//   animation-delay:0s;
// }
// .live-particle:nth-child(2){
//   animation:live-bubble-float-2 9s ease-in cubic-bezier(.25,.25,.75,.75) infinite;
//   animation-delay:1s;
//   width:5px;
//   height:5px;
// }
// .live-particle:nth-child(3){
//   animation:live-bubble-float-3 10s ease-in cubic-bezier(.25,.25,.75,.75) infinite;
//   animation-delay:2s;
//   width:3.5px;
//   height:3.5px;
// }
// .live-particle:nth-child(4){
//   animation:live-bubble-float-4 8.5s ease-in cubic-bezier(.25,.25,.75,.75) infinite;
//   animation-delay:.5s;
//   width:4.5px;
//   height:4.5px;
// }
// .live-particle:nth-child(5){
//   animation:live-bubble-float-5 9.5s ease-in cubic-bezier(.25,.25,.75,.75) infinite;
//   animation-delay:1.5s;
//   width:3.8px;
//   height:3.8px;
// }

// .glow-rings-container{
//   position:absolute;
//   width:100%;
//   height:100%;
//   inset:0;
//   pointer-events:none;
//   z-index:0;
// }

// .glow-ring{
//   position:absolute;
//   border:1px solid rgba(255,255,255,.3);
//   border-radius:50%;
//   left:50%;
//   top:50%;
//   transform-origin:center;
//   box-shadow:0 0 20px rgba(255,255,255,.2);
// }

// .glow-ring-1{
//   width:240px;
//   height:240px;
//   margin-left:-120px;
//   margin-top:-120px;
//   animation:rotate-ring-1 12s linear infinite, glow-pulse-1 6s ease-in-out infinite;
// }

// .glow-ring-2{
//   width:360px;
//   height:360px;
//   margin-left:-180px;
//   margin-top:-180px;
//   animation:rotate-ring-2 16s linear infinite, glow-pulse-2 7s ease-in-out infinite;
//   animation-delay:1s;
//   border-color:rgba(255,255,255,.2);
// }

// .glow-ring-3{
//   width:480px;
//   height:480px;
//   margin-left:-240px;
//   margin-top:-240px;
//   animation:rotate-smooth 20s linear infinite reverse;
//   border-color:#ffffff;
//   border-width:2px;
//   opacity:1;
//   box-shadow:0 0 50px rgba(255,255,255,.45), 0 0 110px rgba(0,0,0,.75), inset 0 0 70px rgba(0,0,0,.55);
// }

// .glow-orb{
//   position:absolute;
//   border-radius:50%;
//   width:80px;
//   height:80px;
//   background:radial-gradient(circle at 35% 35%, rgba(255,255,255,.3), rgba(255,255,255,.05));
//   box-shadow:0 0 48px rgba(255,255,255,.25), inset -8px -8px 24px rgba(0,0,0,.4);
//   animation:morph-orb 8s ease-in-out infinite;
// }

// .glow-orb-1{
//   right:18%;
//   top:24%;
//   width:100px;
//   height:100px;
//   animation:morph-orb 9s ease-in-out infinite, glow-pulse-1 5s ease-in-out infinite;
// }

// .glow-orb-2{
//   left:12%;
//   bottom:20%;
//   width:70px;
//   height:70px;
//   animation:morph-orb 11s ease-in-out infinite reverse, glow-pulse-2 6s ease-in-out infinite;
//   animation-delay:2s;
// }

// .wx-hero .hero-starfield::before,
// .wx-hero .hero-starfield::after{
//   content:'';
//   position:absolute;
//   inset:-8%;
//   background-image:
//     radial-gradient(circle at 8% 12%, rgba(255,255,255,.85) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 14% 34%, rgba(255,255,255,.4) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 22% 58%, rgba(255,255,255,.65) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 28% 18%, rgba(255,255,255,.32) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 36% 72%, rgba(255,255,255,.55) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 44% 26%, rgba(255,255,255,.38) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 52% 48%, rgba(255,255,255,.62) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 58% 14%, rgba(255,255,255,.28) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 66% 66%, rgba(255,255,255,.48) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 74% 24%, rgba(255,255,255,.42) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 82% 54%, rgba(255,255,255,.7) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 90% 18%, rgba(255,255,255,.35) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 12% 84%, rgba(255,255,255,.55) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 24% 92%, rgba(255,255,255,.32) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 68% 88%, rgba(255,255,255,.42) 0 1px, transparent 1.5px),
//     radial-gradient(circle at 88% 76%, rgba(255,255,255,.52) 0 1px, transparent 1.5px);
//   opacity:.58;
//   animation:hero-star-drift 22s linear infinite;
// }
// .wx-hero .hero-starfield::after{
//   transform:scale(1.08);
//   opacity:.36;
//   filter:blur(.3px);
//   animation-duration:30s;
//   animation-direction:reverse;
// }
// .hero-constellation{
//   position:absolute;
//   width:260px;
//   height:220px;
//   pointer-events:none;
//   opacity:.62;
//   animation:hero-wire-float 14s ease-in-out infinite;
//   z-index:1;
// }
// .hero-constellation svg{
//   width:100%;
//   height:100%;
//   overflow:visible;
// }
// .hero-constellation polygon,
// .hero-constellation line{
//   stroke:rgba(255,255,255,.22);
//   stroke-width:1;
//   fill:none;
// }
// .hero-constellation circle{
//   fill:rgba(255,255,255,.28);
// }
// .hero-constellation-a{
//   left:4%;
//   bottom:2%;
// }
// .hero-constellation-b{
//   right:4%;
//   top:1%;
//   width:220px;
//   height:180px;
//   animation-duration:17s;
//   animation-direction:reverse;
// }
// .hero-constellation-a line:first-child,
// .hero-constellation-b line:first-child{
//   stroke:rgba(255,255,255,.16);
// }
// .wx-hero .hero-screen-fx::before{
//   content:'';
//   position:absolute;
//   inset:-30% -10%;
//   background:
//     repeating-linear-gradient(
//       to bottom,
//       rgba(255,255,255,.02) 0px,
//       rgba(255,255,255,.02) 1px,
//       transparent 1px,
//       transparent 5px
//     );
//   opacity:.04;
//   mix-blend-mode:screen;
//   animation:hero-noise-pulse 4.2s ease-in-out infinite;
// }
// .wx-hero .hero-screen-fx::after{
//   content:'';
//   position:absolute;
//   top:-35%;
//   left:-20%;
//   width:42%;
//   height:170%;
//   background:linear-gradient(180deg, transparent 0%, rgba(255,255,255,.02) 30%, rgba(255,255,255,.045) 48%, rgba(255,255,255,.02) 66%, transparent 100%);
//   filter:blur(12px);
//   opacity:.22;
//   animation:hero-scan-sweep 9s linear infinite;
//   mix-blend-mode:screen;
// }
// .wx-hero::before{
//   content:'';
//   position:absolute;inset:0;pointer-events:none;
//   background-image:
//     linear-gradient(rgba(255,255,255,.01) 1px, transparent 1px),
//     linear-gradient(90deg, rgba(255,255,255,.01) 1px, transparent 1px);
//   background-size:64px 64px;
//   opacity:.05;
//   mask-image:radial-gradient(circle at center, black 42%, transparent 92%);
//   animation:hero-grid-drift 18s ease-in-out infinite;
//   z-index:0;
// }
// .wx-hero::after{
//   content:'';
//   position:absolute;
//   inset:-12%;
//   pointer-events:none;
//   background:
//     radial-gradient(circle at 15% 22%, rgba(255,255,255,.09), transparent 16%),
//     radial-gradient(circle at 72% 18%, rgba(255,255,255,.06), transparent 14%),
//     radial-gradient(circle at 45% 76%, rgba(255,255,255,.05), transparent 18%);
//   filter:blur(12px);
//   opacity:.18;
//   animation:hero-glow-shift 14s ease-in-out infinite;
//   z-index:0;
// }
// .hero-bg-right{
//   position:absolute;right:0;top:0;bottom:0;width:58%;
//   background:rgba(0,0,0,.95);
//   border-left:1px solid rgba(255,255,255,.06);
//   backdrop-filter:blur(12px);
//   z-index:0;
//   animation:hero-right-pulse 10s ease-in-out infinite;
//   box-shadow:inset 0 0 60px rgba(255,255,255,.02);
// }
// .hero-bg-right::before{
//   content:'';
//   position:absolute;
//   inset:20% 14%;
//   background:linear-gradient(90deg, transparent 0%, rgba(255,255,255,.06) 45%, rgba(255,255,255,.12) 50%, rgba(255,255,255,.06) 55%, transparent 100%);
//   transform:skewX(-12deg);
//   opacity:.28;
//   animation:hero-right-glow 8s linear infinite;
//   pointer-events:none;
// }
// .hero-bg-diamond{
//   display:none;
//   position:absolute;right:10%;top:50%;transform:translateY(-50%) rotate(45deg);
//   width:500px;height:500px;border:1px solid rgba(255,255,255,.08);
//   pointer-events:none;
//   animation:diamond-spin 34s linear infinite;
//   z-index:0;
// }
// .hero-bg-diamond::before{content:'';position:absolute;inset:60px;border:1px solid rgba(255,255,255,.05);}
// .hero-bg-diamond::after{content:'';position:absolute;inset:120px;border:1px solid rgba(255,255,255,.04);}
// .hero-badge{
//   display:inline-flex;align-items:center;gap:10px;
//   border:1px solid rgba(255,255,255,.1);border-radius:100px;padding:8px 18px;
//   margin-bottom:28px;font-size:10px;font-weight:600;color:var(--text-soft);
//   animation:hero-badge-in .6s ease both;letter-spacing:1px;
//   background:rgba(255,255,255,.04);backdrop-filter:blur(12px);
// }
// .hero-badge-dot{width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.45);}
// .hero-title{
//   font-family:'Bebas Neue',sans-serif;
//   font-size:clamp(60px,10vw,118px);
//   letter-spacing:7px;color:#e2e8f0;line-height:.9;
//   margin-bottom:22px;
//   animation:hero-in .8s ease both;animation-delay:.1s;
//   font-weight:800;
//   text-shadow:0 0 30px rgba(255,255,255,.14);
//   position:relative;
//   z-index:1;
// }
// .hero-title::before{
//   content:'WHITENX';
//   position:absolute;
//   left:-8px;
//   top:50%;
//   font-size:clamp(80px,15vw,180px);
//   letter-spacing:12px;
//   color:rgba(255,255,255,.02);
//   filter:blur(16px);
//   white-space:nowrap;
//   z-index:-1;
//   animation:hero-float-text 10s ease-in-out infinite;
//   display:none;
// }
// .hero-desc{
//   font-size:16px;color:#f8fafc;line-height:1.95;max-width:640px;
//   margin-bottom:44px;
//   animation:hero-in .8s ease both;animation-delay:.2s;
// }
// .hero-status-row{
//   display:flex;align-items:center;gap:12px;flex-wrap:wrap;
//   margin:-10px 0 24px;
//   animation:hero-in .8s ease both;animation-delay:.25s;
// }
// .hero-status-chip{
//   display:inline-flex;align-items:center;gap:8px;
//   padding:8px 15px;border-radius:999px;
//   border:1px solid rgba(255,255,255,.12);
//   background:rgba(255,255,255,.06);
//   color:rgba(255,255,255,.85);
//   font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;
//   backdrop-filter:blur(10px);
// }
// .hero-status-chip.live{
//   border-color:rgba(255,255,255,.2);
//   box-shadow:0 0 12px rgba(255,255,255,.12);
// }
// .hero-status-dot{
//   width:6px;height:6px;border-radius:50%;
//   background:#fff;
//   box-shadow:0 0 10px rgba(255,255,255,.3);
//   animation:gt-pulse 1.6s ease-in-out infinite;
// }
// .hero-typing{
//   display:inline-flex;align-items:center;
//   max-width:100%;
//   overflow:hidden;white-space:nowrap;
//   font-family:'JetBrains Mono',monospace;
//   font-size:11px;letter-spacing:1.4px;
//   color:rgba(226,232,240,.72);
// }
// .hero-typing span{
//   display:inline-block;
//   overflow:hidden;white-space:nowrap;
//   border-right:1px solid rgba(255,255,255,.5);
//   width:0;
//   animation:hero-typing 3.6s steps(38,end) .5s forwards, gt-blink .9s step-end infinite;
// }
// .hero-features{
//   display:flex;gap:8px;flex-wrap:wrap;margin-bottom:48px;
//   animation:hero-in .8s ease both;animation-delay:.3s;
// }
// .hero-feature{
//   font-size:10px;font-weight:700;letter-spacing:1.7px;color:#fff;
//   border:1px solid rgba(255,255,255,.12);padding:8px 16px;border-radius:100px;
//   text-transform:uppercase;background:rgba(255,255,255,.03);backdrop-filter:blur(10px);transition:all .3s ease;
// }
// .hero-feature:hover{color:#fff;border-color:rgba(255,255,255,.24);box-shadow:0 0 10px rgba(255,255,255,.1),0 0 14px rgba(255,255,255,.08);transform:translateY(-1px);}
// .hero-input-row{
//   position:relative;
//   display:grid;grid-template-columns:1fr auto;align-items:center;gap:20px;
//   width:100%;max-width:none;
//   padding:24px 28px;justify-content:space-between;
//   background:rgba(18,18,20,.94);border:1px solid rgba(255,255,255,.12);
//   border-radius:999px;backdrop-filter:blur(34px);box-shadow:0 24px 72px rgba(0,0,0,.45);
//   animation:hero-in .8s ease both;animation-delay:.4s;
//   overflow:hidden;
// }
// .hero-input-row::before{
//   content:'';
//   position:absolute;inset:0;
//   background:radial-gradient(circle at 20% 50%, rgba(255,255,255,.08), transparent 30%);
//   opacity:.4;
//   pointer-events:none;
// }
// .hero-input-row::after{
//   content:'';
//   position:absolute;left:-40%;top:0;bottom:0;width:120%;
//   background:linear-gradient(90deg, transparent 0%, rgba(255,255,255,.12) 25%, rgba(255,255,255,.24) 50%, rgba(255,255,255,.12) 75%, transparent 100%);
//   transform:skewX(-18deg);
//   opacity:.32;
//   animation:search-glow 5.5s linear infinite;
//   pointer-events:none;
// }
// @keyframes search-glow{0%{transform:translateX(-100%) skewX(-18deg);}100%{transform:translateX(100%) skewX(-18deg);}}
// .wx-input{
//   width:100%;min-width:0;font-family:'JetBrains Mono',monospace;font-size:16px;
//   padding:20px 24px;background:#090909;
//   border:1px solid rgba(255,255,255,.14);border-radius:14px;
//   color:#fff;outline:none;transition:border-color .2s,background .2s,transform .2s;
// }
// .wx-input:focus{border-color:rgba(255,255,255,.5);box-shadow:0 0 24px rgba(255,255,255,.12);background:#0b0b0b;transform:scale(1.001);}
// .wx-input::placeholder{color:rgba(255,255,255,.42);}
// .wx-scan-btn{
//   font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:800;
//   letter-spacing:1.8px;padding:20px 42px;border-radius:999px;
//   border:1px solid rgba(255,255,255,.18);background:#ffffff;
//   color:#000;cursor:pointer;transition:all .2s,transform .2s;white-space:nowrap;
// }
// .wx-scan-btn:hover{background:#f2f2f2;color:#000;transform:translateY(-1px);}
// .hero-warn{
//   display:flex;align-items:center;gap:8px;margin-top:16px;
//   font-size:10px;color:rgba(255,255,255,.68);
//   animation:hero-in .8s ease both;animation-delay:.5s;
// }
// .hero-warn-dot{width:5px;height:5px;border-radius:50%;background:#fff;flex-shrink:0;box-shadow:0 0 10px rgba(255,255,255,.18);}
// .hero-terminal{
//   margin-top:18px;
//   width:100%;max-width:540px;
//   border:1px solid rgba(255,255,255,.08);
//   border-radius:16px;
//   background:rgba(255,255,255,.02);
//   backdrop-filter:blur(12px);
//   box-shadow:0 8px 24px rgba(0,0,0,.32);
//   overflow:hidden;
//   animation:hero-in .8s ease both;animation-delay:.56s;
// }
// .hero-terminal-top{
//   display:flex;align-items:center;justify-content:space-between;
//   padding:10px 14px;
//   border-bottom:1px solid rgba(255,255,255,.06);
//   background:rgba(255,255,255,.03);
// }
// .hero-terminal-title{
//   font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;
//   color:var(--text-dim);
// }
// .hero-terminal-state{
//   font-size:9px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;
//   color:var(--text);
//   text-shadow:0 0 10px rgba(255,255,255,.12);
// }
// .hero-terminal-body{
//   padding:12px 14px;
//   display:flex;flex-direction:column;gap:8px;
// }
// .hero-log{
//   display:flex;gap:10px;align-items:flex-start;
//   font-family:'JetBrains Mono',monospace;
//   font-size:11px;line-height:1.75;
//   color:rgba(255,255,255,.74);
// }
// .hero-log-tag{
//   color:var(--text);
//   min-width:36px;
//   font-weight:700;
// }
// .hero-log-text{
//   color:rgba(255,255,255,.62);
// }
// .hero-feature-card{
//   background:#0a0a0a;
//   border:1px solid rgba(255,255,255,.08);
//   border-radius:16px;
//   padding:20px;
//   transition:all .3s ease;
//   box-shadow:0 8px 24px rgba(0,0,0,.24);
//   position:relative;
//   overflow:hidden;
// }
// .hero-feature-card::before{
//   content:'';
//   position:absolute;
//   inset:0;
//   background:linear-gradient(135deg, rgba(255,255,255,.05), transparent 35%);
//   opacity:0;
//   transition:opacity .3s ease;
//   pointer-events:none;
// }
// .hero-feature-card:hover{
//   border-color:rgba(255,255,255,.16);
//   transform:translateY(-4px);
//   box-shadow:0 16px 36px rgba(0,0,0,.38),0 0 18px rgba(255,255,255,.08);
// }
// .hero-feature-card:hover::before{
//   opacity:1;
// }
// .wx-err{
//   font-size:11px;color:#fecaca;background:rgba(239,68,68,.12);
//   border:1px solid rgba(239,68,68,.28);border-radius:12px;
//   padding:12px 18px;margin-bottom:16px;width:100%;max-width:540px;
//   box-shadow:var(--shadow);
// }

// /* ── REPORT HEADER ── */
// .wx-rpt-hdr{
//   display:flex;align-items:center;justify-content:space-between;
//   padding:0 0 20px;border-bottom:1px solid rgba(255,255,255,.08);
//   margin-bottom:24px;flex-wrap:wrap;gap:12px;
// }
// .wx-rpt-title{
//   font-family:'Bebas Neue',sans-serif;font-size:clamp(24px,3vw,38px);
//   letter-spacing:5.5px;color:var(--text);text-shadow:0 0 12px rgba(255,255,255,.1);
// }
// .wx-rpt-meta{font-size:11px;color:var(--text-dim);margin-top:6px;line-height:1.8;}

// /* ── GRIDS ── */
// .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
// .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
// .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
// @media(max-width:900px){
//   .g2,.g3,.g4{grid-template-columns:1fr 1fr;}
//   .wx-hero{padding:60px 24px;}
//   .hero-bg-right,.hero-bg-diamond{display:none;}
// }
// @media(max-width:600px){
//   .g2,.g3,.g4{grid-template-columns:1fr;}
//   .wx-body{padding:16px;}
//   .wx-nav{padding:0 16px;}
//   .hero-input-row{flex-direction:column;}
//   .wx-scan-btn{width:100%;}
//   .hero-title::before{display:none;}
//   .hero-status-row{margin:0 0 20px;}
//   .hero-typing{font-size:10px;max-width:100%;}
//   .hero-terminal{max-width:100%;}
// }

// /* ── MISC ── */
// .mono{font-family:'JetBrains Mono',monospace;}
// .dim{color:var(--text-dim);}
// .accent{color:var(--text);}

// /* ── DASHBOARD ANIM ── */
// @keyframes db-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
// .wx-card{animation:db-in .4s ease both;}

// /* ── SECTION DIVIDER ── */
// .wx-section-label{
//   font-size:9px;font-weight:700;letter-spacing:3px;
//   color:var(--text-dim);text-transform:uppercase;
//   display:flex;align-items:center;gap:16px;
//   margin-bottom:16px;
// }
// .wx-section-label::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.08);}
//   `;
//   document.head.appendChild(s);
// };

// // ════════════════════════════════════════════════════════════
// // TICKER
// // ════════════════════════════════════════════════════════════
// const Ticker = () => (
//   <div className="ticker-wrap">
//     <div className="ticker-inner">
//       {['WHITENX VAPT PLATFORM','//','RECONNAISSANCE','//','PORT SCANNING','//','CVE DETECTION','//','OSINT INTELLIGENCE','//','SSL ANALYSIS','//','RISK SCORING','//','VULNERABILITY ASSESSMENT','//','PENETRATION TESTING','//'].map((t,i)=>(
//         <span key={i}>{t}</span>
//       ))}
//       {['WHITENX VAPT PLATFORM','//','RECONNAISSANCE','//','PORT SCANNING','//','CVE DETECTION','//','OSINT INTELLIGENCE','//','SSL ANALYSIS','//','RISK SCORING','//','VULNERABILITY ASSESSMENT','//','PENETRATION TESTING','//'].map((t,i)=>(
//         <span key={`b${i}`}>{t}</span>
//       ))}
//     </div>
//   </div>
// );

// // ════════════════════════════════════════════════════════════
// // LEGAL PAGE
// // ════════════════════════════════════════════════════════════
// const LegalPage = ({ onAccept }) => {
//   const items = [
//     <>You have <strong>explicit written authorization</strong> from the target system owner prior to initiating any scan.</>,
//     <>You will <strong>NEVER</strong> use this platform against any system without valid legal authorization.</>,
//     <>All actions, IPs, timestamps, and session data are <strong>permanently logged and auditable</strong> by law enforcement.</>,
//     <>You accept <strong>full criminal, civil, and financial liability</strong> for any misuse or unauthorized access.</>,
//     <>You will <strong>immediately cease all activity</strong> and self-report upon discovery of unauthorized access.</>,
//     <>You are of <strong>legal age (18+)</strong>, legally competent, and acting within a legitimate engagement.</>,
//   ];
//   const laws = [
//     { region: 'INDIA', text: 'IT Act 2000 — §43, 66, 66F, 67, 69, 70, 72' },
//     { region: 'INDIA', text: 'Bharatiya Nyaya Sanhita 2023 — Cybercrime' },
//     { region: 'INDIA', text: 'IPC / BNS — Conspiracy, Fraud, Stalking' },
//     { region: 'USA', text: 'CFAA — 18 U.S.C. § 1030 (up to 20 years)' },
//     { region: 'EU', text: 'GDPR — Up to €20M or 4% annual turnover' },
//     { region: 'INTL', text: 'Budapest Convention — 67+ nations' },
//   ];

//   return (
//     <div className="lp-wrap">
//       <Ticker />
//       <div className="lp-bg-diamond" />
//       <div className="lp-bg-shapes">
//         <div className="lp-shape-ring lp-shape-ring-1" />
//         <div className="lp-shape-ring lp-shape-ring-2" />
//         <div className="lp-shape-orb" />
//         <div className="lp-big-circle" />
//       </div>
//       <div className="lp-container" style={{marginTop: 48}}>
//         <div className="lp-badge-top">
//           <span className="lp-badge-dot" />
//           RESTRICTED ACCESS — AUTHORIZED PERSONNEL ONLY
//         </div>

//         <div className="lp-title">LEGAL<br/>DISCLAIMER</div>
//         <div className="lp-subtitle">READ CAREFULLY BEFORE PROCEEDING — ALL ACTIVITY IS MONITORED</div>

//         <div className="lp-box">
//           <div className="lp-box-hdr">Mandatory Declaration</div>
//           <div className="lp-box-body">
//             <div style={{fontSize:11,color:'rgba(255,255,255,.72)',marginBottom:20,letterSpacing:'.3px'}}>
//               By proceeding, you solemnly declare under penalty of perjury that:
//             </div>
//             {items.map((item, i) => (
//               <div key={i} className="lp-item" style={{animationDelay: `${0.25 + i * 0.05}s`}}>
//                 <div className="lp-item-num">{i+1}</div>
//                 <div className="lp-item-text">{item}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="lp-box" style={{marginBottom:24}}>
//           <div className="lp-box-hdr">Applicable Laws — Zero Tolerance</div>
//           <div className="lp-box-body">
//             <div className="lp-laws-grid">
//               {laws.map((l, i) => (
//                 <div key={i} className="lp-law" style={{animation:`lp-item-fade .6s ease-out both`, animationDelay:`${0.35 + i * 0.05}s`}}>
//                   <div className="lp-law-region">{l.region}</div>
//                   <div className="lp-law-text">{l.text}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div style={{
//           background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:12,backdropFilter:'blur(12px)',boxShadow:'0 8px 32px rgba(0,0,0,.4)',
//           padding:'16px 20px',marginBottom:24,
//           display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',
//           animation:'lp-box-slide .6s ease-out both',animationDelay:'.55s'
//         }}>
//           {[{label:'Sessions Monitored',val:'LIVE'},{label:'Jurisdiction',val:'67+ Nations'},{label:'Prosecution Rate',val:'94.2%'}].map((s,i)=>(
//             <div key={i} style={{flex:1,minWidth:120,textAlign:'center'}}>
//               <div style={{fontSize:7,color:'rgba(255,255,255,.6)',letterSpacing:'2px',marginBottom:4,textTransform:'uppercase'}}>{s.label}</div>
//               <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:'#fff',letterSpacing:2}}>{s.val}</div>
//             </div>
//           ))}
//         </div>

//         <button className="lp-accept-btn" onClick={onAccept}>
//           I Accept — I Am Authorized & Assume Full Legal Liability
//         </button>
//         <div className="lp-footer-text">
//           SESSION LOGGED &nbsp;·&nbsp; IP RECORDED &nbsp;·&nbsp; {new Date().toISOString()}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ════════════════════════════════════════════════════════════
// // LOGIN PAGE
// // ════════════════════════════════════════════════════════════
// const LoginPage = ({ onLogin }) => {
//   const [key, setKey]   = useState('');
//   const [auth, setAuth] = useState(false);
//   const [err,  setErr]  = useState('');
//   const [attempts, setAttempts] = useState(0);
//   const [locked, setLocked] = useState(false);
//   const [lockTimer, setLockTimer] = useState(0);

//   useEffect(() => {
//     if (!locked) return;
//     let t = 30;
//     setLockTimer(t);
//     const iv = setInterval(() => {
//       t--; setLockTimer(t);
//       if (t <= 0) { clearInterval(iv); setLocked(false); setAttempts(0); }
//     }, 1000);
//     return () => clearInterval(iv);
//   }, [locked]);

//   const submit = async e => {
//     e.preventDefault();
//     if (locked) return;
//     setErr(''); setAuth(true);
//     await new Promise(r => setTimeout(r, 900));
//     const normalized = key.trim().toUpperCase();
//     if (normalized !== ACCESS_KEY) {
//       const newAtt = attempts + 1;
//       setAttempts(newAtt);
//       setAuth(false);
//       if (newAtt >= 3) {
//         setLocked(true);
//         setErr('Too many failed attempts — access locked for 30s');
//       } else {
//         setErr(`Invalid access key — ${3 - newAtt} attempt${3-newAtt===1?'':'s'} remaining`);
//       }
//       return;
//     }
//     setAuth(false);
//     onLogin();
//   };

//   return (
//     <div className="lg-wrap">
//       <div className="lg-bg" />
//       <div className="lg-diamond" />
//       <div className="lg-red-circle" />
//       <div className="lg-particles-container">
//         <div className="lg-particle lg-particle-1" />
//         <div className="lg-particle lg-particle-2" />
//         <div className="lg-particle lg-particle-3" />
//         <div className="lg-particle lg-particle-4" />
//         <div className="lg-particle lg-particle-5" />
//       </div>
//       <div className="lg-morph-orb lg-morph-orb-1" />
//       <div className="lg-morph-orb lg-morph-orb-2" />
//       <div className="lg-card">
//         <div className="lg-card-top">
//           <div className="lg-logo">WHITENX</div>
//           <div className="lg-logo-sub">VULNERABILITY ASSESSMENT PLATFORM</div>
//           <div style={{display:'flex',gap:16,marginTop:20,flexWrap:'wrap',animation:'lg-in .6s ease both',animationDelay:'.3s'}}>
//             {['RECON','PORT SCAN','CVE MATCH','OSINT'].map((t,i)=>(
//               <span key={t} style={{fontSize:8,color:'#ffffff',letterSpacing:'1.5px',fontWeight:600,opacity:.8,transition:'opacity .3s'}}>{t}</span>
//             ))}
//           </div>
//         </div>

//         <div className="lg-card-body">
//           {err && <div className="lg-err">✗ {err}</div>}

//           {locked ? (
//             <div style={{textAlign:'center',padding:'32px 0'}}>
//               <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:64,color:'rgba(255,255,255,.18)',letterSpacing:4}}>{lockTimer}</div>
//               <div style={{fontSize:10,color:'rgba(255,255,255,.6)',letterSpacing:'2px',marginTop:8}}>ACCESS LOCKED — WAIT TO RETRY</div>
//             </div>
//           ) : (
//             <form onSubmit={submit}>
//               <div className="lg-label">System Identifier</div>
//               <div className="lg-field-wrap">
//                 <div className="lg-field-static">WHITENX-VAPT-CONSOLE</div>
//                 <div className="lg-field-hint">Authorized terminal — session logging active</div>
//               </div>

//               <div className="lg-label">Access Key</div>
//               <div className="lg-field-wrap">
//                 <input
//                   className="lg-input"
//                   type="password"
//                   value={key}
//                   onChange={e => setKey(e.target.value)}
//                   placeholder="WX-XXXX-XXXX-XXXX-XXXX"
//                   autoFocus required disabled={auth}
//                   autoComplete="off" spellCheck={false}
//                 />
//               </div>

//               <div style={{
//                 background:'rgba(255,255,255,.03)',border:'1px dashed rgba(255,255,255,.12)',
//                 borderRadius:12,padding:'12px 16px',marginBottom:24
//               }}>
//                 <div style={{fontSize:8,color:'rgba(255,255,255,.6)',letterSpacing:'2px',marginBottom:6,fontWeight:600}}>KEY FORMAT</div>
//                 <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:'rgba(255,255,255,.7)',letterSpacing:3}}>WX — XXXX — XXXX — XXXX — XXXX</div>
//               </div>

//               <button type="submit" className="lg-btn" disabled={auth}>
//                 {auth ? 'Verifying...' : 'Authenticate →'}
//               </button>
//             </form>
//           )}

//           <div className="lg-status">
//             <div className="lg-dot" />
//             <span className="lg-status-text">
//               {attempts > 0 ? `${attempts} failed attempt${attempts>1?'s':''}` : 'Intrusion detection active'}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ════════════════════════════════════════════════════════════
// // GHOST TERMINAL
// // ════════════════════════════════════════════════════════════
// const STAGES = [
//   {id:'recon', short:'RECON', full:'RECONNAISSANCE'},
//   {id:'ports', short:'PORTS', full:'PORT SCANNING'},
//   {id:'svcfp', short:'SVCFP', full:'SERVICE FINGERPRINT'},
//   {id:'vulns', short:'VULNS', full:'VULN DETECTION'},
//   {id:'osint', short:'OSINT', full:'OSINT INTELLIGENCE'},
//   {id:'ssl',   short:'SSL',   full:'SSL ANALYSIS'},
//   {id:'score', short:'SCORE', full:'RISK SCORING'},
// ];

// const GhostTerminal = ({ si, progress, target, apiDone, scanResult, onCancel }) => {
//   const [entries,   setEntries]  = useState([]);
//   const [counts,    setCounts]   = useState({crit:0,high:0,med:0,low:0});
//   const [openPorts, setPorts]    = useState([]);
//   const [elapsed,   setElapsed]  = useState(0);
//   const [disp,      setDisp]     = useState(0);
//   const [done,      setDone]     = useState(false);
//   const [csi,       setCSI]      = useState(si||0);

//   const endRef   = useRef(null);
//   const procRef  = useRef(false);
//   const phaseRef = useRef({});

//   const now = () => new Date().toLocaleTimeString('en-US',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});
//   const push = useCallback(e => setEntries(p=>[...p,{...e,time:now()}]),[]);
//   const line = useCallback((pfx,txt) => push({type:'line',pfx,txt}),[push]);
//   const cmd  = useCallback(txt => push({type:'cmd',txt}),[push]);
//   const sp   = useCallback(()   => push({type:'sp'}),[push]);

//   useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}); },[entries]);
//   useEffect(()=>{ const t=setInterval(()=>setElapsed(e=>e+1),1000); return()=>clearInterval(t); },[]);
//   useEffect(()=>{ setCSI(si); },[si]);
//   useEffect(()=>{
//     const tgt = apiDone ? progress : Math.min(progress,84);
//     setDisp(p => tgt>p ? tgt : p);
//   },[progress,apiDone]);

//   useEffect(()=>{
//     if(apiDone||phaseRef.current[si]) return;
//     phaseRef.current[si]=true;
//     const scripts=[
//       ()=>{ sp(); cmd(`whitenx --target ${target} --mode full`); setTimeout(()=>line('INF','Initializing scan engine v2.4.1'),300); setTimeout(()=>line('INF','CVE database loaded — 48,291 entries'),900); setTimeout(()=>line('OK','Engine ready. Full scan takes 5-6 min...'),1400); setTimeout(()=>{ sp(); cmd(`nmap -sV -sC -T4 ${target}`); },1800); setTimeout(()=>line('INF',`Resolving DNS: ${target}`),2400); setTimeout(()=>line('OK','Host is up — ICMP echo received'),3100); },
//       ()=>{ sp(); cmd(`nmap -p- --min-rate 5000 ${target}`); setTimeout(()=>line('INF','SYN scan — 65535 ports'),400); setTimeout(()=>line('INF','Probing common service ranges'),1500); },
//       ()=>{ sp(); cmd(`nmap -sV --version-intensity 9 ${target}`); setTimeout(()=>line('INF','Banner grabbing active'),1400); },
//       ()=>{ sp(); cmd(`whitenx --cve-match --target ${target}`); setTimeout(()=>line('INF','Querying NVD — matching versions'),400); setTimeout(()=>line('WRN','Potential matches found — verifying'),2500); },
//       ()=>{ sp(); cmd(`whitenx --osint ${target}`); setTimeout(()=>line('INF','WHOIS lookup initiated'),400); setTimeout(()=>line('INF','Certificate transparency — crt.sh'),1200); },
//       ()=>{ sp(); cmd(`whitenx --ssl-check ${target}`); setTimeout(()=>line('INF','TLS handshake initiated'),400); setTimeout(()=>line('INF','Cipher suite enumeration'),2000); },
//       ()=>{ sp(); cmd(`whitenx --risk-score ${target}`); setTimeout(()=>line('INF','Computing CVSS v3.1 base scores'),400); setTimeout(()=>line('INF','Finalizing risk report...'),2000); },
//     ];
//     scripts[si]?.();
//   },[si,apiDone]);

//   useEffect(()=>{
//     if(!apiDone||!scanResult||procRef.current) return;
//     procRef.current=true;
//     const r=scanResult;
//     const vulns = r.vulnerabilities||[];
//     const ports  = r.port_scan?.services||r.port_scan?.open_ports||[];
//     let delay=400;
//     const d=ms=>{ delay+=ms; return delay; };

//     push({type:'sep',time:now()});
//     cmd('# SCAN DATA — rendering results');

//     ports.forEach((p,i)=>setTimeout(()=>{
//       setPorts(prev=>[...prev,{port:p.port,svc:p.service||'unknown'}]);
//       line('OK',`PORT ${p.port}/tcp  OPEN  ${p.service||'unknown'}${p.version?` v${p.version}`:''}`);
//     }, d(0)+i*380));

//     vulns.forEach((v,i)=>{
//       const sev=(v.severity||'').toUpperCase();
//       setTimeout(()=>{
//         if(sev==='CRITICAL'){
//           setEntries(p=>[...p,{type:'crit',time:now(),id:v.type||'CRITICAL',port:v.port,rec:v.recommendation}]);
//           setCounts(c=>({...c,crit:c.crit+1}));
//         } else if(sev==='HIGH'){
//           setEntries(p=>[...p,{type:'high',time:now(),id:v.type||'HIGH',port:v.port,rec:v.recommendation}]);
//           setCounts(c=>({...c,high:c.high+1}));
//         } else if(sev==='MEDIUM'){
//           line('WRN',`[MED] ${v.type}  port ${v.port||'N/A'}`);
//           setCounts(c=>({...c,med:c.med+1}));
//         } else {
//           line('INF',`[LOW] ${v.type}  port ${v.port||'N/A'}`);
//           setCounts(c=>({...c,low:c.low+1}));
//         }
//       }, d(0)+i*600);
//     });

//     setTimeout(()=>{
//       sp(); line('OK','══════════ SCAN COMPLETE ══════════');
//       setDisp(100); setDone(true);
//     },d(2400));
//   },[apiDone,scanResult]);

//   const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
//   const pfxC = {INF:'rgba(255,255,255,.72)',OK:'rgba(255,255,255,.72)',WRN:'rgba(255,255,255,.72)',ERR:'rgba(255,255,255,.72)'};

//   return (
//     <div style={{position:'fixed',inset:0,background:'#000',zIndex:9999,display:'flex',flexDirection:'column',overflow:'hidden',fontFamily:"'JetBrains Mono',monospace"}}>
//       {/* TOP BAR */}
//       <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56,background:'rgba(0,0,0,.94)',borderBottom:'1px solid rgba(255,255,255,.08)',backdropFilter:'blur(16px)',flexShrink:0}}>
//         <div style={{display:'flex',alignItems:'center',gap:18}}>
//           <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:'6px',color:'#fff'}}>WHITENX</span>
//           <span style={{fontSize:10,color:done?'rgba(255,255,255,.9)':'rgba(255,255,255,.72)',border:`1px solid ${done?'rgba(255,255,255,.3)':'rgba(255,255,255,.1)'}`,padding:'5px 14px',borderRadius:100,letterSpacing:'2px',fontWeight:600,background:'rgba(255,255,255,.04)'}}>
//             {done?'SCAN COMPLETE':'SCANNING'}
//           </span>
//         </div>
//         <div style={{display:'flex',alignItems:'center',gap:24}}>
//               {[{l:'TARGET',v:target},{l:'PHASE',v:`${csi+1}/7`},{l:'THREATS',v:counts.crit+counts.high+counts.med+counts.low},{l:'TIME',v:fmt(elapsed)}].map(s=>(
//             <div key={s.l} style={{textAlign:'right'}}>
//               <div style={{fontSize:9,color:'rgba(255,255,255,.6)',letterSpacing:'1.5px'}}>{s.l}</div>
//               <div style={{fontSize:13,color:'#fff',fontWeight:600}}>{s.v}</div>
//             </div>
//           ))}
//           {!done && (
//             <button onClick={onCancel} style={{fontSize:10,color:'#fff',background:'transparent',border:'1px solid rgba(255,255,255,.18)',padding:'8px 16px',borderRadius:100,cursor:'pointer',opacity:0.92,whiteSpace:'nowrap'}}>CANCEL</button>
//           )}
//         </div>
//       </div>

//       {/* STATUS BAR */}
//       {!done && (
//         <div style={{background:'#0a0a0a',borderBottom:'1px solid #111',padding:'10px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
//           <div style={{display:'flex',alignItems:'center',gap:10}}>
//             <span style={{width:7,height:7,borderRadius:'50%',background:'#ffffff',display:'inline-block',animation:'gt-pulse 1.5s ease-in-out infinite',flexShrink:0}}/>
//             <span style={{fontSize:11,color:'#ffffff',letterSpacing:'1.5px',fontWeight:600}}>{apiDone?'RENDERING RESULTS...':'DEEP SCAN IN PROGRESS — Keep tab open'}</span>
//           </div>
//           <span style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>Est. time: 5–6 minutes</span>
//         </div>
//       )}

//       <div style={{flex:1,display:'flex',overflow:'hidden',minHeight:0}}>
//         {/* PIPELINE */}
//         <div style={{width:100,background:'#030303',borderRight:'1px solid #111',padding:'20px 0',display:'flex',flexDirection:'column',gap:4,flexShrink:0}}>
//           {STAGES.map((s,i)=>{
//             const done2=i<csi,cur=i===csi;
//             return (
//               <div key={s.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',background:cur?'#0a0a0a':'transparent',borderLeft:cur?'2px solid #fff':'2px solid transparent'}}>
//                 <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,border:`1px solid ${done2?'#ffffff':cur?'#fff':'rgba(255,255,255,.14)'}`,background:done2?'#ffffff40':cur?'#ffffff20':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
//                   {done2&&<div style={{width:4,height:4,borderRadius:'50%',background:'#ffffff'}}/>}
//                   {cur&&<div style={{width:4,height:4,borderRadius:'50%',background:'#fff',animation:'gt-pulse 1s ease-in-out infinite'}}/>}
//                 </div>
//                 <span style={{fontSize:10,letterSpacing:'1.5px',fontWeight:700,color:done2?'rgba(255,255,255,.8)':cur?'#fff':'rgba(255,255,255,.28)'}}>{s.short}</span>
//               </div>
//             );
//           })}
//         </div>

//         {/* TERMINAL */}
//         <div style={{flex:1,background:'#000',display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
//           <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 18px',borderBottom:'1px solid #0d0d0d',flexShrink:0}}>
//             <span style={{fontSize:12,color:'rgba(255,255,255,.75)'}}>whitenx@probe:<span style={{color:'#fff'}}>~/{target}</span>$</span>
//             <span style={{fontSize:9,color:'rgba(255,255,255,.36)',letterSpacing:'1px'}}>{STAGES[csi]?.full}</span>
//           </div>
//           <div style={{flex:1,overflowY:'auto',padding:'14px 18px',scrollbarWidth:'none'}}>
//             {entries.map((e,i)=>{
//               if(e.type==='sp')  return <div key={i} style={{height:10}}/>;
//               if(e.type==='sep') return <div key={i} style={{borderTop:'1px solid #0d0d0d',margin:'12px 0'}}/>;
//               if(e.type==='cmd') return (
//                 <div key={i} className="gt-line" style={{display:'flex',gap:8,marginBottom:10,fontSize:13}}>
//                   <span style={{color:'rgba(255,255,255,.4)'}}>$</span>
//                   <span style={{color:'rgba(255,255,255,.78)'}}>{e.txt}</span>
//                 </div>
//               );
//               if(e.type==='crit') return (
//                 <div key={i} style={{margin:'10px 0 14px',borderLeft:'2px solid #ffffff',background:'#0a0a0a',padding:'12px 16px',borderRadius:'0 8px 8px 0'}}>
//                   <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
//                     <span style={{fontSize:9,fontWeight:700,letterSpacing:'2px',color:'#ffffff',background:'#1a1a1a',border:'1px solid #333333',padding:'4px 12px',borderRadius:100}}>CRITICAL</span>
//                     <span style={{fontSize:12,color:'#ffffff',fontWeight:600}}>{e.id}</span>
//                   </div>
//                   {e.port&&<div style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>Port: <span style={{color:'#fff'}}>{e.port}</span></div>}
//                   {e.rec&&<div style={{fontSize:10,color:'rgba(255,255,255,.6)',marginTop:4}}>{e.rec.substring(0,80)}</div>}
//                 </div>
//               );
//               if(e.type==='high') return (
//                 <div key={i} style={{margin:'8px 0 12px',borderLeft:'2px solid #cccccc',background:'#0a0a0a',padding:'10px 16px',borderRadius:'0 8px 8px 0'}}>
//                   <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
//                     <span style={{fontSize:9,fontWeight:700,letterSpacing:'2px',color:'#cccccc',background:'#1a1a1a',border:'1px solid #333333',padding:'4px 10px',borderRadius:100}}>HIGH</span>
//                     <span style={{fontSize:12,color:'#cccccc'}}>{e.id}</span>
//                   </div>
//                   {e.port&&<div style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>Port: <span style={{color:'#fff'}}>{e.port}</span></div>}
//                 </div>
//               );
//               const isLast=i===entries.length-1;
//               return (
//                 <div key={i} className="gt-line" style={{display:'flex',gap:8,padding:'2px 0',fontSize:12,lineHeight:1.8}}>
//                   <span style={{color:'rgba(255,255,255,.28)',fontSize:10,minWidth:60,flexShrink:0}}>[{e.time}]</span>
//                   <span style={{color:pfxC[e.pfx||'INF'],fontWeight:700,fontSize:10,minWidth:32,flexShrink:0}}>{e.pfx||'INF'}</span>
//                   <span style={{color:'rgba(255,255,255,.68)'}}>
//                     {e.txt}{isLast&&!done&&<span className="gt-cursor">█</span>}
//                   </span>
//                 </div>
//               );
//             })}
//             <div ref={endRef}/>
//           </div>
//         </div>

//         {/* RIGHT PANEL */}
//         <div style={{width:160,background:'#030303',borderLeft:'1px solid #111',padding:'16px 12px',display:'flex',flexDirection:'column',gap:16,flexShrink:0,overflowY:'auto'}}>
//           <div>
//             <div style={{fontSize:9,color:'rgba(255,255,255,.28)',letterSpacing:'2px',marginBottom:10,fontFamily:'monospace',fontWeight:600}}>SEVERITY</div>
//             <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
//               {[['CRIT',counts.crit,'#ffffff'],['HIGH',counts.high,'#cccccc'],['MED',counts.med,'#999999'],['LOW',counts.low,'#666666']].map(([l,v,c])=>(
//                 <div key={l} style={{background:'#0a0a0a',borderRadius:8,padding:'8px',borderTop:`2px solid ${c}30`}}>
//                   <div style={{fontSize:6,color:'rgba(255,255,255,.6)',letterSpacing:'1px',marginBottom:2}}>{l}</div>
//                   <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:c,letterSpacing:1}}>{v}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div>
//             <div style={{fontSize:10,color:'rgba(255,255,255,.28)',letterSpacing:'2px',marginBottom:10,fontFamily:'monospace',fontWeight:600}}>OPEN PORTS</div>
//             {openPorts.length===0&&<div style={{fontSize:10,color:'rgba(255,255,255,.28)'}}>scanning...</div>}
//             {openPorts.slice(0,6).map((p,i)=>(
//               <div key={i} style={{display:'flex',justifyContent:'space-between',background:'#0a0a0a',borderRadius:6,padding:'6px 10px',marginBottom:4}}>
//                 <span style={{fontSize:11,color:'#fff',fontFamily:'monospace'}}>{p.port}</span>
//                 <span style={{fontSize:9,color:'#ffffff',fontWeight:600}}>OPEN</span>
//               </div>
//             ))}
//           </div>
//           <div style={{marginTop:'auto'}}>
//             <div style={{fontSize:9,color:'rgba(255,255,255,.28)',letterSpacing:'2px',marginBottom:4,fontFamily:'monospace',fontWeight:600}}>ELAPSED</div>
//             <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:'#fff',letterSpacing:2}}>{fmt(elapsed)}</div>
//           </div>
//         </div>
//       </div>

//       {/* PROGRESS BAR */}
//       <div style={{height:40,background:'#030303',borderTop:'1px solid #111',display:'flex',alignItems:'center',padding:'0 24px',gap:14,flexShrink:0}}>
//         <span style={{fontSize:10,color:'rgba(255,255,255,.6)',letterSpacing:'1.5px',minWidth:80,fontFamily:'monospace',fontWeight:600}}>
//           {done?'COMPLETE':apiDone?'PROCESSING':'SCANNING'}
//         </span>
//         <div style={{flex:1,height:2,background:'#111',borderRadius:1,overflow:'hidden'}}>
//           <div style={{height:'100%',width:`${disp}%`,background:done?'#ffffff':'#ffffff',borderRadius:1,transition:'width .6s ease,background .5s ease'}}/>
//         </div>
//         <span style={{fontSize:12,fontWeight:700,color:done?'#ffffff':'#fff',minWidth:34,textAlign:'right',fontFamily:'monospace'}}>{disp}%</span>
//       </div>
//     </div>
//   );
// };

// // ════════════════════════════════════════════════════════════
// // DASHBOARD COMPONENTS
// // ════════════════════════════════════════════════════════════
// const SevBadge = ({ s }) => {
//   const map={CRITICAL:'bc',HIGH:'bh',MEDIUM:'bm',LOW:'bl',OPEN:'bc',ENABLED:'bg',MISSING:'bc',ALIVE:'bg',DOWN:'bc'};
//   return <span className={`wx-badge ${map[s]||'bn'}`}>{s}</span>;
// };

// const StatCard = ({ label, val, sub, icon, accent='#fff', delay='0s' }) => (
//   <div className="wx-stat" style={{'--stat-accent':accent,animationDelay:delay}}>
//     <div className="wx-stat-accent" />
//     {icon&&<span className="wx-stat-icon">{icon}</span>}
//     <div className="wx-stat-label">{label}</div>
//     <div className="wx-stat-val" style={{color:accent}}>{val}</div>
//     {sub&&<div className="wx-stat-sub">{sub}</div>}
//   </div>
// );

// const WxCard = ({ title, badge, children }) => (
//   <div className="wx-card">
//     <div className="wx-card-hdr">
//       <div className="wx-card-title">{title}</div>
//       {badge&&<span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{badge}</span>}
//     </div>
//     <div className="wx-card-body">{children}</div>
//   </div>
// );

// const WxTable = ({ cols, rows, empty='No data' }) => (
//   <div className="wx-tbl-wrap">
//     <table className="wx-tbl">
//       <thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead>
//       <tbody>
//         {rows.length===0
//           ?<tr><td colSpan={cols.length} style={{textAlign:'center',color:'rgba(255,255,255,.4)',padding:32}}>{empty}</td></tr>
//           :rows}
//       </tbody>
//     </table>
//   </div>
// );

// // ════════════════════════════════════════════════════════════
// // DASHBOARD
// // ════════════════════════════════════════════════════════════
// const Dashboard = ({ onSessionExpire }) => {
//   const [domain,      setDomain]      = useState('');
//   const [result,      setResult]      = useState(null);
//   const [liveRes,     setLiveRes]     = useState(null);
//   const [jsonData,    setJsonData]    = useState(null);
//   const [err,         setErr]         = useState('');
//   const [tab,         setTab]         = useState('overview');
//   const [showJson,    setShowJson]    = useState(false);
//   const [scanning,    setScanning]    = useState(false);
//   const [si,          setSI]          = useState(0);
//   const [prog,        setProg]        = useState(0);
//   const [apiDone,     setApiDone]     = useState(false);
//   const [domainValid, setDomainValid] = useState(null);
//   const [validationMsg, setValidationMsg] = useState('');
//   const [reportLoading, setReportLoading] = useState(false);
//   const [reportSuccess, setReportSuccess] = useState(false);
//   const [reportError,   setReportError]   = useState('');
//   const [lastActivity,  setLastActivity]  = useState(Date.now());

//   const timersRef = useRef([]);
//   const progRef   = useRef(null);
//   const scanAbortRef = useRef(null);
//   const reportRef = useRef(null);
//   const idleLockRef = useRef(false);

//   // Domain validation function
//   const isValidDomain = (input) => {
//     const trimmed = input.trim();
//     if (!trimmed) return false;
    
//     // IP address regex (IPv4)
//     const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
//     if (ipRegex.test(trimmed)) return true;
    
//     // Domain name regex
//     const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
//     if (domainRegex.test(trimmed)) return true;
    
//     // Allow localhost
//     if (trimmed === 'localhost' || trimmed.startsWith('localhost:')) return true;
    
//     return false;
//   };

//   // Validation handler with detailed messages
//   const validateDomainInput = (input) => {
//     const trimmed = input.trim();
    
//     if (!trimmed) {
//       setDomainValid(null);
//       setValidationMsg('');
//       return;
//     }

//     // Check for common spelling mistakes
//     if (trimmed.includes(' ')) {
//       setDomainValid(false);
//       setValidationMsg('❌ Spaces detected — remove them');
//       return;
//     }

//     if (trimmed.includes('//')) {
//       setDomainValid(false);
//       setValidationMsg('❌ Contains protocol prefix — remove http:// or https://');
//       return;
//     }

//     if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
//       setDomainValid(false);
//       setValidationMsg('❌ Domain cannot start or end with a dot');
//       return;
//     }

//     const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
//     if (ipRegex.test(trimmed)) {
//       setDomainValid(true);
//       setValidationMsg('✓ Valid IPv4 address');
//       return;
//     }

//     if (trimmed === 'localhost' || trimmed.startsWith('localhost:')) {
//       setDomainValid(true);
//       setValidationMsg('✓ Valid localhost');
//       return;
//     }

//     const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
//     if (domainRegex.test(trimmed)) {
//       setDomainValid(true);
//       setValidationMsg('✓ Valid domain');
//       return;
//     }

//     // Specific error messages for common mistakes
//     if (trimmed.includes('_')) {
//       setDomainValid(false);
//       setValidationMsg('❌ Underscores not allowed in domains — use hyphens instead');
//       return;
//     }

//     if (!trimmed.includes('.') && trimmed !== 'localhost') {
//       setDomainValid(false);
//       setValidationMsg('❌ Missing domain extension (e.g., .com, .org)');
//       return;
//     }

//     if (/[^a-zA-Z0-9.\-:]/g.test(trimmed)) {
//       setDomainValid(false);
//       setValidationMsg('❌ Invalid characters detected');
//       return;
//     }

//     setDomainValid(false);
//     setValidationMsg('❌ Invalid format — use: example.com or 192.168.1.1');
//   };

//   useEffect(()=>{ injectCSS(); },[]);

//   useEffect(() => {
//     const resetActivity = () => {
//       setLastActivity(Date.now());
//       if (idleLockRef.current) {
//         idleLockRef.current = false;
//       }
//     };

//     const events = ['mousemove','mousedown','keydown','touchstart','scroll'];
//     events.forEach(evt => window.addEventListener(evt, resetActivity, { passive: true }));

//     const idleInterval = setInterval(() => {
//       if (Date.now() - lastActivity > 10 * 60 * 1000 && !idleLockRef.current) {
//         idleLockRef.current = true;
//         setErr('Session expired due to inactivity. Re-authentication required.');
//         onSessionExpire();
//       }
//     }, 15000);

//     return () => {
//       events.forEach(evt => window.removeEventListener(evt, resetActivity));
//       clearInterval(idleInterval);
//     };
//   }, [lastActivity, onSessionExpire]);

//   useEffect(() => {
//     const blockAction = e => {
//       e.preventDefault();
//       setErr('Action blocked for security reasons.');
//     };

//     const blockKey = e => {
//       const key = e.key.toLowerCase();
//       if ((e.ctrlKey || e.metaKey) && ['c','s','u','i','j','p','a'].includes(key)) {
//         e.preventDefault();
//         setErr('Keyboard shortcut disabled.');
//       }
//     };

//     const handleVisibility = () => {
//       if (document.hidden) {
//         setErr('Tab hidden — sensitive session activity blocked.');
//       }
//     };

//     window.addEventListener('contextmenu', blockAction);
//     document.addEventListener('copy', blockAction);
//     document.addEventListener('visibilitychange', handleVisibility);
//     window.addEventListener('keydown', blockKey);

//     return () => {
//       window.removeEventListener('contextmenu', blockAction);
//       document.removeEventListener('copy', blockAction);
//       document.removeEventListener('visibilitychange', handleVisibility);
//       window.removeEventListener('keydown', blockKey);
//     };
//   }, []);

//   const handleScan = async () => {
//     if(!domain.trim()){
//       setErr('❌ Target field is empty — enter a domain or IP address');
//       setDomainValid(false);
//       return;
//     }
//     if(!isValidDomain(domain)){
//       setErr('❌ Invalid format — ensure domain is typed correctly (check spelling).');
//       setDomainValid(false);
//       return;
//     }
//     setErr('');setResult(null);setLiveRes(null);setJsonData(null);setApiDone(false);
//     setScanning(true);setSI(0);setProg(0);
//     const scanStart = Date.now();
//     const minScanMs = 330000;
//     scanAbortRef.current = new AbortController();

//     if('Notification' in window && Notification.permission==='default') {
//       await Notification.requestPermission();
//     }

//     const dur=[45000,42000,42000,43000,42000,38000,35000];
//     let cum=0;
//     timersRef.current=dur.map((d,i)=>{ const t=setTimeout(()=>setSI(i),cum); cum+=d; return t; });
//     progRef.current=setInterval(()=>setProg(p=>p>=84?84:+(p+0.087).toFixed(3)),250);

//     try {
//       const res=await fetch(`${API_BASE}/scan/full?target=${domain}`,{
//         method:'GET',
//         headers:{
//           'Accept':'application/json',
//           'x-access-token': ACCESS_KEY,
//         },
//         signal: scanAbortRef.current?.signal,
//       });
//       if(!res.ok) throw new Error(`Scan failed: ${res.status}`);
//       const data=await res.json();
//       timersRef.current.forEach(clearTimeout);
//       clearInterval(progRef.current);
//       setSI(6);setProg(90);setApiDone(true);setLiveRes(data);
//       setLastActivity(Date.now());

//       if('Notification' in window && Notification.permission==='granted') {
//         const vulns=data.vulnerabilities||[];
//         const crit=vulns.filter(v=>v.severity==='CRITICAL').length;
//         const high=vulns.filter(v=>v.severity==='HIGH').length;
//         new Notification('⚡ WHITENX — Scan Complete', {
//           body:`Target: ${domain}\n${crit} Critical  ${high} High\nClick to view report →`,
//           tag:'whitenx-scan',requireInteraction:true,
//         });
//       }

//       const remaining = Math.max(0, minScanMs - (Date.now() - scanStart));
//       const completionTimer = setTimeout(()=>{ setScanning(false);setJsonData(data);setResult(data); scanAbortRef.current = null; }, Math.max(4200, remaining));
//       timersRef.current.push(completionTimer);
//     } catch(e){
//       timersRef.current.forEach(clearTimeout);
//       clearInterval(progRef.current);
//       if (e.name === 'AbortError') {
//         setErr('⚠ Scan cancelled.');
//       } else {
//         setErr(e.message||'Backend unavailable');
//       }
//       setScanning(false);
//       scanAbortRef.current = null;
//     }
//   };

//   const handleCancelScan = useCallback(() => {
//     if (scanAbortRef.current) scanAbortRef.current.abort();
//     timersRef.current.forEach(clearTimeout);
//     timersRef.current = [];
//     if (progRef.current) {
//       clearInterval(progRef.current);
//       progRef.current = null;
//     }
//     setScanning(false);
//     setApiDone(false);
//     setLiveRes(null);
//     setJsonData(null);
//     setErr('⚠ Scan cancelled.');
//     scanAbortRef.current = null;
//   }, []);

//   const generatePdfReport = useCallback(async () => {
//     if (!reportRef.current) {
//       setReportError('Unable to locate report content.');
//       return;
//     }

//     setReportError('');
//     setReportSuccess(false);
//     setReportLoading(true);

//     try {
//       const canvas = await html2canvas(reportRef.current, {
//         useCORS: true,
//         backgroundColor: '#040404',
//         scale: 2,
//       });

//       const imgData = canvas.toDataURL('image/jpeg', 0.95);
//       const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
//       const pageWidth = pdf.internal.pageSize.getWidth();
//       const pageHeight = pdf.internal.pageSize.getHeight();
//       const imgWidth = pageWidth;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;

//       let heightLeft = imgHeight;
//       let position = 0;
//       pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
//       heightLeft -= pageHeight;

//       while (heightLeft > 0) {
//         position -= pageHeight;
//         pdf.addPage();
//         pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
//         heightLeft -= pageHeight;
//       }

//       const cleanTarget = result?.target?.replace(/[^a-zA-Z0-9_-]/g, '') || 'report';
//       const filename = `WHITENX-Report-${cleanTarget}-${Date.now()}.pdf`;
//       pdf.save(filename);
//       setReportSuccess(true);
//     } catch (error) {
//       setReportError(error?.message || 'Unable to generate report.');
//     } finally {
//       setReportLoading(false);
//       setTimeout(() => setReportSuccess(false), 5000);
//     }
//   }, [result]);

//   if(scanning) return <GhostTerminal si={si} progress={Math.round(prog)} target={domain} apiDone={apiDone} scanResult={liveRes} onCancel={handleCancelScan}/>;

//   if(showJson&&jsonData) return (
//     <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#000'}}>
//       <Ticker/>
//       <nav className="wx-nav">
//         <div><div className="wx-logo">WHITENX</div></div>
//         <button className="wx-btn" onClick={()=>setShowJson(false)}>← Back</button>
//       </nav>
//       <div style={{flex:1,overflow:'auto',padding:48}}>
//         <div style={{fontSize:11,color:'rgba(255,255,255,.75)',letterSpacing:'2px',marginBottom:18,fontWeight:600,textTransform:'uppercase'}}>Raw Scan Output — JSON</div>
//         <pre style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:16,padding:28,overflow:'auto',fontSize:13,color:'rgba(255,255,255,.88)',maxHeight:'80vh',fontFamily:"'JetBrains Mono',monospace",backdropFilter:'blur(12px)',boxShadow:'0 8px 32px rgba(0,0,0,.4)'}}>{JSON.stringify(jsonData,null,2)}</pre>
//       </div>
//     </div>
//   );

//   if(!result) return (
//     <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'#000'}}>
//       <Ticker/>
//       <div className="wx-hero">
//         <div className="hero-starfield"/>
//         <div className="live-particle-burst">
//           <div className="live-particle"/>
//           <div className="live-particle"/>
//           <div className="live-particle"/>
//           <div className="live-particle"/>
//           <div className="live-particle"/>
//         </div>
//         <div className="glow-rings-container">
//           <div className="glow-ring glow-ring-1"/>
//           <div className="glow-ring glow-ring-2"/>
//           <div className="glow-ring glow-ring-3"/>
//         </div>
//         <div className="glow-orb glow-orb-1"/>
//         <div className="glow-orb glow-orb-2"/>
//         <div className="hero-screen-fx"/>
//         <div className="hero-constellation hero-constellation-a" aria-hidden="true">
//           <svg viewBox="0 0 260 220">
//             <polygon points="36,160 84,54 192,78 228,176 120,206"/>
//             <line x1="84" y1="54" x2="120" y2="206"/>
//             <line x1="36" y1="160" x2="192" y2="78"/>
//             <line x1="84" y1="54" x2="228" y2="176"/>
//             <circle cx="36" cy="160" r="2"/>
//             <circle cx="84" cy="54" r="2"/>
//             <circle cx="192" cy="78" r="2"/>
//             <circle cx="228" cy="176" r="2"/>
//             <circle cx="120" cy="206" r="2"/>
//           </svg>
//         </div>
//         <div className="hero-constellation hero-constellation-b" aria-hidden="true">
//           <svg viewBox="0 0 220 180">
//             <polygon points="40,26 146,12 188,74 94,96"/>
//             <line x1="40" y1="26" x2="94" y2="96"/>
//             <line x1="146" y1="12" x2="94" y2="96"/>
//             <line x1="40" y1="26" x2="188" y2="74"/>
//             <circle cx="40" cy="26" r="2"/>
//             <circle cx="146" cy="12" r="2"/>
//             <circle cx="188" cy="74" r="2"/>
//             <circle cx="94" cy="96" r="2"/>
//           </svg>
//         </div>
//         <div className="hero-bg-right"/>
//         <div style={{position:'relative',zIndex:2,width:'100%',maxWidth:'100%',padding:'0 48px'}}>
//           <div className="hero-badge">
//             <span className="hero-badge-dot"/>
//             Whitenx VAPT Platform
//           </div>
//           <div className="hero-title">VULNERABILITY<br/>ASSESSMENT<br/>PLATFORM</div>
//           <div className="hero-desc">
//             Professional penetration testing and security analysis. Full port scanning, CVE detection, OSINT intelligence, and SSL auditing in one platform.
//           </div>
//           <div className="hero-status-row">
//             <span className="hero-status-chip live"><span className="hero-status-dot"/>Live Scan Active</span>
//             <span className="hero-status-chip">Threat Intel Synced</span>
//             <div className="hero-typing"><span>root@whitenx: monitoring attack surface signatures</span></div>
//           </div>
//           <div className="hero-features">
//             {['Recon','Port Scan','CVE Match','OSINT','SSL Audit','Risk Score'].map(f=>(
//               <span key={f} className="hero-feature">{f}</span>
//             ))}
//           </div>
//           {err&&<div className="wx-err">{err}</div>}
//           <div className="hero-input-row">
//             <div style={{flex:1,position:'relative'}}>
//               <input className="wx-input" placeholder="example.com or 192.168.1.1"
//                 value={domain} onChange={e=>{setDomain(e.target.value); validateDomainInput(e.target.value);}}
//                 onKeyDown={e=>e.key==='Enter'&&domainValid&&handleScan()}
//                 style={{
//                   borderColor: domainValid === true ? 'rgba(100,200,100,.4)' : domainValid === false ? 'rgba(200,100,100,.4)' : 'rgba(255,255,255,.14)',
//                   boxShadow: domainValid === true ? '0 0 16px rgba(100,200,100,.12)' : domainValid === false ? '0 0 16px rgba(200,100,100,.12)' : 'none',
//                 }}/>
//               {validationMsg && (
//                 <div style={{fontSize:9,color: domainValid ? 'rgba(100,200,100,.8)' : 'rgba(200,100,100,.8)',marginTop:6,letterSpacing:'.5px',fontFamily:'monospace'}}>
//                   {validationMsg}
//                 </div>
//               )}
//             </div>
//             <button className="wx-scan-btn" onClick={handleScan} disabled={domainValid !== true || scanning}
//               style={{opacity: (domainValid && !scanning) ? 1 : 0.5, cursor: (domainValid && !scanning) ? 'pointer' : 'not-allowed'}}>
//               {scanning ? 'Scanning...' : 'Scan →'}
//             </button>
//           </div>
//           <div className="hero-warn">
//             <span className="hero-warn-dot"/>
//             Full scan takes 5–6 minutes — keep this tab open
//           </div>
//           <div className="hero-terminal">
//             <div className="hero-terminal-top">
//               <span className="hero-terminal-title">Operator Feed</span>
//               <span className="hero-terminal-state">Monitoring</span>
//             </div>
//             <div className="hero-terminal-body">
//               <div className="hero-log"><span className="hero-log-tag">INF</span><span className="hero-log-text">Passive recon modules armed for hostname, port, and SSL analysis.</span></div>
//               <div className="hero-log"><span className="hero-log-tag">SYS</span><span className="hero-log-text">Telemetry ready. Awaiting target input for full-spectrum assessment.</span></div>
//               <div className="hero-log"><span className="hero-log-tag">TIP</span><span className="hero-log-text">Use a domain or IP to launch the live security pipeline.</span></div>
//             </div>
//           </div>

//           {/* Feature grid */}
//           <div style={{marginTop:64,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,maxWidth:480}}>
//             {[
//               {icon:'🔍',label:'Port Scanning',desc:'Full 65535 port sweep with service detection'},
//               {icon:'🛡️',label:'CVE Detection',desc:'48,000+ vulnerability database matching'},
//               {icon:'🌐',label:'OSINT Intel',desc:'WHOIS, DNS records, crt.sh enumeration'},
//               {icon:'🔒',label:'SSL Analysis',desc:'Certificate & cipher suite inspection'},
//             ].map(f=>(
//               <div key={f.label} className="hero-feature-card">
//                 <div style={{fontSize:24,marginBottom:10}}>{f.icon}</div>
//                 <div style={{fontSize:12,fontWeight:800,letterSpacing:'.8px',color:'#fff',marginBottom:8}}>{f.label}</div>
//                 <div style={{fontSize:11,color:'rgba(255,255,255,.68)',lineHeight:1.7}}>{f.desc}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // REPORT
//   const vulns = result.vulnerabilities||[];
//   const svcs  = result.fingerprinted_services||result.services||[];
//   const ports  = result.port_scan?.services||result.port_scan?.open_ports||[];
//   const subds  = result.subdomain_enum?.subdomains||result.subdomains||[];
//   const osint  = result.osint||{};
//   const sslA   = result.ssl_analysis||{};
//   const hdrs   = osint.http?.security_headers||{};

//   const crit=vulns.filter(v=>v.severity==='CRITICAL').length;
//   const high=vulns.filter(v=>v.severity==='HIGH').length;
//   const med =vulns.filter(v=>v.severity==='MEDIUM').length;
//   const low =vulns.filter(v=>v.severity==='LOW').length;

//   const TABS=['Overview','Vulnerabilities','Services','Ports','Subdomains','OSINT'];
//   const rawSnapshot = JSON.stringify({
//     osint,
//     port_scan: result.port_scan ? {
//       ...result.port_scan,
//       services: ports,
//       open_ports: result.port_scan.open_ports || []
//     } : {},
//     vulnerabilities: vulns,
//     subdomains: subds
//   }, null, 2);

//   return (
//     <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#000'}}>
//       <Ticker/>
//       <nav className="wx-nav">
//         <div>
//           <div className="wx-logo">WHITENX</div>
//           <span className="wx-logo-sub">VAPT PLATFORM</span>
//         </div>
//         <div className="wx-tabs">
//           {TABS.map(t=>(
//             <button key={t}
//               className={`wx-tab${tab===t.toLowerCase().replace(' ','')?' active':''}`}
//               onClick={()=>setTab(t.toLowerCase().replace(' ',''))}>{t}</button>
//           ))}
//         </div>
//         <div style={{display:'flex',gap:8,alignItems:'center'}}>
//           <button className="wx-btn" onClick={()=>{setDomain('');setResult(null);setJsonData(null);}}>New Scan</button>
//           {jsonData&&<button className="wx-btn" onClick={()=>setShowJson(true)}>JSON</button>}
//           {result && <button className="wx-btn" onClick={generatePdfReport} disabled={reportLoading}>{reportLoading ? 'Generating...' : 'Generate Report'}</button>}
//         </div>
//       </nav>
//       <div style={{display:'flex',alignItems:'center',gap:12,padding:'0 48px 16px'}}>
//         {reportError && <span style={{color:'#fff',opacity:.85,fontSize:11}}>{reportError}</span>}
//         {reportSuccess && <span style={{color:'#fff',opacity:.85,fontSize:11}}>Report generated successfully.</span>}
//       </div>

//       <div className="wx-body">
//         {/* Report header */}
//         <div className="wx-rpt-hdr">
//           <div>
//             <div className="wx-rpt-title">Security Assessment Report</div>
//             <div className="wx-rpt-meta">
//               Target: <span style={{color:'#fff'}}>{result.target}</span>
//               &nbsp;·&nbsp; ID: {result.scan_id?.substring(0,14)}...
//               &nbsp;·&nbsp; {new Date().toLocaleDateString()}
//             </div>
//           </div>
//           <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
//             {crit>0&&<span className="wx-badge bc">{crit} Critical</span>}
//             {high>0&&<span className="wx-badge bh">{high} High</span>}
//             {med>0&&<span className="wx-badge bm">{med} Medium</span>}
//           </div>
//         </div>

//         {/* ── OVERVIEW ── */}
//         {tab==='overview'&&(
//           <>
//             <div className="g4 wx-stat-grid">
//               <StatCard label="Critical / High" val={crit+high} accent="#fff" sub={`${med} medium, ${low} low`} icon="⚠️" delay="0s"/>
//               <StatCard label="Open Ports"      val={ports.length} accent="#fff" sub="discovered"               icon="🔌" delay=".05s"/>
//               <StatCard label="Subdomains"      val={subds.length} accent="#fff" sub="enumerated"               icon="🌐" delay=".1s"/>
//               <StatCard label="Services"        val={svcs.length}  accent="#fff" sub="fingerprinted"           icon="⚙️" delay=".15s"/>
//             </div>

//             <div className="wx-section-label">Top Issues</div>
//             <div className="wx-card">
//               <div className="wx-card-hdr">
//                 <div className="wx-card-title">Critical Vulnerabilities</div>
//                 <span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{vulns.length} total</span>
//               </div>
//               <WxTable
//                 cols={['Vulnerability','Severity','Port','Recommendation']}
//                 rows={vulns.slice(0,8).map((v,i)=>(
//                   <tr key={i}>
//                     <td style={{color:'rgba(255,255,255,.78)'}}>{v.type}</td>
//                     <td><SevBadge s={v.severity}/></td>
//                     <td style={{color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{v.port||'—'}</td>
//                     <td style={{fontSize:10,color:'rgba(255,255,255,.6)',maxWidth:240}}>{(v.recommendation||'Review configuration').substring(0,60)}</td>
//                   </tr>
//                 ))}
//               />
//             </div>

//             <div className="wx-section-label">Services Detected</div>
//             <div className="wx-card">
//               <div className="wx-card-hdr">
//                 <div className="wx-card-title">Running Services</div>
//                 <span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{svcs.length} detected</span>
//               </div>
//               <WxTable
//                 cols={['Port','Service','Version','CVEs']}
//                 rows={svcs.map((s,i)=>(
//                   <tr key={i}>
//                     <td><strong style={{color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{s.port}</strong></td>
//                     <td style={{color:'rgba(255,255,255,.78)'}}>{s.service_name||s.service}</td>
//                     <td>{s.version?<span style={{color:'rgba(255,255,255,.85)',fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>{s.version}</span>:<span style={{color:'rgba(255,255,255,.35)'}}>—</span>}</td>
//                     <td>{s.cves?.length>0?<span className="wx-badge bh">{s.cves.length} CVEs</span>:<span className="wx-badge bn">None</span>}</td>
//                   </tr>
//                 ))}
//               />
//             </div>

//             {osint?.osint_score&&(
//               <>
//                 <div className="wx-section-label">OSINT Summary</div>
//                 <div className="g3">
//                   <WxCard title="OSINT Score">
//                     <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:120,gap:8}}>
//                       <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:64,color:'#fff',letterSpacing:2,lineHeight:1}}>{osint.osint_score||'—'}</div>
//                       <div style={{fontSize:9,color:'rgba(255,255,255,.6)',letterSpacing:'2px',textTransform:'uppercase'}}>Out of 100</div>
//                     </div>
//                   </WxCard>
//                   <WxCard title="Trust Level">
//                     <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:120,gap:8}}>
//                       <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,letterSpacing:2,color:'#fff'}}>{osint.trust_level||'?'}</div>
//                       <div style={{fontSize:9,color:'rgba(255,255,255,.6)',letterSpacing:'2px',textTransform:'uppercase'}}>Reputation</div>
//                     </div>
//                   </WxCard>
//                   <WxCard title="Security Headers">
//                     <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:4}}>
//                       {Object.entries(hdrs).slice(0,4).map(([k,v])=>(
//                         <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:10}}>
//                           <span style={{color:'rgba(255,255,255,.6)'}}>{k}</span>
//                           <SevBadge s={v?'ENABLED':'MISSING'}/>
//                         </div>
//                       ))}
//                     </div>
//                   </WxCard>
//                 </div>
//               </>
//             )}
//             <div className="wx-section-label">Raw Backend Snapshot</div>
//             <WxCard title="Source Data Preview">
//               <pre style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'rgba(255,255,255,.75)',background:'rgba(255,255,255,.03)',borderRadius:12,padding:16,overflow:'auto',maxHeight:260,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>
// {rawSnapshot}
//               </pre>
//             </WxCard>
//           </>
//         )}

//         {/* ── VULNERABILITIES ── */}
//         {tab==='vulnerabilities'&&(
//           <div className="wx-card">
//             <div className="wx-card-hdr">
//               <div className="wx-card-title">All Vulnerabilities</div>
//               <span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{vulns.length} total</span>
//             </div>
//             <WxTable cols={['Type','Severity','Port','Recommendation']}
//               rows={vulns.map((v,i)=>(
//                 <tr key={i}>
//                   <td style={{color:'rgba(255,255,255,.78)'}}>{v.type}</td>
//                   <td><SevBadge s={v.severity}/></td>
//                   <td style={{color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{v.port||'—'}</td>
//                   <td style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>{(v.recommendation||'Review configuration').substring(0,70)}</td>
//                 </tr>
//               ))} empty="No vulnerabilities detected"
//             />
//           </div>
//         )}

//         {/* ── SERVICES ── */}
//         {tab==='services'&&(
//           <div style={{display:'flex',flexDirection:'column',gap:14}}>
//             <div className="wx-card">
//               <div className="wx-card-hdr"><div className="wx-card-title">Fingerprinted Services</div></div>
//               <WxTable cols={['Port','Service','Version','Banner','CVEs']}
//                 rows={svcs.map((s,i)=>(
//                   <tr key={i}>
//                     <td><strong style={{color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{s.port}</strong></td>
//                     <td style={{color:'rgba(255,255,255,.78)'}}>{s.service_name||s.service}</td>
//                     <td style={{color:'rgba(255,255,255,.85)',fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>{s.version||'—'}</td>
//                     <td style={{fontSize:10,color:'rgba(255,255,255,.58)',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.banner?s.banner.substring(0,40)+'...':'—'}</td>
//                     <td>{s.cves?.length>0?<span className="wx-badge bh">{s.cves.length}</span>:<span className="wx-badge bn">0</span>}</td>
//                   </tr>
//                 ))}
//               />
//             </div>
//             {Object.keys(hdrs).length>0&&(
//               <div className="wx-card">
//                 <div className="wx-card-hdr"><div className="wx-card-title">Security Headers</div></div>
//                 <WxTable cols={['Header','Status']}
//                   rows={Object.entries(hdrs).map(([k,v])=>(
//                     <tr key={k}><td style={{fontSize:11,color:'rgba(255,255,255,.78)'}}>{k}</td><td><SevBadge s={v?'ENABLED':'MISSING'}/></td></tr>
//                   ))}
//                 />
//               </div>
//             )}
//             {sslA?.certificates?.length>0&&(
//               <div className="wx-card">
//                 <div className="wx-card-hdr"><div className="wx-card-title">SSL Certificate</div></div>
//                 <div className="wx-card-body">
//                   {(()=>{const c=sslA.certificates[0]; return(
//                     <table className="wx-tbl"><tbody>
//                       {[['Subject',c.subject],['Issuer',c.issuer],['Valid From',c.notBefore],['Valid Until',c.notAfter],['Days Left',c.expiry_days+'d']].map(([k,v])=>(
//                         <tr key={k}><td style={{color:'rgba(255,255,255,.6)',width:100,fontSize:10,textTransform:'uppercase',letterSpacing:'1px'}}>{k}</td><td style={{color:'rgba(255,255,255,.78)',fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>{v||'—'}</td></tr>
//                       ))}
//                     </tbody></table>
//                   );})()}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* ── PORTS ── */}
//         {tab==='ports'&&(
//           <div className="wx-card">
//             <div className="wx-card-hdr"><div className="wx-card-title">Port Scan Results</div><span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{ports.length} open</span></div>
//             <WxTable cols={['Port','Service','State','Version','Banner']}
//               rows={ports.map((p,i)=>(
//                 <tr key={i}>
//                   <td><strong style={{color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{p.port}</strong></td>
//                   <td style={{color:'rgba(255,255,255,.78)'}}>{p.service}</td>
//                   <td><SevBadge s={(p.state||'OPEN').toUpperCase()}/></td>
//                   <td style={{fontSize:10,color:'rgba(255,255,255,.85)',fontFamily:"'JetBrains Mono',monospace"}}>{p.version||'—'}</td>
//                   <td style={{fontSize:10,color:'rgba(255,255,255,.58)',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.banner?p.banner.substring(0,45)+'...':'—'}</td>
//                 </tr>
//               ))} empty="No open ports"
//             />
//           </div>
//         )}

//         {/* ── SUBDOMAINS ── */}
//         {tab==='subdomains'&&(
//           <div className="wx-card">
//             <div className="wx-card-hdr"><div className="wx-card-title">Subdomain Enumeration</div><span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{subds.length} found</span></div>
//             <WxTable cols={['Subdomain','Status','IP Addresses','URL']}
//               rows={subds.map((s,i)=>(
//                 <tr key={i}>
//                   <td style={{color:'#fff',fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>{s.subdomain||s}</td>
//                   <td><SevBadge s={s.alive?'ALIVE':'DOWN'}/></td>
//                   <td style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>{s.dns_ips?.join(', ')||'—'}</td>
//                   <td style={{fontSize:10,color:'rgba(255,255,255,.58)'}}>{s.url||'—'}</td>
//                 </tr>
//               ))} empty="No subdomains found"
//             />
//           </div>
//         )}

//         {/* ── OSINT ── */}
//         {tab==='osint'&&(
//           <div style={{display:'flex',flexDirection:'column',gap:14}}>
//             <div className="g2">
//               <WxCard title="WHOIS">
//                 <table className="wx-tbl"><tbody>
//                   {[['Registrar',osint.whois?.registrar],['Organization',osint.whois?.organization],['Country',osint.whois?.country],['Created',osint.whois?.creation_date],['Expires',osint.whois?.expiration_date]].map(([k,v])=>(
//                     <tr key={k}><td style={{color:'rgba(255,255,255,.6)',width:100,fontSize:9,textTransform:'uppercase',letterSpacing:'1px'}}>{k}</td><td style={{fontSize:11,color:'rgba(255,255,255,.78)'}}>{v||'N/A'}</td></tr>
//                   ))}
//                 </tbody></table>
//               </WxCard>
//               <WxCard title="DNS Records">
//                 <table className="wx-tbl"><tbody>
//                   <tr><td style={{color:'rgba(255,255,255,.6)',width:40,fontSize:9}}>A</td><td style={{fontSize:10,color:'rgba(255,255,255,.78)'}}>{osint.dns?.a_records?.join(', ')||'None'}</td></tr>
//                   <tr><td style={{color:'rgba(255,255,255,.6)',fontSize:9}}>MX</td><td style={{fontSize:10,color:'rgba(255,255,255,.78)'}}>{osint.dns?.mx_records?.map(m=>m.exchange||m).join(', ')||'None'}</td></tr>
//                   <tr><td style={{color:'rgba(255,255,255,.6)',fontSize:9}}>NS</td><td style={{fontSize:10,color:'rgba(255,255,255,.78)'}}>{osint.dns?.ns_records?.slice(0,3).join(', ')||'None'}</td></tr>
//                   <tr><td style={{color:'rgba(255,255,255,.6)',fontSize:9}}>TXT</td><td style={{fontSize:10,color:'rgba(255,255,255,.78)'}}>{osint.dns?.txt_records?.slice(0,2).join(', ')||'None'}</td></tr>
//                 </tbody></table>
//               </WxCard>
//             </div>
//             {Object.keys(hdrs).length>0&&(
//               <WxCard title="HTTP Security Headers">
//                 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:8}}>
//                   {Object.entries(hdrs).map(([k,v])=>(
//                     <div key={k} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.12)',borderLeft:'3px solid rgba(255,255,255,.24)',borderRadius:10,padding:'10px 14px',backdropFilter:'blur(12px)'}}>
//                       <div style={{fontSize:7,color:'rgba(255,255,255,.65)',letterSpacing:'1px',marginBottom:4,fontWeight:700,textTransform:'uppercase'}}>{v?'Enabled':'Missing'}</div>
//                       <div style={{fontSize:10,color:'rgba(255,255,255,.72)'}}>{k}</div>
//                     </div>
//                   ))}
//                 </div>
//               </WxCard>
//             )}
//           </div>
//         )}

//         <div style={{height:40}}/>

//         <div ref={reportRef} className="wx-pdf-report" aria-hidden="true">
//           <div style={{padding:32,background:'#030303',borderRadius:24,color:'#fff'}}>
//             <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,flexWrap:'wrap',marginBottom:28}}>
//               <div>
//                 <div style={{fontSize:36,fontWeight:800,letterSpacing:2}}>WHITENX VAPT REPORT</div>
//                 <div style={{fontSize:12,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,.65)',marginTop:8}}>Comprehensive security assessment summary</div>
//               </div>
//               <div style={{textAlign:'right',fontSize:10,color:'rgba(255,255,255,.65)',lineHeight:1.6}}>
//                 Generated: {new Date().toLocaleString()}<br/>
//                 Target: {result.target || 'n/a'}<br/>
//                 Scan ID: {result.scan_id?.substring(0,18) || 'pending'}
//               </div>
//             </div>

//             <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(240px,1fr))',gap:16,marginBottom:28}}>
//               <div style={{padding:20,background:'rgba(255,255,255,.03)',borderRadius:20}}>
//                 <div style={{fontSize:11,letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,.55)',marginBottom:12}}>Risk Summary</div>
//                 <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><strong>Critical</strong><span>{crit}</span></div>
//                 <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><strong>High</strong><span>{high}</span></div>
//                 <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><strong>Medium</strong><span>{med}</span></div>
//                 <div style={{display:'flex',justifyContent:'space-between'}}><strong>Low</strong><span>{low}</span></div>
//               </div>
//               <div style={{padding:20,background:'rgba(255,255,255,.03)',borderRadius:20}}>
//                 <div style={{fontSize:11,letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,.55)',marginBottom:12}}>Infrastructure</div>
//                 <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><strong>Open Ports</strong><span>{ports.length}</span></div>
//                 <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><strong>Services</strong><span>{svcs.length}</span></div>
//                 <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><strong>Subdomains</strong><span>{subds.length}</span></div>
//                 <div style={{display:'flex',justifyContent:'space-between'}}><strong>OSINT Score</strong><span>{osint.osint_score || 'N/A'}</span></div>
//               </div>
//             </div>

//             <div style={{marginBottom:24}}>
//               <div style={{fontSize:18,fontWeight:700,marginBottom:14}}>Top Findings</div>
//               <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
//                 <thead>
//                   <tr>
//                     <th style={{textAlign:'left',padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.75)'}}>Vulnerability</th>
//                     <th style={{textAlign:'left',padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.75)'}}>Severity</th>
//                     <th style={{textAlign:'left',padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.75)'}}>Port</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {vulns.slice(0,6).map((v,i)=>(
//                     <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.08)'}}>
//                       <td style={{padding:'12px 14px',color:'rgba(255,255,255,.82)'}}>{v.type}</td>
//                       <td style={{padding:'12px 14px',color:'#fff'}}>{v.severity}</td>
//                       <td style={{padding:'12px 14px',color:'rgba(255,255,255,.72)'}}>{v.port||'—'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(240px,1fr))',gap:16}}>
//               <div style={{padding:20,background:'rgba(255,255,255,.03)',borderRadius:20}}>
//                 <div style={{fontSize:11,letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,.55)',marginBottom:12}}>Security Headers</div>
//                 {Object.entries(hdrs).slice(0,6).map(([k,v])=>(
//                   <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
//                     <span style={{color:'rgba(255,255,255,.75)'}}>{k}</span>
//                     <span style={{color:'rgba(255,255,255,.82)'}}>{v ? 'Enabled' : 'Missing'}</span>
//                   </div>
//                 ))}
//               </div>
//               <div style={{padding:20,background:'rgba(255,255,255,.03)',borderRadius:20}}>
//                 <div style={{fontSize:11,letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,.55)',marginBottom:12}}>Details</div>
//                 <div style={{color:'rgba(255,255,255,.75)',fontSize:11,lineHeight:1.7}}>{osint.whois?.organization ? `${osint.whois.organization} — ${osint.whois.country}` : 'OSINT details available in dashboard.'}</div>
//               </div>
//             </div>
//             <div style={{marginTop:24,padding:20,background:'rgba(255,255,255,.02)',borderRadius:20}}>
//               <div style={{fontSize:11,letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,.55)',marginBottom:12}}>Raw Backend Snapshot</div>
//               <pre style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'rgba(255,255,255,.75)',background:'rgba(255,255,255,.03)',borderRadius:12,padding:16,overflow:'hidden',maxHeight:180,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>
// {rawSnapshot.slice(0,1800)}{rawSnapshot.length>1800? '\n...':' '}
//               </pre>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ════════════════════════════════════════════════════════════
// // ROOT APP
// // ════════════════════════════════════════════════════════════
// function App() {
//   const [stage, setStage] = useState('legal');
//   useEffect(()=>{ injectCSS(); },[]);
//   return (
//     <>
//       {stage==='legal'     && <LegalPage  onAccept={()=>setStage('login')}/>}
//       {stage==='login'     && <LoginPage  onLogin={()=>setStage('dashboard')}/>}
//       {stage==='dashboard' && <Dashboard onSessionExpire={()=>setStage('login')} />}
//     </>
//   );
// }

// export default App;
