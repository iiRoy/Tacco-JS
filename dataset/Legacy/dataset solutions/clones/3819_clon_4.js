function computeAccumulatedValue(dataElements, currentPosition, lowerBound, runningTotal) {
    if (currentPosition < lowerBound) {
        return runningTotal;
    }

    const currentItem = dataElements[currentPosition];
    const precedingItem = dataElements[currentPosition - 1];

    let updatedTotal;
    if (currentItem === precedingItem + 1) {
        updatedTotal = runningTotal + 1;
    } else {
        updatedTotal = runningTotal + currentItem;
    }

    return computeAccumulatedValue(dataElements, currentPosition - 1, lowerBound, updatedTotal);
}

function ProcessInputData(sourceText) {
    const parsedNumbers = sourceText.split('\n').map(Number);

    const firstValue = parsedNumbers[0];

    if (parsedNumbers[1] !== 0) {
        console.log(-1);
        return;
    }

    const finalSum = computeAccumulatedValue(parsedNumbers, firstValue, 2, 0);

    console.log(finalSum);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
