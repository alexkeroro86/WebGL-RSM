import * as glm from 'gl-matrix';
import { createShader, loadImage } from './util';

export default class Pipeline {

    constructor() {
        this.box = {
            vao: null,
            tex: [],
        };
        this.unlit = {
            program: null,
            uniform: {
                mvp: null,
                tex: null,
            },
        };
        this.matrix = {
            m: null,
            v: null,
            p: null,
        };
    }

    async load(gl) {
        let promises = [];
        promises.push(loadImage('./asset/container.jpg'));
        promises.push(loadImage('./asset/container2.png'));
        let results = await Promise.all(promises);
        
        // texture
        for (let i of [0, 1]) {
            this.box.tex[i] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.box.tex[i]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, results[i]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }

        results.length = 0;
    }

    init(gl) {
        // matrix
        this.matrix.m = glm.mat4.create();
        this.matrix.v = glm.mat4.create();
        this.matrix.p = glm.mat4.create();
        glm.mat4.lookAt(this.matrix.v, glm.vec3.fromValues(0, 0, 5), glm.vec3.fromValues(0, 0, 0), glm.vec3.fromValues(0, 1, 0));
        glm.mat4.perspective(this.matrix.p, Math.PI * 0.5, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100.0);

        // shader
        this.unlit.program = createShader(gl, document.getElementById('vertex').innerText, document.getElementById('fragment').innerText);

        // uniform location
        this.unlit.uniform.mvp = gl.getUniformLocation(this.unlit.program, 'uMVP');
        this.unlit.uniform.tex = gl.getUniformLocation(this.unlit.program, 'uTex');

        gl.useProgram(this.unlit.program);
        gl.uniform1i(this.unlit.uniform.tex, 0);

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
        this.box.vao = gl.createVertexArray();
        gl.bindVertexArray(this.box.vao);

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

    render(gl, delta, flag) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.unlit.program);

        // set uniform
        glm.mat4.rotateX(this.matrix.m, this.matrix.m, delta * 0.01 * Math.PI / 180.0);
        glm.mat4.rotateY(this.matrix.m, this.matrix.m, delta * 0.02 * Math.PI / 180.0);
        let mvp = glm.mat4.create();
        glm.mat4.multiply(mvp, this.matrix.p, this.matrix.v);
        glm.mat4.multiply(mvp, mvp, this.matrix.m);
        gl.uniformMatrix4fv(this.unlit.uniform.mvp, false, mvp);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.box.tex[flag.id]);

        // drawing command
        gl.bindVertexArray(this.box.vao);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    }

    resize(gl) {
        let canvas = document.querySelector('canvas');

        if (gl && canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            glm.mat4.perspective(this.matrix.p, Math.PI * 0.5, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100.0);
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }
    }
}