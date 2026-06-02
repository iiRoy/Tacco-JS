const createInputReader = (rawInputString) => {
    const allInputLines = rawInputString.trim().split('\n');
    let currentLinePointer = 0;
    let currentLineTokens = [];

    const ensureLineTokens = () => {
        if (currentLineTokens.length === 0 && currentLinePointer < allInputLines.length) {
            currentLineTokens = allInputLines[currentLinePointer].split(' ');
        }
    };

    const extractNextToken = (convertToNumber = true) => {
        ensureLineTokens();
        if (currentLineTokens.length === 0) {
            return undefined;
        }
        const tokenValue = currentLineTokens.shift();
        if (currentLineTokens.length === 0) {
            currentLinePointer++;
        }
        return convertToNumber ? Number(tokenValue) : tokenValue;
    };

    const extractLineTokens = (convertToNumbers = true) => {
        if (currentLinePointer >= allInputLines.length) {
            return [];
        }
        const lineContent = allInputLines[currentLinePointer];
        currentLinePointer++;
        currentLineTokens = [];
        const tokens = lineContent.split(' ');
        return convertToNumbers ? tokens.map(Number) : tokens;
    };

    const extractMultiLineMatrix = (lineCount, convertToNumbers = true) => {
        const resultMatrix = [];
        for (let i = 0; i < lineCount; i++) {
            if (currentLinePointer >= allInputLines.length) break;
            const lineContent = allInputLines[currentLinePointer];
            currentLinePointer++;
            resultMatrix.push(convertToNumbers ? lineContent.split(' ').map(Number) : lineContent.split(' '));
        }
        currentLineTokens = [];
        return resultMatrix;
    };

    const extractRawLines = (lineCount, convertToNumbers = true) => {
        const resultLines = [];
        for (let i = 0; i < lineCount; i++) {
            if (currentLinePointer >= allInputLines.length) break;
            const lineContent = allInputLines[currentLinePointer];
            currentLinePointer++;
            resultLines.push(convertToNumbers ? Number(lineContent) : lineContent);
        }
        currentLineTokens = [];
        return resultLines;
    };

    return {
        readSingle: extractNextToken,
        readFullLine: extractLineTokens,
        readMatrix: extractMultiLineMatrix,
        readRaw: extractRawLines
    };
};

const calculateVectorAngle = (xCoord, yCoord) => {
    let angleRadians = Math.atan2(yCoord, xCoord);
    let angleDegrees = angleRadians * 180 / Math.PI;
    return (angleDegrees < 0) ? angleDegrees + 360 : angleDegrees;
};

const performVectorSummation = (inputReaderInstance) => {
    const initialPointQuantity = inputReaderInstance.readSingle();
    const spatialVectors = [];

    Array.from({ length: initialPointQuantity }).forEach(() => {
        const xComponent = inputReaderInstance.readSingle();
        const yComponent = inputReaderInstance.readSingle();
        if (xComponent !== 0 || yComponent !== 0) {
            spatialVectors.push({
                x: xComponent,
                y: yComponent,
                orientation: calculateVectorAngle(xComponent, yComponent)
            });
        }
    });

    const effectiveVectorCount = spatialVectors.length;
    const angularScanResolution = 10000;

    const maximumSquaredResult = Array.from({ length: angularScanResolution }, (_, scanIndex) => {
        const currentObservationAngle = (scanIndex + 0.5) / angularScanResolution * 360;
        const currentObservationAngleRad = currentObservationAngle * Math.PI / 180;

        const { totalX, totalY } = spatialVectors.reduce((accumulator, currentVector) => {
            const vectorOrientationRad = currentVector.orientation * Math.PI / 180;
            if (Math.cos(vectorOrientationRad - currentObservationAngleRad) > 0) {
                accumulator.totalX += currentVector.x;
                accumulator.totalY += currentVector.y;
            }
            return accumulator;
        }, { totalX: 0, totalY: 0 });

        return totalX * totalX + totalY * totalY;
    }).reduce((maxVal, currentVal) => Math.max(maxVal, currentVal), 0);

    return Math.sqrt(maximumSquaredResult);
};

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
const dataProcessor = createInputReader(inputSource);
console.log(performVectorSummation(dataProcessor));
