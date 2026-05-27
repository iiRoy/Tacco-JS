const inputReaderFactory = (() => {
    const createInputReader = (rawInputContent) => {
        const allInputLines = rawInputContent.trim().split('\n');
        let globalLinePointer = 0; // Tracks the next line to be consumed by any method

        // State for readSingleItem, which consumes words from a line
        let singleItemLineBuffer = [];
        let singleItemWordPointer = 0;

        // Helper to ensure singleItemLineBuffer is ready for the next word
        const prepareSingleItemBuffer = () => {
            // If the buffer is exhausted or not yet initialized, and there are more lines
            if (singleItemWordPointer >= singleItemLineBuffer.length && globalLinePointer < allInputLines.length) {
                singleItemLineBuffer = allInputLines[globalLinePointer].split(' ');
                singleItemWordPointer = 0;
                globalLinePointer++; // Advance global line pointer after consuming a line for single items
            }
        };

        // Initialize the buffer for the first call to readSingleItem
        prepareSingleItemBuffer();

        const readSingleItem = (asString = false) => {
            prepareSingleItemBuffer(); // Ensure buffer is ready
            if (singleItemWordPointer >= singleItemLineBuffer.length) {
                return asString ? '' : NaN; // No more items
            }
            const item = singleItemLineBuffer[singleItemWordPointer++];
            return asString ? item : Number(item);
        };

        const readLineItems = (asString = false) => {
            if (globalLinePointer >= allInputLines.length) {
                return asString ? [] : [];
            }
            const lineContent = allInputLines[globalLinePointer];
            globalLinePointer++; // Advance global line pointer
            // Reset single item buffer state as a whole line was consumed by this method
            singleItemLineBuffer = [];
            singleItemWordPointer = 0;

            const words = lineContent.split(' ');
            return asString ? words : words.map(Number);
        };

        const readMatrix = (rowCount, asString = false) => {
            const matrix = [];
            for (let i = 0; i < rowCount; i++) {
                matrix.push(readLineItems(asString));
            }
            return matrix;
        };

        const readRows = (rowCount, asString = false) => {
            const rows = [];
            for (let i = 0; i < rowCount; i++) {
                if (globalLinePointer >= allInputLines.length) {
                    rows.push(asString ? '' : NaN); // Handle end of input
                    continue;
                }
                const lineContent = allInputLines[globalLinePointer];
                globalLinePointer++; // Advance global line pointer
                // Reset single item buffer state
                singleItemLineBuffer = [];
                singleItemWordPointer = 0;
                rows.push(asString ? lineContent : Number(lineContent));
            }
            return rows;
        };

        return {
            readSingleItem,
            readLineItems,
            readMatrix,
            readRows
        };
    };
    return createInputReader;
})();

const initializeMultiArray = (initialValue, ...dimensions) => {
    const buildArrayRecursively = (dims, currentDepth) => {
        if (currentDepth === dims.length - 1) {
            return Array(dims[currentDepth]).fill(initialValue);
        }
        return Array(dims[currentDepth]).fill(0).map(() => buildArrayRecursively(dims, currentDepth + 1));
    };
    return buildArrayRecursively(dimensions, 0);
};

const dataStream = inputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(solveMatchingProblem());

function solveMatchingProblem() {
    const participantCount = dataStream.readSingleItem();
    let preferenceList = dataStream.readMatrix(participantCount);
    preferenceList = preferenceList.map(row => row.map(item => item - 1));

    let currentPreferencePointers = initializeMultiArray(0, participantCount);
    let activeParticipantsQueue = Array.from({ length: participantCount }, (_, idx) => idx);

    const conductMatchingRound = (roundNumber, currentPointers, participantsInRound) => {
        if (participantsInRound.length === 0) {
            return { finalRoundCount: roundNumber, finalPointers: currentPointers };
        }

        let nextPointers = [...currentPointers];
        let nextRoundParticipants = [];
        let participantsPairedThisRound = new Set();

        participantsInRound.forEach(currentParticipant => {
            if (participantsPairedThisRound.has(currentParticipant) || nextPointers[currentParticipant] >= participantCount - 1) {
                return;
            }

            const preferredPartner = preferenceList[currentParticipant][nextPointers[currentParticipant]];

            if (
                nextPointers[preferredPartner] < participantCount - 1 &&
                currentParticipant === preferenceList[preferredPartner][nextPointers[preferredPartner]] &&
                !participantsPairedThisRound.has(preferredPartner)
            ) {
                nextPointers[currentParticipant]++;
                nextPointers[preferredPartner]++;
                nextRoundParticipants.push(currentParticipant, preferredPartner);
                participantsPairedThisRound.add(currentParticipant);
                participantsPairedThisRound.add(preferredPartner);
            }
        });

        return conductMatchingRound(roundNumber + 1, nextPointers, nextRoundParticipants);
    };

    const simulationResult = conductMatchingRound(0, currentPreferencePointers, activeParticipantsQueue);

    for (let i = 0; i < participantCount; i++) {
        if (simulationResult.finalPointers[i] !== participantCount - 1) {
            return -1;
        }
    }

    return simulationResult.finalRoundCount;
}
