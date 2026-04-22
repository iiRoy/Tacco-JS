const LARGE_PRIME_CONSTANT = 1000000007n;
const MAX_FACTORIAL_INDEX = 100030;

const multiplyModulo = (firstOperand, secondOperand) => {
    return (firstOperand * secondOperand) % LARGE_PRIME_CONSTANT;
};

const powerRecursive = (baseVal, exponentVal) => {
    if (exponentVal === 0n) return 1n;
    if (exponentVal === 1n) return baseVal % LARGE_PRIME_CONSTANT;
    let halfPower = powerRecursive(baseVal, exponentVal / 2n);
    let result = multiplyModulo(halfPower, halfPower);
    if (exponentVal % 2n === 1n) {
        result = multiplyModulo(result, baseVal);
    }
    return result;
};

const getInverse = (value) => {
    return powerRecursive(value, LARGE_PRIME_CONSTANT - 2n);
};

const findPrimeExponents = (inputNumber) => {
    let currentNumber = inputNumber;
    const primeExponentMap = new Map();
    for (let divisor = 2n; divisor * divisor <= currentNumber; divisor++) {
        if (currentNumber % divisor === 0n) {
            let count = 0n;
            while (currentNumber % divisor === 0n) {
                currentNumber /= divisor;
                count++;
            }
            primeExponentMap.set(divisor, count);
        }
    }
    if (currentNumber > 1n) {
        primeExponentMap.set(currentNumber, 1n);
    }
    return primeExponentMap;
};

const calculateCoefficient = (totalItems, chooseItems, factorialArray, inverseFactorialArray) => {
    if (totalItems === 0n && chooseItems === 0n) return 1n;
    if (totalItems < chooseItems || chooseItems < 0n || totalItems < 0n) return 0n;
    
    let numeratorPart = factorialArray[Number(totalItems)];
    let denominatorPart1 = inverseFactorialArray[Number(chooseItems)];
    let denominatorPart2 = inverseFactorialArray[Number(totalItems - chooseItems)];

    let tempResult = multiplyModulo(numeratorPart, denominatorPart1);
    return multiplyModulo(tempResult, denominatorPart2);
};

const executeCalculation = (rawInput) => {
    const [initialCount, targetProduct] = rawInput.split(" ").map(val => BigInt(val));

    const factorialCache = new Array(MAX_FACTORIAL_INDEX);
    const inverseFactorialCache = new Array(MAX_FACTORIAL_INDEX);

    factorialCache[0] = 1n;
    for (let idx = 1; idx < MAX_FACTORIAL_INDEX; idx++) {
        factorialCache[idx] = multiplyModulo(factorialCache[idx - 1], BigInt(idx));
    }
    
    inverseFactorialCache[MAX_FACTORIAL_INDEX - 1] = getInverse(factorialCache[MAX_FACTORIAL_INDEX - 1]);
    for (let idx = MAX_FACTORIAL_INDEX - 2; idx >= 0; idx--) {
        inverseFactorialCache[idx] = multiplyModulo(inverseFactorialCache[idx + 1], BigInt(idx + 1));
    }

    const primeDivisorMap = findPrimeExponents(targetProduct);

    const ultimateResult = Array.from(primeDivisorMap.entries()).reduce((accumulator, [primeBase, exponentValue]) => {
        const totalElements = exponentValue + initialCount - 1n;
        const chosenElements = exponentValue;
        const comboResult = calculateCoefficient(totalElements, chosenElements, factorialCache, inverseFactorialCache);
        return multiplyModulo(accumulator, comboResult);
    }, 1n);

    console.log(Number(ultimateResult));
};

executeCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));