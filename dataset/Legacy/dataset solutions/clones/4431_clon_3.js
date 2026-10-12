'use strict';

function processInputData(rawData) {
    const inputLines = rawData.split('\n');
    const firstRelevantLine = inputLines[0];

    const stringComponents = firstRelevantLine.split(' ');

    const numericValues = stringComponents.map(strVal => Number(strVal));

    const valueA = numericValues[0];
    const valueB = numericValues[1];

    const computeDecrementedProduct = (operand1, operand2) => {
        const decrementedOperand1 = operand1 - 1;
        const decrementedOperand2 = operand2 - 1;
        return decrementedOperand1 * decrementedOperand2;
    };

    const calculatedResult = computeDecrementedProduct(valueA, valueB);

    console.log(calculatedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
