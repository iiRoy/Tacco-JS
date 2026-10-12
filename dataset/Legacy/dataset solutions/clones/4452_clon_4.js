"use strict";

const parseInputData = (rawInputContent) => {
    const contentLines = rawInputContent.trim().split("\n");

    const [heightDimension, widthDimension] = contentLines[0].split(" ");
    const gridHeightValue = parseInt(heightDimension, 10);
    const gridWidthValue = parseInt(widthDimension, 10);

    const totalColorVarieties = parseInt(contentLines[1], 10);
    const colorQuantityList = contentLines[2].split(" ").map(Number);

    return { gridHeightValue, gridWidthValue, totalColorVarieties, colorQuantityList };
};

const executeGridGeneration = (parsedDetails) => {
    const { gridHeightValue, gridWidthValue, totalColorVarieties, colorQuantityList } = parsedDetails;

    if (gridHeightValue * gridWidthValue === 1) {
        console.log(1);
        return;
    }

    const sequentialColors = colorQuantityList.flatMap((quantity, colorIdentifier) =>
        Array.from({ length: quantity }, () => colorIdentifier + 1)
    );

    const twoDimensionalGrid = sequentialColors.reduce((gridAccumulator, currentCellColor, sequencePosition) => {
        const targetRowIndex = Math.floor(sequencePosition / gridWidthValue);
        const targetColumnIndex = sequencePosition % gridWidthValue;

        if (targetColumnIndex === 0) {
            gridAccumulator.push([]);
        }
        gridAccumulator[targetRowIndex].push(currentCellColor);
        return gridAccumulator;
    }, []);

    const finalDisplayLines = twoDimensionalGrid.map((rowContent, rowNumberIndex) => {
        if (rowNumberIndex % 2 !== 0) {
            return rowContent.slice().reverse().join(" ");
        }
        return rowContent.join(" ");
    });

    console.log(finalDisplayLines.join("\n"));
};

const applicationEntry = (inputSource) => {
    const processedInput = parseInputData(inputSource);
    executeGridGeneration(processedInput);
};

applicationEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));
