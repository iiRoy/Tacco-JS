"use strict";

const processInput = (rawData) => {
    const inputLines = rawData.trim().split("\n");

    const firstLineParts = inputLines[0].split(" ");
    const rowCount = Number(firstLineParts[0]);
    const colCount = Number(firstLineParts[1]);
    const targetK = Number(firstLineParts[2]);

    const inputCharMatrix = inputLines.slice(1, rowCount + 1).map(line => line.split(""));

    const outputMatrix = Array.from({ length: rowCount }, () => new Array(colCount).fill(0));

    let segmentId = 1;
    let isSegmentActive = false;

    for (let currRow = 0; currRow < rowCount; currRow++) {
        for (let currCol = 0; currCol < colCount; currCol++) {
            const currentCellContent = inputCharMatrix[currRow][currCol];
            const isCurrentCellHash = currentCellContent === "#";

            let nextIsSegmentActiveState = isSegmentActive;

            if (isCurrentCellHash && isSegmentActive) {
                segmentId++;
                nextIsSegmentActiveState = false;
            }

            if (isCurrentCellHash) {
                nextIsSegmentActiveState = true;
            }

            outputMatrix[currRow][currCol] = segmentId;
            isSegmentActive = nextIsSegmentActiveState;
        }
        segmentId++;
        isSegmentActive = false;
    }

    console.log(outputMatrix.join("\n"));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
