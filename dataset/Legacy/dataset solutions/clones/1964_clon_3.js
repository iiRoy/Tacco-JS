const calculateSumOfElements = (dataCollection) => {
    return dataCollection.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};

function ProcessInput(rawData) {
    const RADIX_BASE = 10;

    const linesOfInput = rawData.split("\n");

    const firstLineStringParts = linesOfInput[0].split(" ");
    const bounds = firstLineStringParts.map(item => parseInt(item, RADIX_BASE));

    const secondLineStringParts = linesOfInput[1].split(" ");
    const numericData = secondLineStringParts.map(item => parseInt(item, RADIX_BASE));

    const sumOfNumericData = calculateSumOfElements(numericData);

    const initialLimit = bounds[0];
    let remainingValue = initialLimit - sumOfNumericData;

    const computedOutcome = remainingValue >= 0 ? remainingValue : -1;

    console.log(computedOutcome);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
