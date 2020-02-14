import { RendererService } from './renderer/renderer';

import { Subject } from 'rxjs';
import { CameraService } from './camera';
import { KeyboardService } from './controller/keyboard';

export class App {

  renderer: RendererService;
  camera: CameraService;
  keyboard: KeyboardService;
  // mouse: mouseService;
  // world: worldService;

  static $initiallize = new Subject<App>();

  constructor() {
    this.keyboard = new KeyboardService();
    this.renderer = new RendererService();
    this.camera = new CameraService();

    // инициализация всех сервисов
    App.$initiallize.next(this);
  }

  start() {
    this.renderer.startRender();
  }

}
