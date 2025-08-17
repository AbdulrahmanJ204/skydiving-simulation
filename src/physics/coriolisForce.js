import { Vector3 } from "three";
import { Force } from "./force";
// checked
export class CoriolisForce extends Force {
  constructor({ name, color }) {
    super({ name: name, color: color });
    this.omega = new Vector3(0, 0, 0);
  }
  calculateForce({ skydiver, controllableVariables }) {
    this.latitude = (controllableVariables.latitude * Math.PI) / 180;
    this.omega = new Vector3(
      0, // شرق
      controllableVariables.OMEGA * Math.cos(controllableVariables.latitude), // فوق
      controllableVariables.OMEGA * Math.sin(controllableVariables.latitude) // z شمال
    );
    this.force
      .crossVectors(this.omega, skydiver.velocity)
      .multiplyScalar(-2 * skydiver.mass);

    return this.force;
  }
}
