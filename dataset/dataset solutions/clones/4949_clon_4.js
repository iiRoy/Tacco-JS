'use strict';
const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const [gridHeight, gridWidth] = sourceData[0].split(' ').map(Number);
const totalPoints = parseInt(sourceData[1]);
const pointMeasurements = sourceData.slice(2).map(entry => {
    const [rowCoord, colCoord, observationVal] = entry.split(' ').map(Number);
    return { row: rowCoord, col: colCoord, val: observationVal };
});

// Utility to calculate the 'start' distance for a given coordinate system
const calculateStartDistance = (overallDimension, currentCoordinate, isCoordinateEven) => {
    if (overallDimension === 2) return currentCoordinate - 1;
    return isCoordinateEven ? (currentCoordinate / 2) - 1 : Math.floor((currentCoordinate - 1) / 2);
};

// Utility to calculate the 'end' distance for a given coordinate system
const calculateEndDistance = (overallDimension, currentCoordinate) => {
    if (overallDimension === 2) return overallDimension - currentCoordinate;
    return Math.floor((overallDimension - currentCoordinate) / 2);
};

// Function to derive all possible gradients from a set of points and check for consistency
const determineAndVerifyGradients = (
    subsetOfPoints,
    dimensionLimit,
    primaryCoordinateKey, // 'row' or 'col'
    secondaryCoordinateKey, // 'col' or 'row'
    primaryCoordinateIsEven // true for even, false for odd, or null for dimensionLimit=2 case
) => {
    const pointsGroupedBySecondary = subsetOfPoints.reduce((accumulator, currentPoint) => {
        const groupingKey = currentPoint[secondaryCoordinateKey];
        if (!accumulator.has(groupingKey)) {
            accumulator.set(groupingKey, []);
        }
        accumulator.get(groupingKey).push(currentPoint);
        return accumulator;
    }, new Map());

    const gradientCandidates = [];
    for (const [groupingIdentifier, pointGroup] of pointsGroupedBySecondary.entries()) {
        if (pointGroup.length < 2) continue;

        for (let i = 0; i < pointGroup.length; i++) {
            for (let j = i + 1; j < pointGroup.length; j++) {
                const pointOne = pointGroup[i];
                const pointTwo = pointGroup[j];

                const pointOnePrimaryCoord = pointOne[primaryCoordinateKey];
                const pointTwoPrimaryCoord = pointTwo[primaryCoordinateKey];

                const pointOneStartDist = calculateStartDistance(dimensionLimit, pointOnePrimaryCoord, primaryCoordinateIsEven);
                const pointTwoStartDist = calculateStartDistance(dimensionLimit, pointTwoPrimaryCoord, primaryCoordinateIsEven);

                const differenceInObservation = pointTwo.val - pointOne.val;
                const differenceInDistance = pointTwoStartDist - pointOneStartDist;

                if (differenceInDistance !== 0) {
                    gradientCandidates.push(differenceInObservation / differenceInDistance);
                } else if (differenceInObservation !== 0) {
                    // Inconsistent heights at the same transformed coordinate
                    return { consistent: false, gradientValue: null };
                } else {
                    // Same transformed coordinate and same height: gradient is NaN (0/0)
                    gradientCandidates.push(NaN);
                }
            }
        }
    }

    if (gradientCandidates.length === 0) {
        return { consistent: true, gradientValue: null }; // No points to derive a gradient
    }

    const uniqueGradients = new Set(gradientCandidates);
    if (uniqueGradients.size !== 1) {
        return { consistent: false, gradientValue: null }; // Multiple inconsistent gradients
    }

    return { consistent: true, gradientValue: uniqueGradients.values().next().value };
};

// Main logic to evaluate the entire structure
const assessPyramidStructure = (allInputObservations, maxRow, maxCol) => {
    const oddRowObservations = allInputObservations.filter(p => p.row % 2 !== 0);
    const evenRowObservations = allInputObservations.filter(p => p.row % 2 === 0);
    const oddColObservations = allInputObservations.filter(p => p.col % 2 !== 0);
    const evenColObservations = allInputObservations.filter(p => p.col % 2 === 0);

    const derivedSlopeValues = {
        rowOddSlope: null,
        rowEvenSlope: null,
        colOddSlope: null,
        colEvenSlope: null
    };

    // Process Row dimension slopes
    if (maxRow === 2) {
        const { consistent, gradientValue } = determineAndVerifyGradients(
            allInputObservations, maxRow, 'row', 'col', true
        );
        if (!consistent) return false;
        derivedSlopeValues.rowEvenSlope = gradientValue;
    } else {
        const { consistent: oddConsistent, gradientValue: oddGradient } = determineAndVerifyGradients(
            oddRowObservations, maxRow, 'row', 'col', false
        );
        if (!oddConsistent) return false;
        derivedSlopeValues.rowOddSlope = oddGradient;

        const { consistent: evenConsistent, gradientValue: evenGradient } = determineAndVerifyGradients(
            evenRowObservations, maxRow, 'row', 'col', true
        );
        if (!evenConsistent) return false;
        derivedSlopeValues.rowEvenSlope = evenGradient;
    }

    // Process Column dimension slopes
    if (maxCol === 2) {
        const { consistent, gradientValue } = determineAndVerifyGradients(
            allInputObservations, maxCol, 'col', 'row', true
        );
        if (!consistent) return false;
        derivedSlopeValues.colEvenSlope = gradientValue;
    } else {
        const { consistent: oddConsistent, gradientValue: oddGradient } = determineAndVerifyGradients(
            oddColObservations, maxCol, 'col', 'row', false
        );
        if (!oddConsistent) return false;
        derivedSlopeValues.colOddSlope = oddGradient;

        const { consistent: evenConsistent, gradientValue: evenGradient } = determineAndVerifyGradients(
            evenColObservations, maxCol, 'col', 'row', true
        );
        if (!evenConsistent) return false;
        derivedSlopeValues.colEvenSlope = evenGradient;
    }

    // Final validation of all points against the derived slopes and boundary conditions
    for (const currentObservation of allInputObservations) {
        // Validate against row-based slope
        let currentPointRowSlope = null;
        let currentPointRowParityIsEven = null;
        if (maxRow === 2) {
            currentPointRowSlope = derivedSlopeValues.rowEvenSlope;
            currentPointRowParityIsEven = true;
        } else {
            if (currentObservation.row % 2 === 0) {
                currentPointRowSlope = derivedSlopeValues.rowEvenSlope;
                currentPointRowParityIsEven = true;
            } else {
                currentPointRowSlope = derivedSlopeValues.rowOddSlope;
                currentPointRowParityIsEven = false;
            }
        }

        if (currentPointRowSlope !== null) {
            const rowStartOffset = calculateStartDistance(maxRow, currentObservation.row, currentPointRowParityIsEven);
            const rowEndOffset = calculateEndDistance(maxRow, currentObservation.row);
            if (currentObservation.val - currentPointRowSlope * rowStartOffset < 0 ||
                currentObservation.val + currentPointRowSlope * rowEndOffset < 0) {
                return false;
            }
        }

        // Validate against column-based slope
        let currentPointColSlope = null;
        let currentPointColParityIsEven = null;
        if (maxCol === 2) {
            currentPointColSlope = derivedSlopeValues.colEvenSlope;
            currentPointColParityIsEven = true;
        } else {
            if (currentObservation.col % 2 === 0) {
                currentPointColSlope = derivedSlopeValues.colEvenSlope;
                currentPointColParityIsEven = true;
            } else {
                currentPointColSlope = derivedSlopeValues.colOddSlope;
                currentPointColParityIsEven = false;
            }
        }

        if (currentPointColSlope !== null) {
            const colStartOffset = calculateStartDistance(maxCol, currentObservation.col, currentPointColParityIsEven);
            const colEndOffset = calculateEndDistance(maxCol, currentObservation.col);
            if (currentObservation.val - currentPointColSlope * colStartOffset < 0 ||
                currentObservation.val + currentPointColSlope * colEndOffset < 0) {
                return false;
            }
        }
    }

    return true; // All consistency and boundary checks passed
};

const evaluationResult = assessPyramidStructure(pointMeasurements, gridHeight, gridWidth);
evaluationResult ? console.log('Yes') : console.log('No');