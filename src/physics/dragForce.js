import { Vector3 } from "three";
import { Force } from "./force";

export class DragForce extends Force {
  constructor({ name, color }) {
    super({ name: name, color: color });
    this.relativeAir = new Vector3(0, 0, 0);
    this.lastCd = 0;
  }
  autoDragCoefficient(angleRad, skyDiver, controllableVariables) {
  
    return Math.abs(Math.cos(angleRad)) *( skyDiver.parachuteOpend ?
      controllableVariables.dragCoefficientForParachute :
      controllableVariables.dragCoefficientBeforeParachute);
  }
  calculateForce({ skydiver, controllableVariables }) {
    //   Fd = - 1/2 * p * Cd * A * |v|^2 * vVector
    const angle = this.relativeAir.angleToFixed(skydiver.bodyUp);
    const cd = this.autoDragCoefficient(angle , skydiver , controllableVariables)
    this.lastCd = cd;
    this.relativeVelocity = skydiver.velocity
      .clone()
      .add(controllableVariables.wind);
    this.force.copy(
      this.relativeVelocity
        .clone()
        .negate()
        .multiplyScalar(
          0.5 *
          controllableVariables.airDensity *
          cd *
          skydiver.area *
          this.relativeVelocity.length() *
          this.relativeVelocity.length()
        )
    );

    return this.force;
  }
}
