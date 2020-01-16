import * as glm from 'gl-matrix';
import Model from './Model';
import { createShader, loadImage } from './util';
import Camera from './Camera';

export default class Pipeline {

    constructor() {
        this.dragon = new Model();
        this.sponza = new Model();
        this.blinnPhong = {
            program: null,
            uniform: {
                mvp: null,
                m: null,
                mapKd: null,
                eye: null,
            },
        };
        this.matrix = {
            m: null,
            v: null,
            p: null,
        };
        this.camera = new Camera();
    }

    async load(gl) {
        await this.dragon.load(gl, './asset/dragon.obj');
        await this.sponza.load(gl, './asset/crytek/sponza.obj');
    }

    init(gl) {
        // matrix
        this.matrix.m = glm.mat4.create();
        this.matrix.v = this.camera.getV();
        this.matrix.p = glm.mat4.create();
        glm.mat4.perspective(this.matrix.p, Math.PI * 0.5, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1800.0);

        // shader
        this.blinnPhong.program = createShader(gl, document.getElementById('blinn-phong-vs').innerText, document.getElementById('blinn-phong-fs').innerText)

        // uniform location
        this.blinnPhong.uniform.mvp = gl.getUniformLocation(this.blinnPhong.program, 'uMVP');
        this.blinnPhong.uniform.m = gl.getUniformLocation(this.blinnPhong.program, 'uM');
        this.blinnPhong.uniform.mapKd = gl.getUniformLocation(this.blinnPhong.program, 'uMapKd');
        this.blinnPhong.uniform.eye = gl.getUniformLocation(this.blinnPhong.program, 'uEye');

        // set uniform
        gl.useProgram(this.blinnPhong.program);
        gl.uniform1i(this.blinnPhong.uniform.mapKd, 0);

        gl.useProgram(null);
    }

    render(gl, delta, flag) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.blinnPhong.program);

        // set uniform
        // glm.mat4.rotateX(this.matrix.m, this.matrix.m, delta * 0.01 * Math.PI / 180.0);
        // glm.mat4.rotateY(this.matrix.m, this.matrix.m, delta * 0.02 * Math.PI / 180.0);
        let mvp = glm.mat4.create();
        this.matrix.v = this.camera.getV();
        glm.mat4.multiply(mvp, this.matrix.p, this.matrix.v);
        glm.mat4.multiply(mvp, mvp, this.matrix.m);

        gl.uniformMatrix4fv(this.blinnPhong.uniform.mvp, false, mvp);
        gl.uniformMatrix4fv(this.blinnPhong.uniform.m, false, this.matrix.m);
        gl.uniform3fv(this.blinnPhong.uniform.eye, this.camera.move.position);

        // drawing command
        this.dragon.render(gl);
        this.sponza.render(gl);
    }

    resize(gl) {
        let canvas = document.querySelector('canvas');

        if (gl && canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            glm.mat4.perspective(this.matrix.p, Math.PI * 0.5, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1800.0);
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }
    }
}