import { Collider, HELPER_COLOR } from "./collider";
import { Color, Object3D, Box3Helper, Geometry } from "three";

export class CircleCollider extends Collider {
  type: 'circle';

  constructor(public geometry: Geometry) {
    super();
    geometry.computeBoundingBox();
  }

  helper(color: Color = HELPER_COLOR): Object3D {
    return new Box3Helper(this.geometry.boundingBox, color);
  }
}
