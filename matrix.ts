export type Matrix2x2 = number[];

/**
 * Multiply two 2x2 matrices.
 *
 * > This code is so incredibly bad that any italian chef would blush from the
 * sight of this spagetti code, have fun!
 */
export function matrixMult(a: Matrix2x2, b: Matrix2x2): Matrix2x2 {
	let rows: number[][] = [];
	for (let i = 0; i < 2; i++) {
		let rowA = a.slice(i * 2, (i + 1) * 2);
		let row = [
			dotProduct(rowA, [b[0], b[2]]),
			dotProduct(rowA, [b[1], b[3]]),
		];
		rows.push(row);
	}
	let out: number[] = [];
	for (const row of rows) {
		out.push(...row);
	}

	// prettier-ignore
	return out;
}

function dotProduct(a: number[], b: number[]): number {
	let sum = 0;
	for (let i = 0; i < Math.min(a.length, b.length); i++) {
		sum += a[i] * b[i];
	}
	return sum;
}
