// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

varying vec2 v_texCoord;

vec2 cMult(vec2 c1, vec2 c2) {
	vec2 outC;

	outC.x = c1.x * c2.x - c1.y * c2.y;
	outC.y = c1.x * c2.y + c2.x * c1.y;

	return outC;
}

float mandelbrot(vec2 pos, vec2 c, int iterations, float escapeRadius) {
	vec2 z = pos;

	float outValue;

	for(int i = 0; i < 200; i++) {
		z = cMult(z, z) + c;
		if(length(z) > escapeRadius) {
			outValue = float(i / iterations);
			break;
		}
	}

	return outValue;
}

void main() {

	// gl_FragColor is a special variable a fragment shader
	// is responsible for setting
	float value = mandelbrot(v_texCoord, vec2(0), 200, 10.0);
	gl_FragColor = vec4(0, 0.6, 1, 1) * value;
	gl_FragColor = vec4(value, value, value, 1);

}