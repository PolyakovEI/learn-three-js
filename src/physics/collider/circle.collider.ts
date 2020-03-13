import { Collider, HELPER_COLOR } from "./collider";
import { Color, Object3D, Box3Helper, Mesh } from "three";

export class CircleCollider extends Collider {
  type: 'circle';

  get radius(): number {
    return this.object.geometry.boundingSphere.radius;
  };

  constructor(public object: Mesh) {
    super();
    object.geometry.computeBoundingSphere();
  }

  helper(color: Color = HELPER_COLOR): Object3D {
    if (this.object.geometry.boundingBox === null) {
      this.object.geometry.computeBoundingBox();
    }
    return new Box3Helper(this.object.geometry.boundingBox, color);
  }
}
