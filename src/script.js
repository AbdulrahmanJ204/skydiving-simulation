import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import GUI from "lil-gui";
import { SkyDiver } from "./physics/skyDiver";
import { Physics } from "./physics/physics";
import { FlyControls } from "three/addons/controls/FlyControls.js";

/** TODO:
 *  For "FRONTEND":
 *  1- add Models and animation
 *  2- add environment
 *  3- maybe add Lights and shadows
 *  For "Backend":
 *  1- fix Lift power direction
 *  2- test physics
 *  3- maybe add Controls (rotate skydiver on wasd , openParahute on F ...)
 *  4- make camera better
 */
// Canvas
const canvas = document.querySelector(".webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("cyan");

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height , 0.1 , 10000);
camera.position.set(-0.2, 0.1, 3);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
// Maybe add orbit controls , idk
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

// Debug
const gui = new GUI({
  closeFolders: true,
  title: "Skydiving Simulation",
  width: 300,
});

// Materials
const material = new THREE.MeshBasicMaterial({
  color: "white",
});

// Objects

// temp Skydiver
const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
const sphere = new THREE.Mesh(sphereGeometry, material);
sphere.position.set(-2, 0, 0);
scene.add(sphere);
// temp Ground
const planeGeometry = new THREE.PlaneGeometry(10000, 10000);
const plane = new THREE.Mesh(
  planeGeometry,
  new THREE.MeshBasicMaterial({
    color: "lightgreen",
  })
);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Axis Helper
const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);

// Event Listeners
window.addEventListener("keydown", (event) => {
  if (event.key == "h") gui.show(gui._hidden);
  if (event.key == "f") skyDiver.openParachute();
});
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Our Simulation Classes
let skyDiver = new SkyDiver();
let physics = new Physics();
skyDiver.addGuiFolder(gui);
physics.addGuiFolder(gui);

const clock = new THREE.Clock();
let lastTime = clock.getElapsedTime();
const renderLoop = () => {
  const currentTime = clock.getElapsedTime();
  const dt = currentTime - lastTime;
  lastTime = currentTime;
  // Camera Update

  camera.lookAt(sphere.position);
  camera.position.copy(sphere.position);
  camera.position.x+=5;
  camera.position.y+=5;
  camera.position.z+=5;
  // controls.update();
  // Applying Physics
  physics.applyForces(skyDiver);
  skyDiver.update(dt);
  physics.drawVectors(scene, skyDiver.position);

  // !should be removed when adding Mesh to skydiver.
  sphere.position.copy(skyDiver.position);
  // controls.target.copy(sphere.position);

  renderer.render(scene, camera);
  window.requestAnimationFrame(renderLoop);
};

renderLoop();
