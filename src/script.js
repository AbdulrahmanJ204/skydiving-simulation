import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import GUI from "lil-gui";
import { SkyDiver } from "./physics/skyDiver";
import { Physics } from "./physics/physics";
import { FlyControls } from "three/addons/controls/FlyControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
/** TODO:
 *  For "FRONTEND":
 *  1- add Models and animation
 *  2- add environment
 *  3- maybe add Lights and shadows
 *  For "Backend":
 *  fix rotation
 *  1- fix Lift power direction // above 95%
 *  2- test physics // above 95%
 *  3- maybe add Controls (rotate skydiver on wasd , openParahute on F ...)// Done
 *  4- make camera better
 */
// Canvas
const canvas = document.querySelector(".webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  10000
);
camera.position.set(-0.2, 0.1, 3);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
export const round = (num, precision = 2) => {
  return num.toFixed(precision);
};
THREE.Vector3.prototype.angleToFixed = function (v) {
  const angle = this.angleTo(v);
  return round(angle);
};
// Materials
const material = new THREE.MeshBasicMaterial({
  color: "white",
});

// Objects

// temp Skydiver
const sphereGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.8);
const sphere = new THREE.Mesh(sphereGeometry, material);
sphere.receiveShadow = true;
sphere.position.set(-2, 0, 0);
scene.add(sphere);
// temp Ground
const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load("./textures/plane.jpg");
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(100, 100);

const groundMaterial = new THREE.MeshStandardMaterial({
  map: grassTexture,
});

const groundGeometry = new THREE.PlaneGeometry(30000, 30000);
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Axis Helper
const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);

// Event Listeners
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
};

window.addEventListener("keyup", (e) => {
  if (e.code in keys) keys[e.code] = false;
});

window.addEventListener("keydown", (event) => {
  if (event.key == "h") gui.show(gui._hidden);
  if (event.key == "f") skyDiver.openParachute();
  if (event.code in keys) keys[event.code] = true;
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
const rotationSpeed = 0.1;
function updateOrientation(deltaTime) {
  let rotationSpeedDt = rotationSpeed * deltaTime;
  if (skyDiver.parachuteOpend) {
    if (keys["ArrowLeft"]) {
      skyDiver.rotateParachuteLeft(deltaTime);
    }
    if (keys["ArrowRight"]) {
      skyDiver.rotateParachuteRight(deltaTime);
    }
  } else {
    if (keys["ArrowLeft"]) {
      skyDiver.rotateBody(skyDiver.bodyFront, -rotationSpeedDt);
    }
    if (keys["ArrowRight"]) {
      skyDiver.rotateBody(skyDiver.bodyFront, rotationSpeedDt);
    }
    if (keys["ArrowUp"]) {
      skyDiver.rotateBody(skyDiver.bodyRight, -rotationSpeedDt);
    }
    if (keys["ArrowDown"]) {
      skyDiver.rotateBody(skyDiver.bodyRight, rotationSpeedDt);
    }
  }
}
let arrowHelpers = new Map();
function drawVector(v, pos, vName, hex) {
  const dir = v.clone();
  dir.normalize();
  const origin = pos.clone();
  const length = v.length() * 2;

  if (arrowHelpers.has(vName)) scene.remove(arrowHelpers.get(vName));

  arrowHelpers.set(vName, new THREE.ArrowHelper(dir, origin, length, hex));
  scene.add(arrowHelpers.get(vName));
}
const clock = new THREE.Clock();
let lastTime = clock.getElapsedTime();
let debugVars = {
  x: 0,
  y: 2,
  z: 1,
};
const folder = gui.addFolder("cameraPos");
folder.add(debugVars, "x");
folder.add(debugVars, "y");
folder.add(debugVars, "z");
var angle = 0,
  speed = 0.03;
// const loader = new GLTFLoader();
// let gltfM;
// loader.load("./models/map_pubg_erangel/scene.gltf", (gltf) => {
//   console.log("success" , gltf);
//   gltf.scene.scale.set(2 , 2 ,2);
//   gltf.scene.position.set(0 , 1100 ,-10)
//   gltfM =gltf.scene;
//   scene.add(gltf.scene);
// });

// 💡 Directional light (like the sun)
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(100, 30000, 100);
sunLight.castShadow = true;
scene.add(sunLight);

const cameraTargetOffset = new THREE.Vector3(0, 3, 3); // behind & above
const smoothedCameraPos = new THREE.Vector3();

const renderLoop = () => {
  const currentTime = clock.getElapsedTime();
  const dt = currentTime - lastTime;
  lastTime = currentTime;

  // Applying Physics
  updateOrientation(dt);
  physics.applyForces(skyDiver);
  skyDiver.update(dt);
  physics.drawVectors(scene, skyDiver.position);

  sphere.position.copy(skyDiver.position);
  sphere.quaternion.copy(skyDiver.orientation);

  drawVector(skyDiver.bodyFront, skyDiver.position, "bodyFront", "red");
  drawVector(skyDiver.bodyRight, skyDiver.position, "bodyRight", "green");
  drawVector(skyDiver.bodyUp, skyDiver.position, "bodyUp", "blue");
  // Camera Update

  let target = sphere;
  const skydiverPos = target.position.clone();

  // Rotate offset based on orientation
  const offset = cameraTargetOffset.clone();//.applyQuaternion(target.quaternion);
  const desiredCameraPos = skydiverPos.clone().add(offset);

  // Smooth camera movement
  smoothedCameraPos.lerp(desiredCameraPos, 0.05); // 0.05 = smooth factor
  camera.position.copy(smoothedCameraPos);

  // Look at the skydiver
  camera.lookAt(skydiverPos);
  
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderLoop);
};

renderLoop();
