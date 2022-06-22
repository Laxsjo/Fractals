#version 300 es
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision highp float;

in vec2 texCoord;
in vec2 screenCoord;

out vec4 outColor;

uniform mat2 Transform;

uniform vec2 Offset;
uniform float Scale;

uniform int Iterations;

const float ESCAPE_RADIUS = 300.0;

const float PI = 3.141592653589793238462643;
const float TWO_PI = PI * 2.0;

const int GRADIENT_COUNT_ITERATIONS = 0;
const int GRADIENT_ESCAPE_RADIUS = 1;
const int GRADIENT_ESCAPE_ANGLE = 2;
const int GRADIENT_CONTINUOUS_ITERATIONS = 3;

vec2 cMult(vec2 c1, vec2 c2) {
	vec2 outC;

	outC.x = c1.x * c2.x - c1.y * c2.y;
	outC.y = c1.x * c2.y + c2.x * c1.y;

	return outC;
}

vec3 genColorPalette(vec3 a, vec3 b, vec3 c, vec3 d, float t) {
	a /= 2.0;
	b /= 2.0;
	// From here: https://iquilezles.org/articles/palettes/
	return a + b * cos(TWO_PI * (c * t + d));
}

/**
* Interpolate between three colors with colorB placed at point w
*/
vec3 colorRamp(vec3 colorA, vec3 colorB, vec3 colorC, float w, float t) {
	return mix(mix(colorA, colorB, min(t / w, 1.0)), colorC, max((t - w) / (1.0 - w), 0.0));
}

vec3 colorPalette(float value) {
	vec3 color;

	// value = clamp(value, 0.0, 1.0);

	value = sqrt(value);

	// vec3 aColor = vec3(0.81, 0.8, 0.59);
	// vec3 bColor = vec3(0.81, 1, 0.4) * 1.0;
	// vec3 cColor = vec3(1.1, 1, 0.0);
	// vec3 dColor = vec3(0.5, 0.65, 0.5);

	// dColor += 0.0;

	// color = genColorPalette(aColor, bColor, cColor, dColor, value);

	vec3 colorA = vec3(0.18, 0.44, 1);
	vec3 colorB = vec3(0.56, 0.93, 1);
	vec3 colorC = vec3(0.06, 0.05, 0.19);

	color = mix(colorRamp(colorA, colorB, colorC, 0.01, pow(1.0 - value, 5.0)), vec3(0), pow(value, 2.0));

	vec3 colorTemp = vec3(0.77, 0.78, 1);
	color = mix(color, colorTemp, pow(value, 100.0));

	// return vec3(value);
	return color;
}

float mandelbrot(vec2 coords, int gradientType) {
	vec2 c = coords;
	vec2 z = c;
	float outValue = .0;

	for(int i = 0; i < Iterations; i++) {
		z = cMult(z, z) + c;
		if(length(z) > ESCAPE_RADIUS) {
			switch(gradientType) {
				case GRADIENT_COUNT_ITERATIONS:
					outValue = float(i) / float(Iterations);
					break;
				case GRADIENT_CONTINUOUS_ITERATIONS:
					z = cMult(z, z) + c;
					i++;
					z = cMult(z, z) + c;
					i++;
					float modulus = sqrt(z.x * z.x + z.y * z.y);
					float mu = float(i) - log(log(modulus)) / log(2.0);
					outValue = mu / float(ESCAPE_RADIUS);
					break;
				case GRADIENT_ESCAPE_RADIUS:
					outValue = (length(z) - ESCAPE_RADIUS) / (ESCAPE_RADIUS * ESCAPE_RADIUS);
					break;
				case GRADIENT_ESCAPE_ANGLE:
					outValue = atan(z.y, z.x) / PI;
					break;
			}
			break;
		}
	}

	return outValue;
}

void main() {
	vec3 color;

	vec2 coords = (texCoord - Offset) / Scale;

	// float value = mandelbrot(coords, GRADIENT_ESCAPE_RADIUS);
	// value %= mandelbrot(coords, GRADIENT_ESCAPE_ANGLE);
	// value += mandelbrot(coords, GRADIENT_COUNT_ITERATIONS);

	float value = mandelbrot(coords, GRADIENT_CONTINUOUS_ITERATIONS);
	// float value = mandelbrot(coords, GRADIENT_ESCAPE_RADIUS);

	if(screenCoord.y < 0.93) {
		// color = colorPalette(aColor, bColor, cColor, dColor, value);
		color = colorPalette(value);

		// color = vec3(value < 0.05);
	} else {
		color = colorPalette(screenCoord.x);
	}

	outColor = vec4(color, 1);
}