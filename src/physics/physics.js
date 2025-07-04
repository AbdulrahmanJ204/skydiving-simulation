import { GravityForce } from "./gravityForce";
import { DragForce } from "./dragForce";
import { LiftForce } from "./LiftForce";
import { CoriolisForce } from "./coriolisForce";
import { Vector3, ArrowHelper, Color } from "three";
import { Force } from "./force";
import GUI from "lil-gui";
export class Physics {
  forces = new Map();

  arrowHelpers = new Map();
  static controllableVariables = {
    gravity: 9.81,
    airDensity: 1.225,
    dragCoefficient: 0.005,
    liftCoefficient: 0.005,
    wind: new Vector3(0, 0, 0),
    OMEGA: 7.2921159e-5,
    latitude: 90, // 0 to 180 and 0 to -180
  };

  constructor() {
    this.forces.set(
      "Gravity Force",
      new GravityForce({ name: "Gravity Force", color: "red" })
    );
    this.forces.set(
      "Drag Force",
      new DragForce({ name: "Drag Force", color: "blue" })
    );
    this.forces.set(
      "Lift Force",
      new LiftForce({ name: "Lift Force", color: "cyan" })
    );
    this.forces.set(
      "Coriolis Force",
      new CoriolisForce({ name: "Coriolis Force", color: "green" })
    );

    this.totalForce = new Force({
      name: "Total Force",
      color: "yellow",
    });
  }
  applyForces(skyDiver) {
    this.totalForce.force.set(0, 0, 0);
    this.forces.forEach((force) => {
      if (force.enabled)
        this.totalForce.force.add(
          force.calculateForce({
            skydiver: skyDiver,
            controllableVariables: Physics.controllableVariables,
          })
        );
    });
    skyDiver.applyForce(this.totalForce.force);
  }
  drawVectors(scene, skyDiverPos) {
    this.forces.forEach((force) => {
      if (force.enabled && force.showArrowHelper)
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
    const length = force.force.length() / 10;
    const hex = force.color.getHex();

    if (this.arrowHelpers.has(force.name))
      scene.remove(this.arrowHelpers.get(force.name));

    this.arrowHelpers.set(
      force.name,
      new ArrowHelper(dir, origin, length, hex)
    );
    scene.add(this.arrowHelpers.get(force.name));
  }
  static increaseDragCoef(value) {
    Physics.controllableVariables.dragCoefficient += value;
  }
  static increaseLiftCoef(value) {
    Physics.controllableVariables.liftCoefficient += value;
  }
  addGuiFolder(gui) {
    this.folder = gui.addFolder("Physics Variables");

    this.folder
      .add(Physics.controllableVariables, "gravity")
      .min(-20)
      .max(20)
      .step(0.1)
      .listen();
    this.folder.add(Physics.controllableVariables, "airDensity").listen();
    this.folder.add(Physics.controllableVariables, "dragCoefficient").listen();
    this.folder.add(Physics.controllableVariables, "liftCoefficient").listen();
    this.windFolder = this.folder.addFolder("Wind");
    this.windFolder.add(Physics.controllableVariables.wind, "x").listen();
    this.windFolder.add(Physics.controllableVariables.wind, "y").listen();
    this.windFolder.add(Physics.controllableVariables.wind, "z").listen();
    this.folder.add(Physics.controllableVariables, "OMEGA").listen();
    this.folder.add(Physics.controllableVariables, "latitude").listen();
    this.totalForce.addGuiFolder(gui);
    this.forces.forEach((force) => {
      force.addGuiFolder(gui);
    });

    return this.folder;
  }
}
