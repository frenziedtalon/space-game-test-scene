"use strict";
var runDemo = () => {
    var canvas = getCanvas();
    var engine = loadBabylonEngine(canvas);
    var scene = createScene(engine);
    beginRenderLoop();
    createSceneObjects();
    attachEvents();
    createInitialCamera();
    function getCanvas() {
        return document.getElementById("renderCanvas");
    }
    function loadBabylonEngine(canvas) {
        return new BABYLON.Engine(canvas, true);
    }
    function createScene(engine) {
        var s = new BABYLON.Scene(engine);
        s.ambientColor = new BABYLON.Color3(1, 1, 1);
        return s;
    }
    function createSceneObjects() {
        const sphere = BABYLON.Mesh.CreateSphere("sphere", 16, 5, scene);
        const material = createDiffuseMaterial("sphereMaterial", "Assets/earth_day.jpg");
        material.specularColor = new BABYLON.Color3(0, 0, 0);
        sphere.material = material;
        var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
    }
    function createDiffuseMaterial(name, texture) {
        const t = new BABYLON.Texture(texture, scene);
        t.uAng = Math.PI; // Invert on vertical axis
        t.vAng = Math.PI; // Invert on horizontal axis
        const m = new BABYLON.StandardMaterial(name, scene);
        m.diffuseTexture = t;
        m.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        return m;
    }
    function attachEvents() {
        window.addEventListener("keypress", (evt) => {
            if (evt.keyCode === 32) {
                // spacebar
                toggleDebugLayer();
            }
        });
    }
    function createInitialCamera() {
        var camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 8, 50, BABYLON.Vector3.Zero(), scene);
        camera.lowerRadiusLimit = 6;
        camera.attachControl(canvas, true);
    }
    function toggleDebugLayer() {
        if (scene.debugLayer.isVisible()) {
            scene.debugLayer.hide();
        }
        else {
            scene.debugLayer.show();
        }
    }
    function beginRenderLoop() {
        scene.beforeRender = () => {
            // nothing for now
        };
        // register a render loop to repeatedly render the scene
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
};
/// <reference path="ts/d.ts/jquery.d.ts" />
/// <reference path="ts/d.ts/babylon.2.5-preview.d.ts" />
/// <reference path="ts/app.ts"/> 
//# sourceMappingURL=app.js.map