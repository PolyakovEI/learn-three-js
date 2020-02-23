import { WebGLRenderer } from "three";
import { fromEvent, Observable } from "rxjs";

import { AppService } from "../app-service";
import { App } from "../app";
import { app } from "../main";

/**
 * Сервис для оранизации цикла отрисовка, а также управления основными элементами WebGL
 */
export class RendererService extends AppService {
  /**
   * DOM элемент для отрисовки
   * Холст
   */
  canvas: HTMLCanvasElement;

  /**
   * Контекст рисования WebGL
   * На самоме деле здесь хранится WebGL2RenderingContext
   * Кисточка и палитра
   */
  context: WebGLRenderingContext;
  
  /**
   * ThreeJS renderer
   * Художник
   */
  renderer: WebGLRenderer;

  /** Событие изменения размера холста */
  $onResize = new Observable<UIEvent>();

  /** Проверка того, что цикл отрисовки запущен */
  get isOn(): boolean {
    return this._renderFrameId !== null;
  }

  /** Id запроса на отрисовку */
  private _renderFrameId: number = null;

  protected onInit(instance: App) {
    this.canvas = document.createElement('canvas');
    this.canvas.oncontextmenu = () => false;

    this.context = <WebGLRenderingContext>this.canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
    });

    const initiallizeWidth = window.innerWidth;
    const initiallizeHeight = window.innerHeight;
    this.renderer = new WebGLRenderer({ canvas: this.canvas, context: this.context });
    this.renderer.setSize(initiallizeWidth, initiallizeHeight);
    this.renderer.shadowMap.enabled = true;

    

    document.body.appendChild(this.renderer.domElement);
    this.$onResize = fromEvent<UIEvent>(window, 'resize');
    this.$onResize.subscribe({
      next: () => this._onResize()
    });
  }

  /**
   * Метод для запуска цикла отрисовки
   */
  start() {
    this._renderFrameId = requestAnimationFrame(() => this._render());
  }

  /**
   * Метод для остановки цикла отрисовки
   */
  stop() {
    cancelAnimationFrame(this._renderFrameId);
    this._renderFrameId = null;
  }

  /**
   * Главный метод для отрисовки кадра, вызывается каждый раз при возможности
   */
  private _render() {
    this._renderFrameId = requestAnimationFrame(() => this._render());

    this.renderer.render(app.world.scene, app.camera.main);
  }

  /**
   * Метод обработки размера холста
   */
  private _onResize() {
    this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
  }
}
