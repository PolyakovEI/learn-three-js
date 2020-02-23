import { AppService } from "../app-service";
import { App } from "../app";
import { Scene, Fog } from "three";

export class WorldService extends AppService {

    /** ThreeJS сцена. Контейнер для отрисовки объектов */
    scene: Scene;

    onInit(instance: App) {
        this.scene = new Scene();
        // добавляем на сцену эффект тумана с цветом, как и цвет фона
        this.scene.fog = new Fog(0xf7d9aa, 100, 950);
    }

}