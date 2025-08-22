import {Vector3} from "three";
import {Force} from "./force";

// checked
export class CoriolisForce extends Force {
    omega;
    latitude = 0;
    constructor({name, color}) {
        super({name: name, color: color});
        this.omega = new Vector3(0, 0, 0);
    }

    calculateForce({skydiver, variables}) {
        this.latitude = (variables.latitude * Math.PI) / 180;
        this.omega = new Vector3(
            0, // شرق
            variables.OMEGA * Math.cos(this.latitude), // فوق
            variables.OMEGA * Math.sin(this.latitude) // z شمال
        );
        this.force
            .crossVectors(this.omega, skydiver.velocity)
            .multiplyScalar(-2 * skydiver.mass);

        return this.force;
    }
}
