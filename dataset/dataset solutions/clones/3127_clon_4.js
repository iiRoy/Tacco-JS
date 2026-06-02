class InputProcessor {
    #lineBuffer;
    #currentLineIndex = 0;
    #currentLineTokens = [];

    constructor(rawInputContent) {
        this.#lineBuffer = rawInputContent.trim().split("\n");
    }

    #ensureTokenAvailability() {
        while (this.#currentLineTokens.length === 0 && this.#currentLineIndex < this.#lineBuffer.length) {
            const currentRawLine = this.#lineBuffer[this.#currentLineIndex];
            this.#currentLineTokens = currentRawLine.split(" ");
            this.#currentLineIndex++;
        }
    }

    fetchNextValue(returnAsString = false) {
        this.#ensureTokenAvailability();
        if (this.#currentLineTokens.length === 0) {
            return undefined;
        }
        const extractedValue = this.#currentLineTokens.shift();
        return returnAsString ? extractedValue : Number(extractedValue);
    }

    fetchLineValues(returnAsString = false) {
        if (this.#currentLineIndex >= this.#lineBuffer.length) {
            return undefined;
        }
        const lineContent = this.#lineBuffer[this.#currentLineIndex++];
        const splitValues = lineContent.split(" ");
        return returnAsString ? splitValues : splitValues.map(Number);
    }

    fetchConsecutiveLines(count, returnAsString = false) {
        const collectedLines = [];
        for (let i = 0; i < count; i++) {
            if (this.#currentLineIndex >= this.#lineBuffer.length) {
                break;
            }
            const lineData = this.#lineBuffer[this.#currentLineIndex++];
            collectedLines.push(returnAsString ? lineData : Number(lineData));
        }
        return collectedLines;
    }
}

function calculateSequencePaths() {
    const dataHandler = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));
    const primeModulo = 1e9 + 7;

    const sequenceLength = dataHandler.fetchNextValue();
    const colorIdentifiers = dataHandler.fetchConsecutiveLines(sequenceLength);

    const colorPositionMap = new Map();

    colorIdentifiers.forEach((identifier, currentPosition) => {
        if (!colorPositionMap.has(identifier)) {
            colorPositionMap.set(identifier, []);
        }
        colorPositionMap.get(identifier).push(currentPosition);
    });

    colorPositionMap.forEach(positions => {
        if (positions.length > 0) {
            positions.shift();
        }
    });

    const dynamicProgrammingTable = new Array(sequenceLength).fill(0);
    dynamicProgrammingTable[0] = 1;

    const firstIdentifier = colorIdentifiers[0];
    const subsequentPositionsForFirst = colorPositionMap.get(firstIdentifier);
    const nextRelevantPosition = subsequentPositionsForFirst ? subsequentPositionsForFirst.shift() : undefined;

    if (nextRelevantPosition !== undefined && nextRelevantPosition > 1) {
        dynamicProgrammingTable[nextRelevantPosition] = 1;
    }

    Array.from({ length: sequenceLength - 1 }, (_, currentIterationIndex) => currentIterationIndex + 1)
        .forEach(currentSequenceIndex => {
            dynamicProgrammingTable[currentSequenceIndex] = (dynamicProgrammingTable[currentSequenceIndex] + dynamicProgrammingTable[currentSequenceIndex - 1]) % primeModulo;

            const currentIdentifier = colorIdentifiers[currentSequenceIndex];
            const subsequentPositionsForCurrent = colorPositionMap.get(currentIdentifier);
            const nextRelevantPositionForCurrent = subsequentPositionsForCurrent ? subsequentPositionsForCurrent.shift() : undefined;

            if (nextRelevantPositionForCurrent !== undefined && nextRelevantPositionForCurrent > currentSequenceIndex + 1) {
                dynamicProgrammingTable[nextRelevantPositionForCurrent] = dynamicProgrammingTable[currentSequenceIndex];
            }
        });

    return dynamicProgrammingTable[sequenceLength - 1];
}

console.log(calculateSequencePaths());
