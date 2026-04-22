const PRIME_MOD = 1000000007;

function extractParams(rawTxt) {
    const lines = rawTxt.split('\n');
    const firstLineData = lines[0].split(' ').map(Number);
    const sequenceData = lines[1].split(' ').map(Number);
    
    return { factor: firstLineData[1], elements: sequenceData };
}

function checkUniformity(collection) {
    if (collection.length === 0) return true;
    return collection.every(item => item === collection[0]);
}

function calculateDisordersAlt(dataArr) {
    return dataArr.flatMap((currentVal, currentIndex) => 
        dataArr.slice(currentIndex + 1).filter(compareVal => currentVal > compareVal)
    ).length;
}

function multiplySquareMatrices(matrixA, matrixB) {
    const resultMatrix = [[0, 0], [0, 0]];
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
            for (let i = 0; i < 2; i++) {
                resultMatrix[row][col] = (resultMatrix[row][col] + matrixA[row][i] * matrixB[i][col]) % PRIME_MOD;
            }
        }
    }
    return resultMatrix;
}

function powerSquareMatrix(baseMatrix, exponent) {
    let identityMatrix = [[1, 0], [0, 1]];
    let currentBase = baseMatrix;
    let power = exponent;

    while (power > 0) {
        if (power % 2 === 1) {
            identityMatrix = multiplySquareMatrices(identityMatrix, currentBase);
        }
        currentBase = multiplySquareMatrices(currentBase, currentBase);
        power = Math.floor(power / 2);
    }
    return identityMatrix;
}

function processData(sourceContent) {
    const parsedData = extractParams(sourceContent);
    const iterationFactor = parsedData.factor;
    const numberSequence = parsedData.elements;

    if (checkUniformity(numberSequence)) {
        console.log("0");
        return;
    }

    const firstInversionCount = calculateDisordersAlt(numberSequence);
    const doubledSequence = numberSequence.concat(numberSequence);
    const secondInversionCount = calculateDisordersAlt(doubledSequence);

    let finalOutcome;

    switch (iterationFactor) {
        case 1:
            finalOutcome = firstInversionCount;
            break;
        case 2:
            finalOutcome = secondInversionCount;
            break;
        default:
            const transformationMatrix = [[0, 1], [1, 2]];
            const poweredMatrix = powerSquareMatrix(transformationMatrix, iterationFactor - 2);

            finalOutcome = (
                poweredMatrix[1][0] * firstInversionCount +
                poweredMatrix[1][1] * secondInversionCount
            ) % PRIME_MOD;
            break;
    }

    console.log(finalOutcome);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));