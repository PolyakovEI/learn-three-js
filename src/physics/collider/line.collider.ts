import { Vector3 } from "three";

import { Collider } from "./collider";

export class LineCollider extends Collider {
    type: 'line';

    constructor(public prevPosition: Vector3) {
        super();
    }
}