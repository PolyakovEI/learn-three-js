import './style.css';
import { App } from "./app";
import { Mesh, BoxGeometry, MeshStandardMaterial, MeshBasicMaterial, Vector3, Light, PointLight } from 'three';
import { throttleTime } from 'rxjs/operators';

export const app = new App();

// для дебага
(window as any).app = app;

app.camera.main.position.x = 50;
app.camera.main.position.y = 25;

const boxSize = 50;
const box = new Mesh(new BoxGeometry(boxSize, boxSize, boxSize), new MeshStandardMaterial({ color: 0xffffff }));
app.renderer.scene.add(box);

const light = new PointLight(0xffffff, 1, 500);
light.position.set(0, 0, 100);
app.renderer.scene.add(light);

app.keyboard.keys.combination('a', 'b').up.subscribe({
  next: event => {
    console.log(event);
  },
});

app.mouse.scroll.down.subscribe(event => {
  if (app.camera.scale < 2) {
    app.camera.scale += 0.1;
  }
});

app.mouse.scroll.up.subscribe(event => {
  if (app.camera.scale > 0.5) {
    app.camera.scale -= 0.1;
  }
});

app.mouse.key.left.down.subscribe(event => console.log('left', event));

app.mouse.key.right.down.subscribe(event => console.log('right', event));

app.mouse.key.wheel.down.subscribe(event => console.log('wheel', event));

app.mouse.key.left.pressed.pipe(throttleTime(1000)).subscribe(event => console.log('pressed', event));

app.mouse.move.pipe(throttleTime(1000)).subscribe(event => console.log('move', event));

app.mouse.move.subscribe(event => {
  const dx = app.mouse.world.x - box.position.x;
  const dy = app.mouse.world.y - box.position.y;
  const d = new Vector3(dx, dy, 0);
  d.normalize();
  d.multiplyScalar(0.1);
  box.position.add(d);
  box.lookAt(new Vector3(app.mouse.world.x, app.mouse.world.y, 0));
});

app.start();
