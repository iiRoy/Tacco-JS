const obtainSourceData = (textualData) => {
    let currentLines = textualData.trim().split("\n");
    let linePointer = 0;

    const fetchNextValue = (asString = false) => {
        let currentLine = currentLines[linePointer];
        if (typeof currentLine === "string") {
            currentLines[linePointer] = currentLine.split(" ").reverse();
        }
        let fetched = currentLines[linePointer].pop();
        if (!currentLines[linePointer].length) {
            linePointer++;
        }
        return asString ? fetched : Number(fetched);
    };

    const fetchNextBigValue = () => BigInt(fetchNextValue());

    const fetchLineValues = (asStrings = false) => {
        let values = currentLines[linePointer++].split(" ");
        return asStrings ? values : values.map(val => Number(val));
    };

    const fetchLineBigValues = () => fetchLineValues().map(val => BigInt(val));

    const fetchMatrixValues = (count, asStrings = false) => {
        let result = currentLines.slice(linePointer, linePointer + count).map(l => l.split(" "));
        linePointer += count;
        return asStrings ? result : result.map(row => row.map(v => Number(v)));
    };

    const fetchBigMatrixValues = (count) => fetchMatrixValues(count).map(row => row.map(v => BigInt(v)));

    const fetchRawLines = (count, asStrings = false) => {
        let result = currentLines.slice(linePointer, linePointer + count);
        linePointer += count;
        return asStrings ? result : result.map(l => Number(l));
    };
    
    const fetchRawBigLines = (count) => fetchRawLines(count).map(l => BigInt(l));

    return {
        next: fetchNextValue,
        nextBI: fetchNextBigValue,
        line: fetchLineValues,
        lineBI: fetchLineBigValues,
        matrix: fetchMatrixValues,
        matrixBI: fetchBigMatrixValues,
        raw: fetchRawLines,
        rawBI: fetchRawBigLines
    };
};

const constructMultiDimArray = (dimensions, initializer) => {
    const createDim = (dims, currentDimIdx) => {
        if (currentDimIdx === dims.length - 1) {
            return Array(dims[currentDimIdx]).fill(0).map(() => initializer());
        } else {
            return Array(dims[currentDimIdx]).fill(0).map(() => createDim(dims, currentDimIdx + 1));
        }
    };
    return createDim(dimensions, 0);
};

let currentModulus;

const bigIntModMultiply = (factor1, factor2) => {
    return (BigInt(factor1) * BigInt(factor2)) % currentModulus;
};

const bigIntModExp = (base, exponent) => {
    let res = 1n;
    let currentBase = BigInt(base);
    let currentExp = BigInt(exponent);

    currentBase %= currentModulus;
    while (currentExp > 0n) {
        if (currentExp % 2n === 1n) {
            res = (res * currentBase) % currentModulus;
        }
        currentBase = (currentBase * currentBase) % currentModulus;
        currentExp /= 2n;
    }
    return res;
};

const multiplyBigIntMatrices = (matrixOne, matrixTwo) => {
    const rowsOne = matrixOne.length;
    const colsOne = matrixOne[0].length;
    const rowsTwo = matrixTwo.length;
    const colsTwo = matrixTwo[0].length;

    if (colsOne !== rowsTwo) {
        throw new Error("Matrix dimensions mismatch for multiplication");
    }

    const resultMatrix = constructMultiDimArray([rowsOne, colsTwo], () => 0n);

    for (let r1 = 0; r1 < rowsOne; r1++) {
        for (let c2 = 0; c2 < colsTwo; c2++) {
            for (let c1 = 0; c1 < colsOne; c1++) {
                resultMatrix[r1][c2] = (resultMatrix[r1][c2] + bigIntModMultiply(matrixOne[r1][c1], matrixTwo[c1][c2])) % currentModulus;
            }
        }
    }
    return resultMatrix;
};

const exponentiateBigIntMatrix = (baseMatrix, powerValue) => {
    const dim = baseMatrix.length;
    let identityMatrix = constructMultiDimArray([dim, dim], () => 0n);
    for (let i = 0; i < dim; i++) {
        identityMatrix[i][i] = 1n;
    }

    let currentResult = identityMatrix;
    let currentBase = baseMatrix;
    let currentPower = BigInt(powerValue);

    while (currentPower > 0n) {
        if (currentPower % 2n === 1n) {
            currentResult = multiplyBigIntMatrices(currentResult, currentBase);
        }
        currentBase = multiplyBigIntMatrices(currentBase, currentBase);
        currentPower /= 2n;
    }
    return currentResult;
};

const computeSequenceValue = () => {
    const dataParser = obtainSourceData(require("fs").readFileSync("/dev/stdin", "utf8"));

    const lengthLimit = dataParser.nextBI();
    const startOffset = dataParser.nextBI();
    const endOffset = dataParser.nextBI();
    currentModulus = dataParser.nextBI();

    const segmentDurations = constructMultiDimArray([19], () => 0n); 
    let finalTransformation = [[0n, 0n, endOffset % currentModulus]];
    let currentAccumulatedLength = 0n;

    for (let intervalIdx = 1; intervalIdx < 19; intervalIdx++) {
        const intervalBoundary = (10n ** BigInt(intervalIdx)) - 1n;

        let calculatedDuration = (intervalBoundary - startOffset + endOffset) / endOffset - currentAccumulatedLength;

        if (calculatedDuration <= 0n) {
            continue;
        }

        if (currentAccumulatedLength + calculatedDuration > lengthLimit) {
            calculatedDuration = lengthLimit - currentAccumulatedLength;
        }
        
        if (calculatedDuration <= 0n) {
            continue;
        }

        const transitionMatrix = exponentiateBigIntMatrix(
            [[bigIntModExp(10n, BigInt(intervalIdx)), 0n, 0n],
             [1n, 1n, 0n],
             [0n, 1n, 1n]],
            calculatedDuration
        );

        finalTransformation[0][1] = (endOffset * currentAccumulatedLength + startOffset) % currentModulus;
        
        finalTransformation = multiplyBigIntMatrices(finalTransformation, transitionMatrix);
        currentAccumulatedLength += calculatedDuration;
        
        if (currentAccumulatedLength >= lengthLimit) {
            break;
        }
    }
    return Number(finalTransformation[0][0]);
};

console.log(computeSequenceValue());