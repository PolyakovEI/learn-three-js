import { Vector3, Box3, Sphere, Line3, Object3D, Mesh, Color, Geometry } from "three";

export const HELPER_COLOR: Color = new Color(0x82DCAE);

export interface CollideEvent {
    point: Vector3,
    normal?: Vector3,
    deep?: number,
}

export type ColliderType = 'box' | 'circle' | 'line' | 'point';

export type ColliderInstance = Box3 | Sphere | Line3 | Vector3;

export abstract class Collider {

  abstract readonly type: ColliderType;

  onCollide: (event: CollideEvent) => void;

  abstract helper(): Object3D;
}
