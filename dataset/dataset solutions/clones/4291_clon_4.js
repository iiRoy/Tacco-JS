class DataStreamProcessor {
    constructor(sourceData) {
        this.lineBuffer = sourceData;
        this.currentLineIndex = 0;
    }

    hasMoreLines() {
        return this.currentLineIndex < this.lineBuffer.length;
    }

    retrieveNextLine() {
        if (!this.hasMoreLines()) {
            return "";
        }
        return this.lineBuffer[this.currentLineIndex++];
    }
}

const valueTransformations = new Map([
    [1, val => parseInt(val, 10)],
    [2, val => val.split(" ")],
    [4, val => val.split(" ").map(Number)],
    [6, val => val.split("")],
    [7, val => val.split("").map(Number)],
    [8, arr => arr.join(" ")],
    [9, arr => arr.join("\n")],
    [0, arr => arr.join("")],
]);

function applyConversion(inputValue, conversionKey) {
    try {
        const handler = valueTransformations.get(conversionKey);
        return handler ? handler(inputValue) : inputValue;
    } catch (err) {
        return inputValue;
    }
}

function acquireStandardInput() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

let activeProcessor = new DataStreamProcessor(acquireStandardInput());

function obtainInteger() { return applyConversion(activeProcessor.retrieveNextLine(), 1); }
function obtainStringArray() { return applyConversion(activeProcessor.retrieveNextLine(), 2); }
function obtainNumericArray() { return applyConversion(activeProcessor.retrieveNextLine(), 4); }
function obtainCharacterArray() { return applyConversion(activeProcessor.retrieveNextLine(), 6); }
function obtainLine() { return activeProcessor.retrieveNextLine(); }
function checkMoreInput() { return activeProcessor.hasMoreLines(); }

function emitResult(content) { console.log(content); }
function recordDiagnostic(content) { console.error(content); }

function executeCoreLogic() {
    const primarySequence = obtainLine();
    const sequenceExtent = primarySequence.length;

    let nonXCharacters = [];
    let xSegmentOccurrences = [];
    let currentXAccumulator = 0;

    for (let charIndex = 0; charIndex < sequenceExtent; ++charIndex) {
        const character = primarySequence[charIndex];
        if (character === 'x') {
            currentXAccumulator++;
        } else {
            nonXCharacters.push(character);
            xSegmentOccurrences.push(currentXAccumulator);
            currentXAccumulator = 0;
        }
    }
    xSegmentOccurrences.push(currentXAccumulator);

    let isNonXPalindrome = true;
    const nonXLength = nonXCharacters.length;
    for (let i = 0; i < nonXLength / 2; ++i) {
        if (nonXCharacters[i] !== nonXCharacters[nonXLength - 1 - i]) {
            isNonXPalindrome = false;
            break;
        }
    }

    if (!isNonXPalindrome) {
        emitResult(-1);
        return;
    }

    let totalAdjustmentRequired = 0;
    const xCountsLength = xSegmentOccurrences.length;
    for (let i = 0; i < xCountsLength; ++i) {
        totalAdjustmentRequired += Math.abs(xSegmentOccurrences[i] - xSegmentOccurrences[xCountsLength - 1 - i]);
    }
    emitResult(totalAdjustmentRequired / 2);
}

executeCoreLogic();