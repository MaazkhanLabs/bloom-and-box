/**
 * Bloom & Box - Interactive 3D Floating Petals Hero Scene
 * High-performance, lightweight Three.js experience with mouse parallax and graceful fallback.
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
    script.onload = () => setupThreeScene(container);
    document.head.appendChild(script);
  } else {
    setupThreeScene(container);
  }
}

function setupThreeScene(container) {
  try {
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none'; // Critical: Never intercept clicks
    container.appendChild(renderer.domElement);

    // Subtle Ambient & Directional Warm Light
    const ambientLight = new THREE.AmbientLight(0xfff7f5, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffe8e8, 1.0);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // Procedural Petal Geometry (Curved Rose Petal Shape)
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.bezierCurveTo(0.6, 0.4, 0.8, 1.2, 0.4, 2.0);
    petalShape.bezierCurveTo(0.2, 2.4, -0.2, 2.4, -0.4, 2.0);
    petalShape.bezierCurveTo(-0.8, 1.2, -0.6, 0.4, 0, 0);

    const geometry = new THREE.ShapeGeometry(petalShape, 12);
    // Add subtle curvature to vertex Z positions
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(y * 1.5) * 0.25 - (x * x) * 0.15);
    }
    geometry.computeVertexNormals();

    // Petal Color Variations (Brand Palette)
    const colors = [
      0xE8C9C9, // Blush Pink
      0xB97980, // Dusty Rose
      0xF7EDEB, // Warm Ivory
      0xD6A5AB  // Soft Coral Petal
    ];

    const isMobile = window.innerWidth < 768;
    const petalCount = isMobile ? 18 : 36; // Optimized count for smooth 60fps
    const petals = [];

    for (let i = 0; i < petalCount; i++) {
      const color = colors[i % colors.length];
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.82
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Random scattering in front and around hero area
      mesh.position.x = (Math.random() - 0.5) * 36;
      mesh.position.y = (Math.random() - 0.5) * 22;
      mesh.position.z = (Math.random() - 0.5) * 16 - 2;

      const scale = 0.55 + Math.random() * 0.6;
      mesh.scale.set(scale, scale, scale);

      mesh.rotation.x = Math.random() * Math.PI * 2;
      mesh.rotation.y = Math.random() * Math.PI * 2;
      mesh.rotation.z = Math.random() * Math.PI * 2;

      // Custom motion kinetics
      petals.push({
        mesh: mesh,
        speedY: 0.006 + Math.random() * 0.008,
        speedRotX: 0.005 + Math.random() * 0.008,
        speedRotZ: 0.004 + Math.random() * 0.006,
        oscillationSpeed: 0.8 + Math.random() * 1.2,
        oscillationAmp: 0.015 + Math.random() * 0.02,
        initialX: mesh.position.x
      });

      scene.add(mesh);
    }

    // Mouse Parallax Interaction
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2.5;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * -2.0;
    }, { passive: true });

    // Handle Resize
    function onResize() {
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || 600;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    }
    window.addEventListener('resize', onResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let isVisible = true;

    // Intersection Observer to pause rendering when offscreen (High battery savings)
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = clock.getElapsedTime();

      // Smooth camera parallax
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;
      camera.position.x = mouseX * 2.0;
      camera.position.y = mouseY * 1.5;
      camera.lookAt(0, 0, 0);

      // Animate floating petals
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.mesh.position.y -= p.speedY * 2.5;
        p.mesh.position.x = p.initialX + Math.sin(delta * p.oscillationSpeed + i) * 1.2;

        p.mesh.rotation.x += p.speedRotX;
        p.mesh.rotation.z += p.speedRotZ;
        p.mesh.rotation.y += p.speedRotX * 0.5;

        // Loop back to top once fallen below screen
        if (p.mesh.position.y < -12) {
          p.mesh.position.y = 12 + Math.random() * 4;
          p.mesh.position.x = (Math.random() - 0.5) * 36;
          p.initialX = p.mesh.position.x;
        }
      }

      renderer.render(scene, camera);
    }

    animate();
  } catch (err) {
    console.warn("3D Petal scene fallback activated:", err);
  }
}

// Auto init after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  initHero3D();
});
