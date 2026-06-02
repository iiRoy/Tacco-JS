const fsModule = require('fs');
const standardInputPath = '/dev/stdin';

let fileContent = fsModule.readFileSync(standardInputPath, 'utf8');
let inputLines = fileContent.split('\n');

const parseSingleNumericValue = (lineString) => Number(lineString);
const parseNumericArray = (lineString) => lineString.trim().split(' ').map(Number);

let numElements = parseSingleNumericValue(inputLines.shift());
let elementValues = parseNumericArray(inputLines.shift());
let numQueries = parseSingleNumericValue(inputLines.shift()); // This variable is read but not used in the original logic.
let queryTargets = parseNumericArray(inputLines.shift());

queryTargets.forEach((targetValue) => {
    const isSumAchievable = checkSubsetSum(0, targetValue);
    console.log(isSumAchievable ? 'yes' : 'no');
});

function checkSubsetSum(currentIdx, targetValue) {
    // Base case 1: If we have processed all elements and haven't found the target sum
    if (currentIdx >= numElements) {
        return false;
    }

    const currentElement = elementValues[currentIdx];

    // Base case 2: If the current element itself equals the target sum
    if (currentElement === targetValue) {
        return true;
    }

    // Recursive step: Explore two possibilities
    // Possibility A: Exclude the current element and try to form the target sum with the remaining elements
    const resultExcludingCurrent = checkSubsetSum(currentIdx + 1, targetValue);

    // Possibility B: Include the current element and try to form the remaining sum with the next elements
    const resultIncludingCurrent = checkSubsetSum(currentIdx + 1, targetValue - currentElement);

    // If either possibility leads to a solution, then the sum is achievable
    return resultExcludingCurrent || resultIncludingCurrent;
}
