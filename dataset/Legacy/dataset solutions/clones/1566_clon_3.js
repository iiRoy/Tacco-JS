(async () => {
    let rawDataChunks = [];
    for await (const dataChunk of process.stdin) {
        rawDataChunks.push(dataChunk);
    }
    let fullInputString = rawDataChunks.join('');
    let allInputLines = fullInputString.split(/\n/);

    const MAX_TRACKED_COUNT_THRESHOLD = 500000;
    const INITIAL_HIGH_VALUE_MARKER = 1000000;

    const dimensionLine = allInputLines.shift();
    const [heightString, widthString] = dimensionLine.split(/\s/);
    const gridHeight = parseInt(heightString, 10);
    const gridWidth = parseInt(widthString, 10);

    let gridDefinitionRows = allInputLines.slice(0, gridHeight);
    let processedGridCoordinates = gridDefinitionRows.map(currentRow => {
        return currentRow.split(/\s/).map(coordinateString => parseInt(coordinateString, 10) - 1);
    });

    console.log(gridHeight, gridWidth, processedGridCoordinates);

    let columnTrackerArray = new Array(gridWidth).fill(0);

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        let minCountInCurrentIteration = INITIAL_HIGH_VALUE_MARKER;

        for (let columnIndex = 0; columnIndex < gridWidth; columnIndex++) {
            const isCurrentColumnTrackerHigh = columnTrackerArray[columnIndex] > MAX_TRACKED_COUNT_THRESHOLD;
            const isMinCountForIterationHigh = minCountInCurrentIteration > MAX_TRACKED_COUNT_THRESHOLD;

            if (isCurrentColumnTrackerHigh && isMinCountForIterationHigh) {
                continue;
            }

            const [startColumn, endColumn] = processedGridCoordinates[rowIndex];
            const isColumnOutsideRange = columnIndex < startColumn || columnIndex > endColumn;

            if (isColumnOutsideRange) {
                columnTrackerArray[columnIndex]++;
                minCountInCurrentIteration = Math.min(minCountInCurrentIteration, columnTrackerArray[columnIndex]);
            } else if (isMinCountForIterationHigh) {
                columnTrackerArray[columnIndex] = INITIAL_HIGH_VALUE_MARKER;
            } else {
                minCountInCurrentIteration++;
                columnTrackerArray[columnIndex] = minCountInCurrentIteration;
            }
        }
        console.log(columnTrackerArray);

        const hasAnyTrackedValueBelowThreshold = columnTrackerArray.some(val => val < MAX_TRACKED_COUNT_THRESHOLD);

        if (hasAnyTrackedValueBelowThreshold) {
            const overallMinimumValue = columnTrackerArray.reduce((accumulatorValue, currentColumnValue) => {
                return Math.min(accumulatorValue, currentColumnValue);
            }, MAX_TRACKED_COUNT_THRESHOLD);
            console.log(overallMinimumValue);
        } else {
            console.log(-1);
        }
    }
})();
