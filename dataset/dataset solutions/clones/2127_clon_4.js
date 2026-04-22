const processInputData = (rawInputContent) => {
    const contentLines = rawInputContent.split('\n').filter(Boolean);
    let currentLineIndex = 0;

    const initialSequenceLength = Number(contentLines[currentLineIndex++]);
    const originalCharacterSequence = contentLines[currentLineIndex++];
    const totalOperations = Number(contentLines[currentLineIndex++]);

    const characterStore = new Map();
    Array.from(originalCharacterSequence).forEach((charElement, charIndex) => {
        characterStore.set(charIndex, charElement);
    });

    const collectedResults = [];

    for (let operationIndex = 0; operationIndex < totalOperations; operationIndex++) {
        const currentOperationDetails = contentLines[currentLineIndex++].split(' ');
        const operationKindIdentifier = Number(currentOperationDetails[0]);

        if (operationKindIdentifier === 1) {
            const targetZeroBasedPosition = Number(currentOperationDetails[1]) - 1;
            const newCharacterValue = currentOperationDetails[2];

            if (characterStore.get(targetZeroBasedPosition) !== newCharacterValue) {
                characterStore.set(targetZeroBasedPosition, newCharacterValue);
            }
        } else if (operationKindIdentifier === 2) {
            const rangeStartZeroBased = Number(currentOperationDetails[1]) - 1;
            const rangeEndZeroBased = Number(currentOperationDetails[2]) - 1;

            const distinctCharactersFound = new Set();
            for (let segmentIndex = rangeStartZeroBased; segmentIndex <= rangeEndZeroBased; segmentIndex++) {
                distinctCharactersFound.add(characterStore.get(segmentIndex));
            }
            collectedResults.push(distinctCharactersFound.size);
        }
    }

    console.log(collectedResults.map(entry => entry.toString()).join('\n') + (collectedResults.length > 0 ? '\n' : ''));
};

const triggerProgramExecution = (sourcePath) => {
    const fileContents = require("node:fs").readFileSync(sourcePath, "utf8");
    processInputData(fileContents);
};

triggerProgramExecution("/dev/stdin");