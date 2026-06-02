let inputAccumulator = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataChunk) {
    inputAccumulator += dataChunk;
});

process.stdin.on('end', function() {
    processCompleteInput(inputAccumulator);
});

const outputResult = console.log;

function processCompleteInput(fullInputText) {
    const rawLines = fullInputText.split("\n");
    const validLines = rawLines.filter(function(lineEntry) {
        return (lineEntry !== "");
    });
    analyzeNumericBatches(validLines);
}

function analyzeNumericBatches(stringRepresentations) {
    const numericalSequence = stringRepresentations.map(Number);

    function* batchProducer(sourceData) {
        let currentPosition = 0;
        while (currentPosition < sourceData.length) {
            const batchSizeSpecifier = sourceData[currentPosition];
            if (currentPosition + 1 + batchSizeSpecifier > sourceData.length) {
                break;
            }
            const currentDataBatch = sourceData.slice(currentPosition + 1, currentPosition + 1 + batchSizeSpecifier);
            yield currentDataBatch;
            currentPosition += 1 + batchSizeSpecifier;
        }
    }

    for (const dataBatch of batchProducer(numericalSequence)) {
        if (dataBatch.length <= 2) {
            outputResult(NaN);
            continue;
        }

        let lowestValue = Infinity;
        let highestValue = -Infinity;
        let aggregateSum = 0;

        for (const item of dataBatch) {
            if (item < lowestValue) {
                lowestValue = item;
            }
            if (item > highestValue) {
                highestValue = item;
            }
            aggregateSum += item;
        }

        const adjustedSum = aggregateSum - lowestValue - highestValue;
        const adjustedCount = dataBatch.length - 2;

        const computedAverage = (adjustedCount === 0) ? NaN : adjustedSum / adjustedCount;
        
        outputResult(Math.round(computedAverage));
    }
}
