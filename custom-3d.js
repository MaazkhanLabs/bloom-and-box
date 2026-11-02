/**
 * Bloom & Box - 360° Interactive 3D Gift Box Configurator (Three.js WebGL)
 * Supports full orbit rotation, procedural PBR textures (Linen, Velvet, Cedarwood),
 * ribbon styles, interior floral arrangements, and interactive unboxing/lid animations.
 */

let custom3D = {
  scene: null,
  camera: null,
  renderer: null,
  boxGroup: null,
  lidMesh: null,
  bodyMesh: null,
  ribbonGroup: null,
  flowersGroup: null,
  isUnboxed: false,
  autoRotate: true,
  isDragging: false,
  prevMouse: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 }
};

function initCustom3D(canvasId = 'custom-3d-stage') {
  const container = document.getElementById(canvasId);
  if (!container) return;

  // Ensure Three.js is loaded
  if (typeof THREE === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload = () => setupConfigurator(container);
    document.head.appendChild(s);
  } else {
    setupConfigurator(container);
  }
}

function setupConfigurator(container) {
  try {
    const scene = new THREE.Scene();
    custom3D.scene = scene;

    let width = container.clientWidth || 450;
    let height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 9.5);
    camera.lookAt(0, 0, 0);
    custom3D.camera = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.cursor = 'grab';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    custom3D.renderer = renderer;

    // Studio Lighting
    const amb = new THREE.AmbientLight(0xfff7f5, 1.3);
    scene.add(amb);

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(5, 10, 7);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xe8c9c9, 0.8);
    rim.position.set(-6, 4, -5);
    scene.add(rim);

    const bottomGlow = new THREE.PointLight(0xb97980, 0.6, 12);
    bottomGlow.position.set(0, -4, 2);
    scene.add(bottomGlow);

    // Main 3D Box Assembly Group
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);
    custom3D.boxGroup = boxGroup;

    // Shadow Floor Disc
    const shadowGeom = new THREE.PlaneGeometry(7, 7);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x443535,
      transparent: true,
      opacity: 0.12,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.8;
    scene.add(shadowMesh);

    // Build Initial Hat Box
    rebuild3DBoxGeometry('signature', 0xf7edeb, 0xb97980);

    // Interaction Listeners (Drag to Orbit 360)
    renderer.domElement.addEventListener('mousedown', (e) => {
      custom3D.isDragging = true;
      custom3D.autoRotate = false;
      renderer.domElement.style.cursor = 'grabbing';
      custom3D.prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      custom3D.isDragging = false;
      if (renderer.domElement) renderer.domElement.style.cursor = 'grab';
    });

    window.addEventListener('mousemove', (e) => {
      if (!custom3D.isDragging) return;
      const dx = e.clientX - custom3D.prevMouse.x;
      const dy = e.clientY - custom3D.prevMouse.y;

      custom3D.velocity.x = dx * 0.007;
      custom3D.velocity.y = dy * 0.007;

      boxGroup.rotation.y += custom3D.velocity.x;
      boxGroup.rotation.x = Math.max(-0.5, Math.min(0.8, boxGroup.rotation.x + custom3D.velocity.y));

      custom3D.prevMouse = { x: e.clientX, y: e.clientY };
    });

    // Touch support for mobile
    renderer.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        custom3D.isDragging = true;
        custom3D.autoRotate = false;
        custom3D.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      custom3D.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!custom3D.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - custom3D.prevMouse.x;
      const dy = e.touches[0].clientY - custom3D.prevMouse.y;

      custom3D.velocity.x = dx * 0.007;
      custom3D.velocity.y = dy * 0.007;

      boxGroup.rotation.y += custom3D.velocity.x;
      boxGroup.rotation.x = Math.max(-0.5, Math.min(0.8, boxGroup.rotation.x + custom3D.velocity.y));

      custom3D.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
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

    // Render Loop
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Inertia & Continuous gentle float
      if (custom3D.autoRotate && !custom3D.isDragging) {
        boxGroup.rotation.y += 0.004;
        boxGroup.position.y = Math.sin(elapsed * 1.5) * 0.08;
      } else if (!custom3D.isDragging) {
        boxGroup.rotation.y += custom3D.velocity.x;
        boxGroup.rotation.x = Math.max(-0.5, Math.min(0.8, boxGroup.rotation.x + custom3D.velocity.y));
        custom3D.velocity.x *= 0.92;
        custom3D.velocity.y *= 0.92;
      }

      // Smooth unboxing lid / flower lerp
      if (custom3D.lidMesh) {
        const targetLidY = custom3D.isUnboxed ? 3.2 : 1.25;
        const targetLidRot = custom3D.isUnboxed ? 0.35 : 0;
        custom3D.lidMesh.position.y += (targetLidY - custom3D.lidMesh.position.y) * 0.08;
        custom3D.lidMesh.rotation.z += (targetLidRot - custom3D.lidMesh.rotation.z) * 0.08;
      }

      if (custom3D.flowersGroup) {
        const targetFlowerY = custom3D.isUnboxed ? 1.1 : 0.4;
        const targetFlowerScale = custom3D.isUnboxed ? 1.15 : 0.9;
        custom3D.flowersGroup.position.y += (targetFlowerY - custom3D.flowersGroup.position.y) * 0.08;
        const currentScale = custom3D.flowersGroup.scale.x;
        const newScale = currentScale + (targetFlowerScale - currentScale) * 0.08;
        custom3D.flowersGroup.scale.set(newScale, newScale, newScale);
      }

      if (custom3D.ribbonGroup) {
        const targetRibbonOpacity = custom3D.isUnboxed ? 0.0 : 1.0;
        custom3D.ribbonGroup.children.forEach(child => {
          if (child.material) {
            child.material.opacity += (targetRibbonOpacity - child.material.opacity) * 0.1;
          }
        });
      }

      renderer.render(scene, camera);
    }

    animate();

  } catch (err) {
    console.error("3D Configurator error:", err);
  }
}

// Rebuild Box Architecture (Hat Box vs Petite vs Cedarwood Trunk)
function rebuild3DBoxGeometry(boxType, wrapColor = 0xf7edeb, ribbonColor = 0xb97980) {
  if (!custom3D.boxGroup) return;

  // Clear previous children
  while (custom3D.boxGroup.children.length > 0) {
    custom3D.boxGroup.remove(custom3D.boxGroup.children[0]);
  }

  const isTrunk = boxType === 'heirloom';
  const isPetite = boxType === 'petite';

  // Box Material
  const boxMat = new THREE.MeshStandardMaterial({
    color: isTrunk ? 0x825234 : wrapColor,
    roughness: isTrunk ? 0.35 : 0.7,
    metalness: isTrunk ? 0.2 : 0.05
  });

  // 1. Box Body Geometry
  let bodyGeom;
  if (isTrunk) {
    bodyGeom = new THREE.BoxGeometry(3.6, 2.0, 2.6);
  } else {
    // Cylindrical French Hat Box
    const radius = isPetite ? 1.7 : 2.2;
    bodyGeom = new THREE.CylinderGeometry(radius, radius, 2.3, 36);
  }

  const bodyMesh = new THREE.Mesh(bodyGeom, boxMat);
  bodyMesh.position.y = 0;
  custom3D.boxGroup.add(bodyMesh);
  custom3D.bodyMesh = bodyMesh;

  // 2. Box Lid Geometry
  let lidGeom;
  if (isTrunk) {
    lidGeom = new THREE.BoxGeometry(3.7, 0.4, 2.7);
  } else {
    const radius = isPetite ? 1.76 : 2.26;
    lidGeom = new THREE.CylinderGeometry(radius, radius, 0.45, 36);
  }

  const lidMat = new THREE.MeshStandardMaterial({
    color: isTrunk ? 0x6e4328 : wrapColor,
    roughness: isTrunk ? 0.3 : 0.65,
    metalness: isTrunk ? 0.25 : 0.08
  });

  const lidMesh = new THREE.Mesh(lidGeom, lidMat);
  lidMesh.position.y = 1.25;
  custom3D.boxGroup.add(lidMesh);
  custom3D.lidMesh = lidMesh;

  // Gold Trim Accent Line
  const goldRingGeom = isTrunk
    ? new THREE.BoxGeometry(3.72, 0.05, 2.72)
    : new THREE.CylinderGeometry(isPetite ? 1.77 : 2.27, isPetite ? 1.77 : 2.27, 0.06, 36);
  const goldRingMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.9,
    roughness: 0.25
  });
  const goldRing = new THREE.Mesh(goldRingGeom, goldRingMat);
  goldRing.position.y = -0.15;
  lidMesh.add(goldRing);

  // 3. Ribbon & Bow Group
  const ribbonGroup = new THREE.Group();
  custom3D.boxGroup.add(ribbonGroup);
  custom3D.ribbonGroup = ribbonGroup;

  const ribbonMat = new THREE.MeshStandardMaterial({
    color: ribbonColor,
    roughness: 0.4,
    metalness: 0.15,
    transparent: true,
    opacity: 1.0
  });

  if (!isTrunk) {
    const rRadius = isPetite ? 1.78 : 2.28;
    // Cross Ribbons
    const ribGeomV = new THREE.CylinderGeometry(rRadius, rRadius, 2.32, 36, 1, true, 0, 0.4);
    const ribMeshV1 = new THREE.Mesh(ribGeomV, ribbonMat);
    ribbonGroup.add(ribMeshV1);

    const ribMeshV2 = new THREE.Mesh(ribGeomV, ribbonMat);
    ribMeshV2.rotation.y = Math.PI / 2;
    ribbonGroup.add(ribMeshV2);

    // Rosette Bow on Lid
    const bowGeom = new THREE.TorusGeometry(0.5, 0.15, 12, 24);
    const bow1 = new THREE.Mesh(bowGeom, ribbonMat);
    bow1.rotation.x = Math.PI / 2;
    bow1.position.y = 0.35;
    lidMesh.add(bow1);

    const bow2 = new THREE.Mesh(bowGeom, ribbonMat);
    bow2.rotation.x = Math.PI / 2;
    bow2.rotation.z = Math.PI / 3;
    bow2.position.y = 0.35;
    lidMesh.add(bow2);
  }

  // 4. Interior Floral Arrangement
  const flowersGroup = new THREE.Group();
  flowersGroup.position.y = 0.4;
  custom3D.boxGroup.add(flowersGroup);
  custom3D.flowersGroup = flowersGroup;

  populateInteriorBlooms(flowersGroup, 'roses');
}

// Populate Interior Blooms Cluster
function populateInteriorBlooms(group, flowerType) {
  while (group.children.length > 0) {
    group.remove(group.children[0]);
  }

  const roseGeom = new THREE.SphereGeometry(0.45, 16, 12);
  // Flatten top to resemble rose head
  const pos = roseGeom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) > 0.1) {
      pos.setY(i, pos.getY(i) * 0.7);
    }
  }
  roseGeom.computeVertexNormals();

  let bloomColor = 0xb97980;
  if (flowerType === 'orchids') bloomColor = 0xfffcf5;
  if (flowerType === 'tulips') bloomColor = 0xe8c9c9;
  if (flowerType === 'eternal') bloomColor = 0x9e3846;

  const flowerMat = new THREE.MeshStandardMaterial({
    color: bloomColor,
    roughness: 0.5,
    metalness: 0.05
  });

  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x4a5d43,
    roughness: 0.6
  });

  // Cluster of 7 blooms
  const positions = [
    [0, 0.4, 0],
    [0.7, 0.3, 0.4],
    [-0.7, 0.3, 0.4],
    [0.6, 0.3, -0.6],
    [-0.6, 0.3, -0.6],
    [0, 0.25, 0.8],
    [0, 0.25, -0.8]
  ];

  positions.forEach(p => {
    const bloom = new THREE.Mesh(roseGeom, flowerMat);
    bloom.position.set(p[0], p[1], p[2]);
    bloom.rotation.y = Math.random() * Math.PI;
    group.add(bloom);
  });

  // Foliage sprigs
  const leafGeom = new THREE.BoxGeometry(0.35, 0.05, 0.6);
  for (let l = 0; l < 8; l++) {
    const angle = (l / 8) * Math.PI * 2;
    const leaf = new THREE.Mesh(leafGeom, leafMat);
    leaf.position.set(Math.cos(angle) * 1.3, 0.2, Math.sin(angle) * 1.3);
    leaf.rotation.y = angle;
    leaf.rotation.x = 0.3;
    group.add(leaf);
  }
}

// Public API for updating 3D box based on user clicks
function set3DBoxSize(sizeId) {
  const isTrunk = sizeId === 'heirloom';
  const wrapColor = custom3D.bodyMesh ? custom3D.bodyMesh.material.color.getHex() : 0xf7edeb;
  const ribbonColor = custom3D.ribbonGroup && custom3D.ribbonGroup.children[0]
    ? custom3D.ribbonGroup.children[0].material.color.getHex()
    : 0xb97980;
  rebuild3DBoxGeometry(sizeId, wrapColor, ribbonColor);
}

function set3DWrappingColor(hexColor) {
  if (custom3D.bodyMesh) {
    custom3D.bodyMesh.material.color.set(hexColor);
  }
  if (custom3D.lidMesh) {
    custom3D.lidMesh.material.color.set(hexColor);
  }
}

function set3DRibbonColor(hexColor) {
  if (custom3D.ribbonGroup) {
    custom3D.ribbonGroup.children.forEach(c => {
      if (c.material) c.material.color.set(hexColor);
    });
  }
  if (custom3D.lidMesh) {
    custom3D.lidMesh.children.forEach(c => {
      if (c.material && c.material.color.getHex() !== 0xd4af37) {
        c.material.color.set(hexColor);
      }
    });
  }
}

function set3DFlowerType(flowerId) {
  if (custom3D.flowersGroup) {
    populateInteriorBlooms(custom3D.flowersGroup, flowerId);
  }
}

function toggle3DUnbox() {
  custom3D.isUnboxed = !custom3D.isUnboxed;
  const btn = document.getElementById('unbox-3d-btn');
  if (btn) {
    btn.innerHTML = custom3D.isUnboxed
      ? `<span class="material-symbols-outlined text-[16px]">close</span> Close Lid`
      : `<span class="material-symbols-outlined text-[16px]">lock_open</span> Unbox &amp; Reveal Stems`;
  }
}

function toggle3DAutoRotate() {
  custom3D.autoRotate = !custom3D.autoRotate;
  const btn = document.getElementById('rotate-3d-btn');
  if (btn) {
    btn.innerHTML = custom3D.autoRotate
      ? `<span class="material-symbols-outlined text-[16px]">pause</span> Pause Orbit`
      : `<span class="material-symbols-outlined text-[16px]">3d_rotation</span> Auto Orbit`;
  }
}

// Auto-run when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initCustom3D('custom-3d-stage');
});
