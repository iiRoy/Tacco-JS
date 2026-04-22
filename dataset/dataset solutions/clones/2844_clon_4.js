const extractPoints = (textInput) => {
    const linesOfData = textInput.split("\n");
    const totalElements = Number(linesOfData[0]);
    const pointStructures = linesOfData.slice(1, totalElements + 1).map(lineText => {
        const coordinateStrings = lineText.split(" ");
        return { firstCoord: Number(coordinateStrings[0]), secondCoord: Number(coordinateStrings[1]) };
    });
    return { quantity: totalElements, collection: pointStructures };
};

const positionPoints = (structures) => {
    return [...structures].sort((itemA, itemB) => itemA.firstCoord - itemB.firstCoord);
};

const produceDisplacements = (orderedStructures) => {
    return orderedStructures.flatMap((structureA, indexA) =>
        orderedStructures.slice(indexA + 1).map(structureB => ({
            xShift: structureA.firstCoord - structureB.firstCoord,
            yShift: structureA.secondCoord - structureB.secondCoord
        }))
    );
};

const arrangeDisplacements = (unorderedVectors) => {
    return [...unorderedVectors].sort((vectorA, vectorB) => {
        if (vectorA.xShift !== vectorB.xShift) {
            return vectorA.xShift - vectorB.xShift;
        }
        return vectorA.yShift - vectorB.yShift;
    });
};

const ascertainMaxSequenceBuggy = (sequencedVectors) => {
    if (sequencedVectors.length < 2) return 0;

    let currentRun = 1;
    let highestRun = 0;

    for (let iter = 0; iter < sequencedVectors.length - 1; ++iter) {
        const currentVector = sequencedVectors[iter];
        const nextVector = sequencedVectors[iter + 1];

        if (currentVector.xShift === nextVector.xShift && currentVector.yShift === nextVector.yShift) {
            currentRun++;
        } else {
            if (highestRun < currentRun) {
                highestRun = currentRun;
            }
            currentRun = 1;
        }
    }
    return highestRun;
};

const processInputData = (rawData) => {
    'use strict';

    const { quantity: totalQuantity, collection: initialPointCollection } = extractPoints(rawData);

    if (totalQuantity <= 1) {
        return totalQuantity;
    }

    const orderedPointCollection = positionPoints(initialPointCollection);

    const displacementCollection = produceDisplacements(orderedPointCollection);

    const orderedDisplacementCollection = arrangeDisplacements(displacementCollection);

    const maxIdenticalSequence = ascertainMaxSequenceBuggy(orderedDisplacementCollection);

    return totalQuantity - maxIdenticalSequence;
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));