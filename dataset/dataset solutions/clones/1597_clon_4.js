const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataLines = sourceData.split('\n');

const upperLimit = Number(dataLines[0]);
const numericValues = dataLines[1].split(' ').map(Number);

let validTriangleCount = 0;

for (let firstIndex = 1; firstIndex <= upperLimit; firstIndex++) {
    for (let secondIndex = firstIndex + 1; secondIndex <= upperLimit; secondIndex++) {
        for (let thirdIndex = secondIndex + 1; thirdIndex <= upperLimit; thirdIndex++) {
            const currentSides = [
                numericValues[firstIndex - 1],
                numericValues[secondIndex - 1],
                numericValues[thirdIndex - 1]
            ];

            if (currentSides[0] === currentSides[1] ||
                currentSides[0] === currentSides[2] ||
                currentSides[1] === currentSides[2]) {
                continue;
            }

            const longestSide = Math.max(...currentSides);
            const sumOfShorterSides = currentSides.reduce((accumulator, currentValue) => accumulator + currentValue) - longestSide;

            if (longestSide < sumOfShorterSides) {
                validTriangleCount++;
            }
        }
    }
}

console.log(validTriangleCount);
