const MATRIX_DIMENSION = 3;

function parseNumericLine(lineContent) {
    if (!lineContent || lineContent.trim() === '') {
        throw new Error("Encountered an empty line or line with only whitespace during input parsing.");
    }
    const numbers = lineContent.split(' ').map(str => {
        const parsedNum = parseInt(str, 10);
        if (isNaN(parsedNum)) {
            throw new Error(`Invalid numeric format found: '${str}'. All input elements must be integers.`);
        }
        return parsedNum;
    });
    if (numbers.length !== MATRIX_DIMENSION) {
        throw new Error(`Expected ${MATRIX_DIMENSION} integer values per line, but found ${numbers.length}.`);
    }
    return numbers;
}

(function mainExecutionBlock() {
    let rawInputLines;
    try {
        const fileSystemModule = require('fs');
        const standardInputPath = '/dev/stdin';
        const rawDataBuffer = fileSystemModule.readFileSync(standardInputPath, 'utf8');
        
        rawInputLines = rawDataBuffer
            .split('\n')
            .filter(line => line.trim() !== ''); // Remove any completely blank lines
    } catch (ioError) {
        console.error(`Error during input file reading: ${ioError.message}`);
        process.exit(1);
    }

    if (rawInputLines.length !== MATRIX_DIMENSION) {
        console.error(`Input format error: Expected ${MATRIX_DIMENSION} lines for a square matrix, but received ${rawInputLines.length}.`);
        process.exit(1);
    }

    let processedMatrix;
    try {
        processedMatrix = rawInputLines.map(parseNumericLine);
    } catch (parsingError) {
        console.error(`Data parsing failed: ${parsingError.message}`);
        process.exit(1);
    }

    const rowMinimumsArray = new Array(MATRIX_DIMENSION);
    for (let r = 0; r < MATRIX_DIMENSION; r++) {
        let currentMin = Infinity;
        for (let c = 0; c < MATRIX_DIMENSION; c++) {
            currentMin = Math.min(currentMin, processedMatrix[r][c]);
        }
        rowMinimumsArray[r] = currentMin;
    }

    const columnMinimumsArray = new Array(MATRIX_DIMENSION);
    for (let c = 0; c < MATRIX_DIMENSION; c++) {
        let currentMin = Infinity;
        for (let r = 0; r < MATRIX_DIMENSION; r++) {
            currentMin = Math.min(currentMin, processedMatrix[r][c]);
        }
        columnMinimumsArray[c] = currentMin;
    }

    let isConsistentAdditive = true;

    matrixVerificationLoop:
    for (let rIndex = 0; rIndex < MATRIX_DIMENSION; rIndex++) {
        for (let cIndex = 0; cIndex < MATRIX_DIMENSION; cIndex++) {
            const expectedValue = rowMinimumsArray[rIndex] + columnMinimumsArray[cIndex];
            const actualCellData = processedMatrix[rIndex][cIndex];

            if (actualCellData !== expectedValue) {
                isConsistentAdditive = false;
                break matrixVerificationLoop; 
            }
        }
    }

    const finalDecision = isConsistentAdditive ? 'Yes' : 'No';
    console.log(finalDecision);

})();