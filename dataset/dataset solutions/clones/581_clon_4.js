const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = rawData.trim().split('\n');

const evaluateScenario = (caseData, startingPosition) => {
    const dimensionPair = caseData[startingPosition].split(' ').map(Number);
    const mainQuantity = dimensionPair[0];
    const thresholdValue = dimensionPair[1];

    if (mainQuantity === 0 && thresholdValue === 0) {
        return null;
    }

    const baseElements = Array.from({ length: mainQuantity }, (_, elementIndex) =>
        Number(caseData[startingPosition + 1 + elementIndex])
    );
    baseElements.push(0); 

    const resultantSums = baseElements.flatMap((itemA, idxA) =>
        baseElements.slice(idxA).map(itemB => itemA + itemB)
    ).sort((valX, valY) => valX - valY);

    let bestSumEncountered = 0;
    let lowerBound = 0;
    let upperBound = resultantSums.length - 1;

    while (lowerBound < resultantSums.length) {
        while (upperBound >= lowerBound && resultantSums[lowerBound] + resultantSums[upperBound] > thresholdValue) {
            upperBound--;
        }

        if (upperBound >= lowerBound) {
            bestSumEncountered = Math.max(bestSumEncountered, resultantSums[lowerBound] + resultantSums[upperBound]);
        }
        
        lowerBound++;
    }

    return { outcome: bestSumEncountered, consumedCount: mainQuantity + 1 };
};

const orchestrateProcessing = (allInputLines, currentReadPosition = 0) => {
    if (currentReadPosition >= allInputLines.length) {
        return;
    }

    const scenarioResult = evaluateScenario(allInputLines, currentReadPosition);

    if (scenarioResult === null) {
        return;
    }

    console.log(scenarioResult.outcome);
    orchestrateProcessing(allInputLines, currentReadPosition + scenarioResult.consumedCount);
};

orchestrateProcessing(processedLines);