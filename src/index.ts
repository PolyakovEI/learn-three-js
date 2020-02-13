import "./style.css";
import * as THREE from "three";
import { WEBGL } from "three/examples/jsm/WebGL.js";
import { LoopOnce } from "three";

var Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xf5986e,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
};

var scene;
var camera;
var fieldOfView;
var aspectRatio;
var nearPlane;
var farPlane;
var HEIGHT;
var WIDTH;
var renderer;
var container;

var hemisphereLight;
var shadowLight;

if (WEBGL.isWebGL2Available() === false) {
  document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
  console.log("TCL: WEBGL.getWebGL2ErrorMessage()", WEBGL.getWebGL2ErrorMessage());
} else {
  window.addEventListener("load", init, false);

  function init() {
    createScene();

    createLights();

    createPlane();
    createSea();
    createSky();

    loop();
  }

  function createScene() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    scene = new THREE.Scene();
    // добавляем на сцену эффект тумана с цветом, как и цвет фона
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

    camera.position.x = 0;
    camera.position.z = 200;
    camera.position.y = 100;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
    });

    renderer = new THREE.WebGLRenderer({ canvas, context });

    renderer.setSize(WIDTH, HEIGHT);

    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    window.addEventListener("resize", handleWindowResize, false);
  }

  function handleWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  }

  function createLights() {
    hemisphereLight = new THREE.HemisphereLight(0xaaaaa, 0x000000, 0.9);

    shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

    shadowLight.position.set(150, 350, 350);

    shadowLight.castShadow = true;

    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    scene.add(hemisphereLight);
    scene.add(shadowLight);
  }
}
