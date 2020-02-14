import './style.css';
import { App } from "./app";
import { Box3, Mesh, BoxGeometry, MeshStandardMaterial } from 'three';

export const app = new App();

const box = new Mesh(new BoxGeometry(10, 10, 10), new MeshStandardMaterial());
box.position.y = 100;

app.start();

app.renderer.scene.add(box);
