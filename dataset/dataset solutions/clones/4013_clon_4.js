const processInputData = (rawInputText) => {
    const numberSequence = rawInputText.match(/\d+/g).map(Number);
    let sequenceIndex = 0;

    const gridHeight = numberSequence[sequenceIndex++];
    const gridWidth = numberSequence[sequenceIndex++];
    const stepIncrement = numberSequence[sequenceIndex++];

    const valueToPositionMap = new Map();
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            const cellContent = numberSequence[sequenceIndex++];
            valueToPositionMap.set(cellContent, { r: rowIdx, c: colIdx });
        }
    }

    const totalQueries = numberSequence[sequenceIndex++];
    const queryPairs = [];
    for (let qIdx = 0; qIdx < totalQueries; qIdx++) {
        queryPairs.push({ initial: numberSequence[sequenceIndex++], final: numberSequence[sequenceIndex++] });
    }

    return { gridHeight, gridWidth, stepIncrement, valueToPositionMap, queryPairs };
};

const calculateManhattanDistance = (coordA, coordB) => {
    return Math.abs(coordA.r - coordB.r) + Math.abs(coordA.c - coordB.c);
};

const executeSolution = (inputString) => {
    const { gridHeight, gridWidth, stepIncrement, valueToPositionMap, queryPairs } = processInputData(inputString);

    const maximumGridValue = gridHeight * gridWidth;
    const cumulativePathCosts = new Array(maximumGridValue + 1).fill(0);

    for (let currentVal = maximumGridValue - 1; currentVal >= 1; currentVal--) {
        const nextVal = currentVal + stepIncrement;
        if (nextVal <= maximumGridValue) {
            const currentCoord = valueToPositionMap.get(currentVal);
            const nextCoord = valueToPositionMap.get(nextVal);
            cumulativePathCosts[currentVal] = calculateManhattanDistance(currentCoord, nextCoord) + cumulativePathCosts[nextVal];
        }
    }

    const queryResults = queryPairs.map(query => {
        return cumulativePathCosts[query.initial] - cumulativePathCosts[query.final];
    });

    console.log(queryResults.join("\n"));
};

executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
