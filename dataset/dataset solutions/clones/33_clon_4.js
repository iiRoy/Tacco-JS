function coefficientOfCombinations(upperLimit, lowerLimit) {
    if (lowerLimit < 0 || lowerLimit > upperLimit) {
        return 0;
    }
    if (lowerLimit === 0 || lowerLimit === upperLimit) {
        return 1;
    }
    if (lowerLimit > upperLimit / 2) {
        lowerLimit = upperLimit - lowerLimit;
    }
    let finalValue = 1;
    for (let currentStep = 1; currentStep <= lowerLimit; currentStep++) {
        finalValue = finalValue * (upperLimit - currentStep + 1) / currentStep;
    }
    return finalValue;
}

function evaluateBaseCombinations(valInput) {
    if (valInput < 0) {
        return 0;
    }
    return coefficientOfCombinations(valInput + 3, 3);
}

function calculateDigitSumWays(desiredTotal) {
    let totalPossibleWays = evaluateBaseCombinations(desiredTotal);
    totalPossibleWays -= 4 * evaluateBaseCombinations(desiredTotal - 10);
    totalPossibleWays += 6 * evaluateBaseCombinations(desiredTotal - 20);
    totalPossibleWays -= 4 * evaluateBaseCombinations(desiredTotal - 30);
    totalPossibleWays += 1 * evaluateBaseCombinations(desiredTotal - 40);
    return totalPossibleWays;
}

function establishStreamListener(sourceStream, eventNameString, processingFunction) {
    sourceStream.resume();
    sourceStream.setEncoding('utf8');
    sourceStream.on(eventNameString, processingFunction);
}

establishStreamListener(globalThis.process.stdin, "data", function(incomingPayload) {
    var numericTargets = String(incomingPayload).trim().split("\n").map(Number);

    for (var loopIndex = 0; loopIndex < numericTargets.length; loopIndex++) {
        var currentNumericTarget = numericTargets[loopIndex];
        var computedWays = calculateDigitSumWays(currentNumericTarget);
        globalThis.console.log(computedWays);
    }
});