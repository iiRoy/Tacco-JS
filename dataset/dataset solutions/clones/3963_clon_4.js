"use strict";

const determineOutcome = (rawInputText) => {
    const numberStrings = rawInputText.split(" ");
    const numericValues = {
        valA: parseInt(numberStrings[0], 10),
        valB: parseInt(numberStrings[1], 10),
        valC: parseInt(numberStrings[2], 10)
    };

    const conditionHolds = numericValues.valA >= (numericValues.valC - numericValues.valB);

    const outcomeMapping = {
        true: "Yes",
        false: "No"
    };

    return outcomeMapping[conditionHolds];
};

const runSolution = () => {
    const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
    const finalResult = determineOutcome(fileData);
    console.log(finalResult);
};

runSolution();
