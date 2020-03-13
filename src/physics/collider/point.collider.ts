import { Vector3, Points, BufferGeometry, Object3D, Geometry, MeshBasicMaterial, Color } from "three";

import { Collider, HELPER_COLOR } from "./collider";

export class PointCollider extends Collider {
  type: 'point';

  constructor(public position: Vector3) {
    super();
  }

  helper(color: Color = HELPER_COLOR): Object3D {
    const geometry = new Geometry();

    geometry.vertices.push(this.position);

    return new Points(geometry, new MeshBasicMaterial({ color }));
  }
}
