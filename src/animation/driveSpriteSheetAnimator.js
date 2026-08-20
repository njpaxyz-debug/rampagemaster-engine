import {
  getDriveSpriteSheet,
  getPoseById,
  resolveReptilePose
} from '../assets/driveSpriteRegistry.js';

const imageCache = new Map();

export function sourceRectForPose(image, pose) {
  if (!image || !pose?.rect) return null;
  const { u, v, w, h } = pose.rect;
  return {
    sx: image.naturalWidth * u,
    sy: image.naturalHeight * v,
    sw: image.naturalWidth * w,
    sh: image.naturalHeight * h
  };
}

export function loadDriveSpriteSheet(id = 'reptileScientist') {
  const sheet = getDriveSpriteSheet(id);
  if (!sheet || sheet.kind !== 'pose-sheet') {
    return Promise.reject(new Error(`Drive sprite sheet ${id} is not a pose sheet.`));
  }
  if (imageCache.has(id)) return imageCache.get(id);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve({ sheet, image });
    image.onerror = () => reject(new Error(`Could not load ${sheet.assetPath}`));
    image.src = new URL(sheet.assetPath, import.meta.url).href;
  });
  imageCache.set(id, promise);
  return promise;
}

export function proceduralPoseTransform(state = 'idle', time = 0, panic = 0) {
  const key = String(state || 'idle').toLowerCase();
  const t = Number.isFinite(time) ? time : 0;
  const panicAmount = Math.max(0, Math.min(1, Number(panic) || 0));
  let bob = 0;
  let sway = 0;
  let rotation = 0;
  let scaleX = 1;
  let scaleY = 1;

  if (['walk', 'run', 'patrol', 'charge'].includes(key)) {
    bob = Math.sin(t * 10) * 5;
    sway = Math.sin(t * 5) * 3;
    rotation = Math.sin(t * 10) * 0.025;
  } else if (['roar', 'greet'].includes(key)) {
    bob = Math.sin(t * 4) * 2;
    rotation = Math.sin(t * 3) * 0.035;
    scaleX = 1 + Math.sin(t * 5) * 0.018;
    scaleY = 1 - Math.sin(t * 5) * 0.012;
  } else if (['rampage', 'stomp', 'shockwave', 'enraged', 'cataclysmic'].includes(key)) {
    bob = Math.abs(Math.sin(t * 6)) * -4;
    scaleX = 1.025;
    scaleY = 0.985;
  } else {
    bob = Math.sin(t * 2.2) * 2;
    scaleX = 1 + Math.sin(t * 2.2) * 0.008;
    scaleY = 1 - Math.sin(t * 2.2) * 0.008;
  }

  if (panicAmount) {
    sway += Math.sin(t * 34) * 4 * panicAmount;
    rotation += Math.sin(t * 27) * 0.02 * panicAmount;
  }

  return { bob, sway, rotation, scaleX, scaleY };
}

export function drawDriveSpritePose(ctx, image, sheet, options = {}) {
  if (!ctx || !image || !sheet) return false;
  const state = options.state || 'idle';
  const poseId = options.poseId || resolveReptilePose(state);
  const pose = getPoseById(sheet, poseId);
  const source = sourceRectForPose(image, pose);
  if (!source) return false;

  const width = Math.max(1, options.width || 190);
  const height = Math.max(1, options.height || 206);
  const facing = options.facing === -1 ? -1 : 1;
  const transform = proceduralPoseTransform(state, options.time || 0, options.panic || 0);

  ctx.save();
  ctx.translate((options.x || 0) + transform.sway, (options.y || 0) + transform.bob);
  ctx.rotate(transform.rotation);
  ctx.scale(facing * transform.scaleX, transform.scaleY);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(
    image,
    source.sx, source.sy, source.sw, source.sh,
    -width / 2, -height, width, height
  );

  const panic = Math.max(0, Math.min(1, Number(options.panic) || 0));
  if (panic > 0.02) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `rgba(255,40,40,${0.22 * panic})`;
    ctx.fillRect(-width / 2, -height, width, height);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  return true;
}

export function createDriveSpriteAnimator(id = 'reptileScientist') {
  let loaded = null;
  let loading = null;
  return {
    id,
    get ready() { return Boolean(loaded?.image); },
    async load() {
      if (loaded) return loaded;
      loading ||= loadDriveSpriteSheet(id);
      loaded = await loading;
      return loaded;
    },
    draw(ctx, options = {}) {
      if (!loaded?.image) return false;
      return drawDriveSpritePose(ctx, loaded.image, loaded.sheet, options);
    }
  };
}
