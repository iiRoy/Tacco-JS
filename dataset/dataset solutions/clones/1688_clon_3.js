function getModuloIfAboveThreshold(inputValue, thresholdLimit) {
    if (inputValue >= thresholdLimit) {
        return inputValue % thresholdLimit;
    }
    return inputValue;
}

function processInputData(rawData) {
    const MODULO_CONSTANT = 1000;
    let processedNumber = Number(rawData);

    processedNumber = getModuloIfAboveThreshold(processedNumber, MODULO_CONSTANT);

    console.log(processedNumber);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
