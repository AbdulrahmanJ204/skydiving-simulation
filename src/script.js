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
const loaderCube = new THREE.CubeTextureLoader();
const skyboxTexture = loaderCube.load([
  "./skybox/posx.jpg",
  "./skybox/negx.jpg",
  "./skybox/posy.jpg",
  "./skybox/negy.jpg",
  "./skybox/posz.jpg",
  "./skybox/negz.jpg",
]);
scene.background = skyboxTexture;

// Model
const gltfLoader = new GLTFLoader();
let skydiverModel, parachuteModel;

gltfLoader.load("./models/human.glb", (gltf) => {
  skydiverModel = gltf.scene;
  skydiverModel.scale.set(1.5, 1.5, 1.5);
  skydiverModel.rotation.z = Math.PI / 2;
  skydiverModel.rotation.x = Math.PI / 2;
  scene.add(skydiverModel);
  skyDiver.setModel(skydiverModel);
});
gltfLoader.load("./models/parachute.glb", (gltf) => {
  parachuteModel = gltf.scene;
  parachuteModel.scale.set(1, 1, 1);
  parachuteModel.visible = false;
  scene.add(parachuteModel);
  skyDiver.setParachute(parachuteModel);
});
// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const cameras = {
  thirdPerson: new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    10000
  ),
  firstPerson: new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    10000
  ),
  overhead: new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    10000
  ),
  overview: new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    10000
  ),
};

let activeCamera = cameras.thirdPerson;
scene.add(cameras.thirdPerson);
scene.add(cameras.firstPerson);
scene.add(cameras.overhead);
scene.add(cameras.overview);

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
  if (event.key === "1") activeCamera = cameras.thirdPerson;
  if (event.key === "2") activeCamera = cameras.firstPerson;
  if (event.key === "3") activeCamera = cameras.overhead;
  if (event.key === "4") activeCamera = cameras.overview;
  if (event.code in keys) keys[event.code] = true;
});

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  activeCamera.aspect = sizes.width / sizes.height;
  activeCamera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
// Reality
// const ground = new THREE.Mesh(
//   new THREE.PlaneGeometry(10000, 10000),
//   new THREE.MeshPhongMaterial({ color: 0x555555, side: THREE.DoubleSide })
// );
// ground.rotation.x = -Math.PI / 2;
// ground.position.y = 0;
// ground.receiveShadow = true;
// scene.add(ground);

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
      skyDiver.rotateParachuteL(deltaTime);
    }
    if (keys["ArrowRight"]) {
      skyDiver.rotateParachuteR(deltaTime);
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
  const dir = v.clone().normalize();
  const origin = pos.clone().add(new THREE.Vector3(0, 1.5, 0));
  const length = 4;

  if (arrowHelpers.has(vName)) scene.remove(arrowHelpers.get(vName));

  const arrow = new THREE.ArrowHelper(dir, origin, length, hex, 1, 0.5);
  arrowHelpers.set(vName, arrow);
  scene.add(arrow);
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
// var angle = 0,
//   speed = 0.03;
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

// const cameraTargetOffset = new THREE.Vector3(0, 3, 3); // behind & above
// const smoothedCameraPos = new THREE.Vector3();
let firstLoad = true;
const renderLoop = () => {
  const currentTime = clock.getElapsedTime();
  const dt = currentTime - lastTime;
  lastTime = currentTime;

  if (!skydiverModel) {
    requestAnimationFrame(renderLoop);
    return;
  } else if (firstLoad) {
    gui.add(skydiverModel, "visible");
    gui.add(parachuteModel, "visible");
    firstLoad = false;
  }

  // Applying Physics
  updateOrientation(dt);
  physics.applyForces(skyDiver);
  skyDiver.update(dt);
  physics.drawVectors(scene, skyDiver.position);
  skyDiver.syncModelRotation();
  skydiverModel.position.copy(skyDiver.position);
  skydiverModel.quaternion.copy(skyDiver.model.quaternion);
  if (skyDiver.parachuteOpend) {
    parachuteModel.position.copy(skyDiver.position);
    parachuteModel.quaternion.copy(skyDiver.model.quaternion);
    console.log(parachuteModel);
  }
  drawVector(skyDiver.bodyFront, skyDiver.position, "bodyFront", "red");
  drawVector(skyDiver.bodyRight, skyDiver.position, "bodyRight", "green");
  drawVector(skyDiver.bodyUp, skyDiver.position, "bodyUp", "blue");

  // Camera Update
  const skydiverPos = skydiverModel.position.clone();

  // === THIRD PERSON CAMERA ===
  const backOffset = skyDiver.bodyFront.clone().multiplyScalar(-10);
  const upOffset = skyDiver.bodyUp.clone().multiplyScalar(4);
  const thirdPersonPos = skydiverPos.clone().add(backOffset).add(upOffset);
  cameras.thirdPerson.position.lerp(thirdPersonPos, 0.05);
  cameras.thirdPerson.lookAt(skydiverPos);

  // === FIRST PERSON CAMERA ===
  const headOffset = skyDiver.bodyUp.clone().multiplyScalar(1.2);
  const frontOffset = skyDiver.bodyFront.clone().multiplyScalar(0.3);
  const firstPersonPos = skydiverPos.clone().add(headOffset).add(frontOffset);
  cameras.firstPerson.position.copy(firstPersonPos);
  cameras.firstPerson.lookAt(firstPersonPos.clone().add(skyDiver.bodyFront));

  // === OVERHEAD CAMERA ===
  const overheadPos = skydiverPos
    .clone()
    .add(skyDiver.bodyUp.clone().multiplyScalar(20));
  cameras.overhead.position.lerp(overheadPos, 0.05);
  cameras.overhead.lookAt(skydiverPos);

  // === OVERVIEW CAMERA === (ثابتة بعيدة)
  const overviewOffset = new THREE.Vector3(0, 15, 25);
  const overviewPos = skydiverPos.clone().add(overviewOffset);
  cameras.overview.position.lerp(overviewPos, 0.05);
  cameras.overview.lookAt(skydiverPos);

  renderer.render(scene, activeCamera);
  window.requestAnimationFrame(renderLoop);
};

renderLoop();
