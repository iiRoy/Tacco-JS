let collectedInputLines = [];

const standardInputOutput = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

standardInputOutput.on('line', (currentInputLine) => {
    collectedInputLines.push(currentInputLine);
});

standardInputOutput.on('close', () => {
    processAllData(collectedInputLines);
});

function processAllData(allLines) {
    const dimensionValues = allLines[0].split(' ').map(Number);
    const primaryRowCount = dimensionValues[0]; // N
    const sharedDimension = dimensionValues[1]; // M
    const secondaryRowCount = dimensionValues[2]; // L

    const firstMatrixData = Array.from({ length: primaryRowCount }, (_, rowIndex) =>
        allLines[rowIndex + 1].split(' ').map(Number)
    );

    // Replicate the original's matrix B parsing behavior
    // The original code initializes `b` as L rows, M columns.
    // It then populates it via `b[k][stepb] = ary[k];`
    // where `k` iterates 0 to M-1, and `stepb` iterates 0 to L-1.
    // This access pattern means `b[row_index][col_index]` where `row_index` is `k` and `col_index` is `stepb`.
    // For this to not throw an error:
    // 1. `row_index` (k) must be less than the number of rows in `b` (L). So M <= L.
    // 2. `col_index` (stepb) must be less than the number of columns in each row of `b` (M). So L <= M.
    // Therefore, the original code only runs without error if L == M.
    // If L != M, it will throw an out-of-bounds error during population.
    // This clone replicates that exact behavior.
    const secondMatrixData = Array.from({ length: secondaryRowCount }, () => Array(sharedDimension).fill(0));

    for (let currentColumnIndex = 0; currentColumnIndex < secondaryRowCount; currentColumnIndex++) {
        const lineValues = allLines[primaryRowCount + 1 + currentColumnIndex].split(' ');
        for (let k = 0; k < sharedDimension; k++) {
            // This line replicates the original's potentially problematic indexing
            // It will throw an error if currentColumnIndex >= sharedDimension (L >= M)
            // or if k >= secondaryRowCount (M >= L)
            secondMatrixData[k][currentColumnIndex] = Number(lineValues[k]);
        }
    }

    const calculatedOutcome = performMatrixOperation(firstMatrixData, secondMatrixData, sharedDimension);

    calculatedOutcome.forEach(row => {
        console.log(row.join(' '));
    });
}

function performMatrixOperation(operandAlpha, operandBeta, commonLength) {
    const alphaRows = operandAlpha.length;
    const betaRows = operandBeta.length; // This is L from original

    return Array.from({ length: alphaRows }, (_, alphaRowIndex) => {
        return Array.from({ length: betaRows }, (_, betaRowIndex) => {
            // This computes the dot product of `operandAlpha[alphaRowIndex]` and `operandBeta[betaRowIndex]`
            // The `inner_product` function in the original uses the global `m` (commonLength)
            // to define the length of the vectors for dot product.
            return Array.from({ length: commonLength }, (_, elementIndex) =>
                operandAlpha[alphaRowIndex][elementIndex] * operandBeta[betaRowIndex][elementIndex]
            ).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        });
    });
}