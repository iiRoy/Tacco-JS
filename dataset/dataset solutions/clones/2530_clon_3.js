const calculateGreatestCommonDivisor = (valOne, valTwo) => {
    if (valTwo === 0) {
        return valOne;
    }
    return calculateGreatestCommonDivisor(valTwo, valOne % valTwo);
};

function checkAndConditionallyAddDivisor(candidateDivisor, currentFoundCoprimeDivisors, gcdFunction) {
    for (let divisorIndex = 0; divisorIndex < currentFoundCoprimeDivisors.length; divisorIndex++) {
        if (gcdFunction(currentFoundCoprimeDivisors[divisorIndex], candidateDivisor) !== 1) {
            return false;
        }
    }
    currentFoundCoprimeDivisors.push(candidateDivisor);
    return true;
}

function processInputData(rawInputString) {
    const parsedNumbers = rawInputString.split(" ");

    const firstNum = Number(parsedNumbers[0]);
    const secondNum = Number(parsedNumbers[1]);

    const greatestCommonDivisor = calculateGreatestCommonDivisor(firstNum, secondNum);
    let uniqueCoprimeDivisorCount = 0;
    const foundCoprimeDivisors = [1];

    const limitForFactors = Math.sqrt(greatestCommonDivisor);

    for (let currentFactor = 1; currentFactor < limitForFactors; currentFactor++) {
        if (greatestCommonDivisor % currentFactor === 0) {
            if (checkAndConditionallyAddDivisor(currentFactor, foundCoprimeDivisors, calculateGreatestCommonDivisor)) {
                uniqueCoprimeDivisorCount++;
            }
        }
    }

    for (let currentFactor = 2; currentFactor < limitForFactors; currentFactor++) {
        if (greatestCommonDivisor % currentFactor === 0) {
            const pairedDivisor = greatestCommonDivisor / currentFactor;
            if (checkAndConditionallyAddDivisor(pairedDivisor, foundCoprimeDivisors, calculateGreatestCommonDivisor)) {
                uniqueCoprimeDivisorCount++;
            }
        }
    }

    if (Number.isInteger(limitForFactors)) {
        uniqueCoprimeDivisorCount++;
    }

    console.log(uniqueCoprimeDivisorCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
