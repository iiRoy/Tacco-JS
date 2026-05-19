function calculateGreatestCommonDivisor(numA, numB) {
   let valM = Math.max(numA, numB);
   let valN = Math.min(numA, numB);
   while (valN !== 0) {
      const tempN = valN;
      const remainderResult = valM % valN;
      valN = remainderResult;
      valM = tempN;
   }
   return valM;
}

const standardInputFilePath = '/dev/stdin';

function retrieveAndProcessInput(filePath) {
    const rawInputContent = require('fs').readFileSync(filePath, 'utf8');
    const processedInputLines = rawInputContent.trim().split("\n");
    return processedInputLines;
}

let inputDataLines = retrieveAndProcessInput(standardInputFilePath);

function executeProcessingCycle(dataLines) {
    const numberOfPairs = parseInt(dataLines.shift(), 10);
    if (numberOfPairs === 0) {
        return false;
    }

    const reducedFractionPairs = [];
    for (let pairIndex = 0; pairIndex < numberOfPairs; pairIndex++) {
        const currentInputLine = dataLines.shift();
        const parsedPairValues = currentInputLine.split(" ").map(Number);
        const currentPairGcd = calculateGreatestCommonDivisor(parsedPairValues[0], parsedPairValues[1]);
        reducedFractionPairs.push([parsedPairValues[0] / currentPairGcd, parsedPairValues[1] / currentPairGcd]);
    }

    let currentCommonDenominator = 1;
    for (const fractionEntry of reducedFractionPairs) {
        const denominatorGcd = calculateGreatestCommonDivisor(fractionEntry[1], currentCommonDenominator);
        currentCommonDenominator = (fractionEntry[1] / denominatorGcd) * (currentCommonDenominator / denominatorGcd);
    }

    const transformedNumerators = reducedFractionPairs.map(function(fractionEntry) {
        return fractionEntry[0] * (currentCommonDenominator / fractionEntry[1]);
    });

    let finalOverallLcm = 1;
    for (const singleNumeratorValue of transformedNumerators) {
        const numeratorLcmGcd = calculateGreatestCommonDivisor(singleNumeratorValue, finalOverallLcm);
        finalOverallLcm = (singleNumeratorValue[1] / numeratorLcmGcd) * (finalOverallLcm / numeratorLcmGcd);
    }

    for (const valueToOutput of transformedNumerators) {
        console.log(finalOverallLcm / valueToOutput);
    }
    return true;
}

while (executeProcessingCycle(inputDataLines)) {
    // Loop continues as long as executeProcessingCycle returns true
}
