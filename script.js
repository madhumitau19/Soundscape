let seenLeft = false;
let seenRight = false;
// ═══════════════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════════════
let API_KEY = 'QS2RhtQ36g5610XwRAg5VmpioGgUfaSb1ZcyzFdV';
const POOL_SIZE = 20, MIN_DUR = 3, MAX_DUR = 120;

// ═══════════════════════════════════════════════════════════════════
//  SOUND POOL — fetched directly from Freesound API (no proxy needed)
//  The search endpoint works fine from the browser with ?token=
// ═══════════════════════════════════════════════════════════════════
let soundPool = [];

const SEARCH_QUERIES = ['ambient','field recording','texture','drone','nature loop','atmosphere','soundscape'];

// async function fetchPool() {
//   setStatus('Loading sounds…');
  
//   const SOUND_IDS = [
//     846079, 389773, 218551, 582359, 849847, 851238, 851157, 849437, 851581, 851168, 851170, 844138, 842746, 850840, 848608, 851085, 850883, 851337, 851268, 850502, 850414, 848395, 830144, 847437, 846508, 846032, 843183, 844922, 847180, 849806
//   ];

//   try {
//     const results = await Promise.all(SOUND_IDS.map(async id => {
//       const res = await fetch(`https://freesound.org/apiv2/sounds/${id}/?fields=id,name,tags,previews&token=${API_KEY}`);
//       if (!res.ok) return null;
//       const s = await res.json();
//       return {
//         id: s.id,
//         name: s.name.replace(/\.[^.]+$/, '').slice(0, 48),
//         tags: (s.tags || []).slice(0, 5).join(' · '),
//         previewUrl: s.previews?.['preview-lq-mp3'] || s.previews?.['preview-hq-mp3'],
//       };
//     }));

//     soundPool = results.filter(s => s && s.previewUrl);
//     if (!soundPool.length) throw new Error('No results');
//     dbg(`Pool: ${soundPool.length} sounds (curated)`);
//     buildMenus();
//   } catch(e) {
//     dbg('fetchPool error: ' + e.message);
//     setStatus('Could not load sounds — check IDs or API key');
//   }
//   setStatus('');
// }

const SOUND_POOL_DATA = 
[{
    "id": 846079,
    "name": "AtmosphericHorrorAmbience15",
    "tags": "ambience · ambient-sound · atmospheric · background · background-loop",
    "previewUrl": "https://cdn.freesound.org/previews/846/846079_17278148-lq.mp3"
  },
  {
    "id": 389773,
    "name": "Darkness Cinematic 160 bpm",
    "tags": "Ambience · Ambient · Atmosphere · Atmospheric · Cinematic",
    "previewUrl": "https://cdn.freesound.org/previews/389/389773_4448255-lq.mp3"
  },
  {
    "id": 218551,
    "name": "Snoring Cello",
    "tags": "130 · 130-bpm · ambience · atmosphere · dreamy",
    "previewUrl": "https://cdn.freesound.org/previews/218/218551_468390-lq.mp3"
  },
  {
    "id": 582359,
    "name": "Birds mixed sound",
    "tags": "Birds · blackbird · chaffinch · natural-sound · tit",
    "previewUrl": "https://cdn.freesound.org/previews/582/582359_10547404-lq.mp3"
  },
  {
    "id": 849847,
    "name": "WATRFlow_FLOW Stream with Gentle Cityscape in Ba",
    "tags": "ambience · field-recording · park · public",
    "previewUrl": "https://cdn.freesound.org/previews/849/849847_18160342-lq.mp3"
  },
  {
    "id": 851238,
    "name": "Mechanical FX in Deep Cavern",
    "tags": "FX · alien · cavern · dark · deep",
    "previewUrl": "https://cdn.freesound.org/previews/851/851238_2520418-lq.mp3"
  },
  {
    "id": 851157,
    "name": "nice retro sound a",
    "tags": "audio · digital · ether · ether-audio · etheraudio",
    "previewUrl": "https://cdn.freesound.org/previews/851/851157_16155788-lq.mp3"
  },
  {
    "id": 849437,
    "name": "MUSCSmpl_Crystal Box Lush And Rosin Drone Pad 2-",
    "tags": "bed · cristal · drone · frosen · glass",
    "previewUrl": "https://cdn.freesound.org/previews/849/849437_5828667-lq.mp3"
  },
  {
    "id": 851581,
    "name": "Guitambient",
    "tags": "Ambient · Drone · Guitar · Soundscape · a-minor",
    "previewUrl": "https://cdn.freesound.org/previews/851/851581_462105-lq.mp3"
  },
  {
    "id": 851168,
    "name": "One Shot Bright Ambient Synth",
    "tags": "bright · one-shot · reverb · synth",
    "previewUrl": "https://cdn.freesound.org/previews/851/851168_15636277-lq.mp3"
  },
  {
    "id": 851170,
    "name": "Alien Crypted FM Phone Communication Texture",
    "tags": "FM · alien · background · communication · cripted",
    "previewUrl": "https://cdn.freesound.org/previews/851/851170_15636277-lq.mp3"
  },
  {
    "id": 844138,
    "name": "Soft piano tinkles delay",
    "tags": "delay · dissonant · effected · hard · instrument",
    "previewUrl": "https://cdn.freesound.org/previews/844/844138_2309965-lq.mp3"
  },
  {
    "id": 842746,
    "name": "Rhodes piano halftime 58",
    "tags": "effects · keyboard · piano · rhodes",
    "previewUrl": "https://cdn.freesound.org/previews/842/842746_9497060-lq.mp3"
  },
  {
    "id": 850840,
    "name": "Church Vocal warm-up - dual mono - Dji mic3",
    "tags": "Church · Dji · Dji-Mic-3 · Dji-Mic3 · Dual-mono",
    "previewUrl": "https://cdn.freesound.org/previews/850/850840_5287430-lq.mp3"
  },
  {
    "id": 848608,
    "name": "So, what do you see in your daydreams?",
    "tags": "dream · ethereal · nonbinary · speech · talking",
    "previewUrl": "https://cdn.freesound.org/previews/848/848608_14696146-lq.mp3"
  },
  {
    "id": 851085,
    "name": "Alien Drone with FM modulation and Granulary Syn",
    "tags": "FM · alien · drone · granular · sci-fi",
    "previewUrl": "https://cdn.freesound.org/previews/851/851085_15636277-lq.mp3"
  },
  {
    "id": 850883,
    "name": "Plasma Energy Movement FX",
    "tags": "FX · abstract · alien · craft · effect",
    "previewUrl": "https://cdn.freesound.org/previews/850/850883_2520418-lq.mp3"
  },
  {
    "id": 851337,
    "name": "street organ pensmarkt s-Hertogenbosch Netherlan",
    "tags": "Den-Bosch · Dutch · Holland · Netherlands · Street",
    "previewUrl": "https://cdn.freesound.org/previews/851/851337_1648170-lq.mp3"
  },
  {
    "id": 851268,
    "name": "Sleep in car.",
    "tags": "cars · city · noise · people · road",
    "previewUrl": "https://cdn.freesound.org/previews/851/851268_17675683-lq.mp3"
  },
  {
    "id": 850502,
    "name": "Vintage 16mm Film Static Optical Sound - normal ",
    "tags": "16mm · analog · celluloid · cinema · clear-leader",
    "previewUrl": "https://cdn.freesound.org/previews/850/850502_14865205-lq.mp3"
  },
  {
    "id": 850414,
    "name": "WIND_Winter.Evening In The Yard.Wind In The Tree",
    "tags": "ambiance · ambience · ambient · atmo · atmos",
    "previewUrl": "https://cdn.freesound.org/previews/850/850414_5828667-lq.mp3"
  },
  {
    "id": 848395,
    "name": "eldritch rumbles -120 bpm",
    "tags": "120bpm · ambient · atmosphere · electronic · horror",
    "previewUrl": "https://cdn.freesound.org/previews/848/848395_8645255-lq.mp3"
  },
  {
    "id": 830144,
    "name": "Meditative Ethno Spa (After Hours Loopable Edit)",
    "tags": "Calming · Loopable · Nature · Rain · Relaxing",
    "previewUrl": "https://cdn.freesound.org/previews/830/830144_13915946-lq.mp3"
  },
  {
    "id": 847437,
    "name": "Accours RC300 vx - 2",
    "tags": "choir · choral · male-voices · music · singing",
    "previewUrl": "https://cdn.freesound.org/previews/847/847437_11653850-lq.mp3"
  },
  {
    "id": 846508,
    "name": "F#4 Minor Pad",
    "tags": "Chord · Chordpad · Pad",
    "previewUrl": "https://cdn.freesound.org/previews/846/846508_5876986-lq.mp3"
  },
  {
    "id": 846032,
    "name": "finger exercises on pipe organ 0934 am 250223_10",
    "tags": "ambience · ambient · atmosphere · calm · church",
    "previewUrl": "https://cdn.freesound.org/previews/846/846032_1648170-lq.mp3"
  },
  {
    "id": 843183,
    "name": "Simple Majestic Choir Melody (C minor, ~95 BPM)",
    "tags": "95BPM · Choir · Cm · Epic · Magestic",
    "previewUrl": "https://cdn.freesound.org/previews/843/843183_7023195-lq.mp3"
  },
  {
    "id": 844922,
    "name": "Pad (Colorbass) - Bliss In Glitches 02",
    "tags": "Colorbass · Glitches · Glitchy · Pad · Synth",
    "previewUrl": "https://cdn.freesound.org/previews/844/844922_15956618-lq.mp3"
  },
  {
    "id": 847180,
    "name": "Metal Bars",
    "tags": "Bars · Metal · Pattern",
    "previewUrl": "https://cdn.freesound.org/previews/847/847180_15839257-lq.mp3"
  },
  {
    "id": 849806,
    "name": "Channeling Magic Texture",
    "tags": "ambient · aura · bright · channel · chime",
    "previewUrl": "https://cdn.freesound.org/previews/849/849806_18554592-lq.mp3"
  }
];

async function fetchPool() {
  soundPool = SOUND_POOL_DATA.filter(s => s && s.previewUrl);
  dbg(`Pool: ${soundPool.length} sounds (hardcoded)`);
  buildMenus();
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
  left:  { cursor:0, active:false, pendingIdx:-1 },
  right: { cursor:0, active:false, pendingIdx:-1 },
};

['left', 'right'].forEach(side => {
  const inner = document.getElementById(`menu-inner-${side}`);

  inner.addEventListener('click', e => {
    const item = e.target.closest('.menu-item');
    if (!item) return;
    const idx = parseInt(item.dataset.idx, 10);
    menus[side].cursor = idx;
    menus[side].pendingIdx = idx;
    renderMenu(side);
    menuSelect(side);
  });

  let wheelCooldown = false;
  inner.addEventListener('wheel', e => {
    e.preventDefault();
    if (wheelCooldown) return;
    wheelCooldown = true;
    menuScroll(side, e.deltaY > 0 ? 1 : -1);
    setTimeout(() => { wheelCooldown = false; }, 120);
  }, { passive: false });
});

function renderMenu(side) {
  try {
    const inner = document.getElementById(`menu-inner-${side}`);
    const items = inner.querySelectorAll('.menu-item');
    const cursor = menus[side].cursor;
    items.forEach((el, i) => {
      el.classList.toggle('cursor', i === cursor);
      el.classList.toggle('selected', menus[side].pendingIdx === i);
    });
    // Scroll cursor item into view
    if (items[cursor]) {
      items[cursor].scrollIntoView({ block: 'nearest' });
    }
  } catch(e) {
    console.error('renderMenu error:', e);
  }
}

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
  playBtn.textContent = '⏸\uFE0E';
  layer._paused = false;
  playBtn.addEventListener('click', () => {
    layer._paused = !layer._paused;
    if (layer._paused) {
      try { layer.player.stop(); } catch(e){}
      playBtn.textContent = '▶\uFE0E';
      row.classList.remove('playing');
    } else {
      try { layer.player.start(); } catch(e){}
      playBtn.textContent = '⏸\uFE0E';
      row.classList.add('playing');
    }
  });
  transport.appendChild(playBtn);

  const rewBtn = document.createElement('button');
  rewBtn.className = 'layer-btn';
  rewBtn.title = 'Rewind to start';
  rewBtn.textContent = '⏮\uFE0E';
  rewBtn.addEventListener('click', () => {
    try { layer.player.stop(); layer.player.start(); } catch(e){}
    layer._paused = false;
    playBtn.textContent = '⏸\uFE0E';
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

  list.prepend(row);

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

  let stream;
  try {
    stream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480,facingMode:'user'}});        
  } catch(e) {
    setStatus('Camera access denied — please allow permissions and reload.');
    started=false;
  };

  document.getElementById('setup').style.display = 'none';
  document.getElementById('left-top').style.display='flex';
  document.getElementById('right-top').style.display='flex';
  document.getElementById('header').style.display='none';
  document.getElementById('instruction-button').classList.add('show');

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

    seenLeft=false;
    seenRight=false;

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

        if(h.pitch) h.pitch.pitch=pitch;
        if(h.vol)   h.vol.volume.rampTo(vol,0.1);  

        lms.forEach(lm=>{ctx.beginPath();ctx.arc((1-lm.x)*overlay.width,lm.y*overlay.height,3.5,0,Math.PI*2);ctx.fillStyle=color;ctx.globalAlpha=0.85;ctx.fill();});
        ctx.globalAlpha=1;

        const palmX=(1-lms[9].x)*overlay.width,palmY=lms[9].y*overlay.height;
        ctx.beginPath();ctx.arc(palmX,palmY,5+spread*150,0,Math.PI*2);
        ctx.fillStyle=color;ctx.globalAlpha=spread*0.3;ctx.fill();
        ctx.globalAlpha=1;

        // Labels
        const sName=h.sound?h.sound.name.slice(0,24):(h.loading?'loading…':'—');
        ctx.font='italic 300 12px "Cormorant Garamond",serif';ctx.fillStyle=color;ctx.globalAlpha=0.8;
        ctx.fillText(sName,Math.max(4,wx-32),wy-30);ctx.globalAlpha=1;
        ctx.font='400 10px "Inconsolata",monospace';ctx.fillStyle=color;

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

  video.srcObject=stream;
  await new Promise(r=>{video.onloadedmetadata=r;});
  new Camera(video,{onFrame:async()=>{await mp.send({image:video});},width:640,height:480}).start();

  document.getElementById('canvas-wrap').style.display='block';
  document.getElementById('info').style.display='block';
  document.getElementById('rec-panel').style.display='flex';
  document.getElementById('hint').style.display='block';
  document.getElementById('pitch-strip').style.display='flex';document.getElementById('menu-left').classList.add('show');document.getElementById('menu-right').classList.add('show');
});

const menuLeftTitle = document.getElementById("menu-left-title");
const menuRightTitle = document.getElementById("menu-right-title");
const menuLeftInner = document.getElementById("menu-inner-left");
const menuRightInner = document.getElementById("menu-inner-right");
const menuLeft = document.getElementById("menu-left");
const menuRight = document.getElementById("menu-right");

menuLeftTitle.addEventListener("click", () => {
    menuLeft.classList.toggle("show");
    menuLeftTitle.classList.toggle("clicked");
    if (menuLeftTitle.classList.contains("clicked")){
        menuLeftTitle.innerHTML = "LEFT HAND ×";
    } else {
        menuLeftTitle.innerHTML = "LEFT HAND ↓";
    };
    if (searchLeft.classList.contains("show")){
        searchLeft.classList.remove("show");
        searchLeftBtn.classList.toggle("close");
        if (searchLeftBtn.classList.contains("close")) {
            searchLeftBtn.innerHTML = "×";
        } else{
        searchLeftBtn.innerHTML = "+";
    }
    } else;
    if (window.innerWidth <= 800) {
        if (menuLeftTitle.classList.contains("clicked")){
            menuLeftTitle.innerHTML = "×";
        } else {
            menuLeftTitle.innerHTML = "L";
        };
        if (menuRightTitle.classList.contains("clicked")){
            menuRightTitle.classList.remove("clicked");
            menuRight.classList.toggle("show");
            if (menuRightTitle.classList.contains("clicked")) {
                menuRightTitle.innerHTML = "×";
            } else {
            menuRightTitle.innerHTML = "R"; 
            };
        } else;
        if (searchRight.classList.contains("show")){
            searchRight.classList.remove("show");
            searchRightBtn.classList.toggle("close");
            if (searchRightBtn.classList.contains("close")) {
                searchRightBtn.innerHTML = "×";
            } else{
            searchRightBtn.innerHTML = "+";
            }
        } else;    
    } else;
});

menuRightTitle.addEventListener("click", () => {
    menuRight.classList.toggle("show");
    menuRightTitle.classList.toggle("clicked");
    if (menuRightTitle.classList.contains("clicked")){
        menuRightTitle.innerHTML = "× RIGHT HAND";
    } else {
        menuRightTitle.innerHTML = "↓ RIGHT HAND";
    };
    if (searchRight.classList.contains("show")){
        searchRight.classList.remove("show");
        searchRightBtn.classList.toggle("close");
        if (searchRightBtn.classList.contains("close")) {
            searchRightBtn.innerHTML = "×";
        } else{
        searchRightBtn.innerHTML = "+";
        }
    } else;
    if (window.innerWidth <= 800) {
        if (menuRightTitle.classList.contains("clicked")){
            menuRightTitle.innerHTML = "×";
        } else {
            menuRightTitle.innerHTML = "R";
        };
        if (menuLeftTitle.classList.contains("clicked")){
            menuLeftTitle.classList.remove("clicked");
            menuLeft.classList.toggle("show");
            if (menuLeftTitle.classList.contains("clicked")) {
                menuLeftTitle.innerHTML = "×";
            } else {
                menuLeftTitle.innerHTML = "L"; 
            };
        } else;
        if (searchLeft.classList.contains("show")){
            searchLeft.classList.remove("show");
            searchLeftBtn.classList.toggle("close");
            if (searchLeftBtn.classList.contains("close")) {
                searchLeftBtn.innerHTML = "×";
            } else{
            searchLeftBtn.innerHTML = "+";
            }
        } else;
    };
});

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
  if (window.innerWidth <= 800) {
    document.getElementById('menu-left-title').innerHTML = 'L';
    document.getElementById('menu-right-title').innerHTML = 'R';
  } else {
    document.getElementById('menu-left-title').innerHTML = 'LEFT HAND ↓';
    document.getElementById('menu-right-title').innerHTML = '↓ RIGHT HAND';
  }
}

updateMenuLabels();
window.addEventListener('resize', updateMenuLabels);

let instruction= document.getElementById('instruction');
let instructionBtn= document.getElementById('instruction-button');

instructionBtn.addEventListener('click', ()=>{
    instruction.classList.toggle("show");
});

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
    // ADD THIS — show inner once populated
    inner.classList.add('show');
  });
};

let searchLeftBtn = document.getElementById('search-toggle-left');
let searchRightBtn = document.getElementById('search-toggle-right');
let searchLeft = document.getElementById('search-left');
let searchRight = document.getElementById('search-right');

searchLeftBtn.addEventListener("click", ()=> {
    searchLeft.classList.toggle("show");
    searchLeftBtn.classList.toggle("close");
    if (searchLeftBtn.classList.contains("close")) {
        searchLeftBtn.innerHTML = "×";
    } else{
       searchLeftBtn.innerHTML = "+";
    };
    if (menuLeftTitle.classList.contains("clicked")){
        menuLeftTitle.classList.remove("clicked");
        menuLeft.classList.toggle("show");
        if (menuLeftTitle.classList.contains("clicked")) {
            menuLeftTitle.innerHTML = "LEFT HAND ↓";
        } else {
           menuLeftTitle.innerHTML = "LEFT HAND ↓"; 
        };
    } else;
    if (window.innerWidth <= 800) {
        if (menuLeftTitle.classList.contains("clicked")){
            menuLeftTitle.innerHTML = "×";
        } else {
            menuLeftTitle.innerHTML = "L";
        };
        if (searchRight.classList.contains("show")){
            searchRight.classList.remove("show");
            searchRightBtn.classList.toggle("close");
            if (searchRightBtn.classList.contains("close")) {
                searchRightBtn.innerHTML = "×";
            } else{
            searchRightBtn.innerHTML = "+";
            }
        } else;
        if (menuRightTitle.classList.contains("clicked")){
            menuRightTitle.classList.remove("clicked");
            menuRight.classList.toggle("show");
            if (menuRightTitle.classList.contains("clicked")) {
                menuRightTitle.innerHTML = "×";
            } else {
                menuRightTitle.innerHTML = "R"; 
            };
        } else;
    };
});
searchRightBtn.addEventListener("click", ()=> {
    searchRight.classList.toggle("show");
    searchRightBtn.classList.toggle("close");
    if (searchRightBtn.classList.contains("close")) {
        searchRightBtn.innerHTML = "×";
    } else{
       searchRightBtn.innerHTML = "+";
    };
    if (menuRightTitle.classList.contains("clicked")){
        menuRightTitle.classList.remove("clicked");
        menuRight.classList.toggle("show");
        if (menuRightTitle.classList.contains("clicked")) {
            menuRightTitle.innerHTML = "↓ RIGHT HAND";
        } else {
           menuRightTitle.innerHTML = "↓ RIGHT HAND"; 
        };
    } else;
    if (window.innerWidth <= 800) {
        if (menuRightTitle.classList.contains("clicked")){
            menuRightTitle.innerHTML = "×";
        } else {
            menuRightTitle.innerHTML = "R";
        };
        if (searchLeft.classList.contains("show")){
            searchLeft.classList.remove("show");
            searchLeftBtn.classList.toggle("close");
            if (searchLeftBtn.classList.contains("close")) {
                searchLeftBtn.innerHTML = "×";
            } else{
            searchLeftBtn.innerHTML = "+";
            }
        } else;
        if (menuLeftTitle.classList.contains("clicked")){
            menuLeftTitle.classList.remove("clicked");
            menuLeft.classList.toggle("show");
            if (menuLeftTitle.classList.contains("clicked")) {
                menuLeftTitle.innerHTML = "×";
            } else {
                menuLeftTitle.innerHTML = "L"; 
            };
        } else;
    };
});

['left', 'right'].forEach(side => {
  const input   = document.getElementById(`search-input-${side}`);
  const btn     = document.getElementById(`search-btn-${side}`);
  const results = document.getElementById(`search-results-${side}`);

  async function doSearch() {
    const q = input.value.trim();
    if (!q) return;
    results.innerHTML = '<div style="font-size:10px;color:var(--muted);padding:6px 10px">searching…</div>';

    try {
      const params = new URLSearchParams({
        query: q,
        page_size: 20,
        filter: `duration:[${MIN_DUR} TO ${MAX_DUR}]`,
        fields: 'id,name,tags,previews',
        token: API_KEY,
      });
      const res  = await fetch(`https://freesound.org/apiv2/search/text/?${params}`);
      const data = await res.json();
      const hits = (data.results || []).map(s => ({
        id: s.id,
        name: s.name.replace(/\.[^.]+$/, '').slice(0, 48),
        tags: (s.tags || []).slice(0, 5).join(' · '),
        previewUrl: s.previews?.['preview-lq-mp3'] || s.previews?.['preview-hq-mp3'],
      })).filter(s => s.previewUrl);

      results.innerHTML = '';
      if (!hits.length) {
        results.innerHTML = '<div style="font-size:10px;color:var(--muted);padding:6px 10px">no results</div>';
        return;
      }

      hits.forEach(sound => {
        const el = document.createElement('div');
        el.className = 'search-result-item';
        el.textContent = sound.name;
        el.addEventListener('click', () => {
          // Mark as active
          results.querySelectorAll('.search-result-item').forEach(i => i.classList.remove('active'));
          el.classList.add('active');
          // Load directly into this hand — bypasses soundPool entirely
          loadSound(side, sound);
        });
        results.appendChild(el);
      });
    } catch(e) {
      results.innerHTML = '<div style="font-size:10px;color:var(--muted);padding:6px 10px">error</div>';
    }
  }

  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
});


const pitchVolHL = document.querySelectorAll(".pitch-vol-highlight");
const soundMenuHL = document.querySelectorAll(".sound-menu-highlight");
const moreSoundsHL = document.querySelectorAll(".more-sounds-highlight");
const recordHL = document.querySelectorAll(".record-highlight");
const mixHL = document.querySelectorAll(".mix-highlight");

let tutorialClose = document.getElementById("tut-no");
tutorialClose.addEventListener("click", ()=> {
    instruction.classList.remove("show");    
});

let startTutorial = document.getElementById("tut-yes");
function tutorial(){
    instruction.innerHTML = "*Try each step as it's displayed.*<br><br>Hold up both hands";
    
    const check = setInterval(() => {
        if (seenLeft && seenRight) {
            clearInterval(check);
            // move to next step
            instruction.innerHTML = 
            "Great!<br>Now try changing pitch/volume (the numbers change in the cards)- <br><br>• Fingers farther/closer apart for volume up/down<br>• Hands up/down for pitch up/down <div id='next-soundmenu' class='next-btn'>NEXT</div>";
            pitchVolHL.forEach(el => el.classList.add("show"));
            nextSoundMenu = document.getElementById('next-soundmenu');
            nextSoundMenu.addEventListener('click', ()=> {
                instruction.innerHTML =
                "You can select from 30 sounds with the sound menus <div id='next-moresounds' class='next-btn'>NEXT</div>";
                pitchVolHL.forEach(el => el.classList.remove("show"));
                soundMenuHL.forEach(el => el.classList.add("show"));
                nextMoreSounds = document.getElementById('next-moresounds');
                nextMoreSounds.addEventListener('click', ()=>{
                    instruction.innerHTML =
                    "Or use any sound from Freesounds<div id='next-record' class='next-btn'>NEXT</div>";
                    soundMenuHL.forEach(el => el.classList.remove("show"));
                    moreSoundsHL.forEach(el => el.classList.add("show"));
                    nextRecord = document.getElementById('next-record');
                    nextRecord.addEventListener('click', ()=> {
                        instruction.innerHTML =
                        "Record your soundscape to save/download <div id='next-layermix' class='next-btn'>NEXT</div>";
                        moreSoundsHL.forEach(el => el.classList.remove("show"));
                        recordHL.forEach(el => el.classList.add("show"));
                        nextLayerMix = document.getElementById('next-layermix');
                        nextLayerMix.addEventListener('click', ()=>{
                            instruction.innerHTML =
                            "Then generate a mix + download<div id='next-final' class='next-btn'>GOT IT!</div>";
                            recordHL.forEach(el => el.classList.remove("show"));
                            mixHL.forEach(el => el.classList.add("show"));
                            nextFinal = document.getElementById('next-final');
                            nextFinal.addEventListener('click', ()=>{
                                instruction.innerHTML =
                                "<div id='end-tutorial' class='next-btn'>I'm ready to start :D</div><div id='restart-tutorial' class='next-btn'>Restart Tutorial</div>";
                                mixHL.forEach(el => el.classList.remove("show"));
                                endTutorial = document.getElementById('end-tutorial');
                                endTutorial.addEventListener("click", ()=>{
                                    instruction.classList.remove("show"); 
                                });
                                restartTutorial = document.getElementById('restart-tutorial');
                                restartTutorial.addEventListener("click", ()=>{
                                    instruction.innerHTML = 
                                    "START TUTORIAL<div id='tut-confirm'><div id='tut-yes'>YES</div><div id='tut-no'>CLOSE</div></div>";
                                    document.getElementById("tut-no").addEventListener("click", ()=> {
                                        instruction.classList.remove("show");    
                                    });
                                    document.getElementById("tut-yes").addEventListener("click", tutorial);
                                });
                            });
                        });
                    });
                });
                   
            });
        }
    }, 200);
    
};
startTutorial.addEventListener("click", tutorial);




