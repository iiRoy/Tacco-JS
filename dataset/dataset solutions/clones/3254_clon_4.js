function applyTransformation(currentValue) {
    if (currentValue % 2 === 0) {
        return currentValue / 2;
    } else {
        return currentValue * 3 + 1;
    }
}

function determineRepeatPoint(currentValue, currentStep, visitedElements) {
    if (visitedElements.has(currentValue)) {
        return currentStep;
    }

    visitedElements.add(currentValue);
    const nextValue = applyTransformation(currentValue);
    return determineRepeatPoint(nextValue, currentStep + 1, visitedElements);
}

function processSequence(sourceData) {
    const dataSegments = sourceData.trim().split('\n');
    const initialValue = Number.parseInt(dataSegments[0], 10);

    const completionStep = determineRepeatPoint(initialValue, 1, new Set());
    console.log(completionStep);
}

function retrieveSourceContent() {
    return require("node:fs").readFileSync("/dev/stdin", "utf8");
}

processSequence(retrieveSourceContent());