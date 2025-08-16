import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import GUI from "lil-gui";
import { SkyDiver } from "./physics/skyDiver";
import { Physics } from "./physics/physics";
import { FlyControls } from "three/addons/controls/FlyControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { Sky } from 'three/addons/objects/Sky.js';

import * as envir from './environment';
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
// const skyboxTexture = loaderCube.load([
//   "./skybox/right.jpg",
//   "./skybox/left.jpg",
//   "./skybox/top.jpg",
//   "./skybox/bottom.jpg",
//   "./skybox/front.jpg",
//   "./skybox/back.jpg",
// ]);
// const skyboxTexture = loaderCube.load([
//   "./skybox/posx.jpg",
//   "./skybox/negx.jpg",
//   "./skybox/posy.jpg",
//   "./skybox/negy.jpg",
//   "./skybox/posz.jpg",
//   "./skybox/negz.jpg",
// ]);
// scene.background = skyboxTexture;

// Model
const gltfLoader = new GLTFLoader();
let skydiverModel, parachuteModel, terrain;

gltfLoader.load("./models/1/openedParachute.gltf", (gltf) => {
  parachuteModel = gltf.scene;
  parachuteModel.scale.set(0.5, 0.5, 0.5);
  parachuteModel.visible = false;
  scene.add(parachuteModel);
  skyDiver.setParachute(parachuteModel);
});

gltfLoader.load("./models/2/character.gltf", (gltf) => {
  skydiverModel = gltf.scene;
  skydiverModel.scale.set(1.5, 1.5, 1.5);
  skydiverModel.rotation.z = Math.PI / 2;
  skydiverModel.rotation.x = Math.PI / 2;
  scene.add(skydiverModel);
  skyDiver.setModel(skydiverModel);
});

gltfLoader.load("./models/4/terrain.gltf", (gltf) => {
  terrain = gltf.scene;
  terrain.scale.set(100.5, 100.5, 100.5);

  scene.add(terrain);
});

var dir = new THREE.Vector3();
var a = new THREE.Vector3();
var b = new THREE.Vector3();
var coronaSafetyDistance = 0.3;

// gltfLoader.load("./models/5/sky.gltf", (gltf) => {
//   sky = gltf.scene;
//   sky.scale.set(1000.5, 1000.5, 1000.5);
//   scene.add(sky);
// });
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
    100000
  ),
};
var skyDome, skyLight, water;
let activeCamera = cameras.thirdPerson;
scene.add(cameras.thirdPerson);

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
const controls = new FlyControls(cameras.thirdPerson, canvas);

// controls.enableDamping = true;
const sky = new Sky();
sky.scale.setScalar(450000); // Adjust size as needed
// Set sun position, turbidity, rayleigh scattering for realism
const phi = THREE.MathUtils.degToRad(90); 
const theta = THREE.MathUtils.degToRad(180);
const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
sky.material.uniforms.sunPosition.value = sunPosition;
scene.add(sky);
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
function setupWorld() {
  new THREE.TextureLoader().load('/image.jpg', function(t1) {
    t1.minFilter = THREE.LinearFilter; // Texture is not a power-of-two size; use smoother interpolation.
    skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(8192, 16, 16, 0, Math.PI*2, 0, Math.PI*0.5),
      new THREE.MeshBasicMaterial({map: t1, side: THREE.BackSide, fog: false})
    );
    skyDome.position.y = -99;
    scene.add(skyDome);
  });

  water = new THREE.Mesh(
    new THREE.PlaneGeometry(16384+1024, 16384+1024, 16, 16),
    new THREE.MeshLambertMaterial({color: 0x006ba0, transparent: true, opacity: 0.6})
  );
  water.position.y = -99;
  water.rotation.x = -0.5 * Math.PI;
  scene.add(water);

  skyLight = new THREE.DirectionalLight(0xe8bdb0, 1.5);
  skyLight.position.set(2950, 2625, -160); // Sun on the sky texture
  scene.add(skyLight);
  var light = new THREE.DirectionalLight(0xc3eaff, 0.75);
  light.position.set(-1, -0.5, -1);
  scene.add(light);
}
setupWorld();
// Objects
var xS = 63, yS = 63;
// console.log(THREE.Terrain);
// terrainScene = THREE.Terrain({
//     easing: THREE.Terrain.Linear,
//     frequency: 2.5,
//     heightmap: THREE.Terrain.DiamondSquare,
//     material: new THREE.MeshBasicMaterial({color: 0x5566aa}),
//     maxHeight: 100,
//     minHeight: -100,
//     steps: 1,
//     xSegments: xS,
//     xSize: 1024,
//     ySegments: yS,
//     ySize: 1024,
// });
// // Assuming you already have your global scene, add the terrain to it
// scene.add(terrainScene);

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
var goal;



var dir = new THREE.Vector3;
var a = new THREE.Vector3;
var b = new THREE.Vector3;
var coronaSafetyDistance = 15;


goal = new THREE.Object3D;
   
    
    goal.add( activeCamera );
 
  
    
    
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
    // gui.add(parachuteModel, "visible");
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
    const parachuteOffsetUp = skyDiver.bodyUp.clone().multiplyScalar(3.5); //UP
    const parachuteOffsetBack = skyDiver.bodyFront.clone().multiplyScalar(-0.5); //Back
    const totalParachuteOffset = parachuteOffsetUp.add(parachuteOffsetBack);

    parachuteModel.position.copy(
      skyDiver.position.clone().add(totalParachuteOffset)
    );
    parachuteModel.quaternion.copy(skyDiver.model.quaternion);
    console.log(parachuteModel);
  }
  drawVector(skyDiver.bodyFront, skyDiver.position, "bodyFront", "red");
  drawVector(skyDiver.bodyRight, skyDiver.position, "bodyRight", "green");
  drawVector(skyDiver.bodyUp, skyDiver.position, "bodyUp", "blue");

  // Camera Update
  const skydiverPos = skydiverModel.position.clone();
  a.lerp(skydiverPos, 0.4);
  b.copy(goal.position);

  dir.copy(a).sub(b).normalize();
  const dis = a.distanceTo(b) - coronaSafetyDistance;
  goal.position.addScaledVector(dir, dis);
  // temp.setFromMatrixPosition(goal.matrixWorld);
  // controls.update();
  // camera.position.lerp(temp, 0.2);
  // activeCamera.lookAt(skydiverPos);

  renderer.render(scene, activeCamera);
  window.requestAnimationFrame(renderLoop);
};

renderLoop();
