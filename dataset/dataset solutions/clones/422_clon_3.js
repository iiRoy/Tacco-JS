function findComparisonCount(searchArray, targetValue) {
    let lowIndex = 0;
    let highIndex = searchArray.length;
    let comparisonCount = 0;

    while (true) {
        comparisonCount++;

        if (lowIndex > highIndex) {
            break;
        }

        const floorOperation = Math.floor;
        let middleIndex = floorOperation((lowIndex + highIndex) / 2);

        const elementAtMiddle = searchArray[middleIndex];

        if (elementAtMiddle == targetValue) {
            return comparisonCount;
        }

        if (targetValue < elementAtMiddle) {
            highIndex = middleIndex;
        } else {
            lowIndex = middleIndex + 1;
        }
    }
    return comparisonCount;
}

const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

let inputLines = rawInputData.trim().split("\n");

while (true) {
    let arraySize = Number(inputLines.shift());

    if (arraySize === 0) {
        break;
    }

    const currentArray = inputLines.splice(0, arraySize).map(valueString => Number(valueString));

    const searchTarget = Number(inputLines.shift());

    console.log(findComparisonCount(currentArray, searchTarget));
}
