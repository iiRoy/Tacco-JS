const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

const primeModulus = 998244353n;

function calculatePower(baseVal, exponentVal) {
    let resultValue = 1n;
    let currentBase = baseVal;
    let currentExponent = exponentVal;

    while (currentExponent > 0n) {
        const isExponentOdd = (currentExponent % 2n) === 1n;
        if (isExponentOdd) {
            resultValue = (resultValue * currentBase) % primeModulus;
        }
        currentBase = (currentBase * currentBase) % primeModulus;
        currentExponent = currentExponent / 2n;
    }
    return resultValue;
}

function modularInverse(valueToInverse) {
    if (valueToInverse === 1n) {
        return 1n;
    }
    // Using Fermat's Little Theorem: a^(p-2) % p is the modular inverse for prime p
    return calculatePower(valueToInverse, primeModulus - 2n);
}

((processedInputData) => {
    const inputLines = processedInputData.split('\n');

    const firstLineParts = inputLines[0].split(' ');
    let numN = BigInt(firstLineParts[0]);
    let numM = BigInt(firstLineParts[1]);
    let numK = BigInt(firstLineParts[2]);

    let finalAnswer = 0n;
    let factorialAccumulator = 1n;
    let secondFactorialAccumulator = 1n;

    for (let loopCounter = 0n; loopCounter <= numK; loopCounter++) {
        const currentKValue = loopCounter || 1n;
        factorialAccumulator = factorialAccumulator * currentKValue;

        const termForFa2 = numN - (loopCounter || (numN - 1n));
        secondFactorialAccumulator = (secondFactorialAccumulator * termForFa2) % primeModulus;

        const currentFactorialMod = factorialAccumulator % primeModulus;
        const inverseOfFactorial = modularInverse(currentFactorialMod);
        let intermediateLeft = (secondFactorialAccumulator * inverseOfFactorial) % primeModulus;

        const baseForPower = numM - 1n;
        const exponentForPower = numN - (loopCounter + 1n);
        const powerTerm = calculatePower(baseForPower, exponentForPower);

        const mMultiplier = numM;
        const currentProduct = (intermediateLeft * powerTerm) % primeModulus;
        const termWithMMultiplier = (currentProduct * mMultiplier) % primeModulus;

        finalAnswer = (finalAnswer + termWithMMultiplier) % primeModulus;
    }

    console.log(finalAnswer.toString());

})(rawData);
