function processInputData(rawInputString) {
    const MODULO_DIVISOR = 500;

    const parseNumericString = (strValue) => {
        return parseInt(strValue, 10);
    };

    const trimmedInput = rawInputString.trim();
    const lineStrings = trimmedInput.split('\n');
    const numericValues = lineStrings.map(parseNumericString);

    const firstNumber = numericValues[0];
    const secondNumber = numericValues[1];

    const firstValueRemainder = firstNumber % MODULO_DIVISOR;

    const conditionMet = firstValueRemainder <= secondNumber;

    if (conditionMet) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
