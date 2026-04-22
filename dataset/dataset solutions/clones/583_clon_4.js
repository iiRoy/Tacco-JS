const acquireInputData = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const analyzeBlocks = (fullInputContent) => {
    let allLines = fullInputContent.trim().split('\n');
    let currentLineIndex = 0;

    const extractParameters = () => {
        const [numCount, targetSumLimit] = allLines[currentLineIndex++].split(' ').map(Number);
        return { count: numCount, limit: targetSumLimit };
    };

    const retrieveValuesForCurrentBlock = (amount) => {
        let blockValues = [];
        for (let j = 0; j < amount; j++) {
            blockValues.push(Number(allLines[currentLineIndex++]));
        }
        blockValues.push(0); 
        return blockValues;
    };

    const finalResults = [];

    while (true) {
        const { count, limit } = extractParameters();
        if (count === 0 && limit === 0) break;

        const initialValues = retrieveValuesForCurrentBlock(count);

        const distinctPairSums = Array.from(
            new Set(
                initialValues.flatMap((elementA, indexA) =>
                    initialValues.slice(indexA).map(elementB => elementA + elementB)
                )
            )
        ).sort((valX, valY) => valX - valY);

        let bestOverallSum = 0;

        distinctPairSums.forEach(firstComponent => {
            const availableQuota = limit - firstComponent;

            let lowerBound = 0;
            let upperBound = distinctPairSums.length - 1;
            let optimalIndex = -1;

            while (lowerBound <= upperBound) {
                const midPoint = Math.floor((lowerBound + upperBound) / 2);
                if (distinctPairSums[midPoint] <= availableQuota) {
                    optimalIndex = midPoint;
                    lowerBound = midPoint + 1; 
                } else {
                    upperBound = midPoint - 1; 
                }
            }

            if (optimalIndex !== -1) {
                const currentCandidateSum = firstComponent + distinctPairSums[optimalIndex];
                bestOverallSum = Math.max(bestOverallSum, currentCandidateSum);
            }
        });
        finalResults.push(bestOverallSum);
    }
    return finalResults;
};

const computedOutcomes = analyzeBlocks(acquireInputData());
computedOutcomes.forEach(outcome => console.log(outcome));