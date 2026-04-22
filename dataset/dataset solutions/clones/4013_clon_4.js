const acquireInputContent = () => require("fs").readFileSync("/dev/stdin", "utf8");

const parseNumericSequence = (textSegment) => textSegment.split(" ").map(Number);

const calculateManhattanDistance = (coordA, coordB) => {
    const [rowA, colA] = coordA;
    const [rowB, colB] = coordB;
    return Math.abs(rowA - rowB) + Math.abs(colA - colB);
};

const processInputData = (dataSource) => {
    const parsedLines = dataSource.trim().split("\n");

    const [rowCount, colCount, stepMagnitude] = parseNumericSequence(parsedLines[0]);

    const valueToCoordinateMap = new Map();
    for (let currentGridRow = 0; currentGridRow < rowCount; ++currentGridRow) {
        const rowValues = parseNumericSequence(parsedLines[currentGridRow + 1]);
        for (let currentGridCol = 0; currentGridCol < colCount; ++currentGridCol) {
            valueToCoordinateMap.set(rowValues[currentGridCol], [currentGridRow, currentGridCol]);
        }
    }

    const pathCosts = new Map();
    const totalPossibleValues = rowCount * colCount;

    for (let startingPoint = 1; startingPoint <= stepMagnitude; ++startingPoint) {
        const sequenceValues = [];
        for (let currentVal = startingPoint; currentVal <= totalPossibleValues; currentVal += stepMagnitude) {
            sequenceValues.push(currentVal);
        }

        let cumulativeCostForSequence = 0;
        if (sequenceValues.length > 0) {
            pathCosts.set(sequenceValues[sequenceValues.length - 1], 0);
            for (let k = sequenceValues.length - 2; k >= 0; --k) {
                const currentVal = sequenceValues[k];
                const nextValInSequence = sequenceValues[k + 1];

                const currentCoord = valueToCoordinateMap.get(currentVal);
                const nextCoord = valueToCoordinateMap.get(nextValInSequence);

                const segmentDistance = calculateManhattanDistance(currentCoord, nextCoord);
                cumulativeCostForSequence += segmentDistance;
                pathCosts.set(currentVal, cumulativeCostForSequence);
            }
        }
    }

    const queryCount = Number(parsedLines[rowCount + 1]);

    const queryResults = [];
    for (let queryIdx = 0; queryIdx < queryCount; ++queryIdx) {
        const [startValue, endValue] = parseNumericSequence(parsedLines[rowCount + 2 + queryIdx]);
        const finalPathCost = pathCosts.get(startValue) - pathCosts.get(endValue);
        queryResults.push(finalPathCost);
    }

    console.log(queryResults.join("\n"));
};

processInputData(acquireInputContent());