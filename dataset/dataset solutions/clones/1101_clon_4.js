const inputConfig = { sourcePath: '/dev/stdin', lineDelimiter: '\n' };

class NumericEntry {
  constructor(numericValue) {
    this.value = numericValue;
    this.leftSub = null;
    this.rightSub = null;
  }
}

class RegistryVault {
  constructor() {
    this.presentNumbers = new Set();
    this.primaryRoot = null;
  }

  addEntry(valueToAdd) {
    this.presentNumbers.add(valueToAdd);

    const newEntry = new NumericEntry(valueToAdd);

    if (this.primaryRoot === null) {
      this.primaryRoot = newEntry;
      return;
    }

    const placeNode = (currentNode, newNode) => {
      if (newNode.value < currentNode.value) {
        if (currentNode.leftSub === null) {
          currentNode.leftSub = newNode;
        } else {
          placeNode(currentNode.leftSub, newNode);
        }
      } else {
        if (currentNode.rightSub === null) {
          currentNode.rightSub = newNode;
        } else {
          placeNode(currentNode.rightSub, newNode);
        }
      }
    };
    placeNode(this.primaryRoot, newEntry);
  }

  checkPresence(valueToFind) {
    return this.presentNumbers.has(valueToFind);
  }

  displayStructure() {
    const depthFirstTraversal = (currentElement, currentLevel) => {
      const spacing = '  '.repeat(currentLevel);
      if (currentElement === null) {
        process.stdout.write(spacing + 'EMPTY\n');
        return;
      }
      process.stdout.write(spacing + currentElement.value + '\n');
      depthFirstTraversal(currentElement.leftSub, currentLevel + 1);
      depthFirstTraversal(currentElement.rightSub, currentLevel + 1);
    };
    depthFirstTraversal(this.primaryRoot, 0);
  }

  outputSequence() {
    const retrieveInOrder = (item) => {
      if (item === null) return [];
      return [...retrieveInOrder(item.leftSub), item.value, ...retrieveInOrder(item.rightSub)];
    };

    const retrievePreOrder = (item) => {
      if (item === null) return [];
      return [item.value, ...retrievePreOrder(item.leftSub), ...retrievePreOrder(item.rightSub)];
    };

    const inOrderResult = retrieveInOrder(this.primaryRoot);
    const preOrderResult = retrievePreOrder(this.primaryRoot);

    process.stdout.write(' ' + inOrderResult.join(' ') + '\n');
    process.stdout.write(' ' + preOrderResult.join(' ') + '\n');
  }
}

const fileSource = require('fs').createReadStream(inputConfig.sourcePath, { encoding: 'ascii' });
const inputLineHandler = require('readline').createInterface({
  input: fileSource,
  output: process.stdout
});

const dataStore = new RegistryVault();

inputLineHandler.on('line', (currentLine) => {
  const commandParts = currentLine.split(' ');
  const operation = commandParts[0];
  const operand = parseInt(commandParts[1], 10);

  if (operation === 'insert') {
    dataStore.addEntry(operand);
  } else if (operation === 'find') {
    process.stdout.write((dataStore.checkPresence(operand) ? 'yes' : 'no') + '\n');
  } else if (operation === 'print') {
    // dataStore.displayStructure();
    // dataStore.outputSequence();
  }
});