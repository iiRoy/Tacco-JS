"use strict";

const createInputReader = () => {
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    const inputTokens = rawInputData.split(/ |\n/);
    let currentTokenIndex = 0;

    const readNextInt = () => {
        return +inputTokens[currentTokenIndex++];
    };

    const readNextString = () => {
        return inputTokens[currentTokenIndex++];
    };

    const readNextBigInt = () => {
        return BigInt(inputTokens[currentTokenIndex++]);
    };

    const readIntsArray = (count, mapFn) => {
        const start = currentTokenIndex;
        currentTokenIndex += count;
        const slice = inputTokens.slice(start, currentTokenIndex);
        return mapFn ? slice : slice.map(val => +val);
    };

    const readMatrixData = (height, width, mapFn) => {
        const matrix = [];
        for (let rowIdx = 0; rowIdx < height; rowIdx++) {
            const start = currentTokenIndex;
            currentTokenIndex += width;
            const rowSlice = inputTokens.slice(start, currentTokenIndex);
            matrix.push(mapFn ? rowSlice : rowSlice.map(val => +val));
        }
        return matrix;
    };

    return {
        readNextInt,
        readNextString,
        readNextBigInt,
        readIntsArray,
        readMatrixData
    };
};

const { readNextInt, readNextString, readNextBigInt, readIntsArray, readMatrixData } = createInputReader();

function initializeMultiDimArray(initialValue) {
    const args = arguments;
    let argLength = args.length;
    let arrayCreationExpression = `Array(args[${--argLength}]).fill().map(x => { return ${initialValue}; })`;
    while (--argLength) {
        arrayCreationExpression = `Array(args[${argLength}]).fill().map(x => ${arrayCreationExpression})`;
    }
    return eval(arrayCreationExpression);
}

const programOutput = processInputAndCalculate();
if (programOutput !== undefined) {
    console.log(String(programOutput));
}

function processInputAndCalculate() {
    const maxPossibleDistance = 1e9;
    const numEntities = readNextInt();

    const entityGroups = Array.from({ length: 4 }, () => []);

    const directionToGroupIndex = { U: 0, R: 1, D: 2, L: 3 };

    for (let entityIdx = 0; entityIdx < numEntities; entityIdx++) {
        const currentX = readNextInt();
        const currentY = readNextInt();
        const entityDirection = readNextString();

        const diffXY = currentX - currentY;
        const sumXY = currentX + currentY;
        entityGroups[directionToGroupIndex[entityDirection]].push([currentX, currentY, diffXY, sumXY]);
    }

    let minimumEncounterDistance = maxPossibleDistance;

    const sortAllGroupsBy = (sortIndex) => {
        for (let group of entityGroups) {
            group.sort((itemA, itemB) => itemA[sortIndex] - itemB[sortIndex]);
        }
    };

    const calculateMinDistanceBetweenGroups = (
        group1Idx,
        group2Idx,
        primaryCoordIndex,
        secondaryCoordIndex,
        distanceFactor
    ) => {
        let currentMin = minimumEncounterDistance;
        const groupA = entityGroups[group1Idx];
        const groupB = entityGroups[group2Idx];

        if (groupB.length === 0) {
            return currentMin;
        }

        let pointerB = 0;
        for (let entityA of groupA) {
            while (pointerB < groupB.length && groupB[pointerB][primaryCoordIndex] < entityA[primaryCoordIndex]) {
                pointerB++;
            }

            if (pointerB === groupB.length) {
                break;
            }

            if (entityA[primaryCoordIndex] === groupB[pointerB][primaryCoordIndex] &&
                entityA[secondaryCoordIndex] < groupB[pointerB][secondaryCoordIndex]) {
                
                const distance = (groupB[pointerB][secondaryCoordIndex] - entityA[secondaryCoordIndex]) * distanceFactor;
                currentMin = Math.min(currentMin, distance);
            }
        }
        return currentMin;
    };

    entityGroups[0].sort((itemA, itemB) => itemA[0] - itemB[0]);
    entityGroups[1].sort((itemA, itemB) => itemA[1] - itemB[1]);
    entityGroups[2].sort((itemA, itemB) => itemA[0] - itemB[0]);
    entityGroups[3].sort((itemA, itemB) => itemA[1] - itemB[1]);

    for (let groupSelector = 0; groupSelector < 2; groupSelector++) {
        minimumEncounterDistance = calculateMinDistanceBetweenGroups(
            groupSelector,
            groupSelector + 2,
            groupSelector,
            1 - groupSelector,
            1
        );
    }

    sortAllGroupsBy(3);

    for (let groupSelector = 0; groupSelector < 4; groupSelector += 2) {
        minimumEncounterDistance = calculateMinDistanceBetweenGroups(
            groupSelector,
            groupSelector + 1,
            3,
            1 - (groupSelector / 2),
            2
        );
    }

    sortAllGroupsBy(2);

    for (let groupSelector = 0; groupSelector < 2; groupSelector++) {
        minimumEncounterDistance = calculateMinDistanceBetweenGroups(
            groupSelector,
            3 - groupSelector,
            2,
            0,
            2
        );
    }

    return minimumEncounterDistance === maxPossibleDistance ? "SAFE" : minimumEncounterDistance * 5;
}
