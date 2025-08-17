import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from 'three';
// Checked
export class ModelLoader {
  constructor(scene) {
    this.scene = scene;
    this.gltfLoader = new GLTFLoader();
    this.models = new Map();
    this.loadingPromises = new Map();
  }

  async loadModel(path, name, options = {}) {
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    const promise = new Promise((resolve, reject) => {
      this.gltfLoader.load(
        path,
        (gltf) => {
          const model = gltf.scene;

          if (options.scale) {
            model.scale.set(options.scale.x || 1, options.scale.y || 1, options.scale.z || 1);
          }
          if (options.rotation) {
            model.rotation.set(options.rotation.x || 0, options.rotation.y || 0, options.rotation.z || 0);
          }
          if (options.position) {
            model.position.set(options.position.x || 0, options.position.y || 0, options.position.z || 0);
          }
          if (options.visible !== undefined) {
            model.visible = options.visible;
          }

          this.scene.add(model);


          this.models.set(name, model);
          resolve(model);
        },
        undefined,
        (error) => {
          console.error(`Error loading model ${name}:`, error);
          reject(error);
        }
      );
    });

    this.loadingPromises.set(name, promise);
    return promise;
  }

  async loadSkydiverModel() {
    return this.loadModel("./models/2/character.gltf", "skydiver", {
      scale: { x: 1.5, y: 1.5, z: 1.5 },
    });
  }
  async loadPlaneModel() {
    return this.loadModel("./models/3/plane.gltf", "plane", {});
  }

  async loadParachuteModel() {
    return this.loadModel("./models/1/openedParachute.gltf", "parachute", {
      scale: { x: 0.5, y: 0.5, z: 0.5 },
      rotation: { x: 0, y: Math.PI, z: 0 },
      visible: false
    });
  }

  async loadTerrainModel() {
    const sc = 0.02;
    return this.loadModel("./models/denali/scene.gltf", "terrain", {
      scale: { x: sc, y: sc, z: sc }
    });
  }

  getModel(name) {
    return this.models.get(name);
  }

  hasModel(name) {
    return this.models.has(name);
  }

  async loadAllModels() {
    try {
      const [skydiverModel, parachuteModel, terrainModel, planeModel] = await Promise.all([
        this.loadSkydiverModel(),
        this.loadParachuteModel(),
        this.loadTerrainModel(),
        this.loadPlaneModel(),
      ]);

      const skydiverGroup = this.createSkydiverGroup(skydiverModel, parachuteModel);

      return {
        skydiverGroup: skydiverGroup,
        skydiver: skydiverModel, 
        parachute: parachuteModel,
        terrain: terrainModel,
        plane: planeModel
      };
    } catch (error) {
      console.error("Error loading models:", error);
      throw error;
    }
  }

  createSkydiverGroup(skydiverModel, parachuteModel) {
   
    const skydiverGroup = new THREE.Group();
    skydiverGroup.name = 'skydiverGroup';
    
   
    this.scene.remove(skydiverModel);
    this.scene.remove(parachuteModel);
    
   
    skydiverGroup.add(skydiverModel);
    skydiverGroup.add(parachuteModel);
    
   
    parachuteModel.position.set(0, 7, 0);     
   
    this.scene.add(skydiverGroup);
    
   
    skydiverGroup.skydiverModel = skydiverModel;
    skydiverGroup.parachuteModel = parachuteModel;
    
    return skydiverGroup;
  }
}
