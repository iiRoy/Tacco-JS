"use strict";

class LineProcessor {
    #sourceLines;
    #currentPosition;

    constructor(inputContent) {
        this.#sourceLines = inputContent.trim().split("\n");
        this.#currentPosition = 0;
    }

    hasMore() {
        return this.#currentPosition < this.#sourceLines.length;
    }

    retrieveNext() {
        if (!this.hasMore()) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return this.#sourceLines[this.#currentPosition++];
    }

    retrieveInteger() {
        return parseInt(this.retrieveNext());
    }

    retrieveStringArray() {
        return this.retrieveNext().split(" ");
    }

    retrieveIntegerArray() {
        return this.retrieveNext().split(" ").map(val => parseInt(val));
    }

    retrieveCharacterArray() {
        return this.retrieveNext().split("");
    }
}

const inputSource = new LineProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

const getNextLine = () => inputSource.retrieveNext();
const getNextInt = () => inputSource.retrieveInteger();
const getNextStringArray = () => inputSource.retrieveStringArray();
const getNextIntArray = () => inputSource.retrieveIntegerArray();
const getNextCharArray = () => inputSource.retrieveCharacterArray();
const checkMoreLines = () => inputSource.hasMore();
const printOutput = (...items) => console.log(...items);

function computeGreatestCommonDivisor(firstNum, secondNum) {
    if (firstNum < secondNum) {
        return computeGreatestCommonDivisor(secondNum, firstNum);
    }
    if (secondNum === 0n) {
        return firstNum;
    }
    return computeGreatestCommonDivisor(secondNum, firstNum % secondNum);
}

const calculateLeastCommonMultiple = (valA, valB) => (valA * valB) / computeGreatestCommonDivisor(valA, valB);

const performCalculation = () => {
    getNextLine();

    let currentLcmResult = BigInt(getNextInt());

    const subsequentNumbers = [];
    while (checkMoreLines()) {
        subsequentNumbers.push(BigInt(getNextInt()));
    }

    const finalLcm = subsequentNumbers.reduce((accumulator, currentNumber) => {
        return calculateLeastCommonMultiple(accumulator, currentNumber);
    }, currentLcmResult);

    printOutput(finalLcm.toString());
};

performCalculation();
