import { AppService } from "./app-service";
import { PerspectiveCamera } from "three";
import { App } from "./app";

export class CameraService extends AppService {
  main: PerspectiveCamera;

  onInit(instance: App) {
    const aspectRatio = instance.renderer.width / instance.renderer.height;
    const fieldOfView = 60;
    const nearPlane = 1;
    const farPlane = 10000;

    this.main = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    this.main.position.x = 0;
    this.main.position.z = 200;
    this.main.position.y = 100;

    instance.renderer.$onResize.subscribe({
      next: () => this._onResize(instance)
    });
  }

  private _onResize(instance: App) {
    this.main.aspect = instance.renderer.width / instance.renderer.height;
    this.main.updateProjectionMatrix();
  }
}
