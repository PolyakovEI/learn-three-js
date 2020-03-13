import { AppService } from "../app-service";
import { App } from "../app";
import { Scene, Fog, BoxBufferGeometry, Mesh, MeshStandardMaterial } from "three";

export class WorldService extends AppService {

    /** ThreeJS сцена. Контейнер для отрисовки объектов */
    scene: Scene;


    private _walls = {};

    onInit(instance: App) {
        this.scene = new Scene();
        // добавляем на сцену эффект тумана с цветом, как и цвет фона
        this.scene.fog = new Fog(0xf7d9aa, 100, 950);


        const width = 300;
        const height = 300;
        const thikness = 1;
        const walls: Mesh[] = [
            new Mesh(new BoxBufferGeometry(width + thikness * 2, thikness, thikness), new MeshStandardMaterial({ color: 0x555555 })),
            new Mesh(new BoxBufferGeometry(width + thikness * 2, thikness, thikness), new MeshStandardMaterial({ color: 0x555555 })),
            new Mesh(new BoxBufferGeometry(height + thikness * 2, thikness, thikness), new MeshStandardMaterial({ color: 0x555555 })),
            new Mesh(new BoxBufferGeometry(height + thikness * 2, thikness, thikness), new MeshStandardMaterial({ color: 0x555555 }))
        ]
        walls[0].position.set(0, thikness / 2 + height / 2, 0);
        walls[1].position.set(0, -(thikness / 2 + height / 2), 0);
        walls[2].position.set(thikness / 2 + width / 2, 0, 0);
        walls[2].rotateZ(Math.PI / 2);
        walls[3].position.set(-(thikness / 2 + width / 2), 0, 0);
        walls[3].rotateZ(Math.PI / 2);
        this._walls = {
            left: walls[0],
            right: walls[1],
            top: walls[2],
            down: walls[3],
        }
        walls.forEach(wall => this.scene.add(wall));
    }

}