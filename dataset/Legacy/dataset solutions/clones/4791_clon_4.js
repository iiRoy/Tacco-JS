"use strict";

const createInputProcessor = () => {
    const rawLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    let currentLineIndex = 0;
    const totalLines = rawLines.length;

    const lineGenerator = (function* () {
        while (currentLineIndex < totalLines) {
            yield rawLines[currentLineIndex++];
        }
    })();

    const getNextLine = () => {
        const { value, done } = lineGenerator.next();
        if (done) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return value;
    };

    return {
        getLine: getNextLine,
        checkMoreData: () => currentLineIndex < totalLines
    };
};

const dataStream = createInputProcessor();

const retrieveLine = () => dataStream.getLine();
const parseInteger = () => parseInt(dataStream.getLine());
const splitStringArray = () => dataStream.getLine().split(" ");
const splitIntegerArray = () => dataStream.getLine().split(" ").map(val => parseInt(val));
const splitCharacterArray = () => dataStream.getLine().split("");
const hasMoreData = () => dataStream.checkMoreData();
const outputResult = (...args) => console.log(...args);

const executeCalculation = () => {
    const [firstValue, secondValue] = splitIntegerArray();

    let baseDifference = Math.abs(Math.abs(firstValue) - Math.abs(secondValue));
    let additionalSteps = 0;

    const adjustmentRules = [
        {
            condition: (a, b) => a * b < 0,
            step: 1
        },
        {
            condition: (a, b) => (a > 0 && b === 0) || (a === 0 && b < 0),
            step: 1
        },
        {
            condition: (a, b) => a < b,
            step: 2
        }
    ];

    const foundRule = adjustmentRules.find(rule => rule.condition(firstValue, secondValue));
    if (foundRule) {
        additionalSteps = foundRule.step;
    }

    const finalOutcome = baseDifference + additionalSteps;
    outputResult(finalOutcome);
};

executeCalculation();
