const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawData.trim().split('\n');

function processCases(segments, currentOffset = 0) {
    if (currentOffset >= segments.length) {
        return;
    }

    const initialCount = Number(segments[currentOffset]);
    if (initialCount === 0) {
        return;
    }

    const baseValues = segments[currentOffset + 1].split(' ').map(Number);
    const bonusValues = segments[currentOffset + 2].split(' ').map(Number);

    const baseSum = baseValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    bonusValues.sort((valA, valB) => valB - valA);

    const potentialResults = [baseSum * initialCount];

    for (let k = 0; k < bonusValues.length; k++) {
        const currentBonus = bonusValues[k];
        const remainingCount = initialCount - (k + 1);
        potentialResults.push((baseSum + currentBonus) * remainingCount);
    }

    const peakResult = Math.max(...potentialResults);

    console.log(peakResult);

    processCases(segments, currentOffset + 3);
}

processCases(lineSegments);
