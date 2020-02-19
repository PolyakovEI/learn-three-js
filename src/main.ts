import './style.css';
import { App } from "./app";
import { Box3, Mesh, BoxGeometry, MeshStandardMaterial, MeshBasicMaterial } from 'three';
import { throttleTime } from 'rxjs/operators';

export const app = new App();

// для дебага
(window as any).app = app;

const box = new Mesh(new BoxGeometry(10, 10, 10), new MeshBasicMaterial({ color: 0xff0000 }));
box.position.y = 100;
app.renderer.scene.add(box);

app.keyboard.keys.combination('a', 'b').up.subscribe({
  next: event => {
    console.log(event);
  },
});


app.mouse.scroll.down.subscribe(event => console.log('down', event));

app.mouse.scroll.up.subscribe(event => console.log('up', event));

app.mouse.key.left.down.subscribe(event => console.log('left', event));

app.mouse.key.right.down.subscribe(event => console.log('right', event));

app.mouse.key.wheel.down.subscribe(event => console.log('wheel', event));

app.mouse.key.left.pressed.pipe(throttleTime(500)).subscribe(event => console.log('pressed', event));

app.mouse.move.pipe(throttleTime(500)).subscribe(event => console.log('move', event));

app.start();
