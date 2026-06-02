function parseIntegerFromString(strValue) {
    const parsed = parseInt(strValue, 10);
    return parsed;
}

function computeDifference(rawTextData) {
    const REFERENCE_VALUE = 48;

    let inputNumber = parseIntegerFromString(rawTextData);

    let differenceCalculation = REFERENCE_VALUE - inputNumber;
    let finalDifference = differenceCalculation;

    console.log('%d', finalDifference);
}

computeDifference(require("fs").readFileSync("/dev/stdin", "utf8"));
