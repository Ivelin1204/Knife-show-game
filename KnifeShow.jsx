import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// Dark showroom palette: near-black walls, warm gold accents, coloured rarity
// chips. Monospace data, sans-serif UI. Signature: the lobby hero is a live
// spinning log preview — the product itself is always on stage.
const C = {
  bg:       "#0E0C0A",
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
  legendary: { label:"Legendary", color:"#C89B3C", glow:"rgba(200,155,60,0.6)", drop:0.009 },
  mythic:    { label:"Mythic",    color:"#CC4488", glow:"rgba(204,68,136,0.6)", drop:0.001 },
};

// ─── KNIFE SKINS (15 designs, all original) ───────────────────────────────────
// Each has a draw(ctx, x, y, angle, t) — renders tip-up when angle=0.
// Value = coin sell price. BuyPrice = shop cost.
const KNIVES = [
  // ── BASIC (3) ──────────────────────────────────────────────────────────────
  { id:"k_steel",  name:"Field Steel",    rarity:"common",    cat:"Basic",    buyPrice:30,   value:12,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#A8A49C";ctx.beginPath();ctx.moveTo(0,-50);ctx.lineTo(3,-18);ctx.lineTo(3,2);ctx.lineTo(-3,2);ctx.lineTo(-3,-18);ctx.closePath();ctx.fill();ctx.fillStyle="#5A5650";ctx.beginPath();ctx.roundRect(-3,2,6,20,2);ctx.fill();ctx.restore(); }},
  { id:"k_cleaver",name:"Block Cleaver",  rarity:"common",    cat:"Basic",    buyPrice:30,   value:12,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#C8C4BC";ctx.beginPath();ctx.moveTo(-5,-46);ctx.lineTo(6,-46);ctx.lineTo(6,-12);ctx.lineTo(8,-12);ctx.lineTo(8,-4);ctx.lineTo(-5,-4);ctx.closePath();ctx.fill();ctx.strokeStyle="#9E9A92";ctx.lineWidth=0.5;ctx.stroke();ctx.fillStyle="#7A7670";ctx.beginPath();ctx.roundRect(-4,-4,8,22,2);ctx.fill();ctx.restore(); }},
  { id:"k_tanto",  name:"Tanto Point",    rarity:"uncommon",  cat:"Basic",    buyPrice:60,   value:24,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#B8B4AC";ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(4,-38);ctx.lineTo(4,-18);ctx.lineTo(-4,-14);ctx.lineTo(-4,-18);ctx.closePath();ctx.fill();ctx.fillStyle="#383634";ctx.beginPath();ctx.roundRect(-3,-14,6,26,3);ctx.fill();ctx.strokeStyle="#C89B3C";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-4,-2);ctx.lineTo(4,-2);ctx.stroke();ctx.restore(); }},

  // ── FANTASY (3) ────────────────────────────────────────────────────────────
  { id:"k_elven",  name:"Elven Whisper",  rarity:"uncommon",  cat:"Fantasy",  buyPrice:60,   value:24,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#6DCFAA";ctx.beginPath();ctx.moveTo(0,-56);ctx.bezierCurveTo(4,-36,4,-16,3,-6);ctx.lineTo(-3,-6);ctx.bezierCurveTo(-4,-16,-4,-36,0,-56);ctx.fill();ctx.strokeStyle="#1E8C60";ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(0,-54);ctx.lineTo(0,-8);ctx.stroke();ctx.fillStyle="#0C5038";ctx.beginPath();ctx.roundRect(-3,-6,6,20,2);ctx.fill();ctx.restore(); }},
  { id:"k_runic",  name:"Runic Carver",   rarity:"rare",      cat:"Fantasy",  buyPrice:150,  value:60,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#9A94DC";ctx.beginPath();ctx.moveTo(0,-54);ctx.lineTo(5,-26);ctx.lineTo(5,-6);ctx.lineTo(-5,-6);ctx.lineTo(-5,-26);ctx.closePath();ctx.fill();const p=0.4+0.3*Math.sin(t*0.003);ctx.strokeStyle=`rgba(160,152,240,${p})`;ctx.lineWidth=1;[-42,-30,-18].forEach(yy=>{ctx.beginPath();ctx.moveTo(-4,yy);ctx.lineTo(4,yy);ctx.stroke();});ctx.fillStyle="#2E2870";ctx.beginPath();ctx.roundRect(-3,-6,6,24,2);ctx.fill();ctx.restore(); }},
  { id:"k_bone",   name:"Boneclaw",       rarity:"rare",      cat:"Fantasy",  buyPrice:150,  value:60,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#E8D89C";ctx.beginPath();ctx.moveTo(0,-54);ctx.lineTo(4,-24);ctx.lineTo(6,-8);ctx.lineTo(-6,-8);ctx.lineTo(-4,-24);ctx.closePath();ctx.fill();ctx.fillStyle="#B09040";ctx.beginPath();ctx.roundRect(-4,-8,8,9,1);ctx.fill();ctx.fillStyle="#5C3810";ctx.beginPath();ctx.roundRect(-3,1,6,20,3);ctx.fill();ctx.restore(); }},

  // ── NEON (2) ───────────────────────────────────────────────────────────────
  { id:"k_neonpink",name:"Neon Slash",    rarity:"rare",      cat:"Neon",     buyPrice:150,  value:60,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#1E1E1C";ctx.beginPath();ctx.moveTo(0,-54);ctx.lineTo(3,-18);ctx.lineTo(3,2);ctx.lineTo(-3,2);ctx.lineTo(-3,-18);ctx.closePath();ctx.fill();const g=ctx.createLinearGradient(0,-54,0,2);g.addColorStop(0,"#FF4499");g.addColorStop(1,"rgba(255,68,153,0)");ctx.strokeStyle=g;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(0,0);ctx.stroke();ctx.strokeStyle=`rgba(255,68,153,${0.3+0.3*Math.sin(t*0.005)})`;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(0,0);ctx.stroke();ctx.fillStyle="#1E1E1C";ctx.beginPath();ctx.roundRect(-3,2,6,20,2);ctx.fill();ctx.restore(); }},
  { id:"k_neoncyan",name:"Cyan Circuit",  rarity:"epic",      cat:"Neon",     buyPrice:400,  value:160,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#181818";ctx.beginPath();ctx.moveTo(0,-56);ctx.lineTo(4,-22);ctx.lineTo(4,2);ctx.lineTo(-4,2);ctx.lineTo(-4,-22);ctx.closePath();ctx.fill();const p=0.5+0.4*Math.sin(t*0.005);ctx.strokeStyle=`rgba(64,220,180,${p})`;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-54);ctx.lineTo(0,0);ctx.stroke();ctx.strokeStyle="#40DCB4";ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,-54);ctx.lineTo(0,0);ctx.stroke();ctx.fillStyle="#022C22";ctx.beginPath();ctx.roundRect(-3,2,6,20,2);ctx.fill();ctx.restore(); }},

  // ── ELEMENTAL (2) ──────────────────────────────────────────────────────────
  { id:"k_inferno",name:"Inferno Fang",   rarity:"epic",      cat:"Elemental",buyPrice:400,  value:160,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);const fl=Math.sin(t*0.008)*2;ctx.fillStyle="#C04420";ctx.beginPath();ctx.moveTo(0,-54+fl);ctx.lineTo(5,-20);ctx.lineTo(5,2);ctx.lineTo(-5,2);ctx.lineTo(-5,-20);ctx.closePath();ctx.fill();ctx.fillStyle="#E8901C";ctx.beginPath();ctx.moveTo(0,-50+fl);ctx.lineTo(3,-26);ctx.lineTo(-3,-26);ctx.closePath();ctx.fill();ctx.fillStyle="#601808";ctx.beginPath();ctx.roundRect(-4,2,8,22,3);ctx.fill();ctx.restore(); }},
  { id:"k_glacier",name:"Glacier Spike",  rarity:"epic",      cat:"Elemental",buyPrice:400,  value:160,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#78AADC";ctx.beginPath();ctx.moveTo(0,-58);ctx.lineTo(4,-28);ctx.lineTo(6,-8);ctx.lineTo(-6,-8);ctx.lineTo(-4,-28);ctx.closePath();ctx.fill();ctx.strokeStyle=`rgba(180,220,255,${0.4+0.3*Math.sin(t*0.004)})`;ctx.lineWidth=2;[-46,-34,-22].forEach(yy=>{ctx.beginPath();ctx.moveTo(-5,yy);ctx.lineTo(5,yy+4);ctx.stroke();});ctx.fillStyle="#1A4080";ctx.beginPath();ctx.roundRect(-3,0,6,22,3);ctx.fill();ctx.restore(); }},

  // ── GOLD / DIAMOND (2) ────────────────────────────────────────────────────
  { id:"k_goldleaf",name:"Gold Leaf",     rarity:"legendary", cat:"Gold",     buyPrice:1200, value:480,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#C89B3C";ctx.beginPath();ctx.moveTo(0,-58);ctx.lineTo(4,-22);ctx.lineTo(4,2);ctx.lineTo(-4,2);ctx.lineTo(-4,-22);ctx.closePath();ctx.fill();const s=0.5+0.4*Math.sin(t*0.005);ctx.strokeStyle=`rgba(255,220,120,${s})`;ctx.lineWidth=2;[{x:-3,y:-46},{x:3,y:-32},{x:-3,y:-20}].forEach(p=>{ctx.beginPath();ctx.moveTo(p.x-3,p.y);ctx.lineTo(p.x+3,p.y+6);ctx.stroke();});ctx.fillStyle="#6A4A10";ctx.beginPath();ctx.roundRect(-4,2,8,9,2);ctx.fill();ctx.fillStyle="#C89B3C";ctx.beginPath();ctx.roundRect(-3,11,6,14,3);ctx.fill();ctx.restore(); }},
  { id:"k_diamond", name:"Diamond Edge",  rarity:"legendary", cat:"Diamond",  buyPrice:1200, value:480,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#78AADC";ctx.beginPath();ctx.moveTo(0,-60);ctx.lineTo(5,-30);ctx.lineTo(5,-4);ctx.lineTo(-5,-4);ctx.lineTo(-5,-30);ctx.closePath();ctx.fill();ctx.fillStyle="#D8EEFF";ctx.beginPath();ctx.moveTo(0,-56);ctx.lineTo(3,-40);ctx.lineTo(0,-36);ctx.lineTo(-3,-40);ctx.closePath();ctx.fill();const s=`rgba(200,230,255,${0.5+0.4*Math.sin(t*0.006)})`;ctx.strokeStyle=s;ctx.lineWidth=1.5;[[-4,-24],[-4,-14]].forEach(([px,py])=>{ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(-px,py+4);ctx.stroke();});ctx.fillStyle="#0A3060";ctx.beginPath();ctx.roundRect(-3,4,6,20,3);ctx.fill();ctx.restore(); }},

  // ── MYTHIC (3) ────────────────────────────────────────────────────────────
  { id:"k_plasma",  name:"Plasma Shift",  rarity:"mythic",    cat:"Animated", buyPrice:3000, value:1200,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);const h=(t*0.25)%360;ctx.fillStyle=`hsl(${h},80%,52%)`;ctx.beginPath();ctx.moveTo(0,-58);ctx.lineTo(4,-22);ctx.lineTo(4,2);ctx.lineTo(-4,2);ctx.lineTo(-4,-22);ctx.closePath();ctx.fill();ctx.strokeStyle=`hsla(${(h+80)%360},90%,72%,0.7)`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-56);ctx.lineTo(0,0);ctx.stroke();ctx.fillStyle="#181818";ctx.beginPath();ctx.roundRect(-3,2,6,20,2);ctx.fill();ctx.restore(); }},
  { id:"k_void",    name:"Void Reaper",   rarity:"mythic",    cat:"Animated", buyPrice:3000, value:1200,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#0E0A1E";ctx.beginPath();ctx.moveTo(0,-60);ctx.lineTo(5,-26);ctx.lineTo(5,2);ctx.lineTo(-5,2);ctx.lineTo(-5,-26);ctx.closePath();ctx.fill();for(let i=0;i<6;i++){const py=-54+i*10,px=2.5*Math.sin(t*0.006+i*1.1);ctx.fillStyle=`rgba(160,140,240,${0.2+0.15*Math.sin(t*0.004+i)})`;ctx.beginPath();ctx.arc(px,py,1.8,0,Math.PI*2);ctx.fill();}ctx.strokeStyle=`rgba(140,120,220,${0.3+0.2*Math.sin(t*0.005)})`;ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(5,0);ctx.stroke();ctx.fillStyle="#1A1040";ctx.beginPath();ctx.roundRect(-3,2,6,20,3);ctx.fill();ctx.restore(); }},
  { id:"k_sovereign",name:"The Sovereign",rarity:"mythic",   cat:"Limited",  buyPrice:3000, value:1200,
    draw(ctx,x,y,a,t,sc=1){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(a);ctx.fillStyle="#CC3366";ctx.beginPath();ctx.moveTo(0,-62);ctx.bezierCurveTo(6,-42,6,-20,5,2);ctx.lineTo(-5,2);ctx.bezierCurveTo(-6,-20,-6,-42,0,-62);ctx.fill();const s=0.5+0.4*Math.abs(Math.sin(t*0.005));ctx.strokeStyle=`rgba(255,180,210,${s})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-58);ctx.lineTo(0,-2);ctx.stroke();ctx.fillStyle="#FFB0D0";ctx.beginPath();ctx.moveTo(-6,-28);ctx.lineTo(-12,-22);ctx.lineTo(-6,-16);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(6,-28);ctx.lineTo(12,-22);ctx.lineTo(6,-16);ctx.closePath();ctx.fill();ctx.fillStyle="#440E22";ctx.beginPath();ctx.roundRect(-3,2,6,20,3);ctx.fill();ctx.restore(); }},
];


// ─── CRATES ───────────────────────────────────────────────────────────────────
const CRATES = [
  { id:"c_standard", name:"Standard Case",  price:75,  icon:"📦",
    weights:{ common:0.60, uncommon:0.30, rare:0.09, epic:0.01, legendary:0, mythic:0 }},
  { id:"c_pro",      name:"Pro Case",        price:200, icon:"🗃️",
    weights:{ common:0.15, uncommon:0.28, rare:0.32, epic:0.18, legendary:0.065, mythic:0.005 }},
  { id:"c_elite",    name:"Elite Vault",     price:600, icon:"🔮",
    weights:{ common:0, uncommon:0.04, rare:0.15, epic:0.36, legendary:0.38, mythic:0.07 }},
];

// ─── MAPS / ARENAS ────────────────────────────────────────────────────────────
// Five arenas, each more elaborate than the last. Unlocked by best score.
// Each has: speedMod (log spin multiplier), unlockScore, and drawBackground(ctx,W,H,t,CX,LOG_CY).
// Difficulty and visual complexity both climb with tier.
const MAPS = [
  // ── TIER 1 — Practice Yard ──────────────────────────────────────────────
  { id:"yard", name:"Practice Yard", icon:"🪵", unlockScore:0, speedMod:1.00, coinRate:1,
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
      ctx.font="bold 9px 'Courier New',monospace"; ctx.fillStyle="#7A5E24"; ctx.textAlign="center";
      ctx.fillText("🪵 PRACTICE YARD",CX,17);
    }},

  // ── TIER 2 — Exhibition Hall ─────────────────────────────────────────────
  { id:"hall", name:"Exhibition Hall", icon:"🏛️", unlockScore:15, speedMod:1.12, coinRate:2,
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
      // Velvet rope swag
      ctx.strokeStyle="#7A1818"; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(36,H-60); ctx.bezierCurveTo(CX,H-76,CX,H-76,W-44,H-60); ctx.stroke();
      ctx.fillStyle="#5A1010";
      [36,W-44].forEach(px=>{ctx.beginPath();ctx.arc(px,H-64,5,0,Math.PI*2);ctx.fill();});
      // Spotlights
      [[CX*0.5,"rgba(255,240,210,0.07)"],[CX,"rgba(200,210,255,0.06)"],[CX*1.5,"rgba(255,240,210,0.07)"]].forEach(([sx,col])=>{
        const sp=ctx.createRadialGradient(sx,0,0,sx,0,160);
        sp.addColorStop(0,col); sp.addColorStop(1,"transparent");
        ctx.fillStyle=sp; ctx.fillRect(0,0,W,H);
      });
      // Header banner
      ctx.fillStyle="rgba(80,60,160,0.7)"; ctx.fillRect(0,0,W,27);
      ctx.fillStyle="rgba(255,255,255,0.8)"; ctx.font="bold 9px sans-serif"; ctx.textAlign="center";
      ctx.fillText("🏛️ EXHIBITION HALL",CX,18);
    }},

  // ── TIER 3 — Neon District ────────────────────────────────────────────────
  { id:"neon", name:"Neon District", icon:"🌆", unlockScore:35, speedMod:1.26, coinRate:3,
    blurb:"Rooftop throws under a buzzing skyline. Faster. Louder. Brighter.",
    drawBackground(ctx,W,H,t,CX,CY){
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,"#05030C"); g.addColorStop(0.6,"#0A0518"); g.addColorStop(1,"#150A28");
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      // Distant skyline silhouettes
      const buildings=[[0,60,0.5],[40,90,0.7],[85,70,0.4],[130,110,0.6],[175,80,0.5],[220,100,0.65],[265,65,0.45]];
      buildings.forEach(([bx,bh,op])=>{
        ctx.fillStyle=`rgba(20,12,40,${op})`;
        ctx.fillRect(bx,H-160-bh,40,bh+110);
        // lit windows
        for(let wy=H-150-bh;wy<H-60;wy+=11){
          for(let wx=bx+4;wx<bx+36;wx+=9){
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
      for(let [sx,col,label] of [[20,"#FF2890","蜉"],[W-32,"#3CDCFF","乙"]]){
        const p=0.5+0.4*Math.sin(t*0.005+sx);
        ctx.strokeStyle=`rgba(${col==="#FF2890"?"255,40,144":"60,220,255"},${p})`;
        ctx.lineWidth=1.5; ctx.strokeRect(sx,H-210,16,60);
        ctx.fillStyle=col; ctx.globalAlpha=p; ctx.font="bold 12px sans-serif"; ctx.textAlign="center";
        ctx.fillText(label,sx+8,H-175); ctx.globalAlpha=1;
      }
      // Drifting particles (city dust / sparks)
      for(let i=0;i<10;i++){
        const px=(i*53+t*0.02)%W, py=((i*97)%(H-60));
        ctx.fillStyle=`rgba(180,160,255,${0.15+0.15*Math.sin(t*0.003+i)})`;
        ctx.beginPath(); ctx.arc(px,py,1,0,Math.PI*2); ctx.fill();
      }
      // Header
      ctx.fillStyle="rgba(10,5,20,0.85)"; ctx.fillRect(0,0,W,27);
      ctx.strokeStyle=`rgba(255,40,160,${rimPulse})`; ctx.lineWidth=0.6; ctx.beginPath(); ctx.moveTo(0,27); ctx.lineTo(W,27); ctx.stroke();
      ctx.fillStyle=`rgba(80,220,255,${0.7+0.3*Math.sin(t*0.006)})`; ctx.font="bold 9px 'Courier New',monospace"; ctx.textAlign="center";
      ctx.fillText("🌆 NEON DISTRICT",CX,18);
    }},

  // ── TIER 4 — Volcanic Forge ───────────────────────────────────────────────
  { id:"forge", name:"Volcanic Forge", icon:"🌋", unlockScore:60, speedMod:1.42, coinRate:4,
    blurb:"Molten light, hammering heat. Only steady hands survive here.",
    drawBackground(ctx,W,H,t,CX,CY){
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,"#1A0805"); g.addColorStop(0.5,"#2A0E08"); g.addColorStop(1,"#180400");
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      // Distant volcano silhouette glowing at the peak
      ctx.fillStyle="#0E0402";
      ctx.beginPath(); ctx.moveTo(CX-90,H-180); ctx.lineTo(CX-10,H-280); ctx.lineTo(CX+10,H-280); ctx.lineTo(CX+90,H-180); ctx.closePath(); ctx.fill();
      const lavaGlow=0.5+0.4*Math.sin(t*0.004);
      ctx.fillStyle=`rgba(255,110,30,${lavaGlow})`;
      ctx.beginPath(); ctx.ellipse(CX,H-280,10,5,0,0,Math.PI*2); ctx.fill();
      // Rock floor with cracks
      ctx.fillStyle="#1C0C08"; ctx.fillRect(0,H-50,W,50);
      ctx.strokeStyle="#341208"; ctx.lineWidth=1;
      for(let x=0;x<W;x+=27){ctx.beginPath();ctx.moveTo(x,H-50);ctx.lineTo(x+6,H);ctx.stroke();}
      // Glowing lava cracks running through floor
      for(let i=0;i<3;i++){
        const lx=40+i*(W-80)/2, p=0.4+0.4*Math.sin(t*0.005+i*2);
        ctx.strokeStyle=`rgba(255,${100+i*20},30,${p})`; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(lx,H-50); ctx.lineTo(lx+10,H-25); ctx.lineTo(lx-6,H); ctx.stroke();
      }
      // Two forge braziers flanking, with flickering flame
      for(let bx of [22,W-30]){
        ctx.fillStyle="#241008"; ctx.beginPath(); ctx.roundRect(bx,H-90,16,40,2); ctx.fill();
        const fl=Math.sin(t*0.012+bx)*3;
        ctx.fillStyle=`rgba(255,${140+Math.sin(t*0.01)*40},40,0.9)`;
        ctx.beginPath();
        ctx.moveTo(bx+2,H-90); ctx.quadraticCurveTo(bx+8+fl,H-115,bx+8,H-130);
        ctx.quadraticCurveTo(bx+8-fl,H-115,bx+14,H-90); ctx.closePath(); ctx.fill();
        const glow=ctx.createRadialGradient(bx+8,H-105,0,bx+8,H-105,50);
        glow.addColorStop(0,"rgba(255,140,40,0.2)"); glow.addColorStop(1,"transparent");
        ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);
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
      ctx.fillStyle=`rgba(255,150,60,${0.7+0.3*lavaGlow})`; ctx.font="bold 9px 'Courier New',monospace"; ctx.textAlign="center";
      ctx.fillText("🌋 VOLCANIC FORGE",CX,18);
    }},

  // ── TIER 5 — Celestial Arena ─────────────────────────────────────────────
  { id:"celestial", name:"Celestial Arena", icon:"🌌", unlockScore:100, speedMod:1.60, coinRate:5,
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
      // Floating gold rings around the arena, slowly orbiting
      for(let i=0;i<2;i++){
        const orbA=t*0.0006+i*Math.PI;
        const ox=CX+Math.cos(orbA)*120, oy=H-160+Math.sin(orbA)*18;
        ctx.strokeStyle=`rgba(232,200,120,${0.35+0.25*Math.sin(t*0.004+i)})`;
        ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.ellipse(ox,oy,14,5,0,0,Math.PI*2); ctx.stroke();
      }
      // Twin golden pillars with crystal tops
      for(let px of [10,W-22]){
        ctx.fillStyle="#3A2A10"; ctx.fillRect(px,H-240,14,240);
        ctx.fillStyle="#E8C878"; ctx.fillRect(px-3,H-244,20,5);
        const crystalPulse=0.5+0.4*Math.sin(t*0.005+px);
        ctx.fillStyle=`rgba(180,220,255,${crystalPulse})`;
        ctx.beginPath(); ctx.moveTo(px+7,H-264); ctx.lineTo(px+13,H-246); ctx.lineTo(px+1,H-246); ctx.closePath(); ctx.fill();
        const glow=ctx.createRadialGradient(px+7,H-255,0,px+7,H-255,30);
        glow.addColorStop(0,`rgba(180,220,255,${crystalPulse*0.3})`); glow.addColorStop(1,"transparent");
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
      ctx.fillStyle=`rgba(232,200,120,${0.75+0.25*headerGlow})`; ctx.font="bold 9px 'Courier New',monospace"; ctx.textAlign="center";
      ctx.fillText("🌌 CELESTIAL ARENA",CX,18);
    }},
];

// ─── LEADERBOARD SEED ────────────────────────────────────────────────────────
const SEED_BOARD = [
  { name:"PHANTOM",  score:9840 },
  { name:"SLAYER",   score:7320 },
  { name:"REAPER",   score:5510 },
  { name:"VORTEX",   score:3880 },
  { name:"ECLIPSE",  score:2640 },
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
function KnifePreview({ id, size = 60, spin = false }) {
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
      knife.draw(ctx, W / 2, H / 2 + 12, aRef.current, Date.now() - t0.current);
      if (animating) raf.current = requestAnimationFrame(frame);
    }
    frame();
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [id, spin]);
  return <canvas ref={ref} width={size} height={size + 24} style={{ display: "block" }} />;
}

// ─── GAME CANVAS ─────────────────────────────────────────────────────────────
function GameCanvas({ equippedId, mapId, onEnd, onCoins }) {
  const ref = useRef(null), s = useRef(null), snd = useSound();
  useEffect(() => {
    const canvas = ref.current, ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const CX = W / 2, LOG_CY = 185, LOG_R = 100, LAUNCH_Y = H - 52;
    const COLL = 12 * Math.PI / 180;            // 12° collision threshold
    const APPLE_R = LOG_R + 26;                  // apple floats outside the log surface
    const APPLE_HIT_RADIUS = 24;                  // generous pixel hit-radius around the apple (bigger = easier to hit)
    const knife = KNIVES.find(k => k.id === equippedId) || KNIVES[0];
    const map   = MAPS.find(m => m.id === mapId) || MAPS[0];
    const t0 = Date.now();

    s.current = {
      ang: 0, spd: 0.020 * map.speedMod, score: 0, level: 1,
      left: 7, stuck: [], over: false,
      phase: "idle", flying: null, flash: 0,
      particles: [],      // wood-chip burst on impact
      shakeT: 0,           // remaining screen-shake frames
      shakeMag: 0,          // current shake magnitude (decays)
      impactPt: null,        // {x,y,angle} world-space point of last impact, for flash + chip spawn
      apple: null,           // { local, bornAt } — bonus apple stuck to the spinning log, or null
      appleBurst: 0,         // gold sparkle burst counter when apple is hit
      appleBurstPt: null,    // world {x,y} where the burst sparkles render
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
      gs.apple = { local, bornAt: Date.now() };
    }

    function norm(a) { while (a > Math.PI) a -= 2*Math.PI; while (a < -Math.PI) a += 2*Math.PI; return a; }
    function adist(a, b) { let d = Math.abs(norm(a-b)); return d > Math.PI ? 2*Math.PI - d : d; }

    function checkHit(ig) {
      const local = norm(ig - gs.ang);
      for (const sk of gs.stuck) if (adist(local, sk) < COLL) return { hit: true, local };
      return { hit: false, local };
    }

    function drawLog() {
      ctx.save(); ctx.translate(CX, LOG_CY); ctx.rotate(gs.ang);
      ctx.beginPath(); ctx.arc(0,0,LOG_R,0,Math.PI*2); ctx.fillStyle="#4A2E14"; ctx.fill();
      ctx.beginPath(); ctx.arc(0,0,LOG_R-4,0,Math.PI*2); ctx.fillStyle="#7A4E2A"; ctx.fill();
      ["#8A5E38","#6A421E","#956434","#5C3818","#9E6C42"].forEach((c,i)=>{
        ctx.beginPath(); ctx.arc(2,1,(LOG_R-10)*(1-i*0.17),0,Math.PI*2);
        ctx.strokeStyle=c; ctx.lineWidth=1.4; ctx.globalAlpha=0.7; ctx.stroke(); ctx.globalAlpha=1;
      });
      for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*10,Math.sin(a)*10);ctx.lineTo(Math.cos(a)*(LOG_R-5),Math.sin(a)*(LOG_R-5));ctx.strokeStyle="rgba(40,18,4,0.22)";ctx.lineWidth=0.8;ctx.stroke();}
      ctx.beginPath(); ctx.arc(0,0,7,0,Math.PI*2); ctx.fillStyle="#2A1008"; ctx.fill();
      ctx.restore();

      // ── DIRECTIONAL IMPACT FLASH ──────────────────────────────────────
      // Radiates outward from the exact hit point (world space, NOT rotated
      // with the log) so it reads as a strike, not a generic pulsing ring.
      if (gs.flash > 0 && gs.impactPt) {
        const p = gs.flash / 10;          // 1 -> 0 over ~10 frames
        const ix = CX + Math.cos(gs.impactPt.angle) * LOG_R;
        const iy = LOG_CY + Math.sin(gs.impactPt.angle) * LOG_R;

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

      for (let i=0; i<gs.stuck.length; i++) {
        const local = gs.stuck[i];
        const w   = local + gs.ang;

        // Anchor point sunk INTO the log, past the surface
        const tx  = CX + Math.cos(w) * (LOG_R + EMBED_DEPTH);
        const ty  = LOG_CY + Math.sin(w) * (LOG_R + EMBED_DEPTH);

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
        ctx.arc(CX, LOG_CY, VISIBLE_RADIUS, 0, Math.PI*2);
        ctx.clip("evenodd");

        knife.draw(ctx, tx, ty, w - Math.PI/2 + wobAngle, t, 1.18);

        ctx.restore();

        if (wob > 0) wobbles[i] = Math.max(0, wob - 0.045);
      }
    }

    function drawZones() {
      for (const local of gs.stuck) {
        const w = local + gs.ang;
        ctx.save(); ctx.translate(CX, LOG_CY);
        ctx.beginPath(); ctx.moveTo(0,0);
        ctx.arc(0,0,LOG_R+10,w-COLL,w+COLL); ctx.closePath();
        ctx.fillStyle = "rgba(180,40,40,0.09)"; ctx.fill();
        ctx.restore();
      }
    }

    // ── DRAW BONUS APPLE ────────────────────────────────────────────────────
    // Sits embedded on the log surface like a target, spinning with it.
    // Small glossy red apple + stem + leaf, with a soft pulsing glow so it
    // reads clearly as a bonus target against the wood.
    function drawApple(t) {
      if (gs.apple) {
        const w = gs.apple.local + gs.ang;
        const ax = CX + Math.cos(w) * APPLE_R;
        const ay = LOG_CY + Math.sin(w) * APPLE_R;
        const SC = 1.6;   // apple is bigger now — easier to see and to hit

        // Soft gold pulse glow behind the apple to draw the eye
        const pulse = 0.5 + 0.4*Math.sin(t*0.005);
        const glowR = 30 * SC * 0.7;
        const glow = ctx.createRadialGradient(ax,ay,0,ax,ay,glowR);
        glow.addColorStop(0, `rgba(255,210,80,${0.35*pulse})`);
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
        ctx.fillStyle = "#C23B2E";
        ctx.beginPath(); ctx.arc(-3,0,8,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(3,0,8,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(0,2,9,0,Math.PI*2); ctx.fill();

        // Glossy highlight
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath(); ctx.ellipse(-3,-3,2.6,3.6,0.4,0,Math.PI*2); ctx.fill();

        // Stem — points straight up, away from the log
        ctx.strokeStyle = "#5C3818"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(0,-7); ctx.lineTo(1,-12); ctx.stroke();

        // Leaf
        ctx.fillStyle = "#4A9460";
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
      if (gs.phase === "idle" && gs.left > 0 && !gs.over)
        knife.draw(ctx, CX, LAUNCH_Y - 8, 0, t, 1.18);
    }

    function drawHUD() {
      ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.roundRect(8,32,W-16,18,3); ctx.fill();
      ctx.font = "bold 10px 'Courier New', monospace"; ctx.fillStyle = "#C89B3C";
      ctx.textAlign = "left";  ctx.fillText(`SCORE ${gs.score}`, 16, 44);
      ctx.textAlign = "center"; ctx.fillStyle = "#8A8680"; ctx.fillText(`LV ${gs.level}`, CX, 44);
      ctx.textAlign = "right"; ctx.fillStyle = "#8A8680";
      ctx.fillText("▪".repeat(gs.left), W-12, 44);
    }

    function drawBg(t) {
      // Each map supplies its own fully illustrated background + header bar.
      map.drawBackground(ctx, W, H, t, CX, LOG_CY);
    }

    function frame() {
      if (gs.over) return;
      gs.ang += gs.spd;
      if (gs.phase === "flying" && gs.flying) {
        const f = gs.flying;
        f.y += f.vy; if (f.vy < -2) f.vy += 0.55;
        const dx = f.x - CX, dy = f.y - LOG_CY, dist = Math.sqrt(dx*dx+dy*dy);

        // ── APPLE CHECK — runs FIRST, at its own outward radius ───────────
        // The apple now floats just outside the log's edge, so the flying
        // knife reaches it slightly before it would reach the wood itself.
        // We check this independently of the log-collision distance below,
        // and skip the log-collision check entirely this frame if it hits.
        let appleConsumedThrow = false;
        if (gs.apple) {
          const appleWorld = norm(gs.apple.local + gs.ang);
          const ax = CX + Math.cos(appleWorld) * APPLE_R;
          const ay = LOG_CY + Math.sin(appleWorld) * APPLE_R;
          const adx = f.x - ax, ady = f.y - ay;
          const appleDist = Math.sqrt(adx*adx + ady*ady);
          if (appleDist <= APPLE_HIT_RADIUS) {
            appleConsumedThrow = true;
            gs.appleBurstPt = { x: ax, y: ay };
            gs.apple = null;
            gs.appleBurst = 14;
            gs.flying = null; gs.phase = "idle";
            gs.impactPt = { angle: appleWorld };
            spawnChips(appleWorld);
            triggerShake(3);
            snd.coin();
            if (onCoins) onCoins(10);
            releaseQueuedThrow();
          }
        }

        if (!appleConsumedThrow && dist <= LOG_R) {
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
              gs.level++; gs.spd = (0.020 + (gs.level-1)*0.007) * map.speedMod;
              if (gs.spd > 0.10 * map.speedMod) gs.spd = 0.10 * map.speedMod;
              gs.left = 7; gs.stuck = [];
              wobbles.length = 0;
              trySpawnApple();    // new level — chance for a fresh bonus apple
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

      drawBg(t); drawLog(); drawZones(); drawApple(t); drawStuck(t);
      updateAndDrawChips();
      if (gs.flying) knife.draw(ctx, gs.flying.x, gs.flying.y, 0, t, 1.18);
      drawLauncher(t); drawHUD();

      ctx.restore();

      if (gs.over) {
        ctx.fillStyle="rgba(0,0,0,0.6)"; ctx.fillRect(0,0,W,H);
        ctx.font="bold 20px 'Courier New',monospace"; ctx.fillStyle=C.text; ctx.textAlign="center";
        ctx.fillText("GAME OVER",CX,H/2-10);
        ctx.font="12px 'Courier New',monospace"; ctx.fillStyle=C.textMid;
        ctx.fillText(`Score: ${gs.score}  ·  Level: ${gs.level}`,CX,H/2+14);
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
    <canvas ref={ref} width={400} height={460}
      style={{ display:"block", cursor:"crosshair", borderRadius:8,
               border:`0.5px solid ${C.border}`, boxShadow:`0 0 40px rgba(200,155,60,0.06)`,
               maxWidth:"100%" }} />
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

        {/* Header */}
        <div style={{ fontWeight:700, fontSize:15, color:C.gold, marginBottom:2,
            letterSpacing:"0.08em", fontFamily:"'Courier New',monospace" }}>
          {crate.icon} {crate.name.toUpperCase()}
        </div>
        <div style={{ fontSize:11, color:C.textDim, marginBottom:16 }}>
          🪙 {crate.price} to open
        </div>

        {/* ── READY ── */}
        {phase === "ready" && (
          <>
            <div style={{ border:`0.5px solid ${C.border}`, borderRadius:8,
                padding:"10px 12px", marginBottom:16, textAlign:"left" }}>
              {Object.entries(crate.weights).filter(([,v])=>v>0).map(([rar,pct])=>(
                <div key={rar} style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:11, color:RARITIES[rar].color, fontWeight:600 }}>
                    {RARITIES[rar].label}
                  </span>
                  <span style={{ fontSize:11, color:C.textDim, fontFamily:"monospace" }}>
                    {pct < 0.01 ? `${(pct*100).toFixed(1)}%` : `${Math.round(pct*100)}%`}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
              <button onClick={handleOpen} style={BtnStyle(C.gold, C.goldDim)}>Open Case</button>
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
            {/* Glow ring behind knife */}
            <div style={{ position:"relative", display:"inline-block",
                margin:"4px auto 10px", padding:8,
                borderRadius:"50%",
                boxShadow:`0 0 48px ${rr?.glow}, 0 0 16px ${rr?.glow}` }}>
              <KnifePreview id={result.id} size={90} spin />
            </div>
            <div style={{ fontWeight:700, fontSize:20, color:C.text, marginBottom:6 }}>
              {result.name}
            </div>
            <div style={{ marginBottom:6 }}>
              <Badge rarity={result.rarity} />
            </div>
            <div style={{ fontSize:11, color:C.textDim, marginBottom:18 }}>
              {result.cat} · Sell value 🪙 {result.value}
            </div>
            <button
              onClick={() => onResult(result)}
              style={{
                ...BtnStyle(rr?.color, rr?.color),
                padding:"10px 32px", fontSize:13,
                boxShadow:`0 0 16px ${rr?.glow}`,
              }}>
              ✦ Collect
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
  const [screen, setScreen]       = useState("lobby");
  const [inspecting, setInspecting] = useState(null);
  const [openCase, setOpenCase]   = useState(null);
  const [toast, setToast]         = useState(null);
  const [catFilter, setCatFilter] = useState("All");
  const [gameKey, setGameKey]     = useState(0);
  const [soundOn, setSoundOn]     = useState(true);   // mirrors SOUND_MUTED
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

  // ── Game end ──
  function onGameEnd(score) {
    const playedMap = MAPS.find(m => m.id === save.activeMap) || MAPS[0];
    const rate = playedMap.coinRate ?? 5;   // Practice Yard pays 1🪙/hit, other maps default to 5🪙/hit
    const coins = score * rate;
    upd(p => {
      p.stats.score = Math.max(p.stats.score, score);
      p.stats.games++;
      p.stats.throws += score + 1;
      p.coins += coins;
      return p;
    });
    toast$(`Game over · +${coins} 🪙`, true);
    setGameKey(k => k + 1); // remount after short delay
  }

  // ── Bonus apple hit mid-game — instant coin reward, doesn't wait for game end ──
  function onAppleCoins(amount) {
    upd(p => { p.coins += amount; return p; });
    toast$(`🍎 Apple bonus! +${amount} 🪙`, true);
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
    snd.menu(); toast$(`${m.name} selected!`, true);
  }

  if (!save) return (
    <div style={{ background:C.bg, minHeight:600, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ color:C.textDim, fontFamily:"monospace", fontSize:13 }}>Loading…</span>
    </div>
  );

  const equippedKnife = KNIVES.find(k => k.id === save.equipped) || KNIVES[0];
  const activeMap = MAPS.find(m => m.id === save.activeMap) || MAPS[0];
  const cats = ["All", ...new Set(KNIVES.map(k=>k.cat))];

  // Leaderboard: merge seed + player if score > 0
  const board = [...SEED_BOARD];
  if (save.stats.score > 0) {
    board.push({ name: save.name, score: save.stats.score, isMe: true });
  }
  board.sort((a,b) => b.score - a.score);

  const NAV = [
    { id:"lobby",     label:"Lobby",    icon:"◈" },
    { id:"play",      label:"Play",     icon:"▶" },
    { id:"maps",      label:"Maps",     icon:"🗺" },
    { id:"inventory", label:"Knives",   icon:"⚔" },
    { id:"shop",      label:"Shop",     icon:"🏪" },
    { id:"cases",     label:"Cases",    icon:"◻" },
    { id:"board",     label:"Scores",   icon:"◆" },
    { id:"settings",  label:"Settings", icon:"⚙" },
  ];

  return (
    <div style={{ background:C.bg, minHeight:600, fontFamily:"system-ui,sans-serif", color:C.text, position:"relative" }}>

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

        {/* ══ LOBBY ══ */}
        {screen==="lobby" && (
          <div>
            {/* Hero: live spinning log + equipped knife */}
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <HeroDisplay equippedKnife={equippedKnife} />
              <div style={{ marginTop:8 }}>
                <span style={{ fontWeight:700, fontSize:14, color:C.text }}>{equippedKnife.name}</span>
                <span style={{ marginLeft:8 }}><Badge rarity={equippedKnife.rarity} /></span>
              </div>
              <div style={{ fontSize:11, color:C.textDim, marginTop:2 }}>
                {equippedKnife.cat} · 🪙{equippedKnife.value} sell value
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
              {[["BEST SCORE",save.stats.score],["GAMES PLAYED",save.stats.games],["KNIVES OWNED",save.inventory.length]].map(([l,v])=>(
                <div key={l} style={{ background:C.surface, border:`0.5px solid ${C.border}`,
                    borderRadius:6, padding:"10px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:8, color:C.textDim, fontFamily:"monospace",
                      letterSpacing:"0.08em", marginBottom:4 }}>{l}</div>
                  <div style={{ fontWeight:700, fontSize:20, color:C.gold,
                      fontFamily:"'Courier New',monospace" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <SectionHead>QUICK ACTIONS</SectionHead>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
              <ActionCard icon="▶" label="Throw knives" sub={`Earn ${activeMap.coinRate ?? 5}🪙 per hit`}
                onClick={()=>setScreen("play")} accent={C.gold} />
              <ActionCard icon={activeMap.icon} label={activeMap.name} sub="Tap to change arena"
                onClick={()=>setScreen("maps")} accent="#CC4488" />
              <ActionCard icon="◻" label="Open a case" sub="Random knife inside"
                onClick={()=>setScreen("cases")} accent="#7B5FCC" />
              <ActionCard icon="🏪" label="Buy knives" sub={`${KNIVES.length} skins available`}
                onClick={()=>setScreen("shop")} accent={C.green} />
              <ActionCard icon="◆" label="Leaderboard" sub="Top 10 scores"
                onClick={()=>setScreen("board")} accent="#3A7EC0" />
            </div>

            {/* Rarity table */}
            <SectionHead>DROP CHANCE TABLE</SectionHead>
            <div style={{ border:`0.5px solid ${C.border}`, borderRadius:8, overflow:"hidden", marginBottom:4 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", background:C.surface,
                  padding:"6px 12px", borderBottom:`0.5px solid ${C.border}` }}>
                {["RARITY","CHANCE","SELL VALUE"].map(h=>(
                  <span key={h} style={{ fontSize:9, color:C.textDim, fontFamily:"monospace",
                      letterSpacing:"0.06em", fontWeight:700 }}>{h}</span>
                ))}
              </div>
              {Object.entries(RARITIES).map(([key,r])=>{
                const eg = KNIVES.find(k=>k.rarity===key);
                return (
                  <div key={key} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
                      padding:"7px 12px", borderBottom:`0.5px solid ${C.border}`,
                      background:"transparent" }}>
                    <span style={{ fontSize:11, color:r.color, fontWeight:600 }}>{r.label}</span>
                    <span style={{ fontSize:11, color:C.textMid, fontFamily:"monospace" }}>
                      {r.drop<0.01?`${(r.drop*100).toFixed(1)}%`:`${r.drop*100}%`}
                    </span>
                    <span style={{ fontSize:11, color:C.textDim, fontFamily:"monospace" }}>
                      {eg ? `🪙${eg.value}` : "–"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ PLAY ══ */}
        {screen==="play" && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:2 }}>
              <div style={{ fontSize:10, color:C.textDim, fontFamily:"monospace", letterSpacing:"0.06em" }}>
                ⚔ <span style={{ color:C.gold }}>{equippedKnife.name}</span>
              </div>
              <div style={{ fontSize:10, color:C.textDim, fontFamily:"monospace", letterSpacing:"0.06em" }}>
                {activeMap.icon} <span style={{ color:C.gold }}>{activeMap.name}</span>
                &nbsp;·&nbsp;×{activeMap.speedMod.toFixed(2)} speed
              </div>
            </div>
            <GameCanvas equippedId={save.equipped} mapId={save.activeMap} onEnd={onGameEnd} onCoins={onAppleCoins} key={gameKey + save.activeMap} />
            <div style={{ fontSize:10, color:C.textDim, fontFamily:"monospace" }}>
              CLICK · SPACE · TAP to throw &nbsp;·&nbsp; {activeMap.coinRate ?? 5} 🪙 PER HIT
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>setGameKey(k=>k+1)} style={BtnStyle()}>New Game</button>
              <button onClick={()=>setScreen("maps")} style={BtnStyle(C.gold,C.goldDim)}>Change Map</button>
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
                          {m.coinRate ?? 5} 🪙/HIT
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
            <div style={{ marginTop:14, textAlign:"center" }}>
              <button onClick={()=>setScreen("play")} style={BtnStyle(C.gold,C.goldDim)}>▶ Play Now</button>
            </div>
          </div>
        )}

        {/* ══ INVENTORY ══ */}
        {screen==="inventory" && (
          <div>
            <SectionHead>YOUR COLLECTION — {save.inventory.length}/{KNIVES.length} KNIVES</SectionHead>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12 }}>
              {cats.map(c=>(
                <button key={c} onClick={()=>setCatFilter(c)} style={{
                    padding:"3px 10px", borderRadius:4, fontSize:10, fontWeight:700, cursor:"pointer",
                    fontFamily:"monospace", letterSpacing:"0.05em",
                    background: catFilter===c ? C.gold+"22" : "transparent",
                    border:`0.5px solid ${catFilter===c?C.gold:C.border}`,
                    color: catFilter===c ? C.gold : C.textDim,
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
                (catFilter==="All"||k.cat===catFilter)).map(k=>(
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
                    <button onClick={()=>setInspecting(k)} style={{
                        padding:"4px 6px", fontSize:9, borderRadius:3, cursor:"pointer",
                        background:"transparent", border:`0.5px solid ${C.border}`,
                        color:C.textDim, fontFamily:"monospace",
                    }}>👁</button>
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
              {cats.map(c=>(
                <button key={c} onClick={()=>setCatFilter(c)} style={{
                    padding:"3px 10px", borderRadius:4, fontSize:10, fontWeight:700, cursor:"pointer",
                    fontFamily:"monospace", letterSpacing:"0.05em",
                    background: catFilter===c ? C.gold+"22" : "transparent",
                    border:`0.5px solid ${catFilter===c?C.gold:C.border}`,
                    color: catFilter===c ? C.gold : C.textDim,
                }}>{c.toUpperCase()}</button>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))", gap:8 }}>
              {KNIVES.filter(k=> catFilter==="All"||k.cat===catFilter).map(k=>{
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
                    <button onClick={()=>{ if(!owned){setInspecting(k);} }} style={{
                        width:"100%", marginBottom:4, padding:"3px 0", fontSize:9, borderRadius:3,
                        cursor:"pointer", fontFamily:"monospace", fontWeight:700,
                        background:"transparent", border:`0.5px solid ${C.border}`, color:C.textDim,
                    }}>INSPECT 👁</button>
                    <button onClick={()=>buyKnife(k)} disabled={owned||!canBuy} style={{
                        width:"100%", padding:"4px 0", fontSize:9, borderRadius:3, fontWeight:700,
                        fontFamily:"monospace", cursor:owned?"default":canBuy?"pointer":"not-allowed",
                        background: owned?"transparent":canBuy?C.green+"22":"transparent",
                        border:`0.5px solid ${owned?C.border:canBuy?C.green:C.border}`,
                        color: owned?C.textDim:canBuy?"#88DDAA":C.textDim,
                    }}>{owned?"OWNED":canBuy?"BUY":"LOW 🪙"}</button>
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
                    padding:"16px 14px", background:C.surface }}>
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
                      fontWeight:700, letterSpacing:"0.08em" }}>{h}</span>
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
                        color:C.textMid, fontWeight:700, textAlign:"right" }}>
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

// ─── HERO DISPLAY ─────────────────────────────────────────────────────────────
// Animated lobby showpiece: spinning log with the equipped knife stuck in it.
function HeroDisplay({ equippedKnife }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const CX = W/2, CY = H/2, R = 58;
    let ang = 0, raf;
    const t0 = Date.now();
    // Fixed local angles for display knives
    const displayAngles = [0, Math.PI*0.45, Math.PI*0.9, Math.PI*1.35, Math.PI*1.8];
    function frame() {
      ang += 0.008;
      ctx.clearRect(0,0,W,H);
      // Ambient glow
      const glow = ctx.createRadialGradient(CX,CY,0,CX,CY,90);
      glow.addColorStop(0, "rgba(200,155,60,0.08)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow; ctx.fillRect(0,0,W,H);
      // Log
      ctx.save(); ctx.translate(CX,CY); ctx.rotate(ang);
      ctx.beginPath(); ctx.arc(0,0,R,0,Math.PI*2); ctx.fillStyle="#4A2E14"; ctx.fill();
      ctx.beginPath(); ctx.arc(0,0,R-3,0,Math.PI*2); ctx.fillStyle="#7A4E2A"; ctx.fill();
      ["#8A5E38","#6A421E","#956434","#5C3818"].forEach((c,i)=>{
        ctx.beginPath(); ctx.arc(1,1,(R-8)*(1-i*0.22),0,Math.PI*2);
        ctx.strokeStyle=c; ctx.lineWidth=1.2; ctx.globalAlpha=0.65; ctx.stroke(); ctx.globalAlpha=1;
      });
      ctx.beginPath(); ctx.arc(0,0,6,0,Math.PI*2); ctx.fillStyle="#2A1008"; ctx.fill();
      ctx.restore();
      // Stuck knives — clipped so blade hides inside log, only handle shows outside
      const t = Date.now()-t0;
      displayAngles.forEach(local => {
        const world = local + ang;
        const tx = CX + Math.cos(world) * R;
        const ty = CY + Math.sin(world) * R;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W, H);
        ctx.arc(CX, CY, R - 2, 0, Math.PI*2);
        ctx.clip("evenodd");
        equippedKnife.draw(ctx, tx, ty, world - Math.PI/2, t, 1.18);
        ctx.restore();
      });
      raf = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(raf);
  }, [equippedKnife.id]);
  return <canvas ref={ref} width={200} height={200} style={{ display:"block", margin:"0 auto" }} />;
}

// ─── ACTION CARD ──────────────────────────────────────────────────────────────
function ActionCard({ icon, label, sub, onClick, accent }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        border:`0.5px solid ${hover?accent:C.border}`,
        borderRadius:8, padding:"12px 14px", cursor:"pointer",
        background: hover ? accent+"0E" : C.surface,
        transition:"border 0.15s, background 0.15s",
        display:"flex", alignItems:"center", gap:10,
      }}>
      <span style={{ fontSize:22, minWidth:26 }}>{icon}</span>
      <div>
        <div style={{ fontWeight:700, fontSize:12, color:hover?accent:C.text,
            fontFamily:"'Courier New',monospace", letterSpacing:"0.04em" }}>{label}</div>
        <div style={{ fontSize:10, color:C.textDim, marginTop:2 }}>{sub}</div>
      </div>
    </div>
  );
}
