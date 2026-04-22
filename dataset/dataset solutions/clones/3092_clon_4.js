"use strict";

function* dataTokenIterator(rawData) {
    const lineSegments = rawData.split('\n');
    for (const segment of lineSegments) {
        const parts = segment.trim().split(' ');
        for (const part of parts) {
            if (part) yield Number(part);
        }
    }
}

const initializeMultiArray = (dimensions, baseValue) => {
    const recurseBuild = (currentDimensions) => {
        if (currentDimensions.length === 0) {
            return baseValue;
        }
        const currentSize = currentDimensions[0];
        const remainingDimensions = currentDimensions.slice(1);
        return Array.from({ length: currentSize }, () => recurseBuild(remainingDimensions));
    };
    return recurseBuild(dimensions);
};

const calculateSequentialProduct = (startPoint, endPoint) => {
    if (startPoint >= endPoint) return 1;
    return Array.from({ length: endPoint - startPoint }, (_, index) => startPoint + 1 + index)
                .reduce((accumulator, value) => accumulator * value, 1);
};

const PRIME_MODULUS = 1000000007;

const createFactorialSupplier = () => {
    const factorialMemo = [1, 1];
    return (number) => {
        if (factorialMemo[number] !== undefined) return factorialMemo[number];
        for (let j = factorialMemo.length; j <= number; j++) {
            factorialMemo[j] = (factorialMemo[j - 1] * j) % PRIME_MODULUS;
        }
        return factorialMemo[number];
    };
};
const getCachedFactorial = createFactorialSupplier();

function executeSolution(sourceData) {
    const inputIterator = dataTokenIterator(sourceData);
    const getNextNumericToken = () => inputIterator.next().value;

    const totalElements = getNextNumericToken();
    const targetThreshold = getNextNumericToken();

    const dataset = [];
    for (let i = 0; i < totalElements; i++) {
        dataset.push(getNextNumericToken());
    }

    dataset.sort((valA, valB) => valA - valB);

    const memoizationGrid = initializeMultiArray([totalElements + 1, targetThreshold + 1], -1);

    const computeResult = (currentK, currentX) => {
        if (memoizationGrid[currentK][currentX] !== -1) {
            return memoizationGrid[currentK][currentX];
        }

        if (currentX < dataset[0]) {
            memoizationGrid[currentK][currentX] = (currentX * getCachedFactorial(currentK)) % PRIME_MODULUS;
        } else {
            const applicableElements = dataset.filter(item => item <= currentX);
            const countApplicable = applicableElements.length;

            const summation = applicableElements.reduce((acc, elementVal) => {
                return (acc + computeResult(currentK - 1, currentX % elementVal)) % PRIME_MODULUS;
            }, 0);
            
            memoizationGrid[currentK][currentX] = (summation * calculateSequentialProduct(countApplicable, currentK)) % PRIME_MODULUS;
        }

        return memoizationGrid[currentK][currentX];
    };

    console.log(computeResult(totalElements, targetThreshold));
}

executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));