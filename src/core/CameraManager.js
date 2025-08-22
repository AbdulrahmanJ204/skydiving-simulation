import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// Checked
export class CameraManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100000
    );
    
    
    this.target = new THREE.Vector3();
    
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 22;
    this.controls.minPolarAngle = Math.PI/8; 
    this.controls.maxPolarAngle = Math.PI; 

    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener("resize", () => {
      this.onWindowResize();
    });
    
    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
  }

  onWindowResize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;
    
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();
  }

  updateCameraFollow(skydiverPosition, deltaTime) {
    this.target.copy(skydiverPosition);
    this.controls.target.copy(this.target);
    this.controls.update(deltaTime);
  }
  
  focusOnPlane(planePosition) {
    this.target.copy(planePosition);
    this.controls.target.copy(this.target);
    this.controls.object.position.x = planePosition.x-5;
    this.controls.object.position.y = planePosition.y+5;
    this.controls.object.position.z = planePosition.z-5;
    this.controls.update();
  }
  

  getCamera() {
    return this.camera;
  }

    addGuiFolder(gui){
       this.folder = gui.addFolder('Controls');
       this.folder.close();
       this.folder.add( this.controls,'minDistance').min(1).max(30).step(1);
       this.folder.add( this.controls,'maxDistance').min(1).max(30).step(1);
       this.folder.add( this.controls,'minPolarAngle').min(0.01).max(this.controls.maxPolarAngle-0.1);

    }

}
