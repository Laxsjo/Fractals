import * as webgl from "./webGLUtils.js";
const canvas = document.querySelector("#mainCanvas");
const posXInput = document.querySelector("#posXInput");
const posYInput = document.querySelector("#posYInput");
const zoomInput = document.querySelector("#zoomInput");
let posBuffer;
let program;
let zoom = 0;
let transform;
let [finalPosX, finalPosY] = [0, 0];
let finalZoom = getFinalZoom(zoom);
let [posX, posY] = shaderToCanvasSpace(finalPosX, finalPosY);
let dragOffsetX;
let dragOffsetY;
let dragMouseStartX;
let dragMouseStartY;
function canvasToShaderSpace(x, y) {
    return [(x / canvas.width) * 2 - 1, 1 - (y / canvas.height) * 2];
}
function shaderToCanvasSpace(x, y) {
    return [((x + 1) / 2) * canvas.width, ((1 - y) * canvas.height) / 2];
}
function getFinalMousePos(x, y) {
    return canvasToShaderSpace(x, y);
}
function getFinalZoom(zoom) {
    return Math.pow(Math.E, zoom / 54 / 5);
}
function getInverseZoom(finalZoom) {
    return Math.log(finalZoom) * 50;
}
function zoomTo(newZoom, aroundX, aroundY) {
    let oldZoom = finalZoom;
    zoom = newZoom;
    finalZoom = getFinalZoom(zoom);
    let deltaZoom = finalZoom / oldZoom;
    let [x, y] = canvasToShaderSpace(posX, posY);
    x = (x - aroundX) * deltaZoom + aroundX;
    y = (y - aroundY) * deltaZoom + aroundY;
    [posX, posY] = shaderToCanvasSpace(x, y);
    console.log(aroundX, aroundY, ",", deltaZoom);
    [finalPosX, finalPosY] = getFinalMousePos(posX, posY);
    renderFrame();
}
// function getTransformMatrix(): Matrix2x2{
// }
function handleScroll(event) {
    if (event.deltaY == 0)
        return;
    let [x, y] = canvasToShaderSpace(event.x, event.y);
    zoomTo(zoom - event.deltaY, x, y);
}
function enterDrag(event) {
    if (event.button !== 0) {
        return;
    }
    document.addEventListener("mouseup", leaveDrag);
    document.addEventListener("mousemove", handleMouseMove);
    dragOffsetX = event.pageX;
    dragOffsetY = event.pageY;
    dragMouseStartX = posX;
    dragMouseStartY = posY;
}
function leaveDrag(event) {
    if (event.button !== 0) {
        return;
    }
    document.removeEventListener("mouseup", this);
    document.removeEventListener("mousemove", handleMouseMove);
}
function handleMouseMove(event) {
    let x = event.pageX;
    let y = event.pageY;
    posX = dragMouseStartX + (x - dragOffsetX);
    posY = dragMouseStartY + (y - dragOffsetY);
    [finalPosX, finalPosY] = getFinalMousePos(posX, posY);
    renderFrame();
}
function initializeWithSources(vertexSource, fragSource) {
    program = webgl.createProgramFromSources(gl, vertexSource, fragSource);
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
    initializeLoop();
    renderFrame();
}
function initializeLoop() {
    posXInput.addEventListener("change", updateWithInput);
    posYInput.addEventListener("change", updateWithInput);
    zoomInput.addEventListener("change", updateWithInput);
    canvas.addEventListener("wheel", handleScroll);
    canvas.addEventListener("mousedown", enterDrag);
}
function updateWithInput(event) {
    if (!isNaN(Number(posXInput.value))) {
        finalPosX = Number(posXInput.value);
    }
    if (!isNaN(Number(posYInput.value))) {
        finalPosY = Number(posYInput.value);
    }
    [posX, posY] = shaderToCanvasSpace(finalPosX, finalPosY);
    if (!isNaN(Number(zoomInput.value))) {
        zoomTo(getInverseZoom(Number(zoomInput.value)), 0.5, 0);
    }
    console.log(finalPosX, posX);
    renderFrame();
}
function updateDisplays() {
    if (Number(posXInput.value) !== finalPosX)
        posXInput.value = String(finalPosX);
    if (Number(posYInput.value) !== finalPosY)
        posYInput.value = String(finalPosY);
    if (Number(zoomInput.value) !== finalZoom)
        zoomInput.value = String(finalZoom);
}
function renderFrame() {
    // TODO: Resize canvas size to element size
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    let posAttrLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posAttrLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(posAttrLocation, 2, gl.FLOAT, false, 0, 0);
    let offsetLocation = gl.getUniformLocation(program, "Offset");
    gl.uniform2f(offsetLocation, finalPosX, finalPosY);
    let scaleLocation = gl.getUniformLocation(program, "Scale");
    gl.uniform1f(scaleLocation, finalZoom);
    let transformLocation = gl.getUniformLocation(program, "Transform");
    // gl.uniformMatrix2fv(transformLocation, false)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    updateDisplays();
}
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