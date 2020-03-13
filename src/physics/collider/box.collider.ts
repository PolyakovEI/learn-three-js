import { Collider } from "./collider";
import { Quaternion } from "three";

export class BoxCollider extends Collider {
    type: 'box';

    rotation: Quaternion = new Quaternion();

    constructor(public width: number, public height: number) {
        super();
    }
}