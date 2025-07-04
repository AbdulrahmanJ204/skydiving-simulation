import { Force } from "./force";
import { Vector3 } from "three";
export class LiftForce extends Force {
  constructor({ name, color }) {
    super({ name: name, color: color });
    this.relativeVelocity = new Vector3(0, 0, 0);
    this.liftDirection = new Vector3(0, 0, 0);
  }
  calculateForce({ skydiver, controllableVariables }) {
    this.relativeVelocity = skydiver.velocity
      .clone()
      .sub(controllableVariables.wind);
    this.liftDirection
      .crossVectors(this.relativeVelocity, skydiver.bodyRight)
      .cross(this.relativeVelocity)
      .normalize();

    this.force.copy(
      this.liftDirection
        .clone()
        .multiplyScalar(
          0.5 *
            controllableVariables.airDensity *
            controllableVariables.liftCoefficient *
            skydiver.area *
            this.relativeVelocity.length() *
            this.relativeVelocity.length()
        )
    );
    return this.force;
  }
}
