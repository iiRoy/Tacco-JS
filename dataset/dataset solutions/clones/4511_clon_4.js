"use strict";

class InputProcessor {
    #dataLines;
    #currentPosition;

    constructor() {
        this.#dataLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
        this.#currentPosition = 0;
    }

    retrieveNext() {
        if (this.#currentPosition >= this.#dataLines.length) {
            throw new Error("InputExhaustedError");
        }
        return this.#dataLines[this.#currentPosition++];
    }

    checkAvailability() {
        return this.#currentPosition < this.#dataLines.length;
    }
}

const inputProcessorInstance = new InputProcessor();

const obtainLine = () => inputProcessorInstance.retrieveNext();
const obtainInteger = () => parseInt(inputProcessorInstance.retrieveNext());
const obtainStringArray = () => inputProcessorInstance.retrieveNext().split(" ");
const obtainIntegerArray = () => inputProcessorInstance.retrieveNext().split(" ").map(Number);
const obtainCharacterArray = () => inputProcessorInstance.retrieveNext().split("");
const checkMoreInput = () => inputProcessorInstance.checkAvailability();
const outputToConsole = (...args) => console.log(...args);

const calculateProductWithPartialModFunctional = (limit, modulus, initialValue) => {
    const sequence = Array.from({ length: limit }, (_, i) => i + 1);
    return sequence.reduce((accumulator, currentVal) => {
        return (accumulator % modulus) * currentVal;
    }, initialValue);
};

const executeProgram = () => {
    const [valN, valM] = obtainIntegerArray();

    if (Math.abs(valN - valM) > 1) {
        outputToConsole(0);
        return;
    }

    const MODULUS_VAL = 1e9 + 7;

    let intermediateProduct = 1;
    intermediateProduct = calculateProductWithPartialModFunctional(valN, MODULUS_VAL, intermediateProduct);
    intermediateProduct = calculateProductWithPartialModFunctional(valM, MODULUS_VAL, intermediateProduct);

    if (valN === valM) {
        outputToConsole((2 * intermediateProduct) % MODULUS_VAL);
    } else {
        outputToConsole(intermediateProduct % MODULUS_VAL);
    }
};

executeProgram();
