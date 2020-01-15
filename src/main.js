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
    id: 0,
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
    let texFolder = gui.addFolder('Texture');
    texFolder.add(flag, 'id', {container: 0, container2: 1});
    texFolder.open();
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

