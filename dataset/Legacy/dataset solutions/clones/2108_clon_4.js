"use strict";

const processInput = (rawInput) => {
    const parsedLines = rawInput.trim().split("\n");
    const initialCharacterSequence = parsedLines[0].split("");
    const numberOfQueries = parseInt(parsedLines[1], 10);
    const queryInstructions = parsedLines.slice(2, numberOfQueries + 2);

    let processingState = {
        baseSegment: initialCharacterSequence,
        prefixElements: [],
        suffixElements: [],
        isOrientationReversed: false
    };

    const finalState = queryInstructions.reduce((accumulator, currentInstruction) => {
        const instructionParts = currentInstruction.split(" ");
        const instructionType = instructionParts[0];

        if (instructionType === "1") {
            accumulator.isOrientationReversed = !accumulator.isOrientationReversed;
        } else {
            const insertionPoint = instructionParts[1];
            const characterToInsert = instructionParts[2];

            if (!accumulator.isOrientationReversed) {
                if (insertionPoint === "1") {
                    accumulator.prefixElements.push(characterToInsert);
                } else {
                    accumulator.suffixElements.push(characterToInsert);
                }
            } else {
                if (insertionPoint === "1") {
                    accumulator.suffixElements.push(characterToInsert);
                } else {
                    accumulator.prefixElements.push(characterToInsert);
                }
            }
        }
        return accumulator;
    }, processingState);

    let constructedResult;
    if (!finalState.isOrientationReversed) {
        constructedResult = finalState.prefixElements.reverse().join("") +
                            finalState.baseSegment.join("") +
                            finalState.suffixElements.join("");
    } else {
        constructedResult = finalState.suffixElements.reverse().join("") +
                            finalState.baseSegment.reverse().join("") +
                            finalState.prefixElements.join("");
    }

    console.log(constructedResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
