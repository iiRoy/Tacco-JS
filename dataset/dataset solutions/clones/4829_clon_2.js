var inputReader = require('line-reader').createInterface({
  inputStream: process.stdin,
  outputStream: process.stdout
});
var dataStore;
var capturedLines = [];
inputReader.on('dataReceived', function(receivedInput) {
  capturedLines.push(receivedInput);
});
inputReader.on('endOfInput', function() {
  dataStore = initializeData(capturedLines);
  console.warn('\n--- Input above, Program output below ---');
  executeProgram();
});

function deepCopyObject(sourceObj) {
  /*
   * Creates a deep copy of an object.
   * Special handling for Set objects, otherwise uses JSON serialization.
   */
  if (sourceObj instanceof Set) {
    return new Set(Array.from(sourceObj));
  } else {
    return JSON.parse(JSON.stringify(sourceObj));
  }
}

function retrieveInteger() {
  return dataConverter(getNextItem(), 1);
}

function retrieveStringArray() {
  return dataConverter(getNextItem(), 2);
}

function retrieveIntegerArray() {
  return dataConverter(getNextItem(), 4);
}

function retrieveCharacterArray() {
  return dataConverter(getNextItem(), 6);
}

function getNextItem() {
  return dataStore.fetchNextEntry();
}

function hasMoreItems() {
  return dataStore.hasMoreEntries();
}

function initializeData(inputLines) {
  // Sets up the data source object for sequential line retrieval.
  return {
    lineCollection: inputLines,
    currentPosition: 0,
    maximumLines: inputLines.length,
    hasMoreEntries: function() {
      return (this.currentPosition < this.maximumLines);
    },
    fetchNextEntry: function() {
      if (this.hasMoreEntries()) {
        return this.lineCollection[this.currentPosition++];
      } else {
        throw 'InputOutOfBoundsError : No more lines available for processing.';
      }
    }
  };
}

function displayOutput(messageContent) {
  console.log(messageContent);
}

function logDebugMessage(debugPayload) {
  console.error('DEBUG INFO: ' + require('util').inspect(debugPayload, false, null));
}

/*
 * Utility function to convert input data based on a specified type.
 * conversionType values:
 * 1: Parse as integer.
 * 2: Split string by space into array.
 * 4: Split string by space, then parse each part as Number.
 * 6: Split string into character array.
 * 7: Split string into character array, then parse each char as Number.
 * 8: Join array elements with spaces.
 * 9: Join array elements with newlines.
 * 0: Join array elements without any separator.
 * Default: Return input as-is.
 */
function dataConverter(inputData, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputData);
      case 2:
        return inputData.split(' ');
      case 4:
        return inputData.split(' ').map(Number);
      case 6:
        return inputData.split('');
      case 7:
        return inputData.split('').map(Number);
      case 8:
        return inputData.join(' ');
      case 9:
        return inputData.join('\n');
      case 0:
        return inputData.join('');
      default:
        return inputData;
    }
  } catch (conversionError) {
    return inputData; // Return original data on conversion failure.
  }
}

// --- End of utility functions and setup ---

function executeProgram() {
  const firstLineData = retrieveIntegerArray();
  const elementCount = firstLineData[0];
  const firstGroupSize = firstLineData[1];
  const secondGroupSize = firstLineData[2];

  const ufStructureOne = disjointSetStructure(elementCount);
  const ufStructureTwo = disjointSetStructure(elementCount);

  const resultArray = new Array(elementCount);
  const groupOneConnections = new Array(firstGroupSize);
  const groupTwoConnections = new Array(secondGroupSize);

  for (let idx = 0; idx < firstGroupSize; idx++) {
    const tempPair = retrieveIntegerArray();
    tempPair.sort((a, b) => a - b); // Ensure consistent order
    tempPair[0]--; // Adjust to 0-based indexing
    tempPair[1]--; // Adjust to 0-based indexing
    groupOneConnections[idx] = tempPair;
    ufStructureOne.performUnion(tempPair[0], tempPair[1]);
  }

  for (let idx = 0; idx < secondGroupSize; idx++) {
    const tempPair = retrieveIntegerArray();
    tempPair.sort((a, b) => a - b); // Ensure consistent order
    tempPair[0]--; // Adjust to 0-based indexing
    tempPair[1]--; // Adjust to 0-based indexing
    groupTwoConnections[idx] = tempPair;
    ufStructureTwo.performUnion(tempPair[0], tempPair[1]);
  }

  const frequencyMap = {};
  for (let idx = 0; idx < elementCount; idx++) {
    const rootKeyString = ufStructureTwo.getRepresentativeIndex(idx) + ":" + ufStructureOne.getRepresentativeIndex(idx);
    if (frequencyMap[rootKeyString] === undefined) {
      frequencyMap[rootKeyString] = 0;
    }
    frequencyMap[rootKeyString]++;
  }

  for (let idx = 0; idx < elementCount; idx++) {
    resultArray[idx] = frequencyMap[ufStructureTwo.getRepresentativeIndex(idx) + ":" + ufStructureOne.getRepresentativeIndex(idx)];
  }

  displayOutput(dataConverter(resultArray, 8));
}

function disjointSetStructure(totalElements) {
  const dssInstance = {
    // The internal array stores either the parent index (if positive)
    // or the negative size of the group if it's a root (e.g., -5 for a group of 5).
    "parentOrSize": new Array(totalElements).fill(-1),

    // Checks if two elements belong to the same connected component.
    "areConnected": function(elementA, elementB) {
      return this.getRepresentativeIndex(elementA) === this.getRepresentativeIndex(elementB);
    },

    // Finds the representative (root) of the set containing the given index.
    // Also performs path compression for optimization.
    "getRepresentativeIndex": function(targetIndex) {
      if (this.parentOrSize[targetIndex] < 0) {
        return targetIndex; // This element is a root
      } else {
        // Recursively find the root and compress path
        this.parentOrSize[targetIndex] = this.getRepresentativeIndex(this.parentOrSize[targetIndex]);
        return this.parentOrSize[targetIndex];
      }
    },

    // Merges the sets containing elementA and elementB.
    // Uses union-by-size heuristic: attaches smaller tree to larger tree's root.
    "performUnion": function(elementA, elementB) {
      const rootA = this.getRepresentativeIndex(elementA);
      const rootB = this.getRepresentativeIndex(elementB);

      if (!this.areConnected(rootA, rootB)) { // Only merge if they are in different sets
        if (this.parentOrSize[rootA] <= this.parentOrSize[rootB]) { // rootA's tree is larger or equal (more negative value)
          this.parentOrSize[rootA] += this.parentOrSize[rootB]; // Update size of new root
          this.parentOrSize[rootB] = rootA; // Make rootA the parent of rootB
        } else { // rootB's tree is larger
          this.parentOrSize[rootB] += this.parentOrSize[rootA]; // Update size of new root
          this.parentOrSize[rootA] = rootB; // Make rootB the parent of rootA
        }
      }
    },

    // Returns the size of the group that the given index belongs to.
    "getGroupSize": function(targetIndex) {
      // The size is stored as a negative value at the root.
      return -this.parentOrSize[this.getRepresentativeIndex(targetIndex)];
    }
  };
  return dssInstance;
}