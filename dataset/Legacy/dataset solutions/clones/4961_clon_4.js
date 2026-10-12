'use strict';
const inputs = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const [totalRows, totalCols] = inputs[0].split(' ').map(Number);
const numPoints = parseInt(inputs[1]);
const pointRecords = inputs.slice(2);

const dimensionState = {
    row: {
        even: { slope: null, observedPoints: new Map() },
        odd: { slope: null, observedPoints: new Map() }
    },
    col: {
        even: { slope: null, observedPoints: new Map() },
        odd: { slope: null, observedPoints: new Map() }
    }
};

const calculateSlopeDivisor = (coordA, coordB, isDimensionTwo) => {
    if (isDimensionTwo) {
        return coordB - coordA;
    }
    return (coordB - coordA) / 2;
};

const getLowerBoundCoefficient = (coord, isDimensionTwo, parity, axisType) => {
    if (isDimensionTwo) {
        return axisType === 'col' ? coord : coord - 1;
    }
    return parity === 'even' ? (coord / 2) - 1 : Math.floor(coord / 2);
};

const getUpperBoundCoefficient = (coord, totalDimension, isDimensionTwo) => {
    if (isDimensionTwo) {
        return totalDimension - coord;
    }
    return Math.floor((totalDimension - coord) / 2);
};

const processCoordinateDimension = (axisType, currentCoord, currentValue, totalDimension) => {
    const isDimensionTwo = (totalDimension === 2);
    const parity = (currentCoord % 2 === 0) ? 'even' : 'odd';
    const currentCategoryState = dimensionState[axisType][parity];

    if (currentCategoryState.observedPoints.has(currentCoord)) {
        const previousPoint = currentCategoryState.observedPoints.get(currentCoord);
        const previousCoord = previousPoint.coord;
        const previousValue = previousPoint.value;

        const divisor = calculateSlopeDivisor(previousCoord, currentCoord, isDimensionTwo);

        let currentSlope;
        if (divisor === 0) {
            if (previousValue !== currentValue) {
                return false;
            }
            currentSlope = NaN;
        } else {
            currentSlope = (previousValue - currentValue) / divisor;
        }

        if (!isDimensionTwo && Math.round(currentSlope) !== currentSlope) {
            return false;
        }

        if (currentCategoryState.slope === null) {
            currentCategoryState.slope = currentSlope;

            for (const [obsCoord, obsPoint] of currentCategoryState.observedPoints.entries()) {
                const lowerCoeff = getLowerBoundCoefficient(obsCoord, isDimensionTwo, parity, axisType);
                const upperCoeff = getUpperBoundCoefficient(obsCoord, totalDimension, isDimensionTwo);

                if (obsPoint.value - currentSlope * lowerCoeff < 0 ||
                    obsPoint.value + currentSlope * upperCoeff < 0) {
                    return false;
                }
            }
        } else {
            if (currentSlope !== currentCategoryState.slope) {
                return false;
            }
        }

        const lowerCoeff = getLowerBoundCoefficient(currentCoord, isDimensionTwo, parity, axisType);
        const upperCoeff = getUpperBoundCoefficient(currentCoord, totalDimension, isDimensionTwo);

        if (currentValue - currentCategoryState.slope * lowerCoeff < 0 ||
            currentValue + currentCategoryState.slope * upperCoeff < 0) {
            return false;
        }

    } else {
        currentCategoryState.observedPoints.set(currentCoord, { coord: currentCoord, value: currentValue });
    }

    return true;
};

const allPointsConsistent = pointRecords.every(line => {
    const [rowStr, colStr, valStr] = line.split(' ');
    const rVal = parseInt(rowStr);
    const cVal = parseInt(colStr);
    const aVal = parseInt(valStr);

    if (!processCoordinateDimension('row', rVal, aVal, totalRows)) {
        return false;
    }

    if (!processCoordinateDimension('col', cVal, aVal, totalCols)) {
        return false;
    }

    return true;
});

if (allPointsConsistent) {
    console.log('Yes');
} else {
    console.log('No');
}
