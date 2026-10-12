function processInputData(rawData) {
    const inputDelimiter = " ";
    const stringNumberArray = rawData.split(inputDelimiter);

    const parseRadix = 10;
    const numericArray = stringNumberArray.map(currentString => parseInt(currentString, parseRadix));

    const sortComparisonFunction = (valueA, valueB) => valueA - valueB;
    const sortedNumericArray = numericArray.sort(sortComparisonFunction);

    const firstElement = sortedNumericArray[0];
    const secondElement = sortedNumericArray[1];
    const thirdElement = sortedNumericArray[2];

    const sumOfFirstTwo = firstElement + secondElement;

    const conditionMet = sumOfFirstTwo === thirdElement;

    const outputMessage = conditionMet ? "Yes" : "No";

    console.log(outputMessage);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
