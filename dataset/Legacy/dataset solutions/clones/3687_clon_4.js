class InputSource {
    constructor() {
        const rawInput = require("fs").readFileSync("/dev/stdin", "utf8").trim();
        this.inputLines = rawInput.split("\n");
        this.currentLineIndex = 0;
    }

    hasMoreInput() {
        return this.currentLineIndex < this.inputLines.length;
    }

    retrieveNext() {
        if (!this.hasMoreInput()) {
            return "";
        }
        const currentLine = this.inputLines[this.currentLineIndex];
        this.currentLineIndex++;
        return currentLine;
    }
}

const inputHandler = new InputSource();

const inputTransformers = {
    1: (val) => parseInt(val),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (val) => val.join(" "),
    9: (val) => val.join("\n"),
    0: (val) => val.join(""),
    default: (val) => val,
};

function applyTransformation(inputValue, transformationKey) {
    try {
        const transformer = inputTransformers[transformationKey] || inputTransformers.default;
        return transformer(inputValue);
    } catch (error) {
        return inputValue;
    }
}

function getNextInteger() { return applyTransformation(inputHandler.retrieveNext(), 1); }
function getNextStringArray() { return applyTransformation(inputHandler.retrieveNext(), 2); }
function getNextIntegerArray() { return applyTransformation(inputHandler.retrieveNext(), 4); }
function getNextCharacterArray() { return applyTransformation(inputHandler.retrieveNext(), 6); }

function displayOutput(content) { console.log(content); }
function logError(content) { console.error(content); }

function* generatePermutations(currentValues, depth, maxDepth, limit) {
    if (depth === maxDepth) {
        yield currentValues;
        return;
    }
    for (let val = 1; val <= limit; val++) {
        yield* generatePermutations([...currentValues, val], depth + 1, maxDepth, limit);
    }
}

function performCalculation() {
    const initialParameters = getNextIntegerArray();
    const rangeLimit = initialParameters[0];
    const ignoredValue = initialParameters[1];
    const targetDifference = initialParameters[2];

    const frequencyMap = new Map();

    for (const [valA, valB, valC, valD] of generatePermutations([], 0, 4, rangeLimit)) {
        let currentMatchCount = 0;
        currentMatchCount += (Math.abs(valA - valB) === targetDifference);
        currentMatchCount += (Math.abs(valC - valB) === targetDifference);
        currentMatchCount += (Math.abs(valC - valD) === targetDifference);

        frequencyMap.set(currentMatchCount, (frequencyMap.get(currentMatchCount) || 0) + 1);
    }
    
    displayOutput(Object.fromEntries(frequencyMap));
}

performCalculation();
