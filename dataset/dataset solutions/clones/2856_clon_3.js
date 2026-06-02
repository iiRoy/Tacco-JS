function processInputData(rawInputString) {
    const SPACE_DELIMITER = ' ';
    const RADIX_DECIMAL = 10;

    const parseNumericString = (currentString) => {
        return parseInt(currentString, RADIX_DECIMAL);
    };

    const stringParts = rawInputString.split(SPACE_DELIMITER);
    const numericValues = stringParts.map(parseNumericString);

    const firstOperand = numericValues[0];
    const secondOperand = numericValues[1];

    const resultSum = firstOperand + secondOperand;

    console.log(resultSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf-8"));
