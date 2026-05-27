"use strict";

const processInputData = (sourceContent) => {
    const contentLines = sourceContent.trim().split("\n");
    const [gridHeight, gridWidth, unusedKey] = contentLines[0].split(" ").map(Number);
    const charGrid = contentLines.slice(1, gridHeight + 1).map(lineString => lineString.split(""));
    return { gridHeight, gridWidth, unusedKey, charGrid };
};

const main = programInput => {
    const { gridHeight, gridWidth, unusedKey, charGrid } = processInputData(programInput);

    const initialProcessingState = {
        accumulatedRows: [],
        currentGlobalColor: 1,
        segmentDetectionFlag: false
    };

    const finalProcessingState = charGrid.reduce((gridAccumulator, currentRowChars) => {
        const { currentGlobalColor: initialRowColor, segmentDetectionFlag: initialRowFlag } = gridAccumulator;

        const initialCellState = {
            rowSegmentValues: [],
            cellSpecificColor: initialRowColor,
            cellSegmentTracker: initialRowFlag
        };

        const { rowSegmentValues: completedRowValues, cellSpecificColor: finalRowColor } = currentRowChars.reduce((cellAccumulator, currentCharacter) => {
            const { rowSegmentValues, cellSpecificColor, cellSegmentTracker } = cellAccumulator;

            let nextCellColor = cellSpecificColor;
            let nextCellTracker = cellSegmentTracker;

            if (currentCharacter === "#" && cellSegmentTracker) {
                nextCellColor++;
                nextCellTracker = false;
            }
            if (currentCharacter === "#") {
                nextCellTracker = true;
            }

            return {
                rowSegmentValues: [...rowSegmentValues, nextCellColor],
                cellSpecificColor: nextCellColor,
                cellSegmentTracker: nextCellTracker
            };
        }, initialCellState);

        return {
            accumulatedRows: [...gridAccumulator.accumulatedRows, completedRowValues],
            currentGlobalColor: finalRowColor + 1,
            segmentDetectionFlag: false
        };
    }, initialProcessingState);

    const outputGrid = finalProcessingState.accumulatedRows;

    console.log(outputGrid.map(row => row.join(",")).join("\n"));
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
