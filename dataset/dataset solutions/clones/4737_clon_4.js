class LineIterator {
    constructor(dataSegments) {
        this.dataStore = dataSegments;
        this.currentPosition = 0;
        this.totalCount = dataSegments.length;
    }

    retrieveNext() {
        if (!this.hasMore()) {
            throw new Error("NoSuchElementException:次に要素は無いよ");
        }
        const currentItem = this.dataStore[this.currentPosition];
        this.currentPosition++;
        return currentItem;
    }

    hasMore() {
        return this.currentPosition < this.totalCount;
    }
}

const sourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
const lineProcessor = new LineIterator(sourceLines);

function fetchNextLine() { return lineProcessor.retrieveNext(); }
function checkMoreLines() { return lineProcessor.hasMore(); }

const dataTransformationMap = {
    1: (val) => parseInt(val),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (val) => val.join(" "),
    9: (val) => val.join("\n"),
    0: (val) => val.join("")
};

function applyTransformation(inputValue, transformationKey) {
    try {
        const handler = dataTransformationMap[transformationKey];
        if (handler) {
            return handler(inputValue);
        }
        return inputValue;
    } catch (e) {
        return inputValue;
    }
}

function fetchNextInteger() { return applyTransformation(fetchNextLine(), 1); }
function fetchStringArray() { return applyTransformation(fetchNextLine(), 2); }
function fetchIntegerArray() { return applyTransformation(fetchNextLine(), 4); }
function fetchCharacterArray() { return applyTransformation(fetchNextLine(), 6); }

function displayResult(content) { console.log(content); }
function reportError(content) { console.error(content); }

function performComputation() {
    const inputNumber = fetchNextInteger();
    const baseValue = Math.floor(inputNumber / 11) * 2;
    const remainderValue = inputNumber % 11;

    const additionalValue = (remainderValue > 0 ? 1 : 0) + (remainderValue >= 6 ? 1 : 0);

    const calculatedValue = baseValue + additionalValue;

    displayResult(calculatedValue);
}

performComputation();
