// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision highp float;

varying vec2 v_texCoord;

uniform mat2 Transform;

uniform vec2 Offset;
uniform float Scale;

const int ITERATIONS = 200;

vec2 cMult(vec2 c1, vec2 c2) {
	vec2 outC;

	outC.x = c1.x * c2.x - c1.y * c2.y;
	outC.y = c1.x * c2.y + c2.x * c1.y;

	return outC;
}

float mandelbrot(vec2 pos, vec2 z, float escapeRadius) {
	vec2 c = pos;

	float outValue = 1.0;

	for(int i = 0; i < ITERATIONS; i++) {
		z = cMult(z, z) + c;
		if(length(z) > escapeRadius) {
			outValue = float(i) / float(ITERATIONS);
			break;
		}
	}

	return outValue;
}

void main() {

	vec2 coords = (v_texCoord - Offset) / Scale;

	float value = mandelbrot(coords, vec2(0), 10.0);

	gl_FragColor = vec4(0, 0.5, 1, 1) * value;
	// gl_FragColor = vec4(coords, 0, 1) * value;
}