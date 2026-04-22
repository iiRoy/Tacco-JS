const extractNumericValue = (rawContent) => {
    return Number.parseInt(rawContent.split('\n')[0]);
};

const generatePrimesUpTo = (upperBound) => {
    const isPrime = new Array(upperBound + 1).fill(true);
    isPrime[0] = false;
    isPrime[1] = false;
    for (let p = 2; p * p <= upperBound; p++) {
        if (isPrime[p]) {
            for (let multiple = p * p; multiple <= upperBound; multiple += p) {
                isPrime[multiple] = false;
            }
        }
    }
    const primeList = [];
    for (let p = 2; p <= upperBound; p++) {
        if (isPrime[p]) {
            primeList.push(p);
        }
    }
    return primeList;
};

const computeFactorialPrimePowers = (numberLimit, primes) => {
    const primePowerMap = new Map();
    for (const currentPrime of primes) {
        if (currentPrime > numberLimit) {
            continue; // Only consider primes less than or equal to N
        }
        let totalCount = 0;
        let powerOfPrime = currentPrime;
        while (powerOfPrime <= numberLimit) {
            totalCount += Math.floor(numberLimit / powerOfPrime);
            if (powerOfPrime > numberLimit / currentPrime) { // Avoid overflow before multiplication
                break;
            }
            powerOfPrime *= currentPrime;
        }
        if (totalCount > 0) {
            primePowerMap.set(currentPrime, totalCount);
        }
    }
    return primePowerMap;
};

const categorizeExponents = (exponentMapping) => {
    let countForCategoryTwoThree = 0;
    let countForCategoryFourOrMore = 0;

    for (const exponentValue of exponentMapping.values()) {
        if (exponentValue === 2 || exponentValue === 3) {
            countForCategoryTwoThree++;
        } else if (exponentValue >= 4) {
            countForCategoryFourOrMore++;
        }
    }
    return { countForCategoryTwoThree, countForCategoryFourOrMore };
};

const calculateCombinations = (n, k) => {
    if (k < 0 || k > n) {
        return 0;
    }
    if (k === 0 || k === n) {
        return 1;
    }
    if (k > n / 2) {
        k = n - k;
    }
    let result = 1;
    for (let i = 1; i <= k; i++) {
        result = result * (n - i + 1) / i;
    }
    return result;
};

const deriveFinalQuantity = (valTwoThree, valFourPlus) => {
    return valTwoThree * calculateCombinations(valFourPlus, 2) + calculateCombinations(valFourPlus, 3);
};

const processInputAndCompute = (externalData) => {
    const numericLimit = extractNumericValue(externalData);

    // Primes are needed up to 100 because the original X array is indexed up to 100.
    const allPrimes = generatePrimesUpTo(100); 

    const factorialPrimeExponents = computeFactorialPrimePowers(numericLimit, allPrimes);

    const { countForCategoryTwoThree, countForCategoryFourOrMore } = categorizeExponents(factorialPrimeExponents);

    const finalAnswer = deriveFinalQuantity(countForCategoryTwoThree, countForCategoryFourOrMore);

    console.log(String(finalAnswer));
};

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));