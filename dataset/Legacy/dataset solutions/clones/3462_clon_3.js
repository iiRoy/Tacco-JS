function processInputAndCalculate(inputString) {
    let rawNumbers = inputString.split("\n").map(itemStr => +itemStr);
    const elementCount = rawNumbers[0];

    let processedDataElements = rawNumbers.slice(1, elementCount + 1);
    const lastOriginalDataItem = processedDataElements[elementCount - 1];
    processedDataElements[0] = lastOriginalDataItem;
    processedDataElements.pop();

    processedDataElements.sort((valA, valB) => valA - valB);

    let finalSum = 0;
    const splitIndex = (elementCount + 1) >> 1;

    for (let idx = 0; idx < elementCount; idx++) {
        const currentMultiplier = (idx < splitIndex) ? -2 : 2;
        finalSum += processedDataElements[idx] * currentMultiplier;
    }

    const applyFinalAdjustment = (currentTotal, count, sortedArr, midPointIdx) => {
        if (count % 2 === 0) {
            const valAtMid = sortedArr[midPointIdx];
            const valBeforeMid = sortedArr[midPointIdx - 1];
            return currentTotal - valAtMid + valBeforeMid;
        } else {
            const firstRelevantVal = sortedArr[midPointIdx - 1];
            const secondRelevantVal = sortedArr[midPointIdx - 2];
            const thirdRelevantVal = sortedArr[midPointIdx];

            const comparisonResult = (firstRelevantVal + secondRelevantVal) > (firstRelevantVal * 3 - thirdRelevantVal);

            if (comparisonResult) {
                return currentTotal + firstRelevantVal + secondRelevantVal;
            } else {
                return currentTotal + firstRelevantVal * 3 - thirdRelevantVal;
            }
        }
    };

    return applyFinalAdjustment(finalSum, elementCount, processedDataElements, splitIndex);
}

console.log(processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8")));
