const obtainIntegralComponent = (numericExpression) => numericExpression | 0;

const calculateProductThroughSummation = (multiplier, multiplicand, currentResult = 0) => {
    if (multiplicand === 0) {
        return currentResult;
    }
    return calculateProductThroughSummation(multiplier, multiplicand - 1, currentResult + multiplier);
};

const executeComputation = (sourceMaterial) => {
    const stringFragments = sourceMaterial.match(/\d+/g);

    const [firstOperand, secondOperand, thirdOperand] = stringFragments.map(Number);

    const intermediateQuotient = (thirdOperand + 0.5) / firstOperand;
    const flooredQuotient = obtainIntegralComponent(intermediateQuotient);

    const ultimateOutcome = calculateProductThroughSummation(flooredQuotient, secondOperand);

    console.log(ultimateOutcome);
};

executeComputation(require("fs").readFileSync("/dev/stdin", "utf8"));