const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

const moduloConstant = 998244353;

/**
 * Performs modular exponentiation (base^exponent % moduloConstant).
 * @param {number} baseVal - The base.
 * @param {number} exponentVal - The exponent.
 * @returns {number} The result of base^exponent % moduloConstant.
 */
function powerModulo(baseVal, exponentVal) {
    let resultVal = 1;
    let currentBase = baseVal % moduloConstant;
    if (currentBase < 0) currentBase += moduloConstant; // Ensure positive base

    let currentExponent = exponentVal;

    while (currentExponent > 0) {
        if (currentExponent & 1) {
            resultVal = multiplyModulo(resultVal, currentBase);
        }
        currentBase = multiplyModulo(currentBase, currentBase);
        currentExponent >>= 1;
    }
    return resultVal;
}

/**
 * Calculates the modular multiplicative inverse of a number using Fermat's Little Theorem.
 * Assumes moduloConstant is a prime number.
 * @param {number} val - The number to find the inverse of.
 * @returns {number} The modular inverse of val.
 */
function modularInverse(val) {
    if (val === 1) {
        return 1;
    }
    const exponentForInverse = moduloConstant - 2;
    return powerModulo(val, exponentForInverse);
}

/**
 * Performs modular multiplication (operandA * operandB % moduloConstant)
 * using a specific optimization to prevent overflow for large numbers.
 * @param {number} operandA - The first operand.
 * @param {number} operandB - The second operand.
 * @returns {number} The result of (operandA * operandB) % moduloConstant.
 */
function multiplyModulo(operandA, operandB) {
    let a_normalized = (operandA % moduloConstant + moduloConstant) % moduloConstant;
    let b_normalized = (operandB % moduloConstant + moduloConstant) % moduloConstant;

    const highPartA = a_normalized >>> 16;
    const lowPartA = a_normalized & 0xFFFF; // 65535

    const termHighIntermediate = highPartA * b_normalized;
    const termHighModded = termHighIntermediate % moduloConstant;
    const termHighFinal = termHighModded * 0x10000; // 65536

    const termLowFinal = lowPartA * b_normalized;

    return (termHighFinal + termLowFinal) % moduloConstant;
}

// Helper function to parse space-separated numbers from a string
const parseSpaceSeparatedNumbers = (inputString) => {
    return inputString.split(' ').map(Number);
};

// Helper function for the factorial B term logic
const getFactorialBTerm = (currentIndex, totalN) => {
    if (currentIndex === 0) {
        return 1;
    }
    return totalN - currentIndex;
};

((inputContent) => {
    const inputLines = inputContent.split('\n');
    let [numN, numM, numK] = parseSpaceSeparatedNumbers(inputLines[0]);

    let finalResultAccumulator = 0;
    let currentFactorialA = 1;
    let currentFactorialB = 1;

    for (let loopIterationIndex = 0; loopIterationIndex <= numK; loopIterationIndex++) {
        const multiplierForFactorialA = (loopIterationIndex === 0) ? 1 : loopIterationIndex;
        currentFactorialA = multiplyModulo(currentFactorialA, multiplierForFactorialA);

        const multiplierForFactorialB = getFactorialBTerm(loopIterationIndex, numN);
        currentFactorialB = multiplyModulo(currentFactorialB, multiplierForFactorialB);

        const inverseOfFactorialA = modularInverse(currentFactorialA);
        const intermediateProductTerm = multiplyModulo(currentFactorialB, inverseOfFactorialA);

        const powerBase = numM - 1;
        const powerExponent = numN - (loopIterationIndex + 1);
        const calculatedPower = powerModulo(powerBase, powerExponent);

        const termBeforeFinalM = multiplyModulo(intermediateProductTerm, calculatedPower);
        const currentTermValue = multiplyModulo(termBeforeFinalM, numM);

        finalResultAccumulator = (finalResultAccumulator + currentTermValue) % moduloConstant;
    }

    console.log(finalResultAccumulator);

})(rawData);
