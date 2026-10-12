const MOD_CONSTANT = 10 ** 9 + 7;

function computeModularExponent(baseValue, expValue) {
    let currentResult = 1n;
    let currentBase = BigInt(baseValue);
    let currentExp = BigInt(expValue);
    const modulus = BigInt(MOD_CONSTANT);

    currentBase %= modulus;

    while (currentExp > 0n) {
        if (currentExp & 1n) {
            currentResult = (currentResult * currentBase) % modulus;
        }
        currentBase = (currentBase * currentBase) % modulus;
        currentExp >>= 1n;
    }
    return Number(currentResult);
}

function processInputAndDisplay(rawData) {
    const parsedNumber = parseInt(rawData, 10);
    const modulus = MOD_CONSTANT;

    const termA = computeModularExponent(10, parsedNumber);
    const termB = computeModularExponent(9, parsedNumber);
    const termC = computeModularExponent(8, parsedNumber);

    const twoTimesTermB = (2 * termB) % modulus;

    let intermediateSum = (termA - twoTimesTermB + termC);
    intermediateSum = (intermediateSum % modulus + modulus) % modulus;

    console.log(intermediateSum);
}

processInputAndDisplay(require("fs").readFileSync("/dev/stdin", "utf8"));
