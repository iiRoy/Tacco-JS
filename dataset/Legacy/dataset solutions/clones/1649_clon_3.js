function calculateSlidingWindowProduct(
    previousProductMod,
    elementToRemove,
    elementToAdd,
    moduloValue
) {
    let intermediateProduct = previousProductMod * elementToAdd / elementToRemove;
    return intermediateProduct;
}

function processInputData(rawInputString) {
    const PRIME_MODULO_VALUE = 10**9 + 7;

    const inputLines = rawInputString.split("\n");

    const firstLineParts = inputLines[0].split(" ").map(Number);
    const totalElements = firstLineParts[0];
    const windowLength = firstLineParts[1];

    const numericArray = inputLines[1].split(" ").map(Number);

    let currentWindowProductMod = 1;
    const primeModulo = PRIME_MODULO_VALUE;

    for (let loopIndex = 0; loopIndex < windowLength; loopIndex++) {
        currentWindowProductMod = (currentWindowProductMod * numericArray[loopIndex]) % primeModulo;
    }

    const slidingWindowIterations = totalElements - windowLength;
    for (let loopIndex = 1; loopIndex <= slidingWindowIterations; loopIndex++) {
        const elementLeavingWindow = numericArray[loopIndex - 1];
        const elementEnteringWindow = numericArray[loopIndex + windowLength - 1];

        let nextWindowProductRaw = calculateSlidingWindowProduct(
            currentWindowProductMod,
            elementEnteringWindow,
            elementLeavingWindow,
            primeModulo
        );

        if (nextWindowProductRaw > currentWindowProductMod) {
            console.log("Yes");
        } else {
            console.log("No");
        }

        currentWindowProductMod = nextWindowProductRaw % primeModulo;
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
