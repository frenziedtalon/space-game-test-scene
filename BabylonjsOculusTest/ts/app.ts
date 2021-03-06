﻿"use strict";
var runDemo = () => {
    var fps = $("#fpsLabel");

    var canvas = getCanvas();
    var engine = loadBabylonEngine(canvas);
    var scene = createScene(engine);
    attachEvents();

    beginRenderLoop();
    createCameras();
    createSceneObjects();
    createSkySphere();

    var vr = false;

    function getCanvas(): HTMLCanvasElement {
        return <HTMLCanvasElement>document.getElementById("renderCanvas");
    }

    function loadBabylonEngine(canvas: HTMLCanvasElement): BABYLON.Engine {
        return new BABYLON.Engine(canvas, true);
    }

    function createScene(engine: BABYLON.Engine): BABYLON.Scene {
        var s = new BABYLON.Scene(engine);
        s.ambientColor = new BABYLON.Color3(1, 1, 1);
        s.clearColor = new BABYLON.Color3(0, 0, 0);
        return s;
    }

    function createSceneObjects() {
        //createEarth();
        //createLight();
        createSun();
        createSaturn();
    }

    function createLight(): void {
        var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 0, 10), scene);
        light.intensity = 0.5;
    }

    function createEarth(): void {
        const earth = BABYLON.Mesh.CreateSphere("earth", 50, 5, scene, true);
        const material = new BABYLON.StandardMaterial("earthMaterial", scene);
        material.diffuseTexture = createTexture("sphereDiffuseTexure", "Assets/earth_day.jpg");
        material.emissiveTexture = createTexture("sphereEmissiveTexure", "Assets/NightLights.jpg");
        material.bumpTexture = createTexture("sphereBumpTexure", "Assets/earthnormal2.png");
        material.specularTexture = createTexture("sphereSpecularTexure", "Assets/earth_specular.jpg");
        material.specularPower = 10000;
        earth.material = material;

        const clouds = BABYLON.Mesh.CreateSphere("earthClouds", 50, 5.1, scene);
        const cloudMaterial = new BABYLON.StandardMaterial("earthCloudMaterial", scene);
        cloudMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        cloudMaterial.backFaceCulling = false;
        cloudMaterial.opacityTexture = createTexture("earthCloudTransparencyTexture", "Assets/fair_clouds.jpg");
        cloudMaterial.opacityTexture.getAlphaFromRGB = true;
        clouds.material = cloudMaterial;

        clouds.position = earth.position;

        BABYLON.Animation.CreateAndStartAnimation("earthRotation",
            earth,
            "rotation.y",
            30,
            4000,
            0,
            10,
            BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);

        BABYLON.Animation.CreateAndStartAnimation("cloudsRotation",
            clouds,
            "rotation.y",
            30,
            4500,
            0,
            10,
            BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);
    }

    function createTexture(name: string, texture: string): BABYLON.Texture {
        const t = new BABYLON.Texture(texture, scene);
        t.uAng = Math.PI; // Invert on vertical axis 
        t.vAng = Math.PI; // Invert on horizontal axis 
        return t;
    }

    function createSun(): void {
        const sun = BABYLON.Mesh.CreateSphere("sun", 50, 5, scene, true);

        const material = new BABYLON.StandardMaterial(name, scene);
        material.emissiveTexture = createTexture("sphereDiffuseTexure", "Assets/sun.jpg");

        sun.material = material;
        sun.position = new BABYLON.Vector3(0, 0, 20);

        // create god rays effect
        var vls = new BABYLON.VolumetricLightScatteringPostProcess("sunVls", 1.0, scene.activeCamera, sun, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, engine, false);
        vls.exposure = 0.12;

        // create a light to represent the star shining on other objects
        var starLight = new BABYLON.PointLight("sunLight", sun.position, scene);

        BABYLON.Animation.CreateAndStartAnimation("sunRotation",
            sun,
            "rotation.y",
            30,
            7000,
            0,
            10,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    }

    function createSaturn(): void {
        const saturn = BABYLON.Mesh.CreateSphere("saturn", 50, 5, scene, true);

        //saturn.position = new BABYLON.Vector3(20, 0, 20);

        const material = new BABYLON.StandardMaterial("saturnMaterial", scene);
        material.diffuseTexture = createTexture("saturnDiffuseTexure", "Assets/saturn-cassini2.jpg");

        material.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        saturn.material = material;

        const ribbon = generateRibbonRings();

        ribbon.parent = saturn;

        saturn.rotation.x = Math.PI / 4;
        saturn.rotation.y = Math.PI / 4;
        saturn.rotation.z = Math.PI / 4;

        BABYLON.Animation.CreateAndStartAnimation("saturnRotation",
            saturn,
            "rotation.y",
            30,
            4000,
            0,
            10,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    }

    function createSkySphere(): void {
        const skysphere = BABYLON.Mesh.CreateSphere("skysphere-" + name, 10, 20000, scene);

        const skysphereMaterial = new BABYLON.StandardMaterial("skysphere-" + name + "-material", scene);
        skysphereMaterial.backFaceCulling = false; // render the inside of the skybox
        skysphereMaterial.specularColor = BABYLON.Color3.Black();
        skysphereMaterial.diffuseColor = BABYLON.Color3.Black();
        skysphereMaterial.emissiveTexture = new BABYLON.Texture("Assets/skysphere-8192x4096.png", scene);

        skysphere.material = skysphereMaterial;
        skysphere.isPickable = false;
    }

    function attachEvents() {
        window.addEventListener("keypress", (evt: KeyboardEvent) => {
            if (evt.keyCode === 32) {
                // spacebar
                toggleDebugLayer();
            }
        });

        // watch for browser/canvas resize events
        window.addEventListener("resize", (ev: UIEvent) => {
            engine.resize();
        });

        $("#toggleVr")
            .click(() => {
                vr = !vr;
                setCamera(vr);
            });

        $("#fullscreen")
            .click(() => {
                engine.switchFullscreen(false);
            });
    }

    function setCamera(virtual: boolean): void {
        scene.activeCamera && scene.activeCamera.detachControl(canvas);
        const cameraId = virtual ? "VrCamera" : "ArcRotate";
        scene.setActiveCameraByID(cameraId);
        scene.activeCamera.attachControl(canvas);
    }

    function createCameras() {
        createArcRotateCamera();
        createVrWithDistortionCamera();
    }

    function createArcRotateCamera() {
        const camera = new BABYLON.ArcRotateCamera("ArcRotate", 3.410466872478024, 0.8267117010449241, 6, BABYLON.Vector3.Zero(), scene);
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 50;
        camera.attachControl(canvas, true);
        camera.inputs.add(new BABYLON.ArcRotateCameraGamepadInput());
    }

    function createVrWithDistortionCamera() {
        const camera = new BABYLON.WebVRFreeCamera("VrCamera",
            new BABYLON.Vector3(4, 0, 0),
            scene,
            false,
            {
                trackPosition: false,
                displayName: "Oculus VR HMD",
                positionScale: 10
            });
        camera.inputs.add(new BABYLON.FreeCameraGamepadInput());
    }

    function toggleDebugLayer() {
        if (scene.debugLayer.isVisible()) {
            scene.debugLayer.hide();
        } else {
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
            fps.text(engine.getFps().toFixed() + " fps");
        });
    }

    function generateCircularPath(radius: number): Array<BABYLON.Vector3> {
        const result: Array<BABYLON.Vector3> = [];
        const step = Math.PI / 128;

        for (let angle = 0; angle < 2 * Math.PI; angle += step) {
            result.push(calculationParametricCoordinatesCircle(angle, radius));
        }

        return result;
    }

    function calculationParametricCoordinatesCircle(angle: number, radius: number): BABYLON.Vector3 {
        const z = radius * Math.cos(angle);
        const x = radius * Math.sin(angle);
        const y = 0;

        return new BABYLON.Vector3(x, y, z);
    }

    function generateRibbonRings(): BABYLON.Mesh {

        const innerPath = generateCircularPath(7);
        const outerPath = generateCircularPath(20);

        const paths = [];
        paths.push(innerPath);
        paths.push(outerPath);

        const options = {
            pathArray: paths,
            closeArray: false,
            closePath: true,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            invertUV: true
        }

        const ribbon = BABYLON.MeshBuilder.CreateRibbon("ribbon", options, scene);

        const diffuseTexture = new BABYLON.Texture("Assets/saturn-rings-backscattered.png", scene);

        const opacityTexture = new BABYLON.Texture("Assets/saturn-rings-backscattered.png", scene);

        const material = new BABYLON.StandardMaterial(name, scene);
        material.opacityTexture = opacityTexture;
        material.opacityTexture.getAlphaFromRGB = true;
        material.diffuseTexture = diffuseTexture;
        material.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        ribbon.material = material;

        return ribbon;
    }
}