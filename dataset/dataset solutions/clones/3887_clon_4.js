'use strict';

const calculateOptimalProcurement = (inputStringValue) => {
    const parsedNumericData = inputStringValue.match(/-?\d+(\.\d+)?/g).map(Number);

    const itemAlphaCost = parsedNumericData[0];
    const itemBetaCost = parsedNumericData[1];
    const comboPackCost = parsedNumericData[2];
    const countAlphaNeeded = parsedNumericData[3];
    const countBetaNeeded = parsedNumericData[4];

    const costScenarioOne = itemAlphaCost * countAlphaNeeded + itemBetaCost * countBetaNeeded;

    const minimumUnits = Math.min(countAlphaNeeded, countBetaNeeded);
    const quantityDifference = Math.abs(countAlphaNeeded - countBetaNeeded);
    const maximumUnits = Math.max(countAlphaNeeded, countBetaNeeded);

    const unitPriceForDifference = countAlphaNeeded > countBetaNeeded ? itemAlphaCost : itemBetaCost;

    const costScenarioTwo = (comboPackCost * minimumUnits * 2) + (unitPriceForDifference * quantityDifference);

    const costScenarioThree = comboPackCost * maximumUnits * 2;

    const finalOptimalValue = Math.min(costScenarioOne, costScenarioTwo, costScenarioThree);

    return finalOptimalValue;
};

const performComputation = (dataSource) => {
    const computedResult = calculateOptimalProcurement(dataSource);
    console.log(computedResult);
};

performComputation(require("node:fs").readFileSync("/dev/stdin", "utf8"));