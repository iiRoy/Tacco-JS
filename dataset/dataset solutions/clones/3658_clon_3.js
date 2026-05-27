function processInput(rawDataString) {
    const inputLines = rawDataString.split('\n');

    const firstLineContent = inputLines[0];
    const numericFirstLineValue = Number(firstLineContent);
    const negatedFirstValue = numericFirstLineValue * -1;

    const secondLineContent = inputLines[1];
    const secondLineNumberStrings = secondLineContent.split(' ');

    const calculateSumOfNumericStrings = (stringArray) => {
        return stringArray.reduce((accumulator, currentString) => {
            const currentNumericValue = Number(currentString) | 0;
            const accumulatedNumericValue = Number(accumulator) | 0;
            return accumulatedNumericValue + currentNumericValue;
        }, 0);
    };

    const sumOfSecondLineNumbers = calculateSumOfNumericStrings(secondLineNumberStrings);

    const finalComputedResult = negatedFirstValue + sumOfSecondLineNumbers;

    console.log(finalComputedResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
