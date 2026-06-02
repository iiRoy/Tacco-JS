function getSumOfDigitsFromString(numericString) {
    let digitAccumulator = 0;
    for (let charIdx = 0; charIdx < numericString.length; charIdx++) {
        digitAccumulator += Number(numericString[charIdx]);
    }
    return digitAccumulator;
}

function processInput(rawData) {
    let initialTargetValue = Number(rawData.trim());
    let currentDynamicTarget = initialTargetValue;

    for (let outerLoopIndex = 1; outerLoopIndex < currentDynamicTarget; outerLoopIndex++) {
        let iterationSum = outerLoopIndex;

        let remainderCalculation = currentDynamicTarget - iterationSum;
        let remainderStringRepresentation = String(remainderCalculation);

        iterationSum += getSumOfDigitsFromString(remainderStringRepresentation);

        if (currentDynamicTarget > iterationSum) {
            currentDynamicTarget = iterationSum;
        } else if (currentDynamicTarget === iterationSum) {
            console.log(iterationSum);
            return;
        }
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
