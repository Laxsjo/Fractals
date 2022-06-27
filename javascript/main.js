import * as webgl from './webGLUtils.js';
import { UniformInputs, InputNumber, InputColor, UniformType, } from './uniformInputs.js';
import { Gestures } from './pointerGestures.js';
import * as cookies from './cookies.js';
// import * as _ from '';
const SAMPL_MULT = 2;
const canvas = document.querySelector('#mainCanvas');
const posXInput = document.querySelector('#posXInput');
const posYInput = document.querySelector('#posYInput');
const zoomInput = document.querySelector('#zoomInput');
const rotationInput = document.querySelector('#rotationInput');
const resInput = document.querySelector('#resInput');
// const escapeInput = document.querySelector("#escapeInput") as HTMLInputElement;
// const iterationInput = document.querySelector(
// 	"#iterationInput"
// ) as HTMLInputElement;
UniformInputs.registerUniform('escapeRadius', UniformType.Float, 300);
UniformInputs.registerUniform('secondaryEscapeRadius', UniformType.Float, 800);
UniformInputs.registerUniform('iterations', UniformType.Int, 500);
UniformInputs.registerUniform('secondaryIterations', UniformType.Int, 200);
UniformInputs.registerUniform('color1', UniformType.Vec3, '#0f0d30');
UniformInputs.registerUniform('color2', UniformType.Vec3, '#2e70ff');
UniformInputs.registerUniform('color3', UniformType.Vec3, '#8fedff');
UniformInputs.registerUniform('color4', UniformType.Vec3, '#e6e6ff');
const slotSelect = document.querySelector('#slotSelect');
const saveButton = document.querySelector('#saveButton');
const loadButton = document.querySelector('#loadButton');
const resetButton = document.querySelector('#resetButton');
const dimXInput = document.querySelector('#dimensionXInput');
const dimYInput = document.querySelector('#dimensionYInput');
const renderResInput = document.querySelector('#renderResInput');
const previewInput = document.querySelector('#previewRenderInput');
const downloadButton = document.querySelector('#downloadButton');
let res = 1;
updateCanvasSize();
let posBuffer;
let program;
let failed = false;
let activeSlot = 1;
let zoom = 0;
let rotation = 0;
// let escapeRadius: number = 100;
// let iterations: number = 500;
let [finalPosX, finalPosY] = [0, 0];
let finalZoom = getFinalZoom(zoom);
let [posX, posY] = shaderToCanvasSpace(finalPosX, finalPosY);
let previewRender = false;
let isRender = false;
let dragOffsetX;
let dragOffsetY;
let dragStartX;
let dragStartY;
let dragStartRot;
let rotateActive = false;
function rotatePoint(x, y, angle) {
    let s = Math.sin(angle);
    let c = Math.cos(angle);
    return [c * x - s * y, s * x + c * y];
}
function rad2Deg(x) {
    return (x / (2 * Math.PI)) * 360;
}
function deg2Rad(x) {
    return (x / 360) * (2 * Math.PI);
}
function canvasToShaderSpace(x, y) {
    let aspectRatio = canvas.clientWidth / canvas.clientHeight;
    let coords = [];
    if (x !== undefined) {
        coords.push((x / canvas.clientWidth) * 2 - 1);
    }
    if (y !== undefined) {
        coords.push((1 - (y / canvas.clientHeight) * 2) / aspectRatio);
    }
    if (coords.length === 1)
        return coords[0];
    return coords;
}
function shaderToCanvasSpace(x, y) {
    let aspectRatio = canvas.clientWidth / canvas.clientHeight;
    let coords = [];
    if (x !== undefined) {
        coords.push(((x + 1) / 2) * canvas.clientWidth);
    }
    if (y !== undefined) {
        coords.push(((1 - y * aspectRatio) * canvas.clientHeight) / 2);
    }
    if (coords.length === 1)
        return coords[0];
    return coords;
}
function activateAnimation(element, className) {
    element.classList.add(className);
    element.addEventListener('animationend', (e) => {
        element.classList.remove(className);
    }, { once: true });
}
function loadCookies() {
    let posX = cookies.get(`${activeSlot}_posX`);
    let posY = cookies.get(`${activeSlot}_posY`);
    let zoom = cookies.get(`${activeSlot}_zoom`);
    let rotation = cookies.get(`${activeSlot}_rotation`);
    // let escapeRadius = cookies.get("escapeRadius");
    // let iterations = cookies.get("iterations");
    if (posX)
        posXInput.value = posX;
    if (posY)
        posYInput.value = posY;
    if (zoom)
        zoomInput.value = zoom;
    if (rotation)
        rotationInput.value = rotation;
    // if (escapeRadius) escapeInput.value = escapeRadius;
    // if (iterations) iterationInput.value = iterations;
    for (const input of UniformInputs.getInputs()) {
        let value = cookies.get(`${activeSlot}_${input.name}`);
        if (value)
            input.input.value = value;
    }
    updateWithInput(null, true);
    activateAnimation(loadButton, 'popup');
}
function storeCookies() {
    cookies.set(`${activeSlot}_posX`, String(finalPosX));
    cookies.set(`${activeSlot}_posY`, String(finalPosY));
    cookies.set(`${activeSlot}_zoom`, String(finalZoom));
    cookies.set(`${activeSlot}_rotation`, String(rotation));
    for (const input of UniformInputs.getInputs()) {
        cookies.set(`${activeSlot}_${input.name}`, String(input.value));
    }
    // cookies.set("escapeRadius", String(escapeRadius));
    // cookies.set("iterations", String(iterations));
    activateAnimation(saveButton, 'popup');
}
function appendCookieSlots() {
    let slots = cookies.getJSON('slots');
    if (!slots)
        slots = [1];
    if (slotSelect.value === 'new') {
        slotSelect.value = '1';
    }
    slotSelectAddOption(...slots);
    return slots;
}
function addCookieSlot() {
    var _a;
    let existingSlots = cookies.getJSON('slots');
    if (!existingSlots)
        existingSlots = [];
    // console.log(existingSlots);
    let newSlot = ((_a = _.max(existingSlots)) !== null && _a !== void 0 ? _a : 0) + 1;
    existingSlots.push(newSlot);
    cookies.setJSON('slots', existingSlots);
    slotSelectAddOption(newSlot);
    return newSlot;
}
function slotSelectAddOption(...slots) {
    let newSlotOpt = slotSelect.querySelector('.newSlot');
    for (const slot of slots) {
        let option = document.createElement('option');
        option.value = String(slot);
        option.innerText = String(slot);
        newSlotOpt.insertAdjacentElement('beforebegin', option);
    }
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
    // console.log(aroundX, aroundY);
    x = (x - aroundX) * deltaZoom + aroundX;
    y = (y - aroundY) * deltaZoom + aroundY;
    [posX, posY] = shaderToCanvasSpace(x, y);
    [finalPosX, finalPosY] = getFinalMousePos(posX, posY);
}
function rotateTo(newRot) {
    let rot = newRot - rotation;
    rotation = newRot;
    [posX, posY] = shaderToCanvasSpace(...rotatePoint(posX, posY, deg2Rad(-rot / 2)));
    [finalPosX, finalPosY] = getFinalMousePos(posX, posY);
}
// function getTransformMatrix(): Matrix2x2{
// }
function handleScroll(event) {
    if (event.deltaY == 0)
        return;
    let [x, y] = canvasToShaderSpace(event.x, event.y);
    zoomTo(zoom - event.deltaY, x, y);
    renderFrame(gl, program);
}
function handlePointerDown(event) {
    Gestures.addGesture(event);
}
function handlePointerUp(event) {
    Gestures.removeGesture(event);
}
function handlePointerMove(event) {
    Gestures.updateGestures(event);
}
function handleGestureBegin(pointerId) {
    enterDrag(pointerId !== null && pointerId !== void 0 ? pointerId : -1);
}
function handleGestureEnd(pointerId) {
    leaveDrag(pointerId);
}
function handleGestureMove(pointerId) {
    let gesture = Gestures.getGesture(pointerId);
    let x = gesture.lastEvent.pageX - gesture.startEvent.pageX;
    let y = gesture.lastEvent.pageY - gesture.startEvent.pageY;
    if (!rotateActive) {
        // x /= finalZoom;
        // y /= finalZoom;
        posX = dragStartX + x;
        posY = dragStartY + y;
    }
    else {
        let rot = canvasToShaderSpace(x);
        rot = (rot + 1) / 2;
        rot *= 360;
        let [startX, startY] = canvasToShaderSpace(dragStartX, dragStartY);
        rotation = dragStartRot + rot;
        // console.log(rot);
        [posX, posY] = shaderToCanvasSpace(...rotatePoint(startX, startY, deg2Rad(-rot / 2)));
    }
    [finalPosX, finalPosY] = getFinalMousePos(posX, posY);
    renderFrame(gl, program);
}
function handleResize() {
    if (previewRender) {
        enterPreview();
    }
    else {
        updateCanvasSize();
    }
    [posX, posY] = shaderToCanvasSpace(finalPosX, finalPosY);
    renderFrame(gl, program);
}
function enterDrag(pointerId) {
    var _a;
    let gesture = (_a = Gestures.getGesture(pointerId)) !== null && _a !== void 0 ? _a : Gestures.activeGestures[0];
    if (gesture.startEvent.button !== 0) {
        return;
    }
    // console.log(gesture.startEvent.pointerId);
    rotateActive = gesture.startEvent.shiftKey;
    // document.addEventListener('pointerup', leaveDrag);
    // document.addEventListener('pointermove', handlePointerMove);
    dragOffsetX = gesture.lastEvent.pageX;
    dragOffsetY = gesture.lastEvent.pageY;
    if (rotateActive) {
        dragStartRot = rotation;
    }
    dragStartX = posX;
    dragStartY = posY;
}
function leaveDrag(pointerId) {
    const gesture = Gestures.getGesture(pointerId);
    if (gesture.lastEvent.button !== 0) {
        return;
    }
    console.log(pointerId);
    rotateActive = false;
    // document.removeEventListener('pointerup', this);
    // document.removeEventListener('pointermove', handlePointerMove);
}
function enterPreview() {
    // console.log('Entered preview');
    let renderX = Number(dimXInput.value);
    let renderY = Number(dimYInput.value);
    let ratio = renderX / renderY;
    let currentX = canvas.width;
    let currentY = canvas.height;
    let currentRatio = currentX / currentY;
    // console.log(currentRatio, '=>', ratio);
    let x, y;
    if (currentRatio < ratio) {
        x = currentX;
        y = currentX / ratio;
    }
    else {
        y = currentY;
        x = currentY * ratio;
    }
    setCanvasSize(x, y);
}
function handleSlotChange(loadSlot = true) {
    let value = slotSelect.value;
    let slot;
    if (value === 'new') {
        slot = addCookieSlot();
    }
    else {
        slot = Number(value);
    }
    activeSlot = slot;
    if (loadSlot)
        loadCookies();
}
function initializeWithSources(gl, vertexSource, fragSource) {
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
    renderFrame(gl, program);
}
// function initializeCanvas() {
// 	canvas.style.width = canvas.width + "px";
// 	canvas.style.height = canvas.height + "px";
// 	canvas.width *= SAMPL_MULT;
// 	canvas.height *= SAMPL_MULT;
// }
function initializeLoop() {
    // loadCookies();
    appendCookieSlots();
    handleSlotChange(false);
    updateWithInput(null, true);
    if (previewRender) {
        enterPreview();
    }
    posXInput.addEventListener('change', updateWithInput);
    posYInput.addEventListener('change', updateWithInput);
    zoomInput.addEventListener('change', updateWithInput);
    rotationInput.addEventListener('change', updateWithInput);
    resInput.addEventListener('change', updateWithInput);
    previewInput.addEventListener('change', updateWithInput);
    for (const input of UniformInputs.getInputs()) {
        input.input.addEventListener('change', updateWithInput);
    }
    // escapeInput.addEventListener("change", updateWithInput);
    // iterationInput.addEventListener("change", updateWithInput);
    slotSelect.addEventListener('change', () => {
        handleSlotChange();
    });
    saveButton.addEventListener('click', storeCookies);
    loadButton.addEventListener('click', loadCookies);
    resetButton.addEventListener('click', resetTransform);
    previewInput.addEventListener('change', updateWithInput);
    dimXInput.addEventListener('change', updateWithInput);
    dimYInput.addEventListener('change', updateWithInput);
    downloadButton.addEventListener('click', renderDownload);
    canvas.addEventListener('wheel', handleScroll);
    // canvas.addEventListener('pointerdown', enterDrag);
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    Gestures.addEventListener('gestureBegin', handleGestureBegin);
    Gestures.addEventListener('gestureMove', handleGestureMove);
    Gestures.addEventListener('gestureEnd', handleGestureEnd);
    window.addEventListener('resize', handleResize);
}
function updateWithInput(event, simpleSet = true) {
    if (!isNaN(Number(posXInput.value)) && posXInput.value !== '') {
        finalPosX = Number(posXInput.value);
    }
    if (!isNaN(Number(posYInput.value)) && posYInput.value !== '') {
        finalPosY = Number(posYInput.value);
    }
    [posX, posY] = shaderToCanvasSpace(finalPosX, finalPosY);
    if (!isNaN(Number(zoomInput.value)) && zoomInput.value !== '') {
        if (simpleSet) {
            finalZoom = Number(zoomInput.value);
            zoom = getInverseZoom(finalZoom);
        }
        else {
            zoomTo(getInverseZoom(Number(zoomInput.value)), 0, 0);
        }
    }
    if (!isNaN(Number(rotationInput.value)) && rotationInput.value !== '') {
        if (simpleSet) {
            rotation = Number(rotationInput.value);
        }
        else {
            rotateTo(Number(rotationInput.value));
        }
    }
    if (!isNaN(Number(resInput.value)) && resInput.value !== '') {
        res = Number(resInput.value);
    }
    previewRender = previewInput.checked;
    for (const input of UniformInputs.getInputs()) {
        if (!isNaN(input.getValue()) && input.input.value !== '') {
            input.value = input.input.value;
        }
    }
    // if (!isNaN(Number(iterationInput.value))) {
    // 	iterations = Number(iterationInput.value);
    // }
    // if (!isNaN(Number(escapeInput.value))) {
    // 	escapeRadius = Number(escapeInput.value);
    // }
    // storeCookies();
    updateCanvasSize();
    if (previewRender) {
        enterPreview();
    }
    renderFrame(gl, program);
}
function updateDisplays() {
    if (Number(posXInput.value) !== finalPosX)
        posXInput.value = String(finalPosX);
    if (Number(posYInput.value) !== finalPosY)
        posYInput.value = String(finalPosY);
    if (Number(zoomInput.value) !== finalZoom)
        zoomInput.value = String(finalZoom);
    if (Number(rotationInput.value) !== rotation)
        rotationInput.value = String(rotation);
    if (Number(resInput.value) !== res)
        resInput.value = String(res);
    previewInput.checked = previewRender;
    for (const input of UniformInputs.getInputs()) {
        if (input.input.value !== input.value)
            input.input.value = input.value;
    }
    slotSelect.value = String(activeSlot);
    // if (
    // 	Number(iterationInput.value) !== iterations &&
    // 	iterationInput.value !== ""
    // )
    // 	iterationInput.value = String(iterations);
    // if (Number(escapeInput.value) !== escapeRadius && escapeInput.value !== "")
    // 	escapeInput.value = String(escapeRadius);
}
function resetTransform() {
    [finalPosX, finalPosY] = [0, 0];
    [posX, posY] = shaderToCanvasSpace(finalPosX, finalPosY);
    zoom = 0;
    finalZoom = getFinalZoom(zoom);
    rotation = 0;
    res = 1;
    for (const input of UniformInputs.getInputs()) {
        input.reset();
    }
    // iterations = 500;
    updateCanvasSize();
    renderFrame(gl, program);
    activateAnimation(resetButton, 'popup');
}
function updateCanvasSize() {
    let ratio = window.devicePixelRatio;
    let width = canvas.clientWidth * ratio;
    let height = canvas.clientHeight * ratio;
    setCanvasSize(width, height);
}
function setCanvasSize(width, height) {
    canvas.width = width * res;
    canvas.height = height * res;
}
function failCompilation(reason) {
    failed = true;
    const containerElement = document.querySelector('.container');
    containerElement.classList.add('failed');
    const reasonElement = containerElement.querySelector('.errorReason');
    reasonElement.innerText = reason;
}
function renderFrame(gl, program) {
    if (failed) {
        return;
    }
    // console.log(gl.canvas.width, gl.drawingBufferWidth);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    let posAttrLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posAttrLocation);
    // gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(posAttrLocation, 2, gl.FLOAT, false, 0, 0);
    let aspectRatioLocation = gl.getUniformLocation(program, 'AspectRatio');
    gl.uniform1f(aspectRatioLocation, gl.canvas.width / gl.canvas.height);
    let offsetLocation = gl.getUniformLocation(program, 'Offset');
    gl.uniform2f(offsetLocation, finalPosX, finalPosY);
    let rotationLocation = gl.getUniformLocation(program, 'Rotation');
    gl.uniform1f(rotationLocation, (rotation / 360) * Math.PI);
    let scaleLocation = gl.getUniformLocation(program, 'Scale');
    gl.uniform1f(scaleLocation, finalZoom);
    let isRenderLoc = gl.getUniformLocation(program, 'IsRender');
    gl.uniform1i(isRenderLoc, Number(isRender || previewRender));
    for (const input of UniformInputs.getInputs()) {
        let location = gl.getUniformLocation(program, input.name[0].toUpperCase() + input.name.slice(1));
        if (input instanceof InputColor) {
            gl[input.type](location, ...input.getValue());
        }
        else if (input instanceof InputNumber) {
            gl[input.type](location, input.getValue(), 0, 0);
        }
    }
    // let iterationsLocation = gl.getUniformLocation(program, "Iterations");
    // gl.uniform1i(iterationsLocation, iterations);
    // let escapeLocation = gl.getUniformLocation(program, "EscapeRadius");
    // gl.uniform1f(escapeLocation, escapeRadius);
    // console.log(escapeRadius);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    updateDisplays();
}
function renderDownload() {
    if (isNaN(Number(dimXInput.value)) || isNaN(Number(dimYInput.value))) {
        console.error('Render failed: invalid dimensions');
        return;
    }
    let link = document.querySelector('#renderImageLink');
    let image = link.querySelector('img');
    activateAnimation(downloadButton, 'popup');
    link.classList.remove('active');
    let width = Number(dimXInput.value);
    let height = Number(dimYInput.value);
    let resMult = Number(renderResInput.value);
    resMult = Math.pow(2, Math.round(Math.log2(resMult))); // convert multiplier to nearest power of 2
    console.log('Started render', width, 'x', height, `mult x${resMult}`);
    let offsCanvas = document.createElement('canvas');
    const gl = offsCanvas.getContext('webgl2', { preserveDrawingBuffer: true });
    let renderPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, renderPosBuffer);
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
    offsCanvas.width = width * resMult;
    offsCanvas.height = height * resMult;
    const program = webgl.createProgramFromSources(gl, vertexSource, fragSource);
    isRender = true;
    renderFrame(gl, program);
    isRender = false;
    // gl.finish();
    // let url = offsCanvas.toDataURL();
    // image.style.aspectRatio = width + " / " + height;
    // link.href = url;
    // image.src = url;
    // link.classList.add("active");
    webgl.callbackOnSync(gl, () => {
        let resizeCanvas = document.createElement('canvas');
        resizeCanvas.width = width;
        resizeCanvas.height = height;
        let context = resizeCanvas.getContext('2d');
        context.drawImage(offsCanvas, 0, 0, width * resMult, height * resMult, 0, 0, width, height);
        resizeCanvas.toBlob((blob) => {
            // link.style.aspectRatio = width + ' / ' + height;
            let url = window.URL.createObjectURL(blob);
            link.href = url;
            // window.URL.revokeObjectURL(url);
            // image.src = url;
            link.classList.add('active');
            link.click();
        });
    });
}
const gl = canvas.getContext('webgl2');
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
// console.log(gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT));
// console.log(gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT));
// console.log(gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT));
let vertexSource = null;
let fragSource = null;
fetch('shaders/frag.glsl').then(async (response) => {
    fragSource = await response.text();
    if (vertexSource !== null) {
        initializeWithSources(gl, vertexSource, fragSource);
    }
});
fetch('shaders/vertex.glsl').then(async (response) => {
    vertexSource = await response.text();
    if (fragSource !== null) {
        initializeWithSources(gl, vertexSource, fragSource);
    }
});
//# sourceMappingURL=main.js.map