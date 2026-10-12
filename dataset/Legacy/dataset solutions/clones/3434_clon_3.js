const calculateFactorial = (value) => {
    let productAccumulator = 1;
    for (let i = 1; i <= value; i++) {
        productAccumulator *= i;
    }
    return productAccumulator;
};

const retrieveHalfDivisors = (targetNumber) => {
    const foundDivisors = [];
    const upperBound = Math.floor(targetNumber / 2);
    for (let currentCandidate = 1; currentCandidate <= upperBound; currentCandidate++) {
        if (targetNumber % currentCandidate === 0) {
            foundDivisors.push(currentCandidate);
        }
    }
    return foundDivisors;
};

const countTargetDivisors = (sourceValue) => {
    let internalCount = 0;
    const valueForModulo = sourceValue / 2;
    const loopLimit = Math.floor(valueForModulo);
    for (let divisorCheck = 1; divisorCheck <= loopLimit; divisorCheck++) {
        if (valueForModulo % divisorCheck === 0) {
            internalCount++;
        }
    }
    return internalCount;
};

function processInput(rawInputData) {
    const inputNumber = Number(rawInputData);
    let finalResultCount = 0;

    const calculatedFactorial = calculateFactorial(inputNumber);

    const mainDivisorsList = retrieveHalfDivisors(calculatedFactorial);

    for (let divisorIndex = 0; divisorIndex < mainDivisorsList.length; divisorIndex++) {
        const currentDivisorValue = mainDivisorsList[divisorIndex];
        const subDivisorCount = countTargetDivisors(currentDivisorValue);

        if (subDivisorCount === 75) {
            finalResultCount++;
        }
    }

    console.log(finalResultCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
