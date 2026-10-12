'use strict'

const processInputData = (rawData) => {
    const dataLines = rawData.trim().split('\n');
    const [firstNum, secondNum] = dataLines[0].split(' ').map(Number);
    return { firstNum, secondNum };
};

const performCalculations = ({ firstNum, secondNum }) => {
    const PRIME_MODULUS = 1000000007; // 1e9 + 7

    // Helper for modular exponentiation: base^exp % modulus
    const powerModulo = (base, exponent) => {
        let res = 1;
        base %= PRIME_MODULUS;
        while (exponent > 0) {
            if (exponent % 2 === 1) res = (res * base) % PRIME_MODULUS;
            base = (base * base) % PRIME_MODULUS;
            exponent = Math.floor(exponent / 2);
        }
        return res;
    };

    // Helper for modular inverse using Fermat's Little Theorem: a^(mod-2) % mod
    const inverseModulo = (num) => powerModulo(num, PRIME_MODULUS - 2);

    // Precompute factorials and their modular inverses up to firstNum
    // The maximum value for 'n' in nCr is firstNum (from n-k+1 when k=1).
    const maxFactorialN = firstNum;
    const factorialValues = new Array(maxFactorialN + 1);
    const inverseFactorialValues = new Array(maxFactorialN + 1);

    factorialValues[0] = 1;
    inverseFactorialValues[0] = 1;
    for (let i = 1; i <= maxFactorialN; i++) {
        factorialValues[i] = (factorialValues[i - 1] * i) % PRIME_MODULUS;
        inverseFactorialValues[i] = inverseModulo(factorialValues[i]);
    }

    // Calculate combinations (nCr % P) using precomputed values
    const getCombinationsMod = (nVal, rVal) => {
        if (rVal < 0 || rVal > nVal) return 0;
        // nCr = n! / (r! * (n-r)!)
        // nCr % P = (n! % P * (r!)^(-1) % P * ((n-r)!)^(-1) % P) % P
        let numeratorTerm = factorialValues[nVal];
        let denominatorTerm1 = inverseFactorialValues[rVal];
        let denominatorTerm2 = inverseFactorialValues[nVal - rVal];

        return (((numeratorTerm * denominatorTerm1) % PRIME_MODULUS) * denominatorTerm2) % PRIME_MODULUS;
    };

    // Generate results for each iteration from 1 to secondNum using functional mapping
    const outputLines = Array.from({ length: secondNum }, (_, index) => index + 1)
        .map(currentIteration => {
            const termA = getCombinationsMod(firstNum - secondNum + 1, currentIteration);
            const termB = getCombinationsMod(secondNum - 1, currentIteration - 1);
            let finalResult = (termA * termB) % PRIME_MODULUS;
            // The original code included Math.round(answer % mod) and a -0 check.
            // With modular arithmetic, results are always non-negative integers in [0, PRIME_MODULUS-1].
            // Therefore, Math.round is redundant and the -0 check is not applicable,
            // as the direct modular calculation yields the intended integer result.
            return finalResult;
        });

    return outputLines.join('\n');
};

const entryPoint = (inputArgument) => {
    const parsedData = processInputData(inputArgument);
    const finalOutput = performCalculations(parsedData);
    console.log(finalOutput);
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
