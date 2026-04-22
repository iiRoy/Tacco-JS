const acquireNumericalSeries = (fileSource) => {
    const rawContent = require('fs').readFileSync(fileSource, 'utf8');
    const processedLines = rawContent.trim().split('\n').map(Number);
    let position = 0;
    return {
        fetchNext: () => {
            if (position < processedLines.length) {
                return processedLines[position++];
            }
            return 0;
        }
    };
};

const sequenceProvider = acquireNumericalSeries('/dev/stdin');
const finalOutputs = [];

const processNumericalSegment = (providerReference) => {
    const segmentLength = providerReference.fetchNext();
    if (segmentLength === 0) {
        return;
    }

    const squaresModulo = new Set();
    for (let currentSquareRoot = 1; currentSquareRoot < segmentLength; ++currentSquareRoot) {
        squaresModulo.add((currentSquareRoot * currentSquareRoot) % segmentLength);
    }
    const residueCollection = Array.from(squaresModulo).sort((a, b) => a - b);

    const maxRelevantDistance = Math.floor((segmentLength - 1) / 2);
    const counterMap = new Map();
    for (let d = 1; d <= maxRelevantDistance; ++d) {
        counterMap.set(d, 0);
    }

    for (let firstIndex = 0; firstIndex < residueCollection.length; ++firstIndex) {
        for (let secondIndex = 0; secondIndex < residueCollection.length; ++secondIndex) {
            if (firstIndex === secondIndex) {
                continue;
            }

            let computedDifference = residueCollection[firstIndex] - residueCollection[secondIndex];
            computedDifference = (computedDifference % segmentLength + segmentLength) % segmentLength;

            if (maxRelevantDistance < computedDifference) {
                computedDifference -= segmentLength;
            }

            if (computedDifference >= 1 && computedDifference <= maxRelevantDistance) {
                counterMap.set(computedDifference, (counterMap.get(computedDifference) || 0) + 1);
            }
        }
    }

    for (let d = 1; d <= maxRelevantDistance; ++d) {
        finalOutputs.push(counterMap.get(d) * 2);
    }

    processNumericalSegment(providerReference);
};

processNumericalSegment(sequenceProvider);

finalOutputs.forEach(val => console.log(val));