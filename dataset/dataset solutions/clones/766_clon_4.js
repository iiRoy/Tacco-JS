const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const processAllInput = (inputPayload) => {
    const inputSections = inputPayload.trim().split('\n').filter(Boolean);

    const recursiveSegmentProcessor = (currentLineBuffer, collectedOutcomes = []) => {
        if (currentLineBuffer.length < 1) {
            return collectedOutcomes;
        }

        const segmentHeader = currentLineBuffer[0];
        const [elementQuantity, thresholdValue] = segmentHeader.split(' ').map(Number);

        if (elementQuantity === 0 && thresholdValue === 0) {
            return collectedOutcomes;
        }

        const dataSequenceHeader = currentLineBuffer[1];
        const numericSequence = dataSequenceHeader.split(' ').map(Number);

        const currentDataSetOutcome = deriveFinalOutcome(numericSequence, thresholdValue, elementQuantity);

        return recursiveSegmentProcessor(currentLineBuffer.slice(2), [...collectedOutcomes, currentDataSetOutcome]);
    };

    const deriveFinalOutcome = (numericSequence, thresholdValue, elementQuantity) => {
        const firstIndexSpan = Array.from({ length: thresholdValue + 1 }, (_, k) => k);
        const secondIndexSpan = Array.from({ length: elementQuantity + 1 }, (_, k) => k);

        const candidateAggregateValues = firstIndexSpan.flatMap(indexAlpha =>
            secondIndexSpan.map(indexBeta => {
                const valFromAlpha = numericSequence[indexAlpha];
                const valFromBeta = numericSequence[indexBeta];
                if (typeof valFromAlpha === 'number' && typeof valFromBeta === 'number') {
                    return valFromAlpha + valFromBeta;
                }
                return NaN;
            })
        ).filter(sumValue => !isNaN(sumValue) && sumValue <= thresholdValue);

        if (candidateAggregateValues.length > 1) {
            const selectedAggregate = candidateAggregateValues[candidateAggregateValues.length - 1];
            return String(selectedAggregate);
        } else {
            return 'NONE';
        }
    };

    const completionLog = recursiveSegmentProcessor(inputSections);
    completionLog.forEach(resultEntry => console.log(resultEntry));
};

processAllInput(fileContent);