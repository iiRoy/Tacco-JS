const acquireNumericalDatum = (() => {
    let sourceContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
    let numericalValue = parseInt(sourceContent.trim().split(/\s+/)[0], 10);
    return () => numericalValue;
})();

const largePrimeConstant = 998244353n;

const performProductModulus = (leftOperand, rightOperand) => {
    return Number((BigInt(leftOperand) * BigInt(rightOperand)) % largePrimeConstant);
};

const calculateModularInverse = (valueToInvert) => {
    let initialA = BigInt(valueToInvert);
    let initialM = largePrimeConstant;
    let x0 = 0n;
    let x1 = 1n;

    while (initialA > 1n) {
        let quotient = initialA / initialM;
        let tempM = initialM;
        initialM = initialA % initialM;
        initialA = tempM;
        let tempX = x0;
        x0 = x1 - quotient * x0;
        x1 = tempX;
    }
    return Number(x1 < 0n ? x1 + largePrimeConstant : x1);
};

const recursivelyComputePower = (baseValue, exponentValue) => {
    if (exponentValue === 0) {
        return 1;
    }
    let intermediateResult = recursivelyComputePower(baseValue, Math.floor(exponentValue / 2));
    intermediateResult = performProductModulus(intermediateResult, intermediateResult);
    if (exponentValue % 2 === 1) {
        intermediateResult = performProductModulus(intermediateResult, baseValue);
    }
    return intermediateResult;
};

const deriveFinalNumericalAnswer = () => {
    const primaryInputVal = acquireNumericalDatum();
    const initialSummand = recursivelyComputePower(3, primaryInputVal);

    const halfInputCeiling = primaryInputVal >> 1;

    const iterativeSubtractionProcess = (currentStep, currentPowerOfTwo, currentCombinationFactor, runningTotal) => {
        if (currentStep >= halfInputCeiling) {
            return runningTotal;
        }

        const nextPowerOfTwo = performProductModulus(currentPowerOfTwo, 2);
        const termToSubtract = performProductModulus(currentCombinationFactor, nextPowerOfTwo);
        const updatedTotal = (runningTotal - termToSubtract + largePrimeConstant) % largePrimeConstant;

        const nextCombinationFactor = performProductModulus(
            performProductModulus(currentCombinationFactor, primaryInputVal - currentStep),
            calculateModularInverse(currentStep + 1)
        );

        return iterativeSubtractionProcess(currentStep + 1, nextPowerOfTwo, nextCombinationFactor, updatedTotal);
    };

    let resultBeforeNormalization = iterativeSubtractionProcess(0, 1, 1, initialSummand);
    return (resultBeforeNormalization + largePrimeConstant) % largePrimeConstant;
};

console.log(deriveFinalNumericalAnswer());