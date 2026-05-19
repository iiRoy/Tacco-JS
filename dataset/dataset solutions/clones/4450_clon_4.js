"use strict";

const processInputData = (inputContent) => {
    const parsedLines = inputContent.trim().split("\n");

    const dimensionValues = parsedLines[0].split(" ");
    const gridHeight = parseInt(dimensionValues[0]);
    const gridWidth = parseInt(dimensionValues[1]);

    const elementCount = parseInt(parsedLines[1]);
    const elementQuantities = parsedLines[2].split(" ").map(Number);

    if (elementCount === 1) {
        console.log(1);
        return;
    }

    const flattenedSequence = elementQuantities.flatMap((countValue, indexValue) =>
        Array(countValue).fill(indexValue + 1)
    );

    const outputLines = flattenedSequence.reduce((accumulator, currentElement, currentIndex) => {
        const currentSegmentIndex = Math.floor(currentIndex / gridWidth);
        const positionInSegment = currentIndex % gridWidth;

        if (positionInSegment === 0) {
            accumulator.push([]);
        }

        accumulator[currentSegmentIndex].push(currentElement);

        if (positionInSegment === gridWidth - 1) {
            if (currentIndex % 2 !== 0) {
                accumulator[currentSegmentIndex].reverse();
            }
        }
        return accumulator;
    }, [])
    .filter(segment => segment.length === gridWidth)
    .map(segment => segment.join(" "));

    console.log(outputLines.join("\n"));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
