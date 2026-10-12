'use strict';

function processInputAndCalculate(rawData) {
    const inputLines = rawData.split('\n');
    const [firstLineContent, secondLineContent] = inputLines;

    const [elementCount, referenceValue] = firstLineContent.split(' ').map(Number);
    const sourceNumbers = secondLineContent.split(' ').map(Number);

    const absoluteDifferences = sourceNumbers.map(item => Math.abs(item - referenceValue));

    const computeGreatestCommonDivisor = (firstNum, secondNum) => {
        if (secondNum === 0) {
            return firstNum;
        }
        return computeGreatestCommonDivisor(secondNum, firstNum % secondNum);
    };

    const finalResult = absoluteDifferences.reduce((accumulator, currentElement) =>
        computeGreatestCommonDivisor(accumulator, currentElement)
    );

    console.log(finalResult);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8").trim());
