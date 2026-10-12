const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

const MODULUS_VALUE = 998244353n;

function powerModulo(baseVal, exponentVal) {
    if (exponentVal === 0n) {
        return 1n;
    }
    if (exponentVal === 1n) {
        return baseVal % MODULUS_VALUE;
    }
    let halfPowerResult = powerModulo(baseVal, exponentVal / 2n);
    let squaredHalf = (halfPowerResult * halfPowerResult) % MODULUS_VALUE;

    if (exponentVal % 2n === 1n) {
        return (squaredHalf * baseVal) % MODULUS_VALUE;
    } else {
        return squaredHalf;
    }
}

function modularInverse(valueToInvert) {
    if (valueToInvert === 1n) {
        return 1n;
    }
    return powerModulo(valueToInvert, MODULUS_VALUE - 2n);
}

((inputContent) => {
    const dataLines = inputContent.split('\n');
    const [paramN, paramM, paramK] = dataLines[0].split(' ').map(BigInt);

    const nForCombinations = paramN - 1n;
    const maxFactorialIndex = nForCombinations > paramK ? nForCombinations : paramK;
    
    // Ensure maxFactorialIndex is non-negative for array sizing
    const actualMaxFact = maxFactorialIndex >= 0n ? maxFactorialIndex : 0n;

    const factorialValues = new Array(Number(actualMaxFact) + 1).fill(1n);
    const inverseFactorialValues = new Array(Number(actualMaxFact) + 1).fill(1n);

    for (let i = 1n; i <= actualMaxFact; i++) {
        factorialValues[Number(i)] = (factorialValues[Number(i - 1n)] * i) % MODULUS_VALUE;
    }

    if (actualMaxFact >= 0n) {
        inverseFactorialValues[Number(actualMaxFact)] = modularInverse(factorialValues[Number(actualMaxFact)]);
        for (let i = actualMaxFact - 1n; i >= 0n; i--) {
            inverseFactorialValues[Number(i)] = (inverseFactorialValues[Number(i + 1n)] * (i + 1n)) % MODULUS_VALUE;
        }
    }

    const getCombinationCoefficient = (n_comb, k_comb) => {
        if (k_comb < 0n || k_comb > n_comb) return 0n;
        return (factorialValues[Number(n_comb)] * inverseFactorialValues[Number(k_comb)] % MODULUS_VALUE * inverseFactorialValues[Number(n_comb - k_comb)] % MODULUS_VALUE);
    };

    const totalResult = Array.from({ length: Number(paramK) + 1 }, (_, idx) => BigInt(idx))
        .reduce((currentAccumulatedSum, currentKValue) => {
            const combinationPart = getCombinationCoefficient(nForCombinations, currentKValue);
            const exponentForPower = paramN - (currentKValue + 1n);
            
            const powerComponent = powerModulo(paramM - 1n, exponentForPower);
            
            const termForCurrentK = (combinationPart * powerComponent % MODULUS_VALUE * paramM % MODULUS_VALUE);
            return (currentAccumulatedSum + termForCurrentK) % MODULUS_VALUE;
        }, 0n);

    console.log(totalResult.toString());

})(rawData);
