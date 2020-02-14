import { AppService } from "../app-service";

import { Scene, WebGLRenderer, Fog } from "three";

import { fromEvent, Observable } from "rxjs";
import { App } from "../app";
import { app } from "../main";

export class RendererService extends AppService {

  scene: Scene;

  canvas: HTMLCanvasElement;

  renderer: WebGLRenderer;

  //  на самоме деле здесь хранится WebGL2RenderingContext
  context: WebGLRenderingContext;

  $onResize = new Observable<UIEvent>();

  get width(): number {
    return window.innerWidth;
  }

  set width(value: number) {

  }

  get height(): number {
    return window.innerHeight;
  }

  set height(value: number) {

  }
  
  protected onInit(instance: App) {
    this.canvas = document.createElement('canvas');

    this.context = <WebGLRenderingContext>this.canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
    });

    this.renderer = new WebGLRenderer({ canvas: this.canvas, context: this.context });
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;

    this.scene = new Scene();
    // добавляем на сцену эффект тумана с цветом, как и цвет фона
    this.scene.fog = new Fog(0xf7d9aa, 100, 950);

    document.body.appendChild(this.renderer.domElement);
    this.$onResize = fromEvent<UIEvent>(window, 'resize');
    this.$onResize.subscribe({
      next: () => this._onResize()
    });
  }

  private _onResize() {
    this.renderer.setSize(this.width, this.height);
  }

  public startRender() {
    requestAnimationFrame(() => this._render());
  }

  private _render() {
    this.renderer.render(this.scene, app.camera.main);
    app.keyboard.emmitPressed();
    requestAnimationFrame(() => this._render());
  }

}
