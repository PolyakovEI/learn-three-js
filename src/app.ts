import { RendererService } from './renderer/renderer';

import { Subject } from 'rxjs';
import { CameraService } from './camera';

export class App {

  renderer: RendererService;
  camera: CameraService;
  // keyboard: keyboardService;
  // mouse: mouseService;
  // world: worldService;

  static $initiallize = new Subject();

  constructor() {
    this.renderer = new RendererService();
    this.camera = new CameraService();
  }

  start() {
    // инициализация всех сервисов
    App.$initiallize.next();

    this.renderer.startRender();
  }

}
