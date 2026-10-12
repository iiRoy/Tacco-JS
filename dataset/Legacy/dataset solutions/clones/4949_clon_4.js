'use strict';
const fileSystem = require('fs');

const inputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const dimensions = inputLines[0].split(' ').map(Number);
const rowCount = dimensions[0];
const colCount = dimensions[1];
const pointCount = parseInt(inputLines[1]);
const pointDataStrings = inputLines.slice(2);

let xOddSlopeValue = false;
let xEvenSlopeValue = -1;
let yOddSlopeValue = false;
let yEvenSlopeValue = false;

const processingContexts = {
    yEven: {
        get currentSlope() { return yEvenSlopeValue; },
        set currentSlope(val) { yEvenSlopeValue = val; },
        storedPoints: new Map(),
        getTermOne: (rCoord, totalRows) => totalRows === 2 ? (rCoord - 1) : ((rCoord / 2) - 1),
        getTermTwo: (rCoord, totalRows) => totalRows === 2 ? (2 - rCoord) : Math.floor((totalRows - rCoord) / 2),
        getSlopeDenominator: (r1Coord, r2Coord, totalRows) => totalRows === 2 ? (r2Coord - r1Coord) : ((r2Coord - r1Coord) / 2),
        isSlopeUninitialized: () => yEvenSlopeValue === false,
        isSlopeInitialized: () => yEvenSlopeValue !== false
    },
    yOdd: {
        get currentSlope() { return yOddSlopeValue; },
        set currentSlope(val) { yOddSlopeValue = val; },
        storedPoints: new Map(),
        getTermOne: (rCoord, totalRows) => Math.floor((rCoord - 1) / 2),
        getTermTwo: (rCoord, totalRows) => Math.floor((totalRows - rCoord) / 2),
        getSlopeDenominator: (r1Coord, r2Coord, totalRows) => (r2Coord - r1Coord) / 2,
        isSlopeUninitialized: () => yOddSlopeValue === false,
        isSlopeInitialized: () => yOddSlopeValue !== false
    },
    xEven: {
        get currentSlope() { return xEvenSlopeValue; },
        set currentSlope(val) { xEvenSlopeValue = val; },
        storedPoints: new Map(),
        getTermOne: (cCoord, totalCols) => totalCols === 2 ? (cCoord - 1) : ((cCoord / 2) - 1),
        getTermTwo: (cCoord, totalCols) => totalCols === 2 ? (totalCols - cCoord) : Math.floor((totalCols - cCoord) / 2),
        getSlopeDenominator: (c1Coord, c2Coord, totalCols) => totalCols === 2 ? (c2Coord - c1Coord) : ((c2Coord - c1Coord) / 2),
        isSlopeUninitialized: () => xEvenSlopeValue === -1,
        isSlopeInitialized: () => xEvenSlopeValue !== -1
    },
    xOdd: {
        get currentSlope() { return xOddSlopeValue; },
        set currentSlope(val) { xOddSlopeValue = val; },
        storedPoints: new Map(),
        getTermOne: (cCoord, totalCols) => Math.floor(cCoord / 2),
        getTermTwo: (cCoord, totalCols) => Math.floor((totalCols - cCoord) / 2),
        getSlopeDenominator: (c1Coord, c2Coord, totalCols) => (c2Coord - c1Coord) / 2,
        isSlopeUninitialized: () => xOddSlopeValue === false,
        isSlopeInitialized: () => xOddSlopeValue !== false
    }
};

function verifyPointConsistency(
    fixedCoordinate,
    varyingCoordinate,
    pointValue,
    dimensionTotalSize,
    context
) {
    const { storedPoints, getTermOne, getTermTwo, getSlopeDenominator, isSlopeUninitialized, isSlopeInitialized } = context;

    const checkBoundaryConditions = (val, varCoord, currentSlopeValue) => {
        const termA = getTermOne(varCoord, dimensionTotalSize);
        const termB = getTermTwo(varCoord, dimensionTotalSize);
        return !(val - currentSlopeValue * termA < 0 || val + currentSlopeValue * termB < 0);
    };

    if (storedPoints.has(fixedCoordinate)) {
        const [previousVaryingCoord, previousValue] = storedPoints.get(fixedCoordinate);
        const denominator = getSlopeDenominator(varyingCoordinate, previousVaryingCoord, dimensionTotalSize);
        
        const calculatedSlopeForPair = (previousValue - pointValue) / denominator;

        if (isSlopeUninitialized()) {
            context.currentSlope = calculatedSlopeForPair;
            for (const [fCoord, [vCoord, val]] of storedPoints.entries()) {
                if (!checkBoundaryConditions(val, vCoord, context.currentSlope)) {
                    return false;
                }
            }
        } else {
            if (calculatedSlopeForPair !== context.currentSlope) {
                return false;
            }
        }
        if (!checkBoundaryConditions(pointValue, varyingCoordinate, context.currentSlope)) {
            return false;
        }
    } else {
        if (isSlopeInitialized()) {
            if (!checkBoundaryConditions(pointValue, varyingCoordinate, context.currentSlope)) {
                return false;
            }
        }
        storedPoints.set(fixedCoordinate, [varyingCoordinate, pointValue]);
    }
    return true;
}

for (let i = 0; i < pointCount; i++) {
    const currentPointCoords = pointDataStrings[i].split(' ');
    const currentR = parseInt(currentPointCoords[0]);
    const currentC = parseInt(currentPointCoords[1]);
    const currentA = parseInt(currentPointCoords[2]);

    let yProcessingContext;
    if (rowCount === 2) {
        yProcessingContext = processingContexts.yEven;
    } else {
        yProcessingContext = (currentR % 2 === 0) ? processingContexts.yEven : processingContexts.yOdd;
    }
    if (!verifyPointConsistency(currentC, currentR, currentA, rowCount, yProcessingContext)) {
        console.log('No');
        process.exit();
    }

    let xProcessingContext;
    if (colCount === 2) {
        xProcessingContext = processingContexts.xEven;
    } else {
        xProcessingContext = (currentC % 2 === 0) ? processingContexts.xEven : processingContexts.xOdd;
    }
    if (!verifyPointConsistency(currentR, currentC, currentA, colCount, xProcessingContext)) {
        console.log('No');
        process.exit();
    }
}

console.log('Yes');
