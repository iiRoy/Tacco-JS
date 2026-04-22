function processInput(textualData) {
    const contentLines = textualData.trim().split('\n');
    const initialSegmentTokens = contentLines[0].split(' ');
    const startingSequence = initialSegmentTokens[0];
    const totalOperations = Number.parseInt(contentLines[1], 10);
    const operationEntries = contentLines.slice(2, 2 + totalOperations).map(entryText => entryText.split(' '));

    const initialProcessingState = {
        characterBuffer: Array.from(startingSequence),
        orientationReversed: false
    };

    const finalProcessingState = operationEntries.reduce((currentState, currentInstruction) => {
        let { characterBuffer, orientationReversed } = currentState;
        const instructionVariant = currentInstruction[0];

        if (instructionVariant === '1') {
            orientationReversed = !orientationReversed;
        } else {
            const insertionDirection = currentInstruction[1]; // '1' for front, '2' for back
            const charToInsert = currentInstruction[2];

            if ((insertionDirection === '1' && !orientationReversed) || (insertionDirection === '2' && orientationReversed)) {
                // Conceptually adding to the front (physical unshift)
                characterBuffer.unshift(charToInsert);
            } else {
                // Conceptually adding to the back (physical push)
                characterBuffer.push(charToInsert);
            }
        }
        return { characterBuffer, orientationReversed };
    }, initialProcessingState);

    if (finalProcessingState.orientationReversed) {
        console.log(finalProcessingState.characterBuffer.reverse().join(''));
    } else {
        console.log(finalProcessingState.characterBuffer.join(''));
    }
}

processInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));