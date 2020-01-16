import * as glm from 'gl-matrix';
import Model from './Model';
import { createShader, loadImage } from './util';
import Camera from './Camera';
import Gbuffer from './Gbuffer';

export default class Pipeline {

    constructor() {
        this.dragon = new Model();
        this.sponza = new Model();
        // this.blinnPhong = {
        //     program: null,
        //     uniform: {
        //         mvp: null,
        //         m: null,
        //         mapKd: null,
        //         eye: null,
        //     },
        // };
        this.matrix = {
            m: null,
            v: null,
            p: null,
        };
        this.camera = new Camera();
        this.gbuffer = {
            camera: new Gbuffer(),
            program: null,
            uniform: {
                mvp: null,
                m: null,
            },
        };
        this.deferred = {
            program: null,
            uniform: {
                mapPosW: null,
                mapColor: null,
                mapNormal: null,
                depthCamera: null,
                eye: null,
            },
        };
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

        // // shader
        // this.blinnPhong.program = createShader(gl, document.getElementById('blinn-phong-vs').innerText, document.getElementById('blinn-phong-fs').innerText);

        // // uniform location
        // this.blinnPhong.uniform.mvp = gl.getUniformLocation(this.blinnPhong.program, 'uMVP');
        // this.blinnPhong.uniform.m = gl.getUniformLocation(this.blinnPhong.program, 'uM');
        // this.blinnPhong.uniform.mapKd = gl.getUniformLocation(this.blinnPhong.program, 'uMapKd');
        // this.blinnPhong.uniform.eye = gl.getUniformLocation(this.blinnPhong.program, 'uEye');

        // // set uniform
        // gl.useProgram(this.blinnPhong.program);
        // gl.uniform1i(this.blinnPhong.uniform.mapKd, 0);

        // gl.useProgram(null);

        // shader
        this.gbuffer.program = createShader(gl, document.getElementById('gbuffer-vs').innerText, document.getElementById('gbuffer-fs').innerText);

        // uniform location
        this.gbuffer.uniform.mvp = gl.getUniformLocation(this.gbuffer.program, 'uMVP');
        this.gbuffer.uniform.m = gl.getUniformLocation(this.gbuffer.program, 'uM');
        this.gbuffer.uniform.mapKd = gl.getUniformLocation(this.gbuffer.program, 'uMapKd');

        // set uniform
        gl.useProgram(this.gbuffer.program);
        gl.uniform1i(this.gbuffer.uniform.mapKd, 0);

        gl.useProgram(null);

        // shader
        this.deferred.program = createShader(gl, document.getElementById('deferred-vs').innerText, document.getElementById('deferred-fs').innerText);

        // uniform location
        this.deferred.uniform.mapPosW = gl.getUniformLocation(this.deferred.program, 'uMapPosW');
        this.deferred.uniform.mapColor = gl.getUniformLocation(this.deferred.program, 'uMapColor');
        this.deferred.uniform.mapNormal = gl.getUniformLocation(this.deferred.program, 'uMapNormal');
        this.deferred.uniform.depthCamera = gl.getUniformLocation(this.deferred.program, 'uDepthCamera');
        this.deferred.uniform.eye = gl.getUniformLocation(this.deferred.program, 'uEye');

        // set uniform
        gl.useProgram(this.deferred.program);
        gl.uniform1i(this.deferred.uniform.mapPosW, 0);
        gl.uniform1i(this.deferred.uniform.mapColor, 1);
        gl.uniform1i(this.deferred.uniform.mapNormal, 2);
        gl.uniform1i(this.deferred.uniform.depthCamera, 3);

        gl.useProgram(null);

        // gbuffer
        this.gbuffer.camera.init(gl);
    }

    render(gl, delta, flag) {
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // gl.useProgram(this.blinnPhong.program);

        // // set uniform
        // let mvp = glm.mat4.create();
        // this.matrix.v = this.camera.getV();
        // glm.mat4.multiply(mvp, this.matrix.p, this.matrix.v);
        // glm.mat4.multiply(mvp, mvp, this.matrix.m);

        // gl.uniformMatrix4fv(this.blinnPhong.uniform.mvp, false, mvp);
        // gl.uniformMatrix4fv(this.blinnPhong.uniform.m, false, this.matrix.m);
        // gl.uniform3fv(this.blinnPhong.uniform.eye, this.camera.move.position);

        // // drawing command
        // this.sponza.render(gl);

        // // set uniform
        // let dragonM = glm.mat4.create();
        // glm.mat4.scale(dragonM, dragonM, [15, 15, 15]);
        // glm.mat4.rotateY(dragonM, dragonM, Math.PI * 0.5);
        // mvp = glm.mat4.create();
        // glm.mat4.multiply(mvp, this.matrix.p, this.matrix.v);
        // glm.mat4.multiply(mvp, mvp, dragonM);

        // gl.uniformMatrix4fv(this.blinnPhong.uniform.mvp, false, mvp);
        // gl.uniformMatrix4fv(this.blinnPhong.uniform.m, false, dragonM);

        // // drawing command
        // this.dragon.render(gl);
        // this.sponza.render(gl);

        // [gbuffer pass]
        this.gbuffer.camera.bind(gl);

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.gbuffer.program);

        // set uniform
        let mvp = glm.mat4.create();
        this.matrix.v = this.camera.getV();
        glm.mat4.multiply(mvp, this.matrix.p, this.matrix.v);
        glm.mat4.multiply(mvp, mvp, this.matrix.m);

        gl.uniformMatrix4fv(this.gbuffer.uniform.mvp, false, mvp);
        gl.uniformMatrix4fv(this.gbuffer.uniform.m, false, this.matrix.m);

        // drawing command
        this.sponza.render(gl);

        // set uniform
        let dragonM = glm.mat4.create();
        glm.mat4.scale(dragonM, dragonM, [15, 15, 15]);
        glm.mat4.rotateY(dragonM, dragonM, Math.PI * 0.5);
        mvp = glm.mat4.create();
        glm.mat4.multiply(mvp, this.matrix.p, this.matrix.v);
        glm.mat4.multiply(mvp, mvp, dragonM);

        gl.uniformMatrix4fv(this.gbuffer.uniform.mvp, false, mvp);
        gl.uniformMatrix4fv(this.gbuffer.uniform.m, false, dragonM);

        // drawing command
        this.dragon.render(gl);

        this.gbuffer.camera.unbind(gl);

        // [deferred pass]
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.deferred.program);

        // set uniform
        gl.uniform3fv(this.deferred.uniform.eye, this.camera.move.position);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.gbuffer.camera.renderTarget.position);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.gbuffer.camera.renderTarget.color);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.gbuffer.camera.renderTarget.normal);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.gbuffer.camera.renderTarget.depth);

        Gbuffer.render(gl);
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