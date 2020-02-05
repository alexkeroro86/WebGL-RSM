import * as Stats from 'stats-js';
import * as Dat from 'dat.gui';
import Pipeline from './Pipeline';

// global variable
var gl = window.WebGL2RenderingContext.prototype; // specify type for code snippet
var stats = null;
var gui = null;
var pipeline = new Pipeline();

var global = {
    start: null,
};
var flag = {
    useRSM: true,
    useCSM: false,
    useSSR: false,
    visualCSM: false,
    visualRSM: false,
    visualTech: false,
    visualCamMapDepth: false,
    visualPass: 2,
    litPosX: 100.0,
    litPosY: 2000.0,
    litPosZ: 100.0,
};

function initWebGL() {
    let canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.querySelector('body').appendChild(canvas);

    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert('WebGL 2 not available');
    }

    // get extension
    gl.getExtension('EXT_color_buffer_float');
    // gl.getExtension('WEBGL_depth_texture');

    // webgl setting
    gl.clearColor(0.529, 0.808, 0.922, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // fps
    stats = new Stats();
    stats.domElement.classList.add('navbar')
    document.body.appendChild(stats.domElement);

    // gui
    gui = new Dat.GUI();
    gui.domElement.classList.add('navbar');
    let ctrlFolder = gui.addFolder('Control');
    ctrlFolder.add(flag, 'useRSM');
    ctrlFolder.add(flag, 'useCSM');
    ctrlFolder.add(flag, 'useSSR');
    ctrlFolder.add(flag, 'visualCSM');
    ctrlFolder.add(flag, 'visualRSM');
    ctrlFolder.add(flag, 'visualTech');
    ctrlFolder.add(flag, 'visualPass', { Light: 0, Deferred: 1, Post: 2 });
    ctrlFolder.open();
    let litFolder = gui.addFolder('Light');
    litFolder.add(flag, 'litPosX', -2000, 2000);
    litFolder.add(flag, 'litPosY', -2000, 2000);
    litFolder.add(flag, 'litPosZ', -2000, 2000);
    litFolder.open();
}

function animate(time) {
    // time in ms
    if (!global.start) {
        global.start = time;
    }
    let delta = time - global.start;
    global.start = time;

    // fps
    stats.update();

    // camera
    pipeline.camera.update(delta);

    // render pass
    pipeline.render(gl, delta, flag);

    window.requestAnimationFrame(animate);
}

window.onresize = () => {
    pipeline.resize(gl);
}

window.onload = () => {
    initWebGL(); // must be called before using webgl

    pipeline.init(gl);
    
    pipeline.load(gl).then(() => {
        // update loop
        window.requestAnimationFrame(animate);
    });
}

