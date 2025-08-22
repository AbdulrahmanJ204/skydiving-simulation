import {GravityForce} from "./gravityForce";
import {DragForce} from "./dragForce";
import {LiftForce} from "./LiftForce";
import {CoriolisForce} from "./coriolisForce";
import {ArrowHelper, Vector3} from "three";
import {Force} from "./force";

export class Physics {
    static variables = {
        gravity: 9.81,
        airDensity: 1.225,
        dragCoefficientForParachute: 0.005,
        dragCoefficientBeforeParachute: 0.005,
        liftCoefficientForParachute: 0.005,
        liftCoefficientBeforeParachute: 0.3,
        AutoliftCoefficientX: 0,
        AutoliftCoefficientZ: 0,
        AutoDragCoefficient: 0,
        wind: new Vector3(0, 0, 0),
        OMEGA: 7.2921159e-5,
        latitude: 90,

    };
    forces = new Map();
    arrowHelpers = new Map();
    totalForce;

    constructor() {
        this.forces.set(
            "Gravity Force",
            new GravityForce({name: "Gravity Force", color: "red"})
        );
        this.forces.set(
            "Drag Force",
            new DragForce({name: "Drag Force", color: "blue"})
        );
        this.forces.set(
            "Lift Force",
            new LiftForce({name: "Lift Force", color: "purple"})
        );

        this.forces.set(
            "Coriolis Force",
            new CoriolisForce({name: "Coriolis Force", color: "green"})
        );
        this.totalForce = new Force({
            name: "Total Force",
            color: "yellow",
        });
    }

    applyForces(skyDiver) {
        this.totalForce.force.set(0, 0, 0);
        this.forces.forEach((force) => {
            this.totalForce.force.add(
                force.calculateForce({
                    skydiver: skyDiver,
                    variables: Physics.variables,
                })
            );
        });
        skyDiver.applyForce(this.totalForce.force);
    }

    drawVectors(scene, skyDiverPos) {
        this.forces.forEach((force) => {
            if (force.showArrowHelper)
                this.drawVector(scene, force, skyDiverPos);
            else if (this.arrowHelpers.has(force.name))
                scene.remove(this.arrowHelpers.get(force.name));
        });
        if (this.totalForce.showArrowHelper)
            this.drawVector(scene, this.totalForce, skyDiverPos);
        else if (this.arrowHelpers.has(this.totalForce.name))
            scene.remove(this.arrowHelpers.get(this.totalForce.name));
    }

    drawVector(scene, force, pos) {
        const dir = force.force.clone();
        dir.normalize();
        const origin = pos.clone();
        let length = force.force.clone().length() / 100;
        const hex = force.color.getHex();

        if (this.arrowHelpers.has(force.name))
            scene.remove(this.arrowHelpers.get(force.name));

        this.arrowHelpers.set(
            force.name,
            new ArrowHelper(dir, origin, length, hex)
        );
        scene.add(this.arrowHelpers.get(force.name));
    }

    addGuiFolder(gui) {
        this.folder = gui.addFolder("Physics Settings");

        this.folder
            .add(Physics.variables, "gravity")
            .min(-20)
            .max(20)
            .step(0.1)
            .listen();
        this.folder.add(Physics.variables, "airDensity")
            .min(0.1)
            .max(5)
            .step(0.01)
            .listen();

        this.folder.add(Physics.variables, "dragCoefficientBeforeParachute")
            .min(0.001)
            .max(0.2)
            .step(0.001)
            .listen();
        this.folder.add(Physics.variables, "dragCoefficientForParachute")
            .min(0.001)
            .max(0.4)
            .step(0.001)
            .listen();
        this.folder.add(Physics.variables, "liftCoefficientBeforeParachute")
            .min(0.001)
            .max(0.15)
            .step(0.001)
            .listen();

        this.folder.add(Physics.variables, "liftCoefficientForParachute")
            .min(0.001)
            .max(0.4)
            .step(0.001)
            .listen();

        this.windFolder = this.folder.addFolder("Wind");
        this.windFolder.add(Physics.variables.wind, "x")
            .min(-50)
            .max(50)
            .step(0.1)
            .listen();
        this.windFolder.add(Physics.variables.wind, "y")
            .min(-50)
            .max(50)
            .step(0.1)
            .listen();
        this.windFolder.add(Physics.variables.wind, "z")
            .min(-50)
            .max(50)
            .step(0.1)
            .listen();

        this.folder.add(Physics.variables, "OMEGA")
            .min(0)
            .max(0.0001)
            .step(0.000001)
            .listen();
        this.folder.add(Physics.variables, "latitude")
            .min(-180)
            .max(180)
            .step(1)
            .listen();

        const forcesFolder = this.folder.addFolder("Forces");
        this.totalForce.addSettingsFolder?.(forcesFolder);
        this.forces.forEach((force) => {
            force.addSettingsFolder?.(forcesFolder);
        });

        return this.folder;
    }

}
