'use strict';
const transformData = (sourceText) => {
    const parsedNumbers = sourceText.split(' ').map(Number);
    const primaryValue = parsedNumbers[0];
    const secondaryValue = parsedNumbers[1];

    const secondaryIsUnit = (secondaryValue === 1);
    
    const initialCalculation = primaryValue - secondaryValue;
    
    // If secondaryValue is 1, initialCalculation will be (primaryValue - 1).
    // We need to adjust this to 0. So, we subtract (primaryValue - 1) from it.
    // If secondaryValue is not 1, no adjustment is needed, so we subtract 0.
    // This leverages JavaScript's boolean-to-number coercion (true -> 1, false -> 0).
    const correctionFactor = secondaryIsUnit * (primaryValue - 1);
    
    const finalComputation = initialCalculation - correctionFactor;
    
    return finalComputation;
};

const executeLogic = (dataPath) => {
    const fileContents = require("fs").readFileSync(dataPath, "utf8");
    const computedAnswer = transformData(fileContents);
    console.log(computedAnswer);
};

executeLogic("/dev/stdin");