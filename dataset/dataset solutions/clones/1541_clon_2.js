// This section handles input/output and helper functions.
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});
let dataProcessor;
const capturedLines = [];

inputReader.on('line', (currentLine) => {
  capturedLines.push(currentLine);
});

inputReader.on('close', () => {
  dataProcessor = initializeData(capturedLines);
  console.error('\n↑ Received input, processing ↓');
  executeMainLogic();
});

function deepCopy(originalObject) {
  return originalObject instanceof Set
    ? new Set(Array.from(originalObject))
    : JSON.parse(JSON.stringify(originalObject));
}

function readInteger() {
  return convertInput(getNextItem(), 101);
}
function readStringArray() {
  return convertInput(getNextItem(), 102);
}
function readIntegerArray() {
  return convertInput(getNextItem(), 104);
}
function readCharacterArray() {
  return convertInput(getNextItem(), 106);
}

function getNextItem() {
  return dataProcessor.retrieveNext();
}
function hasMoreItems() {
  return dataProcessor.hasPendingItems();
}

function initializeData(rawInputData) {
  return {
    sourceData: rawInputData,
    currentPosition: 0,
    maximumPosition: rawInputData.length,
    hasPendingItems: function () {
      return this.currentPosition < this.maximumPosition;
    },
    retrieveNext: function () {
      if (this.hasPendingItems()) {
        return this.sourceData[this.currentPosition++];
      } else {
        throw new Error('InputBufferEmptyException: No more data available for processing.');
      }
    },
  };
}

function displayOutput(outputValue) {
  console.log(outputValue);
}

function logError(debugValue) {
  console.error(
    'DEBUG_INFO: ' + require('util').inspect(debugValue, false, null)
  );
}

// This helper function handles various input transformations.
// Parameter `conversionType` dictates the operation:
// 101: Parse as integer.
// 102: Split by space.
// 104: Split by space and parse as integers.
// 106: Split into individual characters.
// 107: Split into individual characters and parse as integers.
// 208: Join array elements with spaces.
// 209: Join array elements with newlines.
// 200: Join array elements without a separator.
// Any other value: Return the item as is.
function convertInput(itemToConvert, conversionType) {
  try {
    switch (conversionType) {
      case 101:
        return parseInt(itemToConvert, 10);
      case 102:
        return itemToConvert.split(' ');
      case 104:
        return itemToConvert.split(' ').map(Number);
      case 106:
        return itemToConvert.split('');
      case 107:
        return itemToConvert.split('').map(Number);
      case 208:
        return itemToConvert.join(' ');
      case 209:
        return itemToConvert.join('\n');
      case 200:
        return itemToConvert.join('');
      default:
        return itemToConvert;
    }
  } catch (error) {
    // If conversion fails, return the original item.
    return itemToConvert;
  }
}
// End of utility functions.
function executeMainLogic() {
  // Read the initial configuration line.
  const firstInputLine = readIntegerArray();
  const elementCount = firstInputLine[0];
  const queryCount = firstInputLine[1];

  // Initialize the Disjoint Set Union data structure.
  const disjointSetStructure = createDisjointSet(elementCount);

  // Process each query.
  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    const currentQueryDetails = readIntegerArray();
    const operationType = currentQueryDetails[0];
    const firstElement = currentQueryDetails[1];
    const secondElement = currentQueryDetails[2];

    // Perform operations based on the query type.
    if (operationType === 0) {
      disjointSetStructure.uniteSets(firstElement, secondElement);
    } else {
      // Output 1 if elements are in the same set, 0 otherwise.
      displayOutput(disjointSetStructure.areElementsConnected(firstElement, secondElement) ? 1 : 0);
    }
  }
}

function createDisjointSet(totalElements) {
  // The structure to hold parent pointers or negative size for roots.
  // Initially, each element is its own root, representing a set of size 1.
  // A negative value indicates a root, and its absolute value is the set's size.
  // A non-negative value is the parent's index.
  const disjointSetInstance = {
    parentOrSizeArray: new Array(totalElements).fill(-1),

    // Determines if two elements belong to the same connected component.
    areElementsConnected: function (firstNode, secondNode) {
      return (
        this.findSetRepresentative(firstNode) ===
        this.findSetRepresentative(secondNode)
      );
    },

    // Finds the representative (root) of the set containing the given node.
    // Implements path compression for efficiency.
    findSetRepresentative: function (nodeIdentifier) {
      if (this.parentOrSizeArray[nodeIdentifier] < 0) {
        // If the value is negative, this node is a root.
        return nodeIdentifier;
      } else {
        // Otherwise, recursively find the root and compress the path.
        this.parentOrSizeArray[nodeIdentifier] = this.findSetRepresentative(
          this.parentOrSizeArray[nodeIdentifier]
        );
        return this.parentOrSizeArray[nodeIdentifier];
      }
    },

    // Merges the sets containing two given elements if they are distinct.
    // Uses union by size/rank heuristic.
    uniteSets: function (elementA, elementB) {
      let rootOfA = this.findSetRepresentative(elementA);
      let rootOfB = this.findSetRepresentative(elementB);

      // Only merge if the roots are different.
      if (!this.areElementsConnected(rootOfA, rootOfB)) {
        // Union by size: attach the smaller tree under the root of the larger tree.
        if (this.parentOrSizeArray[rootOfA] <= this.parentOrSizeArray[rootOfB]) {
          // rootOfA's set is larger or equal in size (more negative).
          this.parentOrSizeArray[rootOfA] += this.parentOrSizeArray[rootOfB];
          this.parentOrSizeArray[rootOfB] = rootOfA;
        } else {
          // rootOfB's set is larger.
          this.parentOrSizeArray[rootOfB] += this.parentOrSizeArray[rootOfA];
          this.parentOrSizeArray[rootOfA] = rootOfB;
        }
      }
    },

    // Returns the size of the set to which the given node belongs.
    getSetSize: function (memberNode) {
      // The size is the absolute value of the root's entry.
      return -this.parentOrSizeArray[this.findSetRepresentative(memberNode)];
    },
  };
  return disjointSetInstance;
}