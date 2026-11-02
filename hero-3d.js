/**
 * Bloom & Box - Living 3D Blooming Rose & Cinematic Atmosphere
 * Three.js WebGL experience with procedural layered petals, dynamic mouse-following rim light,
 * drifting gold foil particles, organic breathing kinetics, and smooth cursor parallax.
 */

function initHero3D() {
  const container = document.getElementById('hero-3d-canvas-container');
  if (!container) return;

  // Respect user preference for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    container.style.display = 'none';
    return;
  }

  // Ensure Three.js is loaded
  if (typeof THREE === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => setupLivingRoseScene(container);
    document.head.appendChild(script);
  } else {
    setupLivingRoseScene(container);
  }
}

function setupLivingRoseScene(container) {
  try {
    const scene = new THREE.Scene();

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 700;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 24);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '1';
    renderer.domElement.style.pointerEvents = 'auto'; // Allows interactive drag & hover
    renderer.domElement.style.cursor = 'grab';
    container.appendChild(renderer.domElement);

    // ================= LIGHTING SETUP =================
    const ambientLight = new THREE.AmbientLight(0xfff5f2, 1.2);
    scene.add(ambientLight);

    // Key directional light for soft sculptural shadows
    const keyLight = new THREE.DirectionalLight(0xffe8e8, 1.4);
    keyLight.position.set(8, 15, 12);
    scene.add(keyLight);

    // Fill light with blush tone
    const fillLight = new THREE.DirectionalLight(0xb97980, 0.7);
    fillLight.position.set(-10, -5, 8);
    scene.add(fillLight);

    // Dynamic mouse-following point light for shimmer
    const cursorLight = new THREE.PointLight(0xffdfba, 1.8, 30);
    cursorLight.position.set(0, 0, 8);
    scene.add(cursorLight);

    // ================= PROCEDURAL 3D LIVING ROSE =================
    const roseGroup = new THREE.Group();
    // Position slightly to the right on desktop, centered on mobile
    const isDesktop = window.innerWidth >= 1024;
    roseGroup.position.set(isDesktop ? 6.5 : 0, isDesktop ? 0.5 : -1.5, isDesktop ? 2 : -2);
    roseGroup.rotation.x = 0.5;
    roseGroup.rotation.y = -0.35;
    scene.add(roseGroup);

    // Build Single Curved Petal Geometry
    function createCurvedPetalGeometry(widthScale, lengthScale, curvature) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.bezierCurveTo(0.6 * widthScale, 0.4 * lengthScale, 0.8 * widthScale, 1.3 * lengthScale, 0.3 * widthScale, 2.0 * lengthScale);
      shape.bezierCurveTo(0.1 * widthScale, 2.3 * lengthScale, -0.1 * widthScale, 2.3 * lengthScale, -0.3 * widthScale, 2.0 * lengthScale);
      shape.bezierCurveTo(-0.8 * widthScale, 1.3 * lengthScale, -0.6 * widthScale, 0.4 * lengthScale, 0, 0);

      const geom = new THREE.ShapeGeometry(shape, 16);
      const pos = geom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const distFromCenter = Math.sqrt(x * x + y * y);
        // Cup shape curve in Z
        const z = -Math.sin(y / (2 * lengthScale) * Math.PI) * curvature - (x * x) * 0.12;
        pos.setZ(i, z);
      }
      geom.computeVertexNormals();
      return geom;
    }

    // Petal Layers Parameters (Golden Spiral Arrangement)
    const petalLayers = [
      { count: 3, w: 0.6, l: 0.7, curl: 0.6, radius: 0.25, tilt: 0.25, color: 0x934a53 }, // Deep inner bud
      { count: 5, w: 0.9, l: 1.1, curl: 0.7, radius: 0.55, tilt: 0.55, color: 0xb97980 }, // Dusty Rose heart
      { count: 7, w: 1.3, l: 1.5, curl: 0.85, radius: 0.95, tilt: 0.85, color: 0xd99b9b }, // Mid blooming
      { count: 9, w: 1.7, l: 1.9, curl: 1.1, radius: 1.45, tilt: 1.15, color: 0xe8c9c9 }, // Outer blush petals
      { count: 6, w: 2.1, l: 2.2, curl: 1.25, radius: 1.85, tilt: 1.35, color: 0xf7edeb }  // Majestic flared rim
    ];

    const animatedPetals = [];

    petalLayers.forEach((layer, layerIdx) => {
      const geom = createCurvedPetalGeometry(layer.w, layer.l, layer.curl);
      const mat = new THREE.MeshStandardMaterial({
        color: layer.color,
        roughness: 0.45,
        metalness: 0.08,
        side: THREE.DoubleSide,
        shadowSide: THREE.DoubleSide
      });

      for (let i = 0; i < layer.count; i++) {
        const angle = (i / layer.count) * Math.PI * 2 + (layerIdx * 0.62);
        const petalMesh = new THREE.Mesh(geom, mat);

        petalMesh.position.x = Math.cos(angle) * layer.radius;
        petalMesh.position.y = Math.sin(angle) * layer.radius;
        petalMesh.position.z = -layerIdx * 0.22;

        petalMesh.rotation.z = angle - Math.PI / 2;
        petalMesh.rotation.x = layer.tilt;

        roseGroup.add(petalMesh);

        animatedPetals.push({
          mesh: petalMesh,
          baseTilt: layer.tilt,
          layerIdx: layerIdx,
          angle: angle,
          speed: 0.8 + layerIdx * 0.2
        });
      }
    });

    // Golden Stamens Center
    const stamenGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6);
    const stamenMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.7,
      roughness: 0.3
    });
    for (let s = 0; s < 18; s++) {
      const stamen = new THREE.Mesh(stamenGeom, stamenMat);
      const rad = Math.random() * 0.2;
      const ang = Math.random() * Math.PI * 2;
      stamen.position.set(Math.cos(ang) * rad, Math.sin(ang) * rad, 0.1);
      stamen.rotation.x = (Math.random() - 0.5) * 0.4;
      stamen.rotation.y = (Math.random() - 0.5) * 0.4;
      roseGroup.add(stamen);
    }

    // Emerald Leaves underneath
    const leafGeom = createCurvedPetalGeometry(1.6, 2.5, 0.5);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x3d4b35,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    for (let l = 0; l < 4; l++) {
      const leafAngle = (l / 4) * Math.PI * 2 + 0.4;
      const leafMesh = new THREE.Mesh(leafGeom, leafMat);
      leafMesh.position.set(Math.cos(leafAngle) * 1.8, Math.sin(leafAngle) * 1.8, -1.2);
      leafMesh.rotation.z = leafAngle - Math.PI / 2;
      leafMesh.rotation.x = 1.4;
      roseGroup.add(leafMesh);
    }

    // ================= FLOATING DRIFTING PETALS & GOLD DUST =================
    const floatingPetals = [];
    const petalGeom = createCurvedPetalGeometry(0.8, 1.2, 0.6);
    const petalColors = [0xe8c9c9, 0xb97980, 0xf7edeb, 0xd4878f];
    const totalFloating = isDesktop ? 45 : 22;

    for (let p = 0; p < totalFloating; p++) {
      const pMat = new THREE.MeshStandardMaterial({
        color: petalColors[p % petalColors.length],
        roughness: 0.6,
        metalness: 0.05,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const pMesh = new THREE.Mesh(petalGeom, pMat);
      pMesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 18
      );
      const scl = 0.45 + Math.random() * 0.55;
      pMesh.scale.set(scl, scl, scl);
      pMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(pMesh);

      floatingPetals.push({
        mesh: pMesh,
        speedY: 0.005 + Math.random() * 0.008,
        speedRotX: 0.006 + Math.random() * 0.01,
        speedRotZ: 0.004 + Math.random() * 0.008,
        swaySpeed: 0.7 + Math.random() * 1.2,
        initialX: pMesh.position.x
      });
    }

    // 24K Gold Foil Flakes Particles
    const goldCount = isDesktop ? 60 : 30;
    const goldGeom = new THREE.DodecahedronGeometry(0.12, 0);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.2
    });
    const goldFlakes = [];
    for (let g = 0; g < goldCount; g++) {
      const flake = new THREE.Mesh(goldGeom, goldMat);
      flake.position.set(
        (Math.random() - 0.5) * 36,
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 14
      );
      flake.scale.set(0.6 + Math.random() * 0.8, 0.6 + Math.random() * 0.8, 0.6 + Math.random() * 0.8);
      scene.add(flake);
      goldFlakes.push({
        mesh: flake,
        speedY: 0.004 + Math.random() * 0.006,
        rotSpeed: 0.02 + Math.random() * 0.03
      });
    }

    // ================= INTERACTION & PHYSICS STATE =================
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
      // Normalize mouse (-1 to 1)
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

      // Move cursor light in 3D coordinates
      cursorLight.position.x = mouseX * 12;
      cursorLight.position.y = mouseY * 8;
    });

    // Drag to rotate rose
    renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      renderer.domElement.style.cursor = 'grabbing';
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      if (renderer.domElement) renderer.domElement.style.cursor = 'grab';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      dragVelocity.x = deltaX * 0.005;
      dragVelocity.y = deltaY * 0.005;

      roseGroup.rotation.y += dragVelocity.x;
      roseGroup.rotation.x += dragVelocity.y;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Touch support for mobile devices
    renderer.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      roseGroup.rotation.y += deltaX * 0.005;
      roseGroup.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    // ================= RESIZE LISTENER =================
    window.addEventListener('resize', () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    });

    // ================= ANIMATION TICK LOOP =================
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Damped mouse parallax
      targetX += (mouseX * 0.8 - targetX) * 0.04;
      targetY += (mouseY * 0.5 - targetY) * 0.04;

      if (!isDragging) {
        // Natural organic sway and slow continuous rotation
        roseGroup.rotation.y += 0.003 + dragVelocity.x;
        roseGroup.rotation.x = 0.5 + Math.sin(elapsed * 0.8) * 0.08 + targetY * 0.3;
        roseGroup.rotation.z = Math.cos(elapsed * 0.6) * 0.05 + targetX * 0.2;

        // Apply friction to inertia drag velocity
        dragVelocity.x *= 0.94;
        dragVelocity.y *= 0.94;
      }

      // Organic Petal Bloom & Breathe Cycle
      const breathe = Math.sin(elapsed * 1.2) * 0.04;
      animatedPetals.forEach(p => {
        // Outer petals gently expand and uncurl
        p.mesh.rotation.x = p.baseTilt + breathe * (p.layerIdx * 0.4);
      });

      // Animate floating petals drift
      floatingPetals.forEach(fp => {
        fp.mesh.position.y -= fp.speedY;
        fp.mesh.position.x = fp.initialX + Math.sin(elapsed * fp.swaySpeed) * 0.8;
        fp.mesh.rotation.x += fp.speedRotX;
        fp.mesh.rotation.z += fp.speedRotZ;

        // Reset to top when falling past bottom
        if (fp.mesh.position.y < -14) {
          fp.mesh.position.y = 14;
          fp.mesh.position.x = (Math.random() - 0.5) * 36;
          fp.initialX = fp.mesh.position.x;
        }
      });

      // Animate 24K gold foil flakes shimmer
      goldFlakes.forEach(gf => {
        gf.mesh.position.y -= gf.speedY;
        gf.mesh.rotation.x += gf.rotSpeed;
        gf.mesh.rotation.y += gf.rotSpeed * 0.7;
        if (gf.mesh.position.y < -12) {
          gf.mesh.position.y = 12;
        }
      });

      renderer.render(scene, camera);
    }

    animate();

  } catch (err) {
    console.warn("WebGL living rose initialization fallback:", err);
  }
}

// Auto-init on DOM readiness
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHero3D);
} else {
  initHero3D();
}
