export function compileShader(
	gl: WebGLRenderingContext,
	source: string,
	type: number
): WebGLShader {
	let shader = gl.createShader(type);

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (!success) {
		throw "Could not compile shader:\n" + gl.getShaderInfoLog(shader);
	}

	return shader;
}

export function createProgram(
	gl: WebGLRenderingContext,
	vertexShader: WebGLShader,
	fragShader: WebGLShader
): WebGLProgram {
	let program = gl.createProgram();

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragShader);

	gl.linkProgram(program);

	let success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!success) {
		throw new Error(
			"Could not link program: " + gl.getProgramInfoLog(program)
		);
	}

	return program;
}

export function createProgramFromSources(
	gl: WebGLRenderingContext,
	vertexSource: string,
	fragSource: string
): WebGLProgram {
	let vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
	let fragShader = compileShader(gl, fragSource, gl.FRAGMENT_SHADER);

	return createProgram(gl, vertexShader, fragShader);
}

/**
 * From here: https://stackoverflow.com/a/54499741/15507414
 */
export function callbackOnSync(
	gl: WebGL2RenderingContext,
	callback: () => any
) {
	const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
	gl.flush(); // make sure the sync command is read

	setTimeout(checkSync);

	function checkSync() {
		const timeout = 0; // 0 = just check the status
		const bitflags = 0;
		const status = gl.clientWaitSync(sync, bitflags, timeout);
		switch (status) {
			case gl.TIMEOUT_EXPIRED:
				// it's not done, check again next time
				return setTimeout(checkSync);
			case gl.WAIT_FAILED:
				throw new Error("should never get here");
			default:
				// it's done!
				gl.deleteSync(sync);

				callback();
		}
	}
}
