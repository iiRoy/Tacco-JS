function modularExponentiation(baseValue, exponentValue, modulusValue) {
    let outcome = 1;
    baseValue %= modulusValue;
    while (exponentValue > 0) {
        if (exponentValue % 2 === 1) outcome = (outcome * baseValue) % modulusValue;
        baseValue = (baseValue * baseValue) % modulusValue;
        exponentValue = Math.floor(exponentValue / 2);
    }
    return outcome;
}

const modularAddition = (firstVal, secondVal, modConst) => (firstVal + secondVal) % modConst;
const modularSubtraction = (firstVal, secondVal, modConst) => (firstVal - secondVal + modConst) % modConst;
const modularMultiplication = (firstVal, secondVal, modConst) => (firstVal * secondVal) % modConst;

function processInputData(rawData) {
    const modulusConstant = 998244353;

    const parsedNumbers = rawData.trim().split(/\s+/).map(Number);
    const itemCount = parsedNumbers.shift();
    const totalValue = parsedNumbers.reduce((accumulator, currentElement) => accumulator + currentElement, 0);
    const targetValueLimit = Math.floor(totalValue / 2);

    function calculateSubsetCombinations(elementValues, sumUpperLimit, combinationFactor) {
        const memoizationCache = Array.from({ length: elementValues.length + 1 }, () =>
            Array(sumUpperLimit + 1).fill(null)
        );

        function findWaysRecursive(currentElementIndex, currentSumTarget) {
            if (currentSumTarget === 0) {
                return 1;
            }
            if (currentElementIndex === elementValues.length || currentSumTarget < 0) {
                return 0;
            }

            if (memoizationCache[currentElementIndex][currentSumTarget] !== null) {
                return memoizationCache[currentElementIndex][currentSumTarget];
            }

            let currentWays = 0;

            currentWays = modularAddition(currentWays, findWaysRecursive(currentElementIndex + 1, currentSumTarget), modulusConstant);

            currentWays = modularAddition(currentWays,
                modularMultiplication(combinationFactor, findWaysRecursive(currentElementIndex + 1, currentSumTarget - elementValues[currentElementIndex]), modulusConstant),
                modulusConstant
            );

            memoizationCache[currentElementIndex][currentSumTarget] = currentWays;
            return currentWays;
        }

        const finalCountsArray = Array(sumUpperLimit + 1).fill(0);
        for (let j = 0; j <= sumUpperLimit; j++) {
            finalCountsArray[j] = findWaysRecursive(0, j);
        }
        return finalCountsArray;
    }

    const resultArrayA = calculateSubsetCombinations(parsedNumbers, targetValueLimit, 2);
    const resultArrayB = calculateSubsetCombinations(parsedNumbers, targetValueLimit, 1);

    let finalOutcome = modularExponentiation(3, itemCount, modulusConstant);

    const sumOfResultArrayA = resultArrayA.reduce((accumulator, value) => modularAddition(accumulator, value, modulusConstant), 0);

    finalOutcome = modularSubtraction(finalOutcome, modularMultiplication(3, sumOfResultArrayA, modulusConstant), modulusConstant);

    if (totalValue % 2 === 0) {
        finalOutcome = modularAddition(finalOutcome, modularMultiplication(3, resultArrayB[targetValueLimit], modulusConstant), modulusConstant);
    }

    finalOutcome = modularAddition(finalOutcome, 0, modulusConstant);

    console.log(finalOutcome);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
