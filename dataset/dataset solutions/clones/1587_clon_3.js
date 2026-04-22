const fileSystemInterface = require('fs');

const standardInputSource = '/dev/stdin';

const retrieveAndProcessNumericalData = (sourceFilePath) => {
    try {
        let rawFileContent = fileSystemInterface.readFileSync(sourceFilePath, 'utf8');

        if (!rawFileContent.trim()) {
            console.error("Error: The provided input file is empty or contains no meaningful data.");
            process.exit(1);
        }

        const contentLines = rawFileContent.split('\n').filter(lineSegment => lineSegment.trim() !== '');
        const stringTokens = contentLines.flatMap(lineSegment => lineSegment.split(' '));
        
        const meaningfulStringTokens = stringTokens.filter(token => token.trim() !== '');

        const numericalValues = meaningfulStringTokens.map(strVal => {
            const numericEquivalent = Number(strVal);
            if (isNaN(numericEquivalent)) {
                console.error(`Input Data Error: Non-numeric value '${strVal}' found where a number was expected.`);
                process.exit(1);
            }
            return numericEquivalent;
        });

        return numericalValues;

    } catch (operationError) {
        console.error(`Critical Error during input processing: ${operationError.message}`);
        process.exit(1);
    }
};

let processedInputStream = retrieveAndProcessNumericalData(standardInputSource);

if (processedInputStream.length < 2) {
    console.error("Configuration Error: Insufficient numerical data to define grid dimensions (expected at least 2 values).");
    process.exit(1);
}

const totalGridRows = processedInputStream[0];
const totalGridColumns = processedInputStream[1];
const flatCoordinateData = processedInputStream.slice(2);

const occupiedCellRegistry = new Set();
const allOccupiedCoordinates = [];

if (flatCoordinateData.length % 2 !== 0) {
    console.error("Data Format Error: The list of coordinates contains an odd number of values, implying an incomplete pair.");
    process.exit(1);
}

for (let coordSegmentIndex = 0; coordSegmentIndex < flatCoordinateData.length; coordSegmentIndex += 2) {
    const currentCellRow = flatCoordinateData[coordSegmentIndex];
    const currentCellColumn = flatCoordinateData[coordSegmentIndex + 1];

    if (currentCellRow < 1 || currentCellRow > totalGridRows || currentCellColumn < 1 || currentCellColumn > totalGridColumns) {
        console.error(`Bounds Error: Coordinate [${currentCellRow}, ${currentCellColumn}] is outside the expected grid range of ${totalGridRows}x${totalGridColumns}.`);
        process.exit(1);
    }

    occupiedCellRegistry.add(`${currentCellRow},${currentCellColumn}`);
    allOccupiedCoordinates.push([currentCellRow, currentCellColumn]);
}

let rowObservationCounts = Array.from({ length: totalGridRows }, () => 0);
let colObservationCounts = Array.from({ length: totalGridColumns }, () => 0);

allOccupiedCoordinates.forEach( (cellPair) => {
    const zeroBasedRow = cellPair[0] - 1;
    const zeroBasedCol = cellPair[1] - 1;
    
    if (zeroBasedRow >= 0 && zeroBasedRow < totalGridRows) {
        rowObservationCounts[zeroBasedRow]++;
    } else {
        console.warn(`Warning: Encountered an out-of-bounds row index (${zeroBasedRow + 1}) during frequency calculation. This should have been caught earlier.`);
    }
    
    if (zeroBasedCol >= 0 && zeroBasedCol < totalGridColumns) {
        colObservationCounts[zeroBasedCol]++;
    } else {
        console.warn(`Warning: Encountered an out-of-bounds column index (${zeroBasedCol + 1}) during frequency calculation. This should have been caught earlier.`);
    }
});

const determinePeakFrequenciesAndPositions = (frequencyArray, totalDimension) => {
    if (frequencyArray.length === 0) {
        return { maxValue: 0, indices: [] };
    }
    
    let maxValueFound = -1;
    for (const currentCount of frequencyArray) {
        if (currentCount > maxValueFound) {
            maxValueFound = currentCount;
        }
    }

    const peakPositions = [];
    for (let dimensionIndex = 0; dimensionIndex < totalDimension; dimensionIndex++) {
        if (frequencyArray[dimensionIndex] === maxValueFound) {
            peakPositions.push(dimensionIndex);
        }
    }
    return { maxValue: maxValueFound, indices: peakPositions };
};

const { maxValue: highestRowObservationCount, indices: optimalRowIndices } = 
    determinePeakFrequenciesAndPositions(rowObservationCounts, totalGridRows);

const { maxValue: highestColObservationCount, indices: optimalColIndices } = 
    determinePeakFrequenciesAndPositions(colObservationCounts, totalGridColumns);

const isGridCellOccupied = (rowNumber, colNumber) => occupiedCellRegistry.has(`${rowNumber},${colNumber}`);

let potentialOptimalIntersectionFound = false;
let calculatedFinalScore = 0;

optimalRowIndices.forEach( (currentOptimalRowIdx) => {
    if (potentialOptimalIntersectionFound) return; 
    
    optimalColIndices.forEach( (currentOptimalColIdx) => {
        if (potentialOptimalIntersectionFound) return;

        const oneBasedRowCoordinate = currentOptimalRowIdx + 1;
        const oneBasedColCoordinate = currentOptimalColIdx + 1;

        if (!isGridCellOccupied(oneBasedRowCoordinate, oneBasedColCoordinate)) {
            calculatedFinalScore = highestRowObservationCount + highestColObservationCount;
            potentialOptimalIntersectionFound = true;
        }
    });
});

if (potentialOptimalIntersectionFound) {
    console.log(calculatedFinalScore);
} else {
    console.log(highestRowObservationCount + highestColObservationCount - 1);
}