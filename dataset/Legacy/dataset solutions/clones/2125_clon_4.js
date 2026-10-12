function createInputProcessor(sourceText) {
    const dataLines = sourceText.split("\n");
    let currentLinePointer = 0;

    const fetchNextLine = () => dataLines[currentLinePointer++];
    const fetchNextInteger = () => parseInt(fetchNextLine(), 10);
    const fetchNextString = () => fetchNextLine();
    const fetchNextTokenizedLine = () => fetchNextLine().split(" ");

    return {
        fetchNextInteger,
        fetchNextString,
        fetchNextTokenizedLine,
    };
}

function ProcessApplication(sourceInput) {
    const processor = createInputProcessor(sourceInput);

    const totalStringLength = processor.fetchNextInteger();
    const initialCharacterSequence = processor.fetchNextString();
    const numberOfOperations = processor.fetchNextInteger();

    const characterStore = new Map(); // Using a Map for character storage instead of an array
    for (let charIndex = 0; charIndex < totalStringLength; ++charIndex) {
        characterStore.set(charIndex, initialCharacterSequence[charIndex]);
    }

    for (let opCount = 0; opCount < numberOfOperations; ++opCount) {
        const operationDetails = processor.fetchNextTokenizedLine();
        const operationType = parseInt(operationDetails[0], 10);

        // Divergent control flow: using if-else if instead of switch
        if (operationType === 1) {
            const targetPositionOneBased = parseInt(operationDetails[1], 10);
            const newCharacterValue = operationDetails[2];
            const zeroBasedTarget = targetPositionOneBased - 1;

            // Preserve original optimization: only update if value differs
            if (characterStore.get(zeroBasedTarget) !== newCharacterValue) {
                characterStore.set(zeroBasedTarget, newCharacterValue);
            }
        } else if (operationType === 2) {
            const queryRangeStartOneBased = parseInt(operationDetails[1], 10);
            const queryRangeEndOneBased = parseInt(operationDetails[2], 10);

            const uniqueCharacterCollector = new Set(); // Using a Set directly for unique elements

            // Replicate original condition: l <= r && l < N
            // This means the range must start before the N-th element (0-indexed N-1)
            if (queryRangeStartOneBased <= queryRangeEndOneBased && queryRangeStartOneBased < totalStringLength) {
                // Different loop structure and variable names
                for (let currentScanPosition = queryRangeStartOneBased; currentScanPosition <= queryRangeEndOneBased; ++currentScanPosition) {
                    const charAtCurrentPosition = characterStore.get(currentScanPosition - 1);
                    uniqueCharacterCollector.add(charAtCurrentPosition);
                }
            }
            // Use template literal for output formatting
            console.log(`${uniqueCharacterCollector.size}\n`);
        }
        // No explicit default case, matching original behavior
    }
}

ProcessApplication(require("fs").readFileSync("/dev/stdin", "utf8"));
