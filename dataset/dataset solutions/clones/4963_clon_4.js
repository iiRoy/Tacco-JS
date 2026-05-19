'use strict';
const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const dimensions = dataStream[0].split(' ').map(Number);
const R_DIM = dimensions[0];
const C_DIM = dimensions[1];
const N_COUNT = parseInt(dataStream[1]);
const coordinateValuePairs = dataStream.slice(2);

// Centralized state for slopes and observed points for each category
const categoryStates = {
    yEven: { currentSlope: { value: null }, observedPoints: new Map() },
    yOdd: { currentSlope: { value: null }, observedPoints: new Map() },
    xEven: { currentSlope: { value: null }, observedPoints: new Map() },
    xOdd: { currentSlope: { value: null }, observedPoints: new Map() }
};

// Helper function to evaluate the bounds condition
const checkValueConstraints = (coord, val, slope, getLowerTermFn, getUpperTermFn, dimensionSize) => {
    return !(val - slope * getLowerTermFn(coord, dimensionSize) < 0 ||
             val + slope * getUpperTermFn(coord, dimensionSize) < 0);
};

// Generic function to process a segment (e.g., a row or a column)
const analyzeDimensionSegment = (stateContainer, currentCoord, currentVal, otherCoord, dimensionSize, getDivisorFn, getLowerTermFn, getUpperTermFn) => {
    const { currentSlope, observedPoints } = stateContainer;

    if (observedPoints.has(otherCoord)) {
        const [previousCoord, previousVal] = observedPoints.get(otherCoord);
        const derivedSlope = (previousVal - currentVal) / getDivisorFn(previousCoord, currentCoord);

        if (currentSlope.value === null) {
            currentSlope.value = derivedSlope;
            // Validate all previously stored points against the newly determined slope
            if (!Array.from(observedPoints.entries()).every(([key, valueTuple]) => {
                const [pCoord, pVal] = valueTuple;
                return checkValueConstraints(pCoord, pVal, currentSlope.value, getLowerTermFn, getUpperTermFn, dimensionSize);
            })) {
                return false;
            }
        } else if (derivedSlope !== currentSlope.value) {
            return false;
        }
        // Validate the current point against the established slope
        if (!checkValueConstraints(currentCoord, currentVal, currentSlope.value, getLowerTermFn, getUpperTermFn, dimensionSize)) {
            return false;
        }
    } else {
        if (currentSlope.value !== null) {
            // Validate current point against established slope if it exists
            if (!checkValueConstraints(currentCoord, currentVal, currentSlope.value, getLowerTermFn, getUpperTermFn, dimensionSize)) {
                return false;
            }
        }
        observedPoints.set(otherCoord, [currentCoord, currentVal]);
    }
    return true;
};

// Configuration objects for Y-dimension (rows)
const rowDimensionConfigurations = {
    twoRows: {
        getDivisor: (r2, r1) => (r2 - r1),
        getLowerTerm: (r, R) => (r - 1),
        getUpperTerm: (r, R) => (2 - r)
    },
    evenRow: {
        getDivisor: (r2, r1) => (r2 - r1) / 2,
        getLowerTerm: (r, R) => (r / 2) - 1,
        getUpperTerm: (r, R) => Math.floor((R - r) / 2)
    },
    oddRow: {
        getDivisor: (r2, r1) => (r2 - r1) / 2,
        getLowerTerm: (r, R) => Math.floor((r - 1) / 2),
        getUpperTerm: (r, R) => Math.floor((R - r) / 2)
    }
};

// Configuration objects for X-dimension (columns)
const colDimensionConfigurations = {
    twoCols: {
        getDivisor: (c2, c1) => (c2 - c1),
        getLowerTerm: (c, C) => (c - 1),
        getUpperTerm: (c, C) => (C - c)
    },
    evenCol: {
        getDivisor: (c2, c1) => (c2 - c1) / 2,
        getLowerTerm: (c, C) => (c / 2) - 1,
        getUpperTerm: (c, C) => Math.floor((C - c) / 2)
    },
    oddCol: {
        getDivisor: (c2, c1) => (c2 - c1) / 2,
        getLowerTerm: (c, C) => Math.floor(c / 2),
        getUpperTerm: (c, C) => Math.floor((C - c) / 2)
    }
};

// Main processing loop for each input
for (let i = 0; i < N_COUNT; i++) {
    const [rowCoord, colCoord, value] = coordinateValuePairs[i].split(' ').map(Number);

    // Process Y-dimension (rows)
    let rowProcessingResult = true;
    if (R_DIM === 2) {
        rowProcessingResult = analyzeDimensionSegment(
            categoryStates.yEven, rowCoord, value, colCoord, R_DIM,
            rowDimensionConfigurations.twoRows.getDivisor,
            rowDimensionConfigurations.twoRows.getLowerTerm,
            rowDimensionConfigurations.twoRows.getUpperTerm
        );
    } else {
        if (rowCoord % 2 === 0) { // Even row
            rowProcessingResult = analyzeDimensionSegment(
                categoryStates.yEven, rowCoord, value, colCoord, R_DIM,
                rowDimensionConfigurations.evenRow.getDivisor,
                rowDimensionConfigurations.evenRow.getLowerTerm,
                rowDimensionConfigurations.evenRow.getUpperTerm
            );
        } else { // Odd row
            rowProcessingResult = analyzeDimensionSegment(
                categoryStates.yOdd, rowCoord, value, colCoord, R_DIM,
                rowDimensionConfigurations.oddRow.getDivisor,
                rowDimensionConfigurations.oddRow.getLowerTerm,
                rowDimensionConfigurations.oddRow.getUpperTerm
            );
        }
    }
    if (!rowProcessingResult) {
        console.log('No');
        process.exit();
    }

    // Process X-dimension (columns)
    let colProcessingResult = true;
    if (C_DIM === 2) {
        colProcessingResult = analyzeDimensionSegment(
            categoryStates.xEven, colCoord, value, rowCoord, C_DIM,
            colDimensionConfigurations.twoCols.getDivisor,
            colDimensionConfigurations.twoCols.getLowerTerm,
            colDimensionConfigurations.twoCols.getUpperTerm
        );
    } else {
        if (colCoord % 2 === 0) { // Even column
            colProcessingResult = analyzeDimensionSegment(
                categoryStates.xEven, colCoord, value, rowCoord, C_DIM,
                colDimensionConfigurations.evenCol.getDivisor,
                colDimensionConfigurations.evenCol.getLowerTerm,
                colDimensionConfigurations.evenCol.getUpperTerm
            );
        } else { // Odd column
            colProcessingResult = analyzeDimensionSegment(
                categoryStates.xOdd, colCoord, value, rowCoord, C_DIM,
                colDimensionConfigurations.oddCol.getDivisor,
                colDimensionConfigurations.oddCol.getLowerTerm,
                colDimensionConfigurations.oddCol.getUpperTerm
            );
        }
    }
    if (!colProcessingResult) {
        console.log('No');
        process.exit();
    }
}

console.log('Yes');
