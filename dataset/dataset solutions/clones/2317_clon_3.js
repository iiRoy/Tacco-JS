function processInputData(rawDataString) {
    const inputLines = rawDataString.split("\n");
    const numericValues = inputLines.map(singleLine => parseInt(singleLine, 10));

    const firstParsedNumber = numericValues[0];
    const secondParsedNumber = numericValues[1];
    const fixedConstant = 6;

    const sumOfTwoNumbers = firstParsedNumber + secondParsedNumber;
    const finalCalculatedValue = fixedConstant - sumOfTwoNumbers;

    console.log(finalCalculatedValue);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
