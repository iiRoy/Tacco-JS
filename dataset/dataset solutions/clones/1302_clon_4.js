Object.defineProperties(Array.prototype, {
    pInt: {
        value() {
            return this.map(Number);
        },
    },
    rot: {
        value() {
            if (!this.length || !this[0].length) {
                return [];
            }
            const originalRows = this.length;
            const originalCols = this[0].length;
            return Array.from({ length: originalCols }, (_, colIndex) =>
                Array.from({ length: originalRows }, (_, rowIndex) => this[rowIndex][colIndex])
            );
        }
    }
});
((inputString) => {
    const inputLines = inputString.trim().split('\n');
    const [rowsA, commonDim, colsB] = inputLines[0].split(' ').pInt();

    const dataRows = inputLines.slice(1);
    const matA = dataRows.slice(0, rowsA).map(line => line.split(' ').pInt());
    const matB = dataRows.slice(rowsA).map(line => line.split(' ').pInt());

    const transposedMatB = matB.rot();

    const finalMatrix = matA.map(rowA =>
        transposedMatB.map(colB =>
            rowA.reduce((sum, valA, idx) => sum + valA * colB[idx], 0)
        )
    );

    console.log(finalMatrix.map(row => row.join(' ')).join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
