import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  --accent:#ffffff; /* Strict B&W */
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

.wx-pdf-report{
  position:absolute;
  top:-9999px;
  left:-9999px;
  width:1200px;
  max-width:1200px;
  opacity:0;
  pointer-events:none;
}

/* ── TICKER ── */
@keyframes ticker-scroll{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
.ticker-wrap{
  width:100%;overflow:hidden;background:#050505;border-bottom:1px solid rgba(255,255,255,.12);
  padding:8px 0;backdrop-filter:blur(16px);position:relative;
  box-shadow:0 4px 18px rgba(0,0,0,.28);
}
.ticker-wrap::after{
  content:'';position:absolute;inset:auto 0 0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),rgba(255,255,255,.16),transparent);
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
.wx-card::before{
  content:'';
  position:absolute;
  inset:10px;
  border:1px solid rgba(255,255,255,.028);
  border-radius:12px;
  pointer-events:none;
}
.wx-card::after{
  content:'';
  position:absolute;
  top:10px;right:10px;
  width:22px;height:22px;
  border-top:1px solid rgba(255,255,255,.12);
  border-right:1px solid rgba(255,255,255,.12);
  opacity:.55;
  pointer-events:none;
}
.wx-card-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 18px;border-bottom:1px solid #0a1628;
  background:#04091a;
  background:#111;
}
.wx-card-title{font-size:9px;font-weight:700;letter-spacing:2px;color:#fff;}
.wx-card-body{padding:18px;}

/* ── STAT CARDS ── */
.wx-stat-grid{display:grid;gap:12px;}
.wx-stat{
  background:#060d1c;border:1px solid #0f2040;border-radius:8px;
  padding:18px 20px;display:flex;flex-direction:column;gap:6px;
  position:relative;overflow:hidden;transition:all .2s;
}
.wx-stat:hover{border-color:rgba(255,255,255,.18);transform:translateY(-1px);}
.wx-stat::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:rgba(255,255,255,.18);opacity:.6;
}
.wx-stat-label{font-size:8px;font-weight:700;letter-spacing:2px;color:#fff;}
.wx-stat-val{font-size:36px;font-weight:800;line-height:1;color:#fff;}
.wx-stat-sub{font-size:9px;color:#fff;}
.wx-stat-icon{
  position:absolute;right:16px;top:50%;transform:translateY(-50%);
  font-size:32px;opacity:.06;
}
.wx-stat-accent{position:absolute;bottom:0;left:0;right:0;height:2px;background:rgba(255,255,255,.16);opacity:.6;box-shadow:0 0 6px rgba(255,255,255,.16);}

/* ── TABLES ── */
.wx-tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
.wx-tbl{width:100%;border-collapse:collapse;font-size:11px;}
.wx-tbl th{padding:10px 16px;text-align:left;font-size:8px;font-weight:700;letter-spacing:1.5px;color:rgba(255,255,255,.72);border-bottom:1px solid #0a1628;background:#04091a;}
.wx-tbl td{padding:12px 16px;border-bottom:1px solid #060d1c;color:rgba(255,255,255,.68);transition:background .15s;}
.wx-tbl tr:hover td{background:rgba(255,255,255,.06);}
.wx-tbl tr:last-child td{border-bottom:none;}

/* ── BADGES ── */
.wx-badge{display:inline-block;font-size:9px;font-weight:700;letter-spacing:1px;padding:4px 10px;border-radius:100px;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.12);}
.bc,.bh,.bm,.bl,.bg{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.12);}
.bn{background:rgba(255,255,255,.05);color:var(--text-dim);border:1px solid rgba(255,255,255,.08);}

/* ── LEGAL PAGE ── */
@keyframes lp-in{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes lp-fade{from{opacity:0}to{opacity:1}}
@keyframes lp-box-slide{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes lp-item-fade{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}

.lp-wrap{
  min-height:100vh;
  display:flex;flex-direction:column;align-items:center;
  padding:60px 20px;position:relative;overflow:hidden;
  background:#000;
}

.lp-bg-shapes{
  position:absolute;
  inset:0;
  pointer-events:none;
  z-index:0;
}

.lp-shape-ring{
  position:absolute;
  border:1px solid rgba(255,255,255,.1);
  border-radius:50%;
  right:6%;
  top:10%;
  animation:rotate-smooth 28s linear infinite;
  opacity:.28;
}

.lp-shape-ring-1{
  width:260px;
  height:260px;
  margin-right:-130px;
  margin-top:-130px;
}

.lp-shape-ring-2{
  width:400px;
  height:400px;
  margin-right:-200px;
  margin-top:-200px;
  animation:rotate-smooth 35s linear infinite reverse;
  opacity:.18;
}

.lp-shape-orb{
  position:absolute;
  border-radius:50%;
  left:5%;
  bottom:12%;
  width:110px;
  height:110px;
  background:radial-gradient(circle at 35% 35%, rgba(255,255,255,.14), rgba(255,255,255,.01));
  box-shadow:0 0 36px rgba(255,255,255,.1), inset -6px -6px 18px rgba(0,0,0,.4);
  opacity:.28;
}

  background:
    radial-gradient(circle at 72% 16%, rgba(255,255,255,.04), transparent 20%),
    #000;
}
.lp-wrap::before{
  content:'';
  position:absolute;inset:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(255,255,255,.01) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.01) 1px, transparent 1px);
  background-size:64px 64px;
  opacity:.2;
}
.lp-bg-diamond{
  position:absolute;right:-200px;top:50%;transform:translateY(-50%) rotate(45deg);
  width:600px;height:600px;border:1px solid rgba(255,255,255,.08);
  pointer-events:none;
}
.lp-bg-diamond::before{
  content:'';position:absolute;inset:60px;border:1px solid rgba(255,255,255,.05);
}
.lp-container{
  width:100%;max-width:720px;position:relative;z-index:10;
  animation:lp-in .8s ease both;
}
.lp-badge-top{
  display:inline-flex;align-items:center;gap:8px;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:100px;
  padding:8px 16px;margin-bottom:32px;
  font-size:9px;font-weight:700;letter-spacing:2.2px;color:#fff;
  backdrop-filter:blur(14px);transition:all .3s ease;animation:lp-item-fade .6s ease both;animation-delay:.1s;
}
.lp-badge-dot{width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 12px rgba(255,255,255,.5);}
.lp-title{
  font-family:'Bebas Neue',sans-serif;font-size:clamp(40px,8vw,68px);
  letter-spacing:5px;color:#ffffff;margin-bottom:12px;line-height:1;
  text-shadow:0 0 20px rgba(255,255,255,.15);
  animation:lp-in .8s ease both;animation-delay:.1s;
  font-weight:900;
}
.lp-subtitle{font-size:11px;color:rgba(255,255,255,.75);letter-spacing:1.8px;margin-bottom:48px;animation:lp-item-fade .6s ease both;animation-delay:.2s;text-transform:uppercase;font-weight:600;}
.lp-box{
  background:rgba(20,20,20,.9);border:1px solid rgba(255,255,255,.12);border-radius:16px;
  overflow:hidden;margin-bottom:24px;
  backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,.5);transition:all .3s ease;
  animation:lp-box-slide .6s ease both;font-size:14px;
}
.lp-box:hover{border-color:rgba(255,255,255,.22);box-shadow:0 16px 48px rgba(0,0,0,.65),0 0 20px rgba(255,255,255,.08);transform:translateY(-3px);}
.lp-box-hdr{
  padding:18px 24px;border-bottom:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.4);
  font-size:8.5px;font-weight:800;letter-spacing:2.5px;color:#fff;text-transform:uppercase;tracking:wide;
}
.lp-box-body{padding:24px;}
.lp-item{display:flex;gap:14px;margin-bottom:16px;animation:lp-item-fade .6s ease both;}
.lp-item:last-child{margin-bottom:0;}
.lp-item-num{
  width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.2);
  display:flex;align-items:center;justify-content:center;
  font-size:9px;font-weight:800;color:#fff;flex-shrink:0;margin-top:1px;
}
.lp-item-text{font-size:11.5px;color:rgba(255,255,255,.82);line-height:1.8;}
.lp-item-text strong{color:#ffffff;font-weight:700;}
.lp-laws-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
@media(max-width:600px){.lp-laws-grid{grid-template-columns:1fr}}
.lp-law{background:rgba(30,30,30,.8);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;transition:all .3s ease;}
.lp-law:hover{border-color:rgba(255,255,255,.25);box-shadow:0 0 16px rgba(255,255,255,.1);transform:translateY(-2px);}
.lp-law-region{font-size:7.8px;font-weight:900;letter-spacing:2.2px;color:rgba(255,255,255,.7);margin-bottom:6px;text-transform:uppercase;}
.lp-law-text{font-size:10.5px;color:rgba(255,255,255,.78);line-height:1.5;}
.lp-accept-btn{
  width:100%;padding:16px;
  font-family:'Bebas Neue',sans-serif;font-size:13px;font-weight:900;letter-spacing:2.5px;
  background:#ffffff;border:1.5px solid rgba(255,255,255,.9);border-radius:100px;
  color:#000;cursor:pointer;transition:all .3s cubic-bezier(.25,.46,.45,.94);text-transform:uppercase;
  box-shadow:0 0 24px rgba(255,255,255,.2),0 8px 32px rgba(0,0,0,.45);
  animation:lp-box-slide .8s ease both;animation-delay:.4s;
}
.lp-accept-btn:hover{transform:scale(1.05);box-shadow:0 0 40px rgba(255,255,255,.35),0 12px 48px rgba(0,0,0,.6);background:#f5f5f5;}
.lp-accept-btn:active{transform:scale(.98);}
.lp-footer-text{font-size:8px;color:rgba(255,255,255,.55);letter-spacing:1.2px;text-align:center;margin-top:18px;animation:lp-item-fade .6s ease both;animation-delay:.5s;text-transform:uppercase;font-weight:600;}

.lp-big-circle{
  position:absolute;
  border:2px solid #ffffff;
  border-radius:50%;
  top:50%;left:50%;
  transform:translate(-50%,-50%);
  width:480px;
  height:480px;
  animation:rotate-smooth 20s linear infinite reverse;
  box-shadow:0 0 50px rgba(255,255,255,.45), 0 0 110px rgba(0,0,0,.75), inset 0 0 70px rgba(0,0,0,.55);
  opacity:.85;
  z-index:2;
}

/* ── LOGIN PAGE ── */
@keyframes lg-in{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes lg-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes lg-shift-gradient{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes lg-particle-1{0%{opacity:0;transform:translate(0,0) scale(0)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(120px,-280px) scale(0)}}
@keyframes lg-particle-2{0%{opacity:0;transform:translate(0,0) scale(0)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(-140px,-240px) scale(0)}}
@keyframes lg-particle-3{0%{opacity:0;transform:translate(0,0) scale(0)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(180px,120px) scale(0)}}
@keyframes lg-particle-4{0%{opacity:0;transform:translate(0,0) scale(0)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(-160px,150px) scale(0)}}
@keyframes lg-particle-5{0%{opacity:0;transform:translate(0,0) scale(0)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(0px,-260px) scale(0)}}
@keyframes lg-morph-orb{0%{border-radius:60% 40% 30% 70%}25%{border-radius:30% 60% 70% 40%}50%{border-radius:70% 30% 40% 60%}75%{border-radius:40% 70% 60% 30%}100%{border-radius:60% 40% 30% 70%}}
@keyframes lg-text-glow{0%,100%{text-shadow:0 0 8px rgba(255,255,255,.6)}50%{text-shadow:0 0 16px rgba(255,255,255,.9)}}

.lg-wrap{
  min-height:100vh;
  display:flex;align-items:center;justify-content:center;
  padding:20px;position:relative;overflow:hidden;
  background:linear-gradient(-45deg, #000, #0a0a0a, #000, #050505);
  background-size:300% 300%;
  animation:lg-shift-gradient 12s ease infinite;
}
.lg-wrap::after{
  content:'';
  position:absolute;inset:0;
  background:repeating-linear-gradient(
    0deg,
    rgba(0,0,0,.15),
    rgba(0,0,0,.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events:none;
  z-index:0;
  animation:lg-scanline 8s linear infinite;
}
@keyframes lg-scanline{
  0%{transform:translateY(0)}
  100%{transform:translateY(10px)}
}
.lg-wrap::before{
  content:'';
  position:absolute;inset:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(255,255,255,.01) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.01) 1px, transparent 1px);
  background-size:64px 64px;
  opacity:.18;
}
.lg-bg{
  position:absolute;inset:0;pointer-events:none;z-index:1;
  background:radial-gradient(ellipse at 70% 50%, rgba(255,255,255,.03) 0%, transparent 50%);
}
.lg-diamond{
  position:absolute;right:10%;top:50%;transform:translateY(-50%) rotate(45deg);z-index:2;
  width:400px;height:400px;border:1px solid rgba(255,255,255,.08);
  animation:lg-float 8s ease-in-out infinite;
}
.lg-diamond::before{content:'';position:absolute;inset:50px;border:1px solid rgba(255,255,255,.05);}
.lg-diamond::after{content:'';position:absolute;inset:100px;border:1px solid rgba(255,255,255,.04);}
.lg-card{
  width:100%;max-width:440px;position:relative;z-index:11;
  background:var(--glass);border:1px solid var(--border);
  border-radius:24px;overflow:hidden;
  animation:lg-in .6s ease both;backdrop-filter:blur(12px);box-shadow:var(--shadow);transition:all .3s ease;
}
.lg-card:hover{border-color:rgba(255,255,255,.18);box-shadow:0 16px 44px rgba(0,0,0,.46),0 0 16px rgba(255,255,255,.06);transform:translateY(-2px);}
.lg-card-top{padding:32px 32px 28px;border-bottom:1px solid rgba(255,255,255,.08);}
.lg-logo{
  font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:8px;color:#ffffff;
  animation:lg-text-glow 3s ease-in-out infinite;
}
.lg-logo-sub{font-size:9px;letter-spacing:3px;color:#ffffff;margin-top:2px;opacity:.8;animation:lg-in .6s ease both;animation-delay:.2s;}
.lg-card-body{padding:32px;}
.lg-red-circle{
  position:absolute;
  width:480px;height:480px;
  border-radius:50%;
  bottom:10%;
  right:5%;
  border:1.5px solid rgba(239,68,68,.6);
  background:radial-gradient(circle at 30% 30%, rgba(239,68,68,.08), transparent 70%);
  box-shadow:0 0 40px rgba(239,68,68,.25), 0 0 80px rgba(239,68,68,.12), inset 0 0 50px rgba(239,68,68,.05);
  animation:rotate-smooth 25s linear infinite, lg-float 6s ease-in-out infinite;
  z-index:1;
  animation-delay:0s, 1s;
  opacity:.7;
}
.lg-particle{
  position:absolute;width:8px;height:8px;border-radius:50%;
  background:#ffffff;box-shadow:0 0 12px rgba(255,255,255,.8);
  pointer-events:none;z-index:0;
}
.lg-particles-container{position:absolute;inset:0;pointer-events:none;z-index:1;}

.lg-particle-1{animation:lg-particle-1 4s ease-out infinite;left:40%;top:20%;animation-delay:0s;}
.lg-particle-2{animation:lg-particle-2 4s ease-out infinite;left:55%;top:30%;animation-delay:.3s;}
.lg-particle-3{animation:lg-particle-3 4s ease-out infinite;left:45%;top:25%;animation-delay:.6s;}
.lg-particle-4{animation:lg-particle-4 4s ease-out infinite;left:50%;top:35%;animation-delay:.9s;}
.lg-particle-5{animation:lg-particle-5 4s ease-out infinite;left:48%;top:28%;animation-delay:1.2s;}

.lg-morph-orb{
  position:absolute;width:140px;height:140px;border-radius:60% 40% 30% 70%;background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.12);z-index:1;pointer-events:none;animation:lg-morph-orb 6s ease-in-out infinite;
  box-shadow:0 0 40px rgba(255,255,255,.08);
}
.lg-morph-orb-1{bottom:15%;left:8%;animation-delay:0s;}
.lg-morph-orb-2{top:10%;right:12%;animation-delay:2s;}
.lg-err{
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:12px;
  padding:12px 16px;margin-bottom:20px;
  font-size:11px;color:#ffffff;letter-spacing:.5px;
}
.lg-label{font-size:9px;font-weight:700;letter-spacing:2px;color:#ffffff;margin-bottom:10px;text-transform:uppercase;animation:lg-in .6s ease both;}\n.lg-label:nth-of-type(1){animation-delay:.35s;}\n.lg-label:nth-of-type(2){animation-delay:.45s;}
.lg-field-wrap{
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);
  border-radius:12px;padding:14px 18px;margin-bottom:20px;
  transition:all .3s ease;backdrop-filter:blur(12px);
}
.lg-field-wrap:focus-within{border-color:var(--accent);box-shadow:0 0 8px rgba(255,255,255,.18),0 0 18px rgba(255,255,255,.18);}
.lg-field-static{font-size:12px;color:#ffffff;font-family:'JetBrains Mono',monospace;animation:lg-in .6s ease both;animation-delay:.4s;}
.lg-field-hint{font-size:9px;color:#ffffff;margin-top:4px;opacity:.7;animation:lg-in .6s ease both;animation-delay:.41s;}
.lg-input{
  width:100%;background:transparent;border:none;outline:none;
  font-family:'JetBrains Mono',monospace;font-size:13px;
  color:#ffffff;letter-spacing:2px;
  animation:lg-in .6s ease both;animation-delay:.5s;
}
.lg-input::placeholder{color:#ffffff;opacity:.4;}
.lg-btn{
  width:100%;padding:16px;
  font-family:'Bebas Neue',sans-serif;font-size:13px;font-weight:900;
  letter-spacing:2.5px;background:#ffffff;border:1px solid rgba(255,255,255,.18);
  border-radius:100px;color:#000;cursor:pointer;
  transition:all .3s ease;text-transform:uppercase;
  box-shadow:0 0 12px rgba(255,255,255,.12),0 8px 24px rgba(0,0,0,.32);
  animation:lg-in .7s ease both;animation-delay:.55s;
}
.lg-btn:hover:not(:disabled){transform:scale(1.04);box-shadow:0 0 16px rgba(255,255,255,.2),0 0 24px rgba(255,255,255,.14),0 12px 36px rgba(0,0,0,.42);filter:brightness(1.04);}
.lg-btn:disabled{opacity:.65;cursor:not-allowed;transform:none;box-shadow:none;}
.lg-status{
  margin-top:20px;display:flex;align-items:center;
  justify-content:center;gap:8px;
  animation:lg-in .6s ease both;animation-delay:.6s;
}
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
@keyframes diamond-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes hero-float-text{0%,100%{transform:translate3d(0,-50%,0)}50%{transform:translate3d(0,calc(-50% - 8px),0)}}
@keyframes hero-typing{from{width:0}to{width:100%}}
@keyframes hero-grid-drift{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(-14px,-10px,0)}100%{transform:translate3d(0,0,0)}}
@keyframes hero-glow-shift{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(18px,-12px,0) scale(1.06)}100%{transform:translate3d(0,0,0) scale(1)}}
@keyframes hero-scan-sweep{0%{transform:translate3d(-8%, -120%, 0) rotate(8deg)}100%{transform:translate3d(18%, 140%, 0) rotate(8deg)}}
@keyframes hero-noise-pulse{0%,100%{opacity:.18}50%{opacity:.3}}
@keyframes hero-star-drift{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(-10px,8px,0)}100%{transform:translate3d(0,0,0)}}
@keyframes hero-twinkle{0%,100%{opacity:.35}50%{opacity:.8}}
@keyframes hero-wire-float{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}50%{transform:translate3d(6px,-8px,0) rotate(2deg)}}
@keyframes hero-right-pulse{0%,100%{opacity:.18}50%{opacity:.32}}
@keyframes hero-right-glow{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
@keyframes live-bubble-float-1{0%{transform:translate3d(0,100vh,0) scale(0)}25%{transform:translate3d(45px,50vh,0) scale(1)}50%{transform:translate3d(90px,0,0) scale(.8)}75%{transform:translate3d(-30px,-40vh,0) scale(.6)}100%{transform:translate3d(0,-100vh,0) scale(0)}}
@keyframes live-bubble-float-2{0%{transform:translate3d(-80px,100vh,0) scale(0)}25%{transform:translate3d(-20px,45vh,0) scale(.9)}50%{transform:translate3d(60px,10vh,0) scale(1)}75%{transform:translate3d(100px,-50vh,0) scale(.7)}100%{transform:translate3d(150px,-100vh,0) scale(0)}}
@keyframes live-bubble-float-3{0%{transform:translate3d(150px,100vh,0) scale(0)}25%{transform:translate3d(80px,50vh,0) scale(.85)}50%{transform:translate3d(-40px,5vh,0) scale(.95)}75%{transform:translate3d(-120px,-35vh,0) scale(.65)}100%{transform:translate3d(-180px,-100vh,0) scale(0)}}
@keyframes live-bubble-float-4{0%{transform:translate3d(60px,100vh,0) scale(0)}25%{transform:translate3d(120px,55vh,0) scale(.8)}50%{transform:translate3d(40px,15vh,0) scale(1)}75%{transform:translate3d(-80px,-45vh,0) scale(.7)}100%{transform:translate3d(-120px,-100vh,0) scale(0)}}
@keyframes live-bubble-float-5{0%{transform:translate3d(-120px,100vh,0) scale(0)}25%{transform:translate3d(-40px,40vh,0) scale(.9)}50%{transform:translate3d(100px,8vh,0) scale(.98)}75%{transform:translate3d(160px,-48vh,0) scale(.6)}100%{transform:translate3d(200px,-100vh,0) scale(0)}}
@keyframes live-bubble-pulse{0%,100%{opacity:.15}50%{opacity:.35}}
@keyframes rotate-ring-1{from{transform:rotate(0deg) scale(1)}to{transform:rotate(360deg) scale(1.05)}}
@keyframes rotate-ring-2{from{transform:rotate(360deg) scale(.9)}to{transform:rotate(0deg) scale(.95)}}
@keyframes rotate-smooth{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes glow-pulse-1{0%,100%{opacity:.2;filter:drop-shadow(0 0 12px rgba(255,255,255,.4))}50%{opacity:.6;filter:drop-shadow(0 0 32px rgba(255,255,255,.8))}}
@keyframes glow-pulse-2{0%,100%{opacity:.15;filter:drop-shadow(0 0 8px rgba(255,255,255,.3))}50%{opacity:.55;filter:drop-shadow(0 0 28px rgba(255,255,255,.7))}}
@keyframes glow-pulse-big{0%,100%{box-shadow:0 0 50px rgba(255,255,255,.4), 0 0 110px rgba(0,0,0,.75), inset 0 0 70px rgba(0,0,0,.55)}50%{box-shadow:0 0 65px rgba(255,255,255,.55), 0 0 130px rgba(0,0,0,.8), inset 0 0 85px rgba(0,0,0,.6)}}
@keyframes morph-orb{0%{border-radius:50% 50% 50% 50%;transform:scale(1) rotate(0deg)}25%{border-radius:45% 55% 48% 52%;transform:scale(1.08) rotate(90deg)}50%{border-radius:50% 50% 50% 50%;transform:scale(1) rotate(180deg)}75%{border-radius:52% 48% 55% 45%;transform:scale(1.08) rotate(270deg)}100%{border-radius:50% 50% 50% 50%;transform:scale(1) rotate(360deg)}}


.wx-hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:flex-start;justify-content:center;
  padding:80px 100px;
  background:#000;
  position:relative;overflow:hidden;
}
.wx-hero .hero-screen-fx{
  position:absolute;
  inset:0;
  pointer-events:none;
  z-index:0;
}
.wx-hero .hero-starfield{
  position:absolute;
  inset:0;
  pointer-events:none;
  z-index:0;
  overflow:hidden;
}
.live-particle-burst{
  position:absolute;
  inset:0;
  pointer-events:none;
  z-index:0;
  overflow:hidden;
}
.live-particle{
  position:absolute;
  width:4px;
  height:4px;
  border-radius:50%;
  background:rgba(255,255,255,.7);
  left:50%;
  bottom:0;
  box-shadow:0 0 6px rgba(255,255,255,.4);
  animation:live-bubble-pulse 8s ease-in-out infinite;
}
.live-particle:nth-child(1){
  animation:live-bubble-float-1 8s ease-in cubic-bezier(.25,.25,.75,.75) infinite;
  animation-delay:0s;
}
.live-particle:nth-child(2){
  animation:live-bubble-float-2 9s ease-in cubic-bezier(.25,.25,.75,.75) infinite;
  animation-delay:1s;
  width:5px;
  height:5px;
}
.live-particle:nth-child(3){
  animation:live-bubble-float-3 10s ease-in cubic-bezier(.25,.25,.75,.75) infinite;
  animation-delay:2s;
  width:3.5px;
  height:3.5px;
}
.live-particle:nth-child(4){
  animation:live-bubble-float-4 8.5s ease-in cubic-bezier(.25,.25,.75,.75) infinite;
  animation-delay:.5s;
  width:4.5px;
  height:4.5px;
}
.live-particle:nth-child(5){
  animation:live-bubble-float-5 9.5s ease-in cubic-bezier(.25,.25,.75,.75) infinite;
  animation-delay:1.5s;
  width:3.8px;
  height:3.8px;
}

.glow-rings-container{
  position:absolute;
  width:100%;
  height:100%;
  inset:0;
  pointer-events:none;
  z-index:0;
}

.glow-ring{
  position:absolute;
  border:1px solid rgba(255,255,255,.3);
  border-radius:50%;
  left:50%;
  top:50%;
  transform-origin:center;
  box-shadow:0 0 20px rgba(255,255,255,.2);
}

.glow-ring-1{
  width:240px;
  height:240px;
  margin-left:-120px;
  margin-top:-120px;
  animation:rotate-ring-1 12s linear infinite, glow-pulse-1 6s ease-in-out infinite;
}

.glow-ring-2{
  width:360px;
  height:360px;
  margin-left:-180px;
  margin-top:-180px;
  animation:rotate-ring-2 16s linear infinite, glow-pulse-2 7s ease-in-out infinite;
  animation-delay:1s;
  border-color:rgba(255,255,255,.2);
}

.glow-ring-3{
  width:480px;
  height:480px;
  margin-left:-240px;
  margin-top:-240px;
  animation:rotate-smooth 20s linear infinite reverse;
  border-color:#ffffff;
  border-width:2px;
  opacity:1;
  box-shadow:0 0 50px rgba(255,255,255,.45), 0 0 110px rgba(0,0,0,.75), inset 0 0 70px rgba(0,0,0,.55);
}

.glow-orb{
  position:absolute;
  border-radius:50%;
  width:80px;
  height:80px;
  background:radial-gradient(circle at 35% 35%, rgba(255,255,255,.3), rgba(255,255,255,.05));
  box-shadow:0 0 48px rgba(255,255,255,.25), inset -8px -8px 24px rgba(0,0,0,.4);
  animation:morph-orb 8s ease-in-out infinite;
}

.glow-orb-1{
  right:18%;
  top:24%;
  width:100px;
  height:100px;
  animation:morph-orb 9s ease-in-out infinite, glow-pulse-1 5s ease-in-out infinite;
}

.glow-orb-2{
  left:12%;
  bottom:20%;
  width:70px;
  height:70px;
  animation:morph-orb 11s ease-in-out infinite reverse, glow-pulse-2 6s ease-in-out infinite;
  animation-delay:2s;
}

.wx-hero .hero-starfield::before,
.wx-hero .hero-starfield::after{
  content:'';
  position:absolute;
  inset:-8%;
  background-image:
    radial-gradient(circle at 8% 12%, rgba(255,255,255,.85) 0 1px, transparent 1.5px),
    radial-gradient(circle at 14% 34%, rgba(255,255,255,.4) 0 1px, transparent 1.5px),
    radial-gradient(circle at 22% 58%, rgba(255,255,255,.65) 0 1px, transparent 1.5px),
    radial-gradient(circle at 28% 18%, rgba(255,255,255,.32) 0 1px, transparent 1.5px),
    radial-gradient(circle at 36% 72%, rgba(255,255,255,.55) 0 1px, transparent 1.5px),
    radial-gradient(circle at 44% 26%, rgba(255,255,255,.38) 0 1px, transparent 1.5px),
    radial-gradient(circle at 52% 48%, rgba(255,255,255,.62) 0 1px, transparent 1.5px),
    radial-gradient(circle at 58% 14%, rgba(255,255,255,.28) 0 1px, transparent 1.5px),
    radial-gradient(circle at 66% 66%, rgba(255,255,255,.48) 0 1px, transparent 1.5px),
    radial-gradient(circle at 74% 24%, rgba(255,255,255,.42) 0 1px, transparent 1.5px),
    radial-gradient(circle at 82% 54%, rgba(255,255,255,.7) 0 1px, transparent 1.5px),
    radial-gradient(circle at 90% 18%, rgba(255,255,255,.35) 0 1px, transparent 1.5px),
    radial-gradient(circle at 12% 84%, rgba(255,255,255,.55) 0 1px, transparent 1.5px),
    radial-gradient(circle at 24% 92%, rgba(255,255,255,.32) 0 1px, transparent 1.5px),
    radial-gradient(circle at 68% 88%, rgba(255,255,255,.42) 0 1px, transparent 1.5px),
    radial-gradient(circle at 88% 76%, rgba(255,255,255,.52) 0 1px, transparent 1.5px);
  opacity:.58;
  animation:hero-star-drift 22s linear infinite;
}
.wx-hero .hero-starfield::after{
  transform:scale(1.08);
  opacity:.36;
  filter:blur(.3px);
  animation-duration:30s;
  animation-direction:reverse;
}
.hero-constellation{
  position:absolute;
  width:260px;
  height:220px;
  pointer-events:none;
  opacity:.62;
  animation:hero-wire-float 14s ease-in-out infinite;
  z-index:1;
}
.hero-constellation svg{
  width:100%;
  height:100%;
  overflow:visible;
}
.hero-constellation polygon,
.hero-constellation line{
  stroke:rgba(255,255,255,.22);
  stroke-width:1;
  fill:none;
}
.hero-constellation circle{
  fill:rgba(255,255,255,.28);
}
.hero-constellation-a{
  left:4%;
  bottom:2%;
}
.hero-constellation-b{
  right:4%;
  top:1%;
  width:220px;
  height:180px;
  animation-duration:17s;
  animation-direction:reverse;
}
.hero-constellation-a line:first-child,
.hero-constellation-b line:first-child{
  stroke:rgba(255,255,255,.16);
}
.wx-hero .hero-screen-fx::before{
  content:'';
  position:absolute;
  inset:-30% -10%;
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(255,255,255,.02) 0px,
      rgba(255,255,255,.02) 1px,
      transparent 1px,
      transparent 5px
    );
  opacity:.04;
  mix-blend-mode:screen;
  animation:hero-noise-pulse 4.2s ease-in-out infinite;
}
.wx-hero .hero-screen-fx::after{
  content:'';
  position:absolute;
  top:-35%;
  left:-20%;
  width:42%;
  height:170%;
  background:linear-gradient(180deg, transparent 0%, rgba(255,255,255,.02) 30%, rgba(255,255,255,.045) 48%, rgba(255,255,255,.02) 66%, transparent 100%);
  filter:blur(12px);
  opacity:.22;
  animation:hero-scan-sweep 9s linear infinite;
  mix-blend-mode:screen;
}
.wx-hero::before{
  content:'';
  position:absolute;inset:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(255,255,255,.01) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.01) 1px, transparent 1px);
  background-size:64px 64px;
  opacity:.05;
  mask-image:radial-gradient(circle at center, black 42%, transparent 92%);
  animation:hero-grid-drift 18s ease-in-out infinite;
  z-index:0;
}
.wx-hero::after{
  content:'';
  position:absolute;
  inset:-12%;
  pointer-events:none;
  background:
    radial-gradient(circle at 15% 22%, rgba(255,255,255,.09), transparent 16%),
    radial-gradient(circle at 72% 18%, rgba(255,255,255,.06), transparent 14%),
    radial-gradient(circle at 45% 76%, rgba(255,255,255,.05), transparent 18%);
  filter:blur(12px);
  opacity:.18;
  animation:hero-glow-shift 14s ease-in-out infinite;
  z-index:0;
}
.hero-bg-right{
  position:absolute;right:0;top:0;bottom:0;width:58%;
  background:rgba(0,0,0,.95);
  border-left:1px solid rgba(255,255,255,.06);
  backdrop-filter:blur(12px);
  z-index:0;
  animation:hero-right-pulse 10s ease-in-out infinite;
  box-shadow:inset 0 0 60px rgba(255,255,255,.02);
}
.hero-bg-right::before{
  content:'';
  position:absolute;
  inset:20% 14%;
  background:linear-gradient(90deg, transparent 0%, rgba(255,255,255,.06) 45%, rgba(255,255,255,.12) 50%, rgba(255,255,255,.06) 55%, transparent 100%);
  transform:skewX(-12deg);
  opacity:.28;
  animation:hero-right-glow 8s linear infinite;
  pointer-events:none;
}
.hero-bg-diamond{
  display:none;
  position:absolute;right:10%;top:50%;transform:translateY(-50%) rotate(45deg);
  width:500px;height:500px;border:1px solid rgba(255,255,255,.08);
  pointer-events:none;
  animation:diamond-spin 34s linear infinite;
  z-index:0;
}
.hero-bg-diamond::before{content:'';position:absolute;inset:60px;border:1px solid rgba(255,255,255,.05);}
.hero-bg-diamond::after{content:'';position:absolute;inset:120px;border:1px solid rgba(255,255,255,.04);}
.hero-badge{
  display:inline-flex;align-items:center;gap:10px;
  border:1px solid rgba(255,255,255,.1);border-radius:100px;padding:8px 18px;
  margin-bottom:28px;font-size:10px;font-weight:600;color:var(--text-soft);
  animation:hero-badge-in .6s ease both;letter-spacing:1px;
  background:rgba(255,255,255,.04);backdrop-filter:blur(12px);
}
.hero-badge-dot{width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.45);}
.hero-title{
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(60px,10vw,118px);
  letter-spacing:7px;color:#e2e8f0;line-height:.9;
  margin-bottom:22px;
  animation:hero-in .8s ease both;animation-delay:.1s;
  font-weight:800;
  text-shadow:0 0 30px rgba(255,255,255,.14);
  position:relative;
  z-index:1;
}
.hero-title::before{
  content:'WHITENX';
  position:absolute;
  left:-8px;
  top:50%;
  font-size:clamp(80px,15vw,180px);
  letter-spacing:12px;
  color:rgba(255,255,255,.02);
  filter:blur(16px);
  white-space:nowrap;
  z-index:-1;
  animation:hero-float-text 10s ease-in-out infinite;
  display:none;
}
.hero-desc{
  font-size:16px;color:#f8fafc;line-height:1.95;max-width:640px;
  margin-bottom:44px;
  animation:hero-in .8s ease both;animation-delay:.2s;
}
.hero-status-row{
  display:flex;align-items:center;gap:12px;flex-wrap:wrap;
  margin:-10px 0 24px;
  animation:hero-in .8s ease both;animation-delay:.25s;
}
.hero-status-chip{
  display:inline-flex;align-items:center;gap:8px;
  padding:8px 15px;border-radius:999px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.06);
  color:rgba(255,255,255,.85);
  font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;
  backdrop-filter:blur(10px);
}
.hero-status-chip.live{
  border-color:rgba(255,255,255,.2);
  box-shadow:0 0 12px rgba(255,255,255,.12);
}
.hero-status-dot{
  width:6px;height:6px;border-radius:50%;
  background:#fff;
  box-shadow:0 0 10px rgba(255,255,255,.3);
  animation:gt-pulse 1.6s ease-in-out infinite;
}
.hero-typing{
  display:inline-flex;align-items:center;
  max-width:100%;
  overflow:hidden;white-space:nowrap;
  font-family:'JetBrains Mono',monospace;
  font-size:11px;letter-spacing:1.4px;
  color:rgba(226,232,240,.72);
}
.hero-typing span{
  display:inline-block;
  overflow:hidden;white-space:nowrap;
  border-right:1px solid rgba(255,255,255,.5);
  width:0;
  animation:hero-typing 3.6s steps(38,end) .5s forwards, gt-blink .9s step-end infinite;
}
.hero-features{
  display:flex;gap:8px;flex-wrap:wrap;margin-bottom:48px;
  animation:hero-in .8s ease both;animation-delay:.3s;
}
.hero-feature{
  font-size:10px;font-weight:700;letter-spacing:1.7px;color:#fff;
  border:1px solid rgba(255,255,255,.12);padding:8px 16px;border-radius:100px;
  text-transform:uppercase;background:rgba(255,255,255,.03);backdrop-filter:blur(10px);transition:all .3s ease;
}
.hero-feature:hover{color:#fff;border-color:rgba(255,255,255,.24);box-shadow:0 0 10px rgba(255,255,255,.1),0 0 14px rgba(255,255,255,.08);transform:translateY(-1px);}
.hero-input-row{
  position:relative;
  display:grid;grid-template-columns:1fr auto;align-items:center;gap:20px;
  width:100%;max-width:none;
  padding:24px 28px;justify-content:space-between;
  background:rgba(18,18,20,.94);border:1px solid rgba(255,255,255,.12);
  border-radius:999px;backdrop-filter:blur(34px);box-shadow:0 24px 72px rgba(0,0,0,.45);
  animation:hero-in .8s ease both;animation-delay:.4s;
  overflow:hidden;
}
.hero-input-row::before{
  content:'';
  position:absolute;inset:0;
  background:radial-gradient(circle at 20% 50%, rgba(255,255,255,.08), transparent 30%);
  opacity:.4;
  pointer-events:none;
}
.hero-input-row::after{
  content:'';
  position:absolute;left:-40%;top:0;bottom:0;width:120%;
  background:linear-gradient(90deg, transparent 0%, rgba(255,255,255,.12) 25%, rgba(255,255,255,.24) 50%, rgba(255,255,255,.12) 75%, transparent 100%);
  transform:skewX(-18deg);
  opacity:.32;
  animation:search-glow 5.5s linear infinite;
  pointer-events:none;
}
@keyframes search-glow{0%{transform:translateX(-100%) skewX(-18deg);}100%{transform:translateX(100%) skewX(-18deg);}}
.wx-input{
  width:100%;min-width:0;font-family:'JetBrains Mono',monospace;font-size:16px;
  padding:20px 24px;background:#090909;
  border:1px solid rgba(255,255,255,.14);border-radius:14px;
  color:#fff;outline:none;transition:border-color .2s,background .2s,transform .2s;
}
.wx-input:focus{border-color:rgba(255,255,255,.5);box-shadow:0 0 24px rgba(255,255,255,.12);background:#0b0b0b;transform:scale(1.001);}
.wx-input::placeholder{color:rgba(255,255,255,.42);}
.wx-scan-btn{
  font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:800;
  letter-spacing:1.8px;padding:20px 42px;border-radius:999px;
  border:1px solid rgba(255,255,255,.18);background:#ffffff;
  color:#000;cursor:pointer;transition:all .2s,transform .2s;white-space:nowrap;
}
.wx-scan-btn:hover{background:#f2f2f2;color:#000;transform:translateY(-1px);}
.hero-warn{
  display:flex;align-items:center;gap:8px;margin-top:16px;
  font-size:10px;color:rgba(255,255,255,.68);
  animation:hero-in .8s ease both;animation-delay:.5s;
}
.hero-warn-dot{width:5px;height:5px;border-radius:50%;background:#fff;flex-shrink:0;box-shadow:0 0 10px rgba(255,255,255,.18);}
.hero-terminal{
  margin-top:18px;
  width:100%;max-width:540px;
  border:1px solid rgba(255,255,255,.08);
  border-radius:16px;
  background:rgba(255,255,255,.02);
  backdrop-filter:blur(12px);
  box-shadow:0 8px 24px rgba(0,0,0,.32);
  overflow:hidden;
  animation:hero-in .8s ease both;animation-delay:.56s;
}
.hero-terminal-top{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 14px;
  border-bottom:1px solid rgba(255,255,255,.06);
  background:rgba(255,255,255,.03);
}
.hero-terminal-title{
  font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;
  color:var(--text-dim);
}
.hero-terminal-state{
  font-size:9px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;
  color:var(--text);
  text-shadow:0 0 10px rgba(255,255,255,.12);
}
.hero-terminal-body{
  padding:12px 14px;
  display:flex;flex-direction:column;gap:8px;
}
.hero-log{
  display:flex;gap:10px;align-items:flex-start;
  font-family:'JetBrains Mono',monospace;
  font-size:11px;line-height:1.75;
  color:rgba(255,255,255,.74);
}
.hero-log-tag{
  color:var(--text);
  min-width:36px;
  font-weight:700;
}
.hero-log-text{
  color:rgba(255,255,255,.62);
}
.hero-feature-card{
  background:#0a0a0a;
  border:1px solid rgba(255,255,255,.08);
  border-radius:16px;
  padding:20px;
  transition:all .3s ease;
  box-shadow:0 8px 24px rgba(0,0,0,.24);
  position:relative;
  overflow:hidden;
}
.hero-feature-card::before{
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(135deg, rgba(255,255,255,.05), transparent 35%);
  opacity:0;
  transition:opacity .3s ease;
  pointer-events:none;
}
.hero-feature-card:hover{
  border-color:rgba(255,255,255,.16);
  transform:translateY(-4px);
  box-shadow:0 16px 36px rgba(0,0,0,.38),0 0 18px rgba(255,255,255,.08);
}
.hero-feature-card:hover::before{
  opacity:1;
}
.wx-err{
  font-size:11px;color:#fecaca;background:rgba(239,68,68,.12);
  border:1px solid rgba(239,68,68,.28);border-radius:12px;
  padding:12px 18px;margin-bottom:16px;width:100%;max-width:540px;
  box-shadow:var(--shadow);
}

/* ── REPORT HEADER ── */
.wx-rpt-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:0 0 20px;border-bottom:1px solid rgba(255,255,255,.08);
  margin-bottom:24px;flex-wrap:wrap;gap:12px;
}
.wx-rpt-title{
  font-family:'Bebas Neue',sans-serif;font-size:clamp(24px,3vw,38px);
  letter-spacing:5.5px;color:var(--text);text-shadow:0 0 12px rgba(255,255,255,.1);
}
.wx-rpt-meta{font-size:11px;color:var(--text-dim);margin-top:6px;line-height:1.8;}

/* ── GRIDS ── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
@media(max-width:900px){
  .g2,.g3,.g4{grid-template-columns:1fr 1fr;}
  .wx-hero{padding:60px 24px;}
  .hero-bg-right,.hero-bg-diamond{display:none;}
}
@media(max-width:600px){
  .g2,.g3,.g4{grid-template-columns:1fr;}
  .wx-body{padding:16px;}
  .wx-nav{padding:0 16px;}
  .hero-input-row{flex-direction:column;}
  .wx-scan-btn{width:100%;}
  .hero-title::before{display:none;}
  .hero-status-row{margin:0 0 20px;}
  .hero-typing{font-size:10px;max-width:100%;}
  .hero-terminal{max-width:100%;}
}

/* ── MISC ── */
.mono{font-family:'JetBrains Mono',monospace;}
.dim{color:var(--text-dim);}
.accent{color:var(--text);}

/* ── DASHBOARD ANIM ── */
@keyframes db-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.wx-card{animation:db-in .4s ease both;}

/* ── SECTION DIVIDER ── */
.wx-section-label{
  font-size:9px;font-weight:700;letter-spacing:3px;
  color:var(--text-dim);text-transform:uppercase;
  display:flex;align-items:center;gap:16px;
  margin-bottom:16px;
}
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
      <div className="lp-container" style={{marginTop: 48}}>
        <div className="lp-badge-top">
          <span className="lp-badge-dot" />
          RESTRICTED ACCESS — AUTHORIZED PERSONNEL ONLY
        </div>

        <div className="lp-title">LEGAL<br/>DISCLAIMER</div>
        <div className="lp-subtitle">READ CAREFULLY BEFORE PROCEEDING — ALL ACTIVITY IS MONITORED</div>

        <div className="lp-box">
          <div className="lp-box-hdr">Mandatory Declaration</div>
          <div className="lp-box-body">
            <div style={{fontSize:11,color:'rgba(255,255,255,.72)',marginBottom:20,letterSpacing:'.3px'}}>
              By proceeding, you solemnly declare under penalty of perjury that:
            </div>
            {items.map((item, i) => (
              <div key={i} className="lp-item" style={{animationDelay: `${0.25 + i * 0.05}s`}}>
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
              {laws.map((l, i) => (
                <div key={i} className="lp-law" style={{animation:`lp-item-fade .6s ease-out both`, animationDelay:`${0.35 + i * 0.05}s`}}>
                  <div className="lp-law-region">{l.region}</div>
                  <div className="lp-law-text">{l.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:12,backdropFilter:'blur(12px)',boxShadow:'0 8px 32px rgba(0,0,0,.4)',
          padding:'16px 20px',marginBottom:24,
          display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',
          animation:'lp-box-slide .6s ease-out both',animationDelay:'.55s'
        }}>
          {[{label:'Sessions Monitored',val:'LIVE'},{label:'Jurisdiction',val:'67+ Nations'},{label:'Prosecution Rate',val:'94.2%'}].map((s,i)=>(
            <div key={i} style={{flex:1,minWidth:120,textAlign:'center'}}>
              <div style={{fontSize:7,color:'rgba(255,255,255,.6)',letterSpacing:'2px',marginBottom:4,textTransform:'uppercase'}}>{s.label}</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:'#fff',letterSpacing:2}}>{s.val}</div>
            </div>
          ))}
        </div>

        <button className="lp-accept-btn" onClick={onAccept}>
          I Accept — I Am Authorized & Assume Full Legal Liability
        </button>
        <div className="lp-footer-text">
          SESSION LOGGED &nbsp;·&nbsp; IP RECORDED &nbsp;·&nbsp; {new Date().toISOString()}
        </div>
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

  useEffect(() => {
    if (!locked) return;
    let t = 30;
    setLockTimer(t);
    const iv = setInterval(() => {
      t--; setLockTimer(t);
      if (t <= 0) { clearInterval(iv); setLocked(false); setAttempts(0); }
    }, 1000);
    return () => clearInterval(iv);
  }, [locked]);

  const submit = async e => {
    e.preventDefault();
    if (locked) return;
    setErr(''); setAuth(true);
    await new Promise(r => setTimeout(r, 900));
    const normalized = key.trim().toUpperCase();
    if (normalized !== ACCESS_KEY) {
      const newAtt = attempts + 1;
      setAttempts(newAtt);
      setAuth(false);
      if (newAtt >= 3) {
        setLocked(true);
        setErr('Too many failed attempts — access locked for 30s');
      } else {
        setErr(`Invalid access key — ${3 - newAtt} attempt${3-newAtt===1?'':'s'} remaining`);
      }
      return;
    }
    setAuth(false);
    onLogin();
  };

  return (
    <div className="lg-wrap">
      <div className="lg-bg" />
      <div className="lg-diamond" />
      <div className="lg-red-circle" />
      <div className="lg-particles-container">
        <div className="lg-particle lg-particle-1" />
        <div className="lg-particle lg-particle-2" />
        <div className="lg-particle lg-particle-3" />
        <div className="lg-particle lg-particle-4" />
        <div className="lg-particle lg-particle-5" />
      </div>
      <div className="lg-morph-orb lg-morph-orb-1" />
      <div className="lg-morph-orb lg-morph-orb-2" />
      <div className="lg-card">
        <div className="lg-card-top">
          <div className="lg-logo">WHITENX</div>
          <div className="lg-logo-sub">VULNERABILITY ASSESSMENT PLATFORM</div>
          <div style={{display:'flex',gap:16,marginTop:20,flexWrap:'wrap',animation:'lg-in .6s ease both',animationDelay:'.3s'}}>
            {['RECON','PORT SCAN','CVE MATCH','OSINT'].map((t,i)=>(
              <span key={t} style={{fontSize:8,color:'#ffffff',letterSpacing:'1.5px',fontWeight:600,opacity:.8,transition:'opacity .3s'}}>{t}</span>
            ))}
          </div>
        </div>

        <div className="lg-card-body">
          {err && <div className="lg-err">✗ {err}</div>}

          {locked ? (
            <div style={{textAlign:'center',padding:'32px 0'}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:64,color:'rgba(255,255,255,.18)',letterSpacing:4}}>{lockTimer}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.6)',letterSpacing:'2px',marginTop:8}}>ACCESS LOCKED — WAIT TO RETRY</div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="lg-label">System Identifier</div>
              <div className="lg-field-wrap">
                <div className="lg-field-static">WHITENX-VAPT-CONSOLE</div>
                <div className="lg-field-hint">Authorized terminal — session logging active</div>
              </div>

              <div className="lg-label">Access Key</div>
              <div className="lg-field-wrap">
                <input
                  className="lg-input"
                  type="password"
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="WX-XXXX-XXXX-XXXX-XXXX"
                  autoFocus required disabled={auth}
                  autoComplete="off" spellCheck={false}
                />
              </div>

              <div style={{
                background:'rgba(255,255,255,.03)',border:'1px dashed rgba(255,255,255,.12)',
                borderRadius:12,padding:'12px 16px',marginBottom:24
              }}>
                <div style={{fontSize:8,color:'rgba(255,255,255,.6)',letterSpacing:'2px',marginBottom:6,fontWeight:600}}>KEY FORMAT</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:'rgba(255,255,255,.7)',letterSpacing:3}}>WX — XXXX — XXXX — XXXX — XXXX</div>
              </div>

              <button type="submit" className="lg-btn" disabled={auth}>
                {auth ? 'Verifying...' : 'Authenticate →'}
              </button>
            </form>
          )}

          <div className="lg-status">
            <div className="lg-dot" />
            <span className="lg-status-text">
              {attempts > 0 ? `${attempts} failed attempt${attempts>1?'s':''}` : 'Intrusion detection active'}
            </span>
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
  {id:'recon', short:'RECON', full:'RECONNAISSANCE'},
  {id:'ports', short:'PORTS', full:'PORT SCANNING'},
  {id:'svcfp', short:'SVCFP', full:'SERVICE FINGERPRINT'},
  {id:'vulns', short:'VULNS', full:'VULN DETECTION'},
  {id:'osint', short:'OSINT', full:'OSINT INTELLIGENCE'},
  {id:'ssl',   short:'SSL',   full:'SSL ANALYSIS'},
  {id:'score', short:'SCORE', full:'RISK SCORING'},
];

const GhostTerminal = ({ si, progress, target, apiDone, scanResult, onCancel }) => {
  const [entries,   setEntries]  = useState([]);
  const [counts,    setCounts]   = useState({crit:0,high:0,med:0,low:0});
  const [openPorts, setPorts]    = useState([]);
  const [elapsed,   setElapsed]  = useState(0);
  const [disp,      setDisp]     = useState(0);
  const [done,      setDone]     = useState(false);
  const [csi,       setCSI]      = useState(si||0);

  const endRef   = useRef(null);
  const procRef  = useRef(false);
  const phaseRef = useRef({});

  const now = () => new Date().toLocaleTimeString('en-US',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const push = useCallback(e => setEntries(p=>[...p,{...e,time:now()}]),[]);
  const line = useCallback((pfx,txt) => push({type:'line',pfx,txt}),[push]);
  const cmd  = useCallback(txt => push({type:'cmd',txt}),[push]);
  const sp   = useCallback(()   => push({type:'sp'}),[push]);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}); },[entries]);
  useEffect(()=>{ const t=setInterval(()=>setElapsed(e=>e+1),1000); return()=>clearInterval(t); },[]);
  useEffect(()=>{ setCSI(si); },[si]);
  useEffect(()=>{
    const tgt = apiDone ? progress : Math.min(progress,84);
    setDisp(p => tgt>p ? tgt : p);
  },[progress,apiDone]);

  useEffect(()=>{
    if(apiDone||phaseRef.current[si]) return;
    phaseRef.current[si]=true;
    const scripts=[
      ()=>{ sp(); cmd(`whitenx --target ${target} --mode full`); setTimeout(()=>line('INF','Initializing scan engine v2.4.1'),300); setTimeout(()=>line('INF','CVE database loaded — 48,291 entries'),900); setTimeout(()=>line('OK','Engine ready. Full scan takes 5-6 min...'),1400); setTimeout(()=>{ sp(); cmd(`nmap -sV -sC -T4 ${target}`); },1800); setTimeout(()=>line('INF',`Resolving DNS: ${target}`),2400); setTimeout(()=>line('OK','Host is up — ICMP echo received'),3100); },
      ()=>{ sp(); cmd(`nmap -p- --min-rate 5000 ${target}`); setTimeout(()=>line('INF','SYN scan — 65535 ports'),400); setTimeout(()=>line('INF','Probing common service ranges'),1500); },
      ()=>{ sp(); cmd(`nmap -sV --version-intensity 9 ${target}`); setTimeout(()=>line('INF','Banner grabbing active'),1400); },
      ()=>{ sp(); cmd(`whitenx --cve-match --target ${target}`); setTimeout(()=>line('INF','Querying NVD — matching versions'),400); setTimeout(()=>line('WRN','Potential matches found — verifying'),2500); },
      ()=>{ sp(); cmd(`whitenx --osint ${target}`); setTimeout(()=>line('INF','WHOIS lookup initiated'),400); setTimeout(()=>line('INF','Certificate transparency — crt.sh'),1200); },
      ()=>{ sp(); cmd(`whitenx --ssl-check ${target}`); setTimeout(()=>line('INF','TLS handshake initiated'),400); setTimeout(()=>line('INF','Cipher suite enumeration'),2000); },
      ()=>{ sp(); cmd(`whitenx --risk-score ${target}`); setTimeout(()=>line('INF','Computing CVSS v3.1 base scores'),400); setTimeout(()=>line('INF','Finalizing risk report...'),2000); },
    ];
    scripts[si]?.();
  },[si,apiDone]);

  useEffect(()=>{
    if(!apiDone||!scanResult||procRef.current) return;
    procRef.current=true;
    const r=scanResult;
    const vulns = r.vulnerabilities||[];
    const ports  = r.port_scan?.services||r.port_scan?.open_ports||[];
    let delay=400;
    const d=ms=>{ delay+=ms; return delay; };

    push({type:'sep',time:now()});
    cmd('# SCAN DATA — rendering results');

    ports.forEach((p,i)=>setTimeout(()=>{
      setPorts(prev=>[...prev,{port:p.port,svc:p.service||'unknown'}]);
      line('OK',`PORT ${p.port}/tcp  OPEN  ${p.service||'unknown'}${p.version?` v${p.version}`:''}`);
    }, d(0)+i*380));

    vulns.forEach((v,i)=>{
      const sev=(v.severity||'').toUpperCase();
      setTimeout(()=>{
        if(sev==='CRITICAL'){
          setEntries(p=>[...p,{type:'crit',time:now(),id:v.type||'CRITICAL',port:v.port,rec:v.recommendation}]);
          setCounts(c=>({...c,crit:c.crit+1}));
        } else if(sev==='HIGH'){
          setEntries(p=>[...p,{type:'high',time:now(),id:v.type||'HIGH',port:v.port,rec:v.recommendation}]);
          setCounts(c=>({...c,high:c.high+1}));
        } else if(sev==='MEDIUM'){
          line('WRN',`[MED] ${v.type}  port ${v.port||'N/A'}`);
          setCounts(c=>({...c,med:c.med+1}));
        } else {
          line('INF',`[LOW] ${v.type}  port ${v.port||'N/A'}`);
          setCounts(c=>({...c,low:c.low+1}));
        }
      }, d(0)+i*600);
    });

    setTimeout(()=>{
      sp(); line('OK','══════════ SCAN COMPLETE ══════════');
      setDisp(100); setDone(true);
    },d(2400));
  },[apiDone,scanResult]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const pfxC = {INF:'rgba(255,255,255,.72)',OK:'rgba(255,255,255,.72)',WRN:'rgba(255,255,255,.72)',ERR:'rgba(255,255,255,.72)'};

  return (
    <div style={{position:'fixed',inset:0,background:'#000',zIndex:9999,display:'flex',flexDirection:'column',overflow:'hidden',fontFamily:"'JetBrains Mono',monospace"}}>
      {/* TOP BAR */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56,background:'rgba(0,0,0,.94)',borderBottom:'1px solid rgba(255,255,255,.08)',backdropFilter:'blur(16px)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:18}}>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:'6px',color:'#fff'}}>WHITENX</span>
          <span style={{fontSize:10,color:done?'rgba(255,255,255,.9)':'rgba(255,255,255,.72)',border:`1px solid ${done?'rgba(255,255,255,.3)':'rgba(255,255,255,.1)'}`,padding:'5px 14px',borderRadius:100,letterSpacing:'2px',fontWeight:600,background:'rgba(255,255,255,.04)'}}>
            {done?'SCAN COMPLETE':'SCANNING'}
          </span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:24}}>
              {[{l:'TARGET',v:target},{l:'PHASE',v:`${csi+1}/7`},{l:'THREATS',v:counts.crit+counts.high+counts.med+counts.low},{l:'TIME',v:fmt(elapsed)}].map(s=>(
            <div key={s.l} style={{textAlign:'right'}}>
              <div style={{fontSize:9,color:'rgba(255,255,255,.6)',letterSpacing:'1.5px'}}>{s.l}</div>
              <div style={{fontSize:13,color:'#fff',fontWeight:600}}>{s.v}</div>
            </div>
          ))}
          {!done && (
            <button onClick={onCancel} style={{fontSize:10,color:'#fff',background:'transparent',border:'1px solid rgba(255,255,255,.18)',padding:'8px 16px',borderRadius:100,cursor:'pointer',opacity:0.92,whiteSpace:'nowrap'}}>CANCEL</button>
          )}
        </div>
      </div>

      {/* STATUS BAR */}
      {!done && (
        <div style={{background:'#0a0a0a',borderBottom:'1px solid #111',padding:'10px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#ffffff',display:'inline-block',animation:'gt-pulse 1.5s ease-in-out infinite',flexShrink:0}}/>
            <span style={{fontSize:11,color:'#ffffff',letterSpacing:'1.5px',fontWeight:600}}>{apiDone?'RENDERING RESULTS...':'DEEP SCAN IN PROGRESS — Keep tab open'}</span>
          </div>
          <span style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>Est. time: 5–6 minutes</span>
        </div>
      )}

      <div style={{flex:1,display:'flex',overflow:'hidden',minHeight:0}}>
        {/* PIPELINE */}
        <div style={{width:100,background:'#030303',borderRight:'1px solid #111',padding:'20px 0',display:'flex',flexDirection:'column',gap:4,flexShrink:0}}>
          {STAGES.map((s,i)=>{
            const done2=i<csi,cur=i===csi;
            return (
              <div key={s.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',background:cur?'#0a0a0a':'transparent',borderLeft:cur?'2px solid #fff':'2px solid transparent'}}>
                <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,border:`1px solid ${done2?'#ffffff':cur?'#fff':'rgba(255,255,255,.14)'}`,background:done2?'#ffffff40':cur?'#ffffff20':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {done2&&<div style={{width:4,height:4,borderRadius:'50%',background:'#ffffff'}}/>}
                  {cur&&<div style={{width:4,height:4,borderRadius:'50%',background:'#fff',animation:'gt-pulse 1s ease-in-out infinite'}}/>}
                </div>
                <span style={{fontSize:10,letterSpacing:'1.5px',fontWeight:700,color:done2?'rgba(255,255,255,.8)':cur?'#fff':'rgba(255,255,255,.28)'}}>{s.short}</span>
              </div>
            );
          })}
        </div>

        {/* TERMINAL */}
        <div style={{flex:1,background:'#000',display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 18px',borderBottom:'1px solid #0d0d0d',flexShrink:0}}>
            <span style={{fontSize:12,color:'rgba(255,255,255,.75)'}}>whitenx@probe:<span style={{color:'#fff'}}>~/{target}</span>$</span>
            <span style={{fontSize:9,color:'rgba(255,255,255,.36)',letterSpacing:'1px'}}>{STAGES[csi]?.full}</span>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'14px 18px',scrollbarWidth:'none'}}>
            {entries.map((e,i)=>{
              if(e.type==='sp')  return <div key={i} style={{height:10}}/>;
              if(e.type==='sep') return <div key={i} style={{borderTop:'1px solid #0d0d0d',margin:'12px 0'}}/>;
              if(e.type==='cmd') return (
                <div key={i} className="gt-line" style={{display:'flex',gap:8,marginBottom:10,fontSize:13}}>
                  <span style={{color:'rgba(255,255,255,.4)'}}>$</span>
                  <span style={{color:'rgba(255,255,255,.78)'}}>{e.txt}</span>
                </div>
              );
              if(e.type==='crit') return (
                <div key={i} style={{margin:'10px 0 14px',borderLeft:'2px solid #ffffff',background:'#0a0a0a',padding:'12px 16px',borderRadius:'0 8px 8px 0'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <span style={{fontSize:9,fontWeight:700,letterSpacing:'2px',color:'#ffffff',background:'#1a1a1a',border:'1px solid #333333',padding:'4px 12px',borderRadius:100}}>CRITICAL</span>
                    <span style={{fontSize:12,color:'#ffffff',fontWeight:600}}>{e.id}</span>
                  </div>
                  {e.port&&<div style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>Port: <span style={{color:'#fff'}}>{e.port}</span></div>}
                  {e.rec&&<div style={{fontSize:10,color:'rgba(255,255,255,.6)',marginTop:4}}>{e.rec.substring(0,80)}</div>}
                </div>
              );
              if(e.type==='high') return (
                <div key={i} style={{margin:'8px 0 12px',borderLeft:'2px solid #cccccc',background:'#0a0a0a',padding:'10px 16px',borderRadius:'0 8px 8px 0'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                    <span style={{fontSize:9,fontWeight:700,letterSpacing:'2px',color:'#cccccc',background:'#1a1a1a',border:'1px solid #333333',padding:'4px 10px',borderRadius:100}}>HIGH</span>
                    <span style={{fontSize:12,color:'#cccccc'}}>{e.id}</span>
                  </div>
                  {e.port&&<div style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>Port: <span style={{color:'#fff'}}>{e.port}</span></div>}
                </div>
              );
              const isLast=i===entries.length-1;
              return (
                <div key={i} className="gt-line" style={{display:'flex',gap:8,padding:'2px 0',fontSize:12,lineHeight:1.8}}>
                  <span style={{color:'rgba(255,255,255,.28)',fontSize:10,minWidth:60,flexShrink:0}}>[{e.time}]</span>
                  <span style={{color:pfxC[e.pfx||'INF'],fontWeight:700,fontSize:10,minWidth:32,flexShrink:0}}>{e.pfx||'INF'}</span>
                  <span style={{color:'rgba(255,255,255,.68)'}}>
                    {e.txt}{isLast&&!done&&<span className="gt-cursor">█</span>}
                  </span>
                </div>
              );
            })}
            <div ref={endRef}/>
          </div>
        </div>

        {/* RIGHT PANEL */}
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

      {/* PROGRESS BAR */}
      <div style={{height:40,background:'#030303',borderTop:'1px solid #111',display:'flex',alignItems:'center',padding:'0 24px',gap:14,flexShrink:0}}>
        <span style={{fontSize:10,color:'rgba(255,255,255,.6)',letterSpacing:'1.5px',minWidth:80,fontFamily:'monospace',fontWeight:600}}>
          {done?'COMPLETE':apiDone?'PROCESSING':'SCANNING'}
        </span>
        <div style={{flex:1,height:2,background:'#111',borderRadius:1,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${disp}%`,background:done?'#ffffff':'#ffffff',borderRadius:1,transition:'width .6s ease,background .5s ease'}}/>
        </div>
        <span style={{fontSize:12,fontWeight:700,color:done?'#ffffff':'#fff',minWidth:34,textAlign:'right',fontFamily:'monospace'}}>{disp}%</span>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// DASHBOARD COMPONENTS
// ════════════════════════════════════════════════════════════
const SevBadge = ({ s }) => {
  const map={CRITICAL:'bc',HIGH:'bh',MEDIUM:'bm',LOW:'bl',OPEN:'bc',ENABLED:'bg',MISSING:'bc',ALIVE:'bg',DOWN:'bc'};
  return <span className={`wx-badge ${map[s]||'bn'}`}>{s}</span>;
};

const StatCard = ({ label, val, sub, icon, accent='#fff', delay='0s' }) => (
  <div className="wx-stat" style={{'--stat-accent':accent,animationDelay:delay}}>
    <div className="wx-stat-accent" />
    {icon&&<span className="wx-stat-icon">{icon}</span>}
    <div className="wx-stat-label">{label}</div>
    <div className="wx-stat-val" style={{color:accent}}>{val}</div>
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

const WxTable = ({ cols, rows, empty='No data' }) => (
  <div className="wx-tbl-wrap">
    <table className="wx-tbl">
      <thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead>
      <tbody>
        {rows.length===0
          ?<tr><td colSpan={cols.length} style={{textAlign:'center',color:'rgba(255,255,255,.4)',padding:32}}>{empty}</td></tr>
          :rows}
      </tbody>
    </table>
  </div>
);

// ════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════
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

  const timersRef = useRef([]);
  const progRef   = useRef(null);
  const scanAbortRef = useRef(null);
  const reportRef = useRef(null);
  const idleLockRef = useRef(false);

  // Domain validation function
  const isValidDomain = (input) => {
    const trimmed = input.trim();
    if (!trimmed) return false;
    
    // IP address regex (IPv4)
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipRegex.test(trimmed)) return true;
    
    // Domain name regex
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (domainRegex.test(trimmed)) return true;
    
    // Allow localhost
    if (trimmed === 'localhost' || trimmed.startsWith('localhost:')) return true;
    
    return false;
  };

  // Validation handler with detailed messages
  const validateDomainInput = (input) => {
    const trimmed = input.trim();
    
    if (!trimmed) {
      setDomainValid(null);
      setValidationMsg('');
      return;
    }

    // Check for common spelling mistakes
    if (trimmed.includes(' ')) {
      setDomainValid(false);
      setValidationMsg('❌ Spaces detected — remove them');
      return;
    }

    if (trimmed.includes('//')) {
      setDomainValid(false);
      setValidationMsg('❌ Contains protocol prefix — remove http:// or https://');
      return;
    }

    if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
      setDomainValid(false);
      setValidationMsg('❌ Domain cannot start or end with a dot');
      return;
    }

    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipRegex.test(trimmed)) {
      setDomainValid(true);
      setValidationMsg('✓ Valid IPv4 address');
      return;
    }

    if (trimmed === 'localhost' || trimmed.startsWith('localhost:')) {
      setDomainValid(true);
      setValidationMsg('✓ Valid localhost');
      return;
    }

    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (domainRegex.test(trimmed)) {
      setDomainValid(true);
      setValidationMsg('✓ Valid domain');
      return;
    }

    // Specific error messages for common mistakes
    if (trimmed.includes('_')) {
      setDomainValid(false);
      setValidationMsg('❌ Underscores not allowed in domains — use hyphens instead');
      return;
    }

    if (!trimmed.includes('.') && trimmed !== 'localhost') {
      setDomainValid(false);
      setValidationMsg('❌ Missing domain extension (e.g., .com, .org)');
      return;
    }

    if (/[^a-zA-Z0-9.\-:]/g.test(trimmed)) {
      setDomainValid(false);
      setValidationMsg('❌ Invalid characters detected');
      return;
    }

    setDomainValid(false);
    setValidationMsg('❌ Invalid format — use: example.com or 192.168.1.1');
  };

  useEffect(()=>{ injectCSS(); },[]);

  useEffect(() => {
    const resetActivity = () => {
      setLastActivity(Date.now());
      if (idleLockRef.current) {
        idleLockRef.current = false;
      }
    };

    const events = ['mousemove','mousedown','keydown','touchstart','scroll'];
    events.forEach(evt => window.addEventListener(evt, resetActivity, { passive: true }));

    const idleInterval = setInterval(() => {
      if (Date.now() - lastActivity > 10 * 60 * 1000 && !idleLockRef.current) {
        idleLockRef.current = true;
        setErr('Session expired due to inactivity. Re-authentication required.');
        onSessionExpire();
      }
    }, 15000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, resetActivity));
      clearInterval(idleInterval);
    };
  }, [lastActivity, onSessionExpire]);

  useEffect(() => {
    const blockAction = e => {
      e.preventDefault();
      setErr('Action blocked for security reasons.');
    };

    const blockKey = e => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ['c','s','u','i','j','p','a'].includes(key)) {
        e.preventDefault();
        setErr('Keyboard shortcut disabled.');
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        setErr('Tab hidden — sensitive session activity blocked.');
      }
    };

    window.addEventListener('contextmenu', blockAction);
    document.addEventListener('copy', blockAction);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('keydown', blockKey);

    return () => {
      window.removeEventListener('contextmenu', blockAction);
      document.removeEventListener('copy', blockAction);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('keydown', blockKey);
    };
  }, []);

  const handleScan = async () => {
    if(!domain.trim()){
      setErr('❌ Target field is empty — enter a domain or IP address');
      setDomainValid(false);
      return;
    }
    if(!isValidDomain(domain)){
      setErr('❌ Invalid format — ensure domain is typed correctly (check spelling).');
      setDomainValid(false);
      return;
    }
    setErr('');setResult(null);setLiveRes(null);setJsonData(null);setApiDone(false);
    setScanning(true);setSI(0);setProg(0);
    const scanStart = Date.now();
    const minScanMs = 330000;
    scanAbortRef.current = new AbortController();

    if('Notification' in window && Notification.permission==='default') {
      await Notification.requestPermission();
    }

    const dur=[45000,42000,42000,43000,42000,38000,35000];
    let cum=0;
    timersRef.current=dur.map((d,i)=>{ const t=setTimeout(()=>setSI(i),cum); cum+=d; return t; });
    progRef.current=setInterval(()=>setProg(p=>p>=84?84:+(p+0.087).toFixed(3)),250);

    try {
      const res=await fetch(`${API_BASE}/scan/full?target=${domain}`,{
        method:'GET',
        headers:{
          'Accept':'application/json',
          'x-access-token': ACCESS_KEY,
        },
        signal: scanAbortRef.current?.signal,
      });
      if(!res.ok) throw new Error(`Scan failed: ${res.status}`);
      const data=await res.json();
      timersRef.current.forEach(clearTimeout);
      clearInterval(progRef.current);
      setSI(6);setProg(90);setApiDone(true);setLiveRes(data);
      setLastActivity(Date.now());

      if('Notification' in window && Notification.permission==='granted') {
        const vulns=data.vulnerabilities||[];
        const crit=vulns.filter(v=>v.severity==='CRITICAL').length;
        const high=vulns.filter(v=>v.severity==='HIGH').length;
        new Notification('⚡ WHITENX — Scan Complete', {
          body:`Target: ${domain}\n${crit} Critical  ${high} High\nClick to view report →`,
          tag:'whitenx-scan',requireInteraction:true,
        });
      }

      const remaining = Math.max(0, minScanMs - (Date.now() - scanStart));
      const completionTimer = setTimeout(()=>{ setScanning(false);setJsonData(data);setResult(data); scanAbortRef.current = null; }, Math.max(4200, remaining));
      timersRef.current.push(completionTimer);
    } catch(e){
      timersRef.current.forEach(clearTimeout);
      clearInterval(progRef.current);
      if (e.name === 'AbortError') {
        setErr('⚠ Scan cancelled.');
      } else {
        setErr(e.message||'Backend unavailable');
      }
      setScanning(false);
      scanAbortRef.current = null;
    }
  };

  const handleCancelScan = useCallback(() => {
    if (scanAbortRef.current) scanAbortRef.current.abort();
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (progRef.current) {
      clearInterval(progRef.current);
      progRef.current = null;
    }
    setScanning(false);
    setApiDone(false);
    setLiveRes(null);
    setJsonData(null);
    setErr('⚠ Scan cancelled.');
    scanAbortRef.current = null;
  }, []);

  const generatePdfReport = useCallback(async () => {
    if (!reportRef.current) {
      setReportError('Unable to locate report content.');
      return;
    }

    setReportError('');
    setReportSuccess(false);
    setReportLoading(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        useCORS: true,
        backgroundColor: '#040404',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const cleanTarget = result?.target?.replace(/[^a-zA-Z0-9_-]/g, '') || 'report';
      const filename = `WHITENX-Report-${cleanTarget}-${Date.now()}.pdf`;
      pdf.save(filename);
      setReportSuccess(true);
    } catch (error) {
      setReportError(error?.message || 'Unable to generate report.');
    } finally {
      setReportLoading(false);
      setTimeout(() => setReportSuccess(false), 5000);
    }
  }, [result]);

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
        <pre style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:16,padding:28,overflow:'auto',fontSize:13,color:'rgba(255,255,255,.88)',maxHeight:'80vh',fontFamily:"'JetBrains Mono',monospace",backdropFilter:'blur(12px)',boxShadow:'0 8px 32px rgba(0,0,0,.4)'}}>{JSON.stringify(jsonData,null,2)}</pre>
      </div>
    </div>
  );

  if(!result) return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'#000'}}>
      <Ticker/>
      <div className="wx-hero">
        <div className="hero-starfield"/>
        <div className="live-particle-burst">
          <div className="live-particle"/>
          <div className="live-particle"/>
          <div className="live-particle"/>
          <div className="live-particle"/>
          <div className="live-particle"/>
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
          <svg viewBox="0 0 260 220">
            <polygon points="36,160 84,54 192,78 228,176 120,206"/>
            <line x1="84" y1="54" x2="120" y2="206"/>
            <line x1="36" y1="160" x2="192" y2="78"/>
            <line x1="84" y1="54" x2="228" y2="176"/>
            <circle cx="36" cy="160" r="2"/>
            <circle cx="84" cy="54" r="2"/>
            <circle cx="192" cy="78" r="2"/>
            <circle cx="228" cy="176" r="2"/>
            <circle cx="120" cy="206" r="2"/>
          </svg>
        </div>
        <div className="hero-constellation hero-constellation-b" aria-hidden="true">
          <svg viewBox="0 0 220 180">
            <polygon points="40,26 146,12 188,74 94,96"/>
            <line x1="40" y1="26" x2="94" y2="96"/>
            <line x1="146" y1="12" x2="94" y2="96"/>
            <line x1="40" y1="26" x2="188" y2="74"/>
            <circle cx="40" cy="26" r="2"/>
            <circle cx="146" cy="12" r="2"/>
            <circle cx="188" cy="74" r="2"/>
            <circle cx="94" cy="96" r="2"/>
          </svg>
        </div>
        <div className="hero-bg-right"/>
        <div style={{position:'relative',zIndex:2,width:'100%',maxWidth:'100%',padding:'0 48px'}}>
          <div className="hero-badge">
            <span className="hero-badge-dot"/>
            Whitenx VAPT Platform
          </div>
          <div className="hero-title">VULNERABILITY<br/>ASSESSMENT<br/>PLATFORM</div>
          <div className="hero-desc">
            Professional penetration testing and security analysis. Full port scanning, CVE detection, OSINT intelligence, and SSL auditing in one platform.
          </div>
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
                value={domain} onChange={e=>{setDomain(e.target.value); validateDomainInput(e.target.value);}}
                onKeyDown={e=>e.key==='Enter'&&domainValid&&handleScan()}
                style={{
                  borderColor: domainValid === true ? 'rgba(100,200,100,.4)' : domainValid === false ? 'rgba(200,100,100,.4)' : 'rgba(255,255,255,.14)',
                  boxShadow: domainValid === true ? '0 0 16px rgba(100,200,100,.12)' : domainValid === false ? '0 0 16px rgba(200,100,100,.12)' : 'none',
                }}/>
              {validationMsg && (
                <div style={{fontSize:9,color: domainValid ? 'rgba(100,200,100,.8)' : 'rgba(200,100,100,.8)',marginTop:6,letterSpacing:'.5px',fontFamily:'monospace'}}>
                  {validationMsg}
                </div>
              )}
            </div>
            <button className="wx-scan-btn" onClick={handleScan} disabled={domainValid !== true || scanning}
              style={{opacity: (domainValid && !scanning) ? 1 : 0.5, cursor: (domainValid && !scanning) ? 'pointer' : 'not-allowed'}}>
              {scanning ? 'Scanning...' : 'Scan →'}
            </button>
          </div>
          <div className="hero-warn">
            <span className="hero-warn-dot"/>
            Full scan takes 5–6 minutes — keep this tab open
          </div>
          <div className="hero-terminal">
            <div className="hero-terminal-top">
              <span className="hero-terminal-title">Operator Feed</span>
              <span className="hero-terminal-state">Monitoring</span>
            </div>
            <div className="hero-terminal-body">
              <div className="hero-log"><span className="hero-log-tag">INF</span><span className="hero-log-text">Passive recon modules armed for hostname, port, and SSL analysis.</span></div>
              <div className="hero-log"><span className="hero-log-tag">SYS</span><span className="hero-log-text">Telemetry ready. Awaiting target input for full-spectrum assessment.</span></div>
              <div className="hero-log"><span className="hero-log-tag">TIP</span><span className="hero-log-text">Use a domain or IP to launch the live security pipeline.</span></div>
            </div>
          </div>

          {/* Feature grid */}
          <div style={{marginTop:64,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,maxWidth:480}}>
            {[
              {icon:'🔍',label:'Port Scanning',desc:'Full 65535 port sweep with service detection'},
              {icon:'🛡️',label:'CVE Detection',desc:'48,000+ vulnerability database matching'},
              {icon:'🌐',label:'OSINT Intel',desc:'WHOIS, DNS records, crt.sh enumeration'},
              {icon:'🔒',label:'SSL Analysis',desc:'Certificate & cipher suite inspection'},
            ].map(f=>(
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

  // REPORT
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
  const rawSnapshot = JSON.stringify({
    osint,
    port_scan: result.port_scan ? {
      ...result.port_scan,
      services: ports,
      open_ports: result.port_scan.open_ports || []
    } : {},
    vulnerabilities: vulns,
    subdomains: subds
  }, null, 2);

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
          {result && <button className="wx-btn" onClick={generatePdfReport} disabled={reportLoading}>{reportLoading ? 'Generating...' : 'Generate Report'}</button>}
        </div>
      </nav>
      <div style={{display:'flex',alignItems:'center',gap:12,padding:'0 48px 16px'}}>
        {reportError && <span style={{color:'#fff',opacity:.85,fontSize:11}}>{reportError}</span>}
        {reportSuccess && <span style={{color:'#fff',opacity:.85,fontSize:11}}>Report generated successfully.</span>}
      </div>

      <div className="wx-body">
        {/* Report header */}
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
            {crit>0&&<span className="wx-badge bc">{crit} Critical</span>}
            {high>0&&<span className="wx-badge bh">{high} High</span>}
            {med>0&&<span className="wx-badge bm">{med} Medium</span>}
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {tab==='overview'&&(
          <>
            <div className="g4 wx-stat-grid">
              <StatCard label="Critical / High" val={crit+high} accent="#fff" sub={`${med} medium, ${low} low`} icon="⚠️" delay="0s"/>
              <StatCard label="Open Ports"      val={ports.length} accent="#fff" sub="discovered"               icon="🔌" delay=".05s"/>
              <StatCard label="Subdomains"      val={subds.length} accent="#fff" sub="enumerated"               icon="🌐" delay=".1s"/>
              <StatCard label="Services"        val={svcs.length}  accent="#fff" sub="fingerprinted"           icon="⚙️" delay=".15s"/>
            </div>

            <div className="wx-section-label">Top Issues</div>
            <div className="wx-card">
              <div className="wx-card-hdr">
                <div className="wx-card-title">Critical Vulnerabilities</div>
                <span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{vulns.length} total</span>
              </div>
              <WxTable
                cols={['Vulnerability','Severity','Port','Recommendation']}
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
              <div className="wx-card-hdr">
                <div className="wx-card-title">Running Services</div>
                <span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{svcs.length} detected</span>
              </div>
              <WxTable
                cols={['Port','Service','Version','CVEs']}
                rows={svcs.map((s,i)=>(
                  <tr key={i}>
                    <td><strong style={{color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{s.port}</strong></td>
                    <td style={{color:'rgba(255,255,255,.78)'}}>{s.service_name||s.service}</td>
                    <td>{s.version?<span style={{color:'rgba(255,255,255,.85)',fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>{s.version}</span>:<span style={{color:'rgba(255,255,255,.35)'}}>—</span>}</td>
                    <td>{s.cves?.length>0?<span className="wx-badge bh">{s.cves.length} CVEs</span>:<span className="wx-badge bn">None</span>}</td>
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
            <div className="wx-section-label">Raw Backend Snapshot</div>
            <WxCard title="Source Data Preview">
              <pre style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'rgba(255,255,255,.75)',background:'rgba(255,255,255,.03)',borderRadius:12,padding:16,overflow:'auto',maxHeight:260,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>
{rawSnapshot}
              </pre>
            </WxCard>
          </>
        )}

        {/* ── VULNERABILITIES ── */}
        {tab==='vulnerabilities'&&(
          <div className="wx-card">
            <div className="wx-card-hdr">
              <div className="wx-card-title">All Vulnerabilities</div>
              <span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{vulns.length} total</span>
            </div>
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

        {/* ── SERVICES ── */}
        {tab==='services'&&(
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="wx-card">
              <div className="wx-card-hdr"><div className="wx-card-title">Fingerprinted Services</div></div>
              <WxTable cols={['Port','Service','Version','Banner','CVEs']}
                rows={svcs.map((s,i)=>(
                  <tr key={i}>
                    <td><strong style={{color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{s.port}</strong></td>
                    <td style={{color:'rgba(255,255,255,.78)'}}>{s.service_name||s.service}</td>
                    <td style={{color:'rgba(255,255,255,.85)',fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>{s.version||'—'}</td>
                    <td style={{fontSize:10,color:'rgba(255,255,255,.58)',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.banner?s.banner.substring(0,40)+'...':'—'}</td>
                    <td>{s.cves?.length>0?<span className="wx-badge bh">{s.cves.length}</span>:<span className="wx-badge bn">0</span>}</td>
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
                  {(()=>{const c=sslA.certificates[0]; return(
                    <table className="wx-tbl"><tbody>
                      {[['Subject',c.subject],['Issuer',c.issuer],['Valid From',c.notBefore],['Valid Until',c.notAfter],['Days Left',c.expiry_days+'d']].map(([k,v])=>(
                        <tr key={k}><td style={{color:'rgba(255,255,255,.6)',width:100,fontSize:10,textTransform:'uppercase',letterSpacing:'1px'}}>{k}</td><td style={{color:'rgba(255,255,255,.78)',fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>{v||'—'}</td></tr>
                      ))}
                    </tbody></table>
                  );})()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PORTS ── */}
        {tab==='ports'&&(
          <div className="wx-card">
            <div className="wx-card-hdr"><div className="wx-card-title">Port Scan Results</div><span style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>{ports.length} open</span></div>
            <WxTable cols={['Port','Service','State','Version','Banner']}
              rows={ports.map((p,i)=>(
                <tr key={i}>
                  <td><strong style={{color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{p.port}</strong></td>
                  <td style={{color:'rgba(255,255,255,.78)'}}>{p.service}</td>
                  <td><SevBadge s={(p.state||'OPEN').toUpperCase()}/></td>
                  <td style={{fontSize:10,color:'rgba(255,255,255,.85)',fontFamily:"'JetBrains Mono',monospace"}}>{p.version||'—'}</td>
                  <td style={{fontSize:10,color:'rgba(255,255,255,.58)',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.banner?p.banner.substring(0,45)+'...':'—'}</td>
                </tr>
              ))} empty="No open ports"
            />
          </div>
        )}

        {/* ── SUBDOMAINS ── */}
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

        {/* ── OSINT ── */}
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
                    <div key={k} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.12)',borderLeft:'3px solid rgba(255,255,255,.24)',borderRadius:10,padding:'10px 14px',backdropFilter:'blur(12px)'}}>
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

        <div ref={reportRef} className="wx-pdf-report" aria-hidden="true">
          <div style={{padding:32,background:'#030303',borderRadius:24,color:'#fff'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,flexWrap:'wrap',marginBottom:28}}>
              <div>
                <div style={{fontSize:36,fontWeight:800,letterSpacing:2}}>WHITENX VAPT REPORT</div>
                <div style={{fontSize:12,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,.65)',marginTop:8}}>Comprehensive security assessment summary</div>
              </div>
              <div style={{textAlign:'right',fontSize:10,color:'rgba(255,255,255,.65)',lineHeight:1.6}}>
                Generated: {new Date().toLocaleString()}<br/>
                Target: {result.target || 'n/a'}<br/>
                Scan ID: {result.scan_id?.substring(0,18) || 'pending'}
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(240px,1fr))',gap:16,marginBottom:28}}>
              <div style={{padding:20,background:'rgba(255,255,255,.03)',borderRadius:20}}>
                <div style={{fontSize:11,letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,.55)',marginBottom:12}}>Risk Summary</div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><strong>Critical</strong><span>{crit}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><strong>High</strong><span>{high}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><strong>Medium</strong><span>{med}</span></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><strong>Low</strong><span>{low}</span></div>
              </div>
              <div style={{padding:20,background:'rgba(255,255,255,.03)',borderRadius:20}}>
                <div style={{fontSize:11,letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,.55)',marginBottom:12}}>Infrastructure</div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><strong>Open Ports</strong><span>{ports.length}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><strong>Services</strong><span>{svcs.length}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><strong>Subdomains</strong><span>{subds.length}</span></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><strong>OSINT Score</strong><span>{osint.osint_score || 'N/A'}</span></div>
              </div>
            </div>

            <div style={{marginBottom:24}}>
              <div style={{fontSize:18,fontWeight:700,marginBottom:14}}>Top Findings</div>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
                <thead>
                  <tr>
                    <th style={{textAlign:'left',padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.75)'}}>Vulnerability</th>
                    <th style={{textAlign:'left',padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.75)'}}>Severity</th>
                    <th style={{textAlign:'left',padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.75)'}}>Port</th>
                  </tr>
                </thead>
                <tbody>
                  {vulns.slice(0,6).map((v,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                      <td style={{padding:'12px 14px',color:'rgba(255,255,255,.82)'}}>{v.type}</td>
                      <td style={{padding:'12px 14px',color:'#fff'}}>{v.severity}</td>
                      <td style={{padding:'12px 14px',color:'rgba(255,255,255,.72)'}}>{v.port||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(240px,1fr))',gap:16}}>
              <div style={{padding:20,background:'rgba(255,255,255,.03)',borderRadius:20}}>
                <div style={{fontSize:11,letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,.55)',marginBottom:12}}>Security Headers</div>
                {Object.entries(hdrs).slice(0,6).map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                    <span style={{color:'rgba(255,255,255,.75)'}}>{k}</span>
                    <span style={{color:'rgba(255,255,255,.82)'}}>{v ? 'Enabled' : 'Missing'}</span>
                  </div>
                ))}
              </div>
              <div style={{padding:20,background:'rgba(255,255,255,.03)',borderRadius:20}}>
                <div style={{fontSize:11,letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,.55)',marginBottom:12}}>Details</div>
                <div style={{color:'rgba(255,255,255,.75)',fontSize:11,lineHeight:1.7}}>{osint.whois?.organization ? `${osint.whois.organization} — ${osint.whois.country}` : 'OSINT details available in dashboard.'}</div>
              </div>
            </div>
            <div style={{marginTop:24,padding:20,background:'rgba(255,255,255,.02)',borderRadius:20}}>
              <div style={{fontSize:11,letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,.55)',marginBottom:12}}>Raw Backend Snapshot</div>
              <pre style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'rgba(255,255,255,.75)',background:'rgba(255,255,255,.03)',borderRadius:12,padding:16,overflow:'hidden',maxHeight:180,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>
{rawSnapshot.slice(0,1800)}{rawSnapshot.length>1800? '\n...':' '}
              </pre>
            </div>
          </div>
        </div>
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
      {stage==='dashboard' && <Dashboard onSessionExpire={()=>setStage('login')} />}
    </>
  );
}

export default App;
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import Chart from 'react-apexcharts';
// import { CompleteReport, exportToPDF } from './App';

// // ════════════════════════════════════════════════════════════
// // WHITENX — COMPLETE UI
// // Access Key: WX-E4QB-4ZJY-L5UN-WBSK
// // API: https://ai-vapt-project.onrender.com
// // ════════════════════════════════════════════════════════════

// const API_BASE   = 'https://ai-vapt-project.onrender.com';
// const ACCESS_KEY = 'WX-E4QB-4ZJY-L5UN-WBSK';

// // ── Global CSS ───────────────────────────────────────────────
// const injectCSS = () => {
//   if (document.getElementById('wx-css')) return;
//   const s = document.createElement('style');
//   s.id = 'wx-css';
//   s.textContent = `
// *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
// html,body,#root{height:100%;background:#000;color:#e2e8f0;font-family:'JetBrains Mono','Courier New',monospace}
// ::-webkit-scrollbar{width:3px;height:3px}
// ::-webkit-scrollbar-track{background:#000}
// ::-webkit-scrollbar-thumb{background:#1a1a1a;border-radius:2px}

// /* ── LEGAL PAGE ── */
// @keyframes lp-scan{0%{top:-100%}100%{top:200%}}
// @keyframes lp-flicker{0%,19%,21%,23%,25%,54%,56%,100%{opacity:1}20%,24%,55%{opacity:.4}}
// @keyframes lp-pulse{0%,100%{box-shadow:0 0 20px #ef444430}50%{box-shadow:0 0 40px #ef444460}}
// @keyframes lp-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
// @keyframes lp-glitch{
//   0%,100%{clip-path:inset(0 0 100% 0)}
//   20%{clip-path:inset(33% 0 66% 0)}
//   40%{clip-path:inset(66% 0 33% 0)}
//   60%{clip-path:inset(0 0 0 0)}
// }
// @keyframes lp-blink{0%,100%{opacity:1}50%{opacity:0}}
// @keyframes lp-march{to{background-position:40px 0}}

// .lp-wrap{
//   min-height:100vh;background:#000;
//   display:flex;align-items:center;justify-content:center;
//   padding:20px;position:relative;overflow:hidden;
// }
// .lp-grid{
//   position:absolute;inset:0;
//   background-image:linear-gradient(#ef444408 1px,transparent 1px),linear-gradient(90deg,#ef444408 1px,transparent 1px);
//   background-size:60px 60px;
//   animation:lp-march 3s linear infinite;
// }
// .lp-scan-line{
//   position:absolute;left:0;right:0;height:2px;
//   background:linear-gradient(90deg,transparent,#ef444440,transparent);
//   animation:lp-scan 4s linear infinite;pointer-events:none;z-index:1;
// }
// .lp-vignette{
//   position:absolute;inset:0;
//   background:radial-gradient(ellipse at center,transparent 40%,#000 100%);
//   pointer-events:none;z-index:1;
// }
// .lp-container{
//   position:relative;z-index:10;width:100%;max-width:780px;
//   animation:lp-in .8s ease both;
// }
// .lp-skull-header{
//   text-align:center;margin-bottom:28px;
// }
// .lp-skull-icon{
//   font-size:48px;display:block;margin-bottom:12px;
//   filter:drop-shadow(0 0 20px #ef4444);
//   animation:lp-flicker 4s infinite;
// }
// .lp-restricted-bar{
//   background:#ef444415;
//   border:1px solid #ef444450;
//   border-radius:4px 4px 0 0;
//   padding:10px 20px;
//   display:flex;align-items:center;justify-content:space-between;
//   flex-wrap:wrap;gap:8px;
// }
// .lp-restricted-text{
//   font-size:9px;font-weight:800;letter-spacing:3px;color:#ef4444;
// }
// .lp-badge{
//   font-size:8px;font-weight:700;letter-spacing:2px;
//   background:#ef444420;border:1px solid #ef444440;
//   color:#ef4444;padding:3px 10px;border-radius:2px;
// }
// .lp-body{
//   background:#050505;
//   border:1px solid #ef444430;border-top:none;
//   border-radius:0 0 8px 8px;
//   padding:28px 32px 32px;
//   animation:lp-pulse 3s ease-in-out infinite;
// }
// .lp-warning-title{
//   font-size:clamp(12px,2vw,15px);font-weight:800;
//   color:#ef4444;letter-spacing:1px;line-height:1.5;
//   margin-bottom:24px;text-align:center;
//   text-shadow:0 0 20px #ef444460;
// }
// .lp-section{margin-bottom:24px;}
// .lp-section-title{
//   font-size:8px;font-weight:700;letter-spacing:3px;color:#ef444480;
//   margin-bottom:12px;padding-bottom:6px;
//   border-bottom:1px solid #ef444420;
// }
// .lp-item{
//   display:flex;gap:12px;margin-bottom:10px;
//   animation:lp-in .5s ease both;
// }
// .lp-item-bullet{color:#ef444460;flex-shrink:0;font-size:12px;margin-top:1px;}
// .lp-item-text{font-size:11px;color:#6b7280;line-height:1.6;}
// .lp-item-text strong{color:#94a3b8;}
// .lp-laws{
//   display:grid;grid-template-columns:1fr 1fr;gap:8px;
// }
// @media(max-width:600px){.lp-laws{grid-template-columns:1fr}}
// .lp-law{
//   background:#0a0a0a;border:1px solid #1a1a1a;
//   border-radius:4px;padding:8px 12px;
//   font-size:10px;color:#374151;
// }
// .lp-law strong{color:#4b5563;display:block;margin-bottom:2px;font-size:9px;letter-spacing:1px;}
// .lp-threat{
//   text-align:center;margin:20px 0;
//   font-size:11px;color:#ef444460;letter-spacing:1px;
//   padding:12px;border:1px dashed #ef444420;border-radius:4px;
// }
// .lp-accept-btn{
//   width:100%;padding:16px;
//   font-family:'JetBrains Mono',monospace;
//   font-size:12px;font-weight:800;letter-spacing:3px;
//   background:#ef444410;
//   border:2px solid #ef444440;
//   border-radius:6px;color:#ef4444;cursor:pointer;
//   transition:all .3s;margin-top:4px;
//   position:relative;overflow:hidden;
// }
// .lp-accept-btn::before{
//   content:'';position:absolute;inset:0;
//   background:linear-gradient(90deg,transparent,#ef444415,transparent);
//   transform:translateX(-100%);transition:transform .4s;
// }
// .lp-accept-btn:hover{background:#ef444420;border-color:#ef4444;color:#fff;box-shadow:0 0 30px #ef444430;}
// .lp-accept-btn:hover::before{transform:translateX(100%);}
// .lp-footer{
//   text-align:center;margin-top:16px;
//   font-size:8px;color:#1a1a1a;letter-spacing:1.5px;
// }

// /* ── LOGIN PAGE ── */
// @keyframes lg-in{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
// @keyframes lg-pulse{0%,100%{opacity:1}50%{opacity:.4}}
// @keyframes lg-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
// @keyframes lg-scan{0%{top:0}100%{top:100%}}

// .lg-wrap{
//   min-height:100vh;
//   background:radial-gradient(ellipse at 50% 0%,#0d1829 0%,#000 65%);
//   display:flex;align-items:center;justify-content:center;
//   padding:20px;position:relative;overflow:hidden;
// }
// .lg-grid{
//   position:absolute;inset:0;
//   background-image:linear-gradient(#38bdf808 1px,transparent 1px),linear-gradient(90deg,#38bdf808 1px,transparent 1px);
//   background-size:40px 40px;pointer-events:none;
// }
// .lg-scan-line{
//   position:absolute;left:0;right:0;height:1px;
//   background:linear-gradient(90deg,transparent,#38bdf820,transparent);
//   animation:lg-scan 6s linear infinite;pointer-events:none;
// }
// .lg-card{
//   width:100%;max-width:420px;position:relative;z-index:10;
//   background:#060d1c;
//   border:1px solid #1e3a5f;border-radius:10px;
//   overflow:hidden;animation:lg-in .6s ease both;
// }
// .lg-card-header{
//   padding:24px 28px 20px;
//   border-bottom:1px solid #0f2040;
//   background:linear-gradient(180deg,#0a1628,#060d1c);
//   text-align:center;
// }
// .lg-logo{font-size:14px;font-weight:800;letter-spacing:4px;color:#e2e8f0;margin-bottom:6px;}
// .lg-subtitle{font-size:8px;letter-spacing:3px;color:#1e3a5f;}
// .lg-card-body{padding:28px;}
// .lg-err{
//   background:#ef444410;border:1px solid #ef444430;
//   border-radius:4px;padding:10px 14px;
//   margin-bottom:16px;font-size:10px;color:#ef4444;
//   letter-spacing:1px;animation:lg-shake .4s ease;
// }
// .lg-label{font-size:8px;font-weight:700;letter-spacing:2px;color:#1e3a5f;margin-bottom:8px;}
// .lg-field-wrap{
//   background:#030810;border:1px solid #1e3a5f;
//   border-radius:6px;padding:12px 16px;margin-bottom:16px;
//   transition:border-color .2s;
// }
// .lg-field-wrap:focus-within{border-color:#38bdf860;}
// .lg-field-static{font-size:12px;color:#38bdf8;letter-spacing:1px;}
// .lg-field-hint{font-size:9px;color:#1e3a5f;margin-top:4px;letter-spacing:.5px;}
// .lg-input{
//   width:100%;background:transparent;border:none;outline:none;
//   font-family:'JetBrains Mono',monospace;font-size:13px;
//   color:#e2e8f0;letter-spacing:2px;
// }
// .lg-input::placeholder{color:#1e3a5f;letter-spacing:1px;}
// .lg-key-hint{
//   background:#38bdf808;border:1px dashed #1e3a5f;
//   border-radius:4px;padding:10px 14px;margin-bottom:20px;
// }
// .lg-key-hint-label{font-size:8px;color:#1e3a5f;letter-spacing:'2px';margin-bottom:6px;}
// .lg-key-format{font-size:11px;color:#38bdf840;letter-spacing:3px;font-weight:700;}
// .lg-btn{
//   width:100%;padding:14px;
//   font-family:'JetBrains Mono',monospace;font-size:11px;
//   font-weight:800;letter-spacing:3px;
//   background:#38bdf810;border:1px solid #38bdf840;
//   border-radius:6px;color:#38bdf8;cursor:pointer;
//   transition:all .2s;
// }
// .lg-btn:hover:not(:disabled){background:#38bdf820;border-color:#38bdf8;color:#fff;}
// .lg-btn:disabled{opacity:.5;cursor:not-allowed;}
// .lg-status{
//   margin-top:20px;display:flex;align-items:center;
//   justify-content:center;gap:8px;
// }
// .lg-dot{
//   width:5px;height:5px;border-radius:50%;
//   background:#22c55e;box-shadow:0 0 6px #22c55e;
//   animation:lg-pulse 1.5s ease-in-out infinite;
// }
// .lg-status-text{font-size:8px;color:#1e3a5f;letter-spacing:1.5px;}

// /* ── GHOST TERMINAL ── */
// @keyframes gt-fadein{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
// @keyframes gt-critin{from{transform:translateX(-12px);opacity:0;border-left-width:12px}60%{border-left-width:3px}to{transform:translateX(0);opacity:1}}
// @keyframes gt-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
// @keyframes gt-blink{0%,100%{opacity:1}50%{opacity:0}}
// @keyframes gt-glitch{0%{transform:translateX(0);filter:none}20%{transform:translateX(-5px);filter:hue-rotate(90deg) brightness(1.4)}40%{transform:translateX(5px)}60%{transform:translateX(-2px);filter:none}100%{transform:translateX(0)}}

// .gt-cursor{animation:gt-blink .9s step-end infinite;color:#22c55e;}
// .gt-line{animation:gt-fadein .18s ease both;}
// .gt-glitch{animation:gt-glitch .28s steps(1) forwards;}

// /* ── DASHBOARD ── */
// @keyframes db-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

// .wx-nav{
//   display:flex;align-items:center;gap:12px;
//   padding:0 20px;height:50px;
//   background:#04091a;border-bottom:1px solid #0f2040;
//   position:sticky;top:0;z-index:50;flex-shrink:0;
//   overflow:hidden;
// }
// .wx-logo{font-size:12px;font-weight:800;letter-spacing:4px;color:#e2e8f0;flex-shrink:0;}
// .wx-tabs{display:flex;gap:2px;overflow-x:auto;flex:1;scrollbar-width:none;}
// .wx-tabs::-webkit-scrollbar{display:none;}
// .wx-tab{
//   font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;
//   letter-spacing:1.5px;padding:6px 12px;border-radius:4px;
//   border:none;cursor:pointer;white-space:nowrap;
//   background:transparent;color:#1e3a5f;transition:all .2s;
// }
// .wx-tab:hover{color:#38bdf8;background:#0f2040;}
// .wx-tab.active{color:#38bdf8;background:#0f2040;border-bottom:2px solid #38bdf8;}
// .wx-btn{
//   font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;
//   letter-spacing:1.5px;padding:7px 14px;border-radius:4px;
//   border:1px solid #1e3a5f;cursor:pointer;flex-shrink:0;
//   background:transparent;color:#38bdf8;transition:all .2s;white-space:nowrap;
// }
// .wx-btn:hover{background:#0f2040;border-color:#38bdf8;}

// .wx-body{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px;}

// /* Cards */
// .wx-card{
//   background:#060d1c;border:1px solid #0f2040;
//   border-radius:8px;overflow:hidden;
//   transition:border-color .2s,transform .15s;
//   animation:db-in .4s ease both;
// }
// .wx-card:hover{border-color:#1e3a5f;}
// .wx-card-hdr{
//   display:flex;align-items:center;justify-content:space-between;
//   padding:12px 18px;border-bottom:1px solid #0a1628;
//   background:#04091a;
// }
// .wx-card-title{font-size:9px;font-weight:700;letter-spacing:2px;color:#1e3a5f;}
// .wx-card-body{padding:18px;}

// /* Stat cards */
// .wx-stat-grid{display:grid;gap:12px;}
// .wx-stat{
//   background:#060d1c;border:1px solid #0f2040;border-radius:8px;
//   padding:18px 20px;display:flex;flex-direction:column;gap:6px;
//   position:relative;overflow:hidden;transition:all .2s;
// }
// .wx-stat:hover{border-color:#1e3a5f;transform:translateY(-1px);}
// .wx-stat::before{
//   content:'';position:absolute;top:0;left:0;right:0;height:2px;
//   background:var(--stat-color,#38bdf8);opacity:.6;
// }
// .wx-stat-label{font-size:8px;font-weight:700;letter-spacing:2px;color:#1e3a5f;}
// .wx-stat-val{font-size:36px;font-weight:800;line-height:1;color:var(--stat-color,#38bdf8);}
// .wx-stat-sub{font-size:9px;color:#1e3a5f;}
// .wx-stat-icon{
//   position:absolute;right:16px;top:50%;transform:translateY(-50%);
//   font-size:32px;opacity:.06;
// }

// /* Tables */
// .wx-tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
// .wx-tbl{width:100%;border-collapse:collapse;font-size:11px;}
// .wx-tbl th{padding:10px 16px;text-align:left;font-size:8px;font-weight:700;letter-spacing:1.5px;color:#1e3a5f;border-bottom:1px solid #0a1628;background:#04091a;}
// .wx-tbl td{padding:12px 16px;border-bottom:1px solid #060d1c;color:#475569;transition:background .15s;}
// .wx-tbl tr:hover td{background:#04091a20;}
// .wx-tbl tr:last-child td{border-bottom:none;}

// /* Badges */
// .wx-badge{display:inline-block;font-size:8px;font-weight:700;letter-spacing:1.5px;padding:3px 8px;border-radius:3px;}
// .bc{background:#ef444415;color:#ef4444;border:1px solid #ef444330;}
// .bh{background:#f9731615;color:#f97316;border:1px solid #f9731630;}
// .bm{background:#f59e0b15;color:#f59e0b;border:1px solid #f59e0b30;}
// .bl{background:#3b82f615;color:#3b82f6;border:1px solid #3b82f630;}
// .bg{background:#22c55e15;color:#22c55e;border:1px solid #22c55e30;}
// .bn{background:#0a0a0a;color:#1e3a5f;border:1px solid #111;}

// /* Hero */
// .wx-hero{
//   min-height:100vh;display:flex;flex-direction:column;
//   align-items:center;justify-content:center;
//   padding:40px 20px;text-align:center;
//   background:radial-gradient(ellipse at 50% 30%,#0d1829 0%,#000 70%);
//   position:relative;overflow:hidden;
// }
// .wx-hero-grid{
//   position:absolute;inset:0;
//   background-image:linear-gradient(#38bdf806 1px,transparent 1px),linear-gradient(90deg,#38bdf806 1px,transparent 1px);
//   background-size:50px 50px;pointer-events:none;
// }
// .wx-hero-title{font-size:clamp(32px,7vw,64px);font-weight:800;letter-spacing:8px;color:#e2e8f0;margin-bottom:6px;text-shadow:0 0 40px #38bdf820;}
// .wx-hero-sub{font-size:10px;color:#1e3a5f;letter-spacing:4px;margin-bottom:8px;}
// .wx-hero-desc{font-size:11px;color:#1e3a5f;letter-spacing:1px;margin-bottom:40px;}
// .wx-input-row{display:flex;gap:10px;width:100%;max-width:580px;flex-wrap:wrap;}
// .wx-input{
//   flex:1;min-width:200px;font-family:'JetBrains Mono',monospace;font-size:13px;
//   padding:14px 18px;background:#060d1c;
//   border:1px solid #0f2040;border-radius:6px;
//   color:#e2e8f0;outline:none;transition:border-color .2s;
// }
// .wx-input:focus{border-color:#38bdf860;}
// .wx-input::placeholder{color:#1e3a5f;}
// .wx-scan-btn{
//   font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;
//   letter-spacing:2px;padding:14px 28px;border-radius:6px;
//   border:1px solid #38bdf840;background:#38bdf810;
//   color:#38bdf8;cursor:pointer;transition:all .2s;white-space:nowrap;
// }
// .wx-scan-btn:hover{background:#38bdf8;color:#000;}
// .wx-err{font-size:11px;color:#ef4444;background:#ef444410;border:1px solid #ef444430;border-radius:6px;padding:10px 16px;margin-bottom:16px;letter-spacing:1px;width:100%;max-width:580px;text-align:left;}

// /* Report header */
// .wx-rpt-hdr{
//   display:flex;align-items:center;justify-content:space-between;
//   padding:0 0 16px;border-bottom:1px solid #0a1628;
//   margin-bottom:20px;flex-wrap:wrap;gap:10px;
// }
// .wx-rpt-title{font-size:clamp(11px,2vw,14px);font-weight:800;letter-spacing:3px;color:#e2e8f0;}
// .wx-rpt-meta{font-size:9px;color:#1e3a5f;margin-top:4px;}

// /* Grid */
// .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
// .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
// .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}

// @media(max-width:900px){
//   .g2{grid-template-columns:1fr;}
//   .g3{grid-template-columns:1fr 1fr;}
//   .g4{grid-template-columns:1fr 1fr;}
//   .wx-body{padding:12px;}
//   .wx-nav{padding:0 12px;}
// }
// @media(max-width:600px){
//   .g3,.g4{grid-template-columns:1fr 1fr;}
//   .wx-tab{font-size:8px;padding:5px 8px;}
//   .gt-pipeline{display:none;}
//   .gt-right{display:none;}
// }
// @media(max-width:400px){
//   .g3,.g4{grid-template-columns:1fr;}
// }

// /* Misc */
// .mono{font-family:'JetBrains Mono',monospace;}
// .dim{color:#1e3a5f;}
// .muted{color:#374151;}
// .accent{color:#38bdf8;}
// `;
//   document.head.appendChild(s);
// };

// // ════════════════════════════════════════════════════════════
// // LEGAL PAGE
// // ════════════════════════════════════════════════════════════
// const LegalPage = ({ onAccept }) => {
//   const [step, setStep] = useState(0);
//   const items = [
//     { delay: '0s',   text: <>You have <strong>explicit written authorization</strong> from the target system owner prior to initiating any scan.</> },
//     { delay: '.1s',  text: <>You will <strong>NEVER</strong> use this platform or its output against any system, network, or individual without valid legal authorization.</> },
//     { delay: '.2s',  text: <>All actions, IP addresses, timestamps, commands, and session data are <strong>logged, timestamped, and permanently auditable</strong> by law enforcement upon request.</> },
//     { delay: '.3s',  text: <>You accept <strong>full criminal, civil, and financial liability</strong> for any misuse, unauthorized access, or violation of applicable law.</> },
//     { delay: '.4s',  text: <>You will <strong>immediately cease all activity</strong> and self-report to the appropriate authorities upon discovery of any unauthorized access.</> },
//     { delay: '.5s',  text: <>You are of <strong>legal age (18+)</strong>, legally competent, and acting within the scope of a legitimate professional engagement.</> },
//   ];
//   const laws = [
//     { region: 'INDIA', text: 'IT Act 2000 — §43, 66, 66F, 67, 69, 70, 72, 72A, 75' },
//     { region: 'INDIA', text: 'Bharatiya Nyaya Sanhita 2023 — Cybercrime Provisions' },
//     { region: 'INDIA', text: 'IPC / BNS — Conspiracy, Fraud, Cyber Stalking' },
//     { region: 'USA',   text: 'CFAA — 18 U.S.C. § 1030 (up to 20 years imprisonment)' },
//     { region: 'EU',    text: 'GDPR — Up to €20M or 4% annual turnover fine' },
//     { region: 'INTL',  text: 'Budapest Convention on Cybercrime — 67+ nations' },
//   ];

//   return (
//     <div className="lp-wrap">
//       <div className="lp-grid"/>
//       <div className="lp-scan-line"/>
//       <div className="lp-vignette"/>
//       <div className="lp-container">
//         <div className="lp-skull-header">
//           <span className="lp-skull-icon">☠</span>
//           <div style={{fontSize:9,color:'#ef444440',letterSpacing:'4px',fontWeight:700}}>CLASSIFIED SYSTEM — AUTHORIZED ACCESS ONLY</div>
//         </div>

//         <div className="lp-restricted-bar">
//           <span className="lp-restricted-text">⚠ RESTRICTED ACCESS — AUTHORIZED PERSONNEL ONLY ⚠</span>
//           <span className="lp-badge">CLASSIFICATION: CONFIDENTIAL</span>
//         </div>

//         <div className="lp-body">
//           <h1 className="lp-warning-title">
//             WARNING: UNAUTHORIZED ACCESS TO THIS SYSTEM IS STRICTLY PROHIBITED<br/>
//             AND IS PUNISHABLE UNDER MULTIPLE NATIONAL AND INTERNATIONAL LAWS.<br/>
//             <span style={{fontSize:'0.85em',color:'#ef444480'}}>ALL ACTIVITY IS MONITORED, RECORDED, AND PROSECUTED.</span>
//           </h1>

//           {/* Declaration */}
//           <div className="lp-section">
//             <div className="lp-section-title">MANDATORY DECLARATION — READ CAREFULLY</div>
//             <div style={{fontSize:11,color:'#4b5563',marginBottom:12,letterSpacing:'.5px'}}>
//               By proceeding, you solemnly declare under penalty of perjury that:
//             </div>
//             {items.map((item, i) => (
//               <div key={i} className="lp-item" style={{animationDelay:item.delay}}>
//                 <span className="lp-item-bullet">›</span>
//                 <span className="lp-item-text">{item.text}</span>
//               </div>
//             ))}
//           </div>

//           {/* Laws */}
//           <div className="lp-section">
//             <div className="lp-section-title">APPLICABLE LAWS — ZERO TOLERANCE ENFORCEMENT</div>
//             <div className="lp-laws">
//               {laws.map((l, i) => (
//                 <div key={i} className="lp-law">
//                   <strong>{l.region}</strong>
//                   {l.text}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Threat */}
//           <div className="lp-threat">
//             MISUSE = IMMEDIATE PERMANENT BAN + FULL LEGAL ACTION + LAW ENFORCEMENT COOPERATION
//           </div>

//           {/* Counters — psychological pressure */}
//           <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
//             {[
//               {label:'Active Sessions Monitored', val:'LIVE'},
//               {label:'Jurisdiction Coverage',    val:'67+ Nations'},
//               {label:'Avg. Prosecution Rate',    val:'94.2%'},
//             ].map((s,i)=>(
//               <div key={i} style={{flex:1,minWidth:140,background:'#0a0a0a',border:'1px solid #1a1a1a',borderRadius:4,padding:'10px 14px'}}>
//                 <div style={{fontSize:7,color:'#374151',letterSpacing:'1.5px',marginBottom:4}}>{s.label}</div>
//                 <div style={{fontSize:14,fontWeight:800,color:'#ef444480'}}>{s.val}</div>
//               </div>
//             ))}
//           </div>

//           <button className="lp-accept-btn" onClick={onAccept}>
//             I ACCEPT — I AM AUTHORIZED AND ASSUME FULL LEGAL LIABILITY
//           </button>
//         </div>

//         <div className="lp-footer">
//           SESSION WILL BE LOGGED • IP RECORDED • TIMESTAMP: {new Date().toISOString()}
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
//       t--;
//       setLockTimer(t);
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
//         setErr('TOO MANY FAILED ATTEMPTS — ACCESS LOCKED FOR 30s');
//       } else {
//         setErr(`INVALID ACCESS KEY — ${3 - newAtt} ATTEMPT${3-newAtt===1?'':'S'} REMAINING`);
//       }
//       return;
//     }
//     setAuth(false);
//     onLogin();
//   };

//   return (
//     <div className="lg-wrap">
//       <div className="lg-grid"/>
//       <div className="lg-scan-line"/>
//       <div className="lg-card">
//         <div className="lg-card-header">
//           <div className="lg-logo">⚡ WHITENX</div>
//           <div className="lg-subtitle">VULNERABILITY ASSESSMENT PLATFORM</div>
//           <div style={{marginTop:12,display:'flex',justifyContent:'center',gap:16,flexWrap:'wrap'}}>
//             {['RECON','PORT SCAN','CVE MATCH','OSINT'].map(t=>(
//               <span key={t} style={{fontSize:7,color:'#1e3a5f',letterSpacing:'1.5px'}}>{t}</span>
//             ))}
//           </div>
//         </div>

//         <div className="lg-card-body">
//           {err && <div className="lg-err">✗ {err}</div>}

//           {locked && (
//             <div style={{textAlign:'center',padding:'20px 0',color:'#ef4444',fontSize:11}}>
//               <div style={{fontSize:32,marginBottom:8}}>🔒</div>
//               ACCESS LOCKED — {lockTimer}s
//             </div>
//           )}

//           {!locked && (
//             <form onSubmit={submit}>
//               <div className="lg-label">SYSTEM IDENTIFIER</div>
//               <div className="lg-field-wrap">
//                 <div className="lg-field-static">WHITENX-VAPT-CONSOLE</div>
//                 <div className="lg-field-hint">Authorized terminal — session logging active</div>
//               </div>

//               <div className="lg-label">ACCESS KEY</div>
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

//               <div className="lg-key-hint">
//                 <div className="lg-key-hint-label" style={{fontSize:8,color:'#1e3a5f',letterSpacing:'2px',marginBottom:6}}>KEY FORMAT</div>
//                 <div className="lg-key-format">WX — XXXX — XXXX — XXXX — XXXX</div>
//               </div>

//               <button type="submit" className="lg-btn" disabled={auth}>
//                 {auth ? 'VERIFYING KEY...' : 'AUTHENTICATE →'}
//               </button>
//             </form>
//           )}

//           <div className="lg-status">
//             <div className="lg-dot"/>
//             <span className="lg-status-text">
//               ALL KEYSTROKES LOGGED &nbsp;|&nbsp; {attempts > 0 ? `${attempts} FAILED ATTEMPT${attempts>1?'S':''}` : 'INTRUSION DETECTION ACTIVE'}
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
//   {id:'recon', short:'RECON', full:'RECONNAISSANCE',      color:'#38bdf8'},
//   {id:'ports', short:'PORTS', full:'PORT SCANNING',       color:'#fbbf24'},
//   {id:'svcfp', short:'SVCFP', full:'SERVICE FINGERPRINT', color:'#34d399'},
//   {id:'vulns', short:'VULNS', full:'VULN DETECTION',      color:'#f87171'},
//   {id:'osint', short:'OSINT', full:'OSINT INTELLIGENCE',  color:'#a78bfa'},
//   {id:'ssl',   short:'SSL',   full:'SSL ANALYSIS',        color:'#fb7185'},
//   {id:'score', short:'SCORE', full:'RISK SCORING',        color:'#fb923c'},
// ];

// const Sparkline = ({ data, color='#38bdf8' }) => {
//   const max = Math.max(...data, 1);
//   const w = (data.length - 1) * 5;
//   const pts = data.map((v,i) => `${i*5},${28-(v/max)*24}`).join(' ');
//   const ly = 28 - (data[data.length-1]/max)*24;
//   return (
//     <svg width="100%" height="30" viewBox={`0 0 ${w} 30`} preserveAspectRatio="none">
//       <polyline points={pts} fill="none" stroke={`${color}50`} strokeWidth="1.5"/>
//       <circle cx={w} cy={ly} r="2.5" fill={color}/>
//     </svg>
//   );
// };

// const GTPipeline = ({ si }) => (
//   <div className="gt-pipeline" style={{width:86,background:'#030810',borderRight:'1px solid #0a1628',padding:'16px 0',display:'flex',flexDirection:'column',gap:2,flexShrink:0}}>
//     {STAGES.map((s,i) => {
//       const done=i<si, cur=i===si;
//       return (
//         <React.Fragment key={s.id}>
//           <div style={{display:'flex',alignItems:'center',gap:7,padding:'6px 10px',background:cur?`${s.color}08`:'transparent'}}>
//             <div style={{width:9,height:9,borderRadius:'50%',flexShrink:0,border:`1.5px solid ${done?'#22c55e':cur?s.color:'#0f2040'}`,background:done?'#22c55e20':cur?`${s.color}20`:'transparent',boxShadow:cur?`0 0 6px ${s.color}60`:'none',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
//               {done&&<svg width="5" height="5" viewBox="0 0 6 6" style={{position:'absolute'}}><polyline points="1,3 2.5,5 5,1.5" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/></svg>}
//               {cur&&<div style={{width:4,height:4,borderRadius:'50%',background:s.color,animation:'gt-pulse 1s ease-in-out infinite'}}/>}
//             </div>
//             <span style={{fontSize:7,letterSpacing:'1.5px',fontWeight:700,color:done?'#22c55e50':cur?s.color:'#0f2040'}}>{s.short}</span>
//           </div>
//           {i<STAGES.length-1&&<div style={{width:1,height:5,background:done?'#22c55e20':'#0a1628',marginLeft:14}}/>}
//         </React.Fragment>
//       );
//     })}
//   </div>
// );

// const GTRight = ({ counts, ports, spark, elapsed }) => {
//   const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
//   return (
//     <div className="gt-right" style={{width:158,background:'#030810',borderLeft:'1px solid #0a1628',padding:'12px 10px',display:'flex',flexDirection:'column',gap:12,flexShrink:0,overflowY:'auto'}}>
//       <div>
//         <div style={{fontSize:7,color:'#0f2040',letterSpacing:'2px',marginBottom:8,fontFamily:'monospace'}}>SEVERITY MAP</div>
//         <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
//           {[['CRIT',counts.crit,'#ef4444'],['HIGH',counts.high,'#f97316'],['MED',counts.med,'#f59e0b'],['LOW',counts.low,'#3b82f6']].map(([l,v,c])=>(
//             <div key={l} style={{background:'#04091a',borderRadius:3,padding:'7px 8px',borderLeft:`2px solid ${c}50`}}>
//               <div style={{fontSize:6,color:'#0f2040',letterSpacing:'1px'}}>{l}</div>
//               <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div>
//         <div style={{fontSize:7,color:'#0f2040',letterSpacing:'2px',marginBottom:6}}>OPEN PORTS</div>
//         <div style={{display:'flex',flexDirection:'column',gap:3}}>
//           {ports.length===0&&<div style={{fontSize:8,color:'#0f2040'}}>scanning...</div>}
//           {ports.slice(0,6).map((p,i)=>(
//             <div key={i} style={{display:'flex',justifyContent:'space-between',background:'#04091a',borderRadius:2,padding:'3px 7px'}}>
//               <span style={{fontSize:9,color:'#38bdf8'}}>{p.port}</span>
//               <span style={{fontSize:7,color:'#22c55e'}}>OPEN</span>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div>
//         <div style={{fontSize:7,color:'#0f2040',letterSpacing:'2px',marginBottom:5}}>PACKETS/S</div>
//         <Sparkline data={spark}/>
//       </div>
//       <div style={{marginTop:'auto'}}>
//         <div style={{fontSize:7,color:'#0f2040',letterSpacing:'2px',marginBottom:4}}>ELAPSED</div>
//         <div style={{fontSize:16,color:'#22c55e',fontWeight:700}}>{fmt(elapsed)}</div>
//       </div>
//     </div>
//   );
// };

// const GhostTerminal = ({ si, progress, target, apiDone, scanResult }) => {
//   const [entries,   setEntries]  = useState([]);
//   const [counts,    setCounts]   = useState({crit:0,high:0,med:0,low:0});
//   const [openPorts, setPorts]    = useState([]);
//   const [spark,     setSpark]    = useState(new Array(24).fill(0));
//   const [elapsed,   setElapsed]  = useState(0);
//   const [packets,   setPackets]  = useState(0);
//   const [disp,      setDisp]     = useState(0);
//   const [done,      setDone]     = useState(false);
//   const [glitch,    setGlitch]   = useState(false);
//   const [csi,       setCSI]      = useState(si||0);

//   const endRef     = useRef(null);
//   const procRef    = useRef(false);
//   const phaseRef   = useRef({});

//   const now = () => new Date().toLocaleTimeString('en-US',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});
//   const push = useCallback(e => setEntries(p=>[...p,{...e,time:now()}]),[]);
//   const line = useCallback((pfx,txt) => push({type:'line',pfx,txt}),[push]);
//   const cmd  = useCallback(txt => push({type:'cmd',txt}),[push]);
//   const sp   = useCallback(()   => push({type:'sp'}),[push]);

//   useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}); },[entries]);
//   useEffect(()=>{ const t=setInterval(()=>setElapsed(e=>e+1),1000); return()=>clearInterval(t); },[]);
//   useEffect(()=>{
//     const t=setInterval(()=>{
//       const d=Math.floor(Math.random()*160+60);
//       setPackets(p=>p+d); setSpark(p=>[...p.slice(1),d]);
//     },300);
//     return()=>clearInterval(t);
//   },[]);
//   useEffect(()=>{ setCSI(si); },[si]);
//   useEffect(()=>{
//     const tgt = apiDone ? progress : Math.min(progress,84);
//     setDisp(p => tgt>p ? tgt : p);
//   },[progress,apiDone]);

//   // Ambient phase logs
//   useEffect(()=>{
//     if(apiDone||phaseRef.current[si]) return;
//     phaseRef.current[si]=true;
//     const scripts=[
//       ()=>{ sp(); cmd(`whitenx --target ${target} --mode full`); setTimeout(()=>line('INF','Initializing scan engine v2.4.1'),300); setTimeout(()=>line('INF','CVE database loaded — 48,291 entries'),900); setTimeout(()=>line('OK','Engine ready'),1400); setTimeout(()=>{ sp(); cmd(`nmap -sV -sC -T4 ${target}`); },1800); setTimeout(()=>line('INF',`Resolving DNS: ${target}`),2400); setTimeout(()=>line('OK','Host is up — ICMP echo received'),3100); setTimeout(()=>line('INF','⏱  Full scan takes 2-3 min — please wait'),3800); },
//       ()=>{ sp(); cmd(`nmap -p- --min-rate 5000 ${target}`); setTimeout(()=>line('INF','SYN scan — 65535 ports'),400); setTimeout(()=>line('INF','Probing common service ranges'),1500); setTimeout(()=>line('INF','Adjusting scan rate — stealth mode'),2600); },
//       ()=>{ sp(); cmd(`nmap -sV --version-intensity 9 ${target}`); setTimeout(()=>line('INF','Sending service probes'),500); setTimeout(()=>line('INF','Banner grabbing active'),1400); setTimeout(()=>line('INF','Version fingerprinting in progress'),2300); },
//       ()=>{ sp(); cmd(`whitenx --cve-match --target ${target}`); setTimeout(()=>line('INF','Querying NVD — matching versions'),400); setTimeout(()=>line('INF','Cross-referencing CVSS scores'),1400); setTimeout(()=>line('WRN','Potential matches found — verifying'),2500); },
//       ()=>{ sp(); cmd(`whitenx --osint ${target}`); setTimeout(()=>line('INF','WHOIS lookup initiated'),400); setTimeout(()=>line('INF','Certificate transparency — crt.sh'),1200); setTimeout(()=>line('INF','Passive Shodan intelligence'),2000); },
//       ()=>{ sp(); cmd(`whitenx --ssl-check ${target}`); setTimeout(()=>line('INF','TLS handshake initiated'),400); setTimeout(()=>line('INF','Inspecting certificate chain'),1200); setTimeout(()=>line('INF','Cipher suite enumeration'),2000); },
//       ()=>{ sp(); cmd(`whitenx --risk-score ${target}`); setTimeout(()=>line('INF','Computing CVSS v3.1 base scores'),400); setTimeout(()=>line('INF','Building attack surface map'),1200); setTimeout(()=>line('INF','Finalizing risk report...'),2000); },
//     ];
//     scripts[si]?.();
//   },[si,apiDone]);

//   // Real data render
//   useEffect(()=>{
//     if(!apiDone||!scanResult||procRef.current) return;
//     procRef.current=true;
//     const r=scanResult;
//     const vulns    = r.vulnerabilities||[];
//     const services = r.fingerprinted_services||r.services||[];
//     const ports    = r.port_scan?.services||r.port_scan?.open_ports||[];
//     const subdoms  = r.subdomain_enum?.subdomains||r.subdomains||[];
//     const osint    = r.osint||{};
//     const ssl      = r.ssl_analysis||{};
//     let delay=400;
//     const d=ms=>{ delay+=ms; return delay; };

//     push({type:'sep',time:now()});
//     cmd('# REAL SCAN DATA — rendering results');

//     if(ports.length>0){
//       setTimeout(()=>{ sp(); cmd('# PORT SCAN RESULTS'); },d(400));
//       ports.forEach((p,i)=>setTimeout(()=>{
//         const port=p.port; const svc=p.service||'unknown'; const ver=p.version?` v${p.version}`:'';
//         setPorts(prev=>[...prev,{port,svc}]);
//         if([3306,5432,27017,6379,1433].includes(port)){ line('WRN',`PORT ${port}/tcp  OPEN  ${svc}${ver}  ← database exposed`); setCounts(c=>({...c,high:c.high+1})); }
//         else if(port===22||port===23){ line('WRN',`PORT ${port}/tcp  OPEN  ${svc}${ver}  ← remote access`); setCounts(c=>({...c,low:c.low+1})); }
//         else { line('OK',`PORT ${port}/tcp  OPEN  ${svc}${ver}`); }
//       }, d(0)+i*380));
//     }

//     if(services.length>0){
//       setTimeout(()=>{ sp(); cmd('# SERVICE FINGERPRINT'); },d(ports.length*380+500));
//       services.slice(0,8).forEach((s,i)=>setTimeout(()=>{
//         line('OK',`Port ${s.port}  ${s.service_name||s.service}${s.version?` v${s.version}`:''}`);
//       },d(0)+i*300));
//     }

//     if(vulns.length>0){
//       setTimeout(()=>{ sp(); cmd('# VULNERABILITY ANALYSIS'); },d(services.length*300+500));
//       vulns.forEach((v,i)=>{
//         const sev=(v.severity||'').toUpperCase();
//         setTimeout(()=>{
//           if(sev==='CRITICAL'){
//             setGlitch(true); setTimeout(()=>setGlitch(false),300);
//             setTimeout(()=>{
//               setEntries(p=>[...p,{type:'crit',time:now(),id:v.type||'CRITICAL',rows:[
//                 {k:'CVSS',   v:(v.cvss||'9.0+')+' / 10.0', danger:true},
//                 {k:'PORT',   v:String(v.port||'multi')},
//                 {k:'DETAIL', v:(v.recommendation||'Immediate remediation required').substring(0,65)},
//                 {k:'ACTION', v:'PATCH IMMEDIATELY', danger:true},
//               ]}]);
//               setCounts(c=>({...c,crit:c.crit+1}));
//             },320);
//           } else if(sev==='HIGH'){
//             setEntries(p=>[...p,{type:'high',time:now(),id:v.type||'HIGH',rows:[
//               {k:'PORT',   v:String(v.port||'N/A')},
//               {k:'DETAIL', v:(v.recommendation||'').substring(0,65)},
//             ]}]);
//             setCounts(c=>({...c,high:c.high+1}));
//           } else if(sev==='MEDIUM'){
//             line('WRN',`[MED] ${v.type}  port ${v.port||'N/A'}`);
//             setCounts(c=>({...c,med:c.med+1}));
//           } else {
//             line('INF',`[LOW] ${v.type}  port ${v.port||'N/A'}`);
//             setCounts(c=>({...c,low:c.low+1}));
//           }
//         }, d(0)+i*600);
//       });
//     }

//     if(osint?.status==='completed'){
//       setTimeout(()=>{
//         sp(); cmd('# OSINT');
//         if(osint.whois?.registrar)       setTimeout(()=>line('OK', `Registrar: ${osint.whois.registrar}`),200);
//         if(osint.whois?.country)         setTimeout(()=>line('INF',`Country: ${osint.whois.country}`),600);
//         if(osint.dns?.a_records?.length) setTimeout(()=>line('OK', `A records: ${osint.dns.a_records.slice(0,3).join(', ')}`),1000);
//         if(subdoms.length>0)             setTimeout(()=>line('WRN',`Subdomains: ${subdoms.length} discovered`),1400);
//         const miss=Object.entries(osint.http?.security_headers||{}).filter(([,v])=>!v);
//         if(miss.length>0) setTimeout(()=>line('WRN',`Missing security headers: ${miss.length}`),1800);
//       },d(vulns.length*600+600));
//     }

//     if(ssl?.certificates?.length>0){
//       setTimeout(()=>{
//         sp(); cmd('# SSL');
//         const cert=ssl.certificates[0];
//         setTimeout(()=>line('INF',`Subject: ${cert.subject||'N/A'}`),200);
//         setTimeout(()=>line('INF',`Issuer: ${cert.issuer||'N/A'}`),600);
//         if(cert.expiry_days<30){ setTimeout(()=>{ line('WRN',`Expires in ${cert.expiry_days} days — RENEW NOW`); setCounts(c=>({...c,med:c.med+1})); },1000); }
//         else { setTimeout(()=>line('OK',`Valid — ${cert.expiry_days} days remaining`),1000); }
//       },d(500));
//     }

//     setTimeout(()=>{ sp(); line('OK','══════════ SCAN COMPLETE — REPORT READY ══════════'); setDisp(100); setDone(true); },d(2400));
//   },[apiDone,scanResult]);

//   const cs = STAGES[csi]||STAGES[0];
//   const pfxC = {INF:'#3b82f6',OK:'#22c55e',WRN:'#f59e0b',ERR:'#ef4444'};
//   const msgC = {INF:'#1e3a5f',OK:'#1e4a2f',WRN:'#3a2e0a',ERR:'#3a0a0a'};

//   return (
//     <div className={glitch?'gt-glitch':''} style={{position:'fixed',inset:0,background:'#000',zIndex:9999,display:'flex',flexDirection:'column',overflow:'hidden',fontFamily:'monospace'}}>
//       {/* TOP */}
//       <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',height:40,background:'#030810',borderBottom:'1px solid #0a1628',flexShrink:0}}>
//         <div style={{display:'flex',alignItems:'center',gap:10}}>
//           <span style={{fontSize:11,fontWeight:800,letterSpacing:'3px',color:'#e2e8f0'}}>⚡ WHITENX</span>
//           <span style={{fontSize:8,fontWeight:700,letterSpacing:'2px',border:`1px solid ${done?'#22c55e40':`${cs.color}33`}`,color:done?'#22c55e':cs.color,padding:'2px 8px',borderRadius:2,background:done?'#22c55e08':`${cs.color}08`}}>
//             {done?'SCAN COMPLETE':'GHOST TERMINAL'}
//           </span>
//         </div>
//         <div style={{display:'flex',alignItems:'center',gap:16}}>
//           {[{l:'TARGET',v:target,c:'#e2e8f0'},{l:'PHASE',v:`${csi+1}/7`,c:cs.color},{l:'THREATS',v:counts.crit+counts.high+counts.med+counts.low,c:(counts.crit+counts.high)>0?'#ef4444':'#374151'}].map(s=>(
//             <div key={s.l} style={{display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
//               <span style={{fontSize:6,color:'#0f2040',letterSpacing:'1.5px'}}>{s.l}</span>
//               <span style={{fontSize:10,color:s.c,fontWeight:600}}>{s.v}</span>
//             </div>
//           ))}
//           <div style={{width:6,height:6,borderRadius:'50%',background:done?'#22c55e':cs.color,boxShadow:`0 0 8px ${done?'#22c55e':cs.color}`,animation:'gt-pulse 1.5s ease-in-out infinite'}}/>
//         </div>
//       </div>

//       {!done&&!apiDone&&(
//         <div style={{background:'#0d1a00',borderBottom:'1px solid #22c55e20',padding:'6px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
//           <div style={{display:'flex',alignItems:'center',gap:8}}>
//             <span style={{width:5,height:5,borderRadius:'50%',background:'#f59e0b',display:'inline-block',boxShadow:'0 0 6px #f59e0b',flexShrink:0,animation:'gt-pulse 1.5s ease-in-out infinite'}}/>
//             <span style={{fontSize:9,color:'#f59e0b',letterSpacing:'1.5px',fontWeight:700}}>DEEP SCAN IN PROGRESS — Please keep this tab open</span>
//           </div>
//           <span style={{fontSize:9,color:'#1e3a5f',letterSpacing:'1px'}}>Estimated time: 2-3 minutes</span>
//         </div>
//       )}
//       {apiDone&&!done&&(
//         <div style={{background:'#00100a',borderBottom:'1px solid #22c55e20',padding:'6px 16px',display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
//           <span style={{width:5,height:5,borderRadius:'50%',background:'#22c55e',display:'inline-block',boxShadow:'0 0 6px #22c55e',flexShrink:0,animation:'gt-pulse 1s ease-in-out infinite'}}/>
//           <span style={{fontSize:9,color:'#22c55e',letterSpacing:'1.5px',fontWeight:700}}>Scan complete — rendering report...</span>
//         </div>
//       )}

//       <div style={{flex:1,display:'flex',overflow:'hidden',minHeight:0}}>
//         <GTPipeline si={csi}/>
//         <div style={{flex:1,background:'#000',display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
//           <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 14px',borderBottom:'1px solid #050505',flexShrink:0}}>
//             <span style={{fontSize:9,color:'#0f2040'}}>whitenx@probe:<span style={{color:'#38bdf8'}}>~/scan/{target}</span>$</span>
//             <span style={{fontSize:8,color:'#0a1628',letterSpacing:'1px'}}>{cs.full}</span>
//           </div>
//           <div style={{flex:1,overflowY:'auto',padding:'10px 14px',scrollbarWidth:'none'}}>
//             {entries.map((e,i)=>{
//               if(e.type==='sp')  return <div key={i} style={{height:8}}/>;
//               if(e.type==='sep') return <div key={i} style={{borderTop:'1px solid #0a1628',margin:'10px 0'}}/>;
//               if(e.type==='cmd') return (
//                 <div key={i} className="gt-line" style={{display:'flex',gap:8,marginBottom:8,fontSize:11}}>
//                   <span style={{color:'#22c55e'}}>$</span>
//                   <span style={{color:'#1e3a5f'}}>{e.txt}</span>
//                 </div>
//               );
//               if(e.type==='crit') return (
//                 <div key={i} style={{margin:'8px 0 12px',borderLeft:'3px solid #ef4444',background:'#0d0000',padding:'10px 14px',animation:'gt-critin .4s cubic-bezier(.22,1,.36,1) both',position:'relative'}}>
//                   <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,#ef444408,transparent)',pointerEvents:'none'}}/>
//                   <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
//                     <span style={{fontSize:7,fontWeight:700,letterSpacing:'2px',color:'#ef4444',background:'#ef444415',border:'1px solid #ef444440',padding:'2px 8px',borderRadius:2}}>⚠ CRITICAL</span>
//                     <span style={{fontSize:10,color:'#ef4444'}}>{e.id}</span>
//                   </div>
//                   {e.rows.map((r,ri)=>(
//                     <div key={ri} style={{display:'flex',gap:8,fontSize:10}}>
//                       <span style={{color:'#374151',minWidth:60}}>{r.k}</span>
//                       <span style={{color:r.danger?'#ef4444':'#6b7280'}}>{r.v}</span>
//                     </div>
//                   ))}
//                 </div>
//               );
//               if(e.type==='high') return (
//                 <div key={i} style={{margin:'6px 0 10px',borderLeft:'3px solid #f97316',background:'#0d0500',padding:'8px 14px',animation:'gt-critin .4s cubic-bezier(.22,1,.36,1) both'}}>
//                   <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
//                     <span style={{fontSize:7,fontWeight:700,letterSpacing:'2px',color:'#f97316',background:'#f9731615',border:'1px solid #f9731640',padding:'2px 7px',borderRadius:2}}>HIGH</span>
//                     <span style={{fontSize:10,color:'#f97316'}}>{e.id}</span>
//                   </div>
//                   {e.rows.map((r,ri)=>(
//                     <div key={ri} style={{display:'flex',gap:8,fontSize:10}}>
//                       <span style={{color:'#374151',minWidth:60}}>{r.k}</span>
//                       <span style={{color:'#6b7280'}}>{r.v}</span>
//                     </div>
//                   ))}
//                 </div>
//               );
//               const isLast=i===entries.length-1;
//               const pfx=e.pfx||'INF';
//               return (
//                 <div key={i} className="gt-line" style={{display:'flex',gap:7,padding:'1px 0',fontSize:10.5,lineHeight:1.75}}>
//                   <span style={{color:'#0f2040',fontSize:9,minWidth:50,flexShrink:0}}>[{e.time}]</span>
//                   <span style={{color:pfxC[pfx]||'#3b82f6',fontWeight:700,fontSize:9,minWidth:22,flexShrink:0}}>{pfx}</span>
//                   <span style={{color:msgC[pfx]||'#1e3a5f',fontFamily:'monospace'}}>
//                     {e.txt}{isLast&&!done&&<span className="gt-cursor">█</span>}
//                   </span>
//                 </div>
//               );
//             })}
//             <div ref={endRef}/>
//           </div>
//         </div>
//         <GTRight counts={counts} ports={openPorts} spark={spark} elapsed={elapsed}/>
//       </div>

//       <div style={{height:30,background:'#030810',borderTop:'1px solid #0a1628',display:'flex',alignItems:'center',padding:'0 16px',gap:10,flexShrink:0}}>
//         <span style={{fontSize:7,color:'#0a1628',letterSpacing:'1.5px',flexShrink:0,minWidth:70}}>
//           {done?'COMPLETE':apiDone?'PROCESSING':'SCANNING'}
//         </span>
//         <div style={{flex:1,height:2,background:'#0a1628',borderRadius:1,overflow:'hidden'}}>
//           <div style={{height:'100%',width:`${disp}%`,background:done?'#22c55e':cs.color,borderRadius:1,transition:'width .6s ease,background .5s ease',boxShadow:`0 0 8px ${done?'#22c55e':cs.color}40`}}/>
//         </div>
//         <span style={{fontSize:9,fontWeight:700,color:done?'#22c55e':cs.color,minWidth:28,textAlign:'right'}}>{disp}%</span>
//         {!done&&!apiDone&&(
//           <span style={{fontSize:8,color:'#1e3a5f',flexShrink:0,minWidth:90,textAlign:'right',letterSpacing:'1px'}}>
//             ETA ~{Math.max(0,Math.round((84-disp)/0.112*0.2/60))}m {Math.max(0,Math.round(((84-disp)/0.112*0.2)%60))}s
//           </span>
//         )}
//         {apiDone&&!done&&(
//           <span style={{fontSize:8,color:cs.color,flexShrink:0,letterSpacing:'1px'}}>rendering results...</span>
//         )}
//         {done&&(
//           <span style={{fontSize:8,color:'#22c55e',flexShrink:0,letterSpacing:'1px'}}>report ready</span>
//         )}
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

// const StatCard = ({ label, val, color, sub, icon, delay='0s' }) => (
//   <div className="wx-stat" style={{'--stat-color':color,animationDelay:delay}}>
//     {icon&&<span className="wx-stat-icon">{icon}</span>}
//     <div className="wx-stat-label">{label}</div>
//     <div className="wx-stat-val">{val}</div>
//     {sub&&<div className="wx-stat-sub">{sub}</div>}
//   </div>
// );

// const WxCard = ({ title, badge, children }) => (
//   <div className="wx-card">
//     <div className="wx-card-hdr">
//       <div className="wx-card-title">{title}</div>
//       {badge&&<span style={{fontSize:9,color:'#1e3a5f'}}>{badge}</span>}
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
//           ?<tr><td colSpan={cols.length} style={{textAlign:'center',color:'#1e3a5f',padding:28}}>{empty}</td></tr>
//           :rows}
//       </tbody>
//     </table>
//   </div>
// );

// // ════════════════════════════════════════════════════════════
// // DASHBOARD
// // ════════════════════════════════════════════════════════════
// const Dashboard = () => {
//   const [domain,     setDomain]    = useState('');
//   const [result,     setResult]    = useState(null);
//   const [liveRes,    setLiveRes]   = useState(null);
//   const [jsonData,   setJsonData]  = useState(null);
//   const [err,        setErr]       = useState('');
//   const [tab,        setTab]       = useState('overview');
//   const [chartData,  setChartData] = useState(null);
//   const [showJson,   setShowJson]  = useState(false);
//   const [scanning,   setScanning]  = useState(false);
//   const [si,         setSI]        = useState(0);
//   const [prog,       setProg]      = useState(0);
//   const [apiDone,    setApiDone]   = useState(false);

//   const timersRef = useRef([]);
//   const progRef   = useRef(null);

//   useEffect(()=>{ injectCSS(); },[]);

//   const procData = r => {
//     if(!r) return null;
//     const v=r.vulnerabilities||[];
//     const p=r.port_scan?.services||r.port_scan?.open_ports||[];
//     const crit=v.filter(x=>['CRITICAL','HIGH'].includes(x.severity)).length;
//     const med=v.filter(x=>x.severity==='MEDIUM').length;
//     const low=v.filter(x=>x.severity==='LOW').length;
//     return {
//       trend:{series:[{name:'Critical/High',data:Array(7).fill(crit)},{name:'Medium',data:Array(7).fill(med)}],cats:['Mon','Tue','Wed','Thu','Fri','Sat','Sun']},
//       sev:[crit,med,low], ports:p.length,
//     };
//   };

//   const handleScan = async () => {
//     if(!domain.trim()){setErr('Please enter a target');return;}
//     setErr('');setResult(null);setLiveRes(null);setJsonData(null);setApiDone(false);
//     setScanning(true);setSI(0);setProg(0);

//     // Ask notification permission RIGHT when scan starts
//     if('Notification' in window && Notification.permission === 'default') {
//       await Notification.requestPermission();
//     }

//     // Stage progression — spread across ~2.5 min to match real scan time
//     // RECON=15s, PORTS=22s, SVCFP=22s, VULNS=28s, OSINT=24s, SSL=18s, SCORE=15s = 144s total
//     const dur=[15000,22000,22000,28000,24000,18000,15000];
//     let cum=0;
//     timersRef.current=dur.map((d,i)=>{ const t=setTimeout(()=>setSI(i),cum); cum+=d; return t; });
//     // 84% over 150s → ~0.112% per 200ms tick
//     progRef.current=setInterval(()=>setProg(p=>p>=84?84:+(p+0.112).toFixed(3)),200);

//     try {
//       const res=await fetch(`${API_BASE}/scan/full?target=${domain}`,{method:'GET',headers:{'Accept':'application/json'}});
//       if(!res.ok) throw new Error(`Scan failed: ${res.status}`);
//       const data=await res.json();
//       timersRef.current.forEach(clearTimeout);
//       clearInterval(progRef.current);
//       setSI(6);setProg(90);setApiDone(true);setLiveRes(data);

//       // Fire notification when scan is done
//       if('Notification' in window && Notification.permission === 'granted') {
//         const vulns = data.vulnerabilities || [];
//         const crit  = vulns.filter(v=>v.severity==='CRITICAL').length;
//         const high  = vulns.filter(v=>v.severity==='HIGH').length;
//         const ports = data.port_scan?.services?.length || data.port_scan?.open_ports?.length || 0;

//         new Notification('⚡ WHITENX — Scan Complete', {
//           body: `Target: ${domain}\n${crit} Critical  ${high} High  ${ports} Open Ports\nClick to view full report →`,
//           icon: '/favicon.ico',
//           badge: '/favicon.ico',
//           tag: 'whitenx-scan',          // replaces old notification if still showing
//           requireInteraction: true,      // stays until user clicks — doesn't auto-dismiss
//         });
//       }

//       setTimeout(()=>{
//         setScanning(false);setJsonData(data);setResult(data);setChartData(procData(data));
//       },4200);
//     } catch(e){
//       timersRef.current.forEach(clearTimeout);
//       clearInterval(progRef.current);
//       setScanning(false);setErr(e.message||'Backend unavailable');

//       // Notify even on error
//       if('Notification' in window && Notification.permission === 'granted') {
//         new Notification('⚡ WHITENX — Scan Failed', {
//           body: `Target: ${domain}\nError: ${e.message||'Backend unavailable'}`,
//           icon: '/favicon.ico',
//           tag: 'whitenx-scan',
//         });
//       }
//     }
//   };

//   if(scanning) return <GhostTerminal si={si} progress={Math.round(prog)} target={domain} apiDone={apiDone} scanResult={liveRes}/>;

//   if(showJson&&jsonData) return (
//     <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#000'}}>
//       <nav className="wx-nav">
//         <span className="wx-logo">⚡ WHITENX</span>
//         <button className="wx-btn" onClick={()=>setShowJson(false)}>← BACK</button>
//       </nav>
//       <div style={{flex:1,overflow:'auto',padding:20}}>
//         <div style={{fontSize:9,color:'#1e3a5f',letterSpacing:'2px',marginBottom:12}}>RAW SCAN OUTPUT — JSON</div>
//         <pre style={{background:'#04091a',border:'1px solid #0f2040',borderRadius:6,padding:20,overflow:'auto',fontSize:11,color:'#374151',maxHeight:'80vh'}}>{JSON.stringify(jsonData,null,2)}</pre>
//       </div>
//     </div>
//   );

//   if(!result) return (
//     <div className="wx-hero">
//       <div className="wx-hero-grid"/>
//       <div style={{position:'relative',zIndex:10,display:'flex',flexDirection:'column',alignItems:'center',width:'100%'}}>
//         {/* Live decorative elements */}
//         <div style={{display:'flex',gap:6,marginBottom:24,flexWrap:'wrap',justifyContent:'center'}}>
//           {['RECON','PORT SCAN','CVE MATCH','OSINT','SSL AUDIT'].map(t=>(
//             <span key={t} style={{fontSize:7,color:'#1e3a5f',border:'1px solid #0f2040',padding:'3px 10px',borderRadius:2,letterSpacing:'1.5px'}}>{t}</span>
//           ))}
//         </div>
//         <div className="wx-hero-title">WHITENX</div>
//         <div className="wx-hero-sub">VULNERABILITY ASSESSMENT PLATFORM</div>
//         <div className="wx-hero-desc">Professional penetration testing and security analysis</div>
//         {err&&<div className="wx-err">{err}</div>}
//         <div className="wx-input-row">
//           <input className="wx-input" placeholder="example.com or 192.168.1.1" value={domain}
//             onChange={e=>setDomain(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleScan()}/>
//           <button className="wx-scan-btn" onClick={handleScan}>SCAN →</button>
//         </div>
//         <div style={{marginTop:12,display:'flex',alignItems:'center',gap:8,fontSize:10,color:'#1e3a5f'}}>
//           <span style={{width:5,height:5,borderRadius:'50%',background:'#f59e0b',display:'inline-block',boxShadow:'0 0 6px #f59e0b',flexShrink:0}}/>
//           Full scan takes 2–3 minutes — please keep this tab open
//         </div>
//         {/* Feature list */}
//         <div style={{marginTop:48,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,width:'100%',maxWidth:600}}>
//           {[
//             {icon:'🔍',label:'Port Scanning',desc:'Full 65535 port sweep'},
//             {icon:'🛡️',label:'CVE Detection',desc:'48,000+ vulnerability DB'},
//             {icon:'🌐',label:'OSINT Intel',desc:'WHOIS, DNS, crt.sh'},
//             {icon:'🔒',label:'SSL Analysis',desc:'Certificate & cipher check'},
//           ].map(f=>(
//             <div key={f.label} style={{background:'#04091a',border:'1px solid #0a1628',borderRadius:8,padding:'16px 18px',textAlign:'left',transition:'border-color .2s'}}
//               onMouseOver={e=>e.currentTarget.style.borderColor='#1e3a5f'}
//               onMouseOut={e=>e.currentTarget.style.borderColor='#0a1628'}>
//               <div style={{fontSize:20,marginBottom:8}}>{f.icon}</div>
//               <div style={{fontSize:10,fontWeight:700,letterSpacing:'1.5px',color:'#38bdf8',marginBottom:4}}>{f.label}</div>
//               <div style={{fontSize:9,color:'#1e3a5f'}}>{f.desc}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   // Extract data
//   const vulns   = result.vulnerabilities||[];
//   const svcs    = result.fingerprinted_services||result.services||[];
//   const ports   = result.port_scan?.services||result.port_scan?.open_ports||[];
//   const subds   = result.subdomain_enum?.subdomains||result.subdomains||[];
//   const osint   = result.osint||{};
//   const webA    = result.web_analysis||{};
//   const sslA    = result.ssl_analysis||{};
//   const vectors = result.attack_vectors||[];
//   const recs    = result.recommendations||[];
//   const hdrs    = osint.http?.security_headers||{};
//   const atk     = webA.attack_surface||[];

//   const crit=vulns.filter(v=>v.severity==='CRITICAL').length;
//   const high=vulns.filter(v=>v.severity==='HIGH').length;
//   const med =vulns.filter(v=>v.severity==='MEDIUM').length;
//   const low =vulns.filter(v=>v.severity==='LOW').length;

//   const TABS=['Overview','Vulnerabilities','Services','Ports','Subdomains','OSINT','Full Report'];

//   const chartOpts = {
//     chart:{toolbar:{show:false},background:'transparent',fontFamily:'JetBrains Mono, monospace'},
//     grid:{borderColor:'#0a1628'},
//     tooltip:{theme:'dark'},
//     legend:{labels:{colors:'#1e3a5f'},fontSize:'9px'},
//   };

//   return (
//     <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#04091a'}}>
//       <nav className="wx-nav">
//         <span className="wx-logo">⚡ WHITENX</span>
//         <div className="wx-tabs">
//           {TABS.map(t=>(
//             <button key={t} className={`wx-tab${tab===t.toLowerCase().replace(' ','')?' active':''}`}
//               onClick={()=>setTab(t.toLowerCase().replace(' ',''))}>{t}</button>
//           ))}
//         </div>
//         <div style={{display:'flex',gap:6}}>
//           <button className="wx-btn" onClick={()=>{setDomain('');setResult(null);setChartData(null);setJsonData(null);}}>↩ NEW</button>
//           {jsonData&&<button className="wx-btn" style={{color:'#fff',borderColor:'rgba(255,255,255,.18)'}} onClick={()=>setShowJson(true)}>JSON</button>}
//         </div>
//       </nav>

//       <div className="wx-body">
//         {/* Report header */}
//         <div className="wx-rpt-hdr">
//           <div>
//             <div className="wx-rpt-title">SECURITY ASSESSMENT REPORT</div>
//             <div className="wx-rpt-meta">Target: <span style={{color:'#38bdf8'}}>{result.target}</span> &nbsp;|&nbsp; ID: {result.scan_id?.substring(0,14)}... &nbsp;|&nbsp; {new Date().toLocaleDateString()}</div>
//           </div>
//           <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
//             {crit>0&&<span className="wx-badge bc">{crit} CRITICAL</span>}
//             {high>0&&<span className="wx-badge bh">{high} HIGH</span>}
//             {med>0&&<span className="wx-badge bm">{med} MEDIUM</span>}
//           </div>
//         </div>

//         {/* ── OVERVIEW ── */}
//         {tab==='overview'&&chartData&&(
//           <>
//             {/* Stats */}
//             <div className="g4 wx-stat-grid">
//               <StatCard label="CRITICAL / HIGH" val={crit+high} color="#ef4444" sub={`${med} medium, ${low} low`} icon="🔴" delay="0s"/>
//               <StatCard label="OPEN PORTS"      val={ports.length} color="#38bdf8"  sub="discovered"           icon="🔌" delay=".05s"/>
//               <StatCard label="SUBDOMAINS"      val={subds.length} color="#a78bfa"  sub="enumerated"           icon="🌐" delay=".1s"/>
//               <StatCard label="SERVICES"        val={svcs.length}  color="#34d399"  sub="fingerprinted"        icon="⚙️" delay=".15s"/>
//             </div>

//             {/* Charts */}
//             <div className="g2">
//               <div className="wx-card">
//                 <div className="wx-card-hdr"><div className="wx-card-title">VULNERABILITY TREND</div></div>
//                 <Chart type="area" series={chartData.trend.series} options={{...chartOpts,colors:['#fff','#bbb'],xaxis:{categories:chartData.trend.cats,labels:{style:{colors:'rgba(255,255,255,.6)',fontSize:'9px'}}},yaxis:{labels:{style:{colors:'rgba(255,255,255,.6)',fontSize:'9px'}}},stroke:{curve:'smooth',width:2},fill:{type:'gradient',gradient:{opacityFrom:.2,opacityTo:.04}}}} height={220}/>
//               </div>
//               <div className="wx-card">
//                 <div className="wx-card-hdr"><div className="wx-card-title">SEVERITY BREAKDOWN</div></div>
//                 <Chart type="donut" series={[crit,high,med,low]} options={{...chartOpts,colors:['#fff','#d4d4d4','#b0b0b0','#888888'],labels:['Critical','High','Medium','Low'],plotOptions:{pie:{donut:{size:'68%',labels:{show:true,total:{show:true,label:'TOTAL',color:'rgba(255,255,255,.6)',fontSize:'9px',fontWeight:700},value:{color:'#fff',fontSize:'20px',fontWeight:800}}}}}}} height={220}/>
//               </div>
//             </div>

//             {/* Services table */}
//             <div className="wx-card">
//               <div className="wx-card-hdr">
//                 <div className="wx-card-title">RUNNING SERVICES</div>
//                 <span style={{fontSize:9,color:'#1e3a5f'}}>{svcs.length} detected</span>
//               </div>
//               <WxTable
//                 cols={['PORT','SERVICE','VERSION','CVEs']}
//                 rows={svcs.map((s,i)=>(
//                   <tr key={i}>
//                     <td><strong style={{color:'#38bdf8'}}>{s.port}</strong></td>
//                     <td style={{color:'#94a3b8'}}>{s.service_name||s.service}</td>
//                     <td>{s.version?<span style={{color:'#34d399',fontSize:10}}>{s.version}</span>:<span style={{color:'#1e3a5f'}}>—</span>}</td>
//                     <td>{s.cves?.length>0?<span className="wx-badge bh">{s.cves.length} CVEs</span>:<span className="wx-badge bn">None</span>}</td>
//                   </tr>
//                 ))}
//               />
//             </div>

//             {/* Top issues */}
//             <div className="wx-card">
//               <div className="wx-card-hdr"><div className="wx-card-title">TOP CRITICAL ISSUES</div></div>
//               <WxTable
//                 cols={['VULNERABILITY','SEVERITY','PORT','RECOMMENDATION']}
//                 rows={vulns.slice(0,6).map((v,i)=>(
//                   <tr key={i}>
//                     <td style={{color:'#94a3b8',maxWidth:180}}>{v.type}</td>
//                     <td><SevBadge s={v.severity}/></td>
//                     <td style={{color:'#38bdf8'}}>{v.port||'—'}</td>
//                     <td style={{fontSize:10,color:'#1e3a5f',maxWidth:240}}>{(v.recommendation||'Review configuration').substring(0,60)}</td>
//                   </tr>
//                 ))}
//               />
//             </div>

//             {/* OSINT mini */}
//             {osint?.osint_score&&(
//               <div className="g3">
//                 <WxCard title="OSINT SCORE">
//                   <Chart type="radialBar" series={[osint.osint_score||0]} options={{...chartOpts,colors:['#fff'],plotOptions:{radialBar:{hollow:{size:'65%'},dataLabels:{value:{fontSize:'22px',color:'#fff',fontWeight:800}}}}}} height={180}/>
//                 </WxCard>
//                 <WxCard title="TRUST LEVEL">
//                   <div style={{height:140,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8}}>
//                     <div style={{fontSize:36,fontWeight:800,color:osint.trust_level==='HIGH'?'#22c55e':osint.trust_level==='MEDIUM'?'#f59e0b':'#ef4444'}}>{osint.trust_level||'?'}</div>
//                     <div style={{fontSize:9,color:'#1e3a5f',letterSpacing:'2px'}}>REPUTATION SCORE</div>
//                   </div>
//                 </WxCard>
//                 <WxCard title="SECURITY HEADERS">
//                   <Chart type="donut" series={[Object.values(hdrs).filter(Boolean).length||1, Object.values(hdrs).filter(v=>v===false).length||0]} options={{...chartOpts,colors:['#fff','#bbb'],labels:['Enabled','Missing'],plotOptions:{pie:{donut:{size:'65%'}}}}} height={180}/>
//                 </WxCard>
//               </div>
//             )}
//           </>
//         )}

//         {/* ── VULNERABILITIES ── */}
//         {tab==='vulnerabilities'&&(
//           <div className="wx-card">
//             <div className="wx-card-hdr">
//               <div className="wx-card-title">ALL VULNERABILITIES</div>
//               <span style={{fontSize:9,color:'#1e3a5f'}}>{vulns.length} total</span>
//             </div>
//             <WxTable cols={['TYPE','SEVERITY','PORT','RECOMMENDATION']}
//               rows={vulns.map((v,i)=>(
//                 <tr key={i}>
//                   <td style={{color:'#94a3b8'}}>{v.type}</td>
//                   <td><SevBadge s={v.severity}/></td>
//                   <td style={{color:'#38bdf8'}}>{v.port||'—'}</td>
//                   <td style={{fontSize:10,color:'#1e3a5f'}}>{(v.recommendation||'Review configuration').substring(0,70)}</td>
//                 </tr>
//               ))} empty="No vulnerabilities detected"
//             />
//           </div>
//         )}

//         {/* ── SERVICES ── */}
//         {tab==='services'&&(
//           <div style={{display:'flex',flexDirection:'column',gap:14}}>
//             <div className="wx-card">
//               <div className="wx-card-hdr"><div className="wx-card-title">FINGERPRINTED SERVICES</div></div>
//               <WxTable cols={['PORT','SERVICE','VERSION','BANNER','CVEs']}
//                 rows={svcs.map((s,i)=>(
//                   <tr key={i}>
//                     <td><strong style={{color:'#38bdf8'}}>{s.port}</strong></td>
//                     <td style={{color:'#94a3b8'}}>{s.service_name||s.service}</td>
//                     <td style={{color:'#34d399',fontSize:10}}>{s.version||'—'}</td>
//                     <td style={{fontSize:10,color:'#1e3a5f',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.banner?s.banner.substring(0,40)+'...':'—'}</td>
//                     <td>{s.cves?.length>0?<span className="wx-badge bh">{s.cves.length}</span>:<span className="wx-badge bn">0</span>}</td>
//                   </tr>
//                 ))}
//               />
//             </div>

//             {Object.keys(hdrs).length>0&&(
//               <div className="wx-card">
//                 <div className="wx-card-hdr"><div className="wx-card-title">SECURITY HEADERS</div></div>
//                 <WxTable cols={['HEADER','STATUS']}
//                   rows={Object.entries(hdrs).map(([k,v])=>(
//                     <tr key={k}><td style={{fontSize:10,color:'#94a3b8'}}>{k}</td><td><SevBadge s={v?'ENABLED':'MISSING'}/></td></tr>
//                   ))}
//                 />
//               </div>
//             )}

//             {sslA?.certificates?.length>0&&(
//               <div className="wx-card">
//                 <div className="wx-card-hdr"><div className="wx-card-title">SSL CERTIFICATE</div></div>
//                 <div className="wx-card-body">
//                   {(()=>{ const c=sslA.certificates[0]; return (
//                     <table className="wx-tbl"><tbody>
//                       {[['Subject',c.subject],['Issuer',c.issuer],['Valid From',c.notBefore],['Valid Until',c.notAfter]].map(([k,v])=>(
//                         <tr key={k}><td style={{color:'#1e3a5f',width:100,fontSize:10}}>{k}</td><td style={{color:'#94a3b8',fontSize:11}}>{v||'—'}</td></tr>
//                       ))}
//                       <tr><td style={{color:'#1e3a5f',fontSize:10}}>Days Left</td><td style={{color:c.expiry_days<30?'#ef4444':'#22c55e',fontWeight:700}}>{c.expiry_days}d</td></tr>
//                     </tbody></table>
//                   );})()}
//                   {sslA.tls_versions&&<div style={{marginTop:10,fontSize:9,color:'#1e3a5f'}}>TLS: {sslA.tls_versions.join(', ')}</div>}
//                 </div>
//               </div>
//             )}

//             {vectors.length>0&&(
//               <div className="wx-card">
//                 <div className="wx-card-hdr"><div className="wx-card-title">ATTACK VECTORS</div></div>
//                 <WxTable cols={['VECTOR','PORT','RISK','DESCRIPTION']}
//                   rows={vectors.map((v,i)=>(
//                     <tr key={i}>
//                       <td style={{fontWeight:700,color:'#e2e8f0'}}>{v.vector}</td>
//                       <td style={{color:'#38bdf8'}}>{v.port||'—'}</td>
//                       <td><SevBadge s={v.risk}/></td>
//                       <td style={{fontSize:10,color:'#1e3a5f'}}>{v.description}</td>
//                     </tr>
//                   ))}
//                 />
//               </div>
//             )}

//             {atk.length>0&&(
//               <div className="wx-card">
//                 <div className="wx-card-hdr"><div className="wx-card-title">ATTACK SURFACE</div><span style={{fontSize:9,color:'#1e3a5f'}}>{atk.length} paths</span></div>
//                 <div style={{maxHeight:260,overflowY:'auto'}}>
//                   <WxTable cols={['PATH','PORT','STATUS CODE']}
//                     rows={atk.slice(0,20).map((a,i)=>(
//                       <tr key={i}>
//                         <td style={{fontSize:10,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#94a3b8'}}>{a.path}</td>
//                         <td>{a.port||'—'}</td>
//                         <td><span className={`wx-badge ${a.status_code===200?'bc':'bl'}`}>{a.status_code}</span></td>
//                       </tr>
//                     ))}
//                   />
//                 </div>
//               </div>
//             )}

//             {webA?.web_ports_analyzed?.length>0&&(
//               <div className="wx-card">
//                 <div className="wx-card-hdr"><div className="wx-card-title">CDN / WAF</div></div>
//                 <WxTable cols={['PORT','CDN','WAF']}
//                   rows={webA.web_ports_analyzed.map((p,i)=>(
//                     <tr key={i}><td style={{color:'#38bdf8'}}>{p.port}</td><td style={{color:'#94a3b8'}}>{p.cdn_waf_detected?.cdn||'—'}</td><td style={{color:'#94a3b8'}}>{p.cdn_waf_detected?.waf||'—'}</td></tr>
//                   ))}
//                 />
//               </div>
//             )}

//             {recs.length>0&&(
//               <WxCard title="RECOMMENDATIONS">
//                 {recs.map((r,i)=>(
//                   <div key={i} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:'1px solid #04091a',fontSize:11,color:'#475569'}}>
//                     <span style={{color:'#1e3a5f',flexShrink:0}}>›</span>{r}
//                   </div>
//                 ))}
//               </WxCard>
//             )}
//           </div>
//         )}

//         {/* ── PORTS ── */}
//         {tab==='ports'&&(
//           <div className="wx-card">
//             <div className="wx-card-hdr"><div className="wx-card-title">PORT SCAN RESULTS</div><span style={{fontSize:9,color:'#1e3a5f'}}>{ports.length} open</span></div>
//             <WxTable cols={['PORT','SERVICE','STATE','VERSION','BANNER']}
//               rows={ports.map((p,i)=>(
//                 <tr key={i}>
//                   <td><strong style={{color:'#38bdf8'}}>{p.port}</strong></td>
//                   <td style={{color:'#94a3b8'}}>{p.service}</td>
//                   <td><SevBadge s={(p.state||'OPEN').toUpperCase()}/></td>
//                   <td style={{fontSize:10,color:'#34d399'}}>{p.version||'—'}</td>
//                   <td style={{fontSize:10,color:'#1e3a5f',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.banner?p.banner.substring(0,45)+'...':'—'}</td>
//                 </tr>
//               ))} empty="No open ports"
//             />
//           </div>
//         )}

//         {/* ── SUBDOMAINS ── */}
//         {tab==='subdomains'&&(
//           <div className="wx-card">
//             <div className="wx-card-hdr"><div className="wx-card-title">SUBDOMAIN ENUMERATION</div><span style={{fontSize:9,color:'#1e3a5f'}}>{subds.length} found</span></div>
//             <WxTable cols={['SUBDOMAIN','STATUS','IP ADDRESSES','URL']}
//               rows={subds.map((s,i)=>(
//                 <tr key={i}>
//                   <td style={{color:'#38bdf8',fontSize:11}}>{s.subdomain||s}</td>
//                   <td><SevBadge s={s.alive?'ALIVE':'DOWN'}/></td>
//                   <td style={{fontSize:10,color:'#1e3a5f'}}>{s.dns_ips?.join(', ')||'—'}</td>
//                   <td style={{fontSize:10,color:'#1e3a5f'}}>{s.url||'—'}</td>
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
//                     <tr key={k}><td style={{color:'#1e3a5f',width:90,fontSize:9}}>{k}</td><td style={{fontSize:11,color:'#94a3b8'}}>{v||'N/A'}</td></tr>
//                   ))}
//                 </tbody></table>
//               </WxCard>
//               <WxCard title="DNS RECORDS">
//                 <table className="wx-tbl"><tbody>
//                   <tr><td style={{color:'#1e3a5f',width:40,fontSize:9}}>A</td><td style={{fontSize:10,color:'#94a3b8'}}>{osint.dns?.a_records?.join(', ')||'None'}</td></tr>
//                   <tr><td style={{color:'#1e3a5f',fontSize:9}}>MX</td><td style={{fontSize:10,color:'#94a3b8'}}>{osint.dns?.mx_records?.map(m=>m.exchange||m).join(', ')||'None'}</td></tr>
//                   <tr><td style={{color:'#1e3a5f',fontSize:9}}>NS</td><td style={{fontSize:10,color:'#94a3b8'}}>{osint.dns?.ns_records?.slice(0,3).join(', ')||'None'}</td></tr>
//                   <tr><td style={{color:'#1e3a5f',fontSize:9}}>TXT</td><td style={{fontSize:10,color:'#94a3b8'}}>{osint.dns?.txt_records?.slice(0,2).join(', ')||'None'}</td></tr>
//                 </tbody></table>
//               </WxCard>
//             </div>
//             {osint.ssl&&(
//               <WxCard title="SSL INTELLIGENCE">
//                 <table className="wx-tbl"><tbody>
//                   {[['Issuer CN',osint.ssl.issuer?.CN],['Subject CN',osint.ssl.subject?.CN],['Not Before',osint.ssl.validity?.notBefore],['Not After',osint.ssl.validity?.notAfter]].map(([k,v])=>(
//                     <tr key={k}><td style={{color:'#1e3a5f',width:100,fontSize:9}}>{k}</td><td style={{fontSize:10,color:'#94a3b8'}}>{v||'N/A'}</td></tr>
//                   ))}
//                 </tbody></table>
//               </WxCard>
//             )}
//             {Object.keys(hdrs).length>0&&(
//               <WxCard title="HTTP SECURITY HEADERS">
//                 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:8}}>
//                   {Object.entries(hdrs).map(([k,v])=>(
//                     <div key={k} style={{background:'#04091a',border:`1px solid ${v?'#22c55e15':'#ef444415'}`,borderLeft:`3px solid ${v?'#22c55e':'#ef4444'}`,borderRadius:4,padding:'8px 12px'}}>
//                       <div style={{fontSize:8,color:v?'#22c55e50':'#ef444450',letterSpacing:'1px',marginBottom:4,fontWeight:700}}>{v?'ENABLED':'MISSING'}</div>
//                       <div style={{fontSize:10,color:'#475569'}}>{k}</div>
//                     </div>
//                   ))}
//                 </div>
//               </WxCard>
//             )}
//             {osint.certificate_transparency?.length>0&&(
//               <WxCard title="CERTIFICATE TRANSPARENCY">
//                 <WxTable cols={['COMMON NAME','NOT BEFORE','NOT AFTER']}
//                   rows={osint.certificate_transparency.slice(0,5).map((e,i)=>(
//                     <tr key={i}>
//                       <td style={{color:'#38bdf8',fontSize:10}}>{e.common_name}</td>
//                       <td style={{fontSize:9,color:'#1e3a5f'}}>{e.not_before}</td>
//                       <td style={{fontSize:9,color:'#1e3a5f'}}>{e.not_after}</td>
//                     </tr>
//                   ))}
//                 />
//               </WxCard>
//             )}
//           </div>
//         )}

//         {/* ── FULL REPORT ── */}
//         {tab==='fullreport'&&(
//           <CompleteReport
//             scanResult={result}
//             fingerprintedServices={svcs}
//             vulns={vulns}
//             ports={ports}
//             subdomains={subds}
//             osint={osint}
//             onExportPDF={()=>exportToPDF(result,svcs,vulns,ports,subds,osint)}
//           />
//         )}

//         <div style={{height:30}}/>
//       </div>
//     </div>
//   );
// };

// // ════════════════════════════════════════════════════════════
// // ROOT APP
// // ════════════════════════════════════════════════════════════
// function App() {
//   const [stage, setStage] = useState('legal');
//   useEffect(()=>{
//     injectCSS();
//     // Kill splash the instant React mounts — eliminates flash
//     if (typeof window.wxHideSplash === 'function') window.wxHideSplash();
//   },[]);
//   return (
//     <>
//       {stage==='legal'    && <LegalPage  onAccept={()=>setStage('login')}/>}
//       {stage==='login'    && <LoginPage  onLogin={()=>setStage('dashboard')}/>}
//       {stage==='dashboard'&& <Dashboard/>}
//     </>
//   );
// }

// export default App;


// import React, { useState, useEffect } from 'react';
// import Chart from 'react-apexcharts';
// import './App.css';

// // ──────────────────────────────────────────────────────────────
// // Legal Page
// // ──────────────────────────────────────────────────────────────
// const LegalPage = ({ onAccept }) => {
//   return (
//     <div className="legal-page-wrapper">
//       <div className="legal-container">
//         {/* Top restricted banner */}
//         <div className="restricted-banner">
//           <span className="restricted-text">RESTRICTED ACCESS – AUTHORIZED PERSONNEL ONLY</span>
//         </div>

//         {/* Main warning box */}
//         <div className="warning-box">
//           <h1 className="critical-heading">
//             WARNING: UNAUTHORIZED ACCESS TO THIS SYSTEM IS STRICTLY PROHIBITED
//             <br />
//             AND IS PUNISHABLE UNDER MULTIPLE NATIONAL AND INTERNATIONAL LAWS.
//           </h1>

//           <div className="declaration-section">
//             <h2 className="section-title">MANDATORY DECLARATION & ACCEPTANCE</h2>
//             <p className="declaration-text">
//               By clicking below you solemnly declare under penalty of perjury that:
//             </p>
//             <ul className="declaration-list">
//               <li>You have <strong>explicit written permission</strong> from the target system owner.</li>
//               <li>You will <strong>NEVER</strong> use this platform or any output against any system without valid authorization.</li>
//               <li>All actions, IP addresses, timestamps, commands, and keystrokes are <strong>logged and fully auditable</strong>.</li>
//               <li>You accept <strong>full criminal, civil, and financial liability</strong> for any misuse.</li>
//               <li>You will immediately cease activity and self-report any unauthorized access.</li>
//               <li>You are of <strong>legal age (18+)</strong> and legally competent.</li>
//             </ul>
//           </div>

//           <div className="laws-section">
//             <h2 className="section-title">APPLICABLE LAWS & ZERO TOLERANCE</h2>
//             <ul className="laws-list">
//               <li><strong>India</strong>: Information Technology Act, 2000 – Sections 43, 66, 66F, 67, 69, 70, 72, 72A, 75</li>
//               <li><strong>India</strong>: Bharatiya Nyaya Sanhita 2023 – Cybercrime provisions</li>
//               <li><strong>India</strong>: Indian Penal Code / BNS – Conspiracy, cheating, fraud, cyber stalking</li>
//               <li><strong>United States</strong>: Computer Fraud and Abuse Act (CFAA) – 18 U.S.C. § 1030</li>
//               <li><strong>EU / Global</strong>: GDPR (up to €20M or 4% turnover), NIS2 Directive, DORA</li>
//               <li><strong>International</strong>: Budapest Convention on Cybercrime</li>
//             </ul>
//           </div>

//           <p className="final-threat">
//             **Misuse = immediate permanent ban + full legal action + law enforcement cooperation**
//           </p>

//           <button className="accept-button" onClick={onAccept}>
//             I ACCEPT – I AM AUTHORIZED AND FULLY LIABLE
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ──────────────────────────────────────────────────────────────
// // Login Page
// // ──────────────────────────────────────────────────────────────
// const LoginPage = ({ onLogin }) => {
//   const [password, setPassword] = useState('');
//   const [isAuthenticating, setIsAuthenticating] = useState(false);
//   const [error, setError] = useState('');

//   const VALID_USERNAME = 'admin';
//   const VALID_PASSWORD = 'admin';

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     setIsAuthenticating(true);

//     // fake auth delay
//     await new Promise(res => setTimeout(res, 700));

//     if (VALID_USERNAME !== 'admin' || password !== VALID_PASSWORD) {
//       setIsAuthenticating(false);
//       setError('❌ INVALID USERNAME OR PASSWORD');
//       return;
//     }

//     setIsAuthenticating(false);
//     onLogin();
//   };

//   return (
//     <div className="page-container secure-gateway-page">
//       <div className="scanline-overlay"></div>
//       <div className="glitch-bg"></div>

//       <div className="login-wrapper centered">
//         <div className="glass-card login-card">
//           <div className="card-header">
//             <h1 className="glitch-text login-heading">
//               SECURE ACCESS GATEWAY
//             </h1>
//           </div>

//           {/* 🔴 ERROR POPUP */}
//           {error && (
//             <div className="login-error-popup">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="login-form">
//             <div className="terminal-input-group">
//               <div className="terminal-line">
//                 <span className="prompt cyan-glow">&gt; username:</span>
//                 <span className="fixed-value">admin</span>
//                 <span className="cursor-blink">_</span>
//               </div>

//               <div className="terminal-line">
//                 <span className="prompt cyan-glow">&gt; password:</span>
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   autoFocus
//                   required
//                   className="password-input neon-input"
//                   placeholder="••••••••"
//                   disabled={isAuthenticating}
//                 />
//                 <span className="cursor-blink">_</span>
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="authenticate-btn pulse-glow"
//               disabled={isAuthenticating}
//             >
//               {isAuthenticating ? (
//                 <>
//                   <span className="neon-spinner small"></span>
//                   AUTHENTICATING...
//                 </>
//               ) : (
//                 'AUTHENTICATE'
//               )}
//             </button>
//           </form>

//           <div className="security-status">
//             <div className="status-line">
//               <span className="status-indicator active"></span>
//               <span className="status-text">All sessions logged</span>
//               <span className="status-divider">|</span>
//               <span className="status-indicator active pulse-red"></span>
//               <span className="status-text red-glow">
//                 Intrusion detection active
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ========== NEW: CVE Display Component ==========
// const CVEDisplay = ({ service }) => {
//   const [expanded, setExpanded] = useState(false);
  
//   if (!service.cves || service.cves.length === 0) {
//     return (
//       <div className="cve-empty">
//         <span className="cve-badge none">No CVEs</span>
//       </div>
//     );
//   }

//   return (
//     <div className="cve-container">
//       <div className="cve-header" onClick={() => setExpanded(!expanded)}>
//         <span className="cve-badge warning">{service.cves.length} CVEs Found</span>
//         <span className="cve-exploit-weight">
//           Exploit Probability: {(service.exploit_weight * 100).toFixed(0)}%
//         </span>
//         <span className="cve-expand">{expanded ? '▼' : '▶'}</span>
//       </div>
      
//       {expanded && (
//         <div className="cve-list">
//           {service.cves.map((cve, idx) => (
//             <div key={idx} className="cve-item">
//               <div className="cve-id">
//                 <a href={`https://nvd.nist.gov/vuln/detail/${cve.id}`} target="_blank" rel="noopener noreferrer">
//                   {cve.id}
//                 </a>
//                 <span className={`cve-cvss ${cve.cvss >= 7.0 ? 'high' : cve.cvss >= 4.0 ? 'medium' : 'low'}`}>
//                   CVSS: {cve.cvss}
//                 </span>
//               </div>
//               <div className="cve-description">{cve.description}</div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // ========== NEW: Fingerprinted Services Component ==========
// const FingerprintedServices = ({ services }) => {
//   if (!services || services.length === 0) {
//     return (
//       <div className="dashboard-card">
//         <div className="card-header">
//           <div className="card-title">Service Fingerprinting</div>
//         </div>
//         <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
//           No fingerprinted services available
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
//       <div className="card-header">
//         <div className="card-title">Service Fingerprinting & CVE Correlation</div>
//         <div className="card-subtitle">
//           {services[0]?.cves?.length > 0 ? '✓ NVD API Connected' : '⏳ Waiting for version data'}
//         </div>
//       </div>
      
//       <div style={{ overflowX: 'auto' }}>
//         <table className="findings-table" style={{ width: '100%' }}>
//           <thead>
//             <tr className="table-header">
//               <th>Port</th>
//               <th>Service</th>
//               <th>Version</th>
//               <th>Banner</th>
//               <th>CVEs & Exploit Probability</th>
//             </tr>
//           </thead>
//           <tbody>
//             {services.map((svc, idx) => (
//               <tr key={idx} className="table-row service-row">
//                 <td><strong>{svc.port}</strong></td>
//                 <td>{svc.service_name || svc.service}</td>
//                 <td>
//                   {svc.version ? (
//                     <span className="version-badge">{svc.version}</span>
//                   ) : (
//                     <span className="version-unknown">Unknown</span>
//                   )}
//                 </td>
//                 <td className="banner-cell">
//                   {svc.banner ? (
//                     <span className="banner-text">{svc.banner.substring(0, 50)}...</span>
//                   ) : (
//                     <span className="no-banner">No banner</span>
//                   )}
//                 </td>
//                 <td className="cve-cell">
//                   <CVEDisplay service={svc} />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// const hasData = (arr) => arr && arr.some(v => v > 0);

// const OsintOverview = ({ osint }) => {
//   if (!osint || osint.status !== 'completed') {
//     return (
//       <div style={{ color: '#94a3b8', padding: '1rem' }}>
//         OSINT data unavailable
//       </div>
//     );
//   }

//   const score = osint.osint_score ?? 0;
//   const trust = osint.trust_level ?? 'UNKNOWN';

//   const headers = osint.http?.security_headers || {};
//   const enabledHeaders = Object.values(headers).filter(Boolean).length;
//   const missingHeaders = Object.values(headers).filter(v => v === false).length;

//   const dns = osint.dns || {};
//   const dnsCounts = {
//     A: dns.A?.length || 0,
//     MX: dns.MX?.length || 0,
//     NS: dns.NS?.length || 0,
//     TXT: dns.TXT?.length || 0
//   };

//   return (
//     <div className="osint-overview-grid">

//       {/* OSINT SCORE */}
//       <div className="dashboard-card">
//         <div className="card-header">
//           <div className="card-title">OSINT Score</div>
//         </div>
//         <Chart
//           type="radialBar"
//           series={[score || 1]}
//           options={{
//             chart: { background: 'transparent' },
//             plotOptions: {
//               radialBar: {
//                 hollow: { size: '65%' },
//                 dataLabels: {
//                   value: { fontSize: '22px', color: '#e5e7eb' }
//                 }
//               }
//             },
//             colors: [
//               score >= 80 ? '#4ade80'
//               : score >= 50 ? '#ea580c'
//               : '#ef4444'
//             ]
//           }}
//           height={200}
//         />
//       </div>

//       {/* SECURITY HEADERS */}
//       <div className="dashboard-card">
//         <div className="card-header">
//           <div className="card-title">Security Headers</div>
//         </div>
//         <Chart
//           type="donut"
//           series={[
//             enabledHeaders || 1,
//             missingHeaders || 0
//           ]}
//           options={{
//             labels: ['Enabled', 'Missing'],
//             colors: ['#4ade80', '#ef4444'],
//             legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
//             chart: { background: 'transparent' }
//           }}
//           height={200}
//         />
//       </div>

//       {/* TRUST LEVEL */}
//       <div className="dashboard-card">
//         <div className="card-header">
//           <div className="card-title">Trust Level</div>
//         </div>
//         <div
//           style={{
//             height: 180,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             fontSize: 32,
//             fontWeight: 'bold',
//             color:
//               trust === 'HIGH'
//                 ? '#4ade80'
//                 : trust === 'MEDIUM'
//                 ? '#ea580c'
//                 : '#ef4444'
//           }}
//         >
//           {trust}
//         </div>
//       </div>

//       {/* DNS DISTRIBUTION */}
//       <div className="dashboard-card dns-wide">
//         <div className="card-header">
//           <div className="card-title">DNS Record Distribution</div>
//         </div>
//         <Chart
//           type="bar"
//           series={[{ name: 'Records', data: Object.values(dnsCounts) }]}
//           options={{
//             chart: { toolbar: { show: false }, background: 'transparent' },
//             colors: ['#60a5fa'],
//             xaxis: {
//               categories: Object.keys(dnsCounts),
//               labels: { style: { colors: '#94a3b8' } }
//             },
//             yaxis: { labels: { style: { colors: '#94a3b8' } } },
//             grid: { borderColor: 'rgba(96,165,250,0.15)' },
//             dataLabels: { enabled: true }
//           }}
//           height={240}
//         />
//       </div>

//     </div>
//   );
// };

// const OsintDetails = ({ osint }) => {
//   if (!osint || osint.status !== 'completed') {
//     return (
//       <div className="dashboard-card">
//         <div className="card-header">
//           <div className="card-title">OSINT Intelligence</div>
//         </div>
//         <div style={{ color: '#94a3b8', padding: '1rem' }}>
//           No OSINT data available
//         </div>
//       </div>
//     );
//   }

//   const whois = osint.whois || {};
//   const dns = osint.dns || {};
//   const ssl = osint.ssl || {};
//   const headers = osint.http?.security_headers || {};

//   return (
//     <div className="dashboard-card">

//       {/* HEADER */}
//       <div className="card-header">
//         <div className="card-title">
//           OSINT Intelligence ({osint.domain})
//         </div>
//       </div>

//       <div style={{ overflowX: 'auto' }}>

//         {/* ================= SUMMARY ================= */}
//         <table className="findings-table" style={{ width: '100%', marginBottom: '1.5rem' }}>
//           <thead>
//             <tr className="table-header"><th colSpan="2">Summary</th></tr>
//           </thead>
//           <tbody>
//             <tr className="table-row"><td>Generated At</td><td>{new Date(osint.generated_at).toLocaleString()}</td></tr>
//             <tr className="table-row"><td>OSINT Score</td><td><strong>{osint.osint_score}</strong></td></tr>
//             <tr className="table-row">
//               <td>Trust Level</td>
//               <td>
//                 <span className={`badge severity-${osint.trust_level.toLowerCase()}`}>
//                   {osint.trust_level}
//                 </span>
//               </td>
//             </tr>
//           </tbody>
//         </table>

//         {/* ================= WHOIS ================= */}
//         <table className="findings-table" style={{ width: '100%', marginBottom: '1.5rem' }}>
//           <thead>
//             <tr className="table-header"><th colSpan="2">WHOIS Information</th></tr>
//           </thead>
//           <tbody>
//             {[
//               ['Registrar', whois.registrar],
//               ['Organization', whois.organization || 'N/A'],
//               ['Country', whois.country],
//               ['Created', whois.creation_date],
//               ['Expires', whois.expiration_date]
//             ].map(([k, v], i) => (
//               <tr key={i} className="table-row"><td>{k}</td><td>{v}</td></tr>
//             ))}
//           </tbody>
//         </table>

//         {/* ================= DNS ================= */}
//         <table className="findings-table" style={{ width: '100%', marginBottom: '1.5rem' }}>
//           <thead>
//             <tr className="table-header"><th>Type</th><th>Records</th></tr>
//           </thead>
//           <tbody>
//             {['A', 'MX', 'NS', 'TXT'].map(type => (
//               <tr key={type} className="table-row">
//                 <td><strong>{type}</strong></td>
//                 <td style={{ color: '#94a3b8' }}>
//                   {(dns[type] || []).length ? dns[type].join(', ') : 'None'}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* ================= SSL ================= */}
//         <table className="findings-table" style={{ width: '100%', marginBottom: '1.5rem' }}>
//           <thead>
//             <tr className="table-header"><th colSpan="2">SSL Certificate</th></tr>
//           </thead>
//           <tbody>
//             <tr className="table-row"><td>Issuer</td><td>{ssl.issuer?.organizationName}</td></tr>
//             <tr className="table-row"><td>Common Name</td><td>{ssl.subject?.commonName}</td></tr>
//             <tr className="table-row"><td>Valid From</td><td>{ssl.not_before}</td></tr>
//             <tr className="table-row"><td>Valid Until</td><td>{ssl.not_after}</td></tr>
//           </tbody>
//         </table>

//         {/* ================= HEADERS ================= */}
//         <table className="findings-table" style={{ width: '100%', marginBottom: '1.5rem' }}>
//           <thead>
//             <tr className="table-header"><th>Security Header</th><th>Status</th></tr>
//           </thead>
//           <tbody>
//             {Object.entries(headers).map(([key, value]) => (
//               <tr key={key} className="table-row">
//                 <td>{key}</td>
//                 <td>
//                   <span className={`badge ${value ? 'severity-low' : 'severity-critical'}`}>
//                     {value ? 'ENABLED' : 'MISSING'}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* ================= CRT.SH ================= */}
//         <table className="findings-table" style={{ width: '100%' }}>
//           <thead>
//             <tr className="table-header"><th>Certificate Transparency (crt.sh)</th></tr>
//           </thead>
//           <tbody>
//             {osint.crtsh?.map((entry, i) => (
//               <tr key={i} className="table-row">
//                 <td style={{ whiteSpace: 'pre-wrap', color: '#94a3b8' }}>{entry}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//       </div>
//     </div>
//   );
// };

// // ──────────────────────────────────────────────────────────────
// // Dashboard – Main Component
// // ──────────────────────────────────────────────────────────────
// const Dashboard = () => {
//   const [domain, setDomain] = useState('');
//   const [scanResult, setScanResult] = useState(null);
//   const [jsonResponse, setJsonResponse] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('overview');
//   const [chartData, setChartData] = useState(null);
//   const [showJsonViewer, setShowJsonViewer] = useState(false);

//   const processScanData = (scanResponse) => {
//     if (!scanResponse) return null;

//     const vulns = scanResponse.vulnerabilities || [];
//     const ports = scanResponse.port_scan?.services || [];

//     const criticalCount = vulns.filter(v => v.severity === 'CRITICAL').length;
//     const highCount    = vulns.filter(v => v.severity === 'HIGH').length;
//     const mediumCount  = vulns.filter(v => v.severity === 'MEDIUM').length;

//     const openPorts     = ports.filter(p => p.state === 'open').length;
//     const closedPorts   = ports.filter(p => p.state === 'closed').length;
//     const filteredPorts = ports.filter(p => p.state === 'filtered').length;

//     const publicSubdomains    = scanResponse.subdomain_enum?.summary?.public || 0;
//     const restrictedSubdomains = scanResponse.subdomain_enum?.summary?.restricted || 0;
//     const dnsOnlySubdomains   = scanResponse.subdomain_enum?.summary?.dns_only || 0;

//     const trend = [
//       Math.max(0, criticalCount - 2),
//       Math.max(0, criticalCount - 1),
//       criticalCount,
//       Math.max(0, criticalCount - 1),
//       criticalCount,
//       Math.max(0, criticalCount + 1),
//       criticalCount
//     ];

//     return {
//       vulnerabilityTrend: {
//         series: [
//           { name: 'Critical', data: trend },
//           { name: 'High',     data: trend.map(v => v + highCount) },
//           { name: 'Medium',   data: trend.map(() => mediumCount) }
//         ],
//         categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
//       },
//       networkVulnerabilities: {
//         series: [criticalCount, highCount, mediumCount],
//         labels: ['Critical', 'High', 'Medium']
//       },
//       hostsScanned: {
//         series: [publicSubdomains, restrictedSubdomains, dnsOnlySubdomains, 0],
//         labels: ['Public', 'Restricted', 'DNS Only', 'Offline']
//       },
//       webVulnerabilities: {
//         series: [openPorts, closedPorts, filteredPorts],
//         labels: ['Open', 'Closed', 'Filtered']
//       }
//     };
//   };

//   // Mock data for demo
//   const mockScanData = {
//     scan_id: "sync-demo-123456",
//     target: "demo-target.com",
//     risk_summary: { score: 75, severity: "HIGH" },
//     vulnerabilities: [
//       { type: "SQL Injection", severity: "HIGH", source: "CONFIG_SCAN", port: 80, recommendation: "Use parameterized queries" },
//       { type: "SSH exposed", severity: "CRITICAL", source: "PORT_SCAN", port: 22, recommendation: "Restrict SSH access" }
//     ],
//     subdomain_enum: {
//       found: 2,
//       summary: { public: 2, restricted: 0, dns_only: 0 },
//       subdomains: [
//         { subdomain: "mail.demo.com", url: "https://mail.demo.com", dns_ips: ["192.168.1.1"], status: 200, alive: true },
//         { subdomain: "www.demo.com", url: "https://www.demo.com", dns_ips: ["192.168.1.2"], status: 200, alive: true }
//       ]
//     },
//     port_scan: {
//       services: [
//         { port: 22, service: "ssh", state: "open", exposure_level: "HIGH", attack_surface: "NETWORK" },
//         { port: 80, service: "http", state: "open", exposure_level: "HIGH", attack_surface: "WEB" },
//         { port: 443, service: "https", state: "open", exposure_level: "HIGH", attack_surface: "WEB" }
//       ]
//     },
//     osint: {
//       status: "completed",
//       generated_at: new Date().toISOString(),
//       domain: "demo.com",
//       whois: {
//         registrar: "Demo Registrar",
//         organization: "Demo Org",
//         country: "US",
//         creation_date: "2020-01-01",
//         expiration_date: "2030-01-01"
//       },
//       crtsh: ["*.demo.com", "mail.demo.com"],
//       dns: {
//         A: ["192.168.1.1"],
//         MX: ["mail.demo.com"],
//         NS: ["ns1.demo.com"],
//         TXT: ["v=spf1 include:_spf.google.com"]
//       },
//       http: {
//         status: 200,
//         server: "nginx/1.20.1",
//         security_headers: { HSTS: true, CSP: false, XFO: true }
//       },
//       ssl: {
//         issuer: { organizationName: "Let's Encrypt" },
//         subject: { commonName: "*.demo.com" },
//         not_before: "2025-01-01",
//         not_after: "2026-01-01"
//       },
//       osint_score: 85,
//       trust_level: "HIGH"
//     },
//     fingerprinted_services: [
//       {
//         port: 22,
//         service: "ssh",
//         service_name: "openssh",
//         version: "7.4",
//         banner: "SSH-2.0-OpenSSH_7.4",
//         cves: [
//           { id: "CVE-2021-28041", cvss: 7.5, description: "OpenSSH 7.4 vulnerability allows remote code execution" },
//           { id: "CVE-2020-15778", cvss: 6.8, description: "scp command injection in OpenSSH 7.4" }
//         ],
//         exploit_weight: 0.75
//       },
//       {
//         port: 80,
//         service: "http",
//         service_name: "apache",
//         version: "2.4.49",
//         banner: "Apache/2.4.49 (Ubuntu)",
//         cves: [
//           { id: "CVE-2021-41773", cvss: 7.5, description: "Apache 2.4.49 path traversal vulnerability" },
//           { id: "CVE-2021-42013", cvss: 9.8, description: "Apache 2.4.49 remote code execution" }
//         ],
//         exploit_weight: 0.85
//       }
//     ],
//     meta: {
//       cve_api_configured: true
//     }
//   };

//   const handleScan = async () => {
//     if (!domain.trim()) {
//       // Show mock data if no domain entered
//       const processed = processScanData(mockScanData);
//       setScanResult(mockScanData);
//       setChartData(processed);
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setJsonResponse(null);

//     try {
//     const response = await fetch(
//   `https://ai-vapt-project.onrender.com/scan/full?target=${domain}`,
//   {
//     method: "POST",
//     headers: {
//       "Accept": "application/json",
//       "Content-Type": "application/json"
//     }
//   }
// );

//       if (!response.ok) throw new Error(`Scan failed: ${response.status}`);

//       const data = await response.json();
//       setJsonResponse(data);
//       setScanResult(data);
//       setChartData(processScanData(data));
//     } catch (err) {
//       setError(err.message || 'Backend unavailable – using demo data');
//       const processed = processScanData(mockScanData);
//       setScanResult(mockScanData);
//       setChartData(processed);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const backToDashboard = () => setShowJsonViewer(false);

//   // Loading screen
//   if (loading) {
//     return (
//       <div className="app-wrapper centered loading-overlay">
//         <div className="loading-container">
//           <div className="spinner neon-spinner"></div>
//           <div className="loading-text glitch-text">BREACHING TARGET...</div>
//         </div>
//       </div>
//     );
//   }

//   // JSON Viewer
//   if (showJsonViewer && jsonResponse) {
//     return (
//       <div className="app-wrapper json-viewer-page">
//         <nav className="top-nav">
//           <div className="nav-left">
//             <div className="nav-logo glitch-text">
//               <span>🛡️</span> WHITENX
//             </div>
//           </div>
//           <div className="nav-right">
//             <button className="nav-back-btn" onClick={backToDashboard}>
//               ← Back to Dashboard
//             </button>
//             <div className="user-avatar neon-avatar">AB</div>
//           </div>
//         </nav>

//         <div className="json-viewer-container">
//           <h1 className="json-title glitch-heading">RAW SCAN OUTPUT (JSON)</h1>
//           <pre className="json-content">
//             {JSON.stringify(jsonResponse, null, 2)}
//           </pre>
//         </div>
//       </div>
//     );
//   }

//   // Scan Input Page
//   if (!scanResult) {
//     return (
//       <div className="app-wrapper">
//         <nav className="top-nav">
//           <div className="nav-left">
//             <div className="nav-logo glitch-text">
//               <span>🛡️</span> WHITENX
//             </div>
//           </div>
//           <div className="nav-right">
//             <div className="user-avatar neon-avatar">AB</div>
//           </div>
//         </nav>

//         <div className="scan-input-container">
//           <div className="scan-hero">
//             <h1 className="glitch-heading">VAPT SCANNER</h1>
//             <p style={{ color: '#94a3b8', marginBottom: '2.5rem' }}>
//               Enter domain or IP address to begin reconnaissance
//             </p>

//             {error && <div className="error-box" style={{ marginBottom: '1.5rem' }}>{error}</div>}

//             <div className="scan-form-row">
//               <input
//                 type="text"
//                 placeholder="example.com or 192.168.1.1"
//                 value={domain}
//                 onChange={(e) => setDomain(e.target.value)}
//                 onKeyDown={(e) => e.key === 'Enter' && handleScan()}
//                 className="search-filter"
//               />
//               <button onClick={handleScan} className="scan-btn primary">
//                 {loading ? 'Scanning...' : 'START SCAN'}
//               </button>
//               <button
//                 onClick={() => {
//                   const processed = processScanData(mockScanData);
//                   setScanResult(mockScanData);
//                   setChartData(processed);
//                 }}
//                 className="scan-btn secondary"
//               >
//                 DEMO DASHBOARD
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const vulns = scanResult.vulnerabilities || [];
//   const ports = scanResult.port_scan?.services || [];
//   const subdomains = scanResult.subdomain_enum?.subdomains || [];
//   const osint = scanResult.osint || {};
//   const fingerprintedServices = scanResult.fingerprinted_services || [];

//   return (
//     <div className="app-wrapper">
//       <nav className="top-nav">
//         <div className="nav-left">
//           <div className="nav-logo glitch-text">
//             <span>🛡️</span> WHITENX
//           </div>
//           <div className="nav-tabs">
//             {['Overview', 'Vulnerabilities', 'Services', 'Ports', 'Subdomains', 'OSINT'].map(tab => (
//               <button
//                 key={tab}
//                 className={`nav-tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
//                 onClick={() => setActiveTab(tab.toLowerCase())}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>
//         </div>
//         <div className="nav-right">
//           <button
//             className="nav-back-btn"
//             onClick={() => { setDomain(""); setScanResult(null); setChartData(null); setJsonResponse(null); }}
//           >
//             ↩ New Scan
//           </button>
          
//           {jsonResponse && (
//             <button
//               className="json-view-btn"
//               onClick={() => setShowJsonViewer(true)}
//             >
//               View JSON
//             </button>
//           )}
//         </div>
//       </nav>

//       <div className="dashboard-wrapper">
//         <div className="report-header">
//           <div className="report-title glitch-text">SECURITY ASSESSMENT REPORT</div>
//           <div className="report-meta">
//             <div className="target">Target: {scanResult.target}</div>
//             <div className="scan-time">Scan ID: {scanResult.scan_id?.substring(0,12)}...</div>
//             {scanResult.meta?.cve_api_configured && (
//               <div className="cve-status-badge">
//                 ✓ NVD API Connected
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Overview Tab */}
//         {activeTab === 'overview' && chartData && (
//           <div className="dashboard-grid">
            
//             <div className="dashboard-row two-columns">
//               <div className="dashboard-card">
//                 <div className="card-header">
//                   <div className="card-title">Vulnerability Trend</div>
//                 </div>
//                 <div className="card-body">
//                   <Chart
//                     type="area"
//                     series={chartData.vulnerabilityTrend.series}
//                     options={{
//                       chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
//                       colors: ['#ef4444', '#ea580c', '#60a5fa'],
//                       xaxis: { categories: chartData.vulnerabilityTrend.categories, labels: { style: { colors: '#94a3b8' } } },
//                       yaxis: { labels: { style: { colors: '#94a3b8' } } },
//                       grid: { borderColor: 'rgba(96, 165, 250, 0.1)' },
//                       stroke: { curve: 'smooth', width: 2 },
//                       fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
//                       legend: { labels: { colors: '#94a3b8' } }
//                     }}
//                     height={300}
//                   />
//                 </div>
//               </div>

//               <div className="dashboard-card">
//                 <div className="card-header">
//                   <div className="card-title">Severity Distribution</div>
//                 </div>
//                 <div className="card-body">
//                   <Chart
//                     type="bar"
//                     series={[{
//                       name: 'Count',
//                       data: [
//                         vulns.filter(v => v.severity === 'CRITICAL').length,
//                         vulns.filter(v => v.severity === 'HIGH').length,
//                         vulns.filter(v => v.severity === 'MEDIUM').length,
//                         vulns.filter(v => v.severity === 'LOW').length
//                       ]
//                     }]}
//                     options={{
//                       chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
//                       colors: ['#ef4444'],
//                       xaxis: {
//                         categories: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
//                         labels: { style: { colors: '#94a3b8' } }
//                       },
//                       yaxis: { labels: { style: { colors: '#94a3b8' } } },
//                       grid: { borderColor: 'rgba(96, 165, 250, 0.1)' },
//                       dataLabels: { enabled: true }
//                     }}
//                     height={300}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="dashboard-row three-columns">
//               <div className="dashboard-card">
//                 <div className="card-header">
//                   <div className="card-title">Network Vulnerabilities</div>
//                 </div>
//                 <div className="card-body">
//                   <div className="donut-container">
//                     <Chart
//                       type="donut"
//                       series={chartData.networkVulnerabilities.series}
//                       options={{
//                         colors: ['#ef4444', '#ea580c', '#60a5fa'],
//                         labels: chartData.networkVulnerabilities.labels,
//                         chart: { toolbar: { show: false }, background: 'transparent' },
//                         legend: { show: false }
//                       }}
//                       height={220}
//                     />
//                     <div className="donut-legend">
//                       {chartData.networkVulnerabilities.labels.map((label, i) => (
//                         <div key={label} className="legend-item">
//                           <div className="legend-color" style={{ backgroundColor: ['#ef4444', '#ea580c', '#60a5fa'][i] }}></div>
//                           <div className="legend-label">{label}</div>
//                           <div className="legend-value">{chartData.networkVulnerabilities.series[i]}</div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="dashboard-card">
//                 <div className="card-header">
//                   <div className="card-title">Port Status</div>
//                 </div>
//                 <div className="card-body">
//                   <div className="donut-container">
//                     <Chart
//                       type="donut"
//                       series={chartData.webVulnerabilities.series}
//                       options={{
//                         colors: ['#4ade80', '#ea580c', '#ef4444'],
//                         labels: chartData.webVulnerabilities.labels,
//                         chart: { toolbar: { show: false }, background: 'transparent' },
//                         legend: { show: false }
//                       }}
//                       height={220}
//                     />
//                     <div className="donut-legend">
//                       {chartData.webVulnerabilities.labels.map((label, i) => (
//                         <div key={label} className="legend-item">
//                           <div className="legend-color" style={{ backgroundColor: ['#4ade80', '#ea580c', '#ef4444'][i] }}></div>
//                           <div className="legend-label">{label}</div>
//                           <div className="legend-value">{chartData.webVulnerabilities.series[i]}</div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="dashboard-card">
//                 <div className="card-header">
//                   <div className="card-title">Subdomain Classification</div>
//                 </div>
//                 <div className="card-body">
//                   <div className="donut-container">
//                     <Chart
//                       type="donut"
//                       series={chartData.hostsScanned.series}
//                       options={{
//                         colors: ['#4ade80', '#ea580c', '#60a5fa', '#ef4444'],
//                         labels: chartData.hostsScanned.labels,
//                         chart: { toolbar: { show: false }, background: 'transparent' },
//                         legend: { show: false }
//                       }}
//                       height={220}
//                     />
//                     <div className="donut-legend">
//                       {chartData.hostsScanned.labels.map((label, i) => (
//                         <div key={label} className="legend-item">
//                           <div className="legend-color" style={{ backgroundColor: ['#4ade80', '#ea580c', '#60a5fa', '#ef4444'][i] }}></div>
//                           <div className="legend-label">{label}</div>
//                           <div className="legend-value">{chartData.hostsScanned.series[i]}</div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* NEW: Fingerprinted Services with CVEs */}
//             <FingerprintedServices services={fingerprintedServices} />

//             <OsintOverview osint={osint} />

//             {/* Top Critical Issues */}
//             <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
//               <div className="card-header">
//                 <div className="card-title">Top Critical Issues</div>
//               </div>
//               <div style={{ overflowX: 'auto' }}>
//                 <table className="findings-table" style={{ width: '100%' }}>
//                   <thead>
//                     <tr className="table-header">
//                       <th>Vulnerability</th>
//                       <th>Source</th>
//                       <th>Severity</th>
//                       <th>Port</th>
//                       <th>Recommendation</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {vulns.slice(0, 5).map((vuln, i) => (
//                       <tr key={i} className="table-row">
//                         <td>{vuln.type}</td>
//                         <td>{vuln.source || 'CONFIG'}</td>
//                         <td>
//                           <span className={`badge severity-${vuln.severity?.toLowerCase() || 'info'}`}>
//                             {vuln.severity}
//                           </span>
//                         </td>
//                         <td>{vuln.port || '-'}</td>
//                         <td>{vuln.recommendation || '-'}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Ports Table */}
//             <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
//               <div className="card-header">
//                 <div className="card-title">Port Risk Analysis</div>
//               </div>
//               <div style={{ overflowX: 'auto' }}>
//                 <table className="findings-table" style={{ width: '100%' }}>
//                   <thead>
//                     <tr className="table-header">
//                       <th>Port</th>
//                       <th>Service</th>
//                       <th>State</th>
//                       <th>Exposure</th>
//                       <th>Risk</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {ports.map((port, i) => {
//                       const risk = port.state === 'open' ? (port.exposure_level === 'HIGH' ? 95 : 65) : 20;
//                       return (
//                         <tr key={i} className="table-row">
//                           <td><strong>{port.port}</strong></td>
//                           <td>{port.service}</td>
//                           <td>
//                             <span className={`badge ${port.state === 'open' ? 'severity-critical' : 'severity-low'}`}>
//                               {port.state.toUpperCase()}
//                             </span>
//                           </td>
//                           <td>
//                             <span className={`badge ${port.exposure_level === 'HIGH' ? 'severity-critical' : 'severity-low'}`}>
//                               {port.exposure_level}
//                             </span>
//                           </td>
//                           <td style={{ color: risk > 80 ? '#ef4444' : risk > 60 ? '#ea580c' : '#4ade80' }}>
//                             {risk}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Subdomains Grid */}
//             <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
//               <div className="card-header">
//                 <div className="card-title">Subdomain Enumeration</div>
//               </div>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
//                 {subdomains.length > 0 ? subdomains.map((sub, i) => (
//                   <div key={i} className="subdomain-card">
//                     <div style={{ color: sub.alive ? '#4ade80' : '#ef4444', fontWeight: 'bold' }}>
//                       {sub.alive ? '● LIVE' : '○ DOWN'} {sub.subdomain}
//                     </div>
//                     <div>Status: {sub.status}</div>
//                     {sub.dns_ips && <div>IPs: {sub.dns_ips.join(', ')}</div>}
//                   </div>
//                 )) : (
//                   <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
//                     No subdomains discovered
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Vulnerabilities Tab */}
//         {activeTab === 'vulnerabilities' && (
//           <div className="dashboard-card">
//             <div className="card-header">
//               <div className="card-title">Detected Vulnerabilities ({vulns.length})</div>
//             </div>
//             <div style={{ overflowX: 'auto' }}>
//               <table className="findings-table" style={{ width: '100%' }}>
//                 <thead>
//                   <tr className="table-header">
//                     <th>Type</th>
//                     <th>Source</th>
//                     <th>Severity</th>
//                     <th>Port</th>
//                     <th>Fix</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {vulns.map((v, i) => (
//                     <tr key={i} className="table-row">
//                       <td>{v.type}</td>
//                       <td>{v.source || 'CONFIG'}</td>
//                       <td>
//                         <span className={`badge severity-${v.severity?.toLowerCase()}`}>{v.severity}</span>
//                       </td>
//                       <td>{v.port || '-'}</td>
//                       <td>{v.recommendation || '-'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* NEW: Services Tab with CVEs */}
//         {activeTab === 'services' && (
//           <FingerprintedServices services={fingerprintedServices} />
//         )}

//         {/* Ports Tab */}
//         {activeTab === 'ports' && (
//           <div className="dashboard-card">
//             <div className="card-header">
//               <div className="card-title">Port Scan Results ({ports.length})</div>
//             </div>
//             <div style={{ overflowX: 'auto' }}>
//               <table className="findings-table" style={{ width: '100%' }}>
//                 <thead>
//                   <tr className="table-header">
//                     <th>Port</th>
//                     <th>Service</th>
//                     <th>State</th>
//                     <th>Exposure</th>
//                     <th>Attack Surface</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {ports.map((p, i) => (
//                     <tr key={i} className="table-row">
//                       <td><strong>{p.port}</strong></td>
//                       <td>{p.service}</td>
//                       <td>
//                         <span className={`badge ${p.state === 'open' ? 'severity-critical' : 'severity-low'}`}>
//                           {p.state.toUpperCase()}
//                         </span>
//                       </td>
//                       <td>
//                         <span className={`badge ${p.exposure_level === 'HIGH' ? 'severity-critical' : 'severity-low'}`}>
//                           {p.exposure_level}
//                         </span>
//                       </td>
//                       <td>{p.attack_surface || '-'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Subdomains Tab */}
//         {activeTab === 'subdomains' && (
//           <div className="dashboard-grid">
//             {subdomains.map((sub, i) => (
//               <div key={i} className="dashboard-card">
//                 <div className="card-header">
//                   <div className="card-title">
//                     {sub.alive ? '✅' : '❌'} {sub.subdomain}
//                   </div>
//                 </div>
//                 <div className="card-body">
//                   <div>Status Code: {sub.status}</div>
//                   {sub.url && <div>URL: {sub.url}</div>}
//                   {sub.dns_ips?.length > 0 && <div>IPs: {sub.dns_ips.join(', ')}</div>}
//                 </div>
//               </div>
//             ))}
//             {subdomains.length === 0 && (
//               <div className="dashboard-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
//                 No subdomains found in this scan
//               </div>
//             )}
//           </div>
//         )}

//         {/* OSINT Tab */}
//         {activeTab === 'osint' && (
//           <OsintDetails osint={osint} />
//         )}

//       </div>
//     </div>
//   );
// };

// // ──────────────────────────────────────────────────────────────
// // Main App
// // ──────────────────────────────────────────────────────────────
// function App() {
//   const [stage, setStage] = useState('legal');

//   return (
//     <>
//       {stage === 'legal' && <LegalPage onAccept={() => setStage('login')} />}
//       {stage === 'login' && <LoginPage onLogin={() => setStage('dashboard')} />}
//       {stage === 'dashboard' && <Dashboard />}
//     </>
//   );
// }

// export default App;
