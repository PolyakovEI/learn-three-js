import { Vector3, LineSegments, LineBasicMaterial, Geometry, Color, Object3D } from "three";

import { Collider, HELPER_COLOR } from "./collider";

export class LineCollider extends Collider {
  type: 'line';
  
  constructor(public a: Vector3, public b: Vector3) {
    super();
  }

  helper(color: Color = HELPER_COLOR): Object3D {
    const geometry = new Geometry();

    geometry.vertices.push(
      this.a,
      this.b
    );

    return new LineSegments(geometry, new LineBasicMaterial({ color }));
  }
}
