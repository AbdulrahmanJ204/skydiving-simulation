import { Vector3, Quaternion, MathUtils, Matrix4 } from "three";

export class SkyDiver {
  constructor() {
    this.parachuteOpend = false;
    this.position = new Vector3(0, 0, 0);
    this.velocity = new Vector3(0, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);
    this.mass = 0;
    this.parachuteArea = 0;
    this.area = 0;
    this.bodyUp = new Vector3(0, 1, 0);
    this.bodyRight = new Vector3(1, 0, 0);
    this.bodyFront = new Vector3(0, 0, -1);
    
    this.orientationForPhysics = new Quaternion();
    this.modelOrientation = new Quaternion();
    
    this.parachuteRotationAngleLR = 0;
    
    this.parachuteRotationAngleFB = 0
    this.lastAppliedRotationFB = 0; 
    
    this.maxParachuteAngle = 80;
    this.rotationSpeedFB = 10; 
    this.rotationSpeedLR = 1; 
  }
  applyForce(force) {
    this.acceleration.copy(force.clone().divideScalar(this.mass));
  }
  openParachute() {
    if (this.parachuteOpend) return;
    this.orientationForPhysics = new Quaternion();
    this.modelOrientation = new Quaternion();
    this.parachuteOpend = true;
    this.area = this.parachuteArea;
    this.updateAxesFromOrientation();
    
  }
  update(delta) {
    this.velocity.add(this.acceleration.clone().multiplyScalar(delta));
    const deltaP = this.velocity.clone().multiplyScalar(delta);

    this.position.add(deltaP);

  }
  rotateParachuteR(deltaTime) {
    if (!this.parachuteOpend) return;
    const deltaAngle = this.rotationSpeedLR * deltaTime;
    this.parachuteRotationAngleLR = Math.max(
      this.parachuteRotationAngleLR - deltaAngle,
      -this.maxParachuteAngle
    );

  }

  rotateParachuteL(deltaTime) {
    if (!this.parachuteOpend) return;
    const deltaAngle = this.rotationSpeedLR * deltaTime;
    this.parachuteRotationAngleLR = Math.min(
      this.parachuteRotationAngleLR + deltaAngle,
      this.maxParachuteAngle
    );
  }
  rotateParachuteF(deltaTime) {
    if (!this.parachuteOpend) return;
    const deltaAngle = this.rotationSpeedFB * deltaTime;
    this.parachuteRotationAngleFB = Math.max(
      this.parachuteRotationAngleFB - deltaAngle,
      -this.maxParachuteAngle
    );
  }

  rotateBody(axis, angleRadians) {
    const q = new Quaternion();
    q.setFromAxisAngle(axis.clone().normalize(), angleRadians);
    this.orientationForPhysics.premultiply(q);
    this.modelOrientation.premultiply(q);
    this.updateAxesFromOrientation();
  }
  updateAxesFromOrientation() {
    const baseRight = new Vector3(1, 0, 0);
    const baseUp = new Vector3(0, 1, 0);
    const baseFront = new Vector3(0, 0, -1);

    this.bodyFront = baseFront
      .clone()
      .applyQuaternion(this.orientationForPhysics)
      .normalize();
    this.bodyRight = baseRight
      .clone()
      .applyQuaternion(this.orientationForPhysics)
      .normalize();
    this.bodyUp = baseUp.clone().applyQuaternion(this.orientationForPhysics).normalize();
  }
  syncModelRotation() {
    if (this.parachuteOpend) {
      this.modelOrientation = new Quaternion();
        let rotationChanged = false;

      if (this.parachuteRotationAngleLR !== 0) {
        const turnAxis = this.bodyUp.clone();
        const turnAngleRad = MathUtils.degToRad(this.parachuteRotationAngleLR);
        const q = new Quaternion().setFromAxisAngle(turnAxis, turnAngleRad);
        this.orientationForPhysics.premultiply(q);
        rotationChanged = true;

        const damping = 0.98;
        this.parachuteRotationAngleLR *= damping;
        if (Math.abs(this.parachuteRotationAngleLR) < 0.01) {
          this.parachuteRotationAngleLR = 0;
        }
      }

      const deltaFB = this.parachuteRotationAngleFB - this.lastAppliedRotationFB;
      if (Math.abs(deltaFB) > 0.001) {
        const pitchAxis = this.bodyRight.clone();
        const pitchAngleRad = MathUtils.degToRad(deltaFB);
        const q = new Quaternion().setFromAxisAngle(pitchAxis, pitchAngleRad);
        this.orientationForPhysics.premultiply(q);
        this.lastAppliedRotationFB = this.parachuteRotationAngleFB;
        rotationChanged = true;
      }



      if (rotationChanged) {
        this.updateAxesFromOrientation();
      }

      const fbDamping = 0.95;
      this.parachuteRotationAngleFB *= fbDamping;
      if (Math.abs(this.parachuteRotationAngleFB) < 0.1) {
        this.parachuteRotationAngleFB = 0;
        this.lastAppliedRotationFB = 0;
      }
   
      this.modelOrientation.premultiply(this.orientationForPhysics)
    } else {
      const m = new Matrix4();
      m.makeBasis(this.bodyRight, this.bodyFront, this.bodyUp);
      this.modelOrientation.setFromRotationMatrix(m);
    }
    const flip = new Quaternion();
    flip.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);
    
    this.modelOrientation.multiply(flip);
  }
  addGuiFolder(gui) {
    this.folder = gui.addFolder("Skydiver Settings");

    this.folder.add(this, "mass").min(50).max(200).step(1).listen();
    this.folder.add(this, "area").min(0.5).max(3).step(0.1).listen();
    this.folder.add(this, "parachuteArea").min(5).max(50).step(1).listen();

    return this.folder;
  }
}
