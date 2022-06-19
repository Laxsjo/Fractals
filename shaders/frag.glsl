#version 300 es
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision highp float;

// #region Arbitrary precision library
precision highp int;
// From here: https://github.com/alexozer/glsl-arb-prec

/* integers per arbitrary-precision number */
const int pr = 3; // ints per value

/* power of 10 one larger than maximum value per int
   A value of 10000 seems to work the best
   */
const int limit = 10000;

const float limitFlt = float(limit);

int result[pr];

int buffer[pr];

#define zero(x, len) for(int i=0;i<len;i++){x[i]=0;}

void copy(out int[pr] x, int[pr] y) {
	for(int i = 0; i < pr; i++) {
		x[i] = y[i];
	}
}
void assignResult(out int[pr] x) {
	for(int i = 0; i < pr; i++) {
		x[i] = result[i];
	}
}
void negate(inout int[pr] x) {
	for(int i = 0; i < pr; i++) {
		x[i] = -x[i];
	}
}

bool signp(int[pr] a) {
	return (a[pr - 1] >= 0);
}

int keepVal, carry;

void roundOff(int x) {
	carry = x / limit;
	keepVal = x - carry * limit;
}

void add(int[pr] a, int[pr] b, out int[pr] res) {
	bool s1 = signp(a), s2 = signp(b);

	carry = 0;

	for(int i = 0; i < pr - 1; i++) {
		roundOff(a[i] + b[i] + carry);

		if(keepVal < 0) {
			keepVal += limit;
			carry--;
		}

		res[i] = keepVal;
	}
	roundOff(a[pr - 1] + b[pr - 1] + carry);
	res[pr - 1] = keepVal;

	if(s1 != s2 && !signp(res)) {
		negate(res);

		carry = 0;

		for(int i = 0; i < pr; i++) {
			roundOff(res[i] + carry);

			if(keepVal < 0) {
				keepVal += limit;
				carry--;
			}

			res[i] = keepVal;
		}

		negate(res);
	}
}

void mul(int[pr] a, int[pr] b, out int[pr] res) {
	bool toNegate = false;

	if(!signp(a)) {
		negate(a);
		toNegate = !toNegate;
	}
	if(!signp(b)) {
		negate(b);
		toNegate = !toNegate;
	}

	const int lenProd = (pr - 1) * 2 + 1;
	int prod[lenProd];
	zero(prod, lenProd);

	for(int i = 0; i < pr; i++) {
		for(int j = 0; j < pr; j++) {
			prod[i + j] += a[i] * b[j];
		}
	}

	carry = 0;
	const int clip = lenProd - pr;
	for(int i = 0; i < clip; i++) {
		roundOff(prod[i] + carry);
		prod[i] = keepVal;
	}

	if(prod[clip - 1] >= limit / 2) {
		carry++;
	}

	for(int i = clip; i < lenProd; i++) {
		roundOff(prod[i] + carry);
		prod[i] = keepVal;
	}

	for(int i = 0; i < lenProd - clip; i++) {
		res[i] = prod[i + clip];
	}

	if(toNegate) {
		negate(res);
	}
}

void loadFloat(float f, out int[pr] res) {
	for(int i = pr - 1; i >= 0; i--) {
		int fCurr = int(f);
		res[i] = fCurr;
		f -= float(fCurr);
		f *= limitFlt;
	}
}

int[pr] loadFloat(float f) {
	for(int i = pr - 1; i >= 0; i--) {
		int fCurr = int(f);
		result[i] = fCurr;
		f -= float(fCurr);
		f *= limitFlt;
	}

	return result;
}

float unloadFloat(int[pr] a) {
	float fResult = 0.0;
	for(int i = 0; i < pr; i++) {
		fResult /= limitFlt;
		fResult += float(a[i]);
	}

	return fResult;
}
// #endregion

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

void cMultP(int[pr] aR, int[pr] aI, int[pr] bR, int[pr] bI, out int[pr] resR, out int[pr] resI) {
	// vec2 outC;

	mul(aR, bR, resR);
	mul(aI, bI, buffer);
	negate(buffer);
	add(resR, buffer, resR);

	mul(aR, bI, resI);
	mul(aI, bR, buffer);
	add(resI, buffer, resI);

	// outC.x = c1.x * c2.x - c1.y * c2.y;
	// outC.y = c1.x * c2.y + c2.x * c1.y;

	// return outC;
}

void cSqrP(int[pr] xR, int[pr] xI, out int[pr] resR, out int[pr] resI) {
	cMultP(xR, xI, xR, xI, resR, resI);
}

float mandelbrot(int[pr] cR, int[pr] cI) {
// float mandelbrot(vec2 coords) {

	int zR[pr], zI[pr];
	copy(zR, cR);
	copy(zI, cI);

	float outValue = 1.0;
	vec2 z;

	// return unloadFloat(cI);

	// vec2 c;
	// c.x = unloadFloat(cR);
	// c.y = unloadFloat(cI);
	// vec2 z = c;

	// vec2 c = coords;
	// vec2 z = c;
	// float outValue = 1.0;

	for(int i = 0; i < Iterations; i++) {
		cSqrP(zR, zI, zR, zI);
		// cMultP(zR, zI, zR, zI, zR, zI);
		add(zR, cR, zR);
		add(zI, cI, zI);
		z.x = unloadFloat(zR);
		z.y = unloadFloat(zI);
		if(length(z) > ESCAPE_RADIUS) {
			outValue = float(i) / float(Iterations);
			// outValue = (length(z) - ESCAPE_RADIUS) / (ESCAPE_RADIUS);
			break;
		}

		// z = cMult(z, z) + c;
		// if(length(z) > ESCAPE_RADIUS) {
		// 	outValue = float(i) / float(Iterations);
		// 	// outValue = (length(z) - ESCAPE_RADIUS) / (ESCAPE_RADIUS);
		// 	break;
		// }
	}

	return outValue;
}

void main() {

	int coordsX[pr], coordsY[pr], scale[pr];

	scale = loadFloat(1.0 / Scale);

	vec2 coords = texCoord - Offset;

	mul(loadFloat(coords.x), scale, coordsX);
	mul(loadFloat(coords.y), scale, coordsY);
	coords.x = unloadFloat(coordsX);
	coords.y = unloadFloat(coordsY);

	float value = mandelbrot(coordsX, coordsY);
	// float value = mandelbrot(coords);

	// vec2 coords = (texCoord - Offset) / Scale;

	// float value = mandelbrot(coords);

	// loadFloat(value);
	// value = unloadFloat(result);

	// outColor = vec4(dFdx(value), dFdy(value), value, 1);

	outColor = vec4(0, 0, 0, 1) * value;
	// outColor = vec4(coords, 0, 1) * value;
}