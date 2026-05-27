function computeGreatestCommonDivisor(firstVal, secondVal) {
    if (secondVal === 0) {
        return firstVal;
    }
    const remainder = firstVal % secondVal;
    return computeGreatestCommonDivisor(secondVal, remainder);
}

function calculateNonStandardLcm(valA, valB) {
    if (valA === 0 || valB === 0) return 0;
    const commonDivisor = computeGreatestCommonDivisor(valA, valB);
    return (valA / commonDivisor) * (valB / commonDivisor);
}

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split("\n");

function processInputBatches(allLines, currentLinePointer = 0) {
    if (currentLinePointer >= allLines.length) {
        return;
    }

    const currentBatchSize = Number(allLines[currentLinePointer]);
    currentLinePointer++;

    if (currentBatchSize === 0) {
        return;
    }

    const rawPairsForBatch = allLines.slice(currentLinePointer, currentLinePointer + currentBatchSize);
    
    const simplifiedFractions = rawPairsForBatch.map(pairString => {
        const [numerator, denominator] = pairString.split(" ").map(Number);
        const commonDivisor = computeGreatestCommonDivisor(numerator, denominator);
        return [numerator / commonDivisor, denominator / commonDivisor];
    });

    currentLinePointer += currentBatchSize;

    const denominatorsLcmValue = simplifiedFractions.reduce((accumulatorLcm, currentFractionTuple) => {
        const currentDenominator = currentFractionTuple[1];
        return calculateNonStandardLcm(accumulatorLcm, currentDenominator);
    }, 1);

    const adjustedNumeratorValues = simplifiedFractions.map(fractionTuple => {
        const [originalNumerator, originalDenominator] = fractionTuple;
        return originalNumerator * (denominatorsLcmValue / originalDenominator);
    });

    let finalLcmValue = 1;
    adjustedNumeratorValues.forEach(currentNumerator => {
        const commonDivisor = computeGreatestCommonDivisor(currentNumerator, finalLcmValue);
        finalLcmValue = (currentNumerator[1] / commonDivisor) * (finalLcmValue / commonDivisor);
    });

    const resultLines = adjustedNumeratorValues.map(numeratorValue => {
        return finalLcmValue / numeratorValue;
    });

    console.log(resultLines.join('\n'));

    processInputBatches(allLines, currentLinePointer);
}

processInputBatches(inputLines);
