class InputCoordinator {
  constructor() {
    this.buffer = [];
    this.pointer = 0;
  }

  feedLine(text) {
    this.buffer.push(text);
  }

  retrieveNext() {
    if (this.pointer >= this.buffer.length) {
      throw new Error("End of input buffer reached.");
    }
    return this.buffer[this.pointer++];
  }

  retrieveAsNumber() {
    return parseInt(this.retrieveNext(), 10);
  }

  retrieveAsNumberCollection() {
    return this.retrieveNext().split(' ').map(Number);
  }
}

const systemInputHandler = new InputCoordinator();
const systemOutputDisplay = (text) => console.log(text);

const standardInputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

standardInputProcessor.on('line', (line) => {
  systemInputHandler.feedLine(line);
});

standardInputProcessor.on('close', () => {
  console.error('\n↑Input ↓Output');
  performCoreOperation();
});

const evaluateHierarchicalCondition = (totalLevels, sourceElements) => {
  const elementsAscending = [...sourceElements].sort((a, b) => a - b);
  let currentHierarchySegment = [];
  currentHierarchySegment.push(elementsAscending.pop());

  let outcome = "Yes";

  for (let levelIndex = 1; levelIndex <= totalLevels; levelIndex++) {
    const requiredNodesForLevel = 1 << levelIndex;
    const nextHierarchySegment = Array.from({ length: requiredNodesForLevel }, () => elementsAscending.pop());

    const conditionBreached = nextHierarchySegment.some((nextElement, idx) => {
      return currentHierarchySegment[idx] !== undefined && currentHierarchySegment[idx] <= nextElement;
    });

    if (conditionBreached) {
      outcome = "No";
      break;
    }

    currentHierarchySegment = [...currentHierarchySegment, ...nextHierarchySegment];
  }

  return outcome;
};

function performCoreOperation() {
  const principalValue = systemInputHandler.retrieveAsNumber();
  const numericalDataset = systemInputHandler.retrieveAsNumberCollection();

  const conclusion = evaluateHierarchicalCondition(principalValue, numericalDataset);
  systemOutputDisplay(conclusion);
}