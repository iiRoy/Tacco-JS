"use strict";

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

const initialValueString = rawInputContent.trim().split(/\s+/)[0];
const numericalSubject = parseInt(initialValueString, 10);

console.log(processFactorialExponents(numericalSubject).toString());

function processFactorialExponents(inputNumberCandidate) {
    if (Number.isNaN(inputNumberCandidate) || inputNumberCandidate < 1 || !Number.isInteger(inputNumberCandidate)) {
        return -1;
    }

    if (inputNumberCandidate < 3) {
        return inputNumberCandidate - 1;
    }

    let remainingValue = inputNumberCandidate;
    let finalAggregateScore = 0;

    const limitForPrimeGeneration = Math.floor(Math.sqrt(remainingValue));
    const generatedPrimeSequence = formPrimeCollection(limitForPrimeGeneration);

    let primeSequenceIndex = 0;
    let currentDivisorElement;

    while (primeSequenceIndex < generatedPrimeSequence.length) {
        currentDivisorElement = generatedPrimeSequence[primeSequenceIndex];

        if (currentDivisorElement * currentDivisorElement > remainingValue) {
            break;
        }

        let divisorExponentCount = 0;
        while (remainingValue % currentDivisorElement === 0) {
            divisorExponentCount++;
            remainingValue /= currentDivisorElement;
        }

        if (divisorExponentCount > 0) {
            let sumOfSeriesTerms = 0;
            let currentSeriesTerm = 0;
            while (sumOfSeriesTerms + (currentSeriesTerm + 1) <= divisorExponentCount) {
                currentSeriesTerm++;
                sumOfSeriesTerms += currentSeriesTerm;
            }
            finalAggregateScore += currentSeriesTerm;
        }
        primeSequenceIndex++;
    }

    if (remainingValue > 1) {
        finalAggregateScore++;
    }

    return finalAggregateScore;
}

function formPrimeCollection(upperRangeBound) {
    const discoveredPrimeValues = [];

    if (upperRangeBound < 2) {
        return discoveredPrimeValues;
    }
    discoveredPrimeValues.push(2);
    if (upperRangeBound < 3) {
        return discoveredPrimeValues;
    }
    discoveredPrimeValues.push(3);
    if (upperRangeBound < 5) {
        return discoveredPrimeValues;
    }

    let potentialPrimeCandidate = 5;
    while (potentialPrimeCandidate <= upperRangeBound) {
        let hasSmallDivisor = false;
        let primeListPosition = 0;

        while (primeListPosition < discoveredPrimeValues.length) {
            const trialDivisor = discoveredPrimeValues[primeListPosition];
            if (trialDivisor * trialDivisor > potentialPrimeCandidate) {
                break;
            }
            if (potentialPrimeCandidate % trialDivisor === 0) {
                hasSmallDivisor = true;
                break;
            }
            primeListPosition++;
        }

        if (!hasSmallDivisor) {
            discoveredPrimeValues.push(potentialPrimeCandidate);
        }
        potentialPrimeCandidate += 2;
    }
    return discoveredPrimeValues;
}