function processInputData(rawData) {
    const parseDecimalInteger = (stringValue) => {
        return parseInt(stringValue, 10);
    };

    const inputLines = rawData.split("\n");

    const firstLineValue = inputLines[0];
    const firstParsedNumber = parseDecimalInteger(firstLineValue);

    const secondLineContent = inputLines[1];
    const secondLineParts = secondLineContent.split(" ");

    const secondParsedNumber = parseDecimalInteger(secondLineParts[0]);
    const thirdParsedNumber = parseDecimalInteger(secondLineParts[1]);

    const outputStringValue = inputLines[2];

    const sumOfNumbers = firstParsedNumber + secondParsedNumber + thirdParsedNumber;

    console.log('%d %s', sumOfNumbers, outputStringValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
