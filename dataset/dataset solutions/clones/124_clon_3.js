var rawData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    rawData += chunk;
});
process.stdin.on('end', function() {
    processInput(rawData);
});

function processInput(inputString){
    var inputLines = inputString.trim().split('\n');

    var lineIndex = 0;
    const ZERO_VALUE = 0;

    while (lineIndex < inputLines.length) {
        var currentLine = inputLines[lineIndex];
        var currentParams = currentLine.split(' ').map(Number);
        var numDigitsRequired = currentParams[ZERO_VALUE];
        var targetSumValue = currentParams[1];

        if (numDigitsRequired === ZERO_VALUE && targetSumValue === ZERO_VALUE) {
            return;
        }
        console.log( calculateCombinations(numDigitsRequired, targetSumValue) );
        lineIndex++;
    }
}

function calculateCombinations(digitCount, desiredSum){
    const INITIAL_PREVIOUS_DIGIT = -1;
    return findWaysRecursively(desiredSum, INITIAL_PREVIOUS_DIGIT, digitCount);
}

function findWaysRecursively(currentSumValue, previousDigit, remainingStepsToFill){
    const TARGET_ACHIEVED_SUM = 0;

    if (remainingStepsToFill === TARGET_ACHIEVED_SUM) {
        var isTargetSumReached = (currentSumValue === TARGET_ACHIEVED_SUM);
        if (isTargetSumReached) {
            return 1;
        } else {
            return 0;
        }
    }

    var accumulatedWays = 0;
    const MAX_DIGIT_ALLOWED = 9;
    var startDigitForIteration = previousDigit + 1;

    for (var currentDigitCandidate = startDigitForIteration; currentDigitCandidate <= MAX_DIGIT_ALLOWED; currentDigitCandidate++) {
        if (currentSumValue >= currentDigitCandidate) {
            var nextSumForRecursion = currentSumValue - currentDigitCandidate;
            accumulatedWays += findWaysRecursively(nextSumForRecursion, currentDigitCandidate, remainingStepsToFill - 1);
        }
    }
    return accumulatedWays;
}
