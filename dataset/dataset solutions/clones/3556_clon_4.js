const initiateComputation = () => {
    const incomingInformation = require("fs").readFileSync("/dev/stdin", "utf8").trim();

    const parsedNumericUnits = incomingInformation.split(/\s+/).map(unit => parseInt(unit, 10));

    const quantityIndicator = parsedNumericUnits[0];
    const pivotPoint = parsedNumericUnits[1];
    const originalLocations = parsedNumericUnits.slice(2, 2 + quantityIndicator);

    const deviationMagnitudes = originalLocations.map(location => Math.abs(location - pivotPoint));

    const findLargestCommonFactor = (firstOperand, secondOperand) => {
        return (secondOperand === 0) ? firstOperand : findLargestCommonFactor(secondOperand, firstOperand % secondOperand);
    };

    const finalFactor = deviationMagnitudes.reduce((runningFactor, nextValue) => findLargestCommonFactor(runningFactor, nextValue));

    console.log(finalFactor);
};

initiateComputation();