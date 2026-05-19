const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function deriveVisualRig(taxonomy = {}, phenotype = {}, motionState = {}) {
  const phylum = taxonomy.phylum || 'draco';
  const height = clamp(phenotype.height ?? 60, 0, 100);
  const bulk = clamp(phenotype.bulk ?? 55, 0, 100);
  const agility = clamp(phenotype.agility ?? 45, 0, 100);
  const terror = clamp(phenotype.terror ?? 55, 0, 100);
  const cute = clamp(phenotype.cute ?? 30, 0, 100);
  const armor = clamp(phenotype.armor ?? 45, 0, 100);
  const scale = 0.78 + height / 180 + bulk / 360;

  const base = {
    phylum,
    scale,
    torso: { w: 88 + bulk * 0.6, h: 112 + height * 0.82 },
    head: { w: 58 + cute * 0.14 + terror * 0.22, h: 42 + cute * 0.12 + terror * 0.12 },
    neck: { length: 22 + height * 0.18, thickness: 16 + bulk * 0.18 },
    tail: { length: 80 + height * 0.55, thickness: 12 + bulk * 0.18 },
    leg: { length: 64 + height * 0.35, stride: 16 + agility * 0.28 },
    arm: { length: 52 + height * 0.24, reach: 22 + terror * 0.18 },
    armor: { plates: Math.round(3 + armor / 18), spike: 6 + terror * 0.12 },
    eye: { radius: 7 + cute * 0.04, glow: terror > 65 ? 1 : 0.7 },
    palette: paletteFor(phylum, phenotype)
  };

  if (phylum === 'abyssal' || phylum === 'kraken') {
    base.tentacles = Math.round(4 + clamp(phenotype.tentacles ?? 60, 0, 100) / 14);
    base.torso.w *= 0.92;
    base.tail.length *= 0.35;
  }
  if (phylum === 'colossus' || phylum === 'golem') {
    base.torso.w *= 1.22;
    base.torso.h *= 1.08;
    base.leg.length *= 0.82;
    base.armor.plates += 3;
  }
  if (phylum === 'avian') {
    base.wings = { span: 90 + clamp(phenotype.wings ?? 70, 0, 100), feathers: 7 };
    base.torso.w *= 0.86;
    base.leg.length *= 1.1;
  }
  if (phylum === 'specter') {
    base.opacity = 0.82;
    base.tail.length *= 1.18;
  }

  const pose = motionState.pose || {};
  base.pose = {
    bob: pose.bob || 0,
    sway: pose.sway || 0,
    scale: pose.scale || 1,
    breath: Math.sin((motionState.time || 0) * 2.1) * 2
  };
  return base;
}

function paletteFor(phylum, phenotype) {
  const palettes = {
    draco: ['#123b1f', '#39ff14', '#ffd76b', '#07120a'],
    infernal: ['#4a1208', '#ff6b35', '#ffd76b', '#160603'],
    abyssal: ['#120a36', '#00d4ff', '#8efcff', '#050411'],
    kraken: ['#120a36', '#00d4ff', '#8efcff', '#050411'],
    colossus: ['#303030', '#9ca3af', '#ff4f7a', '#101010'],
    golem: ['#303030', '#9ca3af', '#ff4f7a', '#101010'],
    avian: ['#312309', '#ffd76b', '#00d4ff', '#100b03'],
    mecha: ['#0c1726', '#94a3b8', '#00ffff', '#030812'],
    specter: ['#161339', '#9b59ff', '#ff4f7a', '#060411'],
    plushfiend: ['#2a1025', '#ff8bd6', '#ffd76b', '#120610']
  };
  const base = palettes[phylum] || palettes.draco;
  return {
    body: base[0],
    belly: base[1],
    eye: base[2],
    shadow: base[3],
    highlight: phenotype.glow > 60 ? base[2] : base[1]
  };
}

export function drawHighResKaiju(ctx, motionState, taxonomy, phenotype) {
  const rig = deriveVisualRig(taxonomy, phenotype, motionState);
  const x = motionState.position?.x ?? 0;
  const y = motionState.position?.y ?? ctx.canvas.height * 0.72;
  const facing = motionState.facing || 1;
  const phase = motionState.phase || {};
  const limbs = motionState.limbs || {};
  const p = rig.palette;
  const breath = rig.pose.breath;

  ctx.save();
  ctx.translate(x, y + rig.pose.bob + breath);
  ctx.scale(facing * rig.scale * rig.pose.scale, rig.scale * rig.pose.scale);
  ctx.globalAlpha = rig.opacity ?? 1;

  drawShadow(ctx, rig);
  if (rig.wings) drawWings(ctx, rig, phase);
  if (rig.tentacles) drawTentacles(ctx, rig, phase);
  else drawTail(ctx, rig, phase);
  drawLegs(ctx, rig, limbs, phase);
  drawTorso(ctx, rig);
  drawArms(ctx, rig, limbs, phase);
  drawNeckAndHead(ctx, rig, motionState);
  drawArmor(ctx, rig);

  ctx.restore();
}

function drawShadow(ctx, rig) {
  ctx.fillStyle = 'rgba(0,0,0,.42)';
  ctx.beginPath();
  ctx.ellipse(0, 10, rig.torso.w * 0.62, 15, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTail(ctx, rig, phase) {
  const wave = Math.sin((phase.tail || phase.step || 0) * Math.PI * 2) * 12;
  ctx.strokeStyle = rig.palette.body;
  ctx.lineWidth = rig.tail.thickness;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(rig.torso.w * 0.35, -rig.torso.h * 0.4);
  ctx.bezierCurveTo(rig.tail.length * 0.45, -rig.torso.h * 0.3 + wave, rig.tail.length * 0.75, -24 - wave, rig.tail.length, -8);
  ctx.stroke();
}

function drawTentacles(ctx, rig, phase) {
  const count = rig.tentacles;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 1.8 - Math.PI * 0.9;
    const wave = Math.sin((phase.step || 0) * Math.PI * 2 + i) * 18;
    ctx.strokeStyle = i % 2 ? rig.palette.belly : rig.palette.body;
    ctx.lineWidth = 12 - i * 0.4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 28, -54 + Math.sin(a) * 12);
    ctx.quadraticCurveTo(Math.cos(a) * 80, -90 + wave, Math.cos(a) * 122, -42 - wave * 0.4);
    ctx.stroke();
  }
}

function drawWings(ctx, rig, phase) {
  const flap = Math.sin((phase.step || 0) * Math.PI * 2) * 14;
  ctx.fillStyle = 'rgba(255,215,107,.18)';
  ctx.strokeStyle = rig.palette.belly;
  ctx.lineWidth = 4;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 28, -rig.torso.h * 0.72);
    ctx.lineTo(side * rig.wings.span * 0.72, -rig.torso.h * 1.12 + flap);
    ctx.lineTo(side * rig.wings.span * 0.55, -rig.torso.h * 0.46 + flap * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawLegs(ctx, rig, limbs, phase) {
  ctx.strokeStyle = rig.palette.belly;
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  const left = limbs.leftFoot ?? Math.sin((phase.step || 0) * Math.PI * 2);
  const right = limbs.rightFoot ?? -left;
  for (const [side, offset] of [[-1, left], [1, right]]) {
    ctx.beginPath();
    ctx.moveTo(side * rig.torso.w * 0.22, -rig.leg.length * 0.95);
    ctx.lineTo(side * (rig.torso.w * 0.25 + offset * rig.leg.stride), -12);
    ctx.stroke();
  }
}

function drawTorso(ctx, rig) {
  ctx.fillStyle = rig.palette.body;
  ctx.beginPath();
  ctx.ellipse(0, -rig.torso.h * 0.72, rig.torso.w * 0.5, rig.torso.h * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rig.palette.belly;
  ctx.globalAlpha *= 0.88;
  ctx.beginPath();
  ctx.ellipse(0, -rig.torso.h * 0.72, rig.torso.w * 0.34, rig.torso.h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = rig.opacity ?? 1;
}

function drawArms(ctx, rig, limbs, phase) {
  const swing = Math.sin((phase.step || 0) * Math.PI * 2) * 12;
  ctx.strokeStyle = rig.palette.body;
  ctx.lineWidth = 13;
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * rig.torso.w * 0.4, -rig.torso.h * 0.86);
    ctx.quadraticCurveTo(side * (rig.torso.w * 0.58), -rig.torso.h * 0.58 + swing * side, side * (rig.torso.w * 0.52), -rig.torso.h * 0.34);
    ctx.stroke();
  }
}

function drawNeckAndHead(ctx, rig, motionState) {
  const look = Math.sin((motionState.time || 0) * 1.7) * 6;
  ctx.strokeStyle = rig.palette.body;
  ctx.lineWidth = rig.neck.thickness;
  ctx.beginPath();
  ctx.moveTo(8, -rig.torso.h * 1.05);
  ctx.lineTo(look, -rig.torso.h * 1.05 - rig.neck.length);
  ctx.stroke();

  const hx = look;
  const hy = -rig.torso.h * 1.05 - rig.neck.length - rig.head.h * 0.35;
  ctx.fillStyle = rig.palette.body;
  ctx.beginPath();
  ctx.ellipse(hx, hy, rig.head.w * 0.5, rig.head.h * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  drawEyes(ctx, rig, hx, hy, motionState);
  drawMouth(ctx, rig, hx, hy, motionState);
}

function drawEyes(ctx, rig, hx, hy, motionState) {
  const blink = Math.sin((motionState.time || 0) * 5.2) > 0.96;
  ctx.save();
  ctx.shadowColor = rig.palette.eye;
  ctx.shadowBlur = 14 * rig.eye.glow;
  for (const side of [-1, 1]) {
    ctx.fillStyle = blink ? rig.palette.shadow : rig.palette.eye;
    ctx.beginPath();
    ctx.ellipse(hx + side * rig.head.w * 0.18, hy - rig.head.h * 0.08, rig.eye.radius, blink ? 1.5 : rig.eye.radius * 0.78, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!blink) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hx + side * rig.head.w * 0.18 - 2, hy - rig.head.h * 0.11, rig.eye.radius * 0.24, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawMouth(ctx, rig, hx, hy, motionState) {
  ctx.strokeStyle = rig.palette.shadow;
  ctx.lineWidth = 3;
  ctx.beginPath();
  const mood = motionState.state === 'attack' || motionState.state === 'rampage' ? 8 : -4;
  ctx.arc(hx + rig.head.w * 0.1, hy + rig.head.h * 0.16, rig.head.w * 0.16, 0.15, Math.PI - 0.15 + mood * 0.01);
  ctx.stroke();
}

function drawArmor(ctx, rig) {
  ctx.fillStyle = rig.palette.highlight;
  for (let i = 0; i < rig.armor.plates; i++) {
    const y = -rig.torso.h * (1.2 - i * 0.12);
    ctx.beginPath();
    ctx.moveTo(-8, y);
    ctx.lineTo(-28 - rig.armor.spike * 0.4, y - rig.armor.spike);
    ctx.lineTo(2, y + 4);
    ctx.fill();
  }
}
