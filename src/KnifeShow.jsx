import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// Dark showroom palette: near-black walls, warm gold accents, coloured rarity
// spinning log preview — the product itself is always on stage.
const C = {
  bg:       "#0E0C0A",
  bgDeep:   "#070604",
  surface:  "#161410",
  panel:    "#1C1916",
  border:   "#2E2920",
  borderHi: "#3E3528",
  gold:     "#C89B3C",
  goldDim:  "#7A5E24",
  text:     "#E8E0D0",
  textDim:  "#7A7060",
  textMid:  "#B0A890",
  green:    "#4A9460",
  red:      "#A03030",
};

// ─── RARITIES ─────────────────────────────────────────────────────────────────
// Drop chances: Common 60% · Uncommon 25% · Rare 10% · Epic 4% · Legendary 0.9% · Mythic 0.1%
const RARITIES = {
  common:    { label:"Common",    color:"#8A8680", glow:"rgba(138,134,128,0.4)", drop:0.600 },
  uncommon:  { label:"Uncommon",  color:"#4A9460", glow:"rgba(74,148,96,0.5)",  drop:0.250 },
  rare:      { label:"Rare",      color:"#3A7EC0", glow:"rgba(58,126,192,0.5)", drop:0.100 },
  epic:      { label:"Epic",      color:"#7B5FCC", glow:"rgba(123,95,204,0.5)", drop:0.040 },
  legendary: { label:"Legendary", color:"#C89B3C", glow:"rgba(200,155,60,0.6)", drop:0.001 },
  mythic:    { label:"Mythic",    color:"#CC4488", glow:"rgba(204,68,136,0.6)", drop:0.009 },
};

// ─── KNIFE SKINS (25 designs, all original) ───────────────────────────────────
// Each has a draw(ctx, x, y, angle, t) — renders tip-up when angle=0.
// Value = coin sell price. BuyPrice = shop cost.
const KNIVES = [
  // ── BASIC (4) ──────────────────────────────────────────────────────────────
  { id:"k_steel",  name:"Field Steel",    rarity:"common",    cat:"Basic",    buyPrice:30,   value:12,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#A8A49C";ctx.beginPath();ctx.moveTo(0,-50);ctx.lineTo(3,-18);ctx.lineTo(3,2);ctx.lineTo(-3,2);ctx.lineTo(-3,-18);ctx.closePath();ctx.fill();ctx.fillStyle="#5A5650";ctx.beginPath();ctx.roundRect(-3,2,6,20,2);ctx.fill();ctx.restore(); }},
  { id:"k_cleaver",name:"Block Cleaver",  rarity:"common",    cat:"Basic",    buyPrice:30,   value:12,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#C8C4BC";ctx.beginPath();ctx.moveTo(-5,-46);ctx.lineTo(6,-46);ctx.lineTo(6,-12);ctx.lineTo(8,-12);ctx.lineTo(8,-4);ctx.lineTo(-5,-4);ctx.closePath();ctx.fill();ctx.strokeStyle="#9E9A92";ctx.lineWidth=0.5;ctx.stroke();ctx.fillStyle="#7A7670";ctx.beginPath();ctx.roundRect(-4,-4,8,22,2);ctx.fill();ctx.restore(); }},
  { id:"k_rusty",  name:"Rusty Ripper",   rarity:"common",    cat:"Basic",    buyPrice:30,   value:12,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#8A6048";ctx.beginPath();ctx.moveTo(0,-48);ctx.lineTo(3,-16);ctx.lineTo(3,2);ctx.lineTo(-3,2);ctx.lineTo(-3,-16);ctx.closePath();ctx.fill();ctx.fillStyle="#5A3826";[[-1,-38],[2,-28],[-2,-20]].forEach(([px,py])=>{ctx.beginPath();ctx.arc(px,py,1.4,0,Math.PI*2);ctx.fill();});ctx.fillStyle="#2E2016";ctx.beginPath();ctx.roundRect(-3,2,6,20,2);ctx.fill();ctx.restore(); }},
  { id:"k_camp",   name:"Camp Knife",     rarity:"common",    cat:"Basic",    buyPrice:30,   value:12,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#B4B0A8";ctx.beginPath();ctx.moveTo(0,-46);ctx.lineTo(3,-20);ctx.lineTo(3,0);ctx.lineTo(-3,0);ctx.lineTo(-3,-20);ctx.closePath();ctx.fill();ctx.fillStyle="#7A5636";ctx.beginPath();ctx.roundRect(-4,0,8,24,3);ctx.fill();ctx.strokeStyle="#3E2A18";ctx.lineWidth=1;[4,10,16].forEach(yy=>{ctx.beginPath();ctx.moveTo(-4,yy);ctx.lineTo(4,yy);ctx.stroke();});ctx.restore(); }},
  { id:"k_tanto",  name:"Tanto Point",    rarity:"uncommon",  cat:"Basic",    buyPrice:60,   value:24,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#B8B4AC";ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(4,-38);ctx.lineTo(4,-18);ctx.lineTo(-4,-14);ctx.lineTo(-4,-18);ctx.closePath();ctx.fill();ctx.fillStyle="#383634";ctx.beginPath();ctx.roundRect(-3,-14,6,26,3);ctx.fill();ctx.strokeStyle="#C89B3C";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-4,-2);ctx.lineTo(4,-2);ctx.stroke();ctx.restore(); }},

  // ── NATURE (1) ─────────────────────────────────────────────────────────────
  { id:"k_jungle", name:"Jungle Fang",    rarity:"uncommon",  cat:"Nature",   buyPrice:60,   value:24,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#4A8C3A";ctx.beginPath();ctx.moveTo(0,-54);ctx.bezierCurveTo(5,-34,5,-14,3,-4);ctx.lineTo(-3,-4);ctx.bezierCurveTo(-5,-14,-5,-34,0,-54);ctx.fill();ctx.strokeStyle="#1E5C1A";ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(0,-6);ctx.stroke();ctx.fillStyle="#3A2810";ctx.beginPath();ctx.roundRect(-3,-4,6,20,2);ctx.fill();ctx.restore(); }},

  // ── FANTASY (4) ────────────────────────────────────────────────────────────
  { id:"k_elven",  name:"Elven Whisper",  rarity:"uncommon",  cat:"Fantasy",  buyPrice:60,   value:24,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#6DCFAA";ctx.beginPath();ctx.moveTo(0,-56);ctx.bezierCurveTo(4,-36,4,-16,3,-6);ctx.lineTo(-3,-6);ctx.bezierCurveTo(-4,-16,-4,-36,0,-56);ctx.fill();ctx.strokeStyle="#1E8C60";ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(0,-54);ctx.lineTo(0,-8);ctx.stroke();ctx.fillStyle="#0C5038";ctx.beginPath();ctx.roundRect(-3,-6,6,20,2);ctx.fill();ctx.restore(); }},
  { id:"k_runic",  name:"Runic Carver",   rarity:"rare",      cat:"Fantasy",  buyPrice:150,  value:60,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#9A94DC";ctx.beginPath();ctx.moveTo(0,-54);ctx.lineTo(5,-26);ctx.lineTo(5,-6);ctx.lineTo(-5,-6);ctx.lineTo(-5,-26);ctx.closePath();ctx.fill();const p=0.4+0.3*Math.sin(t*0.003);ctx.strokeStyle=`rgba(160,152,240,${p})`;ctx.lineWidth=1;[-42,-30,-18].forEach(yy=>{ctx.beginPath();ctx.moveTo(-4,yy);ctx.lineTo(4,yy);ctx.stroke();});ctx.fillStyle="#2E2870";ctx.beginPath();ctx.roundRect(-3,-6,6,24,2);ctx.fill();ctx.restore(); }},
  { id:"k_bone",   name:"Boneclaw",       rarity:"rare",      cat:"Fantasy",  buyPrice:150,  value:60,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#E8D89C";ctx.beginPath();ctx.moveTo(0,-54);ctx.lineTo(4,-24);ctx.lineTo(6,-8);ctx.lineTo(-6,-8);ctx.lineTo(-4,-24);ctx.closePath();ctx.fill();ctx.fillStyle="#B09040";ctx.beginPath();ctx.roundRect(-4,-8,8,9,1);ctx.fill();ctx.fillStyle="#5C3810";ctx.beginPath();ctx.roundRect(-3,1,6,20,3);ctx.fill();ctx.restore(); }},
  { id:"k_crimson",name:"Crimson Tide",   rarity:"rare",      cat:"Fantasy",  buyPrice:150,  value:60,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#A02838";ctx.beginPath();ctx.moveTo(0,-56);ctx.bezierCurveTo(6,-38,-2,-24,5,-6);ctx.lineTo(-5,-6);ctx.bezierCurveTo(2,-24,-6,-38,0,-56);ctx.fill();const p=0.4+0.35*Math.sin(t*0.004);ctx.strokeStyle=`rgba(255,80,100,${p})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(0,-8);ctx.stroke();ctx.fillStyle="#3C0A12";ctx.beginPath();ctx.roundRect(-4,-6,8,22,3);ctx.fill();ctx.restore(); }},

  // ── NEON (3) ───────────────────────────────────────────────────────────────
  { id:"k_neonpink",name:"Neon Slash",    rarity:"rare",      cat:"Neon",     buyPrice:150,  value:60,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#1E1E1C";ctx.beginPath();ctx.moveTo(0,-54);ctx.lineTo(3,-18);ctx.lineTo(3,2);ctx.lineTo(-3,2);ctx.lineTo(-3,-18);ctx.closePath();ctx.fill();const g=ctx.createLinearGradient(0,-54,0,2);g.addColorStop(0,"#FF4499");g.addColorStop(1,"rgba(255,68,153,0)");ctx.strokeStyle=g;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(0,0);ctx.stroke();ctx.strokeStyle=`rgba(255,68,153,${0.3+0.3*Math.sin(t*0.005)})`;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(0,0);ctx.stroke();ctx.fillStyle="#1E1E1C";ctx.beginPath();ctx.roundRect(-3,2,6,20,2);ctx.fill();ctx.restore(); }},
  { id:"k_neoncyan",name:"Cyan Circuit",  rarity:"epic",      cat:"Neon",     buyPrice:400,  value:160,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#181818";ctx.beginPath();ctx.moveTo(0,-56);ctx.lineTo(4,-22);ctx.lineTo(4,2);ctx.lineTo(-4,2);ctx.lineTo(-4,-22);ctx.closePath();ctx.fill();const p=0.5+0.4*Math.sin(t*0.005);ctx.strokeStyle=`rgba(64,220,180,${p})`;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-54);ctx.lineTo(0,0);ctx.stroke();ctx.strokeStyle="#40DCB4";ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,-54);ctx.lineTo(0,0);ctx.stroke();ctx.fillStyle="#022C22";ctx.beginPath();ctx.roundRect(-3,2,6,20,2);ctx.fill();ctx.restore(); }},
  { id:"k_toxicbite",name:"Toxic Bite",   rarity:"epic",      cat:"Neon",     buyPrice:400,  value:160,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#183018";ctx.beginPath();ctx.moveTo(0,-56);ctx.lineTo(4,-22);ctx.lineTo(4,2);ctx.lineTo(-4,2);ctx.lineTo(-4,-22);ctx.closePath();ctx.fill();const p=0.5+0.4*Math.sin(t*0.006);ctx.strokeStyle=`rgba(140,230,60,${p})`;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-54);ctx.lineTo(0,0);ctx.stroke();ctx.strokeStyle="#8CE63C";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-54);ctx.lineTo(0,0);ctx.stroke();ctx.fillStyle="#0A1A0A";ctx.beginPath();ctx.roundRect(-3,2,6,20,2);ctx.fill();ctx.restore(); }},

  // ── ELEMENTAL (5) ──────────────────────────────────────────────────────────
  { id:"k_frostnip",name:"Frost Nip",     rarity:"uncommon",  cat:"Elemental",buyPrice:60,   value:24,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#9CC4E8";ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(4,-24);ctx.lineTo(4,-4);ctx.lineTo(-4,-4);ctx.lineTo(-4,-24);ctx.closePath();ctx.fill();ctx.strokeStyle="rgba(220,240,255,0.5)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-3,-40);ctx.lineTo(3,-36);ctx.stroke();ctx.fillStyle="#1A3858";ctx.beginPath();ctx.roundRect(-3,-4,6,20,2);ctx.fill();ctx.restore(); }},
  { id:"k_storm",  name:"Storm Edge",     rarity:"rare",      cat:"Elemental",buyPrice:150,  value:60,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#2C3E50";ctx.beginPath();ctx.moveTo(0,-56);ctx.lineTo(4,-24);ctx.lineTo(4,-4);ctx.lineTo(-4,-4);ctx.lineTo(-4,-24);ctx.closePath();ctx.fill();const fl=0.4+0.5*Math.abs(Math.sin(t*0.008));ctx.strokeStyle=`rgba(140,200,255,${fl})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(-2,-38);ctx.lineTo(2,-30);ctx.lineTo(-1,-16);ctx.lineTo(0,-8);ctx.stroke();ctx.fillStyle="#141C24";ctx.beginPath();ctx.roundRect(-3,-4,6,20,2);ctx.fill();ctx.restore(); }},
  { id:"k_inferno",name:"Inferno Fang",   rarity:"epic",      cat:"Elemental",buyPrice:400,  value:160,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);const fl=Math.sin(t*0.008)*2;ctx.fillStyle="#C04420";ctx.beginPath();ctx.moveTo(0,-54+fl);ctx.lineTo(5,-20);ctx.lineTo(5,2);ctx.lineTo(-5,2);ctx.lineTo(-5,-20);ctx.closePath();ctx.fill();ctx.fillStyle="#E8901C";ctx.beginPath();ctx.moveTo(0,-50+fl);ctx.lineTo(3,-26);ctx.lineTo(-3,-26);ctx.closePath();ctx.fill();ctx.fillStyle="#601808";ctx.beginPath();ctx.roundRect(-4,2,8,22,3);ctx.fill();ctx.restore(); }},
  { id:"k_glacier",name:"Glacier Spike",  rarity:"epic",      cat:"Elemental",buyPrice:400,  value:160,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#78AADC";ctx.beginPath();ctx.moveTo(0,-58);ctx.lineTo(4,-28);ctx.lineTo(6,-8);ctx.lineTo(-6,-8);ctx.lineTo(-4,-28);ctx.closePath();ctx.fill();ctx.strokeStyle=`rgba(180,220,255,${0.4+0.3*Math.sin(t*0.004)})`;ctx.lineWidth=2;[-46,-34,-22].forEach(yy=>{ctx.beginPath();ctx.moveTo(-5,yy);ctx.lineTo(5,yy+4);ctx.stroke();});ctx.fillStyle="#1A4080";ctx.beginPath();ctx.roundRect(-3,-8,6,30,3);ctx.fill();ctx.restore(); }},
  { id:"k_solarflare",name:"Solar Flare", rarity:"epic",      cat:"Elemental",buyPrice:400,  value:160,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);const fl=Math.sin(t*0.007)*2;ctx.fillStyle="#E86A1C";ctx.beginPath();ctx.moveTo(0,-58+fl);ctx.lineTo(5,-24);ctx.lineTo(5,0);ctx.lineTo(-5,0);ctx.lineTo(-5,-24);ctx.closePath();ctx.fill();const g=ctx.createLinearGradient(0,-58,0,0);g.addColorStop(0,"rgba(255,220,100,0.9)");g.addColorStop(1,"rgba(255,220,100,0)");ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-54+fl);ctx.lineTo(2,-30);ctx.lineTo(-2,-30);ctx.closePath();ctx.fill();ctx.fillStyle="#401A08";ctx.beginPath();ctx.roundRect(-4,0,8,22,3);ctx.fill();ctx.restore(); }},

  // ── GOLD / DIAMOND (3) ────────────────────────────────────────────────────
  { id:"k_goldleaf",name:"Gold Leaf",     rarity:"mythic", cat:"Gold",     buyPrice:1200, value:480,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#C89B3C";ctx.beginPath();ctx.moveTo(0,-58);ctx.lineTo(4,-22);ctx.lineTo(4,2);ctx.lineTo(-4,2);ctx.lineTo(-4,-22);ctx.closePath();ctx.fill();const s=0.5+0.4*Math.sin(t*0.005);ctx.strokeStyle=`rgba(255,220,120,${s})`;ctx.lineWidth=2;[{x:-3,y:-46},{x:3,y:-32},{x:-3,y:-20}].forEach(p=>{ctx.beginPath();ctx.moveTo(p.x-3,p.y);ctx.lineTo(p.x+3,p.y+6);ctx.stroke();});ctx.fillStyle="#6A4A10";ctx.beginPath();ctx.roundRect(-4,2,8,9,2);ctx.fill();ctx.fillStyle="#C89B3C";ctx.beginPath();ctx.roundRect(-3,11,6,14,3);ctx.fill();ctx.restore(); }},
  { id:"k_diamond", name:"Diamond Edge",  rarity:"mythic", cat:"Diamond",  buyPrice:1200, value:480,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#78AADC";ctx.beginPath();ctx.moveTo(0,-60);ctx.lineTo(5,-30);ctx.lineTo(5,-4);ctx.lineTo(-5,-4);ctx.lineTo(-5,-30);ctx.closePath();ctx.fill();ctx.fillStyle="#D8EEFF";ctx.beginPath();ctx.moveTo(0,-56);ctx.lineTo(3,-40);ctx.lineTo(0,-36);ctx.lineTo(-3,-40);ctx.closePath();ctx.fill();const s=`rgba(200,230,255,${0.5+0.4*Math.sin(t*0.006)})`;ctx.strokeStyle=s;ctx.lineWidth=1.5;[[-4,-24],[-4,-14]].forEach(([px,py])=>{ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(-px,py+4);ctx.stroke();});ctx.fillStyle="#0A3060";ctx.beginPath();ctx.roundRect(-3,-4,6,28,3);ctx.fill();ctx.restore(); }},
  { id:"k_phoenix", name:"Phoenix Wing",  rarity:"mythic", cat:"Gold",     buyPrice:1200, value:480,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);const g=ctx.createLinearGradient(0,-60,0,0);g.addColorStop(0,"#FFD24A");g.addColorStop(1,"#C0401C");ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-60);ctx.lineTo(5,-24);ctx.lineTo(5,2);ctx.lineTo(-5,2);ctx.lineTo(-5,-24);ctx.closePath();ctx.fill();const s=0.5+0.4*Math.sin(t*0.005);ctx.fillStyle=`rgba(255,200,90,${s})`;ctx.beginPath();ctx.moveTo(-5,-30);ctx.lineTo(-13,-24);ctx.lineTo(-5,-18);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(5,-30);ctx.lineTo(13,-24);ctx.lineTo(5,-18);ctx.closePath();ctx.fill();ctx.fillStyle="#5A1E08";ctx.beginPath();ctx.roundRect(-4,2,8,22,3);ctx.fill();ctx.restore(); }},

  // ── MYTHIC (4) ────────────────────────────────────────────────────────────
  { id:"k_plasma",  name:"Plasma Shift",  rarity:"legendary",    cat:"Animated", buyPrice:3000, value:1200,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);const h=(t*0.25)%360;ctx.fillStyle=`hsl(${h},80%,52%)`;ctx.beginPath();ctx.moveTo(0,-58);ctx.lineTo(4,-22);ctx.lineTo(4,2);ctx.lineTo(-4,2);ctx.lineTo(-4,-22);ctx.closePath();ctx.fill();ctx.strokeStyle=`hsla(${(h+80)%360},90%,72%,0.7)`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-56);ctx.lineTo(0,0);ctx.stroke();ctx.fillStyle="#181818";ctx.beginPath();ctx.roundRect(-3,2,6,20,2);ctx.fill();ctx.restore(); }},
  { id:"k_celestial",name:"Celestial Reaper",rarity:"legendary", cat:"Animated", buyPrice:3000, value:1200,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);const h=(t*0.15+180)%360;ctx.fillStyle=`hsl(${h},70%,22%)`;ctx.beginPath();ctx.moveTo(0,-62);ctx.lineTo(5,-28);ctx.lineTo(5,2);ctx.lineTo(-5,2);ctx.lineTo(-5,-28);ctx.closePath();ctx.fill();for(let i=0;i<5;i++){const py=-56+i*12,px=3*Math.sin(t*0.004+i*1.3);ctx.fillStyle=`rgba(255,255,255,${0.3+0.3*Math.sin(t*0.006+i)})`;ctx.beginPath();ctx.arc(px,py,1.3,0,Math.PI*2);ctx.fill();}ctx.strokeStyle=`hsla(${(h+140)%360},90%,72%,0.6)`;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,-58);ctx.lineTo(0,0);ctx.stroke();ctx.fillStyle="#0A0616";ctx.beginPath();ctx.roundRect(-4,2,8,22,3);ctx.fill();ctx.restore(); }},
  { id:"k_void",    name:"Void Reaper",   rarity:"legendary",    cat:"Animated", buyPrice:3000, value:1200,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#0E0A1E";ctx.beginPath();ctx.moveTo(0,-60);ctx.lineTo(5,-26);ctx.lineTo(5,2);ctx.lineTo(-5,2);ctx.lineTo(-5,-26);ctx.closePath();ctx.fill();for(let i=0;i<6;i++){const py=-54+i*10,px=2.5*Math.sin(t*0.006+i*1.1);ctx.fillStyle=`rgba(160,140,240,${0.2+0.15*Math.sin(t*0.004+i)})`;ctx.beginPath();ctx.arc(px,py,1.8,0,Math.PI*2);ctx.fill();}ctx.strokeStyle=`rgba(140,120,220,${0.3+0.2*Math.sin(t*0.005)})`;ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(5,0);ctx.stroke();ctx.fillStyle="#1A1040";ctx.beginPath();ctx.roundRect(-3,2,6,20,3);ctx.fill();ctx.restore(); }},
  { id:"k_sovereign",name:"The Sovereign",rarity:"legendary",   cat:"Limited",  buyPrice:3000, value:1200,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#CC3366";ctx.beginPath();ctx.moveTo(0,-62);ctx.bezierCurveTo(6,-42,6,-20,5,2);ctx.lineTo(-5,2);ctx.bezierCurveTo(-6,-20,-6,-42,0,-62);ctx.fill();const s=0.5+0.4*Math.abs(Math.sin(t*0.005));ctx.strokeStyle=`rgba(255,180,210,${s})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-58);ctx.lineTo(0,-2);ctx.stroke();ctx.fillStyle="#FFB0D0";ctx.beginPath();ctx.moveTo(-6,-28);ctx.lineTo(-12,-22);ctx.lineTo(-6,-16);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(6,-28);ctx.lineTo(12,-22);ctx.lineTo(6,-16);ctx.closePath();ctx.fill();ctx.fillStyle="#440E22";ctx.beginPath();ctx.roundRect(-3,2,6,20,3);ctx.fill();ctx.restore(); }},
];


// ─── CRATES ───────────────────────────────────────────────────────────────────
const CRATES = [
  { id:"c_standard", name:"Standard Case",  price:100,  icon:"📦",
    weights:{ common:0.60, uncommon:0.30, rare:0.09, epic:0.01, legendary:0, mythic:0 }},
  { id:"c_pro",      name:"Pro Case",        price:300, icon:"🗃️",
    weights:{ common:0.15, uncommon:0.28, rare:0.32, epic:0.18, mythic:0.065, legendary:0.005 }},
  { id:"c_elite",    name:"Elite Case",     price:700, icon:"🔮",
    weights:{ common:0, uncommon:0.04, rare:0.15, epic:0.36, mythic:0.38, legendary:0.07 }},
];

// ─── MAPS / ARENAS ────────────────────────────────────────────────────────────
// Five arenas, each more elaborate than the last. Unlocked by best score.
// Each has: speedMod (log spin multiplier), unlockScore, and drawBackground(ctx,W,H,t,CX,LOG_CY).
// Difficulty and visual complexity both climb with tier.
const MAPS = [
  // ── TIER 1 — Practice Yard ──────────────────────────────────────────────
  { id:"yard", name:"Practice Yard", icon:"🪵", unlockScore:0, speedMod:1.08, levelReward:2,
    blurb:"Where every thrower starts. Plain, calm, forgiving.",
    drawBackground(ctx,W,H,t,CX,CY){
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,"#1A1610"); g.addColorStop(1,"#241D14");
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      // Dirt floor
      ctx.fillStyle="#2E2418"; ctx.fillRect(0,H-46,W,46);
      ctx.strokeStyle="#3A2E1C"; ctx.lineWidth=1;
      for(let x=0;x<W;x+=26){ctx.beginPath();ctx.moveTo(x,H-46);ctx.lineTo(x,H);ctx.stroke();}
      // Simple wood fence posts
      for(let px of [14,W-22]){
        ctx.fillStyle="#3E3018"; ctx.fillRect(px,H-190,12,190);
        ctx.fillStyle="#241C0E"; ctx.fillRect(px-2,H-192,16,5);
      }
      // Single hanging lantern, gentle sway
      const sway=Math.sin(t*0.0015)*3;
      ctx.strokeStyle="#5A4828"; ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(CX,0);ctx.lineTo(CX+sway,40);ctx.stroke();
      ctx.fillStyle="#E8C878"; ctx.beginPath(); ctx.arc(CX+sway,46,5,0,Math.PI*2); ctx.fill();
      const glow=ctx.createRadialGradient(CX+sway,46,0,CX+sway,46,60);
      glow.addColorStop(0,"rgba(232,200,120,0.12)"); glow.addColorStop(1,"transparent");
      ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);
      // Header
      ctx.fillStyle="#161310"; ctx.fillRect(0,0,W,26);
      ctx.strokeStyle="#2E2920"; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(0,26); ctx.lineTo(W,26); ctx.stroke();
      ctx.font="bold 13px 'Courier New',monospace"; ctx.fillStyle="#7A5E24"; ctx.textAlign="center";
      ctx.fillText("🪵 PRACTICE YARD",CX,18);
    }},

  // ── TIER 2 — Exhibition Hall ─────────────────────────────────────────────
  { id:"hall", name:"Exhibition Hall", icon:"🏛️", unlockScore:20, speedMod:1.20, levelReward:4,
    blurb:"Marble floors and velvet ropes. Crowds are starting to gather.",
    drawBackground(ctx,W,H,t,CX,CY){
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,"#171328"); g.addColorStop(1,"#241D40");
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      // Marble floor with veining
      ctx.fillStyle="#D8D2C0"; ctx.fillRect(0,H-50,W,50);
      ctx.strokeStyle="#B8B2A0"; ctx.lineWidth=1;
      for(let x=0;x<W;x+=30){ctx.beginPath();ctx.moveTo(x,H-50);ctx.lineTo(x,H);ctx.stroke();}
      ctx.strokeStyle="rgba(150,145,130,0.4)"; ctx.lineWidth=0.6;
      for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(i*70,H-50);ctx.bezierCurveTo(i*70+20,H-30,i*70-10,H-15,i*70+40,H);ctx.stroke();}
      // Marble columns, capitals
      for(let px of [16,W-28]){
        ctx.fillStyle="#C8C2B0"; ctx.fillRect(px,H-230,16,230);
        ctx.fillStyle="#A8A290"; ctx.fillRect(px-4,H-234,24,8); ctx.fillRect(px-4,H-52,24,8);
        for(let yy=H-220;yy<H-60;yy+=14){ ctx.strokeStyle="#B8B2A0"; ctx.lineWidth=0.6; ctx.beginPath(); ctx.moveTo(px,yy); ctx.lineTo(px+16,yy); ctx.stroke(); }
      }
      // Small flickering flames on the column caps
      for(let fx of [24,W-20]){
        const fy=H-244;
        const pulse=0.72+0.28*Math.abs(Math.sin(t*0.012+fx));
        const glow=ctx.createRadialGradient(fx,fy+2,0,fx,fy+2,30);
        glow.addColorStop(0,`rgba(255,160,60,${0.22*pulse})`);
        glow.addColorStop(0.55,`rgba(255,80,30,${0.08*pulse})`);
        glow.addColorStop(1,"rgba(255,80,30,0)");
        ctx.fillStyle=glow; ctx.fillRect(fx-34,fy-30,68,60);
        ctx.fillStyle=`rgba(255,95,28,${0.82+0.12*pulse})`;
        ctx.beginPath();
        ctx.moveTo(fx-6,fy+8);
        ctx.quadraticCurveTo(fx-10,fy-5,fx,fy-18-4*pulse);
        ctx.quadraticCurveTo(fx+10,fy-4,fx+6,fy+8);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle=`rgba(255,220,95,${0.86+0.1*pulse})`;
        ctx.beginPath();
        ctx.moveTo(fx-3,fy+7);
        ctx.quadraticCurveTo(fx-5,fy-3,fx+1,fy-12-3*pulse);
        ctx.quadraticCurveTo(fx+5,fy-2,fx+3,fy+7);
        ctx.closePath(); ctx.fill();
      }
      // Velvet rope swag
      ctx.strokeStyle="#7A1818"; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(24,H-72); ctx.bezierCurveTo(CX,H-86,CX,H-86,W-20,H-72); ctx.stroke();
      ctx.fillStyle="#5A1010";
      [24,W-20].forEach(px=>{ctx.beginPath();ctx.arc(px,H-76,5,0,Math.PI*2);ctx.fill();});
      // Spotlights
      [[CX*0.5,"rgba(255,240,210,0.07)"],[CX,"rgba(200,210,255,0.06)"],[CX*1.5,"rgba(255,240,210,0.07)"]].forEach(([sx,col])=>{
        const sp=ctx.createRadialGradient(sx,0,0,sx,0,160);
        sp.addColorStop(0,col); sp.addColorStop(1,"transparent");
        ctx.fillStyle=sp; ctx.fillRect(0,0,W,H);
      });
      // Header banner
      ctx.fillStyle="rgba(80,60,160,0.7)"; ctx.fillRect(0,0,W,27);
      ctx.fillStyle="rgba(255,255,255,0.8)"; ctx.font="bold 13px sans-serif"; ctx.textAlign="center";
      ctx.fillText("🏛️ EXHIBITION HALL",CX,18);
    }},

  // ── TIER 3 — Neon District ────────────────────────────────────────────────
  { id:"neon", name:"Neon District", icon:"🌆", unlockScore:40, speedMod:1.34, levelReward:6,
    blurb:"Rooftop throws under a buzzing skyline. Faster. Louder. Brighter.",
    drawBackground(ctx,W,H,t,CX,CY){
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,"#05030C"); g.addColorStop(0.6,"#0A0518"); g.addColorStop(1,"#150A28");
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

      // Slow background plane crossing the skyline
      const planeCycle = W + 520;
      const planePhase = (t*0.045) % planeCycle;
      if (planePhase < W + 90) {
        const planePass = Math.floor((t*0.045) / planeCycle);
        const planeDir = planePass % 2 === 0 ? -1 : 1;
        const planeX = planeDir === -1 ? W + 45 - planePhase : planePhase - 45;
        const planeY = 62 + Math.sin(t*0.0015)*5;
        ctx.save();
        ctx.translate(planeX, planeY);
        ctx.scale(planeDir, 1);
        ctx.scale(0.72, 0.72);

      // Faint neon contrail
      const trail = ctx.createLinearGradient(-52,0,-16,0);
      trail.addColorStop(0,"rgba(45,90,120,0)");
      trail.addColorStop(1,"rgba(45,90,120,0.14)");
      ctx.strokeStyle = trail;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-54,1);
      ctx.bezierCurveTo(-42,-2,-31,-2,-20,0);
      ctx.stroke();

      // Main fuselage
      ctx.fillStyle = "rgba(42,55,78,0.82)";
      ctx.strokeStyle = "rgba(85,120,150,0.34)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(24,0);
      ctx.bezierCurveTo(14,-5,-8,-6,-26,-4);
      ctx.lineTo(-34,-10);
      ctx.lineTo(-29,-3);
      ctx.bezierCurveTo(-35,-2,-39,0,-40,2);
      ctx.bezierCurveTo(-22,5,9,5,24,0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Wings
      ctx.fillStyle = "rgba(34,45,68,0.82)";
      ctx.beginPath();
      ctx.moveTo(-4,-2);
      ctx.lineTo(-23,-17);
      ctx.lineTo(-10,-2);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-2,3);
      ctx.lineTo(-24,17);
      ctx.lineTo(-9,3);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Realistic dim wingtip navigation lights for night readability
      const navBlink = Math.abs(Math.sin(t*0.018));
      const strobe = Math.pow(Math.abs(Math.sin(t*0.045)), 8);
      ctx.fillStyle = `rgba(220,45,70,${0.16+navBlink*0.64})`;
      ctx.beginPath(); ctx.arc(-23,-17,1.7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(55,220,135,${0.14+navBlink*0.62})`;
      ctx.beginPath(); ctx.arc(-24,17,1.7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(230,245,255,${0.12+strobe*0.88})`;
      ctx.beginPath(); ctx.arc(-6,0,1.5,0,Math.PI*2); ctx.fill();

      // Tail fin and rear wing
      ctx.fillStyle = "rgba(58,42,82,0.72)";
      ctx.beginPath();
      ctx.moveTo(-30,-4);
      ctx.lineTo(-42,-15);
      ctx.lineTo(-36,-3);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-31,3);
      ctx.lineTo(-43,10);
      ctx.lineTo(-36,2);
      ctx.closePath();
      ctx.fill();

      // Cockpit and blinking nav light
      ctx.fillStyle = "rgba(110,150,180,0.34)";
      ctx.beginPath();
      ctx.ellipse(10,-2,4,1.5,-0.1,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle = `rgba(170,45,80,${0.18+0.18*Math.abs(Math.sin(t*0.01))})`;
      ctx.beginPath();
      ctx.arc(-38,0,1.8,0,Math.PI*2);
      ctx.fill();
        ctx.restore();
      }

      // Distant skyline silhouettes
      const buildings=[
        [-18,85,34,0.42],[14,120,38,0.62],[54,148,50,0.74],[101,102,34,0.48],
        [128,136,44,0.64],[169,96,30,0.5],[195,156,48,0.7],[240,118,36,0.58],
        [270,142,42,0.67],[309,92,34,0.46],[336,130,46,0.6]
      ];
      buildings.forEach(([bx,bh,bw,op])=>{
        ctx.fillStyle=`rgba(20,12,40,${op})`;
        ctx.fillRect(bx,H-160-bh,bw,bh+110);
        ctx.fillStyle=`rgba(8,5,22,${Math.min(0.78,op+0.15)})`;
        ctx.fillRect(bx+3,H-158-bh,bw-6,4);
        // lit windows
        for(let wy=H-150-bh;wy<H-60;wy+=11){
          for(let wx=bx+5;wx<bx+bw-5;wx+=9){
            if(Math.sin(wx*3+wy*1.7+bx)>0.6){
              ctx.fillStyle=`rgba(255,200,80,${0.5+0.3*Math.sin(t*0.003+wx)})`;
              ctx.fillRect(wx,wy,4,5);
            }
          }
        }
      });
      // Rooftop floor
      ctx.fillStyle="#100A1C"; ctx.fillRect(0,H-50,W,50);
      ctx.strokeStyle="#241640"; ctx.lineWidth=1;
      for(let x=0;x<W;x+=24){ctx.beginPath();ctx.moveTo(x,H-50);ctx.lineTo(x,H);ctx.stroke();}
      // Neon rim along rooftop edge
      const rimPulse=0.5+0.4*Math.sin(t*0.004);
      ctx.strokeStyle=`rgba(255,40,160,${rimPulse})`; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(0,H-50); ctx.lineTo(W,H-50); ctx.stroke();
      ctx.strokeStyle=`rgba(60,220,255,${rimPulse*0.8})`; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,H-48); ctx.lineTo(W,H-48); ctx.stroke();
      // Neon side signs
      /*
      for(let [sx,col,label] of [[20,"#FF2890","蜉"],[W-32,"#3CDCFF","乙"]]){
        const p=0.5+0.4*Math.sin(t*0.005+sx);
        ctx.strokeStyle=`rgba(${col==="#FF2890"?"255,40,144":"60,220,255"},${p})`;
        ctx.lineWidth=1.5; ctx.strokeRect(sx,H-210,16,60);
        ctx.fillStyle=col; ctx.globalAlpha=p; ctx.font="bold 12px sans-serif"; ctx.textAlign="center";
        ctx.fillText(label,sx+8,H-175); ctx.globalAlpha=1;
      }
      */
      // Drifting particles (city dust / sparks)
      for(let i=0;i<10;i++){
        const px=(i*53+t*0.02)%W, py=((i*97)%(H-60));
        ctx.fillStyle=`rgba(180,160,255,${0.15+0.15*Math.sin(t*0.003+i)})`;
        ctx.beginPath(); ctx.arc(px,py,1,0,Math.PI*2); ctx.fill();
      }
      // Header
      ctx.fillStyle="rgba(10,5,20,0.85)"; ctx.fillRect(0,0,W,27);
      ctx.strokeStyle=`rgba(255,40,160,${rimPulse})`; ctx.lineWidth=0.6; ctx.beginPath(); ctx.moveTo(0,27); ctx.lineTo(W,27); ctx.stroke();
      ctx.fillStyle=`rgba(80,220,255,${0.7+0.3*Math.sin(t*0.006)})`; ctx.font="bold 13px 'Courier New',monospace"; ctx.textAlign="center";
      ctx.fillText("🌆 NEON DISTRICT",CX,18);
    }},

  // ── TIER 4 — Volcanic Forge ───────────────────────────────────────────────
  { id:"forge", name:"Volcanic Forge", icon:"🌋", unlockScore:60, speedMod:1.50, levelReward:8,
    blurb:"Molten light, hammering heat. Only steady hands survive here.",
    drawBackground(ctx,W,H,t,CX,CY){
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,"#1A0805"); g.addColorStop(0.5,"#2A0E08"); g.addColorStop(1,"#180400");
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      // Distant volcano, swelling with pressure before an eruption
      const lavaGlow=0.5+0.4*Math.sin(t*0.004);
      const pulse=0.55+0.45*Math.abs(Math.sin(t*0.0035));
      [[94,1.18],[W-94,1]].forEach(([VX,VS], vi)=>{
      const vg=ctx.createRadialGradient(VX,H-88,0,VX,H-88,142*VS);
      vg.addColorStop(0,`rgba(255,85,25,${0.16*pulse})`);
      vg.addColorStop(0.42,`rgba(120,30,10,${0.11*pulse})`);
      vg.addColorStop(1,"rgba(80,10,4,0)");
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

      // smoke plume behind the log
      for(let i=0;i<7;i++){
        const sx=VX+(-36+i*12)*VS+Math.sin(t*0.001+i+vi)*10*VS;
        const sy=H-137*VS-i*12*VS-((t*0.012+i*9)%24);
        const sr=(16+i*2)*VS;
        ctx.fillStyle=`rgba(70,48,42,${0.10+0.035*Math.sin(t*0.002+i)})`;
        ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2); ctx.fill();
      }

      // main mountain body
      ctx.fillStyle="#0B0302";
      ctx.beginPath();
      ctx.moveTo(VX-124*VS,H-46*VS);
      ctx.lineTo(VX-58*VS,H-126*VS);
      ctx.lineTo(VX-27*VS,H-157*VS);
      ctx.lineTo(VX-11*VS,H-146*VS);
      ctx.lineTo(VX+11*VS,H-146*VS);
      ctx.lineTo(VX+27*VS,H-157*VS);
      ctx.lineTo(VX+58*VS,H-126*VS);
      ctx.lineTo(VX+124*VS,H-46*VS);
      ctx.closePath();
      ctx.fill();

      // darker ridges
      ctx.strokeStyle="rgba(60,18,10,0.7)"; ctx.lineWidth=2;
      [[-86,-58,-29,-146],[-45,-57,-8,-143],[45,-57,13,-143],[90,-58,31,-132]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(VX+x1*VS,H+y1*VS); ctx.lineTo(VX+x2*VS,H+y2*VS); ctx.stroke();
      });

      // glowing crater and lava seams
      const crater=ctx.createRadialGradient(VX,H-150*VS,0,VX,H-150*VS,40*VS);
      crater.addColorStop(0,`rgba(255,210,80,${0.75*pulse})`);
      crater.addColorStop(0.35,`rgba(255,90,20,${0.55*pulse})`);
      crater.addColorStop(1,"rgba(255,90,20,0)");
      ctx.fillStyle=crater; ctx.fillRect(VX-60*VS,H-193*VS,120*VS,76*VS);
      ctx.fillStyle=`rgba(255,115,28,${0.75*pulse})`;
      ctx.beginPath(); ctx.ellipse(VX,H-150*VS,22*VS,7*VS,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=`rgba(255,95,25,${0.55*pulse})`; ctx.lineWidth=2;
      [[-8,-145,-22,-105,-16,-70],[11,-146,27,-113,22,-80],[-1,-145,3,-112,-5,-92]].forEach(path=>{
        ctx.beginPath(); ctx.moveTo(VX+path[0]*VS,H+path[1]*VS);
        ctx.lineTo(VX+path[2]*VS,H+path[3]*VS); ctx.lineTo(VX+path[4]*VS,H+path[5]*VS); ctx.stroke();
      });

      // pressure sparks above the crater
      for(let i=0;i<10;i++){
        const a=i*0.9+t*0.004+vi*0.6;
        const sx=VX+Math.cos(a)*(8+i*3)*VS;
        const sy=H-154*VS-Math.abs(Math.sin(a*1.4))*26*VS-i*2.8*VS;
        ctx.fillStyle=`rgba(255,150,55,${0.25+0.35*pulse})`;
        ctx.beginPath(); ctx.arc(sx,sy,1.2,0,Math.PI*2); ctx.fill();
      }
      });
      // Uneven stepping-stone path floor
      const floorTop = H - 74;
      const fg=ctx.createLinearGradient(0,floorTop,0,H);
      fg.addColorStop(0,"#070302"); fg.addColorStop(0.45,"#070302"); fg.addColorStop(1,"#030101");
      ctx.fillStyle=fg; ctx.fillRect(0,floorTop,W,H-floorTop);
      ctx.fillStyle="rgba(0,0,0,0.42)";
      ctx.fillRect(0,floorTop,W,5);
      const upperRoadLight=ctx.createLinearGradient(0,floorTop,0,floorTop+28);
      upperRoadLight.addColorStop(0,"rgba(95,34,18,0.22)");
      upperRoadLight.addColorStop(1,"rgba(95,34,18,0)");
      ctx.fillStyle=upperRoadLight; ctx.fillRect(0,floorTop,W,30);
      const roadShadow=ctx.createLinearGradient(0,floorTop+18,0,H);
      roadShadow.addColorStop(0,"rgba(0,0,0,0)");
      roadShadow.addColorStop(1,"rgba(0,0,0,0.52)");
      ctx.fillStyle=roadShadow; ctx.fillRect(0,floorTop,W,H-floorTop);

      const stones=[
        [-180,18,44,24,-0.08],[-112,30,58,26,0.04],[-42,16,48,28,-0.03],
        [-156,24,20,14,-0.05],[-73,24,24,16,0.05],[-8,24,20,15,-0.06],[76,25,22,15,0.07],[154,26,24,15,-0.05],[222,31,20,14,0.05],
        [30,35,66,26,0.06],[-2,44,18,13,0.03],[111,18,52,30,-0.04],[184,33,64,24,0.03],
        [-150,61,74,30,0.05],[-100,59,20,15,0.05],[-58,57,56,32,-0.06],[-15,59,26,18,0.04],[32,65,68,28,0.02],[83,62,24,17,-0.05],[174,61,22,16,0.06],[259,67,18,13,-0.04],
        [123,57,76,31,-0.04],[218,64,68,26,-0.03]
      ];
      stones.forEach(([ox,oy,sw,sh,rot],i)=>{
        const scale=1+oy/95;
        const sx=CX+ox*scale;
        const sy=floorTop+oy;
        const w=sw*scale*0.86;
        const h=sh*scale*0.86;
        ctx.save();
        ctx.translate(sx,sy);
        ctx.rotate(rot);
        const sg=ctx.createLinearGradient(0,-h/2,0,h/2);
        sg.addColorStop(0,"#5A554C");
        sg.addColorStop(0.45,"#3E3A34");
        sg.addColorStop(1,"#23201D");
        ctx.fillStyle=sg;
        ctx.beginPath();
        if (i % 5 === 1) {
          ctx.ellipse(0,0,w*0.48,h*0.46,0.08,0,Math.PI*2);
        } else if (i % 5 === 3) {
          ctx.moveTo(-w*0.34,-h*0.52);
          ctx.quadraticCurveTo(w*0.08,-h*0.64,w*0.46,-h*0.22);
          ctx.quadraticCurveTo(w*0.58,h*0.18,w*0.20,h*0.54);
          ctx.quadraticCurveTo(-w*0.28,h*0.58,-w*0.52,h*0.10);
          ctx.quadraticCurveTo(-w*0.58,-h*0.24,-w*0.34,-h*0.52);
        } else {
          ctx.moveTo(-w*0.45,-h*0.45);
          ctx.quadraticCurveTo(-w*0.08,-h*0.58,w*0.42,-h*0.38);
          ctx.quadraticCurveTo(w*0.55,-h*0.02,w*0.38,h*0.42);
          ctx.quadraticCurveTo(-w*0.02,h*0.56,-w*0.46,h*0.34);
          ctx.quadraticCurveTo(-w*0.56,-h*0.02,-w*0.45,-h*0.45);
        }
        ctx.fill();
        ctx.strokeStyle="rgba(10,8,7,0.85)";
        ctx.lineWidth=1;
        ctx.stroke();

        // chipped rock cracks like dark slate
        ctx.strokeStyle="rgba(7,6,5,0.62)";
        ctx.lineWidth=0.9;
        ctx.beginPath();
        ctx.moveTo(-w*0.20,-h*0.42);
        ctx.quadraticCurveTo(-w*0.05,-h*0.14,-w*0.12,h*0.10);
        ctx.lineTo(w*0.12,h*0.38);
        ctx.stroke();
        if (i % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(-w*0.42,h*0.10);
          ctx.quadraticCurveTo(-w*0.10,h*0.04,w*0.16,h*0.02);
          ctx.stroke();
        }

        // tiny mineral speckles
        ctx.fillStyle="rgba(180,170,150,0.18)";
        for(let s=0;s<5;s++){
          const px=-w*0.35+((s*17+i*9)%(w*0.7));
          const py=-h*0.30+((s*11+i*5)%(h*0.6));
          ctx.fillRect(px,py,1,1);
        }
        ctx.restore();
      });

      // Two forge braziers flanking, with flickering flame
      for(let bx of [22,W-30]){
        const cx=bx+8;
        const fl=Math.sin(t*0.012+bx)*3;
        const flamePulse=0.65+0.35*Math.abs(Math.sin(t*0.01+bx));

        const glow=ctx.createRadialGradient(cx,H-108,0,cx,H-108,64);
        glow.addColorStop(0,`rgba(255,140,45,${0.24*flamePulse})`);
        glow.addColorStop(0.45,`rgba(255,75,20,${0.10*flamePulse})`);
        glow.addColorStop(1,"transparent");
        ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);

        // iron post and cup
        ctx.fillStyle="#130806"; ctx.beginPath(); ctx.roundRect(bx+3,H-89,10,42,2); ctx.fill();
        ctx.fillStyle="#2B1710"; ctx.beginPath(); ctx.roundRect(bx-2,H-92,20,8,2); ctx.fill();
        ctx.fillStyle="#070303"; ctx.beginPath(); ctx.ellipse(cx,H-88,11,4,0,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle="rgba(120,70,45,0.55)"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(bx-2,H-88); ctx.lineTo(bx+18,H-88); ctx.stroke();

        // smoke wisps
        ctx.strokeStyle="rgba(70,52,48,0.18)"; ctx.lineWidth=1;
        for(let s=0;s<2;s++){
          ctx.beginPath();
          ctx.moveTo(cx+s*3-2,H-123);
          ctx.bezierCurveTo(cx-8+s*5,H-134,cx+9-s*4,H-143,cx+s*2,H-153);
          ctx.stroke();
        }

        // outer flame
        ctx.fillStyle=`rgba(255,90,30,${0.82+0.12*flamePulse})`;
        ctx.beginPath();
        ctx.moveTo(cx-9,H-88);
        ctx.bezierCurveTo(cx-13,H-104,cx+fl-4,H-115,cx,H-133);
        ctx.bezierCurveTo(cx+10+fl,H-116,cx+13,H-101,cx+9,H-88);
        ctx.closePath(); ctx.fill();

        // inner flame
        ctx.fillStyle=`rgba(255,205,80,${0.86})`;
        ctx.beginPath();
        ctx.moveTo(cx-5,H-88);
        ctx.bezierCurveTo(cx-7,H-101,cx+fl*0.5,H-110,cx+1,H-123);
        ctx.bezierCurveTo(cx+6,H-110,cx+7,H-99,cx+4,H-88);
        ctx.closePath(); ctx.fill();

        // hot core
        ctx.fillStyle="rgba(255,245,170,0.75)";
        ctx.beginPath();
        ctx.moveTo(cx-2,H-89);
        ctx.quadraticCurveTo(cx+2,H-104,cx,H-113);
        ctx.quadraticCurveTo(cx+4,H-101,cx+2,H-89);
        ctx.closePath(); ctx.fill();
      }
      // Drifting embers rising
      for(let i=0;i<14;i++){
        const ex=(i*41+Math.sin(t*0.001+i)*20)%W;
        const ey=H-60-((t*0.04+i*30)%(H-100));
        const ea=Math.max(0,1-(ey/(H-100)));
        ctx.fillStyle=`rgba(255,160,60,${0.5*ea})`;
        ctx.beginPath(); ctx.arc(ex,ey,1.4,0,Math.PI*2); ctx.fill();
      }
      // Ambient heat haze tint over whole scene
      const haze=ctx.createRadialGradient(CX,H-150,0,CX,H-150,200);
      haze.addColorStop(0,`rgba(255,90,30,${0.05+0.03*Math.sin(t*0.003)})`); haze.addColorStop(1,"transparent");
      ctx.fillStyle=haze; ctx.fillRect(0,0,W,H);
      // Header
      ctx.fillStyle="rgba(20,6,2,0.85)"; ctx.fillRect(0,0,W,27);
      ctx.strokeStyle=`rgba(255,120,40,${lavaGlow})`; ctx.lineWidth=0.8; ctx.beginPath(); ctx.moveTo(0,27); ctx.lineTo(W,27); ctx.stroke();
      ctx.fillStyle=`rgba(255,150,60,${0.7+0.3*lavaGlow})`; ctx.font="bold 13px 'Courier New',monospace"; ctx.textAlign="center";
      ctx.fillText("🌋 VOLCANIC FORGE",CX,18);
    }},

  // ── TIER 5 — Celestial Arena ─────────────────────────────────────────────
  { id:"celestial", name:"Celestial Arena", icon:"🌌", unlockScore:80, speedMod:1.68, levelReward:10,
    blurb:"The final stage. Stars, gold, and a crowd that never blinks.",
    drawBackground(ctx,W,H,t,CX,CY){
      // Deep space gradient
      const g=ctx.createRadialGradient(CX,H*0.3,0,CX,H*0.3,H*0.9);
      g.addColorStop(0,"#1C1240"); g.addColorStop(0.5,"#0E0A28"); g.addColorStop(1,"#040210");
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      // Starfield, twinkling
      for(let i=0;i<40;i++){
        const sx=(i*53)%W, sy=(i*37+ (i*13)%50)%((H-50));
        const tw=0.3+0.5*Math.abs(Math.sin(t*0.002+i*1.7));
        ctx.fillStyle=`rgba(255,255,255,${tw})`;
        ctx.beginPath(); ctx.arc(sx,sy,i%5===0?1.4:0.7,0,Math.PI*2); ctx.fill();
      }
      // Nebula wisps
      for(let i=0;i<3;i++){
        const nx=60+i*100, ny=60+i*30;
        const neb=ctx.createRadialGradient(nx,ny,0,nx,ny,70);
        neb.addColorStop(0,`rgba(${i%2===0?"180,80,220":"80,160,255"},0.08)`); neb.addColorStop(1,"transparent");
        ctx.fillStyle=neb; ctx.fillRect(0,0,W,H);
      }
      // Golden floor — celestial dais
      ctx.fillStyle="#241A0A"; ctx.fillRect(0,H-52,W,52);
      const floorShine=0.3+0.2*Math.sin(t*0.003);
      ctx.fillStyle=`rgba(232,200,120,${floorShine})`; ctx.fillRect(0,H-52,W,2);
      ctx.strokeStyle="rgba(150,110,40,0.5)"; ctx.lineWidth=0.8;
      for(let x=0;x<W;x+=24){ctx.beginPath();ctx.moveTo(x,H-50);ctx.lineTo(x,H);ctx.stroke();}
      // ── FLYING UFOs ──────────────────────────────────────────────────────
      // Two saucers drift across the starfield on independent slow sweeping
      // paths (not a tight fixed orbit), each with: a metallic saucer body,
      // a glowing dome on top, blinking rim lights that cycle around the
      // edge, and a faint beam of light shining down — classic "real UFO"
      // silhouette instead of a bare ring.
      function drawUFO(ux, uy, scale, seed) {
        ctx.save();
        ctx.translate(ux, uy);
        ctx.scale(scale, scale);

        // Soft ambient glow behind the whole craft
        const haloPulse = 0.25 + 0.15*Math.sin(t*0.004 + seed);
        const halo = ctx.createRadialGradient(0,0,0,0,0,34);
        halo.addColorStop(0, `rgba(180,220,255,${haloPulse})`);
        halo.addColorStop(1, "transparent");
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(0,0,34,0,Math.PI*2); ctx.fill();

        // Downward beam — flickers gently, like a tractor-beam scan
        const beamFlicker = 0.10 + 0.08*Math.abs(Math.sin(t*0.006 + seed*2));
        const beam = ctx.createLinearGradient(0,4,0,46);
        beam.addColorStop(0, `rgba(200,255,230,${beamFlicker})`);
        beam.addColorStop(1, "rgba(200,255,230,0)");
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(-3,4); ctx.lineTo(3,4); ctx.lineTo(14,46); ctx.lineTo(-14,46);
        ctx.closePath(); ctx.fill();

        // Saucer body — wide flattened ellipse, metallic shading
        ctx.fillStyle = "#9AA8B8";
        ctx.beginPath(); ctx.ellipse(0,2,18,6,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = "#C2CCDA";
        ctx.beginPath(); ctx.ellipse(0,0,18,6,0,0,Math.PI*2); ctx.fill();
        // Underside shadow rim
        ctx.fillStyle = "rgba(40,46,56,0.5)";
        ctx.beginPath(); ctx.ellipse(0,3,16,4,0,0,Math.PI); ctx.fill();

        // Glowing dome on top
        const domePulse = 0.6 + 0.4*Math.sin(t*0.005 + seed*1.3);
        ctx.fillStyle = `rgba(140,230,210,${domePulse})`;
        ctx.beginPath(); ctx.ellipse(0,-3,7,6,0,Math.PI,0); ctx.fill();
        ctx.strokeStyle = "rgba(220,255,250,0.8)"; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.ellipse(0,-3,7,6,0,Math.PI,0); ctx.stroke();

        // Blinking rim lights — cycle around the saucer's edge
        const lightCount = 5;
        for (let li=0; li<lightCount; li++) {
          const la = (li/lightCount)*Math.PI*2;
          const lx = Math.cos(la)*16, ly = Math.sin(la)*5 + 1;
          const blink = 0.3 + 0.7*Math.max(0, Math.sin(t*0.008 + li*1.3 + seed));
          ctx.fillStyle = `rgba(255,210,90,${blink})`;
          ctx.beginPath(); ctx.arc(lx, ly, 1.4, 0, Math.PI*2); ctx.fill();
        }

        ctx.restore();
      }

      for (let i=0; i<2; i++) {
        // Wide slow sweep: each UFO drifts left-right across the upper sky
        // on its own sine path, rather than sitting in a tight fixed circle.
        const speed = 0.00018 + i*0.00006;
        const phase = t*speed + i*Math.PI;
        const sweepX = CX + Math.sin(phase) * (W*0.42);
        const bobY   = (H*0.16 + i*26) + Math.sin(t*0.0012 + i*2) * 10;
        const scale  = 0.85 + i*0.25;
        drawUFO(sweepX, bobY, scale, i*3.7);
      }

      // Twin golden laser pylons
      for(let px of [10,W-22]){
        ctx.fillStyle="#3A2A10"; ctx.fillRect(px,H-240,14,240);
        ctx.fillStyle="#E8C878"; ctx.fillRect(px-3,H-244,20,5);
        const pulse=0.55+0.35*Math.sin(t*0.007+px);
        const lx = px + 7;
        const lensY = H - 251;
        ctx.fillStyle="#102033";
        ctx.beginPath(); ctx.roundRect(lx-9,lensY-8,18,13,3); ctx.fill();
        ctx.strokeStyle="#E8C878"; ctx.lineWidth=1; ctx.stroke();
        const lens = ctx.createRadialGradient(lx,lensY-2,0,lx,lensY-2,11);
        lens.addColorStop(0,`rgba(235,252,255,${0.98*pulse})`);
        lens.addColorStop(0.35,`rgba(96,210,255,${0.65*pulse})`);
        lens.addColorStop(1,"rgba(35,100,170,0.06)");
        ctx.fillStyle=lens;
        ctx.beginPath(); ctx.ellipse(lx,lensY-2,8,5,0,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle=`rgba(120,220,255,${0.55+0.25*pulse})`; ctx.lineWidth=1; ctx.stroke();
        ctx.strokeStyle=`rgba(95,210,255,${0.38*pulse})`;
        ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(lx-5,lensY-13); ctx.lineTo(lx+5,lensY-13); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx-4,lensY+8); ctx.lineTo(lx+4,lensY+8); ctx.stroke();
        const glow=ctx.createRadialGradient(lx,lensY,0,lx,lensY,34);
        glow.addColorStop(0,`rgba(130,220,255,${0.44*pulse})`); glow.addColorStop(1,"transparent");
        ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);
      }
      // Crowd of distant silhouettes (the "audience that never blinks")
      ctx.fillStyle="rgba(10,6,24,0.7)";
      for(let i=0;i<16;i++){
        const cxp=i*(W/16)+6, ch=10+Math.sin(i*2.1)*4;
        ctx.beginPath(); ctx.arc(cxp+4,H-52-ch+8,5,Math.PI,0); ctx.fill();
        ctx.fillRect(cxp,H-52-ch+8,8,ch);
      }
      // Central beam of light down onto the log position
      const beam=ctx.createLinearGradient(CX,0,CX,H-50);
      beam.addColorStop(0,"rgba(232,200,120,0.10)"); beam.addColorStop(1,"transparent");
      ctx.fillStyle=beam; ctx.fillRect(CX-50,0,100,H-50);
      // Header
      ctx.fillStyle="rgba(10,6,24,0.85)"; ctx.fillRect(0,0,W,27);
      const headerGlow=0.6+0.4*Math.sin(t*0.005);
      ctx.strokeStyle=`rgba(232,200,120,${headerGlow})`; ctx.lineWidth=0.8; ctx.beginPath(); ctx.moveTo(0,27); ctx.lineTo(W,27); ctx.stroke();
      ctx.fillStyle=`rgba(232,200,120,${0.75+0.25*headerGlow})`; ctx.font="bold 13px 'Courier New',monospace"; ctx.textAlign="center";
      ctx.fillText("🌌 CELESTIAL ARENA",CX,18);
    }},
];

// ─── LEADERBOARD SEED ────────────────────────────────────────────────────────
const SEED_BOARD = [
  { name:"PHANTOM",  score:146 },
  { name:"SLAYER",   score:128 },
  { name:"REAPER",   score:111 },
  { name:"VORTEX",   score:94 },
  { name:"ECLIPSE",  score:76 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function rollCrate(crate) {
  let r = Math.random(), cum = 0;
  for (const [rar, w] of Object.entries(crate.weights)) {
    cum += w;
    if (r < cum) {
      const pool = KNIVES.filter(k => k.rarity === rar);
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  return KNIVES[0];
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

const DEFAULT_SAVE = {
  name: "Player",
  coins: 300,
  inventory: ["k_steel"],
  equipped: "k_steel",
  activeMap: "yard",
  stats: { score: 0, games: 0, throws: 0 },
  dailyClaimed: null,
};

// ─── SOUND ENGINE ─────────────────────────────────────────────────────────────
// Module-scoped mute flag — plain object so canvas effects read it without remounting.
const SOUND_MUTED = { current: false };
const WORLD_CLOCK_START = Date.now();

function useSound() {
  const acRef = useRef(null);
  function ac() {
    if (!acRef.current) acRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return acRef.current;
  }
  function tone(freq, type, dur, vol = 0.15) {
    if (SOUND_MUTED.current) return;
    try {
      const ctx = ac(), o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.start(); o.stop(ctx.currentTime + dur);
    } catch {}
  }
  return {
    throw:  () => { tone(700, "sawtooth", 0.12, 0.13); },
    hit:    () => { tone(320, "square",   0.18, 0.18); },
    fail:   () => { tone(120, "sawtooth", 0.45, 0.20); },
    coin:   () => { tone(1100,"sine",     0.14, 0.10); setTimeout(()=>tone(1500,"sine",0.1,0.08),60); },
    caseTick: () => { tone(980,"square",0.035,0.035); },
    open:   () => { tone(260,"sine",0.6,0.14); setTimeout(()=>tone(800,"sine",0.3,0.12),500); },
    rare:   () => { [0,120,260].forEach((d,i)=>setTimeout(()=>tone(600+i*300,"sine",0.4,0.14),d)); },
    menu:   () => { tone(440,"sine",0.1,0.06); },
  };
}

// ─── RARITY BADGE ─────────────────────────────────────────────────────────────
function Badge({ rarity, tiny }) {
  const r = RARITIES[rarity]; if (!r) return null;
  return (
    <span style={{
      display: "inline-block", padding: tiny ? "1px 5px" : "2px 8px",
      borderRadius: 3, fontSize: tiny ? 9 : 11, fontWeight: 600, letterSpacing: "0.04em",
      background: r.color + "22", color: r.color, border: `0.5px solid ${r.color}66`,
    }}>{r.label.toUpperCase()}</span>
  );
}

// ─── KNIFE CANVAS PREVIEW ─────────────────────────────────────────────────────
function KnifePreview({ id, size = 60, spin = false, scale = 1 }) {
  const ref = useRef(null), raf = useRef(null), t0 = useRef(Date.now()), aRef = useRef(0);
  const knife = KNIVES.find(k => k.id === id);
  useEffect(() => {
    const canvas = ref.current; if (!canvas || !knife) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const animating = spin || ["Animated","Neon","Elemental","Limited"].includes(knife.cat);
    function frame() {
      ctx.clearRect(0, 0, W, H);
      if (spin) aRef.current += 0.06;
      knife.draw(ctx, W / 2, H / 2 + 12, aRef.current, Date.now() - t0.current, scale);
      if (animating) raf.current = requestAnimationFrame(frame);
    }
    frame();
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [id, spin, scale]);
  return <canvas ref={ref} width={size} height={size + 24} style={{ display: "block" }} />;
}

function drawEarthTarget(ctx, r) {
  const ocean = ctx.createRadialGradient(-34,-40,8,0,0,r);
  ocean.addColorStop(0,"#49C8F4");
  ocean.addColorStop(0.42,"#03AEE0");
  ocean.addColorStop(0.72,"#0878C8");
  ocean.addColorStop(1,"#06315F");

  ctx.beginPath(); ctx.arc(0,0,r+4,0,Math.PI*2); ctx.fillStyle="#064FBA"; ctx.fill();
  ctx.beginPath(); ctx.arc(0,0,r-3,0,Math.PI*2); ctx.fillStyle=ocean; ctx.fill();

  ctx.save();
  ctx.beginPath(); ctx.arc(0,0,r-5,0,Math.PI*2); ctx.clip();

  function land(points, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i=1;i<points.length;i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fill();
  }

  land([[-84,-30],[-65,-55],[-36,-54],[-18,-35],[-30,-12],[-58,-7],[-76,-15]], "#8CCB48");
  land([[-52,-4],[-24,-6],[-10,16],[-19,43],[-37,77],[-58,60],[-65,28]], "#7FC23A");
  land([[20,-34],[47,-47],[78,-35],[86,-12],[61,2],[36,-8]], "#8BCB42");
  land([[38,20],[74,12],[93,34],[80,62],[51,55],[27,38]], "#91D24B");
  land([[-8,-72],[22,-67],[34,-51],[6,-46],[-20,-55]], "#9AD95B");

  land([[-76,-24],[-60,-42],[-38,-40],[-24,-28],[-42,-22],[-62,-13]], "#B6E477");
  land([[-43,6],[-24,9],[-24,30],[-39,53],[-53,41],[-56,20]], "#AEE06A");
  land([[45,-27],[65,-30],[72,-14],[56,-8],[42,-14]], "#B5E66A");
  land([[48,28],[75,28],[72,45],[54,47]], "#B8E36E");

  ctx.fillStyle="rgba(255,255,255,0.18)";
  [[-48,-62,34,7],[22,-20,46,8],[-18,56,54,9]].forEach(([x,y,w,h])=>{
    ctx.beginPath(); ctx.ellipse(x,y,w,h,-0.18,0,Math.PI*2); ctx.fill();
  });

  ctx.restore();

  const shade = ctx.createRadialGradient(28,30,10,34,36,r*1.12);
  shade.addColorStop(0,"rgba(0,0,0,0)");
  shade.addColorStop(0.58,"rgba(0,0,0,0.05)");
  shade.addColorStop(1,"rgba(0,18,50,0.34)");
  ctx.fillStyle=shade; ctx.beginPath(); ctx.arc(0,0,r-3,0,Math.PI*2); ctx.fill();

  const shine = ctx.createRadialGradient(-45,-48,0,-45,-48,86);
  shine.addColorStop(0,"rgba(255,255,255,0.38)");
  shine.addColorStop(0.45,"rgba(255,255,255,0.10)");
  shine.addColorStop(1,"rgba(255,255,255,0)");
  ctx.fillStyle=shine; ctx.beginPath(); ctx.arc(0,0,r-4,0,Math.PI*2); ctx.fill();

  ctx.strokeStyle="rgba(33,129,238,0.95)"; ctx.lineWidth=3.5; ctx.beginPath(); ctx.arc(0,0,r-6,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle="rgba(185,238,255,0.42)"; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(0,0,r-14,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.fillStyle="#061225"; ctx.fill();
}

function StartScenePreview({ equippedId, mapId }) {
  const ref = useRef(null), raf = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const CX = W / 2, LOG_CY = 205, LOG_R = 100, LAUNCH_Y = H - 42;
    const knife = KNIVES.find(k => k.id === equippedId) || KNIVES[0];
    const map = MAPS.find(m => m.id === mapId) || MAPS[0];
    const t0 = Date.now();

    function drawPreviewLog(ang) {
      ctx.save(); ctx.translate(CX, LOG_CY); ctx.rotate(ang);
      if (map.id === "celestial") {
        drawEarthTarget(ctx, LOG_R);
        ctx.restore();
        return;
      }
      const hallWood = map.id === "hall";
      const neonWood = map.id === "neon";
      const forgeWood = map.id === "forge";
      const body = ctx.createRadialGradient(-24,-28,10,0,0,LOG_R);
      body.addColorStop(0,hallWood ? "#9A9488" : neonWood ? "#5A3D72" : forgeWood ? "#7E4D28" : "#9A6436");
      body.addColorStop(0.55,hallWood ? "#6F685E" : neonWood ? "#3A2453" : forgeWood ? "#563018" : "#70411F");
      body.addColorStop(1,hallWood ? "#37322D" : neonWood ? "#1A1028" : forgeWood ? "#271006" : "#3C210F");
      ctx.beginPath(); ctx.arc(0,0,LOG_R+2,0,Math.PI*2); ctx.fillStyle=hallWood ? "#252321" : neonWood ? "#11091C" : forgeWood ? "#1D0A03" : "#2C170B"; ctx.fill();
      ctx.beginPath(); ctx.arc(0,0,LOG_R-3,0,Math.PI*2); ctx.fillStyle=body; ctx.fill();
      ctx.strokeStyle=hallWood ? "#B8B0A0" : neonWood ? "#8F5FC0" : "#C49A48"; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,LOG_R-7,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle=hallWood ? "rgba(245,240,225,0.22)" : neonWood ? "rgba(210,150,255,0.2)" : "rgba(255,226,145,0.24)"; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(0,0,LOG_R-13,0,Math.PI*2); ctx.stroke();
      [76,58,40,22].forEach((r,i)=>{
        ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2);
        ctx.strokeStyle = hallWood
          ? (i % 2 ? "rgba(34,32,30,0.48)" : "rgba(210,205,190,0.32)")
          : neonWood
            ? (i % 2 ? "rgba(18,10,28,0.55)" : "rgba(170,100,220,0.34)")
          : forgeWood
            ? (i % 2 ? "rgba(36,13,4,0.5)" : "rgba(205,120,54,0.34)")
          : (i % 2 ? "rgba(42,20,8,0.48)" : "rgba(210,155,70,0.38)");
        ctx.lineWidth = i === 0 ? 2 : 1.3;
        ctx.stroke();
      });
      ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.fillStyle=hallWood ? "#211E1B" : neonWood ? "#09030F" : "#1F0B04"; ctx.fill();
      ctx.strokeStyle=hallWood ? "rgba(205,200,185,0.58)" : neonWood ? "rgba(175,105,225,0.58)" : "rgba(196,154,72,0.65)"; ctx.lineWidth=1; ctx.stroke();
      ctx.restore();
    }

    function frame() {
      const t = Date.now() - t0;
      ctx.clearRect(0,0,W,H);
      map.drawBackground(ctx, W, H, t, CX, LOG_CY);
      drawPreviewLog(t * 0.00055);
      ctx.fillStyle="#2A2620"; ctx.beginPath(); ctx.roundRect(CX-14,LAUNCH_Y+12,28,9,2); ctx.fill();
      ctx.fillStyle="#383430"; ctx.beginPath(); ctx.roundRect(CX-9,LAUNCH_Y,18,14,2); ctx.fill();
      raf.current = requestAnimationFrame(frame);
    }

    frame();
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [equippedId, mapId]);

  return <canvas ref={ref} width={360} height={500} style={{ width:"100%", height:"100%", display:"block", borderRadius:10 }} />;
}
function GameCanvas({ equippedId, mapId, onEnd, onCoins, hideReadyKnife = false }) {
  const ref = useRef(null), s = useRef(null), snd = useSound();
  const hideReadyKnifeRef = useRef(hideReadyKnife);
  const prevHideReadyKnifeRef = useRef(hideReadyKnife);
  const readyKnifeRevealRef = useRef(0);
  useEffect(() => {
    if (prevHideReadyKnifeRef.current && !hideReadyKnife) {
      readyKnifeRevealRef.current = performance.now();
    }
    hideReadyKnifeRef.current = hideReadyKnife;
    prevHideReadyKnifeRef.current = hideReadyKnife;
  }, [hideReadyKnife]);
  useEffect(() => {
    const canvas = ref.current, ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const CX = W / 2, LOG_CY = 205, LOG_R = 100, LAUNCH_Y = H - 42;
    const COLL = 12 * Math.PI / 180;            // 12° collision threshold
    const APPLE_R = LOG_R + 26;                  // apple floats outside the log surface
    const APPLE_HIT_RADIUS = 24;                  // generous pixel hit-radius around the apple (bigger = easier to hit)
    const LOG_KNIFE_HIT_R = LOG_R + 44;           // catch the blade tip before the handle overlaps the wood
    const knife = KNIVES.find(k => k.id === equippedId) || KNIVES[0];
    const map   = MAPS.find(m => m.id === mapId) || MAPS[0];
    const t0 = WORLD_CLOCK_START;

    s.current = {
      ang: 0, spd: 0.020 * map.speedMod, spinDir: 1, spinTimer: 0, spinBrake: 0, spinPause: 0, spinRamp: 0, score: 0, level: 1,
      left: 7, stuck: [], over: false,
      phase: "idle", flying: null, flash: 0,
      particles: [],      // wood-chip burst on impact
      breakPieces: [],    // larger chunks when a level log breaks apart
      fallingKnives: [],  // knives knocked loose when the log breaks
      breaking: 0,        // frames elapsed in the level-clear break animation
      breakFlash: 0,      // bright flash while the wood splits
      breakFallDir: 1,    // direction the broken log tips as it falls
      shakeT: 0,           // remaining screen-shake frames
      shakeMag: 0,          // current shake magnitude (decays)
      impactPt: null,        // {x,y,angle} world-space point of last impact, for flash + chip spawn
      apple: null,           // { local, bornAt } — bonus apple stuck to the spinning log, or null
      appleBurst: 0,         // gold sparkle burst counter when apple is hit
      appleBurstPt: null,    // world {x,y} where the burst sparkles render
      applePieces: [],       // red peel / pale fruit chunks when apple breaks
    };
    const gs = s.current;
    // Per-stuck-knife settle wobble: index-aligned with gs.stuck.
    // Each entry decays from 1 -> 0; knife handle visually quivers while > 0.
    const wobbles = [];

    // ── BONUS APPLE ──────────────────────────────────────────────────────
    // Roughly a 35% chance an apple spawns at the start of each level (and
    // the very first level), at a random angle that isn't already occupied
    // by a stuck knife. Hitting it awards instant coins via onCoins and
    // does NOT stick a knife in the log — the throw is "absorbed" by the
    // apple instead, so it never blocks future throws.
    function trySpawnApple() {
      if (gs.phase === "breaking") return;
      if (gs.apple) return;               // only one apple at a time
      if (Math.random() > 0.35) return;     // not every level gets one
      // Find an angle not too close to any existing stuck knife
      let local, attempts = 0;
      do {
        local = Math.random() * Math.PI * 2;
        attempts++;
      } while (
        attempts < 12 &&
        gs.stuck.some(sk => { let d=Math.abs(local-sk); if(d>Math.PI)d=2*Math.PI-d; return d < COLL*2.5; })
      );
      const kind = Math.random() < 0.15 ? "gold" : "red";
      gs.apple = { local, bornAt: Date.now(), kind };
    }

    function norm(a) { while (a > Math.PI) a -= 2*Math.PI; while (a < -Math.PI) a += 2*Math.PI; return a; }
    function adist(a, b) { let d = Math.abs(norm(a-b)); return d > Math.PI ? 2*Math.PI - d : d; }

    function obstacleCountForLevel(level) {
      if (level >= 9) return 3;
      if (level >= 6) return 2;
      if (level >= 4) return 1;
      return 0;
    }

    function spinStep() {
      if (gs.level < 3) return gs.spd * gs.spinDir;

      const reverseLevel = gs.level >= 7;
      const interval = Math.max(82, 210 - gs.level * 12);
      const brakeLen = reverseLevel ? 86 : 72;
      const pauseLen = reverseLevel ? 20 : 12;
      const rampLen = reverseLevel ? 42 : 34;

      const smooth = (p) => p * p * (3 - 2 * p);

      if (gs.spinBrake > 0) {
        const p = gs.spinBrake / brakeLen;
        const ease = smooth(p) * p;
        gs.spinBrake--;
        if (gs.spinBrake === 0) gs.spinPause = pauseLen;
        return gs.spd * gs.spinDir * ease;
      }

      if (gs.spinPause > 0) {
        gs.spinPause--;
        if (gs.spinPause === 0) {
          if (reverseLevel) gs.spinDir *= -1;
          gs.spinRamp = rampLen;
        }
        return 0;
      }

      if (gs.spinRamp > 0) {
        const ease = smooth(1 - gs.spinRamp / rampLen);
        gs.spinRamp--;
        return gs.spd * gs.spinDir * ease;
      }

      gs.spinTimer++;
      if (gs.spinTimer >= interval) {
        gs.spinTimer = 0;
        gs.spinBrake = brakeLen;
        return gs.spd * gs.spinDir;
      }

      return gs.spd * gs.spinDir;
    }

    function seedObstacleKnives() {
      const count = obstacleCountForLevel(gs.level);
      gs.stuck = [];
      if (!count) return;

      const start = Math.random() * Math.PI * 2;
      for (let i=0;i<count;i++) {
        let local = norm(start + (i/count)*Math.PI*2 + (Math.random()-0.5)*0.45);
        let attempts = 0;
        while (attempts < 16 && gs.stuck.some(sk => adist(local, sk) < COLL*3.2)) {
          local = Math.random() * Math.PI * 2;
          attempts++;
        }
        gs.stuck.push(local);
      }
    }

    function checkHit(ig) {
      const local = norm(ig - gs.ang);
      for (const sk of gs.stuck) if (adist(local, sk) < COLL) return { hit: true, local };
      return { hit: false, local };
    }

    function getFallingLogTransform() {
      if (gs.phase !== "breaking" && gs.breaking <= 0) {
        return { x: CX, y: LOG_CY, rot: 0, p: 0 };
      }
      const p = Math.min(1, gs.breaking / 58);
      const ease = 1 - Math.pow(1 - p, 3);
      return {
        x: CX + gs.breakFallDir * 28 * ease,
        y: LOG_CY + 155 * ease * ease,
        rot: gs.breakFallDir * 1.25 * ease,
        p,
      };
    }

    function drawLog() {
      if (gs.phase === "breaking") return;
      const fall = getFallingLogTransform();
      ctx.save(); ctx.translate(fall.x, fall.y); ctx.rotate(gs.ang + fall.rot);
      if (map.id === "celestial") {
        drawEarthTarget(ctx, LOG_R);
        ctx.restore();
        return;
      }
      const hallWood = map.id === "hall";
      const neonWood = map.id === "neon";
      const forgeWood = map.id === "forge";
      const body = ctx.createRadialGradient(-24,-28,10,0,0,LOG_R);
      body.addColorStop(0,hallWood ? "#9A9488" : neonWood ? "#5A3D72" : forgeWood ? "#7E4D28" : "#9A6436");
      body.addColorStop(0.55,hallWood ? "#6F685E" : neonWood ? "#3A2453" : forgeWood ? "#563018" : "#70411F");
      body.addColorStop(1,hallWood ? "#37322D" : neonWood ? "#1A1028" : forgeWood ? "#271006" : "#3C210F");
      ctx.beginPath(); ctx.arc(0,0,LOG_R+2,0,Math.PI*2); ctx.fillStyle=hallWood ? "#252321" : neonWood ? "#11091C" : forgeWood ? "#1D0A03" : "#2C170B"; ctx.fill();
      ctx.beginPath(); ctx.arc(0,0,LOG_R-3,0,Math.PI*2); ctx.fillStyle=body; ctx.fill();
      ctx.strokeStyle=hallWood ? "#B8B0A0" : neonWood ? "#8F5FC0" : "#C49A48"; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,LOG_R-7,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle=hallWood ? "rgba(245,240,225,0.22)" : neonWood ? "rgba(210,150,255,0.2)" : "rgba(255,226,145,0.24)"; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(0,0,LOG_R-13,0,Math.PI*2); ctx.stroke();
      [76,58,40,22].forEach((r,i)=>{
        ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2);
        ctx.strokeStyle = hallWood
          ? (i % 2 ? "rgba(34,32,30,0.48)" : "rgba(210,205,190,0.32)")
          : neonWood
            ? (i % 2 ? "rgba(18,10,28,0.55)" : "rgba(170,100,220,0.34)")
          : forgeWood
            ? (i % 2 ? "rgba(36,13,4,0.5)" : "rgba(205,120,54,0.34)")
          : (i % 2 ? "rgba(42,20,8,0.48)" : "rgba(210,155,70,0.38)");
        ctx.lineWidth = i === 0 ? 2 : 1.3;
        ctx.stroke();
      });
      ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.fillStyle=hallWood ? "#211E1B" : neonWood ? "#09030F" : "#1F0B04"; ctx.fill();
      ctx.strokeStyle=hallWood ? "rgba(205,200,185,0.58)" : neonWood ? "rgba(175,105,225,0.58)" : "rgba(196,154,72,0.65)"; ctx.lineWidth=1; ctx.stroke();
      ctx.restore();

      // ── DIRECTIONAL IMPACT FLASH ──────────────────────────────────────
      // Radiates outward from the exact hit point (world space, NOT rotated
      // with the log) so it reads as a strike, not a generic pulsing ring.
      if (gs.flash > 0 && gs.impactPt) {
        const p = gs.flash / 10;          // 1 -> 0 over ~10 frames
        const ix = fall.x + Math.cos(gs.impactPt.angle + fall.rot) * LOG_R;
        const iy = fall.y + Math.sin(gs.impactPt.angle + fall.rot) * LOG_R;

        // Bright core flash at impact point
        const core = ctx.createRadialGradient(ix, iy, 0, ix, iy, 16 + 10*(1-p));
        core.addColorStop(0, `rgba(255,250,225,${0.9*p})`);
        core.addColorStop(0.4, `rgba(255,220,140,${0.5*p})`);
        core.addColorStop(1, "rgba(255,200,100,0)");
        ctx.fillStyle = core;
        ctx.beginPath(); ctx.arc(ix, iy, 16 + 10*(1-p), 0, Math.PI*2); ctx.fill();

        // Small radiating crack lines from the impact point, embedded in wood
        ctx.save();
        ctx.strokeStyle = `rgba(255,235,180,${0.7*p})`;
        ctx.lineWidth = 1;
        for (let i=0;i<4;i++) {
          const crackA = gs.impactPt.angle + Math.PI + (i-1.5)*0.35;
          const len = 6 + 8*(1-p);
          ctx.beginPath();
          ctx.moveTo(ix, iy);
          ctx.lineTo(ix + Math.cos(crackA)*len, iy + Math.sin(crackA)*len);
          ctx.stroke();
        }
        ctx.restore();

        gs.flash--;
      }
    }

    function drawStuck(t) {
      if (gs.phase === "breaking") return;
      // Each stuck knife is drawn so a visible SEGMENT OF BLADE plus the
      // HANDLE sticks out of the log — matching the reference look (knives
      // embedded a good distance in, with steel + handle showing, not just
      // the handle flush against the bark).
      //
      // How: we sink the knife's anchor point INWARD past LOG_R (so the tip
      // is buried deep in the wood), then clip everything inside a smaller
      // "embed radius" so only the portion beyond that radius renders. The
      // gap between the embed radius and LOG_R is exactly the visible
      // blade segment the reference shows.

      const EMBED_DEPTH = 22;       // how far the tip sinks past LOG_R
      const VISIBLE_RADIUS = LOG_R; // clip boundary sits exactly at the log surface —
                                      // anything inside (the buried tip + most of the
                                      // blade) is hidden; only what crosses the bark
                                      // line (a sliver of blade + the handle) shows.

      const fall = getFallingLogTransform();
      for (let i=0; i<gs.stuck.length; i++) {
        const local = gs.stuck[i];
        const w   = local + gs.ang + fall.rot;

        // Anchor point sunk INTO the log, past the surface
        const tx  = fall.x + Math.cos(w) * (LOG_R + EMBED_DEPTH);
        const ty  = fall.y + Math.sin(w) * (LOG_R + EMBED_DEPTH);

        // Settle wobble: freshly-stuck knife quivers around its final angle
        // for a few frames, like a real blade absorbing impact energy.
        const wob = wobbles[i] || 0;
        const wobAngle = wob > 0 ? Math.sin(t*0.09 + i*7) * wob * 0.10 : 0;

        ctx.save();

        // Clip to everything OUTSIDE a circle smaller than the log itself,
        // so a ring of blade between VISIBLE_RADIUS and LOG_R is exposed,
        // then the log's own bark (drawn after, at LOG_R) covers the rest.
        ctx.beginPath();
        ctx.rect(0, 0, W, H);
        ctx.arc(fall.x, fall.y, VISIBLE_RADIUS, 0, Math.PI*2);
        ctx.clip("evenodd");

        knife.draw(ctx, tx, ty, w - Math.PI/2 + wobAngle, t, 1.18);

        ctx.restore();

        if (wob > 0) wobbles[i] = Math.max(0, wob - 0.045);
      }
    }

    function drawZones() {
      // Collision zones are kept invisible so the wood stays clean during play.
    }

    // ── DRAW BONUS APPLE ────────────────────────────────────────────────────
    // Sits embedded on the log surface like a target, spinning with it.
    // Small glossy red apple + stem + leaf, with a soft pulsing glow so it
    // reads clearly as a bonus target against the wood.
    function spawnAppleBreak(x, y, kind = "red") {
      const colors = kind === "gold"
        ? ["#F7C948","#FFD96A","#FFF2A8","#D99A1E","#6B4312","#6FA55F"]
        : ["#C23B2E","#E0523E","#F4D9A6","#FFF0C8","#5C3818","#4A9460"];
      for (let i=0;i<18;i++) {
        const a = (i/18)*Math.PI*2 + (Math.random()-0.5)*0.7;
        const speed = 1.4 + Math.random()*3.8;
        gs.applePieces.push({
          x, y,
          vx: Math.cos(a)*speed,
          vy: Math.sin(a)*speed - 1.2,
          rot: Math.random()*Math.PI*2,
          vrot: (Math.random()-0.5)*0.45,
          size: 2 + Math.random()*4,
          life: 1,
          decay: 0.026 + Math.random()*0.018,
          color: colors[Math.floor(Math.random()*colors.length)],
        });
      }
    }

    function drawApple(t) {
      if (gs.apple) {
        const w = gs.apple.local + gs.ang;
        const ax = CX + Math.cos(w) * APPLE_R;
        const ay = LOG_CY + Math.sin(w) * APPLE_R;
        const SC = 1.6;   // apple is bigger now — easier to see and to hit
        const isGold = gs.apple.kind === "gold";

        // Soft gold pulse glow behind the apple to draw the eye
        const pulse = 0.5 + 0.4*Math.sin(t*0.005);
        const glowR = 30 * SC * 0.7;
        const glow = ctx.createRadialGradient(ax,ay,0,ax,ay,glowR);
        glow.addColorStop(0, isGold ? `rgba(255,220,90,${0.58*pulse})` : `rgba(255,210,80,${0.35*pulse})`);
        glow.addColorStop(1, "rgba(255,210,80,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(ax,ay,glowR,0,Math.PI*2); ctx.fill();

        ctx.save();
        ctx.translate(ax, ay);
        // NOTE: we intentionally do NOT rotate by `w` here. The apple stays
        // upright in screen space — stem-and-leaf always pointing straight
        // up, rounded bottom always facing down toward the log — regardless
        // of where on the log's rotation it currently sits. This reads much
        // more clearly as "an apple sitting on the wood" than rotating it
        // to track the log's spin, which made the stem orientation hard to
        // parse and didn't look obviously different no matter the flip.
        ctx.scale(SC, SC);

        // Apple body — two overlapping circles for the classic apple silhouette
        ctx.fillStyle = isGold ? "#E7AA22" : "#C23B2E";
        ctx.beginPath(); ctx.arc(-3,0,8,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(3,0,8,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(0,2,9,0,Math.PI*2); ctx.fill();

        // Glossy highlight
        ctx.fillStyle = isGold ? "rgba(255,255,210,0.55)" : "rgba(255,255,255,0.35)";
        ctx.beginPath(); ctx.ellipse(-3,-3,2.6,3.6,0.4,0,Math.PI*2); ctx.fill();

        // Stem — points straight up, away from the log
        ctx.strokeStyle = isGold ? "#6B4312" : "#5C3818"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(0,-7); ctx.lineTo(1,-12); ctx.stroke();

        // Leaf
        ctx.fillStyle = isGold ? "#6FA55F" : "#4A9460";
        ctx.beginPath();
        ctx.ellipse(4,-11,3.4,1.8,-0.5,0,Math.PI*2);
        ctx.fill();

        ctx.restore();
      }

      // Sparkle burst on collection — uses the stored burst point so it still
      // renders for a few frames even after gs.apple itself is cleared.
      if (gs.appleBurst > 0 && gs.appleBurstPt) {
        const { x: bx, y: by } = gs.appleBurstPt;
        for (let i=0;i<8;i++) {
          const sa = (i/8)*Math.PI*2 + t*0.002;
          const sr = (1 - gs.appleBurst/14) * 30;
          ctx.fillStyle = `rgba(255,215,90,${gs.appleBurst/14})`;
          ctx.beginPath();
          ctx.arc(bx+Math.cos(sa)*sr, by+Math.sin(sa)*sr, 2, 0, Math.PI*2);
          ctx.fill();
        }
        gs.appleBurst--;
      }

      for (let i=gs.applePieces.length-1;i>=0;i--) {
        const p = gs.applePieces[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16;
        p.vx *= 0.985;
        p.rot += p.vrot;
        p.life -= p.decay;
        if (p.life <= 0) { gs.applePieces.splice(i,1); continue; }

        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0,p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(-p.size,-p.size*0.5);
        ctx.lineTo(p.size*0.8,-p.size*0.2);
        ctx.lineTo(p.size*0.3,p.size*0.8);
        ctx.lineTo(-p.size*0.6,p.size*0.4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // ── WOOD-CHIP PARTICLE BURST ───────────────────────────────────────────
    // Spawned once per impact: a handful of small angular wood-colored chips
    // shoot outward from the strike point, tumble (rotate), arc under light
    // gravity, and fade. Pure canvas, no images — drawn as tiny rotated
    // triangles/rects in wood tones so they read as splinters, not confetti.
    function spawnChips(angle) {
      const ix = CX + Math.cos(angle) * LOG_R;
      const iy = LOG_CY + Math.sin(angle) * LOG_R;
      const n = 7 + Math.floor(Math.random()*4);
      for (let i=0;i<n;i++) {
        // Chips fly generally outward (away from log centre) with spread
        const spread = (Math.random()-0.5) * 1.4;
        const dir = angle + spread;
        const speed = 1.6 + Math.random()*2.4;
        gs.particles.push({
          x: ix, y: iy,
          vx: Math.cos(dir)*speed,
          vy: Math.sin(dir)*speed - 1.0,       // slight upward kick
          rot: Math.random()*Math.PI*2,
          vrot: (Math.random()-0.5)*0.5,
          size: 2 + Math.random()*3,
          life: 1,                              // 1 -> 0
          decay: 0.018 + Math.random()*0.012,
          color: ["#9E6C42","#7A4E2A","#5C3818","#3A2410"][Math.floor(Math.random()*4)],
        });
      }
      // Cap particle count so long sessions don't accumulate garbage
      if (gs.particles.length > 140) gs.particles.splice(0, gs.particles.length-140);
    }

    function updateAndDrawChips() {
      for (let i = gs.particles.length-1; i>=0; i--) {
        const p = gs.particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.16;          // gravity
        p.vx *= 0.985;          // air drag
        p.rot += p.vrot;
        p.life -= p.decay;
        if (p.life <= 0) { gs.particles.splice(i,1); continue; }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        // Small angular splinter shape (irregular triangle) rather than a plain square
        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size*0.4);
        ctx.lineTo(p.size*0.8, -p.size*0.2);
        ctx.lineTo(p.size*0.3, p.size*0.7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // ── SCREEN SHAKE ────────────────────────────────────────────────────────
    // A short, decaying random jitter applied to the whole canvas transform
    // on impact, giving the strike physical weight.
    function spawnBreakPieces(angle) {
      gs.breakPieces = [];
      const count = 46;
      for (let i=0;i<count;i++) {
        const base = (i / count) * Math.PI * 2;
        const bias = Math.cos(base - angle) > 0 ? 0.9 : 0.45;
        const dir = base + (Math.random()-0.5) * 0.6;
        const startR = 18 + Math.random() * (LOG_R - 24);
        const speed = (2.2 + Math.random()*4.2) * bias;
        gs.breakPieces.push({
          x: CX + Math.cos(base) * startR,
          y: LOG_CY + Math.sin(base) * startR,
          vx: Math.cos(dir) * speed,
          vy: Math.sin(dir) * speed - 1.2,
          rot: Math.random()*Math.PI*2,
          vrot: (Math.random()-0.5)*0.35,
          w: 8 + Math.random()*18,
          h: 5 + Math.random()*12,
          life: 1,
          decay: 0.018 + Math.random()*0.01,
          color: ["#9E6C42","#7A4E2A","#5C3818","#3A2410","#B07844"][Math.floor(Math.random()*5)],
        });
      }
    }

    function spawnFallingKnives() {
      gs.fallingKnives = gs.stuck.map((local, i) => {
        const world = local + gs.ang;
        const launch = -0.8 - Math.random()*2.4;
        const side = (Math.random() < 0.5 ? -1 : 1) * (1.2 + Math.random()*2.4);
        return {
          x: CX + Math.cos(world) * (LOG_R + 22),
          y: LOG_CY + Math.sin(world) * (LOG_R + 22),
          vx: Math.cos(world) * (0.8 + Math.random()*1.8) + side,
          vy: Math.sin(world) * (0.8 + Math.random()*1.4) + launch,
          a: world - Math.PI/2,
          va: (Math.random() < 0.5 ? -1 : 1) * (0.10 + Math.random()*0.18),
          life: 1,
          delay: i * 2,
        };
      });
    }

    function startLevelBreak(hitAngle) {
      gs.phase = "breaking";
      gs.breaking = 1;
      gs.breakFlash = 22;
      gs.breakFallDir = Math.cos(hitAngle) >= 0 ? 1 : -1;
      gs.apple = null;
      queuedThrow = false;
      spawnBreakPieces(hitAngle);
      spawnFallingKnives();
      triggerShake(12);
    }

    function finishLevelBreak() {
      gs.level++;
      gs.spd = (0.020 + (gs.level-1)*0.007) * map.speedMod;
      if (gs.spd > 0.10 * map.speedMod) gs.spd = 0.10 * map.speedMod;
      gs.spinTimer = 0;
      gs.spinBrake = 0;
      gs.spinPause = 0;
      gs.spinRamp = 0;
      if (gs.level < 7) gs.spinDir = 1;
      gs.left = 7;
      seedObstacleKnives();
      gs.breakPieces = [];
      gs.fallingKnives = [];
      gs.breaking = 0;
      gs.breakFlash = 0;
      wobbles.length = 0;
      gs.phase = "idle";
      trySpawnApple();
      if (onCoins) onCoins(map.levelReward ?? 2, "level");
      releaseQueuedThrow();
    }

    function drawBreakingWood(t) {
      if (gs.breaking <= 0) return;
      const p = Math.min(1, gs.breaking / 58);
      const fall = getFallingLogTransform();

      if (gs.breakFlash > 0) {
        const fp = gs.breakFlash / 22;
        const glow = ctx.createRadialGradient(fall.x, fall.y, 0, fall.x, fall.y, LOG_R + 70);
        glow.addColorStop(0, `rgba(255,245,210,${0.55*fp})`);
        glow.addColorStop(0.45, `rgba(255,185,80,${0.28*fp})`);
        glow.addColorStop(1, "rgba(255,185,80,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(fall.x, fall.y, LOG_R + 70, 0, Math.PI*2); ctx.fill();
        gs.breakFlash--;
      }

      for (let i=gs.breakPieces.length-1;i>=0;i--) {
        const piece = gs.breakPieces[i];
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.vy += 0.18;
        piece.vx *= 0.985;
        piece.rot += piece.vrot;
        piece.life -= piece.decay;
        if (piece.life <= 0) { gs.breakPieces.splice(i,1); continue; }

        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rot);
        ctx.globalAlpha = Math.max(0, piece.life);
        ctx.fillStyle = piece.color;
        ctx.beginPath();
        ctx.moveTo(-piece.w*0.5, -piece.h*0.4);
        ctx.lineTo(piece.w*0.45, -piece.h*0.5);
        ctx.lineTo(piece.w*0.55, piece.h*0.25);
        ctx.lineTo(-piece.w*0.25, piece.h*0.55);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(42,20,8,0.45)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }

      for (let i=gs.fallingKnives.length-1;i>=0;i--) {
        const fk = gs.fallingKnives[i];
        if (fk.delay > 0) { fk.delay--; continue; }
        fk.x += fk.vx;
        fk.y += fk.vy;
        fk.vy += 0.26;
        fk.vx *= 0.985;
        fk.a += fk.va;
        fk.life -= 0.007;

        if (fk.y > H - 24) {
          fk.y = H - 24;
          fk.vy *= -0.20;
          fk.vx *= 0.72;
          fk.va *= 0.70;
        }

        if (fk.life <= 0) { gs.fallingKnives.splice(i,1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, fk.life));
        knife.draw(ctx, fk.x, fk.y, fk.a, t, 1.08);
        ctx.restore();
      }
    }

    function triggerShake(strength) {
      gs.shakeT = 8;
      gs.shakeMag = strength;
    }
    function getShakeOffset() {
      if (gs.shakeT <= 0) return { x:0, y:0 };
      const m = gs.shakeMag * (gs.shakeT/8);
      gs.shakeT--;
      return { x:(Math.random()-0.5)*m, y:(Math.random()-0.5)*m };
    }

    function drawLauncher(t) {
      ctx.fillStyle="#2A2620"; ctx.beginPath(); ctx.roundRect(CX-14,LAUNCH_Y+12,28,9,2); ctx.fill();
      ctx.fillStyle="#383430"; ctx.beginPath(); ctx.roundRect(CX-9,LAUNCH_Y,18,14,2); ctx.fill();
      if (!hideReadyKnifeRef.current && gs.phase === "idle" && gs.left > 0 && !gs.over) {
        const revealAge = readyKnifeRevealRef.current ? performance.now() - readyKnifeRevealRef.current : 999;
        const revealP = Math.min(1, Math.max(0, revealAge / 260));
        const settle = 1 - Math.pow(1 - revealP, 3);
        ctx.save();
        ctx.globalAlpha = revealP < 1 ? Math.max(0.08, settle) : 1;
        knife.draw(ctx, CX, LAUNCH_Y - 8 - (1 - settle) * 10, 0, t, 1.12 + settle * 0.06);
        ctx.restore();
      }
    }

    function drawHUD() {
      ctx.fillStyle = "rgba(0,0,0,0.56)"; ctx.beginPath(); ctx.roundRect(8,31,W-16,23,4); ctx.fill();
      ctx.font = "900 13px 'Courier New', monospace";
      ctx.shadowColor = "rgba(200,155,60,0.35)";
      ctx.shadowBlur = 3;
      ctx.fillStyle = "#D3A744";
      ctx.textAlign = "left";  ctx.fillText(`SCORE ${gs.score}`, 16, 47);
      const iconGap = 11;
      const startX = CX - ((gs.left - 1) * iconGap) / 2;
      for (let i = 0; i < gs.left; i++) {
        const x = startX + i * iconGap;
        ctx.save();
        ctx.translate(x, 41);
        ctx.rotate(-0.12);
        ctx.scale(0.42, 0.42);
        ctx.fillStyle = "#B9B9B9";
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(4, -4);
        ctx.lineTo(2, 7);
        ctx.lineTo(-2, 7);
        ctx.lineTo(-4, -4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#878787";
        ctx.fillRect(-5, 7, 10, 3);
        ctx.fillStyle = "#6F6F6F";
        ctx.beginPath();
        ctx.roundRect(-2.5, 10, 5, 11, 1.5);
        ctx.fill();
        ctx.strokeStyle = "#D0D0D0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(1.4, 4);
        ctx.stroke();
        ctx.restore();
      }
      ctx.textAlign = "right"; ctx.fillStyle = "#A29E96";
      ctx.fillText(`LV ${gs.level}`, W-16, 47);
      ctx.shadowBlur = 0;
    }

    function drawBg(t) {
      // Each map supplies its own fully illustrated background + header bar.
      map.drawBackground(ctx, W, H, t, CX, LOG_CY);
    }

    function frame() {
      if (gs.over) return;
      gs.ang += spinStep();
      if (gs.phase === "breaking") {
        gs.breaking++;
        if (gs.breaking > 58) finishLevelBreak();
      }
      if (gs.phase === "flying" && gs.flying) {
        const f = gs.flying;
        f.y += f.vy; if (f.vy < -2) f.vy += 0.55;
        const dx = f.x - CX, dy = f.y - LOG_CY, dist = Math.sqrt(dx*dx+dy*dy);

        // ── APPLE CHECK — runs FIRST, at its own outward radius ───────────
        // The apple now floats just outside the log's edge, so the flying
        // knife reaches it slightly before it would reach the wood itself.
        // We check this independently of the log-collision distance below,
        // Apple hits give the bonus, but the knife keeps flying into the log.
        if (gs.apple) {
          const appleWorld = norm(gs.apple.local + gs.ang);
          const ax = CX + Math.cos(appleWorld) * APPLE_R;
          const ay = LOG_CY + Math.sin(appleWorld) * APPLE_R;
          const adx = f.x - ax, ady = f.y - ay;
          const appleDist = Math.sqrt(adx*adx + ady*ady);
          if (appleDist <= APPLE_HIT_RADIUS) {
            const appleKind = gs.apple.kind || "red";
            gs.appleBurstPt = { x: ax, y: ay };
            gs.apple = null;
            gs.appleBurst = appleKind === "gold" ? 20 : 14;
            spawnAppleBreak(ax, ay, appleKind);
            gs.impactPt = { angle: appleWorld };
            spawnChips(appleWorld);
            triggerShake(3);
            snd.coin();
            if (onCoins) onCoins(appleKind === "gold" ? 50 : 10, appleKind === "gold" ? "goldApple" : "apple");
          }
        }

        if (dist <= LOG_KNIFE_HIT_R) {
          const ig = Math.atan2(dy, dx);
          const { hit, local } = checkHit(ig);
          if (hit) {
            gs.over = true; gs.phase = "dead"; gs.flying = null;
            gs.impactPt = { angle: ig };
            spawnChips(ig);                    // chips fly even on the fatal hit
            triggerShake(7);                    // bigger shake — this one hurts
            gs.flash = 10;
            queuedThrow = false;                 // game's over, drop any buffered input
            snd.fail(); onEnd(gs.score, gs.level);
          } else {
            gs.stuck.push(local); gs.flying = null; gs.phase = "idle";
            wobbles[gs.stuck.length-1] = 1;     // new knife starts quivering
            gs.impactPt = { angle: ig };
            spawnChips(ig);
            triggerShake(4);
            gs.score++; gs.left--; gs.flash = 10; snd.hit();
            if (gs.left <= 0) {
              startLevelBreak(ig);
              gs.apple = null;     // clear any unhit apple — it shouldn't carry into the new level
              trySpawnApple();      // fresh roll for a brand-new bonus apple
            }
            releaseQueuedThrow();   // fire any buffered tap/space press immediately
          }
        }
        if (gs.flying && gs.flying.y < -60) { gs.flying = null; gs.phase = "idle"; releaseQueuedThrow(); }
      }
      const t = Date.now() - t0;
      ctx.clearRect(0,0,W,H);

      // Apply screen-shake offset to the whole scene for a physical "thud"
      const shake = getShakeOffset();
      ctx.save();
      ctx.translate(shake.x, shake.y);

      drawBg(t); drawLog(); drawZones(); drawApple(t); drawStuck(t); drawBreakingWood(t);
      updateAndDrawChips();
      if (gs.flying) knife.draw(ctx, gs.flying.x, gs.flying.y, 0, t, 1.18);
      drawLauncher(t); drawHUD();

      ctx.restore();

      if (gs.over) {
        ctx.fillStyle="rgba(0,0,0,0.6)"; ctx.fillRect(0,0,W,H);
      }
      gs.raf = requestAnimationFrame(frame);
    }

    // Input buffering: if the player taps/presses Space while a knife is
    // still mid-flight, that input isn't lost — it's queued and fired the
    // instant the current knife resolves (lands or collides). This fixes
    // the "spamming space drops throws" feel, since fast taps now always
    // register instead of being silently ignored while phase !== "idle".
    let queuedThrow = false;

    function doThrow() {
      if (gs.over) return;
      if (gs.phase !== "idle" || gs.left <= 0) {
        // Buffer the request if a throw is still in flight and knives remain
        if (gs.phase === "flying" && gs.left > 0) queuedThrow = true;
        return;
      }
      snd.throw();
      gs.phase = "flying";
      gs.flying = { x: CX, y: LAUNCH_Y-8, vy: -14 };
    }

    function releaseQueuedThrow() {
      if (queuedThrow && gs.phase === "idle" && gs.left > 0 && !gs.over) {
        queuedThrow = false;
        doThrow();
      } else if (gs.phase !== "flying") {
        queuedThrow = false; // clear stale buffer once game ends or resets
      }
    }

    canvas.addEventListener("click", doThrow);
    canvas.addEventListener("touchstart", e=>{ e.preventDefault(); doThrow(); }, { passive:false });
    const kd = e => { if(e.code==="Space"){e.preventDefault();doThrow();} };
    document.addEventListener("keydown", kd);
    trySpawnApple();          // chance for a bonus apple right from level 1
    gs.raf = requestAnimationFrame(frame);

    return () => {
      canvas.removeEventListener("click", doThrow);
      document.removeEventListener("keydown", kd);
      if (gs.raf) cancelAnimationFrame(gs.raf);
    };
  }, [equippedId]);

  return (
    <canvas ref={ref} width={400} height={500}
      style={{ display:"block", cursor:"crosshair", borderRadius:8,
               border:`0.5px solid ${C.border}`, boxShadow:`0 0 40px rgba(200,155,60,0.06)`,
               width:"100%", height:"100%" }} />
  );
}


// ─── INSPECT MODAL ────────────────────────────────────────────────────────────
function InspectModal({ knife, onClose }) {
  const r = RARITIES[knife.rarity];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex",
        alignItems:"center", justifyContent:"center", zIndex:500 }}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
          background:C.panel, borderRadius:12, padding:"28px 32px", minWidth:280, textAlign:"center",
          border:`1px solid ${r.color}55`, boxShadow:`0 0 60px ${r.glow}` }}>
        <KnifePreview id={knife.id} size={80} spin />
        <div style={{ fontWeight:700, fontSize:17, color:C.text, marginBottom:6, marginTop:4 }}>{knife.name}</div>
        <Badge rarity={knife.rarity} />
        <div style={{ fontSize:11, color:C.textDim, marginTop:4, marginBottom:14 }}>{knife.cat} Collection</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
          <Stat label="Buy price" value={`🪙 ${knife.buyPrice}`} />
          <Stat label="Sell value" value={`🪙 ${knife.value}`} />
          <Stat label="Drop chance" value={`${(RARITIES[knife.rarity].drop*100).toFixed(1)}%`} />
          <Stat label="Rarity" value={r.label} accent={r.color} />
        </div>
        <button onClick={onClose} style={BtnStyle()}>Close</button>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div style={{ background:C.surface, borderRadius:6, padding:"8px 10px", textAlign:"left" }}>
      <div style={{ fontSize:9, color:C.textDim, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>{label}</div>
      <div style={{ fontWeight:600, fontSize:13, color: accent || C.text, fontFamily:"'Courier New',monospace" }}>{value}</div>
    </div>
  );
}

// ─── CASE OPENING MODAL ───────────────────────────────────────────────────────
// HOW THE ANIMATION WORKS
// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 "ready"   — shows crate info and Open button.
// Phase 2 "spinning"— canvas mounts; useEffect fires AFTER the DOM paint so the
//                     canvas ref is guaranteed non-null. A rAF loop scrolls a
//                     horizontal reel of knife cards left-to-right, decelerating
//                     with friction until it stops on a pre-chosen target index.
//                     The target was rolled at "Open Case" click time (not inside
//                     the animation) so the result is known but hidden.
// Phase 3 "result"  — spinning stops, result card fades in with a glow matching
//                     the knife rarity. Player clicks Collect to close.
// ─────────────────────────────────────────────────────────────────────────────
function CaseModal({ crate, onCharge, onResult, onClose }) {
  const [phase, setPhase]     = useState("ready");
  const [result, setResult]   = useState(null);
  const snd = useSound();

  // ── Confetti burst (plays once, right when the result is revealed) ──
  const confettiRef   = useRef(null);
  const confettiRaf    = useRef(null);
  const confettiPieces = useRef([]);

  // ── Reel data (built once, stable across renders) ──
  const ITEM_W  = 88;   // px per card
  const VISIBLE = 5;    // how many cards show at once (canvas is ITEM_W * VISIBLE wide)
  const CANVAS_W = ITEM_W * VISIBLE;
  const CANVAS_H = 120;

  // Build a long reel of random knives ending with the real result at a fixed slot
  const reelItems  = useRef([]);
  const targetIdx  = useRef(0);
  const rafRef     = useRef(null);
  const posRef     = useRef(0);    // current scroll offset in px
  const velRef     = useRef(0);    // px per frame
  const t0Ref      = useRef(Date.now());
  const canvasRef  = useRef(null);
  const doneRef    = useRef(false);
  const lastTickSlotRef = useRef(-1);
  const lastTickAtRef   = useRef(0);

  // Build reel lazily the first time
  if (reelItems.current.length === 0) {
    // Fill with random knives, put the real winner near the end
    const items = Array.from({ length: 36 }, () => rollCrate(crate));
    const winnerSlot = 30 + Math.floor(Math.random() * 4); // slot 30-33
    const winner     = rollCrate(crate);                    // the real drop
    items[winnerSlot] = winner;
    reelItems.current = items;
    targetIdx.current = winnerSlot;
  }

  // ── Open button handler ──────────────────────────────────────────────
  // This is the ONLY moment money actually changes hands: the player has
  // already seen the drop-rate table and explicitly clicked "Open Case".
  // If the charge fails (e.g. coins changed in another tab / insufficient
  // funds), we do NOT start the spin — the player stays on the "ready"
  // screen and can still hit Cancel with their coins untouched.
  function handleOpen() {
    const charged = onCharge ? onCharge(crate) : true;
    if (!charged) return;   // payment failed — never enters spinning phase

    posRef.current  = 0;
    velRef.current  = 9 + Math.random() * 4;   // initial scroll speed
    doneRef.current = false;
    t0Ref.current   = Date.now();
    lastTickSlotRef.current = -1;
    lastTickAtRef.current   = 0;
    setPhase("spinning");
    snd.open();
  }

  // ── Draw a single frame of the reel onto the canvas ──
  function drawFrame(canvas, offset) {
    const ctx = canvas.getContext("2d");
    const W = CANVAS_W, H = CANVAS_H;
    const t = Date.now() - t0Ref.current;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#0A0806";
    ctx.fillRect(0, 0, W, H);

    // Which slot is centred
    const centreSlot = Math.round(offset / ITEM_W);

    reelItems.current.forEach((knife, i) => {
      // x position of this card's left edge, relative to canvas
      const x = i * ITEM_W - offset + (W / 2) - (ITEM_W / 2);
      if (x > W + ITEM_W || x < -ITEM_W) return;   // off-screen, skip

      const r    = RARITIES[knife.rarity];
      const isCentre = i === centreSlot;

      // Card background — highlighted if centred
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + 3, 6, ITEM_W - 6, H - 12, 6);
      ctx.fillStyle = isCentre ? r.color + "30" : C.panel;
      ctx.fill();
      ctx.strokeStyle = isCentre ? r.color : C.border;
      ctx.lineWidth   = isCentre ? 1.5 : 0.5;
      ctx.stroke();
      ctx.restore();

      // Knife drawing — centred in card, tip-up
      knife.draw(ctx, x + ITEM_W / 2, H / 2 + 4, 0, t);

      // Rarity label at bottom
      ctx.font      = "bold 8px 'Courier New',monospace";
      ctx.fillStyle = r.color;
      ctx.textAlign = "center";
      ctx.fillText(r.label.toUpperCase(), x + ITEM_W / 2, H - 7);

      // Knife name at top
      ctx.font      = "7px system-ui,sans-serif";
      ctx.fillStyle = isCentre ? C.text : C.textDim;
      ctx.fillText(knife.name.slice(0, 11), x + ITEM_W / 2, 16);
    });

    // Centre selection window — two vertical gold lines
    const selL = W / 2 - ITEM_W / 2 + 2;
    const selR = W / 2 + ITEM_W / 2 - 2;
    ctx.strokeStyle = C.gold;
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.moveTo(selL, 0); ctx.lineTo(selL, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(selR, 0); ctx.lineTo(selR, H); ctx.stroke();

    // Top + bottom edge trim
    ctx.strokeStyle = C.border;
    ctx.lineWidth   = 0.5;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(W, H); ctx.stroke();

    // Gold triangle pointers pointing inward at top and bottom centre
    ctx.fillStyle = C.gold;
    ctx.beginPath(); ctx.moveTo(W/2-6,0); ctx.lineTo(W/2+6,0); ctx.lineTo(W/2,10); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W/2-6,H); ctx.lineTo(W/2+6,H); ctx.lineTo(W/2,H-10); ctx.fill();
  }

  // ── Animation loop — runs only while phase === "spinning" ──
  useEffect(() => {
    if (phase !== "spinning") return;

    // TARGET position: scroll until the winner slot is centred
    const TARGET = targetIdx.current * ITEM_W - (CANVAS_W / 2 - ITEM_W / 2);

    function loop() {
      if (doneRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) { rafRef.current = requestAnimationFrame(loop); return; }

      // Friction: slow down as we approach target
      const remaining = TARGET - posRef.current;
      if (remaining < ITEM_W * 1.8) {
        // Ease in: decelerate close to target, but not so gradually that
        // the last stretch crawls — keeps the finish feeling snappy.
        velRef.current = Math.max(0.9, velRef.current * 0.88);
      }

      posRef.current += velRef.current;
      const tickSlot = Math.floor((posRef.current + CANVAS_W / 2) / ITEM_W);
      const tickNow = performance.now();
      if (tickSlot !== lastTickSlotRef.current && tickNow - lastTickAtRef.current > 38) {
        lastTickSlotRef.current = tickSlot;
        lastTickAtRef.current = tickNow;
        snd.caseTick();
      }

      // Snap to target when close enough and slow enough
      if (posRef.current >= TARGET && velRef.current < 2.2) {
        posRef.current  = TARGET;
        doneRef.current = true;
        drawFrame(canvas, posRef.current);

        // Short pause then reveal result
        const winner = reelItems.current[targetIdx.current];
        setTimeout(() => {
          setResult(winner);
          setPhase("result");
          const rich = ["epic","legendary","mythic"].includes(winner.rarity);
          if (rich) snd.rare(); else snd.coin();
        }, 220);
        return;
      }

      drawFrame(canvas, posRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  // ── CONFETTI ────────────────────────────────────────────────────────────
  // Fires once when the result is revealed. Pieces spawn from the top of the
  // modal, tumble down with gravity + drag + rotation, and fade near the end
  // of their life. Colors lean toward the won knife's rarity color plus gold,
  // so rarer drops feel a touch more celebratory without a separate code path.
  useEffect(() => {
    if (phase !== "result" || !result) return;

    const canvas = confettiRef.current;
    if (!canvas) return;
    const screenW = canvas.width;
    const screenH = canvas.height;

    const r = RARITIES[result.rarity];
    const palette = [r.color, C.gold, "#FFFFFF", r.color, C.gold];
    const big = ["epic","legendary","mythic"].includes(result.rarity);

    // More pieces now that confetti spans the whole viewport, not just the card
    const count = big ? 160 : 100;
    confettiPieces.current = Array.from({ length: count }, () => ({
      x: Math.random() * (screenW + 80) - 40,
      y: -20 - Math.random() * (screenH * 0.4),   // staggered start heights for a fuller fall
      vx: (Math.random() - 0.5) * 2.4,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.32,
      size: 5 + Math.random() * 5,
      color: palette[Math.floor(Math.random() * palette.length)],
      life: 1,
      decay: 0.004 + Math.random() * 0.005,
      shape: Math.random() < 0.5 ? "rect" : "circle",
    }));

    const startT = Date.now();

    function loop() {
      if (!canvas) { confettiRaf.current = requestAnimationFrame(loop); return; }
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let aliveCount = 0;
      for (const p of confettiPieces.current) {
        if (p.life <= 0) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;          // gentle gravity
        p.vx *= 0.99;           // air drag
        p.rot += p.vrot;
        // Only start fading after falling a bit, so the burst reads clearly first
        if (Date.now() - startT > 800) p.life -= p.decay;
        if (p.y > canvas.height + 20 || p.life <= 0) { p.life = 0; continue; }
        aliveCount++;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size/2, -p.size/3, p.size, p.size*0.66);
        } else {
          ctx.beginPath(); ctx.arc(0, 0, p.size/2, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
      }

      if (aliveCount > 0) {
        confettiRaf.current = requestAnimationFrame(loop);
      }
    }
    confettiRaf.current = requestAnimationFrame(loop);

    return () => { if (confettiRaf.current) cancelAnimationFrame(confettiRaf.current); };
  }, [phase, result]);

  const rr = result ? RARITIES[result.rarity] : null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)",
        display:"flex", alignItems:"center", justifyContent:"center", zIndex:500 }}>

      {/* Confetti overlay — spans the ENTIRE screen, sits above the dark backdrop
          but below the modal card, so confetti rains across the whole background
          rather than being clipped inside the card. */}
      {phase === "result" && (
        <canvas
          ref={confettiRef}
          width={typeof window !== "undefined" ? window.innerWidth  : 800}
          height={typeof window !== "undefined" ? window.innerHeight : 600}
          style={{
            position:"fixed", top:0, left:0,
            width:"100vw", height:"100vh",
            pointerEvents:"none", zIndex:501,
          }}
        />
      )}

      <div style={{ background:C.panel, borderRadius:14, padding:"24px 20px",
          width: CANVAS_W + 40, maxWidth:"95vw",
          border:`0.5px solid ${C.borderHi}`, textAlign:"center",
          position:"relative", zIndex:502 }}>

        <div style={{ position:"relative", zIndex:1 }}>

        {phase !== "ready" && (
          <>
            <div style={{ fontWeight:700, fontSize:15, color:C.gold, marginBottom:2,
                letterSpacing:"0.08em", fontFamily:"'Courier New',monospace" }}>
              {crate.icon} {crate.name.toUpperCase()}
            </div>
            <div style={{ fontSize:11, color:C.textDim, marginBottom:16 }}>
              🪙 {crate.price} to open
            </div>
          </>
        )}

        {/* ── READY ── */}
        {phase === "ready" && (
          <>
            <div style={{ fontWeight:800, fontSize:20, color:C.gold, marginBottom:18,
                letterSpacing:"0.08em", fontFamily:"'Courier New',monospace" }}>
              ARE YOU SURE?
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={handleOpen} style={BtnStyle(C.gold, C.goldDim)}>Open</button>
              <button onClick={onClose}   style={BtnStyle()}>Cancel</button>
            </div>
          </>
        )}

        {/* ── SPINNING REEL ── */}
        {phase === "spinning" && (
          <div style={{ margin:"0 auto", borderRadius:8, overflow:"hidden",
              border:`0.5px solid ${C.borderHi}`,
              boxShadow:`0 0 24px rgba(200,155,60,0.15)` }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              style={{ display:"block" }}
            />
          </div>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && result && (
          <div style={{ animation:"fadeIn 0.35s ease" }}>
            {/* Result knife preview */}
            <div style={{ position:"relative", display:"inline-block",
                margin:"4px auto 10px", padding:8 }}>
              <KnifePreview id={result.id} size={90} spin />
            </div>
            <div style={{ fontWeight:700, fontSize:20, color:C.text, marginBottom:6 }}>
              {result.name}
            </div>
            <div style={{ marginBottom:6 }}>
              <Badge rarity={result.rarity} />
            </div>
            <button
              onClick={() => onResult(result)}
              style={{
                ...BtnStyle(rr?.color, rr?.color),
                padding:"10px 32px", fontSize:14, fontWeight:900,
                WebkitTextStroke:"0.25px currentColor",
                textShadow:"0.35px 0 currentColor",
                boxShadow:`0 0 16px ${rr?.glow}`,
              }}>
              Collect
            </button>
          </div>
        )}
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
}

// ─── SMALL STYLE HELPERS ──────────────────────────────────────────────────────
function BtnStyle(textColor = C.textMid, borderColor = C.border) {
  return {
    padding:"8px 20px", borderRadius:5, fontSize:12, fontWeight:600,
    border:`0.5px solid ${borderColor}`, background:"transparent",
    color:textColor, cursor:"pointer", letterSpacing:"0.05em",
    fontFamily:"'Courier New',monospace",
  };
}

function SectionHead({ children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
      <div style={{ height:1, flex:1, background:C.border }} />
      <span style={{ fontSize:10, fontWeight:700, color:C.goldDim, letterSpacing:"0.12em",
          fontFamily:"'Courier New',monospace" }}>{children}</span>
      <div style={{ height:1, flex:1, background:C.border }} />
    </div>
  );
}


// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [save, setSave]           = useState(null);
  const [screen, setScreen]       = useState("play");
  const [inspecting, setInspecting] = useState(null);
  const [openCase, setOpenCase]   = useState(null);
  const [toast, setToast]         = useState(null);
  const [rarityFilter, setRarityFilter] = useState("all");
  const [gameKey, setGameKey]     = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [introLaunching, setIntroLaunching] = useState(false);
  const [soundOn, setSoundOn]     = useState(true);   // mirrors SOUND_MUTED
  const [gameOverInfo, setGameOverInfo] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const snd = useSound();

  // ── Persist ──
  useEffect(() => {
    async function load() {
      try {
        const r = await window.storage.get("ks_v1_save");
        const loaded = r ? JSON.parse(r.value) : null;
        // Merge with defaults so older saves (pre-Maps update) gain new fields
        setSave(loaded ? { ...DEFAULT_SAVE, ...loaded } : { ...DEFAULT_SAVE });
      } catch { setSave({ ...DEFAULT_SAVE }); }
    }
    load();
  }, []);

  const persist = useCallback(async p => {
    try { await window.storage.set("ks_v1_save", JSON.stringify(p)); } catch {}
  }, []);

  function upd(fn) {
    setSave(prev => {
      const next = fn({
        ...prev,
        stats: { ...prev.stats },
        inventory: [...prev.inventory],
      });
      persist(next);
      return next;
    });
  }

  function toast$(msg, ok = false) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  }

  function renamePlayer(name) {
    const clean = name.trim().slice(0, 18) || "Player";
    upd(p => { p.name = clean; return p; });
    setEditingName(false);
    setNameDraft("");
    toast$("Player name saved", true);
  }

  // ── Game end ──
  function dismissGameOver() {
    if (!gameOverInfo) return;
    setGameOverInfo(null);
    setIntroLaunching(false);
    setGameStarted(true);
    setGameKey(k => k + 1);
  }

  useEffect(() => {
    if (!gameOverInfo) return;
    const kd = e => {
      if (e.code === "Space") {
        e.preventDefault();
        dismissGameOver();
      }
    };
    document.addEventListener("keydown", kd);
    return () => document.removeEventListener("keydown", kd);
  }, [gameOverInfo]);

  function onGameEnd(score, level) {
    upd(p => {
      p.stats.score = Math.max(p.stats.score, score);
      p.stats.games++;
      p.stats.throws += score + 1;
      return p;
    });
    setGameOverInfo({ score, level });
  }

  // ── Bonus apple hit mid-game — instant coin reward, doesn't wait for game end ──
  function onAppleCoins(amount, source = "apple") {
    upd(p => { p.coins += amount; return p; });
    toast$(source === "level" ? `Level bonus! +${amount} 🪙` : source === "goldApple" ? `Golden apple bonus! +${amount} 🪙` : `🍎 Apple bonus! +${amount} 🪙`, true);
  }

  // ── Daily reward ──
  const canDaily = save && save.dailyClaimed !== todayStr();
  function claimDaily() {
    if (!canDaily) return;
    upd(p => { p.coins += 75; p.dailyClaimed = todayStr(); return p; });
    snd.coin(); toast$("Daily reward: +75 🪙 !", true);
  }

  // ── Shop buy ──
  function buyKnife(knife) {
    if (save.inventory.includes(knife.id)) { toast$("Already owned"); return; }
    if (save.coins < knife.buyPrice) { toast$("Not enough coins"); return; }
    upd(p => { p.coins -= knife.buyPrice; p.inventory.push(knife.id); return p; });
    snd.coin(); toast$(`Bought ${knife.name}!`, true);
  }

  // ── Case opening ──
  // NOTE: coins are deducted inside the modal's own confirm step (handleOpen),
  // NOT here. This screen's "Open" button just opens the confirmation modal —
  // charging here would mean Cancel-ing the modal's own "Open Case" button
  // could never refund the player, since the money was already gone.
  function buyCase(crate) {
    if (save.coins < crate.price) { toast$("Not enough coins"); return; }
    setOpenCase(crate);
  }
  function onCaseResult(knife) {
    upd(p => { p.inventory.push(knife.id); return p; });
    setOpenCase(null);
    toast$(`${knife.name} added to inventory!`, true);
  }
  // Called by the modal right when the player confirms "Open Case" inside it —
  // this is the actual moment of payment.
  function chargeForCase(crate) {
    if (save.coins < crate.price) { toast$("Not enough coins"); return false; }
    upd(p => { p.coins -= crate.price; return p; });
    return true;
  }

  // ── Equip ──
  function equip(id) {
    upd(p => { p.equipped = id; return p; });
    snd.menu(); toast$("Equipped!", true);
  }

  // ── Select map ──
  function selectMap(id) {
    const m = MAPS.find(mp => mp.id === id);
    if (!m) return;
    if (save.stats.score < m.unlockScore) { toast$("Arena locked"); return; }
    upd(p => { p.activeMap = id; return p; });
    setGameStarted(false);
    setIntroLaunching(false);
    setScreen("play");
    snd.menu(); toast$(`${m.name} selected!`, true);
  }

  if (!save) return (
    <div style={{ background:C.bg, minHeight:600, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ color:C.textDim, fontFamily:"monospace", fontSize:13 }}>Loading…</span>
    </div>
  );

  const equippedKnife = KNIVES.find(k => k.id === save.equipped) || KNIVES[0];
  const activeMap = MAPS.find(m => m.id === save.activeMap) || MAPS[0];
  const rarityFilters = ["all","common","uncommon","rare","epic","mythic","legendary"];

  // Leaderboard: merge seed + player if score > 0
  const board = [...SEED_BOARD];
  if (save.stats.score > 0) {
    board.push({ name: save.name, score: save.stats.score, isMe: true });
  }
  board.sort((a,b) => b.score - a.score);

  const ownedKnives = KNIVES.filter(k => save.inventory.includes(k.id));
  const ownedValue = ownedKnives.reduce((sum, k) => sum + (k.value || 0), 0);
  const avgScore = save.stats.games ? (save.stats.score / save.stats.games).toFixed(1) : "0.0";
  const avgThrows = save.stats.games ? (save.stats.throws / save.stats.games).toFixed(1) : "0.0";
  const collectionPct = Math.round((save.inventory.length / KNIVES.length) * 100);
  const playerRank = save.stats.score > 0
    ? board.findIndex(entry => entry.isMe) + 1
    : null;
  const unlockedMaps = MAPS.filter(m => save.stats.score >= m.unlockScore).length;
  const rarityOrder = ["common","uncommon","rare","epic","mythic","legendary"];
  const rarestOwned = ownedKnives.slice().sort(
    (a,b) => rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity)
  )[0] || equippedKnife;

  const NAV = [
    { id:"play",      label:"Play",     icon:"🎮" },
    { id:"maps",      label:"Maps",     icon:"🗺️" },
    { id:"inventory", label:"Knives",   icon:"🗡️" },
    { id:"shop",      label:"Shop",     icon:"🛒" },
    { id:"cases",     label:"Cases",    icon:"🎁" },
    { id:"board",     label:"Scores",   icon:"🏆" },
    { id:"stats",     label:"Stats",    icon:"📊" },
    { id:"settings",  label:"Settings", icon:"⚙️" },
  ];

  return (
    <div style={{
        minHeight:"max(600px, 100vh)",
        backgroundColor:C.bg,
        backgroundImage:`radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), radial-gradient(ellipse 1100px 760px at 50% 280px, ${C.surface} 0%, ${C.bg} 60%, ${C.bgDeep} 100%)`,
        backgroundSize:"28px 28px, 100% 100%",
        backgroundAttachment:"fixed, fixed",
        fontFamily:"system-ui,sans-serif", color:C.text, position:"relative" }}>

      {/* ── GLOBAL MODALS ── */}
      {inspecting && <InspectModal knife={inspecting} onClose={()=>setInspecting(null)} />}
      {openCase   && <CaseModal crate={openCase} onCharge={chargeForCase} onResult={onCaseResult} onClose={()=>setOpenCase(null)} />}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position:"fixed", top:12, left:"50%", transform:"translateX(-50%)",
            background: toast.ok ? C.green+"22" : C.red+"22",
            border:`0.5px solid ${toast.ok?C.green:C.red}66`,
            color: toast.ok ? "#88DDAA" : "#FF8888",
            borderRadius:6, padding:"7px 16px", fontSize:12, fontWeight:600,
            zIndex:600, whiteSpace:"nowrap", pointerEvents:"none",
            fontFamily:"'Courier New',monospace", letterSpacing:"0.04em" }}>
          {toast.msg}
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div style={{ background:C.surface, borderBottom:`0.5px solid ${C.border}`,
          padding:"0 14px", display:"flex", alignItems:"center", height:44 }}>
        <span style={{ fontWeight:700, fontSize:14, color:C.gold, letterSpacing:"0.1em",
            fontFamily:"'Courier New',monospace", flex:1 }}>◆ KNIFE SHOW</span>
        {canDaily && (
          <button onClick={claimDaily} style={{
              fontSize:10, padding:"3px 10px", borderRadius:4, marginRight:10, cursor:"pointer",
              background:C.green+"22", color:"#88DDAA", border:`0.5px solid ${C.green}66`,
              fontFamily:"monospace", fontWeight:700, letterSpacing:"0.04em" }}>
            📅 DAILY +75
          </button>
        )}
        <div style={{ fontFamily:"'Courier New',monospace", fontWeight:700, fontSize:13,
            color:C.gold, background:C.goldDim+"33", borderRadius:5,
            padding:"3px 12px", border:`0.5px solid ${C.goldDim}` }}>
          🪙 {save.coins}
        </div>
      </div>

      {/* ── NAV ── */}
      <div style={{ background:C.surface, borderBottom:`0.5px solid ${C.border}`,
          display:"flex", gap:0, overflowX:"auto" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={()=>{ setScreen(n.id); snd.menu(); }} style={{
              padding:"10px 14px", fontSize:10, fontWeight:700, cursor:"pointer",
              background:"transparent", border:"none", letterSpacing:"0.06em",
              fontFamily:"'Courier New',monospace", whiteSpace:"nowrap",
              color: screen===n.id ? C.gold : C.textDim,
              borderBottom: screen===n.id ? `2px solid ${C.gold}` : "2px solid transparent",
          }}>
            <span style={{ marginRight:4, fontSize:11 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </div>

      {/* ── SCREENS ── */}
      <div style={{ padding:"16px 14px" }}>

        {/* ══ PLAYER STATS ══ */}
        {screen==="stats" && (
          <div>
            <SectionHead>PLAYER STATS</SectionHead>

            <div style={{ border:`0.5px solid ${C.borderHi}`, borderRadius:10,
                padding:"16px", background:C.surface, marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <div>
                  <div style={{ fontSize:10, color:C.textDim, fontFamily:"monospace",
                      letterSpacing:"0.1em", marginBottom:4 }}>PLAYER</div>
                  {!editingName ? (
                    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                      <div style={{ fontSize:22, fontWeight:800, color:C.gold,
                          fontFamily:"'Courier New',monospace" }}>{save.name}</div>
                      <button
                        title="Change player name"
                        onClick={()=>{
                          setNameDraft(save.name);
                          setEditingName(true);
                        }}
                        style={{
                          width:28, height:28, borderRadius:5, cursor:"pointer",
                          border:`0.5px solid ${C.goldDim}`, background:C.gold+"12",
                          color:C.gold, fontSize:14, fontWeight:800, lineHeight:"26px",
                          fontFamily:"'Courier New',monospace",
                        }}>
                        ✎
                      </button>
                    </div>
                  ) : (
                    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                      <input
                        value={nameDraft}
                        maxLength={18}
                        autoFocus
                        onChange={(e)=>setNameDraft(e.target.value)}
                        onKeyDown={(e)=>{
                          if (e.key === "Enter") renamePlayer(nameDraft);
                          if (e.key === "Escape") setEditingName(false);
                        }}
                        style={{
                          width:180, maxWidth:"100%", padding:"7px 9px", borderRadius:5,
                          border:`0.5px solid ${C.borderHi}`, background:"rgba(0,0,0,0.24)",
                          color:C.gold, outline:"none", fontSize:18, fontWeight:800,
                          fontFamily:"'Courier New',monospace",
                        }}
                      />
                      <button
                        onClick={()=>renamePlayer(nameDraft)}
                        style={{ ...BtnStyle(C.gold,C.goldDim), padding:"7px 14px", fontSize:10 }}>
                        Save
                      </button>
                      <button
                        onClick={()=>{
                          setEditingName(false);
                          setNameDraft("");
                        }}
                        style={{ ...BtnStyle(), padding:"7px 10px", fontSize:10 }}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ textAlign:"right", fontSize:11, color:C.textDim, lineHeight:1.7 }}>
                  <div>Rank: <span style={{ color:C.gold, fontWeight:700 }}>
                    {playerRank ? `#${playerRank}` : "Not ranked"}
                  </span></div>
                  <div>Balance: <span style={{ color:C.gold, fontWeight:700 }}>🪙 {save.coins}</span></div>
                </div>
              </div>
            </div>

            <SectionHead>GAMEPLAY</SectionHead>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",
                gap:8, marginBottom:14 }}>
              {[
                ["BEST SCORE", save.stats.score],
                ["GAMES PLAYED", save.stats.games],
                ["TOTAL THROWS", save.stats.throws],
                ["AVG THROWS/GAME", avgThrows],
                ["MAPS UNLOCKED", `${unlockedMaps}/${MAPS.length}`],
                ["ACTIVE MAP", activeMap.name],
              ].map(([label,value])=>(
                <div key={label} style={{ border:`0.5px solid ${C.border}`, borderRadius:7,
                    background:"rgba(255,255,255,0.02)", padding:"12px 10px", textAlign:"center" }}>
                  <div style={{ fontSize:8, color:C.textDim, fontFamily:"monospace",
                      letterSpacing:"0.08em", marginBottom:5 }}>{label}</div>
                  <div style={{ fontWeight:800, fontSize:18, color:C.gold,
                      fontFamily:"'Courier New',monospace", wordBreak:"break-word" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <SectionHead>COLLECTION</SectionHead>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",
                gap:8, marginBottom:14 }}>
              {[
                ["KNIVES OWNED", `${save.inventory.length}/${KNIVES.length}`],
                ["COLLECTION", `${collectionPct}%`],
                ["SELL VALUE", `🪙 ${ownedValue.toLocaleString()}`],
                ["RAREST KNIFE", rarestOwned.name],
                ["EQUIPPED", equippedKnife.name],
                ["EQUIPPED VALUE", `🪙 ${equippedKnife.value}`],
              ].map(([label,value])=>(
                <div key={label} style={{ border:`0.5px solid ${C.border}`, borderRadius:7,
                    background:"rgba(255,255,255,0.02)", padding:"12px 10px", textAlign:"center" }}>
                  <div style={{ fontSize:8, color:C.textDim, fontFamily:"monospace",
                      letterSpacing:"0.08em", marginBottom:5 }}>{label}</div>
                  <div style={{ fontWeight:800, fontSize:16,
                      color: label==="RAREST KNIFE" ? RARITIES[rarestOwned.rarity].color : C.gold,
                      fontFamily:"'Courier New',monospace", wordBreak:"break-word" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ══ PLAY ══ */}
        {screen==="play" && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
            <style>{`
              .ks-stage { position:relative; width:min(400px, 94vw); max-width:100%; aspect-ratio:4/5; }
              @media (min-width:900px) { .ks-stage { width:460px; } }
            `}</style>
            <div className="ks-stage">
              {!gameStarted && !introLaunching && (
                <div style={{ position:"absolute", inset:0, opacity:0.72, filter:"brightness(0.82) saturate(0.9)" }}>
                  <StartScenePreview equippedId={save.equipped} mapId={save.activeMap} />
                </div>
              )}
              {gameStarted && (
                <div style={{
                    position:"absolute", inset:0,
                    animation:introLaunching ? "gameSceneReveal 0.84s cubic-bezier(.18,.82,.24,1) both" : "gamePopIn 0.42s cubic-bezier(.18,.82,.24,1) both",
                  }}>
                  <GameCanvas equippedId={save.equipped} mapId={save.activeMap} onEnd={onGameEnd} onCoins={onAppleCoins} hideReadyKnife={introLaunching} key={gameKey + save.activeMap} />
                </div>
              )}
              {gameOverInfo && (
                <button onClick={dismissGameOver} style={{
                    position:"absolute", inset:0, zIndex:35, border:0, borderRadius:10,
                    background:"rgba(0,0,0,0.72)", color:C.gold, cursor:"pointer",
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                    fontFamily:"'Courier New',monospace", letterSpacing:"0.08em",
                  }}>
                  <div style={{ fontSize:34, fontWeight:900, marginBottom:12, textShadow:`0 0 20px ${C.goldDim}` }}>GAME OVER</div>
                  <div style={{ fontSize:13, color:C.text, marginBottom:8 }}>SCORE {gameOverInfo.score} · LEVEL {gameOverInfo.level}</div>
                  <div style={{ fontSize:11, color:C.textDim }}>CLICK · SPACE · TO CONTINUE</div>
                </button>
              )}
              {(!gameStarted || introLaunching) && (
              <button
                onClick={()=>{
                  if (introLaunching) return;
                  setIntroLaunching(true);
                  setGameStarted(true);
                  setGameKey(k=>k+1);
                  snd.menu();
                  setTimeout(()=>{
                    setIntroLaunching(false);
                  }, 840);
                }}
                style={{
                  position:"absolute", inset:0, borderRadius:10,
                  border:`0.5px solid ${C.goldDim}`,
                  background:introLaunching ? "rgba(10,8,7,0.20)" : "rgba(10,8,7,0.42)",
                  color:C.gold, cursor:"pointer", display:"flex",
                  flexDirection:"column", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 0 24px rgba(200,155,60,0.10), inset 0 0 40px rgba(200,155,60,0.04)",
                  fontFamily:"'Courier New',monospace",
                  overflow:"hidden",
                  animation:introLaunching ? "startCardLaunch 0.84s ease both" : "startCardIn 0.55s ease both",
                }}>
                <div style={{
                    position:"absolute", inset:0, pointerEvents:"none",
                    background:"linear-gradient(115deg, rgba(200,155,60,0) 18%, rgba(200,155,60,0.08) 44%, rgba(200,155,60,0) 72%), linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0) 42%)",
                    animation:introLaunching ? "startGlowBurst 0.84s ease both" : "startGlowPulse 2.8s ease-in-out infinite",
                  }} />
                <div style={{
                    width:174, height:174, borderRadius:"50%", display:"flex",
                    alignItems:"center", justifyContent:"center", marginBottom:18,
                    background:"transparent",
                    position:"relative",
                    animation:introLaunching ? "knifeToLauncher 0.84s cubic-bezier(.18,.82,.24,1) both" : "knifeFloat 2.4s ease-in-out infinite",
                  }}>
                  <div style={{ animation:"knifeReveal 0.7s ease both" }}>
                    <KnifePreview id={save.equipped} size={150} spin scale={1.18} />
                  </div>
                </div>
                <div style={{ fontSize:22, fontWeight:900, letterSpacing:"0.08em",
                    position:"relative", animation:introLaunching ? "startTextOut 0.28s ease both" : "startTextIn 0.55s ease 0.32s both" }}>
                  CLICK TO START
                </div>
              </button>
              )}
            </div>
            {(!gameStarted || introLaunching) && (
              <style>{`
                @keyframes startCardIn {
                  from { opacity:0; transform:translateY(10px) scale(0.98); }
                  to { opacity:1; transform:translateY(0) scale(1); }
                }
                @keyframes startCardLaunch {
                  0% { opacity:1; transform:translateY(0) scale(1); }
                  82% { opacity:0.92; transform:translateY(0) scale(1); }
                  100% { opacity:0; transform:translateY(0) scale(1); }
                }
                @keyframes knifeReveal {
                  from { opacity:0; transform:translateY(18px) scale(0.88) rotate(-8deg); }
                  to { opacity:1; transform:translateY(0) scale(1) rotate(0); }
                }
                @keyframes knifeFloat {
                  0%, 100% { transform:translateY(0); }
                  50% { transform:translateY(-9px); }
                }
                @keyframes knifeToLauncher {
                  0% { transform:translateY(0) scale(1) rotate(0); opacity:1; }
                  30% { transform:translateY(-28px) scale(1.08) rotate(10deg); opacity:1; }
                  70% { transform:translateY(146px) scale(0.84) rotate(2deg); opacity:1; }
                  88% { transform:translateY(172px) scale(0.78) rotate(0); opacity:1; }
                  100% { transform:translateY(172px) scale(0.78) rotate(0); opacity:1; }
                }
                @keyframes startGlowPulse {
                  0%, 100% { opacity:0.72; transform:scale(1); }
                  50% { opacity:1; transform:scale(1.04); }
                }
                @keyframes startGlowBurst {
                  0% { opacity:0.8; transform:scale(1); }
                  45% { opacity:1; transform:scale(1.12); }
                  100% { opacity:0; transform:scale(1.32); }
                }
                @keyframes startTextIn {
                  from { opacity:0; transform:translateY(8px); }
                  to { opacity:1; transform:translateY(0); }
                }
                @keyframes startTextOut {
                  from { opacity:1; transform:translateY(0); }
                  to { opacity:0; transform:translateY(8px); }
                }
                @keyframes gamePopIn {
                  from { opacity:0; transform:translateY(18px) scale(0.94); filter:brightness(1.35); }
                  to { opacity:1; transform:translateY(0) scale(1); filter:brightness(1); }
                }
                @keyframes gameSceneReveal {
                  0% { opacity:0; transform:translateY(96px) scale(0.86); filter:blur(3px) brightness(1.55); }
                  48% { opacity:0.72; transform:translateY(-8px) scale(1.03); filter:blur(0.7px) brightness(1.18); }
                  72% { opacity:1; transform:translateY(5px) scale(0.99); filter:blur(0) brightness(1.06); }
                  100% { opacity:1; transform:translateY(0) scale(1); filter:blur(0) brightness(1); }
                }
              `}</style>
            )}
            <div style={{ display:gameStarted && !introLaunching ? "block" : "none", fontSize:11, color:C.textDim, fontFamily:"monospace", textAlign:"center" }}>
              CLICK · SPACE · TAP to throw &nbsp;·&nbsp; {activeMap.levelReward ?? 2} 🪙 PER LEVEL
            </div>
          </div>
        )}

        {/* ══ MAPS ══ */}
        {screen==="maps" && (
          <div>
            <SectionHead>SELECT ARENA</SectionHead>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {MAPS.map((m, idx) => {
                const locked = save.stats.score < m.unlockScore;
                const active = save.activeMap === m.id;
                return (
                  <div key={m.id} style={{
                      border:`0.5px solid ${active ? C.gold : C.borderHi}`,
                      borderRadius:10, padding:"14px 16px",
                      background: active ? C.gold+"0E" : C.surface,
                      opacity: locked ? 0.5 : 1,
                      display:"flex", alignItems:"center", gap:14,
                  }}>
                    <div style={{ fontSize:30, minWidth:38, textAlign:"center" }}>
                      {locked ? "🔒" : m.icon}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                        <span style={{ fontWeight:700, fontSize:13, color:C.text,
                            fontFamily:"'Courier New',monospace", letterSpacing:"0.04em" }}>
                          TIER {idx+1} · {m.name.toUpperCase()}
                        </span>
                        {active && <span style={{ fontSize:9, color:C.gold, fontFamily:"monospace",
                            border:`0.5px solid ${C.gold}`, borderRadius:3, padding:"1px 6px" }}>ACTIVE</span>}
                      </div>
                      <div style={{ fontSize:11, color:C.textDim, marginBottom:6 }}>{m.blurb}</div>
                      <div style={{ display:"flex", gap:14 }}>
                        <span style={{ fontSize:10, color:C.textMid, fontFamily:"monospace" }}>
                          SPEED ×{m.speedMod.toFixed(2)}
                        </span>
                        <span style={{ fontSize:10, color:"#E8C878", fontFamily:"monospace" }}>
                          {m.levelReward ?? 2} 🪙/LEVEL
                        </span>
                        {locked && (
                          <span style={{ fontSize:10, color:"#D08888", fontFamily:"monospace" }}>
                            UNLOCK AT SCORE {m.unlockScore}
                          </span>
                        )}
                      </div>
                    </div>
                    {!locked && !active && (
                      <button onClick={()=>selectMap(m.id)} style={BtnStyle(C.green,C.green)}>Select</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ INVENTORY ══ */}
        {screen==="inventory" && (
          <div>
            <SectionHead>YOUR COLLECTION — {save.inventory.length}/{KNIVES.length} KNIVES</SectionHead>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12 }}>
              {rarityFilters.map(c=>(
                <button key={c} onClick={()=>setRarityFilter(c)} style={{
                    padding:"3px 10px", borderRadius:4, fontSize:10, fontWeight:700, cursor:"pointer",
                    fontFamily:"monospace", letterSpacing:"0.05em",
                    background: rarityFilter===c ? C.gold+"22" : "transparent",
                    border:`0.5px solid ${rarityFilter===c?C.gold:C.border}`,
                    color: rarityFilter===c ? C.gold : C.textDim,
                }}>{c.toUpperCase()}</button>
              ))}
            </div>
            {save.inventory.length === 0 && (
              <div style={{ color:C.textDim, textAlign:"center", padding:24, fontSize:12 }}>
                No knives yet. Visit the Shop or open a Case.
              </div>
            )}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))", gap:8 }}>
              {KNIVES.filter(k=> save.inventory.includes(k.id) &&
                (rarityFilter==="all"||k.rarity===rarityFilter)).map(k=>(
                <div key={k.id} style={{
                    border:`0.5px solid ${save.equipped===k.id?RARITIES[k.rarity].color:C.border}`,
                    borderRadius:8, padding:"10px 8px", background:C.surface,
                    boxShadow: save.equipped===k.id?`0 0 12px ${RARITIES[k.rarity].glow}`:"none",
                }}>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}>
                    <KnifePreview id={k.id} size={44} />
                  </div>
                  <div style={{ fontWeight:600, fontSize:10, color:C.text, textAlign:"center",
                      marginBottom:3, lineHeight:1.3 }}>{k.name}</div>
                  <div style={{ textAlign:"center", marginBottom:6 }}><Badge rarity={k.rarity} tiny /></div>
                  <div style={{ display:"flex", gap:3 }}>
                    <button onClick={()=>equip(k.id)} style={{
                        flex:1, padding:"4px 0", fontSize:9, borderRadius:3, cursor:"pointer",
                        fontFamily:"monospace", fontWeight:700, letterSpacing:"0.04em",
                        background: save.equipped===k.id ? C.gold+"33" : "transparent",
                        border:`0.5px solid ${save.equipped===k.id?C.gold:C.border}`,
                        color: save.equipped===k.id ? C.gold : C.textDim,
                    }}>{save.equipped===k.id?"EQUIPPED":"EQUIP"}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ SHOP ══ */}
        {screen==="shop" && (
          <div>
            <SectionHead>KNIFE SHOP — BALANCE: 🪙 {save.coins}</SectionHead>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12 }}>
              {rarityFilters.map(c=>(
                <button key={c} onClick={()=>setRarityFilter(c)} style={{
                    padding:"3px 10px", borderRadius:4, fontSize:10, fontWeight:700, cursor:"pointer",
                    fontFamily:"monospace", letterSpacing:"0.05em",
                    background: rarityFilter===c ? C.gold+"22" : "transparent",
                    border:`0.5px solid ${rarityFilter===c?C.gold:C.border}`,
                    color: rarityFilter===c ? C.gold : C.textDim,
                }}>{c.toUpperCase()}</button>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))", gap:8 }}>
              {KNIVES.filter(k=> rarityFilter==="all"||k.rarity===rarityFilter).map(k=>{
                const owned = save.inventory.includes(k.id);
                const canBuy = !owned && save.coins >= k.buyPrice;
                return (
                  <div key={k.id} style={{
                      border:`0.5px solid ${owned?RARITIES[k.rarity].color+"66":C.border}`,
                      borderRadius:8, padding:"10px 8px", background:C.surface,
                      opacity: owned ? 0.55 : 1,
                  }}>
                    <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}>
                      <KnifePreview id={k.id} size={44} />
                    </div>
                    <div style={{ fontWeight:600, fontSize:10, color:C.text, textAlign:"center",
                        marginBottom:3, lineHeight:1.3 }}>{k.name}</div>
                    <div style={{ textAlign:"center", marginBottom:4 }}><Badge rarity={k.rarity} tiny /></div>
                    <div style={{ textAlign:"center", fontSize:10, color:C.gold,
                        fontFamily:"monospace", marginBottom:6, fontWeight:700 }}>🪙 {k.buyPrice}</div>
                    <button onClick={()=>buyKnife(k)} disabled={owned||!canBuy} style={{
                        width:"100%", padding:"4px 0", fontSize:9, borderRadius:3, fontWeight:700,
                        fontFamily:"monospace", cursor:owned?"default":canBuy?"pointer":"not-allowed",
                        background: owned?"transparent":canBuy?C.green+"22":"transparent",
                        border:`0.5px solid ${owned?C.border:canBuy?C.green:C.border}`,
                        color: owned?C.textDim:canBuy?"#88DDAA":C.textDim,
                    }}>{owned?"OWNED":canBuy?"BUY":"NOT ENOUGH 🪙"}</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ CASES ══ */}
        {screen==="cases" && (
          <div>
            <SectionHead>CASE OPENING — BALANCE: 🪙 {save.coins}</SectionHead>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
              {CRATES.map(c=>(
                <div key={c.id} style={{ border:`0.5px solid ${C.borderHi}`, borderRadius:10,
                    padding:"16px 14px", background:C.surface, minHeight:230,
                    display:"flex", flexDirection:"column" }}>
                  <div style={{ fontSize:36, textAlign:"center", marginBottom:8 }}>{c.icon}</div>
                  <div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:8,
                      textAlign:"center", fontFamily:"'Courier New',monospace",
                      letterSpacing:"0.06em" }}>{c.name.toUpperCase()}</div>
                  {Object.entries(c.weights).filter(([,v])=>v>0).map(([rar,pct])=>(
                    <div key={rar} style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontSize:10, color:RARITIES[rar].color, fontWeight:600 }}>
                        {RARITIES[rar].label}
                      </span>
                      <span style={{ fontSize:10, color:C.textDim, fontFamily:"monospace" }}>
                        {pct<0.01?`${(pct*100).toFixed(1)}%`:`${Math.round(pct*100)}%`}
                      </span>
                    </div>
                  ))}
                  <div style={{ marginTop:"auto" }}>
                  <div style={{ fontWeight:700, fontSize:14, color:C.gold, textAlign:"center",
                      fontFamily:"monospace", margin:"10px 0 10px" }}>🪙 {c.price}</div>
                  <button onClick={()=>buyCase(c)}
                    disabled={save.coins<c.price} style={{
                      width:"100%", padding:"8px 0", borderRadius:5, fontWeight:700, fontSize:11,
                      fontFamily:"'Courier New',monospace", letterSpacing:"0.06em", cursor:"pointer",
                      background: save.coins>=c.price ? C.gold+"22" : "transparent",
                      border:`0.5px solid ${save.coins>=c.price?C.gold:C.border}`,
                      color: save.coins>=c.price?C.gold:C.textDim,
                      opacity: save.coins<c.price?0.5:1,
                  }}>{save.coins<c.price?"NEED COINS":"OPEN CASE"}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ LEADERBOARD ══ */}
        {screen==="settings" && (
          <div>
            <SectionHead>SETTINGS</SectionHead>

            {/* Sound toggle */}
            <div style={{ border:`0.5px solid ${C.borderHi}`, borderRadius:10,
                padding:"18px 20px", background:C.surface, marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:C.text,
                      fontFamily:"'Courier New',monospace", letterSpacing:"0.05em", marginBottom:4 }}>
                    {soundOn ? "🔊 SOUND ON" : "🔇 SOUND OFF"}
                  </div>
                  <div style={{ fontSize:11, color:C.textDim }}>
                    Toggle all game sound effects — throws, hits, coins, case openings.
                  </div>
                </div>
                {/* Toggle switch */}
                <div onClick={() => {
                    const next = !soundOn;
                    setSoundOn(next);
                    SOUND_MUTED.current = !next;
                    if (next) snd.menu(); // play a click if turning ON
                  }}
                  style={{
                    width:52, height:28, borderRadius:14, cursor:"pointer",
                    background: soundOn ? C.green : C.border,
                    border:`0.5px solid ${soundOn ? C.green : C.borderHi}`,
                    position:"relative", transition:"background 0.2s, border 0.2s",
                    flexShrink:0, marginLeft:16,
                  }}>
                  <div style={{
                    position:"absolute", top:3, borderRadius:"50%",
                    width:22, height:22, background: soundOn ? "#FFF" : C.textDim,
                    left: soundOn ? 27 : 3,
                    transition:"left 0.2s, background 0.2s",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.5)",
                  }} />
                </div>
              </div>
            </div>

            {/* Sound preview buttons */}
            <div style={{ border:`0.5px solid ${C.border}`, borderRadius:10,
                padding:"16px 20px", background:C.surface, marginBottom:12 }}>
              <div style={{ fontWeight:700, fontSize:11, color:C.textDim,
                  fontFamily:"monospace", letterSpacing:"0.08em", marginBottom:12 }}>
                PREVIEW SOUNDS
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {[
                  { label:"Throw",  fn:()=>snd.throw() },
                  { label:"Hit",    fn:()=>snd.hit()   },
                  { label:"Fail",   fn:()=>snd.fail()  },
                  { label:"Coin",   fn:()=>snd.coin()  },
                  { label:"Open",   fn:()=>snd.open()  },
                  { label:"Rare",   fn:()=>snd.rare()  },
                ].map(({ label, fn }) => (
                  <button key={label} onClick={fn} disabled={!soundOn} style={{
                      padding:"8px 0", borderRadius:5, fontSize:10, fontWeight:700,
                      fontFamily:"'Courier New',monospace", letterSpacing:"0.05em",
                      cursor: soundOn ? "pointer" : "not-allowed", opacity: soundOn ? 1 : 0.35,
                      background:"transparent", border:`0.5px solid ${C.borderHi}`,
                      color:C.textMid,
                  }}>{label}</button>
                ))}
              </div>
              {!soundOn && (
                <div style={{ textAlign:"center", color:C.textDim, fontSize:11,
                    marginTop:10, fontFamily:"monospace" }}>
                  Sound is muted — toggle ON above to preview
                </div>
              )}
            </div>

            {/* Info row */}
            <div style={{ border:`0.5px solid ${C.border}`, borderRadius:10,
                padding:"14px 20px", background:C.surface }}>
              <div style={{ fontWeight:700, fontSize:11, color:C.textDim,
                  fontFamily:"monospace", letterSpacing:"0.08em", marginBottom:8 }}>
                ABOUT
              </div>
              <div style={{ fontSize:11, color:C.textDim, lineHeight:1.7 }}>
                <div>🔪 Knife Show — v1.0</div>
                <div>15 knife skins · 3 case types · 6 rarities</div>
                <div>Angle-based hit detection (12° threshold)</div>
                <div>Data saved automatically to local storage</div>
              </div>
            </div>
          </div>
        )}

        {screen==="board" && (
          <div>
            <SectionHead>TOP SCORES</SectionHead>
            <div style={{ border:`0.5px solid ${C.border}`, borderRadius:8, overflow:"hidden" }}>
              {/* Header */}
              <div style={{ display:"grid", gridTemplateColumns:"36px 1fr 80px",
                  background:C.surface, padding:"8px 14px",
                  borderBottom:`0.5px solid ${C.border}` }}>
                {["#","PLAYER","SCORE"].map(h=>(
                  <span key={h} style={{ fontSize:9, color:C.textDim, fontFamily:"monospace",
                      fontWeight:700, letterSpacing:"0.08em", textAlign:h==="SCORE"?"center":"left" }}>{h}</span>
                ))}
              </div>
              {board.slice(0,10).map((entry, i) => {
                const isMe = entry.isMe;
                const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
                return (
                  <div key={i} style={{
                      display:"grid", gridTemplateColumns:"36px 1fr 80px",
                      padding:"10px 14px",
                      background: isMe ? C.gold+"12" : "transparent",
                      borderBottom:`0.5px solid ${C.border}`,
                      borderLeft: isMe ? `3px solid ${C.gold}` : "3px solid transparent",
                  }}>
                    <span style={{ fontFamily:"monospace", fontSize:12,
                        color: i<3?C.gold:C.textDim, fontWeight:700 }}>
                      {medal || `#${i+1}`}
                    </span>
                    <span style={{ fontWeight:600, fontSize:12,
                        color: isMe ? C.gold : C.text }}>
                      {entry.name}{isMe?" (YOU)":""}
                    </span>
                    <span style={{ fontFamily:"'Courier New',monospace", fontSize:12,
                        color:C.textMid, fontWeight:700, textAlign:"center" }}>
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
            {!save.stats.score && (
              <div style={{ textAlign:"center", color:C.textDim, fontSize:12,
                  marginTop:14, fontFamily:"monospace" }}>
                Play a game to appear on the board.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

