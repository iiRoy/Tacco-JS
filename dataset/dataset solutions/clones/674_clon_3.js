const fileSystemModule = require('fs');

const STANDARD_INPUT_PATH = '/dev/stdin';

const parseNumericValue = (str) => {
    const parsed = Number(str);
    return isNaN(parsed) ? 0 : parsed;
};

(() => {
    const rawInputDataBuffer = fileSystemModule.readFileSync(STANDARD_INPUT_PATH, 'utf8');

    const processedLines = rawInputDataBuffer
        .trim()
        .split('\n')
        .filter(segment => segment.length > 0);

    for (const currentInputSegment of processedLines) {
        const numericSegments = currentInputSegment
            .split(' ')
            .map(stringElement => parseNumericValue(stringElement));

        if (numericSegments.length < 6) {
            continue;
        }

        const firstAggregate = numericSegments[0] + numericSegments[3];
        const secondAggregate = numericSegments[1] + numericSegments[4];
        const thirdAggregate = numericSegments[2] + numericSegments[5];

        const computedAggregates = [
            firstAggregate,
            secondAggregate,
            thirdAggregate
        ];

        const totalSumOfAggregates = computedAggregates[0] + computedAggregates[1] + computedAggregates[2];
        if (totalSumOfAggregates === 0) {
            process.exit(0);
        }

        let finalScoreAccumulator = 0;

        for (let componentIndex = 0; componentIndex < computedAggregates.length; componentIndex++) {
            const groupsOfThree = Math.floor(computedAggregates[componentIndex] / 3);
            finalScoreAccumulator += groupsOfThree;
            computedAggregates[componentIndex] = computedAggregates[componentIndex] % 3;
        }

        const canFormATripleSet = (valuesArray) => {
            return valuesArray[0] >= 1 && valuesArray[1] >= 1 && valuesArray[2] >= 1;
        };

        while (canFormATripleSet(computedAggregates)) {
            finalScoreAccumulator = finalScoreAccumulator + 1;
            computedAggregates[0] = computedAggregates[0] - 1;
            computedAggregates[1] = computedAggregates[1] - 1;
            computedAggregates[2] = computedAggregates[2] - 1;
            if (computedAggregates[0] < 0 || computedAggregates[1] < 0 || computedAggregates[2] < 0) {
                 break;
            }
        }

        process.stdout.write(`Calculated Result: ${finalScoreAccumulator}\n`);
    }
})();