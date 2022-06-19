import * as webgl from "./webGLUtils.js";
const SAMPL_MULT = 2;
const canvas = document.querySelector("#mainCanvas");
const posXInput = document.querySelector("#posXInput");
const posYInput = document.querySelector("#posYInput");
const zoomInput = document.querySelector("#zoomInput");
const iterationInput = document.querySelector("#iterationInput");
const resetButton = document.querySelector("#resetButton");
updateCanvasSize();
let posBuffer;
let program;
let failed = false;
let zoom = 0;
let iterations = 500;
let [finalPosX, finalPosY] = [0, 0];
let finalZoom = getFinalZoom(zoom);
let [posX, posY] = shaderToCanvasSpace(finalPosX, finalPosY);
let dragOffsetX;
let dragOffsetY;
let dragMouseStartX;
let dragMouseStartY;
function canvasToShaderSpace(x, y) {
    let aspectRatio = canvas.width / canvas.height;
    return [
        (x / (canvas.width / SAMPL_MULT)) * 2 - 1,
        (1 - (y / (canvas.height / SAMPL_MULT)) * 2) / aspectRatio,
    ];
}
function shaderToCanvasSpace(x, y) {
    let aspectRatio = canvas.width / canvas.height;
    return [
        ((x + 1) / 2) * (canvas.width / SAMPL_MULT),
        ((1 - y * aspectRatio) * (canvas.height / SAMPL_MULT)) / 2,
    ];
}
function getFinalMousePos(x, y) {
    return canvasToShaderSpace(x, y);
}
function getFinalZoom(zoom) {
    return Math.pow(Math.E, zoom / 54 / 5);
}
function getInverseZoom(finalZoom) {
    return Math.log(finalZoom) * 54 * 5;
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
    [finalPosX, finalPosY] = getFinalMousePos(posX, posY);
}
// function getTransformMatrix(): Matrix2x2{
// }
function handleScroll(event) {
    if (event.deltaY == 0)
        return;
    let [x, y] = canvasToShaderSpace(event.x, event.y);
    zoomTo(zoom - event.deltaY, x, y);
    renderFrame();
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
function handleResize() {
    updateCanvasSize();
    [finalPosX, finalPosY] = getFinalMousePos(posX, posY);
    renderFrame();
}
function initializeWithSources(vertexSource, fragSource) {
    try {
        program = webgl.createProgramFromSources(gl, vertexSource, fragSource);
    }
    catch (e) {
        failCompilation(String(e));
    }
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
// function initializeCanvas() {
// 	canvas.style.width = canvas.width + "px";
// 	canvas.style.height = canvas.height + "px";
// 	canvas.width *= SAMPL_MULT;
// 	canvas.height *= SAMPL_MULT;
// }
function initializeLoop() {
    updateWithInput(null, true);
    posXInput.addEventListener("change", updateWithInput);
    posYInput.addEventListener("change", updateWithInput);
    zoomInput.addEventListener("change", updateWithInput);
    iterationInput.addEventListener("change", updateWithInput);
    resetButton.addEventListener("click", resetTransform);
    canvas.addEventListener("wheel", handleScroll);
    canvas.addEventListener("mousedown", enterDrag);
    window.addEventListener("resize", handleResize);
}
function updateWithInput(event, simpleZoom = false) {
    if (!isNaN(Number(posXInput.value))) {
        finalPosX = Number(posXInput.value);
    }
    if (!isNaN(Number(posYInput.value))) {
        finalPosY = Number(posYInput.value);
    }
    [posX, posY] = shaderToCanvasSpace(finalPosX, finalPosY);
    if (!isNaN(Number(zoomInput.value))) {
        if (simpleZoom) {
            finalZoom = Number(zoomInput.value);
            zoom = getInverseZoom(finalZoom);
        }
        else {
            zoomTo(getInverseZoom(Number(zoomInput.value)), 0, 0);
        }
    }
    if (!isNaN(Number(iterationInput.value))) {
        iterations = Number(iterationInput.value);
    }
    renderFrame();
}
function updateDisplays() {
    if (Number(posXInput.value) !== finalPosX && posXInput.value !== "")
        posXInput.value = String(finalPosX);
    if (Number(posYInput.value) !== finalPosY && posYInput.value !== "")
        posYInput.value = String(finalPosY);
    if (Number(zoomInput.value) !== finalZoom && zoomInput.value !== "")
        zoomInput.value = String(finalZoom);
    if (Number(iterationInput.value) !== iterations &&
        iterationInput.value !== "")
        iterationInput.value = String(iterations);
}
function resetTransform() {
    [finalPosX, finalPosY] = [0, 0];
    [posX, posY] = shaderToCanvasSpace(finalPosX, finalPosY);
    zoom = 0;
    finalZoom = getFinalZoom(zoom);
    iterations = 500;
    renderFrame();
}
function updateCanvasSize() {
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    canvas.width = width * SAMPL_MULT;
    canvas.height = height * SAMPL_MULT;
}
function failCompilation(reason) {
    failed = true;
    const containerElement = document.querySelector(".container");
    containerElement.classList.add("failed");
    const reasonElement = containerElement.querySelector(".errorReason");
    reasonElement.innerText = reason;
}
function renderFrame() {
    if (failed) {
        return;
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    let posAttrLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posAttrLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(posAttrLocation, 2, gl.FLOAT, false, 0, 0);
    let aspectRatioLocation = gl.getUniformLocation(program, "AspectRatio");
    gl.uniform1f(aspectRatioLocation, canvas.width / canvas.height);
    let offsetLocation = gl.getUniformLocation(program, "Offset");
    gl.uniform2f(offsetLocation, finalPosX, finalPosY);
    let scaleLocation = gl.getUniformLocation(program, "Scale");
    gl.uniform1f(scaleLocation, finalZoom);
    let iterationsLocation = gl.getUniformLocation(program, "Iterations");
    gl.uniform1i(iterationsLocation, iterations);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    updateDisplays();
}
const gl = canvas.getContext("webgl2");
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