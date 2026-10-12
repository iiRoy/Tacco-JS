const convertToInt = (strValue) => Number(strValue);
const mapToIntegers = (stringArray) => stringArray.map(convertToInt);
const absoluteValue = (num) => Math.abs(num);

const findMinimum = (...values) => Math.min(...values);
const findMaximum = (...values) => Math.max(...values);

const calculateGCD = (firstNum, secondNum) => (secondNum === 0 ? firstNum : calculateGCD(secondNum, firstNum % secondNum));
const findGCD = (...numbers) => numbers.reduce(calculateGCD);

function processInputData(rawData) {
    const lines = rawData.split('\n');
    const elementCount = convertToInt(lines[0]);
    const numericValues = mapToIntegers(lines.slice(1, elementCount + 1));

    numericValues.sort((a, b) => a - b);

    let resultA = 0;
    let resultB = 0;

    const sumRange = (arr, startIndex, endIndex) => arr.slice(startIndex, endIndex).reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    if (elementCount % 2 === 0) {
        const midPoint = elementCount / 2;
        const lowerHalfSum = sumRange(numericValues, 0, midPoint);
        const upperHalfSum = sumRange(numericValues, midPoint, elementCount);

        resultA = 2 * upperHalfSum - 2 * lowerHalfSum + numericValues[midPoint - 1] - numericValues[midPoint];
    } else {
        const middleIndex = (elementCount - 1) / 2;

        // Calculation for resultA (corresponds to original 'x')
        const sumBeforeMiddle = sumRange(numericValues, 0, middleIndex);
        const sumFromMiddle = sumRange(numericValues, middleIndex, elementCount);
        resultA = 2 * sumFromMiddle - 2 * sumBeforeMiddle - numericValues[middleIndex] - numericValues[middleIndex + 1];

        // Calculation for resultB (corresponds to original 'y')
        const sumUpToMiddle = sumRange(numericValues, 0, middleIndex + 1);
        const sumAfterMiddle = sumRange(numericValues, middleIndex + 1, elementCount);
        resultB = 2 * sumAfterMiddle - 2 * sumUpToMiddle + numericValues[middleIndex] + numericValues[middleIndex - 1];
    }

    const finalOutcome = findMaximum(resultA, resultB);

    console.log(finalOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
