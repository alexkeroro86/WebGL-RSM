import * as glm from 'gl-matrix';
import * as Stats from 'stats-js';
import * as Dat from 'dat.gui';

// global variable
var gl = window.WebGL2RenderingContext.prototype; // specify type for code snippet
var stats = null;
var gui = null;

var global = {
    program: null,
    vao: null,
    start: null,
};
var matrix = {
    m: null,
    v: null,
    p: null,
};
var uniform = {
    mvp: null,
    tex: null,
};
var asset = {
    tex: [],
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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL);
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

    // matrix
    matrix.m = glm.mat4.create();
    matrix.v = glm.mat4.create();
    matrix.p = glm.mat4.create();
    glm.mat4.lookAt(matrix.v, glm.vec3.fromValues(0, 0, 5), glm.vec3.fromValues(0, 0, 0), glm.vec3.fromValues(0, 1, 0));
    glm.mat4.perspective(matrix.p, Math.PI * 0.5, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100.0);
}

function createShader() {
    // get shader string
    let vsSrc = document.getElementById('vertex').innerText.trim();
    let fsSrc = document.getElementById('fragment').innerText.trim();

    // create vertex shader
    let vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSrc);
    gl.compileShader(vs);

    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(vs));
    }

    // create fragment shader
    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSrc);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fs));
    }

    // create shader program
    global.program = gl.createProgram();
    gl.attachShader(global.program, vs);
    gl.attachShader(global.program, fs);
    gl.linkProgram(global.program);

    if (!gl.getProgramParameter(global.program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(global.program));
    }

    // uniform location
    uniform.mvp = gl.getUniformLocation(global.program, 'uMVP');
    uniform.tex = gl.getUniformLocation(global.program, 'uTex');

    gl.useProgram(global.program);
    gl.uniform1i(uniform.tex, 0);
}

function initBuffer() {
    // vertex data
    const positions = new Float32Array([
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,

        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
    ]);
    const texcoords = new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,

        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,

        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,

        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,

        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,

        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0
    ]);
    const indices = new Uint16Array([
        0,  1,  2,      0,  2,  3,
        4,  5,  6,      4,  6,  7,
        8,  9,  10,     8,  10, 11,
        12, 13, 14,     12, 14, 15,
        16, 17, 18,     16, 18, 19,
        20, 21, 22,     20, 22, 23
    ]);

    // vao
    global.vao = gl.createVertexArray();
    gl.bindVertexArray(global.vao);

    // vbo
    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, positions.byteLength + texcoords.byteLength, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
    gl.bufferSubData(gl.ARRAY_BUFFER, positions.byteLength, texcoords)

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, positions.byteLength);
    gl.enableVertexAttribArray(1);

    // ebo
    let ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.onerror = () => {
            reject(new Error(`Failed to load image's url: ${url}`));
        }
        img.src = url;
        img.crossOrigin = 'anonymous';
    });
}

async function loadAsset() {
    let promises = [];
    promises.push(loadImage('./asset/container.jpg'));
    promises.push(loadImage('./asset/container2.png'));
    let results = await Promise.all(promises);
    
    // texture
    for (let i of [0, 1]) {
        asset.tex[i] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, asset.tex[i]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, results[i]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    results.length = 0;
}

function render(delta) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(global.program);

    // set uniform
    glm.mat4.rotateX(matrix.m, matrix.m, delta * 0.01 * Math.PI / 180.0);
    glm.mat4.rotateY(matrix.m, matrix.m, delta * 0.02 * Math.PI / 180.0);
    let mvp = glm.mat4.create();
    glm.mat4.multiply(mvp, matrix.p, matrix.v);
    glm.mat4.multiply(mvp, mvp, matrix.m);
    gl.uniformMatrix4fv(uniform.mvp, false, mvp);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, asset.tex[flag.id]);

    // drawing command
    gl.bindVertexArray(global.vao);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

function animate(time) {
    if (!global.start) {
        global.start = time;
    }
    // in milliseconds
    let delta = time - global.start;
    global.start = time;

    stats.update();

    render(delta);

    window.requestAnimationFrame(animate);
}

window.onresize = () => {
    let canvas = document.querySelector('canvas');

    if (gl && canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        glm.mat4.perspective(matrix.p, Math.PI * 0.5, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100.0);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
}

window.onload = () => {
    initWebGL();
    createShader();
    initBuffer();
    loadAsset().then(() => {
        // rendering loop
        window.requestAnimationFrame(animate);
    });
}

