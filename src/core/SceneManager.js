import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
// Checked
// هون البيئة (شمس و سما ومي واضوية)وال  
// scene & rendere Object
export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.renderer = null;
    this.skyLight = null;
    this.water = null;
    this.sky = null;
    this.sunLight = null;

    this.initRenderer();
    this.setupLighting();
    this.setupSky();
    this.setupWorld();
  }

  initRenderer() {
    const canvas = document.querySelector(".webgl");
    this.renderer = new THREE.WebGLRenderer({ canvas });

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.renderer.setSize(sizes.width, sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  setupLighting() {

    this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
    this.sunLight.position.set(100, 30000, 100);
    this.sunLight.castShadow = true;
    this.scene.add(this.sunLight);

    this.skyLight = new THREE.DirectionalLight(0xe8bdb0, 1.5);
    this.skyLight.position.set(2950, 2625, -160);
    this.scene.add(this.skyLight);

    const ambientLight = new THREE.DirectionalLight(0xc3eaff, 0.75);
    ambientLight.position.set(-1, -0.5, -1);
    this.scene.add(ambientLight);

  }

  setupSky() {
    this.sky = new Sky();
    this.sky.scale.setScalar(450000);


    const phi = THREE.MathUtils.degToRad(90);
    const theta = THREE.MathUtils.degToRad(180);
    const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
    this.sky.material.uniforms.sunPosition.value = sunPosition;

    this.scene.add(this.sky);
  }

  setupWorld() {


    this.water = new THREE.Mesh(
      new THREE.PlaneGeometry(163840 + 1024, 163840 + 1024, 16, 16),
      new THREE.MeshLambertMaterial({ color: 0x006ba0, transparent: true, opacity: 0.6 })
    );
    this.water.position.y = -99;
    this.water.rotation.x = -0.5 * Math.PI;
    this.scene.add(this.water);


    const axesHelper = new THREE.AxesHelper(500);
    this.scene.add(axesHelper);
  }

  getScene() {
    return this.scene;
  }

  getRenderer() {
    return this.renderer;
  }

  render(camera) {
    this.renderer.render(this.scene, camera);
  }

  onWindowResize(width, height) {
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}
