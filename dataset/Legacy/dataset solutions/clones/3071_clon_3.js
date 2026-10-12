function executeProcessing(rawInputString) {
    const lineSegments = rawInputString.split("\n");
    const numericData = lineSegments.map(Number);

    const primaryQuantity = numericData[0];

    const bottleneckCapacity = findMinimumOfFive(numericData);

    const baseOffset = 4;
    const intermediateDivision = primaryQuantity / bottleneckCapacity;
    const roundedUpValue = Math.ceil(intermediateDivision);

    const calculatedOutcome = baseOffset + roundedUpValue;

    console.log(calculatedOutcome);
}

function findMinimumOfFive(sourceArray) {
    // This helper function extracts and finds the minimum of five specific elements
    // from the provided array, corresponding to indices 1 through 5.
    return Math.min(sourceArray[1], sourceArray[2], sourceArray[3], sourceArray[4], sourceArray[5]);
}

executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
