'use strict';
const dataOrigin = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const systemState = {
    gridHeight: 0,
    gridWidth: 0,
    progressRates: {
        verticalEvenRow: null,
        verticalOddRow: null,
        horizontalEvenCol: null,
        horizontalOddCol: null
    },
    storedCoordinates: {
        verticalEvenRow: new Map(), // column -> [row, value]
        verticalOddRow: new Map(),  // column -> [row, value]
        horizontalEvenCol: new Map(), // row -> [col, value]
        horizontalOddCol: new Map()   // row -> [col, value]
    }
};

const terminateExecution = () => {
    console.log('No');
    process.exit();
};

const defineVerticalTwoRows = {
    key: 'verticalEvenRow',
    coordIdentifier: 'row',
    otherCoordIdentifier: 'col',
    rateDivisor: (crd1, crd2) => crd2 - crd1,
    checkLowerLimit: (val, rate, crd) => val - rate * (crd - 1),
    checkUpperLimit: (val, rate, totalCrd, crd) => val + rate * (totalCrd - crd),
    initialHasCheck: null,
    initialElseCheck: null
};

const defineVerticalEvenRows = {
    key: 'verticalEvenRow',
    coordIdentifier: 'row',
    otherCoordIdentifier: 'col',
    rateDivisor: (crd1, crd2) => (crd2 - crd1) / 2,
    checkLowerLimit: (val, rate, crd) => val - rate * ((crd / 2) - 1),
    checkUpperLimit: (val, rate, totalCrd, crd) => val + rate * Math.floor((totalCrd - crd) / 2),
    initialHasCheck: null,
    initialElseCheck: null
};

const defineVerticalOddRows = {
    key: 'verticalOddRow',
    coordIdentifier: 'row',
    otherCoordIdentifier: 'col',
    rateDivisor: (crd1, crd2) => (crd2 - crd1) / 2,
    checkLowerLimit: (val, rate, crd, isExisting = false, rateIsInitial = false) => {
        if (rateIsInitial) return val;
        return val - rate * (isExisting ? Math.floor(crd / 2) : Math.floor((crd - 1) / 2));
    },
    checkUpperLimit: (val, rate, totalCrd, crd) => val + rate * Math.floor((totalCrd - crd) / 2),
    initialHasCheck: null,
    initialElseCheck: null
};

const defineHorizontalTwoCols = {
    key: 'horizontalEvenCol',
    coordIdentifier: 'col',
    otherCoordIdentifier: 'row',
    rateDivisor: (crd1, crd2) => crd2 - crd1,
    checkLowerLimit: (val, rate, crd) => val - rate * (crd - 1),
    checkUpperLimit: (val, rate, totalCrd, crd) => val + rate * (totalCrd - crd),
    initialHasCheck: -1, // Replicates the specific bug `dist_x_even === -1`
    initialElseCheck: false // Replicates the specific bug `dist_x_even !== false`
};

const defineHorizontalEvenCols = {
    key: 'horizontalEvenCol',
    coordIdentifier: 'col',
    otherCoordIdentifier: 'row',
    rateDivisor: (crd1, crd2) => (crd2 - crd1) / 2,
    checkLowerLimit: (val, rate, crd) => val - rate * ((crd / 2) - 1),
    checkUpperLimit: (val, rate, totalCrd, crd) => val + rate * Math.floor((totalCrd - crd) / 2),
    initialHasCheck: null,
    initialElseCheck: null
};

const defineHorizontalOddCols = {
    key: 'horizontalOddCol',
    coordIdentifier: 'col',
    otherCoordIdentifier: 'row',
    rateDivisor: (crd1, crd2) => (crd2 - crd1) / 2,
    checkLowerLimit: (val, rate, crd, isExisting = false, rateIsInitial = false) => {
        if (rateIsInitial) return val;
        return val - rate * Math.floor(crd / 2);
    },
    checkUpperLimit: (val, rate, totalCrd, crd) => val + rate * Math.floor((totalCrd - crd) / 2),
    initialHasCheck: null,
    initialElseCheck: null
};

const checkAndVerifyLimits = (pointValue, progressRate, coordinate, totalDimension, systemConfig, isExisting = false, rateIsInitial = false) => {
    const effectiveRate = rateIsInitial ? 0 : progressRate; // Mimics `false * X` behavior from original
    if (systemConfig.checkLowerLimit(pointValue, effectiveRate, coordinate, isExisting, rateIsInitial) < 0 ||
        systemConfig.checkUpperLimit(pointValue, effectiveRate, totalDimension, coordinate) < 0) {
        terminateExecution();
    }
};

const processDimension = (currentEntry, fullDimensionSize, mainCoord, secondaryCoord, dimensionConfigurations) => {
    const mainCoordValue = currentEntry[mainCoord];
    const secondaryCoordValue = currentEntry[secondaryCoord];
    const entryValue = currentEntry.value;

    let activeDimensionConfig;
    if (fullDimensionSize === 2) {
        activeDimensionConfig = dimensionConfigurations.twoDim;
    } else if (mainCoordValue % 2 === 0) {
        activeDimensionConfig = dimensionConfigurations.evenDim;
    } else {
        activeDimensionConfig = dimensionConfigurations.oddDim;
    }

    const rateKey = activeDimensionConfig.key;
    const recordedPointsMap = systemState.storedCoordinates[rateKey];
    let establishedRate = systemState.progressRates[rateKey];

    if (recordedPointsMap.has(secondaryCoordValue)) {
        const [prevMainCoord, prevEntryValue] = recordedPointsMap.get(secondaryCoordValue);
        const calculatedRate = (prevEntryValue - entryValue) / activeDimensionConfig.rateDivisor(prevMainCoord, mainCoordValue);

        const rateIsInitial = (establishedRate === activeDimensionConfig.initialHasCheck);
        if (rateIsInitial) {
            systemState.progressRates[rateKey] = calculatedRate;
            establishedRate = calculatedRate;
            for (const [, [coord, val]] of recordedPointsMap.entries()) {
                checkAndVerifyLimits(val, establishedRate, coord, fullDimensionSize, activeDimensionConfig, true, false);
            }
        } else {
            if (calculatedRate !== establishedRate) {
                terminateExecution();
            }
        }
        checkAndVerifyLimits(entryValue, establishedRate, mainCoordValue, fullDimensionSize, activeDimensionConfig, false, rateIsInitial);
    } else {
        const rateIsInitial = (establishedRate === activeDimensionConfig.elseCheckInitialValue);
        if (!rateIsInitial) {
            checkAndVerifyLimits(entryValue, establishedRate, mainCoordValue, fullDimensionSize, activeDimensionConfig, false, false);
        }
        recordedPointsMap.set(secondaryCoordValue, [mainCoordValue, entryValue]);
    }
};

const runAnalysis = (inputLines) => {
    const initialSpecs = inputLines[0].split(' ').map(Number);
    systemState.gridHeight = initialSpecs[0];
    systemState.gridWidth = initialSpecs[1];
    const totalObservations = parseInt(inputLines[1]);
    const observationRecords = inputLines.slice(2);

    for (let i = 0; i < totalObservations; i++) {
        const parts = observationRecords[i].split(' ').map(Number);
        const currentObservation = {
            row: parts[0],
            col: parts[1],
            value: parts[2]
        };

        processDimension(currentObservation, systemState.gridHeight, 'row', 'col', {
            twoDim: defineVerticalTwoRows,
            evenDim: defineVerticalEvenRows,
            oddDim: defineVerticalOddRows
        });

        processDimension(currentObservation, systemState.gridWidth, 'col', 'row', {
            twoDim: defineHorizontalTwoCols,
            evenDim: defineHorizontalEvenCols,
            oddDim: defineHorizontalOddCols
        });
    }

    console.log('Yes');
};

runAnalysis(dataOrigin);