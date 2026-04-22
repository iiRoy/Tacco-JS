const currentModulus = 998244353;
const factorialValues = [1, 1];
const inverseFactorialValues = [1, 1];

const multiplyMod = (...nums) => nums.reduce((acc, val) => (BigInt(acc) * BigInt(val)) % BigInt(currentModulus), BigInt(1));

const powerMod = (base, exponent) => {
    if (exponent === 0) return BigInt(1);
    if (exponent === 1) return BigInt(base) % BigInt(currentModulus);

    let result = powerMod(base, Math.floor(exponent / 2));
    result = multiplyMod(result, result);

    if (exponent % 2 === 1) {
        result = multiplyMod(result, base);
    }
    return result;
};

const computeFactorial = (val) => {
    while (factorialValues.length <= val) {
        factorialValues.push(Number(multiplyMod(factorialValues[factorialValues.length - 1], factorialValues.length)));
    }
    return factorialValues[val];
};

const computeInverseFactorial = (val) => {
    if (val < 0) return 0;
    computeFactorial(val);

    if (inverseFactorialValues[val] === undefined) {
        inverseFactorialValues[val] = Number(powerMod(factorialValues[val], currentModulus - 2));
        
        let currentIdx = val;
        while (currentIdx > 0 && inverseFactorialValues[currentIdx - 1] === undefined) {
            inverseFactorialValues[currentIdx - 1] = Number(multiplyMod(inverseFactorialValues[currentIdx], currentIdx));
            currentIdx--;
        }
    }
    return inverseFactorialValues[val];
};

const combinationsMod = (nVal, rVal) => {
    if (rVal < 0 || rVal > nVal) {
        return 0;
    }
    computeInverseFactorial(nVal);
    
    return Number(multiplyMod(factorialValues[nVal], inverseFactorialValues[rVal], inverseFactorialValues[nVal - rVal]));
};

const SolveProblem = (inputString) => {
    const [paramCount, paramA, paramB, paramLimit] = inputString.split(" ").map(Number);

    const finalSum = Array.from({ length: paramCount + 1 }, (_, indexI) => indexI)
        .reduce((accumulator, indexI) => {
            const remainingK = paramLimit - indexI * paramA;

            if (remainingK < 0) {
                return accumulator;
            }

            if (remainingK % paramB === 0) {
                const indexJ = remainingK / paramB;
                if (indexJ >= 0 && indexJ <= paramCount) {
                    const term = multiplyMod(combinationsMod(paramCount, indexI), combinationsMod(paramCount, indexJ));
                    return Number((BigInt(accumulator) + term) % BigInt(currentModulus));
                }
            }
            return accumulator;
        }, 0);

    console.log(finalSum);
};

SolveProblem(require("fs").readFileSync("/dev/stdin","utf8"));