const appSettings = {
  sourcePath: '/dev/stdin',
  lineSeparator: '\n',
  dataEncoding: 'utf8',
  debugMode: false
};

// Represents a single node within the binary search structure.
class NodeElement {
  constructor(value) {
    this.key = value;
    this.leftBranch = undefined;
    this.rightBranch = undefined;
    this.parentNode = undefined;
  }
}

// Core class for managing a binary search structure.
function BinarySearchStructure() {
  this.topNode = undefined;
  this.presentElements = new Map();
  this.elementCount = 0;
}

// Method to add a new value to the binary search structure.
BinarySearchStructure.prototype.addNode = function (inputKey) {
  if (typeof inputKey !== 'number' || isNaN(inputKey)) {
    if (appSettings.debugMode) {
      console.error(`Attempted to insert invalid key: ${inputKey}`);
    }
    return false;
  }

  if (this.presentElements.has(inputKey)) {
    if (appSettings.debugMode) {
      console.log(`Key ${inputKey} already present. Skipping insertion.`);
    }
    return false;
  }

  const newNode = new NodeElement(inputKey);
  let parentCandidate = undefined;
  let currentNode = this.topNode;

  while (currentNode !== undefined) {
    parentCandidate = currentNode;
    if (newNode.key < currentNode.key) {
      currentNode = currentNode.leftBranch;
    } else {
      currentNode = currentNode.rightBranch;
    }
  }

  newNode.parentNode = parentCandidate;

  if (parentCandidate === undefined) {
    this.topNode = newNode;
  } else if (newNode.key < parentCandidate.key) {
    parentCandidate.leftBranch = newNode;
  } else {
    parentCandidate.rightBranch = newNode;
  }

  this.presentElements.set(inputKey, true);
  this.elementCount++;
  return true;
};

// Method to check if a value exists in the structure.
BinarySearchStructure.prototype.checkPresence = function (queryKey) {
  if (typeof queryKey !== 'number' || isNaN(queryKey)) {
    return false;
  }
  return this.presentElements.has(queryKey);
};

// Method to visually represent the tree structure in a hierarchical manner.
BinarySearchStructure.prototype.displayStructure = function () {
  const recursiveDisplay = (curr, level) => {
    const currentIndent = Array(level * 3 + 1).join(' ');

    if (curr === undefined) {
      console.log(`${currentIndent}NIL`);
      return;
    }
    console.log(`${currentIndent}[${curr.key}]`);
    recursiveDisplay(curr.leftBranch, level + 1);
    recursiveDisplay(curr.rightBranch, level + 1);
  };

  console.log('\n--- Structure Visualization ---');
  if (this.topNode === undefined) {
    console.log('    (Empty Tree)');
  } else {
    recursiveDisplay(this.topNode, 0);
  }
  console.log('-----------------------------\n');
};

// Method to output different tree traversals.
BinarySearchStructure.prototype.outputTraversals = function () {
  const traverseInOrder = (curr) => {
    let resultArray = [];
    if (curr === undefined) return resultArray;
    resultArray = [...traverseInOrder(curr.leftBranch), curr.key, ...traverseInOrder(curr.rightBranch)];
    return resultArray;
  };

  const traversePreOrder = (curr) => {
    let resultArray = [];
    if (curr === undefined) return resultArray;
    resultArray = [curr.key, ...traversePreOrder(curr.leftBranch), ...traversePreOrder(curr.rightBranch)];
    return resultArray;
  };

  const traversePostOrder = (curr) => {
    let resultArray = [];
    if (curr === undefined) return resultArray;
    resultArray = [...traversePostOrder(curr.leftBranch), ...traversePostOrder(curr.rightBranch), curr.key];
    return resultArray;
  };

  if (this.topNode === undefined) {
    console.log('No elements to traverse. The structure is empty.');
    return;
  }

  console.log(` In-Order Traversal:  ${traverseInOrder(this.topNode).join(' ')}`);
  console.log(` Pre-Order Traversal: ${traversePreOrder(this.topNode).join(' ')}`);
  console.log(` Post-Order Traversal: ${traversePostOrder(this.topNode).join(' ')}`);
};

const fileSystemModule = require('fs');
const lineProcessingModule = require('readline');

const inputStream = fileSystemModule.createReadStream(appSettings.sourcePath, {
  encoding: appSettings.dataEncoding
});

const lineReader = lineProcessingModule.createInterface({
  input: inputStream,
  output: process.stdout,
  terminal: false
});

const mainStructure = new BinarySearchStructure();

lineReader.on('line', (currentLine) => {
  const trimmedLine = currentLine.trim();
  if (!trimmedLine) {
    if (appSettings.debugMode) {
      console.warn('Skipping empty line.');
    }
    return;
  }

  const commandParts = trimmedLine.split(' ');
  const primaryCommand = commandParts[0].toLowerCase();

  switch (primaryCommand) {
    case 'insert':
      if (commandParts.length < 2) {
        console.error(`Error: 'insert' command requires a value. Line: "${trimmedLine}"`);
        return;
      }
      const valueToInsert = Number(commandParts[1]);
      mainStructure.addNode(valueToInsert);
      break;

    case 'find':
      if (commandParts.length < 2) {
        console.error(`Error: 'find' command requires a value. Line: "${trimmedLine}"`);
        return;
      }
      const valueToFind = Number(commandParts[1]);
      console.log(mainStructure.checkPresence(valueToFind) ? 'yes' : 'no');
      break;

    case 'print':
      if (commandParts.length > 1 && commandParts[1].toLowerCase() === 'tree') {
         mainStructure.displayStructure();
      } else {
         mainStructure.outputTraversals();
      }
      break;

    default:
      console.warn(`Unknown command received: "${primaryCommand}". Line: "${trimmedLine}"`);
      break;
  }
});

lineReader.on('close', () => {
  if (appSettings.debugMode) {
    console.log('\nInput stream closed. Processing complete.');
    console.log(`Final element count: ${mainStructure.elementCount}`);
  }
});