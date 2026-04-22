function processInput(rawText) {
    const lines = rawText.trim().split('\n');
    const elementCount = Number(lines.shift());
    const originalSequence = lines.shift().split(' ').map(Number);

    const uniqueSorted = Array.from(new Set(originalSequence)).sort((a, b) => a - b);
    const valueToRank = new Map();
    for (let i = 0; i < uniqueSorted.length; i++) {
        valueToRank.set(uniqueSorted[i], i + 1);
    }
    const rankedSequence = originalSequence.map(val => valueToRank.get(val));
    const maxRank = uniqueSorted.length;

    const bitStorage = new Array(maxRank + 1).fill(0);

    function adjustValue(position, amount) {
        for (; position <= maxRank; position += position & -position) {
            bitStorage[position] += amount;
        }
    }

    function retrieveSum(position) {
        let currentSum = 0;
        for (; position > 0; position -= position & -position) {
            currentSum += bitStorage[position];
        }
        return currentSum;
    }

    let totalMisorderedPairs = 0;
    for (let i = 0; i < elementCount; i++) {
        const currentRank = rankedSequence[i];
        const largerElementsCount = retrieveSum(maxRank) - retrieveSum(currentRank);
        totalMisorderedPairs += largerElementsCount;

        adjustValue(currentRank, 1);
    }

    console.log(totalMisorderedPairs);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));