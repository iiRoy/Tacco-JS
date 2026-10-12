function determineAdjustment(valueForCalculation, baseDivisor) {
    const currentRemainder = valueForCalculation % baseDivisor;
    if (currentRemainder > 0) {
        return baseDivisor - currentRemainder;
    } else {
        return 0;
    }
}

function computeRemainingAmount(inputStringValue = "") {
    const MODULO_BASE_VALUE = 1000;
    let parsedNumericValue = 0 | inputStringValue;
    
    return determineAdjustment(parsedNumericValue, MODULO_BASE_VALUE);
}

exports.main = computeRemainingAmount;

function executeAndDisplay(rawInputData) {
    console.log(computeRemainingAmount(rawInputData.trim()));
}

if (process.argv[2] !== "test") {
    executeAndDisplay(require("fs").readFileSync("/dev/stdin", "utf8"));
}
