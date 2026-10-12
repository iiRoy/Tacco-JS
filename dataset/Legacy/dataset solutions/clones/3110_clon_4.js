class InputHandler {
    constructor() {
        const sourceText = require("fs").readFileSync("/dev/stdin", "utf8").trim();
        this.lineBuffer = sourceText.split("\n");
        this.currentLineIndex = 0;
        this.totalLines = this.lineBuffer.length;
    }

    moreLinesAvailable() {
        return this.currentLineIndex < this.totalLines;
    }

    retrieveNextLine() {
        if (!this.moreLinesAvailable()) {
            return "";
        }
        return this.lineBuffer[this.currentLineIndex++];
    }
}

const inputSource = new InputHandler();

const dataTransformers = new Map([
    [1, (val) => parseInt(val, 10)],
    [2, (val) => val.split(" ")],
    [4, (val) => val.split(" ").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
    [8, (arr) => arr.join(" ")],
    [9, (arr) => arr.join("\n")],
    [0, (arr) => arr.join("")],
]);

function transformData(input, typeCode) {
    try {
        const transformer = dataTransformers.get(typeCode);
        return transformer ? transformer(input) : input;
    } catch (e) {
        return input;
    }
}

function getNextInteger() { return transformData(inputSource.retrieveNextLine(), 1); }
function getNextStringArray() { return transformData(inputSource.retrieveNextLine(), 2); }
function getNextIntegerArray() { return transformData(inputSource.retrieveNextLine(), 4); }
function getNextCharacterArray() { return transformData(inputSource.retrieveNextLine(), 6); }

function emitResult(content) { console.log(content); }
function signalError(content) { console.error(content); }

function processPermutation(currentSequence, collectedElements = []) {
    if (currentSequence.length === 0) {
        return collectedElements;
    }

    let removalCandidateIndex = -1;
    let currentPrefixMatchLength = 0;

    for (let k = 0; k < currentSequence.length; k++) {
        if (currentSequence[k] === k + 1) {
            currentPrefixMatchLength++;
        } else {
            removalCandidateIndex = k - 1;
            break;
        }
    }

    if (removalCandidateIndex === -1) {
        removalCandidateIndex = currentSequence.length - 1;
    }

    const elementToCollect = currentSequence[removalCandidateIndex];
    const updatedSequence = currentSequence.filter((_, idx) => idx !== removalCandidateIndex);
    const updatedCollectedElements = [elementToCollect, ...collectedElements];

    return processPermutation(updatedSequence, updatedCollectedElements);
}

function executeProcessing() {
    const elementCount = getNextInteger();
    const initialSequence = getNextIntegerArray();

    const invalidSequenceDetected = initialSequence.some((value, index) => value > index + 1);
    if (invalidSequenceDetected) {
        emitResult(-1);
        return;
    }

    const finalOrder = processPermutation(initialSequence);
    emitResult(transformData(finalOrder, 9));
}

executeProcessing();
