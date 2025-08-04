import { Vector3, Quaternion, MathUtils, Matrix4 } from "three";

import { Physics } from "./physics";
export class SkyDiver {
  constructor() {
    this.parachuteOpend = false;
    this.position = new Vector3(3, 5000, 0);
    this.velocity = new Vector3(0, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);
    this.mass = 100;
    this.parachuteArea = 10;
    this.area = 1;
    this.bodyUp = new Vector3(0, 1, 0);
    this.bodyRight = new Vector3(1, 0, 0);
    this.bodyFront = new Vector3(0, 0, -1);
    this.orientation = new Quaternion();
    this.parachuteRotationAngle = 0; // Degrees
    this.maxParachuteAngle = 30; // Degrees, max rotation
    this.rotationSpeed = 1; // Degrees per second
  }
  setModel(model) {
    this.model = model;
  }

  setParachute(model) {
    this.parachute = model;
  }
  applyForce(force) {
    this.acceleration.copy(force.clone().divideScalar(this.mass));
  }
  openParachute() {
    if (this.parachuteOpend) return;
    this.orientation = new Quaternion();
    this.parachuteOpend = true;
    this.updateAxesFromOrientation();
    this.area += this.parachuteArea;
  }
  update(delta) {
    this.velocity.add(this.acceleration.clone().multiplyScalar(delta));
    const deltaP = this.velocity.clone().multiplyScalar(delta);
    if (this.position.y <= 0) {
      if (deltaP.y < 0) {
        this.position.y = 0;
        this.acceleration.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        return;
      }
    }

    this.position.add(deltaP);

    // Update parachute turning while it's open
    if (this.parachuteOpend && this.parachuteRotationAngle !== 0) {
      const turnAxis = this.bodyUp.clone();
      const turnAngleRad = MathUtils.degToRad(this.parachuteRotationAngle);
      const q = new Quaternion().setFromAxisAngle(turnAxis, turnAngleRad);
      this.orientation.premultiply(q);
      this.updateAxesFromOrientation();

      // Slowly return to center
      const damping = 0.98;
      this.parachuteRotationAngle *= damping;
      if (Math.abs(this.parachuteRotationAngle) < 0.01) {
        this.parachuteRotationAngle = 0;
      }
    }
  }
  rotateParachuteR(deltaTime) {
    if (!this.parachuteOpend) return;
    const deltaAngle = this.rotationSpeed * deltaTime;
    this.parachuteRotationAngle = Math.max(
      this.parachuteRotationAngle - deltaAngle,
      -this.maxParachuteAngle
    );
  }

  rotateParachuteL(deltaTime) {
    if (!this.parachuteOpend) return;
    const deltaAngle = this.rotationSpeed * deltaTime;
    this.parachuteRotationAngle = Math.min(
      this.parachuteRotationAngle + deltaAngle,
      this.maxParachuteAngle
    );
  }
  rotateBody(axis, angleRadians) {
    const q = new Quaternion();
    q.setFromAxisAngle(axis.clone().normalize(), angleRadians);
    this.orientation.premultiply(q); // rotate in local space
    this.updateAxesFromOrientation();
  }
  updateAxesFromOrientation() {
    const baseRight = new Vector3(1, 0, 0);
    const baseUp = new Vector3(0, 1, 0);
    const baseFront = new Vector3(0, 0, -1);

    this.bodyFront = baseFront
      .clone()
      .applyQuaternion(this.orientation)
      .normalize();
    this.bodyRight = baseRight
      .clone()
      .applyQuaternion(this.orientation)
      .normalize();
    this.bodyUp = baseUp.clone().applyQuaternion(this.orientation).normalize();
  }
  syncModelRotation() {
    // if (!this.model) return;

    // Construct a rotation matrix from bodyRight, bodyUp, bodyFront
    const m = new Matrix4();

    // Column-major order: X (right), Y (up), Z (forward)
    const flip = new Quaternion();
    if (this.parachuteOpend) {
      m.makeBasis(this.bodyRight, this.bodyUp, this.bodyFront);
      flip.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI); // flip around X
      this.model.quaternion.copy(this.orientation);
    } else {
      m.makeBasis(this.bodyRight, this.bodyFront, this.bodyUp);
      // Apply this matrix as a quaternion
      flip.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI); // flip around X
      this.model.quaternion.setFromRotationMatrix(m);
    }
    this.model.quaternion.multiply(flip); // apply flip
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
