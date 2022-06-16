export function compileShader(gl, source, type) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        throw new Error("Could not compile shader: " + gl.getShaderInfoLog(shader));
    }
    return shader;
}
export function createProgram(gl, vertexShader, fragShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        throw new Error("Could not link program: " + gl.getProgramInfoLog(program));
    }
    return program;
}
export function createProgramFromSources(gl, vertexSource, fragSource) {
    let vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
    let fragShader = compileShader(gl, fragSource, gl.FRAGMENT_SHADER);
    return createProgram(gl, vertexShader, fragShader);
}
//# sourceMappingURL=webGLUtils.js.map