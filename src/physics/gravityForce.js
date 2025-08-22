import {Force} from "./force";

// checked
export class GravityForce extends Force {
    constructor({name, color}) {
        super({name: name, color: color});
    }

    calculateForce({skydiver, variables}) {
        this.force.copy(
            this.yVec
                .clone()
                .negate()
                .multiplyScalar(skydiver.mass * variables.gravity)
        );


        return this.force;
    }
}
