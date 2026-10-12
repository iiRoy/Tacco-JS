const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

const orderNumbers = (sourceNumbers) => {
    if (sourceNumbers.length === 0) {
        return [];
    }

    const maxValue = Math.max(...sourceNumbers);

    const tally = Array.from({ length: maxValue + 1 }, () => 0);
    sourceNumbers.forEach(num => tally[num]++);

    let currentSum = 0;
    const cumulativeTally = tally.map(count => {
        currentSum += count;
        return currentSum;
    });

    const orderedSequence = new Array(sourceNumbers.length);
    const placementIndices = [...cumulativeTally];

    sourceNumbers.reduceRight((_, currentNum) => {
        placementIndices[currentNum]--;
        orderedSequence[placementIndices[currentNum]] = currentNum;
        return null;
    }, null);

    return orderedSequence;
};

const numericData = inputLines[1].split(' ').map(Number);
console.log(orderNumbers(numericData).join(' '));
