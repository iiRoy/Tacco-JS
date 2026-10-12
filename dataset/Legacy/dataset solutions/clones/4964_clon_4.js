'use strict';
const dataAcquisition = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const dimensions = dataAcquisition[0].split(' ').map(Number);
const totalRows = dimensions[0];
const totalCols = dimensions[1];
const pointCount = parseInt(dataAcquisition[1]);
const coordinateValuePairs = dataAcquisition.slice(2);

// Centralized registry for consistency data across different line types
const lineConsistencyData = {
    rowEven: { delta: null, observedPoints: new Map() }, // Map: column_coord -> {row_coord, value} for even rows
    rowOdd: { delta: null, observedPoints: new Map() },  // Map: column_coord -> {row_coord, value} for odd rows
    colEven: { delta: null, observedPoints: new Map() }, // Map: row_coord -> {column_coord, value} for even columns
    colOdd: { delta: null, observedPoints: new Map() }   // Map: row_coord -> {column_coord, value} for odd columns
};

// Determines which specific line data object to use based on coordinates and dimension type
const retrieveLineData = (rCoord, cCoord, isRowDimensionCheck) => {
    if (isRowDimensionCheck) {
        return (rCoord % 2 === 0) ? lineConsistencyData.rowEven : lineConsistencyData.rowOdd;
    } else {
        return (cCoord % 2 === 0) ? lineConsistencyData.colEven : lineConsistencyData.colOdd;
    }
};

// Calculates the factor used in boundary condition checks
const computeBoundaryFactor = (coordForFactor, totalDimensionLength, coordIsEven, isLowerBound) => {
    if (totalDimensionLength === 2) {
        return isLowerBound ? coordForFactor : (totalDimensionLength - coordForFactor);
    } else {
        if (coordIsEven) {
            return isLowerBound ? (coordForFactor / 2 - 1) : Math.floor((totalDimensionLength - coordForFactor) / 2);
        } else { // Odd parity
            return isLowerBound ? Math.floor(coordForFactor / 2) : Math.floor((totalDimensionLength - coordForFactor) / 2);
        }
    }
};

// Verifies if a point's value remains non-negative when extrapolated to dimension boundaries
const validatePointBounds = (pointValue, coordForFactor, deltaValue, totalDimensionLength, coordIsEven) => {
    const lowerFactor = computeBoundaryFactor(coordForFactor, totalDimensionLength, coordIsEven, true);
    const upperFactor = computeBoundaryFactor(coordForFactor, totalDimensionLength, coordIsEven, false);
    return (pointValue - deltaValue * lowerFactor >= 0) && (pointValue + deltaValue * upperFactor >= 0);
};

// Processes a single data point (r, c, a) for consistency along a specific dimension (row or column)
const processPointForDimension = (currentR, currentC, currentA, totalDimR, totalDimC, isRowDimensionCheck) => {
    const targetLineData = retrieveLineData(currentR, currentC, isRowDimensionCheck);
    const mapKey = isRowDimensionCheck ? currentC : currentR; // Key for the map (c for row-check, r for col-check)
    const otherCoord = isRowDimensionCheck ? currentR : currentC; // The coordinate whose parity determines the line (r for row-check, c for col-check)
    const totalLengthForCheck = isRowDimensionCheck ? totalDimR : totalDimC; // R for row-check, C for col-check
    const otherCoordIsEven = (otherCoord % 2 === 0);

    if (targetLineData.observedPoints.has(mapKey)) {
        const existingPointData = targetLineData.observedPoints.get(mapKey);
        const existingOtherCoord = existingPointData.otherCoord;
        const existingA = existingPointData.value;

        let calculatedDelta;
        if (totalLengthForCheck === 2) {
            calculatedDelta = existingA - currentA;
        } else {
            const coordDifferenceHalf = (existingOtherCoord - otherCoord) / 2;
            if (coordDifferenceHalf === 0) {
                // If otherCoord is the same, values must be identical for consistency.
                // The original code would calculate NaN/Infinity and fail Number.isInteger.
                calculatedDelta = (existingA - currentA) / coordDifferenceHalf;
            } else {
                calculatedDelta = (existingA - currentA) / coordDifferenceHalf;
            }
        }

        if (targetLineData.delta === null) {
            if (!Number.isInteger(calculatedDelta)) { // Catches NaN, Infinity, and non-integers
                return false;
            }
            targetLineData.delta = calculatedDelta;

            // Apply the newly found delta to all previously observed points in this line
            for (const [, storedPoint] of targetLineData.observedPoints.entries()) {
                if (!validatePointBounds(storedPoint.value, storedPoint.otherCoord, targetLineData.delta, totalLengthForCheck, (storedPoint.otherCoord % 2 === 0))) {
                    return false;
                }
            }
        } else {
            if (calculatedDelta !== targetLineData.delta) {
                return false;
            }
        }
        // Validate the current point with the established delta
        if (!validatePointBounds(currentA, otherCoord, targetLineData.delta, totalLengthForCheck, otherCoordIsEven)) {
            return false;
        }
    } else {
        // Store the current point for future delta calculations and validations
        targetLineData.observedPoints.set(mapKey, { otherCoord: otherCoord, value: currentA });
    }
    return true;
};

// Orchestrates the consistency checks for all input points
const executeConsistencyAnalysis = () => {
    for (let i = 0; i < pointCount; i++) {
        const [rStr, cStr, aStr] = coordinateValuePairs[i].split(' ');
        const rVal = parseInt(rStr);
        const cVal = parseInt(cStr);
        const aVal = parseInt(aStr);

        // Check consistency along rows (varying C, fixed R parity)
        if (!processPointForDimension(rVal, cVal, aVal, totalRows, totalCols, true)) {
            return false;
        }

        // Check consistency along columns (varying R, fixed C parity)
        if (!processPointForDimension(rVal, cVal, aVal, totalCols, totalRows, false)) {
            return false;
        }
    }
    return true;
};

if (executeConsistencyAnalysis()) {
    console.log('Yes');
} else {
    console.log('No');
}
