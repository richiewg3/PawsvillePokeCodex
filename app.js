import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

// --- STATE MANAGEMENT ---
let currentIndex = 0;
let currentModel = null;

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
    music: { overlay: getEl('music-modal-overlay'), openBtn: homeElements.btnMusic, closeBtn: getEl('close-music-modal-btn') },
};

// --- THREE.JS SCENE VARIABLES ---
let scene, camera, renderer, controls;
const loader = new GLTFLoader();

// --- CORE FUNCTIONS ---
function showView(viewName) {
    view.home.classList.toggle('hidden', viewName !== 'home');
    view.detail.classList.toggle('hidden', viewName !== 'detail');
}

function populateCreatureGrid(data = pokedexData) {
    homeElements.grid.innerHTML = '';
    data.forEach(creature => {
        const tile = document.createElement('div');
        tile.className = 'creature-grid-tile rounded-2xl p-2 flex flex-col items-center justify-center aspect-square cursor-pointer';
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
    if (!creature) return;
    currentIndex = index;

    updateCreatureText(creature);
    updateCreatureMedia(creature);
    renderRarity(creature.rarity);

    const baseEvoKey = Object.keys(creature.evolutions)[0];
    if (baseEvoKey) {
        loadModel(creature.evolutions[baseEvoKey].modelUrl);
    }
    populateEvolutionModal(creature.evolutions);
}

function updateCreatureText(creature) {
    detailElements.name.textContent = `${creature.id}-${creature.name}`;
    detailElements.species.textContent = `Species: ${creature.species}`;
    detailElements.habitat.textContent = creature.habitat;
    detailElements.dexEntry.textContent = creature.dexEntry;
}

function updateCreatureMedia(creature) {
    detailElements.elementImg.src = elementAssetMap[creature.element] || '';
    detailElements.galleryImg1.src = creature.galleryImg1.src || '';
    detailElements.galleryImg1.alt = creature.galleryImg1.alt || '';
    detailElements.galleryImg2.src = creature.galleryImg2.src || '';
    detailElements.galleryImg2.alt = creature.galleryImg2.alt || '';
    detailElements.galleryVideoSrc.src = creature.videoUrl || '';
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
        btn.onclick = () => {
            loadModel(evolutions[key].modelUrl);
            modals.evolution.closeBtn.click();
        };
        modals.evolution.choices.appendChild(btn);
    }
}

// --- THREE.JS FUNCTIONS ---
function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, detailElements.modelViewerContainer.clientWidth / detailElements.modelViewerContainer.clientHeight, 0.1, 1000);
    camera.position.z = 3;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(detailElements.modelViewerContainer.clientWidth, detailElements.modelViewerContainer.clientHeight);
    detailElements.modelViewerContainer.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    Object.assign(controls, {
        enableDamping: true, dampingFactor: 0.05, enableZoom: false,
        enablePan: false, autoRotate: true, autoRotateSpeed: 1.0
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    const directionalLight = new THREE.DirectionalLight(0xfff0dd, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function loadModel(modelUrl) {
    if (!modelUrl) return;
    if (currentModel) {
        scene.remove(currentModel);
    }
    loader.load(modelUrl, (gltf) => {
        currentModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(currentModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.5 / maxDim;
        currentModel.position.sub(center);
        currentModel.scale.multiplyScalar(scale);
        scene.add(currentModel);
    }, undefined, (error) => console.error('An error happened loading the model:', error));
}

function onWindowResize() {
    if (!renderer || !camera) return;
    const container = detailElements.modelViewerContainer;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (controls && renderer && scene && camera) {
        controls.update();
        renderer.render(scene, camera);
    }
}

// --- INITIALIZATION ---
function initApp() {
    // Setup Modals
    setupModal(modals.evolution.overlay, modals.evolution.openBtn, modals.evolution.closeBtn);
    setupModal(modals.music.overlay, modals.music.openBtn, modals.music.closeBtn);
    // Note: Element filter modal setup might be needed if re-enabled

    // Setup Event Listeners
    homeElements.grid.addEventListener('click', (event) => {
        const tile = event.target.closest('.creature-grid-tile');
        if (!tile) return;
        const creatureId = tile.dataset.creatureId;
        const index = pokedexData.findIndex(c => c.id === creatureId);
        if (index !== -1) {
            displayCreature(index);
            showView('detail');
        }
    });

    detailElements.btnHome.addEventListener('click', () => showView('home'));
    detailElements.btnNext.addEventListener('click', () => displayCreature((currentIndex + 1) % pokedexData.length));
    detailElements.btnPrev.addEventListener('click', () => displayCreature((currentIndex - 1 + pokedexData.length) % pokedexData.length));

    // Populate UI
    populateCreatureGrid();
    
    // Initialize 3D Scene & Show Initial View
    initScene();
    displayCreature(0); // Display the first creature by default in the detail view's memory
    showView('home'); // But show the home view first
}

initApp();

