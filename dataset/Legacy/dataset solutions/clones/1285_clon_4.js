function processData(rawData) {
    const lines = rawData.split('\n');

    const [numRowsAStr, numColsAStr] = lines[0].split(' ');
    const numRowsA = Number(numRowsAStr);
    const numColsA = Number(numColsAStr);

    const matrixALines = lines.slice(1, 1 + numRowsA);
    const matrixBLines = lines.slice(1 + numRowsA, 1 + numRowsA + numColsA);

    const matrixAData = matrixALines.map(line =>
        line.split(' ').map(Number)
    );

    const matrixBData = matrixBLines.map(line =>
        line.split(' ').map(Number)
    );

    Array.from({ length: numRowsA }, (_, rowIdx) => {
        const currentRowA = matrixAData[rowIdx];

        return Array.from({ length: numColsA }, (_, colIdx) => {
            return currentRowA[colIdx] * matrixBData[colIdx][0];
        }).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    }).forEach(productSum => console.log(productSum));
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
