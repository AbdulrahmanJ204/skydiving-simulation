import { Force } from "./force";
// checked
export class GravityForce extends Force {
   constructor({name , color}) {
    super({name : name , color : color});
  }
  calculateForce({ skydiver, controllableVariables }) {
    this.force.copy(
      this.yVec
        .clone()
        .negate()
        .multiplyScalar(skydiver.mass * controllableVariables.gravity)
    );
 
   
    return this.force;
  }
}
