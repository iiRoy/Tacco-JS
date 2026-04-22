var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataStore;
var receivedLines = [];

lineReader.on('line', function(inputLine) {
  receivedLines.push(inputLine);
});

lineReader.on('close', function() {
  dataStore = initializeData(receivedLines);
  console.warn('\n↑ Input ↓ Output');
  ExecuteProgram();
});

function duplicateObject(instanceData) {
  return (instanceData instanceof Set) ? new Set(Array.from(instanceData)) : JSON.parse(JSON.stringify(instanceData));
}

function getNextInteger() {
  return convertInput(retrieveNext(), 1);
}

function getNextStringArray() {
  return convertInput(retrieveNext(), 2);
}

function getNextIntegerArray() {
  return convertInput(retrieveNext(), 4);
}

function getNextCharacterArray() {
  return convertInput(retrieveNext(), 6);
}

function retrieveNext() {
  return dataStore.retrieveNext();
}

function hasMoreInput() {
  return dataStore.hasMoreInput();
}

function initializeData(inputContent) {
  return {
    contentList: inputContent,
    currentPosition: 0,
    maximumLength: inputContent.length,

    hasMoreInput: function() {
      return (this.currentPosition < this.maximumLength);
    },

    retrieveNext: function() {
      if (this.hasMoreInput()) {
        return this.contentList[this.currentPosition++];
      } else {
        throw 'InputAccessException: No more lines available';
      }
    }
  };
}

function displayOutput(result) {
  console.log(result);
}

function logDebugMessage(messageContent) {
  console.error('DEBUG_LOG: ' + require('util').inspect(messageContent, false, null));
}

// Parameter "conversionType" indicates the desired transformation:
// 1: Parse as integer.
// 2: Split by space into string array.
// 4: Split by space and parse as integer array.
// 6: Split by character into string array.
// 7: Split by character and parse as integer array.
// 8: Join array elements with space.
// 9: Join array elements with newline.
// 0: Join array elements without separator.
// Default: Return item as is.
function convertInput(item, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(item);
      case 2:
        return item.split(' ');
      case 4:
        return item.split(' ').map(Number);
      case 6:
        return item.split('');
      case 7:
        return item.split('').map(Number);
      case 8:
        return item.join(' ');
      case 9:
        return item.join('\n');
      case 0:
        return item.join('');
      default:
        return item;
    }
  } catch (errorObject) {
    return item;
  }
}

function ExecuteProgram() {
  const firstLineNumbers = getNextIntegerArray();
  const totalElements = firstLineNumbers[0];
  const numConnectionsK = firstLineNumbers[1];
  const numConnectionsL = firstLineNumbers[2];

  const unionStructureK = createDisjointSet(totalElements);
  const unionStructureL = createDisjointSet(totalElements);

  const finalCounts = new Array(totalElements).fill(1);
  const kPairList = new Array(numConnectionsK);
  const lPairList = new Array(numConnectionsL);

  for (let counter = 0; counter < numConnectionsK; counter++) {
    const currentPair = getNextIntegerArray();
    currentPair.sort();
    currentPair[0]--;
    currentPair[1]--;
    kPairList[counter] = currentPair;
    unionStructureK.uniteSets(currentPair[0], currentPair[1]);
  }

  for (let loopIdx = 0; loopIdx < numConnectionsL; loopIdx++) {
    const currentLink = getNextIntegerArray();
    currentLink.sort();
    currentLink[0]--;
    currentLink[1]--;
    lPairList[loopIdx] = currentLink;
    unionStructureL.uniteSets(currentLink[0], currentLink[1]);
  }

  const processedPairs = new Set();

  for (let idxA = 0; idxA < numConnectionsK; idxA++) {
    const pairA = kPairList[idxA];
    if (unionStructureL.areConnected(pairA[0], pairA[1])) {
      finalCounts[pairA[0]]++;
      finalCounts[pairA[1]]++;
    }
    processedPairs.add(pairA.join(":"));
  }

  for (let idxB = 0; idxB < numConnectionsL; idxB++) {
    const pairB = lPairList[idxB];
    if (processedPairs.has(pairB.join(":"))) {
      continue;
    }
    if (unionStructureK.areConnected(pairB[0], pairB[1])) {
      finalCounts[pairB[0]]++;
      finalCounts[pairB[1]]++;
    }
  }

  displayOutput(convertInput(finalCounts, 8));
}

function createDisjointSet(elementCount) {
  const disjointSet = {
    // The 'parentData' array stores either the parent index (if not a root)
    // or a negative value representing the negative size of the set (if it is a root).
    // Initially, each element is its own root, forming a set of size 1.
    "parentData": new Array(elementCount).fill(-1),

    // Checks if two nodes belong to the same connected component.
    "areConnected": function(firstNode, secondNode) {
      return this.findRoot(firstNode) === this.findRoot(secondNode);
    },

    // Finds the representative (root) of the set containing the given node.
    // Implements path compression: during traversal, updates parent pointers
    // to point directly to the root, optimizing future lookups.
    "findRoot": function(nodeIndex) {
      if (this.parentData[nodeIndex] < 0) {
        return nodeIndex;
      } else {
        this.parentData[nodeIndex] = this.findRoot(this.parentData[nodeIndex]);
        return this.parentData[nodeIndex];
      }
    },

    // Merges the sets containing 'nodeOne' and 'nodeTwo'.
    // Uses union-by-size heuristic: the root of the smaller set (in absolute size)
    // becomes a child of the root of the larger set.
    // If they are already in the same set, no action is taken.
    "uniteSets": function(nodeOne, nodeTwo) {
      const rootOne = this.findRoot(nodeOne);
      const rootTwo = this.findRoot(nodeTwo);

      if (!this.areConnected(rootOne, rootTwo)) {
        if (this.parentData[rootOne] <= this.parentData[rootTwo]) {
          // rootOne's set is larger or equal (more negative value means larger size)
          this.parentData[rootOne] += this.parentData[rootTwo];
          this.parentData[rootTwo] = rootOne;
        } else {
          // rootTwo's set is larger
          this.parentData[rootTwo] += this.parentData[rootOne];
          this.parentData[rootOne] = rootTwo;
        }
      }
    },

    // Retrieves the size of the set containing the specified 'targetIndex'.
    // The size is stored as a negative value at the root's position.
    "getSetSize": function(targetIndex) {
      return -this.parentData[this.findRoot(targetIndex)];
    }
  };
  return disjointSet;
}