const MATH_CONFIG = {
    PRIME_MODULUS: 1000000007n,
    MAX_CAPACITY: 100000 + 1000
};

let productSeries = [];
let inverseProductSeries = [];

const calculatePower = (baseValue, exponentValue) => {
    const mod = MATH_CONFIG.PRIME_MODULUS;
    let base = BigInt(baseValue);
    let exponent = BigInt(exponentValue);

    const recurseExponent = (currentBase, currentExponent) => {
        if (currentExponent === 0n) return 1n;
        if (currentExponent === 1n) return currentBase % mod;
        
        let halfResult = recurseExponent(currentBase, currentExponent / 2n);
        let squaredResult = (halfResult * halfResult) % mod;
        if (currentExponent % 2n === 1n) {
            squaredResult = (squaredResult * currentBase) % mod;
        }
        return squaredResult;
    };
    return Number(recurseExponent(base, exponent));
};

const prepareCombinatorics = () => {
    const limit = MATH_CONFIG.MAX_CAPACITY;
    const mod = MATH_CONFIG.PRIME_MODULUS;

    productSeries[0] = 1n;
    for (let k = 1; k < limit; ++k) {
        productSeries[k] = (productSeries[k - 1] * BigInt(k)) % mod;
    }

    inverseProductSeries[limit - 1] = BigInt(calculatePower(productSeries[limit - 1], Number(mod - 2n)));
    
    for (let k = limit - 2; k >= 0; --k) {
        inverseProductSeries[k] = (inverseProductSeries[k + 1] * BigInt(k + 1)) % mod;
    }
};

const decomposeNumber = (numericalValue) => {
    const componentMap = new Map();

    const findComponents = (currentValue, currentDivisor) => {
        if (currentValue === 1) return;

        if (currentDivisor * currentDivisor > currentValue) {
            componentMap.set(currentValue, (componentMap.get(currentValue) || 0) + 1);
            return;
        }

        if (currentValue % currentDivisor === 0) {
            componentMap.set(currentDivisor, (componentMap.get(currentDivisor) || 0) + 1);
            findComponents(currentValue / currentDivisor, currentDivisor);
        } else {
            findComponents(currentValue, currentDivisor === 2 ? 3 : currentDivisor + 2);
        }
    };

    findComponents(numericalValue, 2);
    return Array.from(componentMap, ([factorBase, factorExponent]) => ({ factorBase, factorExponent }));
};

const calculateCombinations = (upperBound, lowerBound) => {
    if (upperBound < 0 || lowerBound < 0) return 1;
    if (upperBound < lowerBound) return 1;
    if (lowerBound === 0 || upperBound === lowerBound) return 1;
    if (lowerBound > upperBound / 2) lowerBound = upperBound - lowerBound;

    const mod = MATH_CONFIG.PRIME_MODULUS;
    let termA = productSeries[upperBound];
    let termB = inverseProductSeries[lowerBound];
    let termC = inverseProductSeries[upperBound - lowerBound];
    
    return Number((termA * termB % mod * termC) % mod);
};

const processInput = (inputData) => {
    let [valueN, valueM] = inputData.split(" ").map(Number);

    prepareCombinatorics();

    let primeComponents = decomposeNumber(valueM);

    let finalAccumulation = primeComponents.reduce((currentTotal, componentItem) => {
        let exponentVal = componentItem.factorExponent;
        let combinationUpper = exponentVal + valueN - 1;
        let combinationLower = exponentVal;

        if (combinationUpper < 2 * combinationLower) {
            combinationLower = combinationUpper - combinationLower;
        }
        
        let combinationResult = calculateCombinations(combinationUpper, combinationLower);
        return (currentTotal * combinationResult) % Number(MATH_CONFIG.PRIME_MODULUS);
    }, 1);

    console.log(finalAccumulation);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));