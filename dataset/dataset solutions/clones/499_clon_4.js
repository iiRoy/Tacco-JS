const matrixVectorCalculation = (qtmFstX, qtmFstY, qtmFstZ, qtmFstS, qtmSndX, qtmSndY, qtmSndZ, qtmSndS) => {
    const sVal1 = qtmFstS;
    const iVal1 = qtmFstX;
    const jVal1 = qtmFstY;
    const kVal1 = qtmFstZ;

    const sVal2 = qtmSndS;
    const iVal2 = qtmSndX;
    const jVal2 = qtmSndY;
    const kVal2 = qtmSndZ;

    const multMatrix = [
        [sVal1, -iVal1, -jVal1, -kVal1],
        [iVal1, sVal1, -kVal1, jVal1],
        [jVal1, kVal1, sVal1, -iVal1],
        [kVal1, -jVal1, iVal1, sVal1]
    ];

    const operandVector = [sVal2, iVal2, jVal2, kVal2];

    const scalarOutcome = multMatrix[0][0] * operandVector[0] + multMatrix[0][1] * operandVector[1] + multMatrix[0][2] * operandVector[2] + multMatrix[0][3] * operandVector[3];
    const iComponentOutcome = multMatrix[1][0] * operandVector[0] + multMatrix[1][1] * operandVector[1] + multMatrix[1][2] * operandVector[2] + multMatrix[1][3] * operandVector[3];
    const jComponentOutcome = multMatrix[2][0] * operandVector[0] + multMatrix[2][1] * operandVector[1] + multMatrix[2][2] * operandVector[2] + multMatrix[2][3] * operandVector[3];
    const kComponentOutcome = multMatrix[3][0] * operandVector[0] + multMatrix[3][1] * operandVector[1] + multMatrix[3][2] * operandVector[2] + multMatrix[3][3] * operandVector[3];

    const finalOutputArr = [
        -scalarOutcome,
        kComponentOutcome,
        jComponentOutcome,
        iComponentOutcome
    ];

    return finalOutputArr;
};

const acquireDataContent = (() => {
    const bufferSize = 1024 * 1024;
    let accumulatedBuffer = Buffer.alloc(0);
    let bytesTransferred;
    const coreIO = globalThis.process.binding('fs');

    do {
        const tempSegment = Buffer.alloc(bufferSize);
        bytesTransferred = coreIO.read(0, tempSegment, 0, bufferSize);
        if (bytesTransferred > 0) {
            accumulatedBuffer = Buffer.concat([accumulatedBuffer, tempSegment.slice(0, bytesTransferred)]);
        }
    } while (bytesTransferred === bufferSize);
    return accumulatedBuffer.toString('utf8');
})();

const sanitizeAndSplit = (sourceString) => {
    let frontTrim = 0;
    while (frontTrim < sourceString.length && /\s/.test(sourceString[frontTrim])) {
        frontTrim++;
    }
    let backTrim = sourceString.length - 1;
    while (backTrim >= frontTrim && /\s/.test(sourceString[backTrim])) {
        backTrim--;
    }
    const trimmedSource = sourceString.substring(frontTrim, backTrim + 1);

    const separatedLines = [];
    let lineStart = 0;
    for (let currentPointer = 0; currentPointer < trimmedSource.length; currentPointer++) {
        if (trimmedSource[currentPointer] === '\n') {
            separatedLines.push(trimmedSource.substring(lineStart, currentPointer));
            lineStart = currentPointer + 1;
        }
    }
    if (lineStart < trimmedSource.length) {
        separatedLines.push(trimmedSource.substring(lineStart, trimmedSource.length));
    }
    return separatedLines;
};

const numericalSequenceParser = (textSegment) => {
    const numbersList = [];
    let currentNumberString = '';
    for (const charUnit of textSegment) {
        if (charUnit === ' ') {
            if (currentNumberString !== '') {
                numbersList.push(parseFloat(currentNumberString));
                currentNumberString = '';
            }
        } else {
            currentNumberString += charUnit;
        }
    }
    if (currentNumberString !== '') {
        numbersList.push(parseFloat(currentNumberString));
    }
    return numbersList;
};

const processedInputLines = sanitizeAndSplit(acquireDataContent);

let currentIndex = 0;
const totalIterations = parseFloat(processedInputLines[currentIndex++]);
let loopCounter = 0;

while (loopCounter < totalIterations) {
    const dataLineToProcess = processedInputLines[currentIndex++];
    if (parseFloat(dataLineToProcess) === 0) break;
    
    const parsedValues = numericalSequenceParser(dataLineToProcess);
    
    const calculationResult = matrixVectorCalculation(...parsedValues);
    
    let outputLine = '';
    for (let idx = 0; idx < calculationResult.length; idx++) {
        outputLine += calculationResult[idx].toString();
        if (idx < calculationResult.length - 1) {
            outputLine += ' ';
        }
    }
    process.stdout.write(outputLine + '\n');
    loopCounter++;
}