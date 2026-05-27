"use strict";

const coordinateProcessor = (inputData) => {
    const [firstLine] = inputData.trim().split("\n");
    const [xStartStr, yStartStr, xEndStr, yEndStr] = firstLine.split(" ");

    const xStart = +xStartStr;
    const yStart = +yStartStr;
    const xEnd = +xEndStr;
    const yEnd = +yEndStr;

    const generatedPath =
        "R".repeat(xEnd) +
        "U".repeat(yEnd) +
        "L".repeat(xEnd) +
        "D".repeat(yEnd) +
        "L" +
        "U".repeat(yEnd + 1) +
        "R".repeat(xEnd + 1) +
        "D" +
        "D".repeat(yEnd + 1) +
        "L".repeat(xEnd + 1) +
        "U";

    console.log(generatedPath);
};

coordinateProcessor(require('fs').readFileSync('/dev/stdin', 'utf8'));
