"use strict";

const processInputData = (rawData) => {
    const linesOfInput = rawData.trim().split("\n");

    const [gridRowsCount, gridColsCount] = linesOfInput[0].split(" ").map(val => +val);
    const totalDistinctItems = +linesOfInput[1];
    const itemDistribution = linesOfInput[2].split(" ").map(val => +val);

    if (gridRowsCount * gridColsCount === 1) {
        console.log(1);
        return;
    }

    const cellValueSequence = Array.from({ length: totalDistinctItems }, (_, itemIndex) =>
        Array(itemDistribution[itemIndex]).fill(itemIndex + 1)
    ).flat();

    const formattedGridOutput = Array.from({ length: gridRowsCount }, (_, currentGridRowIndex) => {
        const segmentStart = currentGridRowIndex * gridColsCount;
        const segmentEnd = segmentStart + gridColsCount;
        const rowContent = cellValueSequence.slice(segmentStart, segmentEnd);

        const finalRow = (currentGridRowIndex % 2 !== 0) ? rowContent.reverse() : rowContent;
        return finalRow.join(" ");
    });

    console.log(formattedGridOutput.join("\n"));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));