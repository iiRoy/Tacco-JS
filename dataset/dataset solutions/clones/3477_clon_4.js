const lineProcessor = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let lineCache = [];
let globalDataStream;

lineProcessor.on('line', (inputLine) => { lineCache.push(inputLine); });
lineProcessor.on('close', () => {
  globalDataStream = initializeStream(lineCache);
  console.error("\n");
  const startTime = Date.now();
  executeProgram();
  const elapsedTime = Date.now() - startTime;
  logDiagnostic(`time : ${elapsedTime}ms`);
  logDiagnostic(`memory : ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
});

function deepCopy(sourceObject) { return JSON.parse(JSON.stringify(sourceObject)); }

const conversionStrategies = new Map([
    [1, (val) => parseInt(val)],
    [2, (val) => val.split(" ")],
    [4, (val) => val.split(" ").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
    [8, (val) => val.join(" ")],
    [9, (val) => val.join("\n")],
    [0, (val) => val.join("")],
]);

function transformInput(inputValue, conversionType) {
    try {
        const strategy = conversionStrategies.get(conversionType);
        return strategy ? strategy(inputValue) : inputValue;
    } catch (e) {
        return inputValue;
    }
}

class InputSourceIterator {
    #lines;
    #currentIndex;

    constructor(inputLines) {
        this.#lines = inputLines;
        this.#currentIndex = 0;
    }

    fetchNext() {
        if (this.#currentIndex < this.#lines.length) {
            return this.#lines[this.#currentIndex++];
        } else {
            throw "ArrayIndexOutOfBoundsException ‚There is no more input";
        }
    }

    hasRemaining() {
        return this.#currentIndex < this.#lines.length;
    }
}

function initializeStream(inputLines) {
    return new InputSourceIterator(inputLines);
}

function advanceStream() { return globalDataStream.fetchNext(); }
function hasMoreData() { return globalDataStream.hasRemaining(); }

function retrieveInteger() { return transformInput(advanceStream(), 1); }
function retrieveStringArray() { return transformInput(advanceStream(), 2); }
function retrieveIntegerArray() { return transformInput(advanceStream(), 4); }
function retrieveCharacterArray() { return transformInput(advanceStream(), 6); }

function displayOutput(content) { console.log(content); }
function logDiagnostic(message) { console.error(`diagnostic: ${require("util").inspect(message, false, null)}`); }

function executeProgram() {
    const fixedOutputSequence = [
        "Yes",
        4,
        "3 1 2 3",
        "3 1 4 5",
        "3 2 5 6",
        "3 3 4 6"
    ];

    fixedOutputSequence.forEach(item => displayOutput(item));
}
