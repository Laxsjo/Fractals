#version 300 es
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision highp float;

in vec2 texCoord;

out vec4 outColor;

uniform mat2 Transform;

uniform vec2 Offset;
uniform float Scale;

uniform int Iterations;

const float ESCAPE_RADIUS = 2.0;

vec2 cMult(vec2 c1, vec2 c2) {
	vec2 outC;

	outC.x = c1.x * c2.x - c1.y * c2.y;
	outC.y = c1.x * c2.y + c2.x * c1.y;

	return outC;
}

float mandelbrot(vec2 coords) {
	vec2 c = coords;
	vec2 z = c;
	float outValue = 1.0;

	for(int i = 0; i < Iterations; i++) {
		z = cMult(z, z) + c;
		if(length(z) > ESCAPE_RADIUS) {
			outValue = float(i) / float(Iterations);
			// outValue = (length(z) - ESCAPE_RADIUS) / (ESCAPE_RADIUS);
			break;
		}
	}

	return outValue;
}

void main() {
	vec2 coords = (texCoord - Offset) / Scale;

	float value = mandelbrot(coords);

	// outColor = vec4(dFdx(value), dFdy(value), value, 1);

	outColor = vec4(0, 0, 0, 1) * value;
	// outColor = vec4(coords, 0, 1) * value;
}