import { loadImage, loadFile } from './util';

const VERTICES_PER_FACE = 3;

export class Material {
    constructor() {
        this.name = null;
        this.mapKd = null;
    }
}

export class Mesh {
    constructor() {
        this.vao = null;
        this.num_vertices = null;
        this.name = null;
        this.material = null;
    }
}

export default class Model {

    constructor() {
        this.meshes = [];
        this.materials = {};
    }

    async load(gl, url) {
        // read file
        let lines = await loadFile(url);

        // parse obj format
        await this.loadObj(gl, url, lines);
    }

    async loadObj(gl, url, lines) {
        // placeholder
        let v = [];
        let vt = [];
        let vn = [];
        let vertex_idx = [];
        let texcoord_idx = [];
        let normal_idx = [];
        let name = null;
        let num_face = 0;
        let material = null;

        // parser
        for (let line of lines) {
            line = line.split(' ');

            if (line[0] == 'o') {
                // ignore first object
                if (num_face == 0) {
                    name = line[1];
                    continue;
                }

                // export to one mesh
                this.export(gl, name, material, v, vt, vn, vertex_idx, normal_idx, texcoord_idx, num_face);

                // flush
                // v = [];
                // vt = [];
                // vn = [];
                vertex_idx = [];
                texcoord_idx = [];
                normal_idx = [];
                name = line[1];
                num_face = 0;
                material = null;
            }
            else if (line[0] == 'v') {
                v.push(parseFloat(line[1]));
                v.push(parseFloat(line[2]));
                v.push(parseFloat(line[3]));
            }
            else if (line[0] == 'vt') {
                vt.push(parseFloat(line[1]));
                // flip vertically
                vt.push(1.0 - parseFloat(line[2]));
            }
            else if (line[0] == 'vn') {
                vn.push(parseFloat(line[1]));
                vn.push(parseFloat(line[2]));
                vn.push(parseFloat(line[3]));
            }
            else if (line[0] == 'f') {
                num_face += 1;
                for (let j = 0; j < VERTICES_PER_FACE; ++j) {
                    let idx = line[j + 1].split('/');
                    // start from zero
                    idx[0] != '' && vertex_idx.push(parseInt(idx[0]) - 1);
                    idx[1] != '' && texcoord_idx.push(parseInt(idx[1]) - 1);
                    idx[2] != '' && normal_idx.push(parseInt(idx[2]) - 1);
                }
            }
            else if (line[0] == 'mtllib') {
                let root = url.substring(0, url.lastIndexOf('/'));
                await this.loadMtl(gl, root + '/' + line[1], root);
            }
            else if (line[0] == 'usemtl') {
                material = line[1];
            }
        }

        // export last object
        this.export(gl, name, material, v, vt, vn, vertex_idx, normal_idx, texcoord_idx, num_face);

        console.log(`Load model ${url}: ${this.meshes.length} mesh(es).`);
        console.log(this.materials);
        // flush
        v = [];
        vt = [];
        vn = [];
        vertex_idx = [];
        texcoord_idx = [];
        normal_idx = [];
        num_face = 0;
        material = null;
    }

    async loadMtl(gl, url, root) {
        let lines = await loadFile(url);
        let material = null;

        for (let line of lines) {
            line = line.split(' ');

            if (line[0] == 'newmtl') {
                // export first material
                if (material != null) {
                    this.materials[material.name] = material;
                }
                material = new Material();
                material.name = line[1];
            }
            else if (line[0] == 'map_Kd') {
                let imgUrl = root + '/' + line[1];
                // TODO: push to promise array
                let img = await loadImage(imgUrl);
                material.mapKd = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, material.mapKd);
                // FIXME: alpha channel
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

                gl.bindTexture(gl.TEXTURE_2D, null);
                console.log(`Load image ${imgUrl}.`)
            }
        }

        // export last material
        this.materials[material.name] = material;

        console.log(`Load material ${url}.`);
    }

    export(gl, name, material, v, vt, vn, vertex_idx, normal_idx, texcoord_idx, num_face) {
        let mesh = new Mesh();
        mesh.num_vertices = num_face * 3;
        mesh.name = name;
        mesh.material = material;

        let p = [];
        let uv = [];
        let n = [];

        // per face
        for (let i = 0; i < mesh.num_vertices; i += 3) {
            // vertex
            let idx1 = vertex_idx[i];
            let idx2 = vertex_idx[i + 1];
            let idx3 = vertex_idx[i + 2];

            p.push(v[idx1 * 3 + 0]); p.push(v[idx1 * 3 + 1]); p.push(v[idx1 * 3 + 2]);
            p.push(v[idx2 * 3 + 0]); p.push(v[idx2 * 3 + 1]); p.push(v[idx2 * 3 + 2]);
            p.push(v[idx3 * 3 + 0]); p.push(v[idx3 * 3 + 1]); p.push(v[idx3 * 3 + 2]);
            
            // texcoord
            idx1 = texcoord_idx[i];
            idx2 = texcoord_idx[i + 1];
            idx3 = texcoord_idx[i + 2];

            uv.push(vt[idx1 * 2 + 0]); uv.push(vt[idx1 * 2 + 1]);
            uv.push(vt[idx2 * 2 + 0]); uv.push(vt[idx2 * 2 + 1]);
            uv.push(vt[idx3 * 2 + 0]); uv.push(vt[idx3 * 2 + 1]);

            // normal
            idx1 = normal_idx[i];
            idx2 = normal_idx[i + 1];
            idx3 = normal_idx[i + 2];

            n.push(vn[idx1 * 3 + 0]); n.push(vn[idx1 * 3 + 1]); n.push(vn[idx1 * 3 + 2]);
            n.push(vn[idx2 * 3 + 0]); n.push(vn[idx2 * 3 + 1]); n.push(vn[idx2 * 3 + 2]);
            n.push(vn[idx3 * 3 + 0]); n.push(vn[idx3 * 3 + 1]); n.push(vn[idx3 * 3 + 2]); 
        }

        console.log(`Load mesh ${name}: (${v.length / 3.0}, ${vt.length / 2.0}, ${vn.length / 3.0}), ${vertex_idx.length} vertices, ${texcoord_idx.length} texcoords, ${normal_idx.length} normals, ${num_face} faces.`);

        // vao
        mesh.vao = gl.createVertexArray();
        gl.bindVertexArray(mesh.vao);

        // vbo
        let vertex = new Float32Array(p);
        let texcoord = new Float32Array(uv);
        let normal = new Float32Array(n);

        let vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertex.byteLength + texcoord.byteLength + normal.byteLength, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertex);
        gl.bufferSubData(gl.ARRAY_BUFFER, vertex.byteLength, texcoord);
        gl.bufferSubData(gl.ARRAY_BUFFER, vertex.byteLength + texcoord.byteLength, normal);

        // v(0), vt(1), vn(2)
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, vertex.byteLength);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, vertex.byteLength + texcoord.byteLength);
        gl.enableVertexAttribArray(2);

        gl.bindVertexArray(null);
        this.meshes.push(mesh);

        // flush
        // v = [];
        // vt = [];
        // vn = [];
        vertex_idx = [];
        normal_idx = [];
        texcoord_idx = [];
        p = [];
        n = [];
        uv = [];
    }

    render(gl) {
        for (let mesh of this.meshes) {
            gl.bindVertexArray(mesh.vao);
            if (mesh.material) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.materials[mesh.material].mapKd);
            }
            gl.drawArrays(gl.TRIANGLES, 0, mesh.num_vertices);
        }
    }
}