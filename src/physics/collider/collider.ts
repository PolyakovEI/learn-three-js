import { Vector3 } from "three";

export interface CollideEvent {
    point: Vector3,
    targets: Collider[],
    source: Collider,
    normal: Vector3,
    deep: number,
}

export type ColliderType = 'box' | 'circle' | 'line' | 'point';

export abstract class Collider {
    position: Vector3;

    abstract type: ColliderType;

    onCollide: (event: CollideEvent) => void;
}