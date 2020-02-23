import { Subject } from 'rxjs';

import { RendererService } from './renderer/renderer';
import { CameraService } from './camera/camera';
import { KeyboardService } from './controller/keyboard';
import { MouseService } from './controller/mouse';
import { PhysicsService } from './physics/physics';
import { WorldService } from './world/world';

export class App {

  renderer: RendererService;
  physics: PhysicsService;
  camera: CameraService;
  keyboard: KeyboardService;
  mouse: MouseService;
  world: WorldService;

  static $initiallize = new Subject<App>();

  constructor() {
    this.keyboard = new KeyboardService();
    this.physics = new PhysicsService();
    this.renderer = new RendererService();
    this.camera = new CameraService();
    this.mouse = new MouseService();
    this.world = new WorldService();

    // инициализация всех сервисов
    App.$initiallize.next(this);
  }

  start() {
    this.renderer.start();
    this.physics.start();
  }

  stop() {
    this.renderer.stop();
    this.physics.stop();
  }

}
