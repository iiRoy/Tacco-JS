"use strict";
const establishInput = () => {
    const sourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    let currentPosition = 0;
    const totalLines = sourceLines.length;
    const retrieveNext = () => {
        if (currentPosition >= totalLines) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return sourceLines[currentPosition++];
    };
    const hasMoreElements = () => {
        return currentPosition < totalLines;
    };
    return { retrieveNext, hasMoreElements };
};
const inputAccess = establishInput();
const obtainLine = () => inputAccess.retrieveNext();
const obtainInteger = () => parseInt(inputAccess.retrieveNext());
const obtainStringArray = () => inputAccess.retrieveNext().split(" ");
const obtainIntegerArray = () => inputAccess.retrieveNext().split(" ").map(Number);
const obtainCharacterArray = () => inputAccess.retrieveNext().split("");
const checkMoreInput = () => inputAccess.hasMoreElements();
const displayResult = (...values) => console.log(...values);
const performCalculation = () => {
    const numericPair = obtainIntegerArray();
    const firstValue = numericPair[0];
    const secondValue = numericPair[1];
    let finalAnswer;
    if (secondValue <= 2 * firstValue) {
        finalAnswer = Math.floor(secondValue / 2);
    } else {
        finalAnswer = Math.floor((2 * firstValue + secondValue) / 4);
    }
    displayResult(finalAnswer);
};
performCalculation();
