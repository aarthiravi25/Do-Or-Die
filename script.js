function createStylizedCoffin() {
    // Build coffin from an extruded tapered hexagon top profile
    const wTop = 1.2;
    const wBottom = 0.9;
    const halfTop = wTop / 2;
    const halfBottom = wBottom / 2;
 
 
    const profile = new THREE.Shape();
    profile.moveTo(-halfTop, 1.4);
    profile.lineTo( halfTop, 1.4);
    profile.lineTo( 0.95, 0.6);
    profile.lineTo( halfBottom, -1.4);
    profile.lineTo(-halfBottom, -1.4);
    profile.lineTo(-0.95, 0.6);
    profile.lineTo(-halfTop, 1.4);
 
 
    const thickness = 0.6;
    const extrudeSettings = {
        depth: thickness,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 2,
        steps: 1
    };
 
 
    const bodyGeom = new THREE.ExtrudeGeometry(profile, extrudeSettings);
    bodyGeom.rotateX(-Math.PI / 2);
    bodyGeom.translate(0, thickness/2, 0);
 
 
    const wood = new THREE.MeshStandardMaterial({ color: 0x6E4E2E, roughness: 0.7, metalness: 0.05, transparent: true, opacity: 0.9 });
    const body = new THREE.Mesh(bodyGeom, wood);
    body.castShadow = true; body.receiveShadow = true;
 
 
    // Lid as a clone (optional animation pivot omitted for simplicity)
    const lidGeom = bodyGeom.clone();
    const lidMat = new THREE.MeshStandardMaterial({ color: 0x7A5733, roughness: 0.65, metalness: 0.06, transparent: true, opacity: 0.9 });
    const lid = new THREE.Mesh(lidGeom, lidMat);
    lid.position.y = 0.02; // tiny offset
 
 
    // Simple cross
    const crossMat = new THREE.MeshStandardMaterial({ color: 0xE5D3A1, roughness: 0.4, metalness: 0.2 });
    const vbar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 1.0), crossMat);
    const hbar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.1), crossMat);
    hbar.position.z = 0.1;
    const cross = new THREE.Group();
    cross.add(vbar, hbar);
    cross.position.y = thickness + 0.02;
 
 
    // Group and slight tilt
    const group = new THREE.Group();
    group.add(body, lid, cross);
    group.rotation.z = -0.35;
    group.materials = [wood, lidMat];
    return group;
 }
 
 
 // Alias to satisfy API requirement: createCoffin()
 function createCoffin() {
    return createStylizedCoffin();
 }
 // Global state
 let appState = {
    currentPage: 1,
    userData: {},
    selectedFoods: [],
    survivalDays: 0
 };
 
 
 // Location data
 const locationData = {
    "United States": {
        "California": ["Los Angeles", "San Francisco", "San Diego"],
        "New York": ["New York City", "Albany", "Buffalo"],
        "Texas": ["Houston", "Dallas", "Austin"]
    },
    "India": {
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
        "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
        "Karnataka": ["Bangalore", "Mysore", "Mangalore"]
    },
    "United Kingdom": {
        "England": ["London", "Manchester", "Birmingham"],
        "Scotland": ["Edinburgh", "Glasgow", "Aberdeen"],
        "Wales": ["Cardiff", "Swansea", "Newport"]
    },
    "Canada": {
        "Ontario": ["Toronto", "Ottawa", "Hamilton"],
        "Quebec": ["Montreal", "Quebec City", "Laval"],
        "British Columbia": ["Vancouver", "Victoria", "Burnaby"]
    }
 };
 
 
 // Food nutrition values (legacy - kept for compatibility)
const foodNutrition = {
    // Fruits (+2 each)
    apple: 2, banana: 2, orange: 2, mango: 2, grapes: 2,
    pineapple: 2, strawberry: 2, blueberry: 2, watermelon: 2,
    // Vegetables (+2 each)
    spinach: 2, carrot: 2, broccoli: 2, tomato: 2, lettuce: 2,
    kale: 2, cauliflower: 2, cucumber: 2, bellpepper: 2, sweetpotato: 2,
    // Healthy snacks (+1 each)
    nuts: 1, yogurt: 1, oatmeal: 1, salmon: 1,
    quinoa: 1, avocado: 1, chicken: 1, tofu: 1,
    // Fast food (-1 each)
    pizza: -1, burger: -1, fries: -1, hotdog: -1,
    friedchicken: -1, taco: -1, nuggets: -1,
    // Junk food (-2 each)
    chips: -2, soda: -2, candy: -2, cookies: -2,
    icecream: -2, doughnut: -2, chocolate: -2, energydrink: -2
};
 
 
 // DOM Elements
 const pages = document.querySelectorAll('.page');
 const userForm = document.getElementById('userForm');
 const photoInput = document.getElementById('photo');
 const photoPreview = document.getElementById('photoPreview');
 const countrySelect = document.getElementById('country');
 const stateSelect = document.getElementById('state');
 const citySelect = document.getElementById('city');
 const selectedFoodsDiv = document.getElementById('selectedFoods');
 const humanFigure = document.getElementById('humanFigure');
 
 
 // Initialize app
 document.addEventListener('DOMContentLoaded', function() {
    initializeLocationDropdowns();
    setupEventListeners();
    // Optional: Uncomment for background sound
    // playBackgroundSound();
    setupThreeSummary();
    setupThreeScene();
 });
 
 
 // Initialize location dropdowns
 function initializeLocationDropdowns() {
    // Populate countries
    Object.keys(locationData).forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
 
 
    // Country change handler
    countrySelect.addEventListener('change', function() {
        const selectedCountry = this.value;
        stateSelect.innerHTML = '<option value="">Select state/province...</option>';
        citySelect.innerHTML = '<option value="">Select city...</option>';
       
        if (selectedCountry) {
            stateSelect.disabled = false;
            Object.keys(locationData[selectedCountry]).forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                stateSelect.appendChild(option);
            });
        } else {
            stateSelect.disabled = true;
            citySelect.disabled = true;
        }
    });
 
 
    // State change handler
    stateSelect.addEventListener('change', function() {
        const selectedCountry = countrySelect.value;
        const selectedState = this.value;
        citySelect.innerHTML = '<option value="">Select city...</option>';
       
        if (selectedState && selectedCountry) {
            citySelect.disabled = false;
            locationData[selectedCountry][selectedState].forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        } else {
            citySelect.disabled = true;
        }
    });
 }
 
 
 // Setup event listeners
 function setupEventListeners() {
    // Photo upload preview
    if (photoInput) photoInput.addEventListener('change', handlePhotoUpload);
   
    // Food selection checkboxes
    const foodCheckboxes = document.querySelectorAll('input[name="foods"]');
    foodCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedFoods);
    });
    // Initialize selected foods placeholder
    updateSelectedFoods();
 
 
    // Form submission
    if (userForm) userForm.addEventListener('submit', handleFormSubmit);
 
 
    // Navigation buttons
    const backBtn = document.getElementById('backBtn');
    const checkBtn = document.getElementById('checkNutritionBtn');
    const editFoodsBtn = document.getElementById('editFoodsBtn');
    const resetBtn = document.getElementById('resetBtn');
 
 
    if (backBtn) backBtn.addEventListener('click', () => navigateToPage(1));
    if (checkBtn) checkBtn.addEventListener('click', () => navigateToPage(3));
    if (editFoodsBtn) editFoodsBtn.addEventListener('click', () => navigateToPage(1));
    if (resetBtn) resetBtn.addEventListener('click', resetApp);
 
 
    // Hook slider input to survivalDays and drive scene
    // Slider removed; 3D scene driven by calculated survival only
 }
 
 
 // (Spline removed) SVG remains the default human representation
 
 
 // Three.js minimal scene for coffin + human
 let three = {
    renderer: null,
    scene: null,
    camera: null,
    human: null,
    coffinGroup: null,
    container: null,
    isReady: false
 };
 
 
 const HUMAN_BASE_SCALE = 0.30;
 
 
 function createHandyman() {
    const toon = (hex) => new THREE.MeshToonMaterial({ color: hex });
    const group = new THREE.Group();
 
 
    // Torso (overalls)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 1.1), toon(0x5aa9e6));
    torso.position.y = 2.3;
    group.add(torso);
 
 
    const bib = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.2), toon(0x3a86cf));
    bib.position.set(0, 3.0, 0.56);
    group.add(bib);
 
 
    const btnG = new THREE.CylinderGeometry(0.07, 0.07, 0.1, 16);
    const btnA = new THREE.Mesh(btnG, toon(0xffd166));
    const btnB = btnA.clone();
    btnA.rotation.z = Math.PI / 2; btnB.rotation.z = Math.PI / 2;
    btnA.position.set(-0.45, 3.0, 0.66);
    btnB.position.set(0.45, 3.0, 0.66);
    group.add(btnA, btnB);
 
 
    // Head + cap
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 24), toon(0xffe0bd));
    head.position.y = 3.9;
    group.add(head);
 
 
    const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.45, 20), toon(0xff6b6b));
    capTop.position.set(0, 4.4, 0);
    group.add(capTop);
    const capBrim = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.6), toon(0xff6b6b));
    capBrim.position.set(0, 4.18, 0.6);
    group.add(capBrim);
 
 
    // Eyes + smile
    const eyeG = new THREE.SphereGeometry(0.08, 12, 12);
    const pupil = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4 });
    const eyeL = new THREE.Mesh(eyeG, pupil);
    const eyeR = eyeL.clone();
    eyeL.position.set(-0.25, 4.0, 0.82);
    eyeR.position.set(0.25, 4.0, 0.82);
    group.add(eyeL, eyeR);
 
 
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 10, 24, Math.PI), toon(0xcc4b4b));
    smile.rotation.x = Math.PI / 2; smile.rotation.z = Math.PI;
    smile.position.set(0, 3.75, 0.8);
    group.add(smile);
 
 
    // Arms
    const upperArmG = new THREE.CylinderGeometry(0.2, 0.2, 1.0, 12);
    const skin = toon(0xffe0bd);
    const armL = new THREE.Mesh(upperArmG, skin); armL.position.set(-1.2, 3.2, 0); armL.rotation.z = Math.PI / 4;
    const armR = armL.clone(); armR.position.set(1.2, 3.2, 0); armR.rotation.z = -Math.PI / 2.8;
    group.add(armL, armR);
 
 
    const foreG = new THREE.BoxGeometry(0.4, 0.9, 0.4);
    const foreL = new THREE.Mesh(foreG, skin); foreL.position.set(-1.7, 2.7, 0.3); foreL.rotation.z = Math.PI / 7;
    const foreR = foreL.clone(); foreR.position.set(1.6, 2.5, 0.2); foreR.rotation.z = -Math.PI / 12;
    group.add(foreL, foreR);
 
 
    const handG = new THREE.SphereGeometry(0.26, 12, 12);
    const handL = new THREE.Mesh(handG, skin); const handR = handL.clone();
    handL.position.set(-2.05, 2.35, 0.35); handR.position.set(1.95, 2.05, 0.2);
    group.add(handL, handR);
 
 
    // Legs + boots
    const legG = new THREE.BoxGeometry(0.6, 1.2, 0.7);
    const legL = new THREE.Mesh(legG, toon(0x3a86cf)); const legR = legL.clone();
    legL.position.set(-0.45, 1.3, 0); legR.position.set(0.45, 1.3, 0);
    group.add(legL, legR);
    const bootG = new THREE.BoxGeometry(0.8, 0.35, 1.0);
    const bootM = toon(0x4d4d4d);
    const bootL = new THREE.Mesh(bootG, bootM); const bootR = bootL.clone();
    bootL.position.set(-0.5, 0.6, 0.1); bootR.position.set(0.5, 0.6, 0.1);
    group.add(bootL, bootR);
 
 
    // Shovel (simplified)
    const shovel = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.6, 12), new THREE.MeshStandardMaterial({ color: 0x9b6a3a, roughness: 0.9 }));
    handle.position.y = 2.3; handle.rotation.z = Math.PI / 8; shovel.add(handle);
    const grip = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 10, 20), toon(0x333333));
    grip.position.set(0.15, 4.0, 0); grip.rotation.y = Math.PI / 2; shovel.add(grip);
    const shape = new THREE.Shape();
    shape.moveTo(-0.6, 0.4); shape.quadraticCurveTo(0, 0.9, 0.6, 0.4); shape.lineTo(0.6, -0.1); shape.quadraticCurveTo(0.6, -1.0, 0, -1.4); shape.quadraticCurveTo(-0.6, -1.0, -0.6, -0.1); shape.lineTo(-0.6, 0.4);
    const bladeGeom = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, steps: 1 });
    bladeGeom.center();
    const blade = new THREE.Mesh(bladeGeom, new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 0.7, roughness: 0.25 }));
    blade.rotation.x = -Math.PI / 2.2; blade.position.set(-0.4, 0.8, 0.1); shovel.add(blade);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.25, 12), toon(0x666666));
    collar.position.set(-0.2, 1.2, 0); collar.rotation.z = Math.PI / 8; shovel.add(collar);
    shovel.position.set(0.7, 1.0, 0.2); shovel.rotation.z = -Math.PI / 12;
    group.add(shovel);
 
 
    // simple helper to move hands near shovel
    handR.position.set(1.9, 2.05, 0.2);
    handL.position.set(-2.05, 2.35, 0.35);
 
 
    // Slight initial scale to manageable size
    group.scale.setScalar(HUMAN_BASE_SCALE);
    return group;
 }
 
 
 function setupThreeScene() {
    const container = document.getElementById('threeScene');
    if (!container || !window.THREE) return;
    three.container = container;
    // When overlayed on slider, container may have zero height. Fallback to 200.
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 180;
 
 
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);


    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 6);
    camera.lookAt(0, 0, 0);


    if (THREE && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    if (THREE && THREE.ACESFilmicToneMapping !== undefined) renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;


    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(2.5, 3, 2.2);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 20;
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.4);
    scene.add(ambient, dir, hemi);
 
 
    // Controls
    let controls = null;
    if (THREE.OrbitControls) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.minDistance = 4; controls.maxDistance = 10;
    }
 
 
    // Helpers used to map canvas X pixels to world X positions across the slider
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
 
 
    // Track endpoints for horizontal motion (declare BEFORE using for coffin)
    // Adjust these to match exact visual left/right ends
    const positions = { humanStartX: -3.4, coffinX: 3.4 };
    const coffinEdgeMargin = 0.20; // larger gap so the coffin is fully visible at slider edge
 
 
    // Coffin on the far right
    const coffinGroup = createCoffin();
    // After creation we will align its right edge to the slider end using its bounding box
    coffinGroup.position.set(positions.coffinX, 0.05, 0);
    coffinGroup.rotation.set(Math.PI / 2, 0, 0);
    // Make coffin taller: stretch Y slightly while keeping other axes
    coffinGroup.scale.set(1.3, 1.6, 1.3);
    // Transparent-capable materials already set; reduce opacity
    if (coffinGroup.materials) coffinGroup.materials.forEach(m => { m.opacity = 0.4; m.transparent = true; });
    scene.add(coffinGroup);
 
 
    // Human: cute handyman
    const human = createHandyman();
    human.visible = true;
    scene.add(human);
    // Initial placement at start of track
    human.position.set(positions.humanStartX, 0.05, 0);
    // Face slightly toward the coffin for a clearer silhouette
    human.rotation.set(0, -0.15, 0);
 
 
    three = { renderer, scene, camera, human, coffinGroup, positions, container, isReady: true, t: 0, _sliderT: 0 };
 
 
    // Widen 3D slider to span (almost) full canvas width
    const rectForWidth = three.container.getBoundingClientRect();
    const pxWidth = rectForWidth.width || 900;
    const baseWorldSpan = positions.coffinX - positions.humanStartX;
    const worldUnitsPerPx = baseWorldSpan / Math.max(600, pxWidth);
    const desiredWorldWidth = pxWidth * worldUnitsPerPx;
    const extra = (desiredWorldWidth - baseWorldSpan) / 2;
    positions.humanStartX -= extra;
    positions.coffinX += extra;
    // Snap the human to the far-left start of the track for consistent mapping
    human.position.x = positions.humanStartX;
 
 
    // Remove 3D slider: keep only human and coffin; compute center for reference when needed
    const trackLen = positions.coffinX - positions.humanStartX;
    const centerX = (positions.coffinX + positions.humanStartX) / 2;
    three.track = null;
    three.trackParts = null;
    three.isDragging = false;
 
 
    function worldXAtCanvasX(px) {
        const rect = renderer.domElement.getBoundingClientRect();
        ndc.x = (px / rect.width) * 2 - 1;
        ndc.y = 0;
        raycaster.setFromCamera(ndc, camera);
        const hit = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, hit);
        return hit.x;
    }
 
 
    // Ensure the human's LEFT edge aligns to the track's left world X
    function alignHumanLeftEdge() {
        // Recompute transforms to get accurate bounds
        human.updateWorldMatrix(true, true);
        const bbox = new THREE.Box3().setFromObject(human);
        const currentLeft = bbox.min.x;
        const desiredLeft = positions.humanStartX;
        const dx = desiredLeft - currentLeft;
        if (Math.abs(dx) > 1e-4) {
            human.position.x += dx;
            // Re-run once to counter tiny rounding drift
            human.updateWorldMatrix(true, true);
        }
    }


        function alignCoffinRightEdge() {
        // Precisely align the coffin's right edge to the right end of the track with a generous inset
        const insetPx = 110; // increased margin to guarantee the full coffin is visible
        const rect = renderer.domElement.getBoundingClientRect();
        const rightWorld = worldXAtCanvasX(Math.max(0, rect.width - insetPx));
        // Compute current world right edge of the coffin via its bounding box
        const bbox = new THREE.Box3().setFromObject(coffinGroup);
        const currentRight = bbox.max.x;
        // Shift coffin so its right edge matches the rightWorld target
        const delta = rightWorld - currentRight;
        coffinGroup.position.x += delta;
    }
 
 
    function recomputeTrackSpanningCanvas(insetPx = 8) {
        const rect = renderer.domElement.getBoundingClientRect();
        positions.humanStartX = worldXAtCanvasX(insetPx);
        positions.coffinX = worldXAtCanvasX(rect.width - insetPx);
        alignCoffinRightEdge();
        alignHumanLeftEdge();
        const len = positions.coffinX - positions.humanStartX;
        const cx = (positions.coffinX + positions.humanStartX) / 2;
        // No slider meshes to update; only positions for human/coffin are used
    }
 
 
    // initial span with a small left inset so the human sits farther left
    recomputeTrackSpanningCanvas(8);
    three.recomputeTrack = recomputeTrackSpanningCanvas;
 
 
    // Also do an initial right-edge alignment now that the track is set
    alignCoffinRightEdge();
    alignHumanLeftEdge();
    // Expose aligners for external updates
    three.alignHumanLeft = alignHumanLeftEdge;
 
 
    // expose aligner for external updates
    three.alignCoffin = alignCoffinRightEdge;
 
 
    function animate() {
        if (!three.isReady) return;
        requestAnimationFrame(animate);
        // idle bob
        three.t += 0.02;
        if (three.human && three.human.visible) {
            const bob = Math.sin(three.t) * 0.02;
            three.human.position.y += (bob - (three.human._lastBob || 0));
            three.human._lastBob = bob;
        }
        if (controls) controls.update();
        renderer.render(scene, camera);
    }
    animate();
 
 
    window.addEventListener('resize', handleThreeResize);
    // Ensure initial placement
    updateThreeBySurvival();
 }
 
 
 function handleThreeResize() {
    if (!three.isReady) return;
    const w = three.container.clientWidth;
    const h = three.container.clientHeight || 260;
    three.renderer.setSize(w, h);
    three.camera.aspect = w / h;
    three.camera.updateProjectionMatrix();
 }
 
 
 function setupThreeSummary() {
    const container = document.getElementById('threeSceneSummary');
    if (!container || !window.THREE) return;
    const width = container.clientWidth || (container.parentElement ? container.parentElement.clientWidth : 300) || 300;
    const height = container.clientHeight || (container.parentElement ? container.parentElement.clientHeight : 300) || 300;
 
 
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
 
 
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4.3);
 
 
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(2, 3, 2);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.4);
    scene.add(ambient, dir, hemi);
 
 
    const human = createHandyman();
    // Enlarge for summary box while staying within container
    human.scale.multiplyScalar(1.45);
    human.position.set(0, 0, 0);
    human.rotation.y = Math.PI * 0.05;
    scene.add(human);
 
 
    // store on global to manage resize later if needed
    window.__threeSummary = { renderer, scene, camera, human, container };
 
 
    // Orbit controls (optional)
    let controls = null;
    if (THREE.OrbitControls) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.minDistance = 3; controls.maxDistance = 8;
    }
 
 
    // Hide fallback human image only after first render
    renderer.setAnimationLoop(() => {
        const state = window.__threeSummary;
        state._t = (state._t || 0) + 0.02;
        const bob = Math.sin(state._t) * 0.02;
        human.position.y += (bob - (human._lastBob || 0));
        human._lastBob = bob;
        if (controls) controls.update();
        renderer.render(scene, camera);
        const fallback = document.getElementById('humanFigure');
        if (fallback) fallback.style.display = 'none';
    });
 
 
    // Handle resize
    window.addEventListener('resize', () => {
        const w = container.clientWidth || (container.parentElement ? container.parentElement.clientWidth : 300) || 300;
        const h = container.clientHeight || (container.parentElement ? container.parentElement.clientHeight : 300) || 300;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    });
    return;
 }
 
 
 // (removed legacy mini-scenes)
 
 
 // removed positionSliderSidesToSlider (not used)
 
 
 // removed updateSliderSidesBySurvival (not used)
 
 
 // Handle photo upload
 function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photoPreview.innerHTML = `
                <img src="${e.target.result}" alt="User photo"
                     style="max-width: 150px; max-height: 150px; border-radius: 10px;
                            border: 3px solid #8b0000; box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
                            object-fit: cover;">
            `;
            appState.userData.photo = e.target.result;
        };
        reader.readAsDataURL(file);
    }
 }
 
 
 // Update selected foods display
 function updateSelectedFoods() {
    const selectedCheckboxes = document.querySelectorAll('input[name="foods"]:checked');
    appState.selectedFoods = Array.from(selectedCheckboxes).map(cb => cb.value);
   
    selectedFoodsDiv.innerHTML = '';
    if (appState.selectedFoods.length > 0) {
        appState.selectedFoods.forEach(food => {
            const chip = document.createElement('span');
            chip.className = 'food-chip';
            chip.textContent = food.charAt(0).toUpperCase() + food.slice(1);
            selectedFoodsDiv.appendChild(chip);
        });
    } else {
        selectedFoodsDiv.innerHTML = '<p style="color: #888; font-style: italic;">No foods selected... choose your final feast!</p>';
    }
 }
 
 
 // Handle form submission
 function handleFormSubmit(event) {
    event.preventDefault();
   
    const formData = new FormData(userForm);
   
    // Validate required fields
    if (!formData.get('name') || !formData.get('age') || !formData.get('gender') ||
        !formData.get('country') || !formData.get('state') || !formData.get('city') ||
        appState.selectedFoods.length === 0) {
       
        alert('💀 All fields of doom must be completed! Choose at least one food for your final feast!');
        return;
    }
 
 
    // Store user data
    appState.userData = {
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        country: formData.get('country'),
        state: formData.get('state'),
        city: formData.get('city'),
        photo: appState.userData.photo || null,
        foods: [...appState.selectedFoods]
    };
 
 
    // Navigate to summary page
    navigateToPage(2);
    displayUserSummary();
 }
 
 
 // Display user summary on page 2
 function displayUserSummary() {
    const summaryContent = document.getElementById('userSummary');
    const userData = appState.userData;
   
    // Group foods by category
    const fruits = userData.foods.filter(food => ['apple', 'banana', 'orange', 'mango', 'grapes', 'pineapple', 'strawberry', 'blueberry', 'watermelon'].includes(food));
    const vegetables = userData.foods.filter(food => ['spinach', 'carrot', 'broccoli', 'tomato', 'lettuce', 'kale', 'cauliflower', 'cucumber', 'bellpepper', 'sweetpotato'].includes(food));
    const healthy = userData.foods.filter(food => ['nuts', 'yogurt', 'oatmeal', 'salmon', 'quinoa', 'avocado', 'chicken', 'tofu'].includes(food));
    const fastFood = userData.foods.filter(food => ['pizza', 'burger', 'fries', 'hotdog', 'friedchicken', 'taco', 'nuggets'].includes(food));
    const junkFood = userData.foods.filter(food => ['chips', 'soda', 'candy', 'cookies', 'icecream', 'doughnut', 'chocolate', 'energydrink'].includes(food));
 
 
    summaryContent.innerHTML = `
        ${userData.photo ? `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <img src="${userData.photo}" alt="${userData.name}"
                     style="width: 120px; height: 120px; border-radius: 50%;
                            border: 3px solid #8b0000; box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
                            object-fit: cover;">
            </div>
        ` : ''}
       
        <div style="font-size: 1.1rem; line-height: 1.6;">
            <p><strong>Name:</strong> ${userData.name}</p>
            <p><strong>Age:</strong> ${userData.age} years</p>
            <p><strong>Gender:</strong> ${userData.gender}</p>
            <p><strong>Location:</strong> ${userData.city}, ${userData.state}, ${userData.country}</p>
           
            <h3 style="color: #ff6b6b; margin: 1rem 0 0.5rem 0; font-family: 'Nosifer', cursive;">Final Feast:</h3>
           
            ${fruits.length > 0 ? `<p><strong>🍎 Fruits of Life:</strong> ${fruits.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')}</p>` : ''}
            ${vegetables.length > 0 ? `<p><strong>🥬 Vegetables of Virtue:</strong> ${vegetables.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')}</p>` : ''}
            ${healthy.length > 0 ? `<p><strong>🥜 Healthy Sustenance:</strong> ${healthy.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')}</p>` : ''}
            ${fastFood.length > 0 ? `<p><strong>🍕 Fast Food Sins:</strong> ${fastFood.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')}</p>` : ''}
            ${junkFood.length > 0 ? `<p><strong>🍟 Junk of Doom:</strong> ${junkFood.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')}</p>` : ''}
        </div>
    `;
 }
 
 
 // Note: Old advanced nutrition calculation functions removed
// Now using the new calculateSurvivalDays() function with age factors and food scoring
 
 
 // Calculate survival and show results (enhanced)
function calculateSurvival() {
    const age = appState.userData.age;
    const foods = appState.userData.foods;
   
    // Use the new calculateSurvivalDays function
    const survivalDays = calculateSurvivalDays(age, foods);
    // Store the full calculated days for simulation logic
    appState.fullSurvivalDays = survivalDays;
    // Cap at 10 only for UI meter/slider display
    appState.survivalDays = Math.min(10, survivalDays);
    
    // Calculate breakdown for display
    let totalPoints = 0;
    const foodBreakdown = [];
    foods.forEach(food => {
        const points = foodNutrition[food] || 0;
        totalPoints += points;
        foodBreakdown.push({ name: food, points });
    });

    // Display results
    displaySurvivalResults(survivalDays, totalPoints, foodBreakdown, survivalDays - appState.survivalDays);
   
    // Update survival meter
    const meterFill = document.getElementById('survivalMeterFill');
    if (meterFill) {
        const pct = Math.min(100, Math.max(0, (appState.survivalDays / 10) * 100));
        meterFill.style.width = pct + '%';
    }

    // Run the simulation to update webpage elements
    runSimulation(appState.survivalDays);

    // Drive 3D scene based on survival days
    updateThreeBySurvival();
}
 
 
 // Display survival results
function displaySurvivalResults(survivalDays, totalPoints, foodBreakdown, adjustment) {
    const resultsDiv = document.getElementById('survivalResults');
   
    // Calculate years and remaining days
    const years = Math.floor(survivalDays / 365);
    const remainingDays = survivalDays % 365;
    const months = Math.floor(remainingDays / 30);
    const finalDays = remainingDays % 30;
    
    // Format the time display
    let timeDisplay = '';
    if (years > 0) {
        timeDisplay += `${years} year${years > 1 ? 's' : ''}`;
        if (months > 0 || finalDays > 0) {
            timeDisplay += ', ';
        }
    }
    if (months > 0) {
        timeDisplay += `${months} month${months > 1 ? 's' : ''}`;
        if (finalDays > 0) {
            timeDisplay += ', ';
        }
    }
    if (finalDays > 0 || (years === 0 && months === 0)) {
        timeDisplay += `${finalDays} day${finalDays !== 1 ? 's' : ''}`;
    }
    
    // If survival is very short, show in days only
    if (survivalDays < 30) {
        timeDisplay = `${survivalDays} day${survivalDays !== 1 ? 's' : ''}`;
    }
    
    const survivalMessage = appState.survivalDays === 0 ?
        "💀 IMMEDIATE DOOM! Your soul has been consumed!" :
        appState.survivalDays === 1 ?
        "⚰️ Death knocks at your door..." :
        appState.survivalDays <= 2 ?
        "👻 The coffin awaits your arrival..." :
        appState.survivalDays <= 5 ?
        "🌙 You walk in the shadow of death..." :
        "✨ You have defied the darkness... for now.";
   
    resultsDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <h3 style=\"color: #ff0000; font-size: 1.8rem; font-family: 'Creepster', cursive;\">
                ${survivalMessage}
            </h3>
            <div style="font-size: 2.5rem; color: #ff6b6b; margin: 1rem 0; text-align: center;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">Predicted Survival Time:</div>
                <div style="font-size: 3rem; color: #ff0000; text-shadow: 0 0 20px rgba(255, 0, 0, 0.5);">
                    ${timeDisplay}
                </div>
            </div>
            <div style="font-size: 1.5rem; color: #ffaa00; margin: 1rem 0;">
                Total Days: <strong>${survivalDays.toLocaleString()}</strong>
            </div>
        </div>
    `;
}
 
 
 // (removed legacy animateCoffinScene)
 
 
 // (removed legacy updateSceneBySlider)
 
 
 // (removed legacy bottom visual code)


// Helper to uniformly set opacity/transparent across an object's materials
function setObjectOpacity(object3d, opacity = 1, transparent = false) {
   if (!object3d) return;
   object3d.traverse(node => {
      const mat = node.material;
      if (!mat) return;
      const mats = Array.isArray(mat) ? mat : [mat];
      mats.forEach(m => { if (m && typeof m.opacity === 'number') { m.opacity = opacity; m.transparent = transparent; } });
   });
}


// Drive 3D scene state based on survival days
function updateThreeBySurvival() {
    // Use full days for simulation thresholds; UI may show a capped value
    const days = typeof appState.fullSurvivalDays === 'number' ? appState.fullSurvivalDays : appState.survivalDays;
    // If main three scene isn't ready yet, skip
    if (!three || !three.isReady) return;
   
    // Ensure coffin is properly aligned to the slider edge
    if (three.alignCoffin) three.alignCoffin();
   
    const coffin = three.coffinGroup;
    const { humanStartX, coffinX } = three.positions || { humanStartX: -2.6, coffinX: 2.6 };
 
 
    // Slider-driven proportional position (used for UI), but simulation rules below
    const slider = null; // HTML slider removed
    let t = typeof three._sliderT === 'number' ? three._sliderT : 0;
    if (!three.isDragging) {
        // Keep t updated but do not rely on it for >15 days movement
        t = Math.min(1, Math.max(0, days / 10));
        three._sliderT = t;
    }
 
 
    if (days > 15) {
        if (coffin && coffin.materials) coffin.materials.forEach(m => m.opacity = 0.6);
        three.human.visible = true;
        // Reset human scale and rotation
        three.human.scale.set(1, 1, 1);
        three.human.rotation.set(0, 0, 0);
        // Ensure the human starts from the left edge exactly once
        try {
            if (!three.human._startedFromLeft) {
                if (three.alignHumanLeft) three.alignHumanLeft();
                three.human._startedFromLeft = true;
            }
        } catch (_) {}
        // Compute approach target near the coffin's left edge and animate toward it
        const coffinBBox = new THREE.Box3().setFromObject(three.coffinGroup);
        const coffinLeftX = coffinBBox.min.x;
        const humanBBox = new THREE.Box3().setFromObject(three.human);
        const humanWidth = Math.max(0.001, humanBBox.max.x - humanBBox.min.x);
        const approachGap = Math.max(0.30, humanWidth * 0.5); // keep outside coffin
        const targetX = coffinLeftX - approachGap;
        const needsMove = Math.abs((three.human.position.x || 0) - targetX) > 0.01;
        if (needsMove) {
            if (window.gsap) {
                try { window.gsap.killTweensOf(three.human.position); } catch(_){}
                window.gsap.to(three.human.position, { x: targetX, duration: 1.0, ease: 'power2.out' });
            } else {
                three.human.position.x = targetX;
            }
        }
        // Center vertically on the track
        three.human.updateWorldMatrix(true, true);
        { const bbox = new THREE.Box3().setFromObject(three.human); const c = new THREE.Vector3(); bbox.getCenter(c); three.human.position.y += -c.y; }
    } else if (days >= 1) {
        // Clear the start flag so next >15 run repositions from left again
        if (three.human) three.human._startedFromLeft = false;
        if (coffin && coffin.materials) coffin.materials.forEach(m => m.opacity = 0.45);
        three.human.visible = true;
        three.human.scale.set(0.5, 0.5, 0.5);
        // Position inside the coffin volume and tilt to match
        three.human.rotation.set(0, 0, 0);
        three.human.position.set(three.coffinGroup.position.x - 0.1, 0, 0);
        // Center vertically inside coffin/track
        three.human.updateWorldMatrix(true, true);
        { const bbox = new THREE.Box3().setFromObject(three.human); const c = new THREE.Vector3(); bbox.getCenter(c); three.human.position.y += -c.y; }
    } else {
        if (three.human) three.human._startedFromLeft = false;
        if (coffin && coffin.materials) coffin.materials.forEach(m => m.opacity = 0.3);
        three.human.visible = false;
    }
 }
 
 
 // Smoothly animate the human along X (requestAnimationFrame tween)
 let __humanTween = null;
 function animateHumanToX(targetX) {
    if (!three || !three.human) return;
    // Prefer GSAP if available
    if (window.gsap) {
        try {
            window.gsap.killTweensOf(three.human.position);
            window.gsap.to(three.human.position, { x: targetX, duration: 0.5, ease: 'power2.out' });
            return;
        } catch (_) { /* fall back to rAF below */ }
    }
    if (__humanTween) cancelAnimationFrame(__humanTween);
    const startX = three.human.position.x;
    const duration = 500; // ms
    const start = performance.now();
    function step(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = t * (2 - t); // easeOutQuad
        three.human.position.x = startX + (targetX - startX) * eased;
        if (t < 1) {
            __humanTween = requestAnimationFrame(step);
        }
    }
    __humanTween = requestAnimationFrame(step);
 }
 
 
 // Navigation between pages
 function navigateToPage(pageNumber) {
    // Special handling for page 3
    if (pageNumber === 3) {
        calculateSurvival();
    }
   
    pages.forEach(page => {
        page.classList.remove('active');
    });
   
    setTimeout(() => {
        document.querySelector(`[data-page="${pageNumber}"]`).classList.add('active');
        appState.currentPage = pageNumber;
        // Ensure the new page starts at the top of the viewport
        if (pageNumber === 3) {
            try {
                // Force both document and container to top immediately
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
                window.scrollTo(0, 0);
                const page3 = document.getElementById('page3');
                if (page3 && typeof page3.scrollTo === 'function') {
                    page3.scrollTo(0, 0);
                }
            } catch (_) {}
        }
    }, 250);
 }
 
 
 // Reset application
 function resetApp() {
    if (confirm('💀 Are you sure you want to reset your fate?')) {
        appState = {
            currentPage: 1,
            userData: {},
            selectedFoods: [],
            survivalDays: 0
        };
       
        // Reset form
        userForm.reset();
        photoPreview.innerHTML = '';
        selectedFoodsDiv.innerHTML = '';
       
        // Reset dropdowns
        stateSelect.innerHTML = '<option value="">Select country first...</option>';
        citySelect.innerHTML = '<option value="">Select state first...</option>';
        stateSelect.disabled = true;
        citySelect.disabled = true;
       
        // Uncheck all food checkboxes
        document.querySelectorAll('input[name="foods"]').forEach(cb => cb.checked = false);
       
        // Navigate to first page
        navigateToPage(1);
    }
 }
 
 
 // Optional background sound function (commented implementation)
 function playBackgroundSound() {
    // Uncomment and add your horror sound file
    // const audio = new Audio('horror-background.mp3');
    // audio.loop = true;
    // audio.volume = 0.3;
    // document.addEventListener('click', () => audio.play(), { once: true });
 }
 
 
 // Keyboard navigation support
 document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && appState.currentPage !== 1) {
        if (appState.currentPage === 2) {
            navigateToPage(1);
        } else if (appState.currentPage === 3) {
            navigateToPage(2);
        }
    }
 });
 
 
 // Add ARIA live region for screen readers
 const liveRegion = document.createElement('div');
 liveRegion.setAttribute('aria-live', 'polite');
 liveRegion.setAttribute('aria-atomic', 'true');
 liveRegion.style.position = 'absolute';
 liveRegion.style.left = '-10000px';
 liveRegion.style.width = '1px';
 liveRegion.style.height = '1px';
 liveRegion.style.overflow = 'hidden';
 document.body.appendChild(liveRegion);
 
 
 // Update live region when navigating pages
 function updateLiveRegion(message) {
    liveRegion.textContent = message;
 }
 
 
 // Enhanced navigation with accessibility announcements
 const originalNavigateToPage = navigateToPage;
 navigateToPage = function(pageNumber) {
    const pageNames = {1: 'User Information Form', 2: 'Summary Page', 3: 'Survival Results'};
    updateLiveRegion(`Navigated to ${pageNames[pageNumber]}`);
    originalNavigateToPage(pageNumber);
    // After navigation, ensure the summary 3D canvas resizes correctly when page 2 becomes visible
    if (pageNumber === 2 && window.__threeSummary) {
        try {
            const { renderer, camera, container } = window.__threeSummary;
            const w = container.clientWidth || (container.parentElement ? container.parentElement.clientWidth : 300) || 300;
            const h = container.clientHeight || (container.parentElement ? container.parentElement.clientHeight : 300) || 300;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        } catch (_) {}
    }
};

// Health Survival Simulation Functions

/**
 * Calculate survival days based on age and diet
 * @param {number} age - Person's age
 * @param {Array} foods - Array of food items selected
 * @returns {number} - Calculated survival days
 */
function calculateSurvivalDays(age, foods) {
    // Age factor calculation
    let ageFactor;
    if (age < 18) {
        ageFactor = 45;
    } else if (age < 30) {
        ageFactor = 32;
    } else if (age < 50) {
        ageFactor = 28;
    } else if (age < 70) {
        ageFactor = 15;
    } else {
        ageFactor = 2;
    }
    
    // Food scoring
    let foodScore = 0;
    foods.forEach(food => {
        // Healthy foods (fruits, vegetables, healthy snacks)
        if (['apple', 'banana', 'orange', 'mango', 'grapes', 'pineapple', 'strawberry', 'blueberry', 'watermelon',
             'spinach', 'carrot', 'broccoli', 'tomato', 'lettuce', 'kale', 'cauliflower', 'cucumber', 'bellpepper', 'sweetpotato',
             'nuts', 'yogurt', 'oatmeal', 'salmon', 'quinoa', 'avocado', 'chicken', 'tofu'].includes(food)) {
            foodScore += 100;
        }
        // Unhealthy foods (fast food, junk food)
        else if (['pizza', 'burger', 'fries', 'hotdog', 'friedchicken', 'taco', 'nuggets',
                  'chips', 'soda', 'candy', 'cookies', 'icecream', 'doughnut', 'chocolate', 'energydrink'].includes(food)) {
            foodScore -= 30;
        }
    });
    
    // Calculate total health score
    const totalHealthScore = ageFactor + foodScore;
    
    // Convert to days: multiply by 5, floor, add random 0-4
    let survivalDays = Math.floor(totalHealthScore * 5) + Math.floor(Math.random() * 5);
    
    // Cap at maximum 40 years (365 * 40 = 14600 days)
    survivalDays = Math.min(survivalDays, 14600);
    
    // Ensure non-negative
    survivalDays = Math.max(0, survivalDays);
    
    return survivalDays;
}

/**
 * Run simulation and update webpage elements based on survival days
 * @param {number} days - Survival days calculated
 */
function runSimulation(days) {
    // Get DOM elements - using existing elements from the page
    const humanSim = document.getElementById('humanFigure');
    const coffin = document.getElementById('threeScene');
    const healthMessage = document.getElementById('survivalResults');
    
    // Helper function to format time display
    function formatTimeDisplay(totalDays) {
        if (totalDays === 0) return '0 days';
        
        const years = Math.floor(totalDays / 365);
        const remainingDays = totalDays % 365;
        const months = Math.floor(remainingDays / 30);
        const finalDays = remainingDays % 30;
        
        let timeDisplay = '';
        if (years > 0) {
            timeDisplay += `${years} year${years > 1 ? 's' : ''}`;
            if (months > 0 || finalDays > 0) {
                timeDisplay += ', ';
            }
        }
        if (months > 0) {
            timeDisplay += `${months} month${months > 1 ? 's' : ''}`;
            if (finalDays > 0) {
                timeDisplay += ', ';
            }
        }
        if (finalDays > 0 || (years === 0 && months === 0)) {
            timeDisplay += `${finalDays} day${finalDays !== 1 ? 's' : ''}`;
        }
        
        // If survival is very short, show in days only
        if (totalDays < 30) {
            timeDisplay = `${totalDays} day${totalDays !== 1 ? 's' : ''}`;
        }
        
        return timeDisplay;
    }
    
    // Remove all existing classes first
    if (humanSim) {
        humanSim.classList.remove('moving', 'in-coffin', 'dead');
    }
    if (coffin) {
        coffin.classList.remove('moving', 'in-coffin', 'dead');
    }
    if (healthMessage) {
        healthMessage.classList.remove('health-good', 'health-warning', 'health-danger');
    }
    
    // Apply logic based on survival days
    if (days > 15) {
        // Human moves toward coffin but doesn't enter
        if (humanSim) {
            humanSim.classList.add('moving');
        }
        if (healthMessage) {
            healthMessage.classList.add('health-good');
            // Update the message in the results div
            const messageElement = healthMessage.querySelector('h3');
            if (messageElement) {
                const timeDisplay = formatTimeDisplay(days);
                messageElement.textContent = `You have ${timeDisplay} of survival! Your healthy choices are paying off!`;
            }
        }
    } else if (days >= 1 && days <= 15) {
        // Human ends up inside transparent coffin
        if (humanSim) {
            humanSim.classList.add('in-coffin');
        }
        if (coffin) {
            coffin.classList.add('in-coffin');
        }
        // Intentionally no warning message shown for 1-15 days
    } else if (days === 0) {
        // Only coffin shown, human is dead
        if (humanSim) {
            humanSim.classList.add('dead');
        }
        if (coffin) {
            coffin.classList.add('dead');
        }
        if (healthMessage) {
            healthMessage.classList.add('health-danger');
            // Update the message in the results div
            const messageElement = healthMessage.querySelector('h3');
            if (messageElement) {
                messageElement.textContent = 'DEATH: Your time has come! The reaper claims another soul!';
            }
        }
    }
}

// Export functions for external use
window.calculateSurvivalDays = calculateSurvivalDays;
window.runSimulation = runSimulation;
 