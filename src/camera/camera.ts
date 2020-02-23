import { AppService } from "../app-service";
import { OrthographicCamera } from "three";
import { App } from "../app";
import { Observable, BehaviorSubject } from "rxjs";

export class CameraService extends AppService {
  main: OrthographicCamera;

  // соотношение размера пиксиля к единице пространства в мире
  private _$scale: BehaviorSubject<number> = new BehaviorSubject(1);

  $onScale: Observable<number> = this._$scale.asObservable();

  get scale() {
    return this._$scale.getValue();
  }

  set scale(scale: number) {
    const coeff = scale / this._$scale.getValue();

    this.main.top = this.main.top * coeff;
    this.main.bottom = this.main.bottom * coeff;
    this.main.left = this.main.left * coeff;
    this.main.right = this.main.right * coeff;
    this.main.updateProjectionMatrix();

    this._$scale.next(scale);
  }

  onInit(instance: App) {
    // const aspectRatio = instance.renderer.width / instance.renderer.height;
    // const fieldOfView = 100;
    // const nearPlane = 1;
    // const farPlane = 10000;

    // this.main = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

    const aspect = instance.renderer.canvas.offsetWidth / instance.renderer.canvas.offsetHeight;
    const height = 200;
    const width = height * aspect;
    this.main = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -100, 100);

    instance.renderer.$onResize.subscribe({
      next: () => this._onResize(instance)
    });


  }

  private _onResize(instance: App) {
    // this.main.aspect = instance.renderer.width / instance.renderer.height;

    const aspect = instance.renderer.canvas.offsetWidth / instance.renderer.canvas.offsetHeight;
    const height = this.main.top - this.main.bottom;
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
