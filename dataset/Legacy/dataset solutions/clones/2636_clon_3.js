function processInput(rawData) {
    const inputLines = rawData.split("\n");
    const numberStringLine = inputLines[1];

    let numericValues = numberStringLine.split(" ").map(Number);
    numericValues.sort((a, b) => a - b);

    let currentAverage = (numericValues[0] + numericValues[1]) / 2;

    numericValues.shift();
    numericValues.shift();

    while (numericValues.length > 0) {
        const insertionPoint = findInsertionIndex(numericValues, currentAverage);
        numericValues.splice(insertionPoint, 0, currentAverage);

        currentAverage = (numericValues[0] + numericValues[1]) / 2;

        numericValues.shift();
        numericValues.shift();
    }

    console.log(currentAverage);
}

function findInsertionIndex(sortedArray, targetValue) {
    let foundIndex = -1;

    let lowBound = 0;
    const lastIndex = sortedArray.length - 1;
    let highBound = lastIndex;

    while (lowBound <= highBound) {
        const midPoint = Math.floor((lowBound + highBound) / 2);

        if (sortedArray[midPoint] === targetValue) {
            foundIndex = midPoint;
            break;
        } else if (sortedArray[midPoint] < targetValue) {
            lowBound = midPoint + 1;
        } else {
            highBound = midPoint - 1;
        }
    }

    return foundIndex !== -1 ? foundIndex : lowBound;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
