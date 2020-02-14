import { AppService } from "./app-service";
import { PerspectiveCamera } from "three";
import { app } from "./main";

export class CameraService extends AppService {
  main: PerspectiveCamera;

  onInit() {
    const aspectRatio = app.renderer.width / app.renderer.height;
    const fieldOfView = 60;
    const nearPlane = 1;
    const farPlane = 10000;

    this.main = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    this.main.position.x = 0;
    this.main.position.z = 200;
    this.main.position.y = 100;

    app.renderer.$onResize.subscribe({
      next: () => this._onResize()
    });
  }

  private _onResize() {
    this.main.aspect = app.renderer.width / app.renderer.height;
    this.main.updateProjectionMatrix();
  }
}
