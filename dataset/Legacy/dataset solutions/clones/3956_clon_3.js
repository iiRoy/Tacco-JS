const calculateAbsoluteDifference = (valA, valB) => Math.abs(valA - valB);

function ProcessInputAndCalculate(rawInput) {
    const trimmedInput = rawInput.trim();
    const inputLines = trimmedInput.split("\n");

    const dataPointCount = Number(inputLines[0]);
    const dataPointsArray = inputLines[1].split(" ").map(Number);

    let overallPathSum = 0;
    let previousPointInPath = 0;

    for (let k = 0; k < dataPointCount; k++) {
        overallPathSum += calculateAbsoluteDifference(previousPointInPath, dataPointsArray[k]);
        previousPointInPath = dataPointsArray[k];
    }
    overallPathSum += calculateAbsoluteDifference(previousPointInPath, 0);

    for (let currentIdx = 0; currentIdx < dataPointCount; currentIdx++) {
        let segmentRemovedBeforeCurrent;
        let segmentRemovedAfterCurrent;
        let segmentAddedBypassingCurrent;

        const lastElementIndex = dataPointCount - 1;

        if (currentIdx === 0) {
            segmentRemovedBeforeCurrent = calculateAbsoluteDifference(0, dataPointsArray[currentIdx]);
            segmentRemovedAfterCurrent = calculateAbsoluteDifference(dataPointsArray[currentIdx], dataPointsArray[currentIdx + 1]);
            segmentAddedBypassingCurrent = calculateAbsoluteDifference(0, dataPointsArray[currentIdx + 1]);
        } else if (currentIdx === lastElementIndex) {
            segmentRemovedBeforeCurrent = calculateAbsoluteDifference(dataPointsArray[lastElementIndex - 1], dataPointsArray[currentIdx]);
            segmentRemovedAfterCurrent = calculateAbsoluteDifference(dataPointsArray[currentIdx], 0);
            segmentAddedBypassingCurrent = calculateAbsoluteDifference(dataPointsArray[lastElementIndex - 1], 0);
        } else {
            segmentRemovedBeforeCurrent = calculateAbsoluteDifference(dataPointsArray[currentIdx - 1], dataPointsArray[currentIdx]);
            segmentRemovedAfterCurrent = calculateAbsoluteDifference(dataPointsArray[currentIdx], dataPointsArray[currentIdx + 1]);
            segmentAddedBypassingCurrent = calculateAbsoluteDifference(dataPointsArray[currentIdx - 1], dataPointsArray[currentIdx + 1]);
        }

        const currentModifiedSum = overallPathSum - segmentRemovedBeforeCurrent - segmentRemovedAfterCurrent + segmentAddedBypassingCurrent;
        console.log(currentModifiedSum);
    }
}

ProcessInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
