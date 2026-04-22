const countCombinationsOfTwo = (quantity) => {
  return quantity > 1 ? (quantity * (quantity - 1)) / 2 : 0;
};

const processInputData = (sourceData) => {
  const numericSequence = sourceData.trim().split('\n')[1].split(' ').map(Number);

  const initialFrequencies = numericSequence.reduce((accumulator, value) => {
    accumulator.set(value, (accumulator.get(value) || 0) + 1);
    return accumulator;
  }, new Map());

  const computedResultsCache = new Map();

  const finalOutputs = numericSequence.map((currentValueBeingRemoved) => {
    if (computedResultsCache.has(currentValueBeingRemoved)) {
      return computedResultsCache.get(currentValueBeingRemoved);
    }

    const modifiedFrequencies = new Map(initialFrequencies);
    modifiedFrequencies.set(currentValueBeingRemoved, modifiedFrequencies.get(currentValueBeingRemoved) - 1);

    let currentIterationPairSum = 0;
    for (const count of modifiedFrequencies.values()) {
      currentIterationPairSum += countCombinationsOfTwo(count);
    }

    computedResultsCache.set(currentValueBeingRemoved, currentIterationPairSum);

    return currentIterationPairSum;
  });

  return finalOutputs.join('\n');
};

const orchestrateExecution = () => {
  const fileInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  console.log(processInputData(fileInputContent));
};

process.env.PERFORMANCE_TEST_MODE ? null : orchestrateExecution();