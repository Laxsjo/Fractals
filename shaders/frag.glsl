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
uniform int SecondaryIterations;

uniform float EscapeRadius;
uniform float SecondaryEscapeRadius;

// const float ESCAPE_RADIUS = 300.0;

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

/**
* Add color bump of certain width and intensity at position to existing base color;
*/
vec3 colorBump(vec3 color, float width, float pos, float intensity, bool wrap, vec3 baseColor, float t) {
	float x = t + width / 2. - pos;

	if(wrap) {
		x = mod(x, 1.);
	}

	x = clamp(x, 0., width);
	x *= PI / width;

	float weight = sin(x) * intensity;

	return mix(baseColor, color, weight);
}

float mandelbrot(vec2 coords, float escapeRadius, int iterations, int gradientType) {
	vec2 c = coords;
	vec2 z = c;
	float outValue = 0.0;

	for(int i = 0; i < iterations; i++) {
		z = cMult(z, z) + c;
		if(length(z) > escapeRadius) {
			switch(gradientType) {
				case GRADIENT_COUNT_ITERATIONS:
					outValue = float(i) / float(iterations);
					break;
				case GRADIENT_CONTINUOUS_ITERATIONS:
					// From here: http://linas.org/art-gallery/escape/escape.html

					// Appease the math overlords
					// z = cMult(z, z) + c;
					// i++;
					// z = cMult(z, z) + c;
					// i++;

					float modulus = sqrt(z.x * z.x + z.y * z.y);
					float mu = float(i) - log(log(modulus)) / log(2.0);
					outValue = mu / float(escapeRadius);
					break;
				case GRADIENT_ESCAPE_RADIUS:
					outValue = (length(z) - escapeRadius) / (escapeRadius * escapeRadius);
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

vec3 colorPalette(float value) {
	vec3 color;

	// value = clamp(value, 0.0, 1.0);

	// value = sqrt(value);

	// vec3 aColor = vec3(0.81, 0.8, 0.59);
	// vec3 bColor = vec3(0.81, 1, 0.4) * 1.0;
	// vec3 cColor = vec3(1.1, 1, 0.0);
	// vec3 dColor = vec3(0.5, 0.65, 0.5);

	// dColor += 0.0;

	// color = genColorPalette(aColor, bColor, cColor, dColor, value);

	vec3 color1 = vec3(0.56, 0.93, 1);
	vec3 color2 = vec3(0.18, 0.44, 1);
	vec3 color3 = vec3(0.06, 0.05, 0.19);
	vec3 color4 = vec3(0.9, 0.9, 1);

	color = color3;

	color = colorBump(color2, 1., 0.5, 1., false, color, value);

	color = mix(color, color1, pow(value, 2.));

	color = colorBump(color4, 0.5, 1., 1., false, color, value);

	// color = colorRamp(colorA, colorB, colorC, 0.01, pow(value, 1. / 1.));

	// color = mix(color, vec3(0), pow(value, 2.0));

	// vec3 colorTemp = vec3(0.77, 0.78, 1);
	// color = mix(color, colorTemp, pow(value, 500.0));

	// color = vec3(value);

	if(value == 0.)
		color = vec3(0);

	return color;
}

void main() {
	vec3 color;

	vec2 coords = (texCoord - Offset) / Scale;

	// float value = mandelbrot(coords, GRADIENT_ESCAPE_RADIUS);
	// value %= mandelbrot(coords, GRADIENT_ESCAPE_ANGLE);
	// value += mandelbrot(coords, GRADIENT_COUNT_ITERATIONS);

	// float value = mandelbrot(coords, SecondaryEscapeRadius, SecondaryIterations, GRADIENT_CONTINUOUS_ITERATIONS);

	float value = mandelbrot(coords, EscapeRadius, Iterations, GRADIENT_CONTINUOUS_ITERATIONS);
	value = pow(value, 1.);

	float gradientValue = mandelbrot(coords, SecondaryEscapeRadius, SecondaryIterations, GRADIENT_ESCAPE_RADIUS);
	// gradientValue = pow(gradientValue, 0.2);
	gradientValue = abs(gradientValue - 0.5) * -2. + 1.;

	value += gradientValue * 0.05;

	// float value = mandelbrot(coords, EscapeRadius, Iterations, GRADIENT_CONTINUOUS_ITERATIONS);

	// value = dFdx(value);

	value = clamp(value, 0., 1.);

	if(screenCoord.y < 0.93) {
		// color = colorPalette(aColor, bColor, cColor, dColor, value);
		color = colorPalette(value);
		// color = vec3(value);

		// color = vec3(dFdx(value), dFdy(value), 0);
	} else {
		color = colorPalette(screenCoord.x);
	}

	// color = vec3(texCoord.x, texCoord.y, 0);

	outColor = vec4(color, 1);
}