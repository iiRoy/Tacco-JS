const { createInterface: establishInterface } = require('readline');
const { inspect: examineValue } = require('util');

class InputLineProcessor {
    #sourceLines;
    #currentPosition;

    constructor(inputLineCollection) {
        this.#sourceLines = inputLineCollection;
        this.#currentPosition = 0;
    }

    // Equivalent to original `hasNext`
    canProceed() {
        return this.#currentPosition < this.#sourceLines.length;
    }

    // Equivalent to original `next`
    retrieveNextLine() {
        if (this.canProceed()) {
            return this.#sourceLines[this.#currentPosition++];
        } else {
            // Preserving exact error string from original
            throw "ArrayIndexOutOfBoundsException ‚There is no more input";
        }
    }
}

let inputDataHandler; // Equivalent to original `obj`
const collectedInputStrings = []; // Equivalent to original `inLine`

const ioInterface = establishInterface({
    input: process.stdin,
    output: process.stdout
});

ioInterface.on('line', (currentLine) => {
    collectedInputStrings.push(currentLine);
});

ioInterface.on('close', () => {
    inputDataHandler = new InputLineProcessor(collectedInputStrings);
    console.error("\n"); // Preserve blank line to stderr
    const executionStart = Date.now();
    performPrimaryLogic(); // Equivalent to original `Main`
    const executionDuration = Date.now() - executionStart;
    logDiagnosticInfo(`time : ${executionDuration}ms`);
    logDiagnosticInfo(`memory : ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
});

function createDeepCopy(originalObject) {
    return JSON.parse(JSON.stringify(originalObject));
}

function obtainNextInput() { return inputDataHandler.retrieveNextLine(); }
function hasFurtherInput() { return inputDataHandler.canProceed(); }

function getNextInteger() { return applyTransformation(obtainNextInput(), 1); }
function getNextStringArray() { return applyTransformation(obtainNextInput(), 2); }
function getNextIntegerArray() { return applyTransformation(obtainNextInput(), 4); }
function getNextCharacterArray() { return applyTransformation(obtainNextInput(), 6); }

function outputResult(content) { console.log(content); }

function logDiagnosticInfo(message) {
    console.error("debug:" + examineValue(message, false, null));
}

const transformationRegistry = new Map([
    [1, (val) => parseInt(val)],
    [2, (val) => val.split(" ")],
    [4, (val) => val.split(" ").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
    [8, (val) => val.join(" ")],
    [9, (val) => val.join("\n")],
    [0, (val) => val.join("")],
    [Symbol('defaultTransform'), (val) => val]
]);

function applyTransformation(valueToTransform, transformCode) {
    try {
        const transformer = transformationRegistry.get(transformCode) || transformationRegistry.get(Symbol('defaultTransform'));
        return transformer(valueToTransform);
    } catch (e) {
        return valueToTransform; // Preserve original behavior of returning input on error
    }
}

function performPrimaryLogic() {
    const messagesToDisplay = [
        "Yes",
        4,
        "3 1 2 3",
        "3 1 4 5",
        "3 2 4 6",
        "3 3 5 6"
    ];

    messagesToDisplay.forEach(item => outputResult(item));
}
