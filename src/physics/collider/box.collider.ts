import { Collider, HELPER_COLOR } from "./collider";
import { Object3D, Box3Helper, Color, Geometry, Mesh, Vector3 } from "three";

export class BoxCollider extends Collider {
  type: 'box';

  public get width(): number {
    return this._sizes.x;
  };

  public get height (): number {
    return this._sizes.y;
  };

  private _sizes: Vector3 = new Vector3();

  constructor(public object: Mesh) {
    super();
    object.geometry.computeBoundingBox();
    this._sizes = new Vector3();
    object.geometry.boundingBox.getSize(this._sizes);

    this.width = sizes.x;
    this.height = sizes.y;
  }

  helper(color: Color = HELPER_COLOR): Object3D {
    return new Box3Helper(this.object.geometry.boundingBox, color);
  }
}
