import { Vector3 } from "three";

import { Collider } from "./collider";

export class PointCollider extends Collider {
    type: 'point';

    constructor(position: Vector3) {
        super();

        this.position = position;
    }
}