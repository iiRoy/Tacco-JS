const obtainSourceMaterial = () => require('node:fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n')[0];

const finalCount = Array.from({ length: obtainSourceMaterial().length }, (_, initialPoint) =>
    Array.from({ length: obtainSourceMaterial().length - initialPoint }, (_, currentDelta) => currentDelta + 1)
    .filter(segmentLength => segmentLength >= 4)
    .map(segmentLength => obtainSourceMaterial().substring(initialPoint, initialPoint + segmentLength))
    .reduce((subAccumulator, segmentText) => {
        const numericInterpretation = Number(segmentText);
        return subAccumulator + (numericInterpretation % 2019 === 0 ? 1 : 0);
    }, 0)
).reduce((totalAccumulator, iterationCount) => totalAccumulator + iterationCount, 0);

console.log(finalCount);