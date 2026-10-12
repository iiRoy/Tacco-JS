"use strict";

// This function processes the main logic based on the provided input data.
function ProcessInput(rawData) {
    // Initialize a data parser to handle input tokens.
    let dataParser = new TextInterpreter(rawData);

    // Read the total number of queries to process.
    let numQueries = dataParser.fetchInteger();

    // Iterate through each query.
    for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
        // Fetch two integer operands for the current query.
        let firstOperand = dataParser.fetchInteger();
        let secondOperand = dataParser.fetchInteger();

        // Case 1: If both operands are equal.
        if (firstOperand === secondOperand) {
            console.log(2 * firstOperand - 2);
        }
        // Case 2: If operands are consecutive (e.g., 5 and 6, or 6 and 5).
        else if (firstOperand + 1 === secondOperand || secondOperand + 1 === firstOperand) {
            console.log(2 * Math.min(firstOperand, secondOperand) - 2);
        }
        // Case 3: General case for other operand pairs.
        else {
            // Calculate the product of the two operands.
            let productValue = firstOperand * secondOperand;
            // Find the floor of the square root of the product.
            let floorSqrt = Math.floor(Math.sqrt(productValue));

            // Adjust floorSqrt if its square is exactly the product (to ensure d*(d+1) logic works correctly).
            if (floorSqrt * floorSqrt === productValue) {
                floorSqrt--;
            }

            // Determine the output based on the relationship between floorSqrt and productValue.
            if (floorSqrt * (floorSqrt + 1) >= productValue) {
                console.log(2 * floorSqrt - 2);
            } else {
                console.log(2 * floorSqrt - 1);
            }
        }
    }
}

// A utility class for parsing various data types from a string input.
class TextInterpreter {
    // Constructor initializes the interpreter with the raw input string.
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') {
            throw new Error('Input string argument cannot be omitted!');
        }
        // Initialize position counter and split the input into tokens.
        this.readPosition = 0;
        this.parsedTokens = sourceText.split(/\n|\s/);
    }

    // Retrieves the next token as an integer.
    fetchInteger() {
        return parseInt(this.parsedTokens[this.readPosition++], 10);
    }

    // Retrieves an array of integers of a specified length.
    fetchIntegerArray(arrayLength) {
        if (typeof arrayLength === 'undefined') {
            throw new Error('Array length argument (1 or more) cannot be omitted!');
        }
        let resultNumbers = new Array(arrayLength);
        for (let numIdx = 0; numIdx < arrayLength; numIdx++) {
            resultNumbers[numIdx] = this.fetchInteger();
        }
        return resultNumbers;
    }

    // Retrieves the next token as a string.
    fetchString() {
        return this.parsedTokens[this.readPosition++];
    }

    // Retrieves an array of strings of a specified count.
    fetchStringArray(strCount) {
        if (typeof strCount === 'undefined') {
            throw new Error('String count argument (1 or more) cannot be omitted!');
        }
        let resultStrings = new Array(strCount);
        for (let strIdx = 0; strIdx < strCount; strIdx++) {
            resultStrings[strIdx] = this.fetchString();
        }
        return resultStrings;
    }
}

// Entry point for execution, handling environment differences (browser vs. Node.js).
if (typeof window === "undefined") {
    // If not in a browser environment (likely Node.js), read from stdin.
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
