const fileSystem = require("fs");

const retrieveInputData = (filePath) => {
    const rawDataLines = fileSystem.readFileSync(filePath, "utf8").trim().split('\n');
    return rawDataLines;
};

(() => {
    const standardInputPath = "/dev/stdin";
    const allInputLines = retrieveInputData(standardInputPath);

    const dimensionTokens = allInputLines[0].split(' ');
    const largeGridDim = Number(dimensionTokens[0]);
    const smallPatternDim = Number(dimensionTokens[1]);

    if (smallPatternDim > largeGridDim) {
        console.log('No');
        return;
    }

    const mainCharacterGrid = allInputLines.slice(1, 1 + largeGridDim).map(lineString => lineString.split(''));
    const subPatternMatrix = allInputLines.slice(1 + largeGridDim, 1 + largeGridDim + smallPatternDim).map(lineString => lineString.split(''));

    let overallMatchDetected = false;

    const maxPossibleRowOffset = largeGridDim - smallPatternDim;
    const maxPossibleColOffset = largeGridDim - smallPatternDim;

    const verifyPatternAtPosition = (startRow, startCol) => {
        if (mainCharacterGrid[startRow][startCol] !== subPatternMatrix[0][0]) {
            return false;
        }

        let currentAttemptIsMatch = true;

        for (let patternRow = 0; patternRow < smallPatternDim; patternRow++) {
            const currentRowInMain = mainCharacterGrid[startRow + patternRow];
            const currentRowInPattern = subPatternMatrix[patternRow];

            for (let patternCol = 0; patternCol < smallPatternDim; patternCol++) {
                if (currentRowInMain[startCol + patternCol] !== currentRowInPattern[patternCol]) {
                    currentAttemptIsMatch = false;
                    break;
                }
            }
            if (!currentAttemptIsMatch) {
                break;
            }
        }
        return currentAttemptIsMatch;
    };

    for (let mainGridRowStart = 0; mainGridRowStart <= maxPossibleRowOffset; mainGridRowStart++) {
        for (let mainGridColStart = 0; mainGridColStart <= maxPossibleColOffset; mainGridColStart++) {
            if (verifyPatternAtPosition(mainGridRowStart, mainGridColStart)) {
                overallMatchDetected = true;
                break;
            }
        }
        if (overallMatchDetected) {
            break;
        }
    }

    if (overallMatchDetected) {
        console.log('Yes');
    } else {
        console.log('No');
    }
})();