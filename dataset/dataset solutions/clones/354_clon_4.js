const acquireSourceInformation = (sourceIdentifier) => {
    return require('fs').readFileSync(sourceIdentifier, 'utf8');
};

const parseInputData = (rawTextContent) => {
    const allLines = rawTextContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const processedCases = [];
    let currentLineIndex = 0;

    while (true) {
        const sizeDescriptor = allLines[currentLineIndex++].split(' ').map(Number);
        const dimensionY = sizeDescriptor[0];
        const dimensionX = sizeDescriptor[1];

        if (dimensionY === 0 && dimensionX === 0) {
            break;
        }

        const characterMatrix = [];
        for (let rowIdx = 0; rowIdx < dimensionY; rowIdx++) {
            characterMatrix.push(allLines[currentLineIndex++].split(''));
        }
        processedCases.push({ verticalSize: dimensionY, horizontalSize: dimensionX, visualRepresentation: characterMatrix });
    }
    return processedCases;
};

const analyzeGridForLargestBlock = (caseDetails) => {
    const columnContinuityHeights = [];
    const matrixHeight = caseDetails.verticalSize;
    const matrixWidth = caseDetails.horizontalSize;
    const inputMatrix = caseDetails.visualRepresentation;

    for (let r = 0; r < matrixHeight; r++) {
        columnContinuityHeights[r] = [];
        for (let c = 0; c < matrixWidth; c++) {
            if (inputMatrix[r][c] === '.') {
                columnContinuityHeights[r][c] = (r === 0) ? 1 : columnContinuityHeights[r - 1][c] + 1;
            } else {
                columnContinuityHeights[r][c] = 0;
            }
        }
    }

    let overallMaximumExtent = 0;

    const findMaximalSubArea = (heightProfile, startIndex, endIndex) => {
        if (startIndex > endIndex) {
            return 0;
        }
        if (startIndex === endIndex) {
            return heightProfile[startIndex];
        }

        let minimumBarValue = heightProfile[startIndex];
        let minimumBarIndex = startIndex;
        for (let j = startIndex + 1; j <= endIndex; j++) {
            if (heightProfile[j] < minimumBarValue) {
                minimumBarValue = heightProfile[j];
                minimumBarIndex = j;
            }
        }

        const areaConsideringMinimum = minimumBarValue * (endIndex - startIndex + 1);
        const areaOnLeft = findMaximalSubArea(heightProfile, startIndex, minimumBarIndex - 1);
        const areaOnRight = findMaximalSubArea(heightProfile, minimumBarIndex + 1, endIndex);

        return Math.max(areaConsideringMinimum, areaOnLeft, areaOnRight);
    };

    for (let r = 0; r < matrixHeight; r++) {
        overallMaximumExtent = Math.max(overallMaximumExtent, findMaximalSubArea(columnContinuityHeights[r], 0, matrixWidth - 1));
    }

    return overallMaximumExtent;
};

const systemInput = acquireSourceInformation('/dev/stdin');
const allProcessedScenarios = parseInputData(systemInput);

for (const individualScenario of allProcessedScenarios) {
    const computedResult = analyzeGridForLargestBlock(individualScenario);
    console.log(computedResult);
}