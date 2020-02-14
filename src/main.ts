import './style.css';
import { App } from "./app";
import { Box3, Mesh, BoxGeometry, MeshStandardMaterial, MeshBasicMaterial } from 'three';

export const app = new App();

const box = new Mesh(new BoxGeometry(10, 10, 10), new MeshBasicMaterial({ color: 0xff0000 }));
box.position.y = 100;
app.renderer.scene.add(box);

app.keyboard.keys.combination('a', 'b').up.subscribe(event => {
  console.log(event);
});

app.start();
