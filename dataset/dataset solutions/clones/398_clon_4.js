const numericalConversion = (val) => +val;

const systemFileAccessor = {
    retrieveContent: (pathIdentifier, encodingFormat) => {
        return require('fs').readFileSync(pathIdentifier, encodingFormat);
    }
};

const consoleOutput = {
    publishResult: (messageContent) => console.log(messageContent)
};

const determinePathLength = (dataGrid, gridBoundary, currentYCoordinate, currentXCoordinate, yDisplacement, xDisplacement, currentAccumulation) => {
    if (currentYCoordinate < 0 || currentXCoordinate < 0 || currentYCoordinate >= gridBoundary || currentXCoordinate >= gridBoundary) {
        return currentAccumulation;
    }
    if (dataGrid[currentYCoordinate][currentXCoordinate] !== 1) {
        return currentAccumulation;
    }
    return determinePathLength(dataGrid, gridBoundary, currentYCoordinate + yDisplacement, currentXCoordinate + xDisplacement, yDisplacement, xDisplacement, currentAccumulation + 1);
};

const selectMaximum = (valueA, valueB) => valueA > valueB ? valueA : valueB;

const processMatrixBlock = (inputLineSet) => {
    const firstLine = inputLineSet.shift();
    if (firstLine === undefined) {
        return { dimensionIndicator: 0, remainingInputLines: [] };
    }
    const matrixDimension = numericalConversion(firstLine);

    if (matrixDimension === 0) {
        return { dimensionIndicator: 0, remainingInputLines: inputLineSet };
    }

    const gridStructure = inputLineSet
        .splice(0, matrixDimension)
        .map(rowString => rowString.split('').map(numericalConversion));

    const movementDirections = [
        { yStep: 0, xStep: 1 },
        { yStep: 1, xStep: -1 },
        { yStep: 1, xStep: 0 },
        { yStep: 1, xStep: 1 }
    ];

    const allCalculatedLengths = gridStructure.flatMap((rowElements, rowIndex) =>
        rowElements.flatMap((cellElement, colIndex) => {
            if (cellElement === 1) {
                return movementDirections.map(direction =>
                    determinePathLength(gridStructure, matrixDimension, rowIndex, colIndex, direction.yStep, direction.xStep, 0)
                );
            }
            return [];
        })
    );

    const overallHighestValue = allCalculatedLengths.reduce(selectMaximum, 0);

    consoleOutput.publishResult(overallHighestValue);

    return { dimensionIndicator: matrixDimension, remainingInputLines: inputLineSet };
};

const executeBatchProcessing = (allRawLines) => {
    const processingResult = processMatrixBlock(allRawLines);
    if (processingResult.dimensionIndicator !== 0) {
        executeBatchProcessing(processingResult.remainingInputLines);
    }
};

const fileContents = systemFileAccessor.retrieveContent('/dev/stdin', 'utf8');
const initialProcessedLines = fileContents.trim().split('\n');

executeBatchProcessing(initialProcessedLines);