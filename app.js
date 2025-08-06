import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/loaders/GLTFLoader.js';

// --- DATA (Embedded to solve CORS issue) ---
const pokedexData = [
    {
        "id": "#001", "name": "BudBlop", "species": "Sprout Toad", "rarity": 1, "element": "Nature",
        "tileImg": "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/main/BudBlop0.png",
        "habitat": "Rainbow courtyard & enchanted gardens",
        "dexEntry": "A squat, round-bodied forest toad...",
        "evolutions": {
            "juvenile": { "name": "Juvenile", "modelUrl": "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/main/bubusaur.glb" },
            "mature": { "name": "Mature", "modelUrl": "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/main/bubsaur2.glb" },
            "mythical": { "name": "Mythical", "modelUrl": "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/main/bubbaaur3.glb" }
        },
        "galleryImg1": { "src": "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/main/BudBlop1.png", "alt": "Mature BudBlop" },
        "galleryImg2": { "src": "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/main/Budblop2.png", "alt": "Mythical BudBlop" },
        "videoUrl": "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/main/20250731_0222_Sunset%20Over%20Cityscape_loop_01k1fnrynsfg0vdsw388mbffjp.mp4"
    },
    {
        "id": "#002", "name": "Glowtail", "species": "Neon Forest Soutrel", "rarity": 3, "element": "Neon",
        "tileImg": "https://placehold.co/200x200/1a1a3a/e0fbfc?text=Glowtail",
        "habitat": "Enchanted groves, deep forests",
        "dexEntry": "This creature is incredibly shy...",
        "evolutions": { "base": { "name": "Base", "modelUrl": "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/PrimaryIonDrive.glb" } },
        "galleryImg1": { "src": "https://placehold.co/400x400/333/fff?text=Glowtail+1", "alt": "Glowtail Image 1" },
        "galleryImg2": { "src": "https://placehold.co/400x400/333/fff?text=Glowtail+2", "alt": "Glowtail Image 2" },
        "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    }
];
const elementAssetMap = {
    "Nature": "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/2.png",
    "Aqua":   "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/3.png",
    "Fire":   "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/4.png",
    "Poison": "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/5.png",
    "Neon":   "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/6.png",
    "Dream":  "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/7.png",
    "Wild":   "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/8.png",
    "Death":  "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/9.png",
    "Earth":  "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/10.png"
};
const musicPlaylist = [
    { "name": "Daft Punk - Pentatonix", "url": "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/main/Pentatonix_-_Daft_Punk.mp3" },
    { "name": "Pretty Rave Girl - S3RL", "url": "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/main/Pretty%20Rave%20Girl%202010%20-%20S3RL.mp3" },
    { "name": "7 rings - Ariana Grande", "url": "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/main/Ariana%20Grande%20-%207%20rings%20(Official%20Video)(1).mp3" }
];

// --- STATE MANAGEMENT ---
let currentIndex = 0;
let currentModel = null;
let isPlaying = false;
let currentTrackIndex = 0;

// --- DOM ELEMENT REFERENCES (Refactored) ---
const getEl = (id) => document.getElementById(id);
const view = { home: getEl('home-view'), detail: getEl('detail-view') };
const homeElements = {
    grid: getEl('creature-grid'),
    clearFilterContainer: getEl('clear-filter-container'),
    clearFilterBtn: getEl('clear-filter-btn'),
    btnHome: getEl('home-btn-home'),
    btnUp: getEl('home-btn-up'),
    btnDown: getEl('home-btn-down'),
    btnMusic: getEl('home-btn-music'),
    btnElement: getEl('home-btn-element'),
};
const detailElements = {
    btnHome: getEl('detail-btn-home'),
    btnPrev: getEl('detail-btn-prev'),
    btnNext: getEl('detail-btn-next'),
    name: getEl('creature-name'),
    species: getEl('creature-species'),
    rarity: getEl('rarity-stars'),
    elementImg: getEl('element-img'),
    habitat: getEl('habitat-text'),
    dexEntry: getEl('dex-entry'),
    galleryImg1: getEl('gallery-img-1'),
    galleryImg2: getEl('gallery-img-2'),
    galleryVideo: getEl('gallery-video'),
    galleryVideoSrc: getEl('gallery-video-src'),
    modelViewerContainer: getEl('model-viewer-container'),
};
const modals = {
    evolution: { overlay: getEl('evolution-modal-overlay'), openBtn: getEl('open-evolution-modal-btn'), closeBtn: getEl('close-evolution-modal-btn'), choices: getEl('evolution-choices') },
    elementFilter: { overlay: getEl('element-filter-modal-overlay'), openBtn: homeElements.btnElement, closeBtn: getEl('close-element-filter-modal-btn'), grid: getEl('element-grid') },
    music: { overlay: getEl('music-modal-overlay'), openBtn: homeElements.btnMusic, closeBtn: getEl('close-music-modal-btn'), trackName: getEl('current-track-name'), btnPrev: getEl('music-btn-prev'), btnPlayPause: getEl('music-btn-play-pause'), btnNext: getEl('music-btn-next') },
};
const audioPlayer = new Audio();

// --- CORE FUNCTIONS ---
function showView(viewName) {
    view.home.classList.add('hidden');
    view.detail.classList.add('hidden');
    view[viewName].classList.remove('hidden');
}

function populateCreatureGrid(data = pokedexData) {
    homeElements.grid.innerHTML = '';
    data.forEach(creature => {
        const tile = document.createElement('div');
        tile.className = 'creature-grid-tile rounded-2xl p-2 flex flex-col items-center justify-center aspect-square';
        tile.dataset.creatureId = creature.id;
        const img = document.createElement('img');
        img.src = creature.tileImg;
        img.className = 'w-full h-full object-contain pointer-events-none';
        tile.appendChild(img);
        homeElements.grid.appendChild(tile);
    });
}

function displayCreature(index) {
    const creature = pokedexData[index];
    currentIndex = index;
    updateCreatureText(creature);
    updateCreatureMedia(creature);
    renderRarity(creature.rarity);
    const baseEvoKey = Object.keys(creature.evolutions)[0];
    loadModel(creature.evolutions[baseEvoKey].modelUrl);
    populateEvolutionModal(creature.evolutions);
}

function updateCreatureText(creature) {
    detailElements.name.textContent = `${creature.id}-${creature.name}`;
    detailElements.species.textContent = `Species: ${creature.species}`;
    detailElements.habitat.textContent = creature.habitat;
    detailElements.dexEntry.textContent = creature.dexEntry;
}

function updateCreatureMedia(creature) {
    detailElements.elementImg.src = elementAssetMap[creature.element];
    detailElements.galleryImg1.src = creature.galleryImg1.src;
    detailElements.galleryImg1.alt = creature.galleryImg1.alt;
    detailElements.galleryImg2.src = creature.galleryImg2.src;
    detailElements.galleryImg2.alt = creature.galleryImg2.alt;
    detailElements.galleryVideoSrc.src = creature.videoUrl;
    detailElements.galleryVideo.load();
}

function renderRarity(rarity) {
    detailElements.rarity.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('span');
        star.className = 'material-icons';
        star.textContent = i < rarity ? 'star' : 'star_border';
        star.classList.add(i < rarity ? 'text-yellow-400' : 'text-gray-500');
        detailElements.rarity.appendChild(star);
    }
}

function setupModal(modal, openBtn, closeBtn) {
    const open = () => { modal.classList.remove('hidden'); setTimeout(() => modal.classList.add('visible'), 10); };
    const close = () => { modal.classList.remove('visible'); setTimeout(() => modal.classList.add('hidden'), 300); };
    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    return close;
}

function populateEvolutionModal(evolutions) {
    modals.evolution.choices.innerHTML = '';
    for (const key in evolutions) {
        const btn = document.createElement('button');
        btn.textContent = evolutions[key].name;
        btn.className = 'interactive-button evolution-button w-full py-2 text-lg';
        btn.onclick = () => { loadModel(evolutions[key].modelUrl); modals.evolution.closeBtn.click(); };
        modals.evolution.choices.appendChild(btn);
    }
}

// ... (3D Scene, Music Player, and other functions)

// --- INITIALIZATION ---
function initApp() {
    // Setup Event Listeners
    homeElements.grid.addEventListener('click', (event) => {
        const tile = event.target.closest('.creature-grid-tile');
        if (!tile) return;
        const creatureId = tile.dataset.creatureId;
        const index = pokedexData.findIndex(c => c.id === creatureId);
        if (index !== -1) {
            tile.classList.add('selected');
            setTimeout(() => { tile.classList.remove('selected'); }, 1500);
            displayCreature(index);
            showView('detail');
        }
    });
    // ... (all other event listeners)

    // Populate UI
    populateCreatureGrid();
    populateHomeElementGrid();
    loadTrack(currentTrackIndex);
    
    // Initialize 3D Scene & Show Initial View
    initScene();
    showView('home');
}

initApp();
