const inputSystem = require('node:fs');

const numericalStringParser = (textualData) => textualData.split(' ').map(item => parseInt(item, 10));

const elementCountsRegistry = new Map();

const computeCurrentAggregateValue = () => {
  let totalSummation = 0n;
  for (const [elementKey, countValue] of elementCountsRegistry.entries()) {
    if (countValue > 0n) {
      totalSummation += BigInt(elementKey) * countValue;
    }
  }
  return Number(totalSummation);
};

const executeNextTransformation = (remainingInstructions) => {
  if (remainingInstructions.length === 0) {
    return;
  }

  const currentCommand = numericalStringParser(remainingInstructions.shift());
  const sourceIdentifier = currentCommand[0];
  const targetIdentifier = currentCommand[1];

  const currentSourceCount = elementCountsRegistry.get(sourceIdentifier) || 0n;

  if (currentSourceCount > 0n) {
    elementCountsRegistry.set(sourceIdentifier, 0n);
    elementCountsRegistry.set(targetIdentifier, (elementCountsRegistry.get(targetIdentifier) || 0n) + currentSourceCount);
  }

  console.log(computeCurrentAggregateValue());

  executeNextTransformation(remainingInstructions);
};

const initializeAndRun = () => {
  const rawInputContent = inputSystem.readFileSync('/dev/stdin', 'utf8');
  const processedLines = rawInputContent.split('\n').filter(line => line.trim() !== '');

  processedLines.shift();

  numericalStringParser(processedLines.shift()).forEach(valueItem => {
    elementCountsRegistry.set(valueItem, (elementCountsRegistry.get(valueItem) || 0n) + 1n);
  });

  processedLines.shift();

  executeNextTransformation(processedLines);
};

initializeAndRun();