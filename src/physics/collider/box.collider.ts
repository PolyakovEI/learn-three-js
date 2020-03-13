import { Collider, HELPER_COLOR } from "./collider";
import { Object3D, Box3Helper, Color, Geometry, Mesh, Vector3 } from "three";

export class BoxCollider extends Collider {
  type: 'box';

  get sizes(): Vector3 {
    const sizes = new Vector3();
    this.object.geometry.boundingBox.getSize(sizes);
    return sizes;
  };

  constructor(public object: Mesh) {
    super();
    object.geometry.computeBoundingBox();
  }

  helper(color: Color = HELPER_COLOR): Object3D {
    return new Box3Helper(this.object.geometry.boundingBox, color);
  }
}
