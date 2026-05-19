"use strict"
const establishInputProcessor = () => {
    const sourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    let currentPosition = 0;
    const totalLines = sourceLines.length;

    const retrieveNextLine = () => {
        if (currentPosition >= totalLines) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return sourceLines[currentPosition++];
    };

    const checkLineAvailability = () => {
        return currentPosition < totalLines;
    };

    return {
        pullLine: retrieveNextLine,
        checkAvailability: checkLineAvailability
    };
};

const inputHandler = establishInputProcessor();

const fetchLine = () => inputHandler.pullLine();
const fetchInteger = () => parseInt(inputHandler.pullLine());
const fetchStringSequence = () => inputHandler.pullLine().split(" ");
const fetchIntegerSequence = () => inputHandler.pullLine().split(" ").map(Number);
const fetchCharacterSequence = () => inputHandler.pullLine().split("");
const hasMoreContent = () => inputHandler.checkAvailability();
const emitResult = (...items) => console.log(...items);

const ProcessApplication = () => {
    const inputNumber = fetchInteger();
    const finalSum = (inputNumber - 1) * inputNumber / 2;
    emitResult(finalSum);
};

ProcessApplication();
