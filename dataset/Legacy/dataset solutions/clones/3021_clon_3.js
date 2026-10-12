let arrayLength;
let totalElementsSum;
let elementsArray;
const MODULUS_VALUE = 998244353;

const memoizationCache = new Map();

function performModularAddition(valueA, valueB) {
    return (valueA + valueB) % MODULUS_VALUE;
}

function checkTriangleValidity(sideOne, sideTwo, sideThree) {
    if (sideOne === 0 || sideTwo === 0 || sideThree === 0) {
        return false;
    }
    const conditionOne = sideOne + sideTwo > sideThree;
    const conditionTwo = sideTwo + sideThree > sideOne;
    const conditionThree = sideThree + sideOne > sideTwo;
    return conditionOne && conditionTwo && conditionThree;
}

function calculateCombinations(currentElementIndex, currentRedSum, currentGreenSum) {
    if (currentElementIndex === arrayLength) {
        const currentBlueSum = totalElementsSum - currentRedSum - currentGreenSum;
        if (checkTriangleValidity(currentRedSum, currentGreenSum, currentBlueSum)) {
            return 1;
        } else {
            return 0;
        }
    }

    const stateKey = `${currentElementIndex}-${currentRedSum}-${currentGreenSum}`;
    if (memoizationCache.has(stateKey)) {
        return memoizationCache.get(stateKey);
    }

    const elementValue = elementsArray[currentElementIndex];

    let accumulatedResult = calculateCombinations(
        currentElementIndex + 1,
        currentRedSum + elementValue,
        currentGreenSum
    );

    const resultFromGreenAssignment = calculateCombinations(
        currentElementIndex + 1,
        currentRedSum,
        currentGreenSum + elementValue
    );
    accumulatedResult = performModularAddition(accumulatedResult, resultFromGreenAssignment);

    const resultFromBlueAssignment = calculateCombinations(
        currentElementIndex + 1,
        currentRedSum,
        currentGreenSum
    );
    accumulatedResult = performModularAddition(accumulatedResult, resultFromBlueAssignment);

    memoizationCache.set(stateKey, accumulatedResult);

    return accumulatedResult;
}

function processInputAndCalculate(inputNumbers) {
    memoizationCache.clear();

    arrayLength = inputNumbers.length;
    elementsArray = [...inputNumbers];

    totalElementsSum = elementsArray.reduce((accumulator, value) => accumulator + value, 0);

    elementsArray.sort((a, b) => a - b);

    const finalCount = calculateCombinations(0, 0, 0);

    return finalCount;
}
