function modMultiply(firstOperand, secondOperand, modulus) {
    return (firstOperand * secondOperand) % modulus;
}

function modPower(baseVal, exponentVal, modulus) {
    if (exponentVal === 0n) return 1n;

    let halfPower = modPower(baseVal, exponentVal / 2n, modulus);
    let squaredHalf = modMultiply(halfPower, halfPower, modulus);
    if (exponentVal % 2n === 1n) {
        return modMultiply(squaredHalf, baseVal, modulus);
    }
    return squaredHalf;
}

function modInverse(val, modulus) {
    return modPower(val, modulus - 2n, modulus);
}

function getBinomialCoefficients(nVal, kLimit, modulus) {
    let coefficients = [];
    let currentCoeff = 1n;
    coefficients.push(currentCoeff);

    for (let i = 1n; i <= kLimit; i++) {
        let numeratorTerm = modMultiply(currentCoeff, nVal - i + 1n, modulus);
        let denominatorInverse = modInverse(i, modulus);
        currentCoeff = modMultiply(numeratorTerm, denominatorInverse, modulus);
        coefficients.push(currentCoeff);
    }
    return coefficients;
}

function Main(input) {
    const lines = input.trim().split("\n");
    const params = lines[0].split(" ").map(Number);

    const N_val_num = params[0];
    const M_val_num = params[1];
    const K_val_num = params[2];

    const MOD_CONSTANT = 998244353n;

    const N_val_big = BigInt(N_val_num);
    const M_val_big = BigInt(M_val_num);
    const K_val_big = BigInt(K_val_num);

    const binomialTerms = getBinomialCoefficients(N_val_big - 1n, K_val_big, MOD_CONSTANT);
    const reversedBinomialTerms = [...binomialTerms].reverse();

    let currentPowerTerm = modPower(M_val_big - 1n, N_val_big - K_val_big - 1n, MOD_CONSTANT);

    const accumulatedSum = reversedBinomialTerms.reduce((accumulator, currentBinomial) => {
        const termToAdd = modMultiply(currentPowerTerm, currentBinomial, MOD_CONSTANT);
        currentPowerTerm = modMultiply(currentPowerTerm, M_val_big - 1n, MOD_CONSTANT);
        return (accumulator + termToAdd) % MOD_CONSTANT;
    }, 0n);

    const finalResult = modMultiply(accumulatedSum, M_val_big, MOD_CONSTANT);

    console.log(Number(finalResult));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
