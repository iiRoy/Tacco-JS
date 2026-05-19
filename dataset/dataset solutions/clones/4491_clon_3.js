function parseNumericStringArray(inputStringContent) {
    const trimmedContent = inputStringContent.trim();
    const stringSegments = trimmedContent.split(" ");
    const numericalArray = stringSegments.map(Number);
    return numericalArray;
}

function processInputData(rawInputString) {
    const numericValues = parseNumericStringArray(rawInputString);

    const firstElement = numericValues[0];
    const secondElement = numericValues[1];
    const thirdElement = numericValues[2];

    const sumOfInitialElements = firstElement + secondElement + thirdElement;

    const maximumOverallValue = Math.max(...numericValues);

    const finalComputedResult = sumOfInitialElements - maximumOverallValue;

    console.log(finalComputedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
