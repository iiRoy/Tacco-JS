function processInputData(rawDataString) {
    const DECIMAL_RADIX = 10;

    let cleanedString = rawDataString.trim();

    let numericalInput = parseInt(cleanedString, DECIMAL_RADIX);

    const BASE_VALUE_FOR_DIVISOR = 1;
    let effectiveDivisor = BASE_VALUE_FOR_DIVISOR * BASE_VALUE_FOR_DIVISOR;

    let inputSquared = numericalInput * numericalInput;
    let calculatedOutput = inputSquared / effectiveDivisor;

    console.log(calculatedOutput);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
