function processInput(rawData) {
    const inputLines = rawData.split("\n");

    const stringLength = Number.parseInt(inputLines[0], 10);
    const targetString = inputLines[1]; // JavaScript strings are immutable. S[i] = c is a no-op.
    const numQueries = Number.parseInt(inputLines[2], 10);

    const queryDataStartIndex = 3;
    const queryEntries = inputLines.slice(queryDataStartIndex, queryDataStartIndex + numQueries);

    const performCharUpdateAttempt = (charOneIndexedPosition, replacementChar) => {
        const zeroIndexedPosition = charOneIndexedPosition - 1;
        const currentCharacterAtPosition = targetString[zeroIndexedPosition];
        
        if (currentCharacterAtPosition !== replacementChar) {
            // In JavaScript, assigning to a string index (e.g., S[i] = c)
            // has no effect on the string itself. It's a silent no-op in non-strict mode.
            // This statement directly translates the original's action, preserving exact observable behavior.
            targetString[zeroIndexedPosition] = replacementChar;
        }
    };

    const calculateUniqueCharsInRange = (leftOneIndexed, rightOneIndexed, totalStringLength) => {
        const uniqueCharactersFound = new Set();

        const isRangeValidForProcessing = leftOneIndexed <= rightOneIndexed && leftOneIndexed < totalStringLength;

        if (isRangeValidForProcessing) {
            const startIndexZeroIndexed = leftOneIndexed - 1;
            const endIndexExclusiveZeroIndexed = rightOneIndexed - 1;

            for (let currentCharacterIndex = startIndexZeroIndexed; currentCharacterIndex < endIndexExclusiveZeroIndexed; currentCharacterIndex++) {
                if (currentCharacterIndex >= 0 && currentCharacterIndex < totalStringLength) {
                    uniqueCharactersFound.add(targetString[currentCharacterIndex]);
                }
            }
        }
        return uniqueCharactersFound.size;
    };

    for (const currentQueryLine of queryEntries) {
        const queryComponents = currentQueryLine.split(" ");
        const queryIdentifier = Number.parseInt(queryComponents[0], 10);

        switch (queryIdentifier) {
            case 1: {
                const charIndex = Number.parseInt(queryComponents[1], 10);
                const charValue = queryComponents[2];
                performCharUpdateAttempt(charIndex, charValue);
                break;
            }
            case 2: {
                const leftBoundary = Number.parseInt(queryComponents[1], 10);
                const rightBoundary = Number.parseInt(queryComponents[2], 10);
                const uniqueCount = calculateUniqueCharsInRange(leftBoundary, rightBoundary, stringLength);
                console.log(uniqueCount);
                break;
            }
            default: {
                break;
            }
        }
    }
}
