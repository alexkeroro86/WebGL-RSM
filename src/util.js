export function createShader(gl, vsSrc, fsSrc) {
    // get shader string
    vsSrc = vsSrc.trim();
    fsSrc = fsSrc.trim();

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
    let program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }

    return program;
}

export function loadImage(url) {
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

export function loadFile(url) {
    let fr = new FileReader();
    return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.responseType = 'blob';
        req.onload = () => {
            fr.readAsText(req.response);
            fr.onload = (e) => {
                let f = e.target.result;
                let ls = f.split(/\r?\n/);
                resolve(ls);
            };
        }
        req.onerror = () => {
            reject(new Error(`Failed to load file's url: ${url}`));
        };
        req.send();
    });
}