const fileSystem = require('fs');

function obtainUniquePrimeFactors(numeral) {
    const distinctPrimes = new Set();
    let workingValue = numeral;
    let currentDivisor = 2;

    while (currentDivisor * currentDivisor <= workingValue) {
        if (workingValue % currentDivisor === 0) {
            distinctPrimes.add(currentDivisor);
            while (workingValue % currentDivisor === 0) {
                workingValue /= currentDivisor;
            }
        }
        currentDivisor++;
    }

    if (workingValue > 1) {
        distinctPrimes.add(workingValue);
    }

    return Array.from(distinctPrimes);
}

function processInputData(inputLines) {
    const [initialDivisor, targetNumber] = inputLines[0].split(' ').map(Number);

    const result = (targetNumber % initialDivisor === 0)
        ? targetNumber / initialDivisor
        : (() => {
            const primeFactors = obtainUniquePrimeFactors(targetNumber);
            const eligibleFactors = primeFactors.filter(factor => factor >= initialDivisor);

            const chosenFactor = eligibleFactors.length > 0
                ? Math.min(...eligibleFactors)
                : targetNumber;

            return targetNumber / chosenFactor;
        })();

    console.log(result);
}

processInputData(fileSystem.readFileSync("/dev/stdin", "UTF-8").split("\n"));
