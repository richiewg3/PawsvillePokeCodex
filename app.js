import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/loaders/GLTFLoader.js';

// --- DATA ---
const elementAssetMap = {
    Nature: "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/2.png",
    Aqua: "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/3.png",
    Fire: "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/4.png",
    Poison: "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/5.png",
    Neon: "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/6.png",
    Dream: "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/7.png",
    Wild: "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/8.png",
    Death: "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/9.png",
    Earth: "https://raw.githubusercontent.com/richiewg3/3DPawsVdeX_Modelz/dffcc6acf1a5635ab10b4de1daec39559627da24/10.png"
};

let pokedexData = [];
let currentIndex = 0;

// --- DOM Elements ---
const getEl = (id) => document.getElementById(id);
const creatureNameEl = getEl('creature-name'),
    creatureSpeciesEl = getEl('creature-species'),
    rarityStarsEl = getEl('rarity-stars'),
    elementImgEl = getEl('element-img'),
    habitatTextEl = getEl('habitat-text'),
    dexEntryEl = getEl('dex-entry'),
    galleryImg1El = getEl('gallery-img-1'),
    galleryImg2El = getEl('gallery-img-2'),
    galleryVideoEl = getEl('gallery-video'),
    galleryVideoSrcEl = getEl('gallery-video-src'),
    btnNext = getEl('btn-next'),
    btnPrev = getEl('btn-prev'),
    btnRandom = getEl('btn-random'),
    btnHome = getEl('btn-home'),
    btnElementFilter = getEl('btn-element-filter'),
    openModalBtn = getEl('open-evolution-modal-btn'),
    evolutionModal = getEl('evolution-modal-overlay'),
    closeEvolutionModalBtn = getEl('close-evolution-modal-btn'),
    evolutionChoicesEl = getEl('evolution-choices'),
    elementFilterModal = getEl('element-filter-modal-overlay'),
    closeElementFilterModalBtn = getEl('close-element-filter-modal-btn'),
    elementGridEl = getEl('element-grid'),
    elementResultsListEl = getEl('element-results-list'),
    elementViewSelect = getEl('element-view-select'),
    elementViewResults = getEl('element-view-results'),
    elementResultsTitle = getEl('element-results-title'),
    elementBackBtn = getEl('element-back-btn');

// --- Display Logic ---
function displayCreature(index) {
    const creature = pokedexData[index];
    currentIndex = index;

    creatureNameEl.textContent = `${creature.id}-${creature.name}`;
    creatureSpeciesEl.textContent = `Species: ${creature.species}`;
    renderRarity(creature.rarity);
    elementImgEl.src = elementAssetMap[creature.element];
    habitatTextEl.textContent = creature.habitat;
    dexEntryEl.textContent = creature.dexEntry;
    galleryImg1El.src = creature.galleryImg1.src;
    galleryImg1El.alt = creature.galleryImg1.alt;
    galleryImg2El.src = creature.galleryImg2.src;
    galleryImg2El.alt = creature.galleryImg2.alt;
    galleryVideoSrcEl.src = creature.videoUrl;
    galleryVideoEl.load();

    const baseEvoKey = Object.keys(creature.evolutions)[0];
    loadModel(creature.evolutions[baseEvoKey].modelUrl);
    populateEvolutionModal(creature.evolutions);
}

function renderRarity(rarity) {
    rarityStarsEl.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('span');
        star.className = 'material-icons';
        star.textContent = i < rarity ? 'star' : 'star_border';
        star.classList.add(i < rarity ? 'text-yellow-400' : 'text-gray-500');
        rarityStarsEl.appendChild(star);
    }
}

// --- Navigation ---
btnNext.addEventListener('click', () => displayCreature((currentIndex + 1) % pokedexData.length));
btnPrev.addEventListener('click', () => displayCreature((currentIndex - 1 + pokedexData.length) % pokedexData.length));
btnRandom.addEventListener('click', () => {
    let newIndex;
    do { newIndex = Math.floor(Math.random() * pokedexData.length); } while (pokedexData.length > 1 && newIndex === currentIndex);
    displayCreature(newIndex);
});
btnHome.addEventListener('click', () => displayCreature(0));

// --- Modal Logic ---
function setupModal(modal, openBtn, closeBtn) {
    const open = () => { modal.classList.remove('hidden'); setTimeout(() => modal.classList.add('visible'), 10); };
    const close = () => { modal.classList.remove('visible'); setTimeout(() => modal.classList.add('hidden'), 300); };
    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    return close;
}

const closeEvolutionModal = setupModal(evolutionModal, openModalBtn, closeEvolutionModalBtn);
const closeElementFilterModal = setupModal(elementFilterModal, btnElementFilter, closeElementFilterModalBtn);

function populateEvolutionModal(evolutions) {
    evolutionChoicesEl.innerHTML = '';
    for (const key in evolutions) {
        const btn = document.createElement('button');
        btn.textContent = evolutions[key].name;
        btn.className = 'evolution-choice-btn interactive-button w-full py-2 text-lg';
        btn.onclick = () => { loadModel(evolutions[key].modelUrl); closeEvolutionModal(); };
        evolutionChoicesEl.appendChild(btn);
    }
}

// --- Element Filter Logic ---
function populateElementGrid() {
    elementGridEl.innerHTML = '';
    for (const typeName in elementAssetMap) {
        const img = document.createElement('img');
        img.src = elementAssetMap[typeName];
        img.alt = typeName;
        img.className = 'interactive-icon w-full h-auto'; // Let the grid control the size
        img.onclick = () => showElementResults(typeName);
        elementGridEl.appendChild(img);
    }
}

function showElementResults(typeName) {
    elementResultsTitle.textContent = `${typeName} Creatures`;
    elementResultsListEl.innerHTML = '';
    const results = pokedexData.filter(c => c.element === typeName);
    if (results.length > 0) {
        results.forEach(creature => {
            const btn = document.createElement('button');
            btn.textContent = `${creature.id} - ${creature.name}`;
            btn.className = 'creature-list-item interactive-button w-full py-2 text-md text-left px-4';
            btn.onclick = () => {
                const creatureIndex = pokedexData.findIndex(c => c.id === creature.id);
                displayCreature(creatureIndex);
                closeElementFilterModal();
            };
            elementResultsListEl.appendChild(btn);
        });
    } else {
        const noResults = document.createElement('p');
        noResults.textContent = 'No creatures found for this element.';
        noResults.className = 'text-center';
        elementResultsListEl.appendChild(noResults);
    }
    elementViewSelect.classList.add('hidden');
    elementViewResults.classList.remove('hidden');
}

elementBackBtn.addEventListener('click', () => {
    elementViewResults.classList.add('hidden');
    elementViewSelect.classList.remove('hidden');
});

// --- Three.js Scene ---
let scene, camera, renderer, controls, currentModel = null;
const container = getEl('model-viewer-container'), loader = new GLTFLoader();

function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 3;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    Object.assign(controls, { enableDamping: true, dampingFactor: 0.05, enableZoom: false, enablePan: false, autoRotate: true, autoRotateSpeed: 1.0 });
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    const directionalLight = new THREE.DirectionalLight(0xfff0dd, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);
    window.addEventListener('resize', onWindowResize);
    animate();
}

function loadModel(modelUrl) {
    if (currentModel) scene.remove(currentModel);
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
    }, undefined, (error) => console.error('An error happened:', error));
}

function onWindowResize() {
    if (!container || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// --- Initial Load ---
async function initApp() {
    // Fetch data from the JSON file
    try {
        const response = await fetch('data.json');
        pokedexData = await response.json();
    } catch (error) {
        console.error("Could not load Pokedex data:", error);
        return; // Stop the app if data fails to load
    }

    initScene();
    populateElementGrid();
    displayCreature(currentIndex);
}

initApp();
