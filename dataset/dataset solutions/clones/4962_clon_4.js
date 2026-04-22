const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = fileContent.trim().split('\n');

const gridDimensions = lines[0].split(' ').map(Number);
const rowsCount = gridDimensions[0];
const colsCount = gridDimensions[1];
const dataPointCount = parseInt(lines[1]);
const inputEntries = lines.slice(2);

const parsedGridPoints = inputEntries.map(entry => {
    const parts = entry.split(' ').map(Number);
    return {
        yAxisValue: parts[0], // Original r
        xAxisValue: parts[1], // Original c
        pointValue: parts[2]   // Original a
    };
});

const signalFailureAndExit = () => {
    console.log('No');
    process.exit();
};

const computeEffectiveOffsets = (coordinate, maxDimension, isDimensionTwo, isCoordinateEven) => {
    let slopeRelativePosition;
    let lowerBoundaryOffset;
    let upperBoundaryOffset;

    if (isDimensionTwo) {
        slopeRelativePosition = coordinate - 1;
        lowerBoundaryOffset = coordinate - 1;
        upperBoundaryOffset = maxDimension - coordinate;
    } else {
        if (isCoordinateEven) {
            slopeRelativePosition = (coordinate / 2) - 1;
            lowerBoundaryOffset = (coordinate / 2) - 1;
            upperBoundaryOffset = Math.floor((maxDimension - coordinate) / 2);
        } else { // Coordinate is odd
            slopeRelativePosition = Math.floor(coordinate / 2);
            lowerBoundaryOffset = Math.floor(coordinate / 2);
            upperBoundaryOffset = Math.floor((maxDimension - coordinate) / 2);
        }
    }
    return { slopeRelativePosition, lowerBoundaryOffset, upperBoundaryOffset };
};

const gridPatternObserver = {
    verticalOddAxisRate: null,
    verticalEvenAxisRate: null,
    horizontalOddAxisRate: null,
    horizontalEvenAxisRate: null,

    verticalOddAxisData: new Map(), // Stores c -> [r, a] for odd r
    verticalEvenAxisData: new Map(), // Stores c -> [r, a] for even r
    horizontalOddAxisData: new Map(), // Stores r -> [c, a] for odd c
    horizontalEvenAxisData: new Map(), // Stores r -> [c, a] for even c
};

const analyzeGridPatterns = (sourcePoints, observer) => {
    for (const dataPoint of sourcePoints) {
        const { yAxisValue, xAxisValue, pointValue } = dataPoint;

        // --- Vertical (y-axis/row) consistency checks ---
        const isYDimensionTwo = (rowsCount === 2);
        const yCoordinateIsEven = (yAxisValue % 2 === 0);

        let currentYMap, currentYSlopeKey, mapToIterateForY;
        if (isYDimensionTwo || yCoordinateIsEven) { // Corresponds to map_y_even in original
            currentYMap = observer.verticalEvenAxisData;
            currentYSlopeKey = 'verticalEvenAxisRate';
            if (isYDimensionTwo) mapToIterateForY = observer.verticalEvenAxisData;
            else if (yCoordinateIsEven) mapToIterateForY = observer.verticalOddAxisData; // Matches original's identified 'bug'
            else mapToIterateForY = observer.verticalOddAxisData;
        } else { // yAxisValue is odd and rowsCount > 2. Corresponds to map_y_odd in original
            currentYMap = observer.verticalOddAxisData;
            currentYSlopeKey = 'verticalOddAxisRate';
            mapToIterateForY = observer.verticalOddAxisData;
        }

        if (currentYMap.has(xAxisValue)) {
            const existingData = currentYMap.get(xAxisValue);
            const existingY = existingData[0];
            const existingVal = existingData[1];

            const { slopeRelativePosition: currentYRelativePos } = computeEffectiveOffsets(yAxisValue, rowsCount, isYDimensionTwo, yCoordinateIsEven);
            const { slopeRelativePosition: existingYRelativePos } = computeEffectiveOffsets(existingY, rowsCount, isYDimensionTwo, existingY % 2 === 0);

            let firstVal = pointValue;
            let firstCoord = yAxisValue;
            let secondVal = existingVal;
            let secondCoord = existingY;
            let firstRelativePos = currentYRelativePos;
            let secondRelativePos = existingYRelativePos;

            if (firstCoord > secondCoord) {
                [firstVal, secondVal] = [secondVal, firstVal];
                [firstCoord, secondCoord] = [secondCoord, firstCoord];
                [firstRelativePos, secondRelativePos] = [secondRelativePos, firstRelativePos];
            }
            const calculatedVerticalRate = (firstVal - secondVal) / (secondRelativePos - firstRelativePos);

            if (observer[currentYSlopeKey] === null) {
                observer[currentYSlopeKey] = calculatedVerticalRate;

                for (const [colKey, r_a_pair] of mapToIterateForY.entries()) {
                    const [rToCheck, aToCheck] = r_a_pair;
                    const isCoordEvenForLoopCheck = (currentYSlopeKey === 'verticalEvenAxisRate');
                    const { lowerBoundaryOffset, upperBoundaryOffset } = computeEffectiveOffsets(rToCheck, rowsCount, isYDimensionTwo, isCoordEvenForLoopCheck);
                    if (aToCheck - calculatedVerticalRate * lowerBoundaryOffset < 0 ||
                        aToCheck + calculatedVerticalRate * upperBoundaryOffset < 0) {
                        signalFailureAndExit();
                    }
                }

            } else {
                if (calculatedVerticalRate !== observer[currentYSlopeKey]) {
                    signalFailureAndExit();
                }
            }

            const { lowerBoundaryOffset, upperBoundaryOffset } = computeEffectiveOffsets(yAxisValue, rowsCount, isYDimensionTwo, yCoordinateIsEven);
            if (pointValue - calculatedVerticalRate * lowerBoundaryOffset < 0 ||
                pointValue + calculatedVerticalRate * upperBoundaryOffset < 0) {
                signalFailureAndExit();
            }

        } else {
            currentYMap.set(xAxisValue, [yAxisValue, pointValue]);
        }

        // --- Horizontal (x-axis/column) consistency checks ---
        const isXDimensionTwo = (colsCount === 2);
        const xCoordinateIsEven = (xAxisValue % 2 === 0);

        let currentXMap, currentXSlopeKey, mapToIterateForX;
        if (isXDimensionTwo || xCoordinateIsEven) { // Corresponds to map_x_even in original
            currentXMap = observer.horizontalEvenAxisData;
            currentXSlopeKey = 'horizontalEvenAxisRate';
            mapToIterateForX = observer.horizontalEvenAxisData;
        } else { // xAxisValue is odd and colsCount > 2. Corresponds to map_x_odd in original
            currentXMap = observer.horizontalOddAxisData;
            currentXSlopeKey = 'horizontalOddAxisRate';
            mapToIterateForX = observer.horizontalOddAxisData;
        }

        if (currentXMap.has(yAxisValue)) {
            const existingData = currentXMap.get(yAxisValue);
            const existingX = existingData[0];
            const existingVal = existingData[1];

            const { slopeRelativePosition: currentXRelativePos } = computeEffectiveOffsets(xAxisValue, colsCount, isXDimensionTwo, xCoordinateIsEven);
            const { slopeRelativePosition: existingXRelativePos } = computeEffectiveOffsets(existingX, colsCount, isXDimensionTwo, existingX % 2 === 0);

            let firstVal = pointValue;
            let firstCoord = xAxisValue;
            let secondVal = existingVal;
            let secondCoord = existingX;
            let firstRelativePos = currentXRelativePos;
            let secondRelativePos = existingXRelativePos;

            if (firstCoord > secondCoord) {
                [firstVal, secondVal] = [secondVal, firstVal];
                [firstCoord, secondCoord] = [secondCoord, firstCoord];
                [firstRelativePos, secondRelativePos] = [secondRelativePos, firstRelativePos];
            }
            const calculatedHorizontalRate = (firstVal - secondVal) / (secondRelativePos - firstRelativePos);

            if (observer[currentXSlopeKey] === null) {
                observer[currentXSlopeKey] = calculatedHorizontalRate;

                for (const [rowKey, c_a_pair] of mapToIterateForX.entries()) {
                    const [cToCheck, aToCheck] = c_a_pair;
                    const isCoordEvenForLoopCheck = (currentXSlopeKey === 'horizontalEvenAxisRate');
                    const { lowerBoundaryOffset, upperBoundaryOffset } = computeEffectiveOffsets(cToCheck, colsCount, isXDimensionTwo, isCoordEvenForLoopCheck);
                    if (aToCheck - calculatedHorizontalRate * lowerBoundaryOffset < 0 ||
                        aToCheck + calculatedHorizontalRate * upperBoundaryOffset < 0) {
                        signalFailureAndExit();
                    }
                }

            } else {
                if (calculatedHorizontalRate !== observer[currentXSlopeKey]) {
                    signalFailureAndExit();
                }
            }

            const { lowerBoundaryOffset, upperBoundaryOffset } = computeEffectiveOffsets(xAxisValue, colsCount, isXDimensionTwo, xCoordinateIsEven);
            if (pointValue - calculatedHorizontalRate * lowerBoundaryOffset < 0 ||
                pointValue + calculatedHorizontalRate * upperBoundaryOffset < 0) {
                signalFailureAndExit();
            }

        } else {
            currentXMap.set(yAxisValue, [xAxisValue, pointValue]);
        }
    }
    return true;
};

analyzeGridPatterns(parsedGridPoints, gridPatternObserver);

console.log('Yes');