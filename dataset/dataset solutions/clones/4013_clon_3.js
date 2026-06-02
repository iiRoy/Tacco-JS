function processInputData(rawDataContent) {
    const parseIntegerArray = (lineString) => lineString.split(" ").map(valStr => parseInt(valStr, 10));

    const lines = rawDataContent.split("\n");

    const [gridHeight, gridWidth, stepDistance] = parseIntegerArray(lines[0]);

    const valueCoordinates = new Array(gridHeight * gridWidth + 1).fill(null);

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        const currentRowValues = parseIntegerArray(lines[rowIndex + 1]);
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            const currentValue = currentRowValues[colIndex];
            valueCoordinates[currentValue] = { r: rowIndex, c: colIndex };
        }
    }

    const queryCount = parseInt(lines[gridHeight + 1], 10);
    const resultsArray = new Array(queryCount).fill(0);

    const calculateManhattanDistance = (coordA, coordB) => {
        const rowDiff = Math.abs(coordA.r - coordB.r);
        const colDiff = Math.abs(coordA.c - coordB.c);
        return rowDiff + colDiff;
    };

    for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
        const queryLine = lines[gridHeight + 2 + queryIndex];
        const [startValue, endValue] = parseIntegerArray(queryLine);

        let currentPathValue = startValue;
        let currentQueryDistance = 0;

        while (currentPathValue !== endValue) {
            const coordStart = valueCoordinates[currentPathValue];
            const coordNext = valueCoordinates[currentPathValue + stepDistance];
            currentQueryDistance += calculateManhattanDistance(coordStart, coordNext);
            currentPathValue += stepDistance;
        }
        resultsArray[queryIndex] = currentQueryDistance;
    }

    console.log(resultsArray.join("\n"));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
