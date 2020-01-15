import { loadImage, loadFile } from './util';

// var gl = window.WebGL2RenderingContext.prototype;
const VERTICES_PER_FACE = 3;

export class Mesh {
    constructor() {
        this.vao = null;
        this.num_vertices = null;
        this.name = null;
    }
}

export default class Model {

    constructor() {
        this.meshes = [];
    }

    async load(gl, url) {
        // read file
        let lines = await loadFile(url);

        // parse obj format
        this.loadObj(gl, url, lines);
    }

    loadObj(gl, url, lines) {
        // placeholder
        let v = [];
        let vt = [];
        let vn = [];
        let vertex_idx = [];
        let texcoord_idx = [];
        let normal_idx = [];
        let name = null;
        let num_face = 0;

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
                this.export(gl, name, v, vt, vn, vertex_idx, normal_idx, texcoord_idx, num_face);

                // flush
                // v = [];
                // vt = [];
                // vn = [];
                vertex_idx = [];
                texcoord_idx = [];
                normal_idx = [];
                name = line[1];
                num_face = 0;
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
                //
            }
        }

        // export last object
        this.export(gl, name, v, vt, vn, vertex_idx, normal_idx, texcoord_idx, num_face);

        console.log(`Load ${url}: ${this.meshes.length} mesh(es).`);

        // flush
        v = [];
        vt = [];
        vn = [];
        vertex_idx = [];
        texcoord_idx = [];
        normal_idx = [];
        num_face = 0;
    }

    loadMtl() {
        //
    }

    export(gl, name, v, vt, vn, vertex_idx, normal_idx, texcoord_idx, num_face) {
        let mesh = new Mesh();
        mesh.num_vertices = num_face * 3;
        mesh.name = name;

        let p = [];
        let uv = [];
        let n = [];

        // per face (vertex)
        for (let i = 0; i < mesh.num_vertices; i += 3) {
            let idx1 = vertex_idx[i];
            let idx2 = vertex_idx[i + 1];
            let idx3 = vertex_idx[i + 2];

            p.push(v[idx1 * 3 + 0]); p.push(v[idx1 * 3 + 1]); p.push(v[idx1 * 3 + 2]);
            p.push(v[idx2 * 3 + 0]); p.push(v[idx2 * 3 + 1]); p.push(v[idx2 * 3 + 2]);
            p.push(v[idx3 * 3 + 0]); p.push(v[idx3 * 3 + 1]); p.push(v[idx3 * 3 + 2]);
        }

        // per face (texcoord)
        for (let i = 0; i < mesh.num_vertices; i += 3) {
            let idx1 = texcoord_idx[i];
            let idx2 = texcoord_idx[i + 1];
            let idx3 = texcoord_idx[i + 2];

            uv.push(vt[idx1 * 2 + 0]); uv.push(vt[idx1 * 2 + 1]);
            uv.push(vt[idx2 * 2 + 0]); uv.push(vt[idx2 * 2 + 1]);
            uv.push(vt[idx3 * 2 + 0]); uv.push(vt[idx3 * 2 + 1]); 
        }

        // per face (normal)
        for (let i = 0; i < mesh.num_vertices; i += 3) {
            let idx1 = normal_idx[i];
            let idx2 = normal_idx[i + 1];
            let idx3 = normal_idx[i + 2];

            n.push(vn[idx1 * 3 + 0]); n.push(vn[idx1 * 3 + 1]); n.push(vn[idx1 * 3 + 2]);
            n.push(vn[idx2 * 3 + 0]); n.push(vn[idx2 * 3 + 1]); n.push(vn[idx2 * 3 + 2]);
            n.push(vn[idx3 * 3 + 0]); n.push(vn[idx3 * 3 + 1]); n.push(vn[idx3 * 3 + 2]); 
        }

        console.log(`Load ${name}: (${v.length / 3.0}, ${vt.length / 2.0}, ${vn.length / 3.0}), ${vertex_idx.length} vertices, ${texcoord_idx.length} texcoords, ${normal_idx.length} normals, ${num_face} faces.`);

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
            gl.drawArrays(gl.TRIANGLES, 0, mesh.num_vertices);
        }
    }
}