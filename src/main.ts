import './style.css';
import { Mesh, MeshStandardMaterial, PointLight, SphereGeometry, Vector2, Vector3 } from 'three';
import { throttleTime } from 'rxjs/operators';

import { App } from "./app";
import { dt } from './physics/options';
import { AppMouseEvent } from './controller/mouse';
import { isPointOnLine } from './physics/collider/collide-resolver';

export const app = new App();

// для дебага
(window as any).app = app;

const sphereRadius = 3;
const sphere = new Mesh(new SphereGeometry(sphereRadius, 30, 30), new MeshStandardMaterial({ color: 0xffffff }));
app.world.scene.add(sphere);

const pointRadius = 1;
const p1 = new Mesh(new SphereGeometry(pointRadius, 30, 30), new MeshStandardMaterial({ color: 0xffffff }));
const p2 = new Mesh(new SphereGeometry(pointRadius, 30, 30), new MeshStandardMaterial({ color: 0xffffff }));
p1.position.set(10, 10, 0);
p2.position.set(-10, 10, 0);
app.world.scene.add(p1);
app.world.scene.add(p2);

const pointerRadius = 1;
const pointerSphere = new Mesh(new SphereGeometry(pointerRadius, 30, 30), new MeshStandardMaterial({ color: 0xff0000 }));
app.world.scene.add(pointerSphere);

app.mouse.move.subscribe(event => {
  pointerSphere.position.copy(event.world.position);
  console.log(isPointOnLine(pointerSphere.position, p1.position, p2.position));
});

const light = new PointLight(0xffffff, 1, 500);
light.position.set(0, 0, 100);
app.world.scene.add(light);


// const mainCamera = app.physics.addToQueue(() => {
//   const cameraSpeed = 50 * dt;
//   const direction = new Vector2(0, 0);
//   const reactions: any = {
//     'd': () => direction.x += 1,
//     'a': () => direction.x -= 1,
//     'w': () => direction.y += 1,
//     's': () => direction.y -= 1,
//   };
//   Object.keys(reactions).forEach(key => app.keyboard.isPressed(key) && reactions[key]())
//   direction.normalize();
//   direction.multiplyScalar(cameraSpeed);
//   app.camera.main.position.add(new Vector3(direction.x, direction.y, 0));
// });

// combineLatest([
//   app.keyboard.keys.d.pressed,
//   app.keyboard.keys.a.pressed,
//   app.keyboard.keys.w.pressed,
//   app.keyboard.keys.s.pressed,
// ]).subscribe(events => {
//   const cameraSpeed = 50 * dt;
//   const direction = new Vector2(0, 0);
//   events.forEach(event => {
//     ({
//       'd': () => direction.x += 1,
//       'a': () => direction.x -= 1,
//       'w': () => direction.y += 1,
//       's': () => direction.y -= 1,
//     } as any)[event.key]();
//   });
//   direction.normalize();
//   direction.multiplyScalar(cameraSpeed);
//   app.camera.main.position.add(new Vector3(direction.x, direction.y, 0));
// });

app.keyboard.keys.anyOff('a', 's', 'd', 'w').pressed.subscribe(events => {
  const cameraSpeed = 50 * dt;
  const direction = new Vector2(0, 0);
  const reactions = {
    'd': () => direction.x += 1,
    'a': () => direction.x -= 1,
    'w': () => direction.y += 1,
    's': () => direction.y -= 1,
  } as any;
  console.log(events);
  Object.keys(events).forEach(key => reactions[key]());
  direction.normalize();
  direction.multiplyScalar(cameraSpeed);
  app.camera.main.position.add(new Vector3(direction.x, direction.y, 0));
});

app.mouse.scroll.down.subscribe(_ => {
  if (app.camera.scale < 2) {
    app.camera.scale += 0.1;
  }
});
app.mouse.scroll.up.subscribe(_ => {
  if (app.camera.scale > 0.5) {
    app.camera.scale -= 0.1;
  }
});

app.keyboard.keys.a.up.subscribe(event => console.log('up', event));
app.keyboard.keys.a.down.subscribe(event => console.log('down', event));
app.keyboard.keys.a.pressed.pipe(throttleTime(500)).subscribe(event => console.log('pressed', event));

app.keyboard.keys.combination('z', 'x').down.subscribe(event => console.log('down', event));
app.keyboard.keys.combination('z', 'x').pressed.pipe(throttleTime(500)).subscribe(event => console.log('pressed', event));

app.keyboard.keys.anyOff('q', 'w').up.subscribe(event => console.log('up', event));
app.keyboard.keys.anyOff('q', 'w').down.subscribe(event => console.log('down', event));
app.keyboard.keys.anyOff('q', 'w').pressed.pipe(throttleTime(500)).subscribe(event => console.log('pressed', event));

app.mouse.key.left.down.subscribe(event => console.log('down'));
app.mouse.key.left.pressed.subscribe(event => console.log('pressed'));

const follow = (event: AppMouseEvent) => {
  // sphere.position.set(event.world.position.x, event.world.position.y, 0);
  const dx = event.world.position.x - sphere.position.x;
  const dy = event.world.position.y - sphere.position.y;
  const d = new Vector3(dx, dy, 0);
  d.normalize();
  d.multiplyScalar(0.3);
  sphere.position.add(d);

  // sphere.lookAt(new Vector3(event.world.position.x, event.world.position.y, 0));
}

let isFollow: any = null;
app.keyboard.keys.f.down.subscribe(_ => {
  if (isFollow) {
    isFollow.unsubscribe();
    isFollow = null;
  } else {
    isFollow = app.mouse.move.pipe(
      app.physics.syncLatest()
    ).subscribe(follow);
  }
  
})

app.physics.toggleToQueueOn(app.keyboard.keys.f.down, () => {
  console.log('Hello');
}).subscribe();

app.start();
