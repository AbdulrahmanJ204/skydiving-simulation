import {Force} from "./force";
import {MathUtils, Vector3} from "three";

// checked
export class LiftForce extends Force {
    constructor({name, color}) {
        super({name: name, color: color});
        this.relativeAir = new Vector3(0, 0, 0);
        this.liftDirection = new Vector3(0, 0, 0);
    }

    autoLiftCoefficient(angleRad, variables) {
        return Math.abs(Math.sin(2 * angleRad)) * variables.liftCoefficientBeforeParachute;
    }

    projectOntoPlane(vector, normal) {
        const n = normal.clone().normalize();
        const projection = n.clone().multiplyScalar(vector.dot(n));
        return vector.clone().sub(projection);
    }

    calculateForce({skydiver, variables}) {
        this.relativeAir = skydiver.velocity
            .clone()
            .add(variables.wind);
        let parachuteOpend = skydiver.parachuteOpend;

        return parachuteOpend
            ? this.forceWithParachute(skydiver, variables)
            : this.forceWithoutParachute(skydiver, variables);
    }

    forceWithParachute(skydiver, variables) {

        const airflow = this.relativeAir.clone().normalize();
        this.liftDirection = this.projectOntoPlane(
            skydiver.bodyFront.clone(),
            airflow
        );
        this.liftDirection.normalize();

        const mag =
            0.5 *
            variables.airDensity *
            skydiver.area *
            variables.liftCoefficientForParachute *
            this.relativeAir.lengthSq();

        this.force.copy(this.liftDirection.clone().multiplyScalar(mag));
        return this.force;
    }

    forceWithoutParachute(skydiver, variables) {
        const rightAngle = this.relativeAir.angleToFixed(skydiver.bodyRight);
        const frontAngle = this.relativeAir.angleToFixed(skydiver.bodyFront);
        const upAngle = MathUtils.radToDeg(
            this.relativeAir.angleToFixed(skydiver.bodyUp)
        );
        variables.AutoliftCoefficientX =
            this.autoLiftCoefficient(rightAngle, variables);
        variables.AutoliftCoefficientZ =
            this.autoLiftCoefficient(frontAngle, variables);

        const rightAngleDeg = MathUtils.radToDeg(
            this.relativeAir.angleTo(skydiver.bodyRight)
        );
        this.liftDirection.set(0, 0, 0);
        this.liftDirection.add(
            skydiver.bodyRight
                .clone()
                .normalize()
                .multiplyScalar(rightAngleDeg > 90 ? -1 : 1)
        );
        const frontAngleDeg = MathUtils.radToDeg(
            this.relativeAir.angleTo(skydiver.bodyFront)
        );
        this.liftDirection.add(
            skydiver.bodyFront
                .clone()
                .normalize()
                .multiplyScalar(frontAngleDeg > 90 ? -1 : 1)
        );
        this.liftDirection = this.projectOntoPlane(this.liftDirection, this.yVec);
        this.liftDirection.normalize();

        if (upAngle < 89.0 || upAngle > 91.0) {
            this.liftDirection.x *= variables.AutoliftCoefficientX;
            this.liftDirection.z *= variables.AutoliftCoefficientZ;
        } else this.liftDirection.multiplyScalar(0.0001);
        const mag =
            0.5 *
            variables.airDensity *
            skydiver.area *
            this.relativeAir.lengthSq();

        this.force.copy(this.liftDirection.clone().multiplyScalar(mag));
        return this.force;
    }
}
