function emitResult(dataValue) {
    console.log(dataValue);
}

function calculatePowerModulo(baseValue, exponentValue, moduloValue) {
    let resultAccumulator = 1;
    baseValue %= moduloValue;
    while (exponentValue > 0) {
        if (exponentValue % 2 === 1) {
            resultAccumulator = (resultAccumulator * baseValue) % moduloValue;
        }
        baseValue = (baseValue * baseValue) % moduloValue;
        exponentValue = Math.floor(exponentValue / 2);
    }
    return resultAccumulator;
}

function performComplexOperation(inputPayload) {
    const PRIME_MODULUS = 1000000007;
    const quantityIndicator = parseInt(inputPayload);

    const quotient = Math.floor(quantityIndicator / 3);
    const remainder = quantityIndicator % 3;

    let countForThree = quotient;
    let countForTwo = quotient;

    if (remainder === 1) {
        countForThree++;
    } else if (remainder === 2) {
        countForThree++;
        countForTwo++;
    }

    const termThree = calculatePowerModulo(3, countForThree, PRIME_MODULUS);
    const termTwo = calculatePowerModulo(2, countForTwo, PRIME_MODULUS);

    const computedValue = (termThree * termTwo) % PRIME_MODULUS;

    emitResult(computedValue);
}

performComplexOperation(require("fs").readFileSync("/dev/stdin", "utf8").trim());