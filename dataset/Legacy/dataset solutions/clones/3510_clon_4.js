function getDominantFrequencies(dataArray) {
    const frequencyMap = new Map();
    for (const itemValue of dataArray) {
        frequencyMap.set(itemValue, (frequencyMap.get(itemValue) || 0) + 1);
    }

    const sortedFrequencyPairs = Array.from(frequencyMap.entries()).sort((pairA, pairB) => pairB[1] - pairA[1]);

    const firstDominant = sortedFrequencyPairs[0] || [null, 0];
    const secondDominant = sortedFrequencyPairs[1] || [null, 0];

    return [firstDominant, secondDominant];
}

function calculateMinimumReplacements(rawData) {
    const lines = rawData.split('\n');
    const totalElements = Number(lines[0]);
    const allNumericValues = lines[1].split(' ').map(Number);

    const evenPositionValues = [];
    const oddPositionValues = [];

    allNumericValues.forEach((value, position) => {
        if (position % 2 === 0) {
            evenPositionValues.push(value);
        } else {
            oddPositionValues.push(value);
        }
    });

    evenPositionValues.sort((a, b) => a - b);
    oddPositionValues.sort((a, b) => a - b);

    const evenDominantFrequencies = getDominantFrequencies(evenPositionValues);
    const oddDominantFrequencies = getDominantFrequencies(oddPositionValues);

    const finalReplacementCount = (evenDominantFrequencies[0][0] !== oddDominantFrequencies[0][0])
        ? totalElements - (evenDominantFrequencies[0][1] + oddDominantFrequencies[0][1])
        : totalElements - Math.max(
            evenDominantFrequencies[1][1] + oddDominantFrequencies[0][1],
            evenDominantFrequencies[0][1] + oddDominantFrequencies[1][1]
        );

    return finalReplacementCount;
}

console.log(calculateMinimumReplacements(require('fs').readFileSync('/dev/stdin', 'utf8')));
