const filesystemAdapter = require('node:fs');

const obtainDataset = () => {
    const rawTextContent = filesystemAdapter.readFileSync('/dev/stdin', 'utf8');
    const [firstLineContent, secondLineContent, ..._remainingLines] = rawTextContent.split('\n');

    const [totalElementsQuantity, desiredDistinctLimit] = firstLineContent.split(' ').map(Number);
    const elementSequence = secondLineContent.split(' ');

    return { totalElementsQuantity, desiredDistinctLimit, elementSequence };
};

const determineMinimumRemovals = ({ totalElementsQuantity, desiredDistinctLimit, elementSequence }) => {
    const occurrenceRegistry = new Map();

    elementSequence.forEach(itemIdentifier => {
        occurrenceRegistry.set(itemIdentifier, (occurrenceRegistry.get(itemIdentifier) || 0) + 1);
    });

    const currentUniqueCount = occurrenceRegistry.size;
    const excessUniqueCount = currentUniqueCount - desiredDistinctLimit;

    return excessUniqueCount <= 0
        ? 0
        : Array.from(occurrenceRegistry.values())
              .sort((valA, valB) => valA - valB)
              .slice(0, excessUniqueCount)
              .reduce((sumAccumulator, frequencyValue) => sumAccumulator + frequencyValue, 0);
};

const inputParameters = obtainDataset();
const computedResult = determineMinimumRemovals(inputParameters);

process.stdout.write(computedResult.toString() + '\n');