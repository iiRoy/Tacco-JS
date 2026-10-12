"use strict";

class InputProcessor {
    #sourceLines;
    #currentPointer;

    constructor() {
        const rawContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
        this.#sourceLines = rawContent.split("\n");
        this.#currentPointer = 0;
    }

    // Checks if there are more lines to process
    canAdvance() {
        return this.#currentPointer < this.#sourceLines.length;
    }

    // Retrieves the next line from the input
    retrieveLine() {
        if (!this.canAdvance()) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return this.#sourceLines[this.#currentPointer++];
    }

    // Retrieves the next line as an integer
    retrieveInteger() {
        return parseInt(this.retrieveLine());
    }

    // Retrieves the next line as an array of strings, split by space
    retrieveStringArray() {
        return this.retrieveLine().split(" ");
    }

    // Retrieves the next line as an array of integers, split by space
    retrieveIntegerArray() {
        return this.retrieveLine().split(" ").map(element => parseInt(element));
    }

    // Retrieves the next line as an array of characters
    retrieveCharacterArray() {
        return this.retrieveLine().split("");
    }
}

const executeCalculation = () => {
    const dataHandler = new InputProcessor();

    const [firstOperand, secondOperand] = dataHandler.retrieveIntegerArray();

    const resultValue = (1900 * secondOperand + 100 * (firstOperand - secondOperand)) * Math.pow(2, secondOperand);
    console.log(resultValue);
};

executeCalculation();
