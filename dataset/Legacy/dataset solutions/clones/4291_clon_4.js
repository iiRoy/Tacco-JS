class InputSource {
    #lineBuffer;
    #currentLinePointer;

    constructor() {
        const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
        this.#lineBuffer = rawInputContent.split("\n");
        this.#currentLinePointer = 0;
    }

    retrieveNextLine() {
        if (this.#currentLinePointer >= this.#lineBuffer.length) {
            return "";
        }
        return this.#lineBuffer[this.#currentLinePointer++];
    }
}

const inputHandler = new InputSource();

function outputResult(data) {
    console.log(data);
}

function outputDebugInfo(info) {
    console.error(info);
}

function processInputString() {
    const sourceStringValue = inputHandler.retrieveNextLine();
    const stringLengthValue = sourceStringValue.length;

    const filteredNonX = sourceStringValue.replace(/x/g, "");
    const reversedFilteredNonX = sourceStringValue.split("").filter(char => char !== 'x').reverse().join("");

    if (reversedFilteredNonX !== filteredNonX) {
        outputResult(-1);
        return;
    }

    const nonXCharacterPositions = [];
    for (let charIndex = 0; charIndex < stringLengthValue; ++charIndex) {
        if (sourceStringValue[charIndex] !== 'x') {
            nonXCharacterPositions.push(charIndex);
        }
    }

    const segmentBoundaries = [-1, ...nonXCharacterPositions, stringLengthValue];

    const xSegmentCounts = segmentBoundaries.slice(1).map((currentBoundary, index) => currentBoundary - segmentBoundaries[index] - 1);

    outputDebugInfo(xSegmentCounts);

    const totalSymmetricDifference = Array.from({ length: Math.floor(xSegmentCounts.length / 2) }, (_, k) => k)
        .reduce((accumulator, k) => accumulator + Math.abs(xSegmentCounts[k] - xSegmentCounts[xSegmentCounts.length - 1 - k]), 0);

    outputResult(totalSymmetricDifference / 2);
}

processInputString();
