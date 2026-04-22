const systemCore = require('process');
const lineIterator = require('readline');

const inputHandler = lineIterator.createInterface({
  input: systemCore.stdin,
  output: systemCore.stdout,
  terminal: false
});

let acquiredDataRows = [];

inputHandler.on('line', (currentLineSegment) => {
  acquiredDataRows.push(currentLineSegment);
});

inputHandler.on('close', () => {
  processAcquiredData(acquiredDataRows);
});

function processAcquiredData(allDataSegments) {
  const primaryParameters = allDataSegments[0].split(' ');
  const totalItemCount = Number(primaryParameters[0]);
  const comparisonBoundary = Number(primaryParameters[1]);

  const itemRecords = allDataSegments.slice(1, totalItemCount + 1).map(dataEntry => {
    const componentParts = dataEntry.split(' ');
    return [Number(componentParts[0]), componentParts[1]];
  });

  const defaultResultDesignation = 'orbitalNodeIdentifier';

  const firstFailingIndex = itemRecords.findIndex(recordItem => recordItem[0] < comparisonBoundary);

  let finalOutputDesignation;

  if (firstFailingIndex === 0) {
    finalOutputDesignation = defaultResultDesignation;
  } else if (firstFailingIndex === -1) {
    finalOutputDesignation = itemRecords[itemRecords.length - 1][1];
  } else {
    finalOutputDesignation = itemRecords[firstFailingIndex - 1][1];
  }

  systemCore.stdout.write(finalOutputDesignation + '\n');
}