import {Vector3} from "three";
import {Force} from "./force";

// checked
export class DragForce extends Force {
    constructor({name, color}) {
        super({name: name, color: color});
        this.relativeAir = new Vector3(0, 0, 0);

    }

    autoDragCoefficient(angleRad, variables) {
        return Math.abs(Math.cos(angleRad)) * variables.dragCoefficientBeforeParachute;
    }

    calculateForce({skydiver, variables}) {
        //   Fd = - 1/2 * p * Cd * A * |v|^2 * vVector

        this.relativeAir.copy(skydiver.velocity).add(variables.wind);
        const angle = this.relativeAir.angleToFixed(skydiver.bodyUp);
        const cd =
            skydiver.parachuteOpend ?
                variables.dragCoefficientForParachute :
                this.autoDragCoefficient(angle, variables)
        variables.AutoDragCoefficient = cd;

        const vRelLenSq = this.relativeAir.lengthSq();
        if (vRelLenSq === 0 || !Number.isFinite(vRelLenSq)) {
            this.force.set(0, 0, 0);
            return this.force;
        }
        this.force.copy(
            this.relativeAir
                .clone()
                .negate()
                .multiplyScalar(
                    0.5 *
                    variables.airDensity *
                    cd *
                    skydiver.area *
                    vRelLenSq
                )
        );

        return this.force;
    }
}
