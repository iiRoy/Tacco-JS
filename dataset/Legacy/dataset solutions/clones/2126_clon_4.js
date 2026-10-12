function ProcessInput(rawData) {
    const processedLines = rawData.split("\n").map(entry => entry.trim());

    const sequenceLength = parseInt(processedLines[0], 10);
    let characterSequence = processedLines[1].split(''); // Convert string to mutable character array
    const operationCount = parseInt(processedLines[2], 10);

    const parsedOperations = Array.from({ length: operationCount }, (_, idx) => {
        const operationLine = processedLines[3 + idx];
        const components = operationLine.split(" ");
        const operationKind = parseInt(components[0], 10);

        switch (operationKind) {
            case 1:
                return {
                    kind: operationKind,
                    targetPosition: parseInt(components[1], 10), // 1-indexed
                    newValue: components[2]
                };
            case 2:
                return {
                    kind: operationKind,
                    queryStart: parseInt(components[1], 10), // 1-indexed inclusive
                    queryEnd: parseInt(components[2], 10)    // 1-indexed exclusive
                };
            default:
                return { kind: operationKind }; // Handle unexpected types gracefully
        }
    });

    parsedOperations.forEach(currentOperation => {
        switch (currentOperation.kind) {
            case 1:
                // The original code had `if(S[i] !== c)S[i] = c;`.
                // If S is a mutable array, direct assignment is the intended behavior
                // and the `if` condition is an optimization that doesn't change observable behavior.
                characterSequence[currentOperation.targetPosition - 1] = currentOperation.newValue;
                break;
            case 2:
                const queryStart = currentOperation.queryStart;
                const queryEnd = currentOperation.queryEnd;
                const uniqueElements = new Set();

                // Original condition: if(l <= r && l < N)
                // l is queryStart (1-indexed), N is sequenceLength
                if (queryStart <= queryEnd && queryStart < sequenceLength) {
                    // Convert 1-indexed range [queryStart, queryEnd) to 0-indexed [effectiveStartIndex, effectiveEndIndex)
                    const effectiveStartIndex = Math.max(0, queryStart - 1);
                    const effectiveEndIndex = Math.min(sequenceLength, queryEnd - 1);

                    // Populate the Set with characters from the determined range
                    Array.from({ length: effectiveEndIndex - effectiveStartIndex }, (_, indexOffset) => {
                        const charIndex = effectiveStartIndex + indexOffset;
                        return characterSequence[charIndex];
                    }).forEach(element => uniqueElements.add(element));
                }
                console.log(uniqueElements.size);
                break;
            default:
                // No action for unknown types, preserving original default behavior
                break;
        }
    });
}
