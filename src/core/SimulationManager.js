import * as THREE from 'three';
import {SkyDiver} from '../physics/skyDiver.js';
import {Physics} from '../physics/physics.js';
import {SceneManager} from './SceneManager.js';
import {ModelLoader} from './ModelLoader.js';
import {CameraManager} from './CameraManager.js';
import {InputManager} from './InputManager.js';
import {UIManager} from './UIManager.js';
import {StartWidget} from './StartWidget.js';
import {EndWidget} from './EndWidget.js';


export const round = (num, precision = 2) => {
    // برضو مشان مشكلة ال NAN
    if (!Number.isFinite(num)) return num;
    return Number(num.toFixed(precision));
};


export class SimulationManager {
    clock;
    lastTime;
    rotationSpeed = 0.1;
    isSimulationRunning = false;
    raycaster;
    down;
    simulationStats = {
        flightTime: 0,
        maxSpeed: 0,
        maxAltitude: 0,
        totalDistance: 0,
        parachuteOpenTime: null,
        parachuteOpenHeight: null,
        startPosition: null
    };
    finalValues = {
        velocity: {x: 0, y: 0, z: 0},
    };
    previousPosition;
    sceneManager;
    modelLoader;
    cameraManager;
    inputManager;
    uiManager;
    skyDiver;
    physics;
    models = {};
    startWidget;
    endWidget;

    constructor() {

        this.clock = new THREE.Clock();
        this.lastTime = this.clock.getElapsedTime();
        this.raycaster = new THREE.Raycaster();
        this.down = new THREE.Vector3(0, -1, 0);

        this.previousPosition = new THREE.Vector3();

// تابع custom مشان حساب الزاويا بال FL , FD
        THREE.Vector3.prototype.angleToFixed = function (v) {

            // مشان مشكلة ال NAN
            if (this.lengthSq() === 0 || !v || v.lengthSq?.() === 0) {
                return 0;
            }
            const angle = this.angleTo(v);
            return round(angle);
        };

        this.sceneManager = new SceneManager();
        this.modelLoader = new ModelLoader(this.sceneManager.getScene());
        this.cameraManager = new CameraManager(document.querySelector(".webgl"));
        this.inputManager = new InputManager();
        this.uiManager = new UIManager();


        this.skyDiver = new SkyDiver();
        this.physics = new Physics();


        this.startWidget = new StartWidget();
        this.endWidget = new EndWidget();

        this.setupCallbacks();
        this.setupWidgets();
        this.initializeSceneAndShowWidget();
    }

    setupCallbacks() {
        window.addEventListener("resize", () => {
            this.cameraManager.onWindowResize()
            this.sceneManager.onWindowResize()
        });

        this.inputManager.registerCallback("toggleGUI", () => {
            this.uiManager.toggle();
        });

        this.inputManager.registerCallback("openParachute", () => {
            if (this.isSimulationRunning) {
                this.skyDiver.openParachute();
                if (!this.simulationStats.parachuteOpenTime) {
                    this.simulationStats.parachuteOpenTime = this.clock.getElapsedTime() - this.simulationStartTime;
                    this.simulationStats.parachuteOpenHeight = this.skyDiver.position.y;
                }
            }
        });

    }

    setupWidgets() {
        // وقت يضغط عالستارت بتبدأ المحاكاة
        this.startWidget.onStart((initialValues) => {
            this.initializeSimulationWithValues(initialValues);
        });
        // مشان تحديث موقع الطيارة
        this.startWidget.onPositionChange((position) => {
            this.updatePlanePosition(position);
        });
    }

    async initializeSceneAndShowWidget() {
        try {

            // عم اعمل لود للموديلز مشان اعرضهم قبل الشاشة تبع الانبوت،

            this.models = await this.modelLoader.loadAllModels();


            const defaultValues = this.startWidget.initialValues;
            this.applyInitialValues(defaultValues);

            // هون عم اعرض الطيارة بالمكان الابتدائي واخفي السكايدايفر والباراشوت
            this.setupPreSimulationScene(defaultValues);

            this.startWidget.show();

            this.startRenderLoop();
        } catch (error) {
            console.error("Failed to initialize scene:", error);
        }
    }

    async initializeSimulationWithValues(initialValues) {
        try {

            this.applyInitialValues(initialValues);


            this.uiManager.addControlsFolder(this.cameraManager);
            this.uiManager.addSkyDiverFolder(this.skyDiver);
            this.uiManager.addPhysicsFolder(this.physics);


            this.startSimulationScene();


            this.initializeSimulationTracking(initialValues);
        } catch (error) {
            console.error("Failed to initialize simulation:", error);
        }
    }

    applyInitialValues(values) {

        this.skyDiver.mass = values.mass;
        this.skyDiver.area = values.area;
        this.skyDiver.parachuteArea = values.parachuteArea;
        this.skyDiver.position.set(values.startPosition.x, values.startPosition.y, values.startPosition.z);
        this.skyDiver.velocity.set(values.startVelocity.x, values.startVelocity.y, values.startVelocity.z);


        this.physics.constructor.variables.gravity = values.gravity;
        this.physics.constructor.variables.airDensity = values.airDensity;
        this.physics.constructor.variables.dragCoefficientBeforeParachute = values.dragCoefficientBeforeParachute;
        this.physics.constructor.variables.dragCoefficientForParachute = values.dragCoefficientForParachute;
        this.physics.constructor.variables.liftCoefficientBeforeParachute = values.liftCoefficientBeforeParachute;
        this.physics.constructor.variables.liftCoefficientForParachute = values.liftCoefficientForParachute;
        this.physics.constructor.variables.OMEGA = values.OMEGA;
        this.physics.constructor.variables.latitude = values.latitude;
        this.physics.constructor.variables.wind.set(values.windSpeed.x, values.windSpeed.y, values.windSpeed.z);


        if (values.autoOpenParachute) {
            this.autoParachuteHeight = values.parachuteOpenHeight;
        }
    }

    setupPreSimulationScene(defaultValues) {

        if (this.models.plane) {
            this.models.plane.position.copy(defaultValues.startPosition);
            this.models.plane.visible = true;
            this.cameraManager.focusOnPlane(this.models.plane.position);
        }

        if (this.models.skydiverGroup) {
            this.models.skydiverGroup.visible = false;
        }
    }

    startSimulationScene() {
        if (this.models.plane) {
            this.models.plane.visible = false;
        }

        if (this.models.skydiverGroup) {
            this.models.skydiverGroup.visible = true;
            this.models.skydiverGroup.parachuteModel.visible = false;
        }
    }

    updatePlanePosition(position) {
        if (this.models.plane && this.models.plane.visible) {
            this.models.plane.position.set(position.x, position.y, position.z);
            this.cameraManager.focusOnPlane(this.models.plane.position);
        }
    }

    initializeSimulationTracking(values) {
        this.isSimulationRunning = true;
        this.simulationStartTime = this.clock.getElapsedTime();
        this.simulationStats = {
            maxSpeed: 0,
            maxAltitude: values.startPosition.y,
            totalDistance: 0,
            parachuteOpenTime: null,
            parachuteOpenHeight: null,
            startPosition: new THREE.Vector3(values.startPosition.x, values.startPosition.y, values.startPosition.z)
        };
        this.previousPosition.copy(this.skyDiver.position);
    }

    updateOrientation(deltaTime) {
        if (!this.isSimulationRunning) return;

        const rotationSpeedDt = this.rotationSpeed * deltaTime;
        const keyStates = this.inputManager.getKeyStates();

        if (this.skyDiver.parachuteOpend) {
            if (keyStates["ArrowLeft"]) {
                this.skyDiver.rotateParachuteL(deltaTime);
            }
            if (keyStates["ArrowRight"]) {
                this.skyDiver.rotateParachuteR(deltaTime);
            }
            if (keyStates["ArrowUp"]) {
                this.skyDiver.rotateParachuteF(deltaTime);
            }
        } else {
            if (keyStates["ArrowLeft"]) {
                this.skyDiver.rotateBody(this.skyDiver.bodyFront, -rotationSpeedDt);
            }
            if (keyStates["ArrowRight"]) {
                this.skyDiver.rotateBody(this.skyDiver.bodyFront, rotationSpeedDt);
            }
            if (keyStates["ArrowUp"]) {
                this.skyDiver.rotateBody(this.skyDiver.bodyRight, -rotationSpeedDt);
            }
            if (keyStates["ArrowDown"]) {
                this.skyDiver.rotateBody(this.skyDiver.bodyRight, rotationSpeedDt);
            }
        }
    }


    endSimulation() {
        this.isSimulationRunning = false;


        const gy = this.getGroundYAt(this.skyDiver.position.x, this.skyDiver.position.z);
        const finalY = gy !== null ? Math.max(gy, this.skyDiver.position.y) : this.skyDiver.position.y;

        this.finalValues = {
            velocity: this.finalValues.velocity,
            position: {
                x: this.skyDiver.position.x,
                y: finalY,
                z: this.skyDiver.position.z
            },

            parachuteOpened: this.skyDiver.parachuteOpend,
            forces: {
                gravity: this.physics.forces.get('Gravity Force')?.force.length() || 0,
                drag: this.physics.forces.get('Drag Force')?.force.length() || 0,
                lift: this.physics.forces.get('Lift Force')?.force.length() || 0,
                coriolis: this.physics.forces.get('Coriolis Force')?.force.length() || 0,
                total: this.physics.totalForce.force.length() || 0
            }
        };


        this.endWidget.show(this.finalValues, this.simulationStats);
    }

    updateModels() {
        if (!this.models.skydiverGroup) return;

        this.models.skydiverGroup.position.copy(this.skyDiver.position);
        this.models.skydiverGroup.quaternion.copy(this.skyDiver.modelOrientation);


        if (this.skyDiver.parachuteOpend) {
            this.models.skydiverGroup.parachuteModel.visible = true;
        } else {
            this.models.skydiverGroup.parachuteModel.visible = false;
        }
    }

    startRenderLoop() {
        const renderLoop = () => {
            const currentTime = this.clock.getElapsedTime();
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;


            if (!this.models.skydiver) {
                requestAnimationFrame(renderLoop);
                return;
            }


            if (this.isSimulationRunning) {
                this.updateOrientation(deltaTime);
                this.physics.applyForces(this.skyDiver);
                this.skyDiver.update(deltaTime);

                this.handleTerrainCollision();
                this.physics.drawVectors(this.sceneManager.getScene(), this.skyDiver.position);
                this.skyDiver.syncModelRotation();
                this.updateModels();
                this.updateStats();

                this.cameraManager.updateCameraFollow(this.models.skydiverGroup.position, deltaTime);
            }

            this.sceneManager.render(this.cameraManager.getCamera());
            requestAnimationFrame(renderLoop);
        };

        renderLoop();
    }

    updateStats() {
        const dragForce = this.physics.forces.get('Drag Force');
        const gravityForce = this.physics.forces.get('Gravity Force');
        const liftForce = this.physics.forces.get('Lift Force');
        const coriolisForce = this.physics.forces.get('Coriolis Force');
        this.uiManager.updateSimulationData({
            position: this.skyDiver.position,
            velocity: this.skyDiver.velocity,
            acceleration: this.skyDiver.acceleration,
            autoLiftCoeffX: this.physics.constructor.variables.AutoliftCoefficientX || 0,
            autoLiftCoeffZ: this.physics.constructor.variables.AutoliftCoefficientZ || 0,
            autoDragCoeff: this.physics.constructor.variables.AutoDragCoefficient,
            parachuteOpen: this.skyDiver.parachuteOpend,
            forces: {
                Gravity: gravityForce?.force || new THREE.Vector3(),
                Drag: dragForce?.force || new THREE.Vector3(),
                Lift: liftForce?.force || new THREE.Vector3(),
                Coriolis: coriolisForce?.force || new THREE.Vector3(),
                Total: this.physics.totalForce.force || new THREE.Vector3(),
            }
        });

        const currentSpeed = this.skyDiver.velocity.length();
        if (currentSpeed > this.simulationStats.maxSpeed) {
            this.simulationStats.maxSpeed = currentSpeed;
        }


        const distanceMoved = this.skyDiver.position.distanceTo(this.previousPosition);
        this.simulationStats.totalDistance += distanceMoved;
        this.previousPosition.copy(this.skyDiver.position);


        if (this.autoParachuteHeight && !this.skyDiver.parachuteOpend &&
            this.skyDiver.position.y <= this.autoParachuteHeight) {
            this.skyDiver.openParachute();
            this.simulationStats.parachuteOpenTime = this.simulationStats.flightTime;
            this.simulationStats.parachuteOpenHeight = this.skyDiver.position.y;
        }
    }

    // تابع بيجيب اول نقطة تقاطع تحت
    // x,z
    getGroundYAt(x, z) {
        const terrain = this.models?.terrain;
        if (!terrain) return null;
        const origin = new THREE.Vector3(x, 1e6, z);
        this.raycaster.set(origin, this.down);
        const hits = this.raycaster.intersectObject(terrain, true);
        if (hits && hits.length > 0) {
            return hits[0].point.y;
        }
        return null;
    }

    handleTerrainCollision() {
        const terrain = this.models?.terrain;
        if (!terrain) return;
        const pos = this.skyDiver.position;
        const groundY = this.getGroundYAt(pos.x, pos.z);
        if (groundY === null) return;
        if (pos.y <= groundY) {
            pos.y = groundY;
            this.finalValues.velocity.x = this.skyDiver.velocity.x;
            this.finalValues.velocity.y = this.skyDiver.velocity.y;
            this.finalValues.velocity.z = this.skyDiver.velocity.z;
            this.skyDiver.velocity.set(0, 0, 0);
            this.skyDiver.acceleration.set(0, 0, 0);
            this.models.skydiverGroup.parachuteModel.visible = false;
            this.models.parachute.visible = false;
            this.endSimulation();
        }
    }

}
