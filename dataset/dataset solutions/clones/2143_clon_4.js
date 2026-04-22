const PRIME_MODULUS = 1000000007;

function calculatePower(baseValue, exponentValue, modulusValue) {
    let outcome = 1;
    baseValue %= modulusValue;
    while (exponentValue > 0) {
        if (exponentValue % 2 === 1) {
            outcome = (outcome * baseValue) % modulusValue;
        }
        baseValue = (baseValue * baseValue) % modulusValue;
        exponentValue = Math.floor(exponentValue / 2);
    }
    return outcome;
}

function findInverse(numberValue, modulusValue) {
    return calculatePower(numberValue, modulusValue - 2, modulusValue);
}

let memoizedFactorials = [];
let memoizedInverseFactorials = [];

function prepareCombinatorics(maximumValue) {
    memoizedFactorials = new Array(maximumValue + 1);
    memoizedInverseFactorials = new Array(maximumValue + 1);

    memoizedFactorials[0] = 1;
    memoizedInverseFactorials[0] = 1;

    for (let currentIdx = 1; currentIdx <= maximumValue; currentIdx++) {
        memoizedFactorials[currentIdx] = (memoizedFactorials[currentIdx - 1] * currentIdx) % PRIME_MODULUS;
        memoizedInverseFactorials[currentIdx] = findInverse(memoizedFactorials[currentIdx], PRIME_MODULUS);
    }
}

function combinationsModulo(totalItems, chosenItems) {
    if (chosenItems < 0 || chosenItems > totalItems) {
        return 0;
    }
    if (chosenItems === 0 || chosenItems === totalItems) {
        return 1;
    }
    let numerator = memoizedFactorials[totalItems];
    let denominatorPart1 = memoizedInverseFactorials[chosenItems];
    let denominatorPart2 = memoizedInverseFactorials[totalItems - chosenItems];

    let result = (numerator * denominatorPart1) % PRIME_MODULUS;
    result = (result * denominatorPart2) % PRIME_MODULUS;
    return result;
}

function processData(inputPayload) {
    const parsedValues = inputPayload.trim().split(/\s+/).map(Number);
    const universeSize = parsedValues[0];
    const forbiddenIndexA = parsedValues[1];
    const forbiddenIndexB = parsedValues[2];

    prepareCombinatorics(universeSize);

    let currentAccumulatedSum = calculatePower(2, universeSize, PRIME_MODULUS);

    currentAccumulatedSum = (currentAccumulatedSum - combinationsModulo(universeSize, 0) + PRIME_MODULUS) % PRIME_MODULUS;

    if (forbiddenIndexA >= 1 && forbiddenIndexA <= universeSize) {
        currentAccumulatedSum = (currentAccumulatedSum - combinationsModulo(universeSize, forbiddenIndexA) + PRIME_MODULUS) % PRIME_MODULUS;
    }

    if (forbiddenIndexB >= 1 && forbiddenIndexB <= universeSize && forbiddenIndexA !== forbiddenIndexB) {
        currentAccumulatedSum = (currentAccumulatedSum - combinationsModulo(universeSize, forbiddenIndexB) + PRIME_MODULUS) % PRIME_MODULUS;
    }

    console.log(currentAccumulatedSum);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));