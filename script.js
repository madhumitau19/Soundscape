// ═══════════════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════════════
let API_KEY = '7qRv74PMMNRaruCgFKr6hK3YdzJbOIwub0vPMPqv';
const POOL_SIZE = 20, MIN_DUR = 3, MAX_DUR = 120;

// ═══════════════════════════════════════════════════════════════════
//  SOUND POOL — fetched directly from Freesound API (no proxy needed)
//  The search endpoint works fine from the browser with ?token=
// ═══════════════════════════════════════════════════════════════════
let soundPool = [];

const SEARCH_QUERIES = ['ambient','field recording','texture','drone','nature loop','atmosphere','soundscape'];

async function fetchPool() {
  setStatus('Loading sounds…');
  try {
    const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
    const page  = Math.floor(Math.random() * 10) + 1;
    const params = new URLSearchParams({
      query, page, page_size: 30,
      filter: `duration:[${MIN_DUR} TO ${MAX_DUR}]`,
      fields: 'id,name,tags,previews',
      token:  API_KEY,
    });
    const res  = await fetch(`https://freesound.org/apiv2/search/text/?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    soundPool = (data.results || []).map(s => ({
      id:         s.id,
      name:       s.name.replace(/\.[^.]+$/, '').slice(0, 48),
      tags:       (s.tags || []).slice(0, 5).join(' · '),
      // Prefer LQ — much smaller files, loads in ~1s instead of 10s
      previewUrl: s.previews?.['preview-lq-mp3'] || s.previews?.['preview-hq-mp3'],
    })).filter(s => s.previewUrl);
    if (!soundPool.length) throw new Error('No results');
    dbg(`Pool: ${soundPool.length} sounds (query: "${query}")`);
    buildMenus();
  } catch(e) {
    dbg('fetchPool error: ' + e.message);
    setStatus('Could not load sounds — check API key');
  }
  setStatus('');
}

function pickRandom(excludeId) {
  const pool = soundPool.filter(s => s.id !== excludeId);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

// ═══════════════════════════════════════════════════════════════════
//  SOUND MENUS
// ═══════════════════════════════════════════════════════════════════
const ITEM_H = 24; // px per menu item
const VISIBLE = 7; // items visible at once; cursor is middle one
const menus = {
  left:  { cursor:0, active:false },
  right: { cursor:0, active:false },
};

function buildMenus() {
  ['left','right'].forEach(side => {
    const inner = document.getElementById(`menu-inner-${side}`);
    inner.innerHTML = '';
    soundPool.forEach((s, i) => {
      const el = document.createElement('div');
      el.className = 'menu-item';
      el.dataset.idx = i;
      el.textContent = s.name;
      inner.appendChild(el);
    });
    menus[side].cursor = 0;
    menus[side].pendingIdx = -1;
    renderMenu(side);
  });
}

function renderMenu(side) {
  try {
    const inner  = document.getElementById(`menu-inner-${side}`);
    const items  = inner.querySelectorAll('.menu-item');
    const cursor = menus[side].cursor;
    const offset = -(cursor * ITEM_H) + (Math.floor(VISIBLE/2) * ITEM_H);
    inner.style.transform = `translateY(${offset}px)`;
    items.forEach((el, i) => {
      el.classList.toggle('cursor',   i === cursor);
      el.classList.toggle('selected', menus[side].pendingIdx === i);
    });
  } catch(e) {
    console.error('renderMenu error:', e);
  }
}


['left', 'right'].forEach(side => {
  const inner = document.getElementById(`menu-inner-${side}`);

  // Click to select
  inner.addEventListener('click', e => {
    const item = e.target.closest('.menu-item');
    if (!item) return;
    const idx = parseInt(item.dataset.idx, 10);
    menus[side].cursor = idx;
    menus[side].pendingIdx = idx;
    renderMenu(side);
    menuSelect(side);
  });

  // Scroll wheel to move cursor
  document.getElementById(`menu-${side}`).addEventListener('wheel', e => {
    e.preventDefault();
    menuScroll(side, e.deltaY > 0 ? 1 : -1);
  }, { passive: false });
});

function menuScroll(side, delta) {
  // delta: -1 = up (prev), +1 = down (next)
  const m = menus[side];
  m.cursor = Math.max(0, Math.min(soundPool.length - 1, m.cursor + delta));
  renderMenu(side);
}

function menuSelect(side) {
  const m = menus[side];
  const s = soundPool[m.cursor];
  if (s) loadSound(side, s);
}

function setStatus(t) { document.getElementById('status').textContent = t; }
function dbg(t) {
  const el = document.getElementById('debug-box');
  el.style.display = 'none';
  el.textContent += new Date().toLocaleTimeString() + '  ' + t + '\n';
  el.scrollTop = el.scrollHeight;
}

// ═══════════════════════════════════════════════════════════════════
//  HAND AUDIO CHAINS
// ═══════════════════════════════════════════════════════════════════
const hands = {
  left:  { audioEl:null, srcNode:null, pitch:null, vol:null, sound:null, loading:false, active:false, xHistory:[], swipeCd:0, phTimer:null, pinching:false, scrollGesture:null, scrollTimer:null, lastScrollTime:0, lastPalmSelect:0 },
  right: { audioEl:null, srcNode:null, pitch:null, vol:null, sound:null, loading:false, active:false, xHistory:[], swipeCd:0, phTimer:null, pinching:false, scrollGesture:null, scrollTimer:null, lastScrollTime:0, lastPalmSelect:0 },
};

function buildChain(side) {
  const h = hands[side];
  if (h.pitch) { try { h.pitch.dispose(); } catch(e){} }
  if (h.vol)   { try { h.vol.dispose();   } catch(e){} }
  h.vol   = new Tone.Volume(-12).toDestination();
  h.pitch = new Tone.PitchShift({ pitch:0, windowSize:0.1, delayTime:0, feedback:0 }).connect(h.vol);
}

async function loadSound(side, meta) {
  const h = hands[side];
  if (h.loading) return;
  h.loading = true;
  document.getElementById(`spin-${side}`).classList.add('show');
  document.getElementById(`${side}-name`).textContent = 'loading…';
  document.getElementById(`${side}-tags`).textContent = '';
  clearInterval(h.phTimer);

  // On swipe we reuse the same <audio> element (MediaElementSource can only be
  // created once per element). First call: create element + source node.
  // Subsequent calls: just swap the src.
  if (!h.audioEl) {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.loop = true;
    h.audioEl = audio;

    const rawCtx = Tone.getContext().rawContext;
    h.srcNode = rawCtx.createMediaElementSource(audio);
    // Connect raw Web Audio node into the Tone graph
    Tone.connect(h.srcNode, h.pitch);
  } else {
    h.audioEl.pause();
  }

  const audio = h.audioEl;

  const onCanPlay = () => {
    audio.play().catch(()=>{});
    h.sound   = meta;
    h.loading = false;
    document.getElementById(`spin-${side}`).classList.remove('show');
    document.getElementById(`${side}-name`).textContent = meta.name;
    document.getElementById(`${side}-tags`).textContent = meta.tags;
    dbg(`Playing: "${meta.name}"`);
    clearInterval(h.phTimer);
    h.phTimer = setInterval(() => {
      if (!audio.duration) return;
      document.getElementById(`${side}-playhead`).style.width =
        ((audio.currentTime / audio.duration) * 100).toFixed(1) + '%';
    }, 300);
  };

  const onError = () => {
    h.loading = false;
    document.getElementById(`spin-${side}`).classList.remove('show');
    dbg(`Audio error: "${meta.name}"`);
    soundPool = soundPool.filter(s => s.id !== meta.id);
    if (soundPool.length > 0) triggerNewSound(side);
    else setStatus('No playable sounds — try reloading');
  };

  audio.removeEventListener('canplay', audio._onCanPlay);
  audio.removeEventListener('error',   audio._onError);
  audio._onCanPlay = onCanPlay;
  audio._onError   = onError;
  audio.addEventListener('canplay', onCanPlay, { once: true });
  audio.addEventListener('error',   onError,   { once: true });

  audio.src = meta.previewUrl;
  audio.load();
}

async function triggerNewSound(side) {
  if (soundPool.length < 5) await fetchPool();
  const s = pickRandom(hands[side].sound?.id);
  if (!s) { setStatus('No sounds available'); return; }
  flashCard(side);
  await loadSound(side, s);
}

// ═══════════════════════════════════════════════════════════════════
//  RECORDING + LAYERING
// ═══════════════════════════════════════════════════════════════════
let mediaRecorder = null;
let recChunks     = [];
let recStartTime  = 0;
let recTimerInterval = null;
let isRecording   = false;

// Layers: [{blob, url, name, duration, player, volNode, gain, muted}]
const layers = [];
let   layerCounter = 0;

// We capture from Tone's audio context destination via createMediaStreamDestination
let recStreamDest = null;

function initRecordingDest() {
  // Create a MediaStreamDestination tapped from Tone's master output
  const ctx = Tone.getContext().rawContext;
  recStreamDest = ctx.createMediaStreamDestination();
  // Connect Tone's destination to it
  Tone.getDestination().connect(recStreamDest);
}

function startRecording() {
  if (isRecording || !recStreamDest) return;
  recChunks    = [];
  isRecording  = true;
  recStartTime = Date.now();

  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus' : 'audio/webm';

  mediaRecorder = new MediaRecorder(recStreamDest.stream, { mimeType });
  mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recChunks.push(e.data); };
  mediaRecorder.onstop = finaliseRecording;
  mediaRecorder.start(100);

  // UI
  document.getElementById('btn-record').disabled = true;
  document.getElementById('btn-record').classList.add('recording');
  document.getElementById('btn-stop').disabled   = false;
  document.getElementById('status-rec').textContent = 'Recording…';

  recTimerInterval = setInterval(() => {
    const s = Math.floor((Date.now() - recStartTime) / 1000);
    const mm = Math.floor(s/60), ss = s%60;
    document.getElementById('rec-timer').textContent = mm + ':' + String(ss).padStart(2,'0');
  }, 500);
}

function stopRecording() {
  if (!isRecording || !mediaRecorder) return;
  mediaRecorder.stop();
  isRecording = false;
  clearInterval(recTimerInterval);
  document.getElementById('btn-record').disabled = false;
  document.getElementById('btn-record').classList.remove('recording');
  document.getElementById('btn-stop').disabled   = true;
  document.getElementById('status-rec').textContent = 'Finalising…';
}

async function finaliseRecording() {
  const blob = new Blob(recChunks, {type:'audio/webm'});
  const url  = URL.createObjectURL(blob);
  const dur  = (Date.now() - recStartTime) / 1000;

  layerCounter++;
  const name = 'Take ' + layerCounter;

  // Create a Tone.Player for this layer that loops and plays through master
  const volNode = new Tone.Volume(0).toDestination();
  const player  = new Tone.Player({ url, loop:true, autostart:true }).connect(volNode);

  const layer = { id:layerCounter, blob, url, name, duration:dur, player, volNode, gain:1, muted:false };
  layers.push(layer);

  document.getElementById('status-rec').textContent = '';
  document.getElementById('layers-wrap').style.display = 'flex';
  document.getElementById('layers-wrap').style.flexDirection = 'column';
  document.getElementById('btn-mix').disabled = false;

  renderLayerRow(layer, blob);
}

function renderLayerRow(layer, blob) {
  const list = document.getElementById('layers-list');

  const row = document.createElement('div');
  row.className = 'layer-row playing';
  row.id = 'layer-row-' + layer.id;

  // Progress bar behind
  const prog = document.createElement('div');
  prog.className = 'layer-progress';
  prog.id = 'layer-prog-' + layer.id;
  row.appendChild(prog);

  // Layer number
  const num = document.createElement('div');
  num.className = 'layer-num';
  num.textContent = layer.id;
  row.appendChild(num);

  // Waveform canvas
  const wfWrap = document.createElement('div');
  wfWrap.className = 'layer-waveform';
  const wfCanvas = document.createElement('canvas');
  wfCanvas.width  = 300;
  wfCanvas.height = 28;
  wfWrap.appendChild(wfCanvas);
  row.appendChild(wfWrap);
  drawWaveform(wfCanvas, blob);

  // Duration
  const durEl = document.createElement('div');
  durEl.className = 'layer-duration';
  const mm = Math.floor(layer.duration/60), ss = Math.floor(layer.duration%60);
  durEl.textContent = mm + ':' + String(ss).padStart(2,'0');
  row.appendChild(durEl);

  // Transport: play/pause + rewind
  const transport = document.createElement('div');
  transport.className = 'layer-transport';

  const playBtn = document.createElement('button');
  playBtn.className = 'layer-btn';
  playBtn.title = 'Play / Pause';
  playBtn.textContent = '⏸';
  layer._paused = false;
  playBtn.addEventListener('click', () => {
    layer._paused = !layer._paused;
    if (layer._paused) {
      try { layer.player.stop(); } catch(e){}
      playBtn.textContent = '▶';
      row.classList.remove('playing');
    } else {
      try { layer.player.start(); } catch(e){}
      playBtn.textContent = '⏸';
      row.classList.add('playing');
    }
  });
  transport.appendChild(playBtn);

  const rewBtn = document.createElement('button');
  rewBtn.className = 'layer-btn';
  rewBtn.title = 'Rewind to start';
  rewBtn.textContent = '⏮';
  rewBtn.addEventListener('click', () => {
    try { layer.player.stop(); layer.player.start(); } catch(e){}
    layer._paused = false;
    playBtn.textContent = '⏸';
    row.classList.add('playing');
    prog.style.width = '0%';
  });
  transport.appendChild(rewBtn);

  row.appendChild(transport);

  // Volume slider (drag-to-adjust)
  const volWrap = document.createElement('div');
  volWrap.className = 'layer-vol-wrap';
  volWrap.title = 'Drag to adjust volume';
  const volFill = document.createElement('div');
  volFill.className = 'layer-vol-fill';
  volFill.style.width = '100%';
  volWrap.appendChild(volFill);
  volWrap.addEventListener('click', e => {
    const r = volWrap.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    layer.gain = pct;
    volFill.style.width = (pct * 100).toFixed(0) + '%';
    const db = pct === 0 ? -Infinity : 20 * Math.log10(pct);
    layer.volNode.volume.rampTo(db, 0.05);
  });
  row.appendChild(volWrap);

  // Mute button
  const muteBtn = document.createElement('button');
  muteBtn.className = 'layer-btn';
  muteBtn.textContent = 'mute';
  muteBtn.addEventListener('click', () => {
    layer.muted = !layer.muted;
    muteBtn.classList.toggle('muted', layer.muted);
    muteBtn.textContent = layer.muted ? 'unmute' : 'mute';
    layer.volNode.volume.rampTo(layer.muted ? -Infinity : 20*Math.log10(Math.max(0.001,layer.gain)), 0.05);
  });
  row.appendChild(muteBtn);

  function updateMuteLabel() {
    if (window.innerWidth <= 600) {
        muteBtn.textContent = layer.muted ? 'UM' : 'M';
    } else {
        muteBtn.textContent = layer.muted ? 'unmute' : 'mute';
    }
    }

    updateMuteLabel(); // set initial label

    // Update the existing click handler to use updateMuteLabel:
    muteBtn.addEventListener('click', () => {
    layer.muted = !layer.muted;
    muteBtn.classList.toggle('muted', layer.muted);
    updateMuteLabel();
    layer.volNode.volume.rampTo(layer.muted ? -Infinity : 20*Math.log10(Math.max(0.001,layer.gain)), 0.05);
    });

    window.addEventListener('resize', updateMuteLabel);

  // Solo button
  const soloBtn = document.createElement('button');
  soloBtn.className = 'layer-btn';
  soloBtn.textContent = 'solo';
  soloBtn.addEventListener('click', () => {
    const isSoloed = soloBtn.textContent === 'unsolo';
    layers.forEach(l => {
      const muted = !isSoloed && l.id !== layer.id;
      l.volNode.volume.rampTo(muted ? -Infinity : (l.muted ? -Infinity : 20*Math.log10(Math.max(0.001,l.gain))), 0.05);
    });
    soloBtn.textContent = isSoloed ? 'solo' : 'unsolo';
  });
  row.appendChild(soloBtn);

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.className = 'layer-btn delete';
  delBtn.textContent = 'del';
  delBtn.addEventListener('click', () => {
    try { layer.player.stop(); layer.player.dispose(); } catch(e){}
    try { layer.volNode.dispose(); } catch(e){}
    URL.revokeObjectURL(layer.url);
    const idx = layers.indexOf(layer);
    if (idx > -1) layers.splice(idx, 1);
    row.remove();
    if (layers.length === 0) {
      document.getElementById('layers-wrap').style.display = 'none';
      document.getElementById('btn-mix').disabled = true;
    }
  });
  row.appendChild(delBtn);

  // Download individual layer
  const dlBtn = document.createElement('button');
  dlBtn.className = 'layer-btn';
  dlBtn.textContent = '↓';
  dlBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = layer.url;
    a.download = `collage-${layer.name.toLowerCase().replace(' ','-')}.webm`;
    a.click();
  });
  row.appendChild(dlBtn);

  list.appendChild(row);

  // Animate progress bar
  setInterval(() => {
    if (!layer.player?.loaded || layer.muted) return;
    const dur = layer.player.buffer?.duration || layer.duration;
    const pos = (Tone.now() % dur) / dur * 100;
    prog.style.width = pos.toFixed(1) + '%';
  }, 300);
}

async function drawWaveform(canvas, blob) {
  try {
    const arrayBuf = await blob.arrayBuffer();
    const ctx2     = canvas.getContext('2d');
    // Decode in a temporary audio context
    const tmpCtx   = new AudioContext();
    const audioBuf = await tmpCtx.decodeAudioData(arrayBuf);
    tmpCtx.close();

    const data = audioBuf.getChannelData(0);
    const W = canvas.width, H = canvas.height;
    const step = Math.ceil(data.length / W);
    ctx2.clearRect(0,0,W,H);

    for (let x=0; x<W; x++) {
      let min=1, max=-1;
      for (let j=0; j<step; j++) {
        const v = data[x*step+j] || 0;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const yLow  = ((1 - max) / 2) * H;
      const yHigh = ((1 - min) / 2) * H;
      ctx2.fillStyle = '#e9006d';
      ctx2.fillRect(x, yLow, 1, Math.max(1, yHigh - yLow));
    }
  } catch(e) {
    // Waveform draw failed silently — not critical
  }
}

// Bounce all layers to a single download
async function bounceMix() {
  document.getElementById('mix-status').textContent = 'Bouncing…';
  document.getElementById('btn-mix').disabled = true;

  // Simple approach: create an OfflineAudioContext sized to the longest layer,
  // decode each blob and sum them
  try {
    const longest = Math.max(...layers.map(l => l.duration));
    const sampleRate = 44100;
    const frameCount = Math.ceil(longest * sampleRate);
    const offCtx = new OfflineAudioContext(2, frameCount, sampleRate);

    await Promise.all(layers.filter(l => !l.muted).map(async l => {
      const ab  = await l.blob.arrayBuffer();
      const tmp = new AudioContext();
      const buf = await tmp.decodeAudioData(ab);
      tmp.close();

      // Convert to offline context buffer
      const offBuf = offCtx.createBuffer(buf.numberOfChannels, buf.length, buf.sampleRate);
      for (let ch=0; ch<buf.numberOfChannels; ch++) offBuf.copyToChannel(buf.getChannelData(ch), ch);

      const src = offCtx.createBufferSource();
      src.buffer = offBuf;
      src.loop   = frameCount > offBuf.length; // loop short takes to fill
      const gain = offCtx.createGain();
      gain.gain.value = l.gain;
      src.connect(gain);
      gain.connect(offCtx.destination);
      src.start(0);
    }));

    const rendered = await offCtx.startRendering();

    // Encode to WAV
    const wavBlob = audioBufferToWav(rendered);
    const wavUrl  = URL.createObjectURL(wavBlob);
    // Auto-trigger download
    const a = document.createElement('a');
    a.href = wavUrl;
    a.download = 'collage-mix.wav';
    a.click();
    // Also show a persistent "Save WAV" link in case the auto-download was blocked
    const dlLink = document.getElementById('mix-dl-link');
    dlLink.href = wavUrl;
    dlLink.style.display = 'inline-block';
    document.getElementById('mix-status').textContent = '✓ Ready';
  } catch(e) {
    document.getElementById('mix-status').textContent = 'Error: ' + e.message;
  }
  document.getElementById('btn-mix').disabled = false;
}

// Minimal WAV encoder
function audioBufferToWav(buffer) {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numSamples = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numCh * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);

  function writeStr(offset, str) { for(let i=0;i<str.length;i++) view.setUint8(offset+i,str.charCodeAt(i)); }
  writeStr(0,'RIFF'); view.setUint32(4,36+dataSize,true);
  writeStr(8,'WAVE'); writeStr(12,'fmt '); view.setUint32(16,16,true);
  view.setUint16(20,1,true); view.setUint16(22,numCh,true);
  view.setUint32(24,sampleRate,true); view.setUint32(28,byteRate,true);
  view.setUint16(32,blockAlign,true); view.setUint16(34,bytesPerSample*8,true);
  writeStr(36,'data'); view.setUint32(40,dataSize,true);

  // Interleave channels
  const channels = [];
  for(let c=0;c<numCh;c++) channels.push(buffer.getChannelData(c));
  let offset = 44;
  for (let i=0; i<numSamples; i++) {
    for (let c=0; c<numCh; c++) {
      const s = Math.max(-1,Math.min(1,channels[c][i]));
      view.setInt16(offset, s<0 ? s*0x8000 : s*0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([ab], {type:'audio/wav'});
}

// ═══════════════════════════════════════════════════════════════════
//  GESTURE HELPERS
// ═══════════════════════════════════════════════════════════════════
function yToPitch(y) { return (0.5-y)*12; }

function fingerSpread(lms) {
  const palm = lms[9]; let total=0;
  [4,8,12,16,20].forEach(t=>{const dx=lms[t].x-palm.x,dy=lms[t].y-palm.y;total+=Math.sqrt(dx*dx+dy*dy);});
  return Math.max(0,Math.min(1,(total/5-0.05)/0.17));
}
function spreadToVol(s) { return Math.max(-40,Math.min(0,-40+s*40)); }

// ── Finger extension detection ──────────────────────────────────
// Returns number of clearly extended fingers (0 = fist, 5 = open hand)
function extendedFingers(lms) {
  const pairs = [[8,6],[12,10],[16,14],[20,18]]; // [tip, pip] for 4 fingers
  let count = 0;
  for (const [tip, pip] of pairs) {
    // tip must be clearly above PIP joint (lower y = higher on screen)
    if (lms[tip].y < lms[pip].y - 0.03) count++;
  }
  // Thumb: extended if tip is clearly away from index base laterally
  if (Math.abs(lms[4].x - lms[5].x) > 0.07) count++;
  return count;
}

// ── Fist detection ───────────────────────────────────────────────
// Returns true when all 4 fingers are curled (fist / closed hand)
// function isFist(lms) {
//   // All 4 fingertips must be BELOW their PIP joint (curled in)
//   const pairs = [[8,6],[12,10],[16,14],[20,18]];
//   for (const [tip, pip] of pairs) {
//     if (lms[tip].y < lms[pip].y - 0.01) return false; // finger is extended
//   }
//   return true;
// }

// ── One finger up (index only extended) ──────────────────────────
// function isOneFingerUp(lms) {
//   // Index tip clearly above its PIP
//   const indexUp = lms[8].y < lms[6].y - 0.04;
//   // Middle, ring, pinky must be curled
//   const midDown  = lms[12].y >= lms[10].y - 0.01;
//   const ringDown = lms[16].y >= lms[14].y - 0.01;
//   const pinDown  = lms[20].y >= lms[18].y - 0.01;
//   return indexUp && midDown && ringDown && pinDown;
// }

// ── Thumbs up (thumb pointing up, all 4 fingers curled) ──────────
// function isThumbsUp(lms) {
//   // All 4 fingers must be curled
//   const pairs = [[8,6],[12,10],[16,14],[20,18]];
//   for (const [tip, pip] of pairs) {
//     if (lms[tip].y < lms[pip].y - 0.02) return false; // finger extended
//   }
//   // Thumb tip must be clearly ABOVE the thumb's MCP base (lms[2]) — pointing up
//   const thumbUp = lms[4].y < lms[2].y - 0.06;
//   // Thumb tip must also be above wrist
//   const aboveWrist = lms[4].y < lms[0].y - 0.04;
//   return thumbUp && aboveWrist;
// }

// ── Menu scroll via gesture hold ─────────────────────────────────
// Interval between scroll steps while gesture is held (ms)
// const SCROLL_INTERVAL_MS  = 160;
// // Delay before auto-scroll starts after fist is formed (ms)
// const SCROLL_START_DELAY  = 280;

// function updateScrollGesture(side, gesture) {
//   // gesture: 'fist' | 'one-finger' | null
//   const h = hands[side];
//   const menuEl = document.getElementById('menu-' + side);
//   const badge  = document.getElementById('badge-' + side);

//   if (gesture === h.scrollGesture) return; // no change

//   // Clear previous scroll timer
//   clearTimeout(h.scrollTimer);
//   clearInterval(h._scrollInterval);
//   menuEl.classList.remove('scrolling-down', 'scrolling-up');

//   h.scrollGesture = gesture;

//   if (gesture === 'fist') {
//     // Scroll DOWN (forward) — advance through list
//     badge.textContent = '✊';
//     menuEl.classList.add('scrolling-down');
//     const doScroll = () => { menuScroll(side, 1); };
//     h.scrollTimer = setTimeout(() => {
//       doScroll();
//       h._scrollInterval = setInterval(doScroll, SCROLL_INTERVAL_MS);
//     }, SCROLL_START_DELAY);
//   } else if (gesture === 'one-finger') {
//     // Scroll UP (reverse)
//     badge.textContent = '☝';
//     menuEl.classList.add('scrolling-up');
//     const doScroll = () => { menuScroll(side, -1); };
//     h.scrollTimer = setTimeout(() => {
//       doScroll();
//       h._scrollInterval = setInterval(doScroll, SCROLL_INTERVAL_MS);
//     }, SCROLL_START_DELAY);
//   } else {
//     badge.textContent = '';
//   }
// }

// ── Swipe detection ──────────────────────────────────────────────
// New approach:
//   • Only fires on HORIZONTAL (X-axis) movement — never conflicts with pitch (Y) or spread
//   • Only fires when hand is in a FIST — prevents accidental triggers while conducting
//   • Uses VELOCITY (dist/time) not just distance — slow drifts never trigger
//   • Requires movement to be >70% horizontal (directionality check)
//   • Long cooldown (1.5s) so a single swipe can't multi-fire

// const SWIPE_COOLDOWN_MS  = 1500;
// const SWIPE_VELOCITY_MIN = 0.55;  // normalised units per second — must be fast
// const SWIPE_DIST_MIN     = 0.18;  // minimum total horizontal travel
// const SWIPE_WINDOW_MS    = 400;   // look-back window

// function detectSwipe(side, lms) {
//   const h   = hands[side];
//   const now = performance.now();

//   // Use wrist X in display space (mirrored: 1 - lms[0].x)
//   const xNow = 1 - lms[0].x;
//   const yNow = lms[0].y;

//   h.xHistory.push({ t: now, x: xNow, y: yNow });
//   // Prune old entries
//   while (h.xHistory.length > 0 && now - h.xHistory[0].t > SWIPE_WINDOW_MS) {
//     h.xHistory.shift();
//   }

//   // Enforce cooldown
//   if (h.swipeCd > now) return null;
//   // Need enough history
//   if (h.xHistory.length < 5) return null;

//   // GATE: must be a fist right now
//   if (!isFist(lms)) return null;

//   const oldest  = h.xHistory[0];
//   const dt      = (now - oldest.t) / 1000; // seconds
//   const dx      = xNow - oldest.x;         // horizontal travel
//   const dy      = yNow - oldest.y;         // vertical travel

//   // Directionality: horizontal travel must dominate
//   if (Math.abs(dx) < Math.abs(dy) * 1.8) return null;

//   // Distance threshold
//   if (Math.abs(dx) < SWIPE_DIST_MIN) return null;

//   // Velocity threshold — must be a brisk flick, not a slow drift
//   const velocity = Math.abs(dx) / dt;
//   if (velocity < SWIPE_VELOCITY_MIN) return null;

//   // Confirmed swipe!
//   h.swipeCd  = now + SWIPE_COOLDOWN_MS;
//   h.xHistory = [];
//   dbg(`Swipe! dx=${dx.toFixed(3)} vel=${velocity.toFixed(2)}`);
//   return 'new-sound';
// }

const flashTimers={};
function flashCard(side){const el=document.getElementById('flash-'+side);el.classList.add('show');clearTimeout(flashTimers[side]);flashTimers[side]=setTimeout(()=>el.classList.remove('show'),220);}

const swipeArrows={left:0,right:0};
function drawSwipeArrow(ctx,side,cx,cy){
  const color=side==='left'?'#D26A25':'#258DD2',len=40,hw=10;
  ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2.5;ctx.globalAlpha=0.85;
  ctx.beginPath();ctx.moveTo(cx-len/2,cy);ctx.lineTo(cx+len/2,cy);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+len/2,cy);ctx.lineTo(cx+len/2-hw,cy-hw/2);ctx.lineTo(cx+len/2-hw,cy+hw/2);ctx.closePath();ctx.fill();
  ctx.restore();
}



// ═══════════════════════════════════════════════════════════════════
//  RECORDING BUTTONS
// ═══════════════════════════════════════════════════════════════════
document.getElementById('btn-record').addEventListener('click', startRecording);
document.getElementById('btn-stop').addEventListener('click',   stopRecording);
document.getElementById('btn-mix').addEventListener('click',    bounceMix);

// ═══════════════════════════════════════════════════════════════════
//  MAIN START
// ═══════════════════════════════════════════════════════════════════
let started = false;

document.getElementById('start-btn').addEventListener('click', async () => {
  if (started) return;
  started = true;
  document.getElementById('setup').style.display = 'none';
    
  document.getElementById('menu-right-title').style.display='block';
  document.getElementById('menu-left-title').style.display='block';
  //document.getElementById('menu-title-back').style.display='block';
  document.getElementById('header').style.display='none';

  await Tone.start();
  buildChain('left');
  buildChain('right');
  initRecordingDest();

  await fetchPool();
  await triggerNewSound('left');
  await triggerNewSound('right');

  const video   = document.getElementById('video');
  const overlay = document.getElementById('overlay');

  const mp = new Hands({ locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
  mp.setOptions({ maxNumHands:2,modelComplexity:1,minDetectionConfidence:0.7,minTrackingConfidence:0.6 });

  mp.onResults(results => {
    const ctx = overlay.getContext('2d');
    overlay.width=overlay.offsetWidth; overlay.height=overlay.offsetHeight;
    ctx.clearRect(0,0,overlay.width,overlay.height);

    let seenLeft=false,seenRight=false;

    if (results.multiHandLandmarks) {
      results.multiHandLandmarks.forEach((lms,i) => {
        const label=results.multiHandedness[i].label;
        const side=label==='Right'?'left':'right';
        const color=side==='left'?'#D26A25':'#258DD2';
        const h=hands[side];

        const wrist=lms[0];
        const xDisp=1-wrist.x;
        const wx=xDisp*overlay.width, wy=wrist.y*overlay.height;

        const pitch=yToPitch(wrist.y);
        const spread=fingerSpread(lms);
        const vol=spreadToVol(spread);
        const volPct=Math.round(spread*100);
        const pitchSt=(pitch>=0?'+':'')+pitch.toFixed(1)+' st';

        // Only apply pitch/vol when NOT in a fist (avoids pitch jumps during scroll)
        if(h.pitch) h.pitch.pitch=pitch;
        if(h.vol)   h.vol.volume.rampTo(vol,0.1);   

        // Skeleton
        // const CONN=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17]];
        // ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.globalAlpha=0.65;
        // CONN.forEach(([a,b])=>{ctx.beginPath();ctx.moveTo((1-lms[a].x)*overlay.width,lms[a].y*overlay.height);ctx.lineTo((1-lms[b].x)*overlay.width,lms[b].y*overlay.height);ctx.stroke();});

        lms.forEach(lm=>{ctx.beginPath();ctx.arc((1-lm.x)*overlay.width,lm.y*overlay.height,3.5,0,Math.PI*2);ctx.fillStyle=color;ctx.globalAlpha=0.85;ctx.fill();});
        ctx.globalAlpha=1;

        // Spread circle
        const palmX=(1-lms[9].x)*overlay.width,palmY=lms[9].y*overlay.height;
        ctx.beginPath();ctx.arc(palmX,palmY,5+spread*150,0,Math.PI*2);
        // ctx.strokeStyle=color;ctx.lineWidth=1;ctx.globalAlpha=0.2+spread*0.4;ctx.stroke();
        ctx.fillStyle=color;ctx.globalAlpha=spread*0.3;ctx.fill();
        ctx.globalAlpha=1;

        // Labels
        const sName=h.sound?h.sound.name.slice(0,24):(h.loading?'loading…':'—');
        ctx.font='italic 300 12px "Cormorant Garamond",serif';ctx.fillStyle=color;ctx.globalAlpha=0.8;
        ctx.fillText(sName,Math.max(4,wx-32),wy-30);ctx.globalAlpha=1;
        ctx.font='400 10px "Inconsolata",monospace';ctx.fillStyle=color;
        // // const gestureLabel = fist ? '✊ scrolling ↓' : oneFinger ? '☝ scrolling ↑' : thumbsUp ? '👍 select!' : '🖐 '+fingers;
        // ctx.fillText(`${pitchSt}  ${gestureLabel}`,wx+10,wy-12);

        if(performance.now()-swipeArrows[side]<600) drawSwipeArrow(ctx,side,wx,wy+20);

        if(side==='left') seenLeft=true; else seenRight=true;
        h.active=true;

        document.getElementById('pm-'+side).style.left=((pitch+6)/12*100).toFixed(1)+'%';
        document.getElementById(side+'-pitch-label').textContent='pitch '+pitchSt;
        document.getElementById(side+'-vol-label').textContent='vol '+volPct+'%';
        document.getElementById(side+'-bar').style.width=volPct+'%';
      });
    }

    if(!seenLeft&&hands.left.active){ if(hands.left.vol)hands.left.vol.volume.rampTo(-40,0.2);hands.left.active=false;
    document.getElementById('left-pitch-label').textContent='pitch: —';document.getElementById('left-vol-label').textContent='vol: —';document.getElementById('left-bar').style.width='0%'; }
    if(!seenRight&&hands.right.active){ if(hands.right.vol)hands.right.vol.volume.rampTo(-40,0.2);hands.right.active=false;document.getElementById('right-pitch-label').textContent='pitch: —';document.getElementById('right-vol-label').textContent='vol: —';document.getElementById('right-bar').style.width='0%'; }
  });

  try {
    const stream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480,facingMode:'user'}});
    video.srcObject=stream;
    await new Promise(r=>{video.onloadedmetadata=r;});
    new Camera(video,{onFrame:async()=>{await mp.send({image:video});},width:640,height:480}).start();

    document.getElementById('canvas-wrap').style.display='block';
    document.getElementById('info').style.display='block';
    document.getElementById('rec-panel').style.display='flex';
    document.getElementById('hint').style.display='block';
    document.getElementById('pitch-strip').style.display='flex';
    document.getElementById('menu-left').classList.add('active');
    document.getElementById('menu-right').classList.add('active');
  } catch(e) {
    setStatus('Camera access denied — please allow permissions and reload.');
    started=false;
  }
});

const menuLeftTitle = document.getElementById("menu-left-title");
const menuRightTitle = document.getElementById("menu-right-title");
const menuLeftInner = document.getElementById("menu-inner-left");
const menuRightInner = document.getElementById("menu-inner-right");
const menuLeft = document.getElementById("menu-left");
const menuRight = document.getElementById("menu-right");

menuLeftTitle.addEventListener("click", ()=> {
    menuLeftInner.classList.toggle("show");
    menuLeft.classList.toggle("show");
})

menuRightTitle.addEventListener("click", ()=> {
    menuRightInner.classList.toggle("show");
    menuRight.classList.toggle("show");
})

let activeMenuSide = 'left'; // default

document.getElementById('menu-left').addEventListener('click', () => { activeMenuSide = 'left'; });
document.getElementById('menu-right').addEventListener('click', () => { activeMenuSide = 'right'; });

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') {
    menuScroll(activeMenuSide, 1);
    menus[activeMenuSide].pendingIdx = menus[activeMenuSide].cursor;
    renderMenu(activeMenuSide);
    menuSelect(activeMenuSide);
  }
  if (e.key === 'ArrowUp') {
    menuScroll(activeMenuSide, -1);
    menus[activeMenuSide].pendingIdx = menus[activeMenuSide].cursor;
    renderMenu(activeMenuSide);
    menuSelect(activeMenuSide);
  }
});

menuLeftTitle.addEventListener('click', () => { activeMenuSide = 'left'; });
menuRightTitle.addEventListener('click', () => { activeMenuSide = 'right'; });

function updateMenuLabels() {
  if (window.innerWidth <= 600) {
    document.getElementById('menu-left-title').innerHTML = 'L';
    document.getElementById('menu-right-title').innerHTML = 'R';
  } else {
    document.getElementById('menu-left-title').innerHTML = 'LEFT HAND ↓';
    document.getElementById('menu-right-title').innerHTML = '↓ RIGHT HAND';
  }
}

updateMenuLabels();
window.addEventListener('resize', updateMenuLabels);

// function resizeLayerIcons() {
//   if (window.innerWidth <= 600) {
//     muteBtn.textContent= "M";
//     muteBtn.textContent = layer.muted ? 'UM' : 'M';
//   } else {
//     muteBtn.textContent = 'mute';
//     muteBtn.textContent = layer.muted ? 'unmute' : 'mute';
//   }
// }

// resizeLayerIcons();
// window.addEventListener('resize', resizeLayerIcons);

