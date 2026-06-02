function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    const parseInitialParameters = (lineContent) => {
        const parts = lineContent.split(" ");
        return {
            gridHeight: Number(parts[0]),
            gridWidth: Number(parts[1]),
            stepValue: Number(parts[2])
        };
    };

    const initialParameters = parseInitialParameters(inputLines[0]);
    const gridHeight = initialParameters.gridHeight;
    const gridWidth = initialParameters.gridWidth;
    const stepValue = initialParameters.stepValue;

    const coordinateMap = [];

    for (let rowIndex = 1; rowIndex <= gridHeight; rowIndex++) {
        const currentRowData = inputLines[rowIndex].split(" ");
        for (let colIndex = 0; colIndex < currentRowData.length; colIndex++) {
            const cellValue = Number(currentRowData[colIndex]);
            const cellCoordinates = {
                x: rowIndex,
                y: colIndex + 1
            };
            coordinateMap[cellValue] = cellCoordinates;
        }
    }

    const parseExamQueries = (lines, startLineIdx, totalQueries) => {
        const queries = [];
        for (let queryIdx = 0; queryIdx < totalQueries; queryIdx++) {
            const queryLine = lines[startLineIdx + queryIdx];
            const queryParts = queryLine.split(" ");
            queries.push({
                startValue: Number(queryParts[0]),
                endValue: Number(queryParts[1])
            });
        }
        return queries;
    };

    const numberOfQueries = Number(inputLines[gridHeight + 1]);
    const queryDataStartLine = gridHeight + 2;
    const examQueries = parseExamQueries(inputLines, queryDataStartLine, numberOfQueries);

    const resultsArray = [];

    const calculateManhattanDistance = (pointOne, pointTwo) => {
        return Math.abs(pointTwo.x - pointOne.x) + Math.abs(pointTwo.y - pointOne.y);
    };

    for (let queryIndex = 0; queryIndex < examQueries.length; queryIndex++) {
        let currentQueryTotalDistance = 0;
        const currentQuery = examQueries[queryIndex];
        const queryStart = currentQuery.startValue;
        const queryEnd = currentQuery.endValue;

        const valueRange = queryEnd - queryStart;
        const numberOfSegments = valueRange / stepValue;

        for (let segmentIndex = 0; segmentIndex < numberOfSegments; segmentIndex++) {
            const segmentStartPointValue = queryStart + segmentIndex * stepValue;
            const segmentEndPointValue = queryStart + (segmentIndex + 1) * stepValue;

            const segmentStartCoordinates = coordinateMap[segmentStartPointValue];
            const segmentEndCoordinates = coordinateMap[segmentEndPointValue];

            currentQueryTotalDistance += calculateManhattanDistance(segmentStartCoordinates, segmentEndCoordinates);
        }
        resultsArray[queryIndex] = currentQueryTotalDistance;
    }

    console.log(resultsArray.join("\n"));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
