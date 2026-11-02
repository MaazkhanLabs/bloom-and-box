/**
 * Bloom & Box - PDP 3D Interactive Keepsake & Flower Inspector
 * Three.js WebGL viewport allowing 360° inspection of products with studio lighting and metallic shimmer.
 */

let pdp3D = {
  scene: null,
  camera: null,
  renderer: null,
  meshGroup: null,
  active: false,
  isDragging: false,
  prevMouse: { x: 0, y: 0 },
  rotVelocity: { x: 0, y: 0 }
};

function initPdp3D(canvasId = 'pdp-3d-canvas', productId = 'ks-01') {
  const container = document.getElementById(canvasId);
  if (!container) return;

  if (typeof THREE === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload = () => setupPdpScene(container, productId);
    document.head.appendChild(s);
  } else {
    setupPdpScene(container, productId);
  }
}

function setupPdpScene(container, productId) {
  try {
    const scene = new THREE.Scene();
    pdp3D.scene = scene;

    let width = container.clientWidth || 500;
    let height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2, 7.5);
    camera.lookAt(0, 0, 0);
    pdp3D.camera = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.cursor = 'grab';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    pdp3D.renderer = renderer;

    // Lighting
    const amb = new THREE.AmbientLight(0xfff5f0, 1.4);
    scene.add(amb);

    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(6, 10, 6);
    scene.add(key);

    const rimGold = new THREE.PointLight(0xffd700, 1.8, 15);
    rimGold.position.set(-5, 4, 4);
    scene.add(rimGold);

    // 3D Object Assembly Group
    const group = new THREE.Group();
    scene.add(group);
    pdp3D.meshGroup = group;

    // Build 3D Model according to Product Type
    buildPdpProductModel(group, productId);

    // Interaction Listeners (360 Drag)
    renderer.domElement.addEventListener('mousedown', (e) => {
      pdp3D.isDragging = true;
      renderer.domElement.style.cursor = 'grabbing';
      pdp3D.prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      pdp3D.isDragging = false;
      if (renderer.domElement) renderer.domElement.style.cursor = 'grab';
    });

    window.addEventListener('mousemove', (e) => {
      if (!pdp3D.isDragging) return;
      const dx = e.clientX - pdp3D.prevMouse.x;
      const dy = e.clientY - pdp3D.prevMouse.y;

      pdp3D.rotVelocity.x = dx * 0.007;
      pdp3D.rotVelocity.y = dy * 0.007;

      group.rotation.y += pdp3D.rotVelocity.x;
      group.rotation.x = Math.max(-0.6, Math.min(0.8, group.rotation.x + pdp3D.rotVelocity.y));

      pdp3D.prevMouse = { x: e.clientX, y: e.clientY };
    });

    // Touch support
    renderer.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        pdp3D.isDragging = true;
        pdp3D.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      pdp3D.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!pdp3D.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - pdp3D.prevMouse.x;
      const dy = e.touches[0].clientY - pdp3D.prevMouse.y;

      group.rotation.y += dx * 0.007;
      group.rotation.x = Math.max(-0.6, Math.min(0.8, group.rotation.x + dy * 0.007));

      pdp3D.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    // Window Resize
    window.addEventListener('resize', () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    // Render loop
    let clock = new THREE.Clock();

    function renderPdp() {
      requestAnimationFrame(renderPdp);
      const elapsed = clock.getElapsedTime();

      if (!pdp3D.isDragging) {
        group.rotation.y += 0.004 + pdp3D.rotVelocity.x;
        group.rotation.x = 0.2 + Math.sin(elapsed * 1.2) * 0.05;
        pdp3D.rotVelocity.x *= 0.92;
        pdp3D.rotVelocity.y *= 0.92;
      }

      renderer.render(scene, camera);
    }

    renderPdp();

  } catch (err) {
    console.warn("PDP 3D setup error:", err);
  }
}

function buildPdpProductModel(group, productId) {
  while (group.children.length > 0) {
    group.remove(group.children[0]);
  }

  const isGoldRose = productId === 'ks-01' || productId.includes('ks');

  if (isGoldRose) {
    // 24K Gold Dipped Rose on Velvet Display Cushion
    // 1. Cedarwood Base Plinth
    const plinthGeom = new THREE.CylinderGeometry(2.3, 2.5, 0.45, 36);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x5a3d28,
      roughness: 0.4,
      metalness: 0.15
    });
    const plinth = new THREE.Mesh(plinthGeom, plinthMat);
    plinth.position.y = -1.2;
    group.add(plinth);

    // 2. Velvet Cushion
    const cushionGeom = new THREE.CylinderGeometry(2.1, 2.1, 0.25, 36);
    const cushionMat = new THREE.MeshStandardMaterial({
      color: 0xb97980,
      roughness: 0.8,
      metalness: 0.05
    });
    const cushion = new THREE.Mesh(cushionGeom, cushionMat);
    cushion.position.y = -0.9;
    group.add(cushion);

    // 3. 24K Gold Dipped Rose Stem
    const stemGeom = new THREE.CylinderGeometry(0.04, 0.04, 2.6, 12);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.15
    });
    const stem = new THREE.Mesh(stemGeom, goldMat);
    stem.position.set(0, 0.3, 0);
    stem.rotation.z = 0.25;
    group.add(stem);

    // Gold Leaves
    const leafGeom = new THREE.BoxGeometry(0.5, 0.03, 0.9);
    const l1 = new THREE.Mesh(leafGeom, goldMat);
    l1.position.set(0.4, 0.2, 0);
    l1.rotation.set(0.3, 0.4, 0.5);
    group.add(l1);

    const l2 = new THREE.Mesh(leafGeom, goldMat);
    l2.position.set(-0.35, -0.2, 0.1);
    l2.rotation.set(-0.2, -0.5, -0.4);
    group.add(l2);

    // 4. Gold Rose Flower Head
    const headGroup = new THREE.Group();
    headGroup.position.set(-0.3, 1.4, 0);
    headGroup.rotation.z = -0.2;
    group.add(headGroup);

    // Layered Gold Petals
    const pGeom = new THREE.SphereGeometry(0.4, 16, 12);
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const radius = 0.2 + (i % 3) * 0.15;
      const p = new THREE.Mesh(pGeom, goldMat);
      p.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (i / 14) * 0.3);
      p.scale.set(0.8, 1.1, 0.3);
      p.rotation.set(0.3, 0.4, angle);
      headGroup.add(p);
    }

    // Glass Cloche Dome (Transparent protective cover)
    const domeGeom = new THREE.CylinderGeometry(2.0, 2.0, 3.2, 36, 1, true);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.5,
      side: THREE.DoubleSide
    });
    const dome = new THREE.Mesh(domeGeom, domeMat);
    dome.position.y = 0.45;
    group.add(dome);

    const domeTopGeom = new THREE.SphereGeometry(2.0, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeTop = new THREE.Mesh(domeTopGeom, domeMat);
    domeTop.position.y = 2.05;
    group.add(domeTop);

  } else {
    // Elegant Floral Bouquet Representation
    const bouquetGroup = new THREE.Group();
    group.add(bouquetGroup);

    const wrapGeom = new THREE.ConeGeometry(1.8, 3.2, 36, 1, true);
    const wrapMat = new THREE.MeshStandardMaterial({
      color: 0xf7edeb,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    const wrap = new THREE.Mesh(wrapGeom, wrapMat);
    wrap.rotation.x = Math.PI;
    wrap.position.y = -0.5;
    bouquetGroup.add(wrap);

    // Rose Heads Cluster
    const roseColors = [0xb97980, 0xe8c9c9, 0xffe4e6];
    for (let r = 0; r < 9; r++) {
      const angle = (r / 9) * Math.PI * 2;
      const rad = 0.7 + (r % 2) * 0.3;
      const rMat = new THREE.MeshStandardMaterial({
        color: roseColors[r % roseColors.length],
        roughness: 0.5
      });
      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12), rMat);
      bloom.position.set(Math.cos(angle) * rad, 1.2 + Math.random() * 0.4, Math.sin(angle) * rad);
      bouquetGroup.add(bloom);
    }
  }
}
