'use strict';
function countSubstringOccurrences(sourceString, searchPattern) {
    let occurrenceCounter = 0;
    let currentScanPosition = 0;
    const patternLength = searchPattern.length;

    if (patternLength === 0) {
        return 0;
    }

    while (true) {
        const foundPosition = sourceString.indexOf(searchPattern, currentScanPosition);
        if (foundPosition === -1) {
            break;
        }
        occurrenceCounter++;
        currentScanPosition = foundPosition + patternLength;
    }
    return occurrenceCounter;
}

function processInputData(rawData) {
    const inputLines = rawData.split("\n");
    const mainTargetString = inputLines[1];
    const queryInstructions = inputLines.slice(2);

    for (const currentInstruction of queryInstructions) {
        const instructionParts = currentInstruction.split(" ");
        const startCharacterIndex = parseInt(instructionParts[0], 10) - 1;
        const endCharacterIndex = parseInt(instructionParts[1], 10);

        const extractedSegment = mainTargetString.slice(startCharacterIndex, endCharacterIndex);
        const acOccurrences = countSubstringOccurrences(extractedSegment, 'AC');
        console.log(acOccurrences);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
