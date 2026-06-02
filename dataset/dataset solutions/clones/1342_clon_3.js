function ProcessInput(rawInputString) {
    const trimmedInput = rawInputString.trim();
    const lines = trimmedInput.split("\n");
    const firstLineParts = lines[0].split(" ");

    const baseVal = parseInt(firstLineParts[0], 10);
    const exponentVal = parseInt(firstLineParts[1], 10);

    const modulus = 1e9 + 7;
    const splitFactor = 1e5 * 5;

    console.log(modularExponentiation(baseVal, exponentVal, modulus, splitFactor));
}

function modularExponentiation(base, exponent, mod, factor) {
    if (exponent === 0) {
        return 1;
    }

    let result = 1;
    let currentBase = base % mod;

    let tempExponent = exponent;

    while (tempExponent > 0) {
        if (tempExponent & 1) {
            result = multiplyModular(result, currentBase, mod, factor);
        }
        currentBase = multiplyModular(currentBase, currentBase, mod, factor);
        tempExponent >>= 1;
    }
    return result;
}

function multiplyModular(operandA, operandB, modulusVal, splitFactorVal) {
    const quotientPart = Math.floor(operandB / splitFactorVal);
    const remainderPart = operandB - (quotientPart * splitFactorVal);

    const term1Intermediate = (operandA * quotientPart);
    const term1 = term1Intermediate % modulusVal;

    const term2 = (operandA * remainderPart);

    let finalResult = (term1 * splitFactorVal % modulusVal + term2);
    finalResult %= modulusVal;

    return finalResult;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
