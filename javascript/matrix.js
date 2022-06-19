/**
 * Multiply two 2x2 matrices.
 *
 * > This code is so incredibly bad that any italian chef would blush from the
 * sight of this spagetti code, have fun!
 */
export function matrixMult(a, b) {
    let rows = [];
    for (let i = 0; i < 2; i++) {
        let rowA = a.slice(i * 2, (i + 1) * 2);
        let row = [
            dotProduct(rowA, [b[0], b[2]]),
            dotProduct(rowA, [b[1], b[3]]),
        ];
        rows.push(row);
    }
    let out = [];
    for (const row of rows) {
        out.push(...row);
    }
    // prettier-ignore
    return out;
}
function dotProduct(a, b) {
    let sum = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        sum += a[i] * b[i];
    }
    return sum;
}
//# sourceMappingURL=matrix.js.map