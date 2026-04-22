let inputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    inputBuffer += chunk;
});

process.stdin.on('end', function() {
    processSourceData(inputBuffer);
});

function processSourceData(entireInput) {
    const sourceLines = entireInput.trim().split('\n');
    let linePointer = 0;

    const matrixDimensions = sourceLines[linePointer++].split(' ').map(Number);
    const alphaRows = matrixDimensions[0];
    const alphaCols = matrixDimensions[1];
    const betaRows = matrixDimensions[2];

    const alphaMatrix = [];
    for (let idx = 0; idx < alphaRows; idx++) {
        alphaMatrix.push(sourceLines[linePointer++].split(' ').map(Number));
    }

    const betaColumnInputs = [];
    for (let idx = 0; idx < alphaCols; idx++) {
        betaColumnInputs.push(sourceLines[linePointer++].split(' ').map(Number));
    }

    const betaMatrix = Array.from({ length: betaRows }, () => Array(alphaCols).fill(0));
    for (let colIdx = 0; colIdx < alphaCols; colIdx++) {
        for (let rowIdx = 0; rowIdx < betaRows; rowIdx++) {
            betaMatrix[rowIdx][colIdx] = betaColumnInputs[colIdx][rowIdx];
        }
    }

    const finalProduct = alphaMatrix.map(function(currentAlphaRow) {
        return betaMatrix.map(function(currentBetaRow) {
            return computeDotProduct(currentAlphaRow, currentBetaRow, alphaCols);
        });
    });

    const formattedOutput = finalProduct.map(function(row) {
        return row.join(' ');
    });

    console.log(formattedOutput.join('\n'));
}

function computeDotProduct(vectorA, vectorB, lengthOfVectors) {
    let summation = 0;
    for (let elementIdx = 0; elementIdx < lengthOfVectors; elementIdx++) {
        summation += vectorA[elementIdx] * vectorB[elementIdx];
    }
    return summation;
}