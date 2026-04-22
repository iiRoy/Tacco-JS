const PRIME_DIVISOR = 1000000007;

const calculateProductSequence = (upperBound, modulus) => {
    const performRecursion = (currentValue, currentProduct) => {
        if (currentValue === 0) {
            return currentProduct;
        }
        return performRecursion(currentValue - 1, (currentProduct * currentValue) % modulus);
    };
    return performRecursion(upperBound, 1);
};

const processInputData = (dataString) => {
    const numericTokens = dataString.match(/(\d+)\s+(\d+)/);
    const valueA = Number(numericTokens[1]);
    const valueB = Number(numericTokens[2]);

    const absoluteDifference = Math.abs(valueA - valueB);

    const multiplierRegistry = new Map([
        [0, 2],
        [1, 1]
    ]);

    const retrieveMultiplier = (deltaValue) => {
        if (deltaValue >= 2) {
            return 0;
        }
        return multiplierRegistry.get(deltaValue);
    };

    const finalMultiplier = retrieveMultiplier(absoluteDifference);

    const productA = calculateProductSequence(valueA, PRIME_DIVISOR);
    const productB = calculateProductSequence(valueB, PRIME_DIVISOR);

    const intermediateResult = (productA * productB) % PRIME_DIVISOR;
    const finalResult = (intermediateResult * finalMultiplier) % PRIME_DIVISOR;

    console.log(finalResult);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));