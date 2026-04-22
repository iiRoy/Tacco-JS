function acquireSourceData() {
    const filesystemInterface = require("fs");
    const inputPathIdentifier = "/dev/stdin";
    const characterEncodingType = "utf-8";
    return filesystemInterface.readFileSync(inputPathIdentifier, characterEncodingType);
}

function processInstructions(sourceData) {
    const segmentedLines = sourceData.split('\n');
    let initialTextSequence = segmentedLines[0];
    const numberOfOperations = +segmentedLines[1];
    const operationDirectives = segmentedLines.slice(2, 2 + numberOfOperations);

    let currentCharacterArray = initialTextSequence.split('');

    const operationDispatchTable = {
        "print": (currentCharsState, instructionParts) => {
            const startPosition = +instructionParts[1];
            const endPosition = +instructionParts[2];
            console.log(currentCharsState.slice(startPosition, endPosition + 1).join(''));
            return currentCharsState;
        },
        "replace": (currentCharsState, instructionParts) => {
            const startPosition = +instructionParts[1];
            const endPosition = +instructionParts[2];
            const replacementContent = instructionParts[3];
            const leadingSegment = currentCharsState.slice(0, startPosition);
            const trailingSegment = currentCharsState.slice(endPosition + 1);
            return [...leadingSegment, ...replacementContent.split(''), ...trailingSegment];
        },
        "reverse": (currentCharsState, instructionParts) => {
            const startPosition = +instructionParts[1];
            const endPosition = +instructionParts[2];
            const preSubsegment = currentCharsState.slice(0, startPosition);
            const subsegmentToReverse = currentCharsState.slice(startPosition, endPosition + 1);
            const postSubsegment = currentCharsState.slice(endPosition + 1);
            const invertedSubsegment = subsegmentToReverse.reverse();
            return [...preSubsegment, ...invertedSubsegment, ...postSubsegment];
        }
    };

    operationDirectives.reduce((accumulatedCharacterState, currentDirectiveLine) => {
        const directiveComponents = currentDirectiveLine.split(' ');
        const commandIdentifier = directiveComponents[0];
        const handlerFunction = operationDispatchTable[commandIdentifier];
        if (handlerFunction) {
            return handlerFunction(accumulatedCharacterState, directiveComponents);
        }
        return accumulatedCharacterState;
    }, currentCharacterArray);
}

processInstructions(acquireSourceData());