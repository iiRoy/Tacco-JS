"use strict";

const processInput = (inputContent) => {
    const inputLines = inputContent.trim().split("\n");

    const dimensionParts = inputLines[0].split(" ");
    const gridHeight = parseInt(dimensionParts[0]);
    const gridWidth = parseInt(dimensionParts[1]);

    const alphabetSequence = Array.from({ length: 26 }, (_, charIndex) =>
        String.fromCharCode('A'.charCodeAt(0) + charIndex)
    );

    const flattenedGridItems = inputLines.slice(1, gridHeight + 1).flatMap(lineText =>
        lineText.split(" ")
    );

    const snukePosition = flattenedGridItems.indexOf("snuke");

    if (snukePosition !== -1) {
        const targetColumnIndex = snukePosition % gridWidth;
        const targetRowIndex = Math.floor(snukePosition / gridWidth);

        console.log(alphabetSequence[targetColumnIndex] + (targetRowIndex + 1));
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
