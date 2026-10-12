const PRIME_MODULUS = 10**9 + 7;

const modProduct = (val1, val2) => {
    return (val1 * val2) % PRIME_MODULUS;
};

const powerMod = (base, exponent) => {
    if (exponent === 0) return 1;
    if (exponent === 1) return base % PRIME_MODULUS;

    let halfPower = powerMod(base, Math.floor(exponent / 2));
    let result = modProduct(halfPower, halfPower);

    if (exponent % 2 === 1) {
        result = modProduct(result, base);
    }
    return result;
};

const decomposeIntoPrimes = (num) => {
    const primeExponents = new Map();
    let currentNum = num;

    if (currentNum % 2 === 0) {
        let count = 0;
        while (currentNum % 2 === 0) {
            currentNum /= 2;
            count++;
        }
        primeExponents.set(2, count);
    }

    for (let i = 3; i * i <= currentNum; i += 2) {
        if (currentNum % i === 0) {
            let count = 0;
            while (currentNum % i === 0) {
                currentNum /= i;
                count++;
            }
            primeExponents.set(i, count);
        }
    }

    if (currentNum > 1) {
        primeExponents.set(currentNum, (primeExponents.get(currentNum) || 0) + 1);
    }
    return primeExponents;
};

const calculateCombinations = (upperBound, lowerBound) => {
    if (lowerBound < 0 || lowerBound > upperBound) return 0;
    if (lowerBound === 0 || lowerBound === upperBound) return 1;
    
    if (lowerBound > upperBound / 2) {
        lowerBound = upperBound - lowerBound;
    }

    let numeratorPart = 1;
    for (let k = 0; k < lowerBound; k++) {
        numeratorPart = modProduct(numeratorPart, (upperBound - k));
    }

    let denominatorPart = 1;
    for (let k = 1; k <= lowerBound; k++) {
        denominatorPart = modProduct(denominatorPart, k);
    }

    const invDenominator = powerMod(denominatorPart, PRIME_MODULUS - 2);

    return modProduct(numeratorPart, invDenominator);
};

const processInput = (inputString) => {
    const [itemCount, totalValue] = inputString.split(" ").map(Number);

    const primeDecomposition = decomposeIntoPrimes(totalValue);

    let finalResult = 1;

    for (const [prime, exponent] of primeDecomposition.entries()) {
        const starsAndBarsN = exponent + itemCount - 1;
        const starsAndBarsK = exponent;
        
        finalResult = modProduct(finalResult, calculateCombinations(starsAndBarsN, starsAndBarsK));
    }

    console.log(finalResult);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
