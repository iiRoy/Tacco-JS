function calculateSingleNumberDivisorContribution(currentNumber, threshold) {
    function evaluateDivisorPair(candidateDivisor) {
        if (candidateDivisor * candidateDivisor > currentNumber) {
            return 0;
        }

        if (currentNumber % candidateDivisor === 0) {
            let otherDivisor = currentNumber / candidateDivisor;

            let isSpecialConditionMet = (otherDivisor * 10 + candidateDivisor < threshold);
            let areDivisorsDistinct = (otherDivisor !== candidateDivisor);

            let currentPairContribution = 0;
            if (isSpecialConditionMet && areDivisorsDistinct) {
                currentPairContribution = 2;
            } else {
                currentPairContribution = 1;
            }

            return currentPairContribution + evaluateDivisorPair(candidateDivisor + 1);
        } else {
            return evaluateDivisorPair(candidateDivisor + 1);
        }
    }
    return evaluateDivisorPair(2);
}

function computeSpecialDivisorSum(upperBound, limitValue) {
    if (upperBound < 4) {
        return 0;
    }

    let totalAccumulatedSum = 0;
    for (let currentIterationNumber = 4; currentIterationNumber <= upperBound; currentIterationNumber++) {
        totalAccumulatedSum += calculateSingleNumberDivisorContribution(currentIterationNumber, limitValue);
    }
    return totalAccumulatedSum;
}

function Main(rawInputString) {
    const RADIX_BASE = 10;
    let inputParts = rawInputString.split(" ");

    let mainNumber = parseInt(inputParts[0], RADIX_BASE);
    let mainThreshold = parseInt(inputParts[1], RADIX_BASE);

    let finalCalculatedResult = computeSpecialDivisorSum(mainNumber, mainThreshold);

    console.log('%d', finalCalculatedResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
