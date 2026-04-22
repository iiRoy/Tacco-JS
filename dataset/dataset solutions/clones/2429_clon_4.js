'use strict';
const obtainNumericValue = (textSegment) => Number(textSegment);

const measureSeparation = (entityOne, entityTwo) => {
    const deltaX = entityOne.axisX - entityTwo.axisX;
    const deltaY = entityOne.axisY - entityTwo.axisY;
    return Math.hypot(deltaX, deltaY);
};

const formUniquePairs = (collectionOfEntities) => {
    const generatedPairs = [];
    for (let currentEntityIndex = 0; currentEntityIndex < collectionOfEntities.length; currentEntityIndex++) {
        for (let subsequentEntityIndex = currentEntityIndex + 1; subsequentEntityIndex < collectionOfEntities.length; subsequentEntityIndex++) {
            generatedPairs.push([collectionOfEntities[currentEntityIndex], collectionOfEntities[subsequentEntityIndex]]);
        }
    }
    return generatedPairs;
};

const processInputAndCalculate = (sourceDataLines) => {
    const itemCount = obtainNumericValue(sourceDataLines[0]);
    
    const spatialEntities = sourceDataLines.slice(1, itemCount + 1).map(lineContent => {
        const coordinateStrings = lineContent.match(/-?\d+/g);
        return {
            axisX: obtainNumericValue(coordinateStrings[0]),
            axisY: obtainNumericValue(coordinateStrings[1])
        };
    });

    const allDistinctPairs = formUniquePairs(spatialEntities);

    const cumulativeExtent = allDistinctPairs.reduce((accumulator, currentPair) => {
        return accumulator + measureSeparation(currentPair[0], currentPair[1]);
    }, 0);

    console.log(cumulativeExtent / itemCount * 2);
};

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));