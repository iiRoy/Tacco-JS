function runExecution() {
    const numericInput = retrieveInitialValue();
    const cycleBoundary = 360;

    const commonMeasure = determineGreatestCommonFactor(numericInput, cycleBoundary);

    const resultingQuotient = cycleBoundary / commonMeasure;

    broadcastResult(resultingQuotient);
}

function retrieveInitialValue() {
    return nextInt();
}

function determineGreatestCommonFactor(firstOperand, secondOperand) {
    if (secondOperand === 0) {
        return firstOperand;
    }
    return determineGreatestCommonFactor(secondOperand, firstOperand % secondOperand);
}

function broadcastResult(finalData) {
    myout(finalData);
}