"use strict";

const fileSystemModule = require("fs"); // Type III: Introduced helper variable for 'fs' module.

// Type III: Replaced the 'create' factory function with a class-based structure.
class InputProcessor {
    constructor() {
        // Type III: Split the chained method calls for reading and processing input.
        const rawInputString = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        const processedLines = rawInputString.trim().split("\n");

        this.dataLines = processedLines; // Renamed 'list' to 'dataLines'
        this.currentLineIndex = 0;       // Renamed 'index' to 'currentLineIndex'
        this.totalLines = processedLines.length; // Renamed 'max' to 'totalLines'
    }

    // Renamed 'hasNext' to 'hasMoreLines' and made it a class method.
    hasMoreLines() {
        return this.currentLineIndex < this.totalLines;
    }

    // Renamed 'next' to 'getNextLine' and made it a class method.
    getNextLine() {
        if (!this.hasMoreLines()) {
            // Type III: Introduced a temporary constant for the error message.
            const outOfBoundsErrorIdentifier = "ArrayIndexOutOfBoundsException";
            throw outOfBoundsErrorIdentifier;
        }
        return this.dataLines[this.currentLineIndex++];
    }
}

// Renamed 'o' to 'inputHandlerInstance' and instantiated the new class.
const inputHandlerInstance = new InputProcessor();

// Type III: Grouped utility functions and renamed them for clarity.
// Introduced a temporary constant for the parseInt function.
const integerParsingFunction = parseInt;

const getNextInputLine = () => inputHandlerInstance.getNextLine(); // Renamed 'next'
const readInteger = () => integerParsingFunction(inputHandlerInstance.getNextLine()); // Renamed 'nextInt'
const readStringArray = () => inputHandlerInstance.getNextLine().split(" "); // Renamed 'nextStrArray'
const readIntegerArray = () => inputHandlerInstance.getNextLine().split(" ").map(element => integerParsingFunction(element)); // Renamed 'nextIntArray'
const readCharacterArray = () => inputHandlerInstance.getNextLine().split(""); // Renamed 'nextCharArray'
const checkHasMoreInput = () => inputHandlerInstance.hasMoreLines(); // Renamed 'hasNext'

// Renamed 'myout' to 'outputToConsole'
const outputToConsole = (...outputArgs) => console.log(...outputArgs);

// Renamed 'fn' to 'computeFactorialValue'
const computeFactorialValue = (inputNumber) => {
    // Type III: Added guard clauses for non-positive inputs.
    // Factorial of negative numbers is undefined, returning 1n preserves behavior for expected positive inputs.
    if (inputNumber < 0n) {
        return 1n;
    }
    if (inputNumber === 0n) {
        return 1n; // 0! = 1
    }

    let factorialResult = 1n; // Renamed 'ans'
    // Type III: Changed the 'for' loop to a 'while' loop and introduced a temporary variable for the loop counter.
    let currentMultiplier = 1n; // Renamed 'i'
    while (currentMultiplier <= inputNumber) {
        factorialResult *= currentMultiplier;
        currentMultiplier++;
    }
    return factorialResult;
};

// Renamed 'Main' to 'executePrimaryCalculation'
const executePrimaryCalculation = () => {
    // Type III: Split the array destructuring into two distinct steps.
    const inputValuesArray = readIntegerArray();
    const [valueN, valueM] = inputValuesArray; // Renamed 'n', 'm'

    // Type III: Introduced a constant for the modulo value.
    const MODULO_DIVISOR = 1000000007n;

    // Type III: Introduced an intermediate variable for the product before the final modulo reduction.
    let calculatedProduct = computeFactorialValue(valueN) * computeFactorialValue(valueM) * 2n; // Renamed 'ans'

    // The modulo reduction loop, preserving original behavior.
    while (calculatedProduct > MODULO_DIVISOR) {
        calculatedProduct /= MODULO_DIVISOR;
    }
    outputToConsole(Number(calculatedProduct));
};

// Type III: Encapsulated the main execution call within a dedicated function.
const startApplicationProcess = () => {
    executePrimaryCalculation();
};

startApplicationProcess();
