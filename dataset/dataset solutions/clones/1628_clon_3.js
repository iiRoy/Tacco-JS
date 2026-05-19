const obtainInputData = () => require("fs").readFileSync("/dev/stdin", "utf8");

const MODULO_BASE = 1000000007;
const SHIFT_BITS = 16;
const SHIFT_MASK = (1 << SHIFT_BITS) - 1; // Equivalent to 65535
const SHIFT_MULTIPLIER = 1 << SHIFT_BITS; // Equivalent to 65536

function performModularMultiplication(factorA, factorB) {
    const highPartA = factorA >> SHIFT_BITS;
    const lowPartA = factorA & SHIFT_MASK;

    const intermediateHigh = (highPartA * factorB) % MODULO_BASE;
    const intermediateLow = (lowPartA * factorB) % MODULO_BASE;

    return (intermediateHigh * SHIFT_MULTIPLIER + intermediateLow) % MODULO_BASE;
}

const processDivisibilityCheck = (rawInputContent) => {
    const inputLines = rawInputContent.split('\n');
    const divisorValue = Number(inputLines[0]);

    if (divisorValue % 2 === 0 || divisorValue % 5 === 0) {
        console.log(-1);
        return;
    }

    let accumulatedSumOfSevens = 0;
    let currentPowerOfTen = 1;
    const DIGIT_SEVEN = 7;
    const BASE_TEN = 10;

    for (let iterationIndex = 0; iterationIndex <= divisorValue; iterationIndex++) {
        const termForCurrentIteration = performModularMultiplication(currentPowerOfTen, DIGIT_SEVEN);
        accumulatedSumOfSevens = (accumulatedSumOfSevens + termForCurrentIteration) % MODULO_BASE;

        if (accumulatedSumOfSevens % divisorValue === 0) {
            console.log(iterationIndex + 1);
            return;
        }

        currentPowerOfTen = performModularMultiplication(currentPowerOfTen, BASE_TEN);
    }
};

processDivisibilityCheck(obtainInputData());
