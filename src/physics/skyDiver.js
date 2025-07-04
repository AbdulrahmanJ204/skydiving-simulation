import { Vector3 } from "three";
import { Physics } from "./physics";
export class SkyDiver {
  constructor() {
    this.parachuteOpend = false;
    this.position = new Vector3(3, 1000, 0);
    this.velocity = new Vector3(0, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);
    this.mass = 100;
    this.parachuteArea = 10;
    this.area = 1;
    this.bodyUp = new Vector3(0, 1, 0);
    this.bodyRight = new Vector3(1, 0, 0);
    this.bodyFront = new Vector3(0, 0, 1);
  }
  applyForce(force) {
    // if (this.position.y <= 0) return;
    // maybe here should be the collision logic
    
    this.acceleration.copy(force.clone().divideScalar(this.mass));
  }
  openParachute() {
    if (this.parachuteOpend) return;
    // should change Cl and Cd ig.
    this.parachuteOpend = true;
    this.area += this.parachuteArea;
    // Physics.controllableVariables.dragCoefficient+=1;
    // Physics.controllableVariables.liftCoefficient=1;
    // Physics.increaseLiftCoef(1);
    
  }
  update(delta) {
    this.velocity.add(this.acceleration.clone().multiplyScalar(delta));
    const temp = this.velocity.clone().multiplyScalar(delta);
    if (this.position.y <= 0) {
      if (temp.y < 0) {
        this.position.y = 0;
        this.acceleration.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        return;
      }
    }

    this.position.add(temp);
  }
  addGuiFolder(gui) {
    this.folder = gui.addFolder("Skydiver Variables");

    this.folder.add(this, "mass").listen();
    this.folder.add(this, "area").listen();
    this.folder.add(this, "parachuteOpend").listen();
    this.folder.add(this, "parachuteArea").listen();
    this.positionFolder = this.folder.addFolder("position");
    this.positionFolder.add(this.position, "x").listen();
    this.positionFolder.add(this.position, "y").listen();
    this.positionFolder.add(this.position, "z").listen();
    this.velocityFolder = this.folder.addFolder("velocity");
    this.velocityFolder.add(this.velocity, "x").listen();
    this.velocityFolder.add(this.velocity, "y").listen();
    this.velocityFolder.add(this.velocity, "z").listen();
    this.accelerationFolder = this.folder.addFolder("acceleration");
    this.accelerationFolder.add(this.acceleration, "x").listen();
    this.accelerationFolder.add(this.acceleration, "y").listen();
    this.accelerationFolder.add(this.acceleration, "z").listen();
    this.bodyUpFolder = this.folder.addFolder("bodyUp");
    this.bodyUpFolder.add(this.bodyUp, "x").listen();
    this.bodyUpFolder.add(this.bodyUp, "y").listen();
    this.bodyUpFolder.add(this.bodyUp, "z").listen();
    this.bodyRightFolder = this.folder.addFolder("bodyRight");
    this.bodyRightFolder.add(this.bodyRight, "x").listen();
    this.bodyRightFolder.add(this.bodyRight, "y").listen();
    this.bodyRightFolder.add(this.bodyRight, "z").listen();
    this.bodyFrontFolder = this.folder.addFolder("bodyFront");
    this.bodyFrontFolder.add(this.bodyFront, "x").listen();
    this.bodyFrontFolder.add(this.bodyFront, "y").listen();
    this.bodyFrontFolder.add(this.bodyFront, "z").listen();
    return this.folder;
  }
}
