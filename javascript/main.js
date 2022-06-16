import * as webgl from "./webGLUtils.js";
let posBuffer;
function initializeWithSources(vertexSource, fragSource) {
    let program = webgl.createProgramFromSources(gl, vertexSource, fragSource);
    console.log(vertexSource);
    console.log(fragSource);
    posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    // prettier-ignore
    let vertexPositions = [
        -1, -1,
        -1, 1,
        1, 1,
        -1, -1,
        1, 1,
        1, -1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
    renderFrame(gl, program);
}
function renderFrame(gl, program) {
    // TODO: Resize canvas size to element size
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    let posAttrLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posAttrLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(posAttrLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
const canvas = document.querySelector("#mainCanvas");
console.log(canvas);
const gl = canvas.getContext("webgl");
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
let vertexSource = null;
let fragSource = null;
fetch("/shaders/frag.glsl").then(async (response) => {
    fragSource = await response.text();
    if (vertexSource !== null) {
        initializeWithSources(vertexSource, fragSource);
    }
});
fetch("/shaders/vertex.glsl").then(async (response) => {
    vertexSource = await response.text();
    if (fragSource !== null) {
        initializeWithSources(vertexSource, fragSource);
    }
});
//# sourceMappingURL=main.js.map