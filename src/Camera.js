import * as glm from 'gl-matrix';

var DEG2RAD = Math.PI / 180.0;

export default class Camera {
    constructor() {
        this.move = {
            position: glm.vec3.fromValues(10, 5, 0),
            speed: 40.0,
            left: false,
            right: false,
            forward: false,
            backword: false,
        };
        this.rotate = {
            yaw: 90.0,
            pitch: 0.0,
        };
        this.direction = {
            front: glm.vec3.fromValues(1, 0, 0),
            up: glm.vec3.fromValues(0, 1, 0),
            right: glm.vec3.fromValues(0, 0, 1),
        };
        this.mouse = {
            pressed: false,
            speed: 1.0,
            x: null,
            y: null,
        };
        this.matrix = glm.mat4.create();

        // event listener
        document.addEventListener('keydown', this.keydown.bind(this));
        document.addEventListener('keyup', this.keyup.bind(this));
        document.addEventListener('mousedown', this.mousedown.bind(this));
        document.addEventListener('mousemove', this.mousemove.bind(this));
        document.addEventListener('mouseup', this.mouseup.bind(this));
    }

    getV() {
        // update direction
        glm.vec3.set(this.direction.front,
            Math.cos(this.rotate.yaw * DEG2RAD) * Math.cos(this.rotate.pitch * DEG2RAD),
            Math.sin(this.rotate.pitch * DEG2RAD),
            Math.sin(this.rotate.yaw * DEG2RAD) * Math.cos(this.rotate.pitch * DEG2RAD));
        glm.vec3.normalize(this.direction.front, this.direction.front);

        glm.vec3.cross(this.direction.right, this.direction.front, [0, 1, 0]);
        glm.vec3.normalize(this.direction.right, this.direction.right);

        glm.vec3.cross(this.direction.up, this.direction.right, this.direction.front);
        glm.vec3.normalize(this.direction.up, this.direction.up);

        // update matrix
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

    mousedown(evt) {
        this.mouse.pressed = true;
        this.mouse.x = evt.clientX;
        this.mouse.y = evt.clientY;
    }
    mousemove(evt) {
        if (!this.mouse.pressed) {
            return;
        }

        let diffX = evt.clientX - this.mouse.x;
        let diffY = evt.clientY - this.mouse.y;

        diffX *= this.mouse.speed;
        diffY *= -this.mouse.speed;

        this.rotate.yaw += diffX;
        this.rotate.pitch += diffY;

        if (this.rotate.pitch > 89.0) {
            this.rotate.pitch = 89.0;
        }
        if (this.rotate.pitch < -89.0) {
            this.rotate.pitch = -89.0;
        }

        this.mouse.x = evt.clientX;
        this.mouse.y = evt.clientY;
    }
    mouseup(evt) {
        this.mouse.pressed = false;
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