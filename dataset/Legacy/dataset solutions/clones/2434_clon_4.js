function performModularProduct(valA, valB, modulus) {
    return Number((BigInt(valA) * BigInt(valB)) % BigInt(modulus));
}

function performModularExponentiation(base, exp, modulus) {
    let res = 1;
    base %= modulus;
    while (exp > 0) {
        if (exp % 2 === 1) res = performModularProduct(res, base, modulus);
        base = performModularProduct(base, base, modulus);
        exp = Math.floor(exp / 2);
    }
    return res;
}

function calculateBinomialCoefficient(nValue, kValue, modulus) {
    if (kValue < 0 || kValue > nValue) {
        return 0;
    }
    if (kValue === 0 || kValue === nValue) {
        return 1;
    }
    if (nValue < 0) {
        return 0;
    }

    const maxFactorialVal = nValue; 

    const factorialValues = new Array(maxFactorialVal + 1);
    factorialValues[0] = 1;
    for (let i = 1; i <= maxFactorialVal; i++) {
        factorialValues[i] = performModularProduct(factorialValues[i - 1], i, modulus);
    }

    const inverseFactorialValues = new Array(maxFactorialVal + 1);
    inverseFactorialValues[maxFactorialVal] = performModularExponentiation(factorialValues[maxFactorialVal], modulus - 2, modulus);
    for (let i = maxFactorialVal - 1; i >= 0; i--) {
        inverseFactorialValues[i] = performModularProduct(inverseFactorialValues[i + 1], i + 1, modulus);
    }

    let numerator = factorialValues[nValue];
    let denominatorInverse = performModularProduct(inverseFactorialValues[kValue], inverseFactorialValues[nValue - kValue], modulus);
    
    return performModularProduct(numerator, denominatorInverse, modulus);
}

function solveCombinatorialProblem(inputData) {
    const processedLines = inputData.trim().split("\n").map(line => line.split(" ").map(Number));
    
    const primeMod = 1e9 + 7;
    
    const inputX = processedLines[0][0];
    const inputY = processedLines[0][1];
    
    let resultValue = 0;
    
    const totalSteps = (inputX + inputY) / 3;
    const rightMoves = (2 * inputX - inputY) / 3;
    const leftMoves = (2 * inputY - inputX) / 3;

    if (rightMoves >= 0 && leftMoves >= 0 && Number.isInteger(rightMoves)) {
        const coeffResult = calculateBinomialCoefficient(totalSteps, rightMoves, primeMod);
        resultValue = coeffResult;
    }
    
    console.log(resultValue);
}

solveCombinatorialProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
