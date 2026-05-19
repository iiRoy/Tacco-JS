"use strict";

const parseGridDimensions = (dimensionLine) => {
    const parts = dimensionLine.split(" ");
    const height = parseInt(parts[0], 10);
    const width = parseInt(parts[1], 10);
    return { height, width };
};

const parseColorRepetitionCounts = (countsLine) => {
    return countsLine.split(" ").map(countStr => parseInt(countStr, 10));
};

const generateFlattenedColorSequence = (numDistinctColors, repetitionCounts) => {
    const sequence = [];
    for (let colorId = 1; colorId <= numDistinctColors; colorId++) {
        const currentRepetitions = repetitionCounts[colorId - 1];
        for (let k = 0; k < currentRepetitions; k++) {
            sequence.push(colorId);
        }
    }
    return sequence;
};

const processInputData = rawData => {
    const inputLines = rawData.trim().split("\n");

    const { height: gridHeight, width: gridWidth } = parseGridDimensions(inputLines[0]);
    
    const distinctColorsCount = parseInt(inputLines[1], 10);
    const colorRepetitions = parseColorRepetitionCounts(inputLines[2]);
    
    if (distinctColorsCount === 1) {
        console.log(1);
        return;
    }
    
    const flattenedColorSequence = generateFlattenedColorSequence(distinctColorsCount, colorRepetitions);
    
    const outputGridRows = [];
    let currentGridRow = [];

    for (let sequenceIndex = 0; sequenceIndex < flattenedColorSequence.length; sequenceIndex++) {
        currentGridRow.push(flattenedColorSequence[sequenceIndex]);
        
        if (sequenceIndex !== 0 && (sequenceIndex + 1) % gridWidth === 0) {
            if (sequenceIndex % 2 !== 0) {
                currentGridRow.reverse();
            }
            
            outputGridRows.push(currentGridRow.join(" "));
            currentGridRow = [];
        }
    }
    
    console.log(outputGridRows.join("\n"));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
