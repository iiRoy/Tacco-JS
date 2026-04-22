"use strict";

const processInputData =    (rawInputText)    =>   {

        rawInputText = rawInputText .trim() .split ( "\n" );

    const matrixHeight =         parseInt (rawInputText[0].split(" ")[0]);
    const matrixWidth  = parseInt( rawInputText[0] .split(" ")[1] );

    const numberOfDistinctColors = parseInt(rawInputText[1]);
    const colorQuantities        = rawInputText[2].split(" ").map( numberString => parseInt(numberString) );

    let flatPixelSequence = [];

    // Early exit for a 1x1 grid
    if (matrixHeight * matrixWidth === 1) {
        console.log(1);
        return;
    }

    // Populate the flat pixel sequence based on color quantities
    for (let colorIdentifier = 1; colorIdentifier <= numberOfDistinctColors; colorIdentifier++) {
        for (let pixelCountIterator = 0; pixelCountIterator < colorQuantities[colorIdentifier - 1]; pixelCountIterator++) {
            flatPixelSequence.push(colorIdentifier);
        }
    }

    let finalOutputLines =    [];
    let currentLineBuffer = [];

    // Arrange the flat sequence into rows, reversing every other row
    for (let sequenceIndex = 0; sequenceIndex < flatPixelSequence.length; sequenceIndex++) {

        currentLineBuffer.push(flatPixelSequence[sequenceIndex]);

        // Check if the current row is complete
        if (sequenceIndex !== 0 && (parseInt(sequenceIndex) + 1) % matrixWidth === 0) {

            // Reverse the row if its 0-based index is odd (i.e., it's the second, fourth, etc. full row)
            if (sequenceIndex % 2 !== 0) {
                currentLineBuffer.reverse();
            }

            finalOutputLines.push(currentLineBuffer.join(" "));
            currentLineBuffer = []; // Reset buffer for the next row
        }
    }

    console.log(finalOutputLines.join("\n"));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));