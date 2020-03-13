import { Collider } from "./collider";

export class CircleCollider extends Collider {
    type: 'circle';

    constructor(public radius: number) {
        super();
    }
}