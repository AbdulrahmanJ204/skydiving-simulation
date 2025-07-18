import { Vector3 } from "three";
import { Force } from "./force";

export class DragForce extends Force {
  constructor({ name, color }) {
    super({ name: name, color: color });
  }
  calculateForce({ skydiver, controllableVariables }) {
    //  * Fd = - 1/2 * p * Cd * A * |v|^2 * vVector
    controllableVariables.dragCoefficient = skydiver.parachuteOpend ? 0.1 : 0.05;
    this.relativeVelocity = skydiver.velocity
      .clone()
      .sub(controllableVariables.wind);
    this.force.copy(
      this.relativeVelocity
        .clone()
        .negate()
        .multiplyScalar(
          0.5 *
            controllableVariables.airDensity *
            controllableVariables.dragCoefficient *
            skydiver.area *
            this.relativeVelocity.length() *
            this.relativeVelocity.length()
        )
    );
    
    return this.force;
  }
}
