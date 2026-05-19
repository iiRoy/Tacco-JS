const fileSystemModule = require('fs');

const parseNumericLine = (lineString) => {
    const stringParts = lineString.split(" ");
    const numericValues = stringParts.map(Number);
    return numericValues;
};

const countValidTriplets = (limitN, targetX) => {
    let currentCombinationCount = 0;
    for (let firstValue = 1; firstValue <= limitN; firstValue++) {
        for (let secondValue = firstValue + 1; secondValue <= limitN; secondValue++) {
            const sumOfFirstTwo = firstValue + secondValue;
            if (sumOfFirstTwo >= targetX) {
                break;
            }
            const thirdValue = targetX - sumOfFirstTwo;
            if (thirdValue > secondValue && thirdValue <= limitN) {
                currentCombinationCount++;
            }
        }
    }
    return currentCombinationCount;
};

const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const inputLines = rawInputData.trim().split("\n");

for (let lineIdx = 0; lineIdx < inputLines.length; lineIdx++) {
    const [currentN, currentX] = parseNumericLine(inputLines[lineIdx]);

    if (currentN === 0 && currentX === 0) {
        break;
    }

    const resultCount = countValidTriplets(currentN, currentX);

    console.log(resultCount);
}
