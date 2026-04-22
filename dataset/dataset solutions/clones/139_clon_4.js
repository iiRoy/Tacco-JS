let rawInputCollector = '';
process.stdin.on('data', (inputChunk) => {
    rawInputCollector += inputChunk.toString();
});

process.stdin.on('end', () => {
    const processedInputString = rawInputCollector.trim();
    if (!processedInputString) return;

    const inputSegments = processedInputString.split(/\s/);

    inputSegments.map(segment => {
        const numeralSequences = Array(12).fill(undefined).map((_, elementIndex) => {
            const partsOfSegment = segment.split(',');
            return partsOfSegment[elementIndex] === undefined ? undefined : Number(partsOfSegment[elementIndex]);
        });

        let cumulativeComputedValues = [];
        const totalNegativeSummation = numeralSequences.slice(0, 11)
            .reduceRight((currentAccumulation, numericUnit, itemPosition) => {
                const updatedAccumulation = currentAccumulation - numericUnit;
                cumulativeComputedValues[itemPosition] = updatedAccumulation;
                return updatedAccumulation;
            }, 0);

        const lastElementNegated = -numeralSequences[11];
        const tenthElementDerivedValue = cumulativeComputedValues[10];

        const divisorFactorCandidate = lastElementNegated - tenthElementDerivedValue;

        let scalingCoefficient;
        if (divisorFactorCandidate === 0) {
            scalingCoefficient = (lastElementNegated === 0) ? Number.NaN : (lastElementNegated > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
        } else {
            scalingCoefficient = lastElementNegated / divisorFactorCandidate;
        }

        const evaluationThreshold = totalNegativeSummation * scalingCoefficient;

        let finalOutcomeIndicator = 0;
        const searchOrderIndices = Array.from({ length: 10 }, (_, indexVal) => indexVal).reverse(); // Generates [9, 8, ..., 0]

        const foundMismatchPosition = searchOrderIndices.findIndex(currentIdx => {
            return !(cumulativeComputedValues[currentIdx] >= evaluationThreshold);
        });

        if (foundMismatchPosition !== -1) {
            const originalIndexFound = searchOrderIndices[foundMismatchPosition];
            finalOutcomeIndicator = originalIndexFound + 1;
        }
        
        console.log(finalOutcomeIndicator);
    });
});