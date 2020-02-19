import { AppService } from "./app-service";
import { OrthographicCamera } from "three";
import { App } from "./app";

export class CameraService extends AppService {
  main: OrthographicCamera;

  // соотношение размера пиксиля к единице пространства в мире
  private _scale: number = 1;

  get width() {
    return this.main.right - this.main.left;
  }

  set width(width: number) {
    const half = this._scale * width / 2;
    this.main.left = -half;
    this.main.right = half;
    this.main.updateProjectionMatrix();
  }

  get height() {
    return this.main.top - this.main.bottom;
  }

  set height(height: number) {
    const half = this._scale * height / 2;
    this.main.top = half;
    this.main.bottom = -half;
    this.main.updateProjectionMatrix();
  }

  get scale() {
    return this._scale;
  }

  set scale(scale: number) {
    this.main.top = this.main.top * scale / this._scale;
    this.main.bottom = this.main.bottom * scale / this._scale;
    this.main.left = this.main.left * scale / this._scale;
    this.main.right = this.main.right * scale / this._scale;
    this._scale = scale;
    this.main.updateProjectionMatrix();
  }

  onInit(instance: App) {
    // const aspectRatio = instance.renderer.width / instance.renderer.height;
    // const fieldOfView = 100;
    // const nearPlane = 1;
    // const farPlane = 10000;

    // this.main = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

    const aspect = instance.renderer.width / instance.renderer.height;
    const height = 200;
    const width = height * aspect;
    this.main = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -100, 100);

    instance.renderer.$onResize.subscribe({
      next: () => this._onResize(instance)
    });
  }

  private _onResize(instance: App) {
    // this.main.aspect = instance.renderer.width / instance.renderer.height;

    const aspect = instance.renderer.width / instance.renderer.height;
    const height = this.height;
    const width = height * aspect;

    const hhalf = height / 2;
    this.main.top = hhalf;
    this.main.bottom = -hhalf;
    const whalf = width / 2;
    this.main.left = -whalf;
    this.main.right = whalf;
  
    this.main.updateProjectionMatrix();
  }
}
