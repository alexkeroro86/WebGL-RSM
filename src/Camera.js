import * as glm from 'gl-matrix';

export default class Camera {
    constructor() {
        this.move = {
            position: glm.vec3.fromValues(10, 5, 0),
            speed: 25.0,
            left: false,
            right: false,
            forward: false,
            backword: false,
        };
        this.rotate = {
            yaw: 0.0,
            pitch: 90.0,
        };
        this.direction = {
            front: glm.vec3.fromValues(1, 0, 0),
            up: glm.vec3.fromValues(0, 1, 0),
            right: glm.vec3.fromValues(0, 0, 1),
        };
        this.matrix = glm.mat4.create();
    }

    getV() {
        let target = glm.vec3.create();
        glm.vec3.add(target, this.move.position, this.direction.front);
        return glm.mat4.lookAt(this.matrix, this.move.position, target, this.direction.up);
    }

    keydown(evt) {
        if (evt.keyCode == 87) {
            this.move.forward = true;
        }
        if (evt.keyCode == 83) {
            this.move.backword = true;
        }
        if (evt.keyCode == 65) {
            this.move.left = true;
        }
        if (evt.keyCode == 68) {
            this.move.right = true;
        }
    }
    keyup(evt) {
        if (evt.keyCode == 87) {
            this.move.forward = false;
        }
        if (evt.keyCode == 83) {
            this.move.backword = false;
        }
        if (evt.keyCode == 65) {
            this.move.left = false;
        }
        if (evt.keyCode == 68) {
            this.move.right = false;
        }
    }

    update(delta) {
        delta /= 1000.0;

        let offset = glm.vec3.create();
        if (this.move.forward) {
            glm.vec3.mul(offset, this.direction.front, [this.move.speed * delta, this.move.speed * delta, this.move.speed * delta]);
            glm.vec3.add(this.move.position, this.move.position, offset);
        }
        if (this.move.backword) {
            glm.vec3.mul(offset, this.direction.front, [this.move.speed * delta, this.move.speed * delta, this.move.speed * delta]);
            glm.vec3.sub(this.move.position, this.move.position, offset);
        }
        if (this.move.right) {
            glm.vec3.mul(offset, this.direction.right, [this.move.speed * delta, this.move.speed * delta, this.move.speed * delta]);
            glm.vec3.add(this.move.position, this.move.position, offset);
        }
        if (this.move.left) {
            glm.vec3.mul(offset, this.direction.right, [this.move.speed * delta, this.move.speed * delta, this.move.speed * delta]);
            glm.vec3.sub(this.move.position, this.move.position, offset);
        }
    }
}