const rawSource = require('node:fs').readFileSync('/dev/stdin', 'utf8');

function* blockProvider(sourceText) {
    const numericalEntries = sourceText.trim().split('\n').map(Number);
    let currentOffset = 0;
    const requiredComponentCount = 10;

    while (currentOffset < numericalEntries.length) {
        const principalValue = numericalEntries[currentOffset];

        if (principalValue === 0) {
            break;
        }

        const actualComponents = numericalEntries.slice(currentOffset + 1, currentOffset + 1 + requiredComponentCount);
        const paddedComponents = actualComponents.concat(Array(requiredComponentCount - actualComponents.length).fill(NaN));
        
        yield { headValue: principalValue, subordinateValues: paddedComponents };
        currentOffset += 11;
    }
}

for (const currentSegment of blockProvider(rawSource)) {
    const componentSummation = currentSegment.subordinateValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const finalDifference = currentSegment.headValue - componentSummation;
    console.log(finalDifference);
}