const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataLines = rawData.split('\n');

const maxVal = Number(dataLines[0]);
const valueList = dataLines[1].split(' ').map(Number);

const popAndCheck = (arr) => {
    const val = arr.pop();
    return { value: val, done: val === undefined };
};

const generateCombinations = (combinationLength, maxValue) => {
    const allCombinations = [];
    const currentCombination = [];
    let nextCandidateValue = 0;

    let generationActive = true;
    while (generationActive) {
        if (currentCombination.length === combinationLength) {
            allCombinations.push([...currentCombination]);
            const { value, done } = popAndCheck(currentCombination);
            nextCandidateValue = value;
            if (done) {
                generationActive = false;
            }
        } else if (nextCandidateValue >= maxValue) {
            const { value, done } = popAndCheck(currentCombination);
            nextCandidateValue = value;
            if (done) {
                generationActive = false;
            }
        } else {
            nextCandidateValue++;
            currentCombination.push(nextCandidateValue);
        }
    }
    return allCombinations;
};

const areSidesDistinct = (sidesArray) => {
    return new Set(sidesArray).size === sidesArray.length;
};

const checkTriangleInequality = (sideA, sideB, sideC) => {
    const longestSide = Math.max(sideA, sideB, sideC);
    const sumOfOtherSides = sideA + sideB + sideC - longestSide;
    return longestSide < sumOfOtherSides;
};

const allIndexCombinations = generateCombinations(3, maxVal);

let validTriangleCount = 0;

for (let comboIndex = 0; comboIndex < allIndexCombinations.length; comboIndex++) {
    const currentComboIndices = allIndexCombinations[comboIndex];

    const triangleSides = currentComboIndices.map(index => valueList[index - 1]);

    if (!areSidesDistinct(triangleSides)) {
        continue;
    }

    const [side1, side2, side3] = triangleSides;

    if (checkTriangleInequality(side1, side2, side3)) {
        validTriangleCount++;
    }
}

console.log(validTriangleCount);
