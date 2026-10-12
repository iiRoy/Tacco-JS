const primeModulus = 10 ** 9 + 7;

function safeModulo(value) {
    return (value % primeModulus + primeModulus) % primeModulus;
}

function calculatePowerModulo(baseVal, exponentVal) {
    if (exponentVal === 0) {
        return 1;
    }
    let resultAccumulator = 1;
    for (let loopCounter = 0; loopCounter < exponentVal; loopCounter++) {
        resultAccumulator = safeModulo(resultAccumulator * baseVal);
    }
    return resultAccumulator;
}

function processInputAndCalculate(rawData) {
    const parsedNumber = parseInt(rawData, 10);

    const termForTen = calculatePowerModulo(10, parsedNumber);
    const termForNine = calculatePowerModulo(9, parsedNumber);
    const termForEight = calculatePowerModulo(8, parsedNumber);

    const doubledTermForNine = safeModulo(termForNine * 2);

    const intermediateDifference = safeModulo(termForTen - doubledTermForNine);

    const finalCalculatedResult = safeModulo(intermediateDifference + termForEight);

    console.log(finalCalculatedResult);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
