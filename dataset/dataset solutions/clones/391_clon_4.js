const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const numericalInputs = [];
rl.on('line', (dataLine) => {
    const parsedValue = parseInt(dataLine, 10);
    if (parsedValue === 0) {
        rl.close();
    } else {
        numericalInputs.push(parsedValue);
    }
});

rl.on('close', () => {
    processAllConfigurations(numericalInputs);
});

async function processAllConfigurations(dataPoints) {
    for (const currentModulus of dataPoints) {
        const uniqueQuadraticResidues = new Set();
        Array.from({ length: currentModulus - 1 }, (_, index) => index + 1)
             .forEach(candidate => uniqueQuadraticResidues.add((candidate * candidate) % currentModulus));
        
        const orderedResidues = Array.from(uniqueQuadraticResidues).sort((a, b) => a - b);

        const maximumRelevantDistanceIndex = Math.floor((currentModulus - 1) / 2);
        
        const distanceAccumulator = new Map(Array.from({ length: maximumRelevantDistanceIndex + 1 }, (_, i) => [i, 0]));

        orderedResidues.reduce((accumulatorOuter, valueA, indexA) => {
            orderedResidues.slice(indexA + 1).reduce((accumulatorInner, valueB) => {
                const absoluteDifference = Math.abs(valueA - valueB);
                const effectiveDistance = Math.min(absoluteDifference, currentModulus - absoluteDifference);

                if (effectiveDistance > 0 && effectiveDistance <= maximumRelevantDistanceIndex) {
                    distanceAccumulator.set(effectiveDistance, (distanceAccumulator.get(effectiveDistance) || 0) + 2);
                }
                return null;
            }, null);
            return null;
        }, null);

        Array.from({ length: maximumRelevantDistanceIndex }, (_, i) => i + 1)
             .map(idx => distanceAccumulator.get(idx) || 0)
             .forEach(tally => console.log(tally));
    }
}