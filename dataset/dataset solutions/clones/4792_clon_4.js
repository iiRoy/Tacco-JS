"use strict";

const createInputManager = () => {
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    let currentPosition = 0;

    const fetchNextItem = () => {
        if (currentPosition >= rawInputData.length) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return rawInputData[currentPosition++];
    };

    const checkAvailability = () => currentPosition < rawInputData.length;

    return {
        fetchNextItem,
        checkAvailability
    };
};

const dataStream = createInputManager();
const obtainLine = () => dataStream.fetchNextItem();
const obtainInteger = () => parseInt(dataStream.fetchNextItem());
const obtainStringArray = () => dataStream.fetchNextItem().split(" ");
const obtainIntegerArray = () => dataStream.fetchNextItem().split(" ").map(itemValue => parseInt(itemValue));
const obtainCharacterArray = () => dataStream.fetchNextItem().split("");
const hasMoreData = () => dataStream.checkAvailability();

const outputResult = (...values) => console.log(...values);

const runCalculation = () => {
    const [firstOperand, secondOperand] = obtainIntegerArray();

    const initialDifference = Math.abs(Math.abs(firstOperand) - Math.abs(secondOperand));

    const adjustmentRules = [
        { condition: (a, b) => a * b < 0, value: 1 },
        { condition: (a, b) => (a > 0 && b === 0) || (a === 0 && b < 0), value: 1 },
        { condition: (a, b) => a > b, value: 2 }
    ];

    const applicableRule = adjustmentRules.find(rule => rule.condition(firstOperand, secondOperand));
    const calculatedAdjustment = applicableRule ? applicableRule.value : 0;

    const finalAnswer = initialDifference + calculatedAdjustment;

    outputResult(finalAnswer);
};

runCalculation();
