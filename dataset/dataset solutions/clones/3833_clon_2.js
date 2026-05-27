var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var dataStream = {
  "dataItems" : rawData,
  "currentPosition" : 0,
  "totalItems" : rawData.length,

  "hasMoreElements" : function() {
    return (this.currentPosition < this.totalItems);
  },

  "retrieveNext" : function() {
    if (!this.hasMoreElements()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    var returnedItem = this.dataItems[this.currentPosition];
    this.currentPosition++;
    return returnedItem;
  }
};

executeProgram();

function getNextItem() {
  return dataStream.retrieveNext();
}

function getNextInteger() {
  return dataConverter(getNextItem(), 1);
}

function getNextStringArray() {
  return dataConverter(getNextItem(), 2);
}

function getNextIntegerArray() {
  return dataConverter(getNextItem(), 4);
}

function getNextCharacterArray() {
  return dataConverter(getNextItem(), 6);
}

function checkHasNext() {
  return dataStream.hasMoreElements();
}

function printOutput(content) {
  console.log(content);
}

function printError(message) {
  console.error(message);
}

// This utility function handles various data type conversions.
// It takes an input value and a conversion type code.
// Type codes:
// 1: Convert to integer.
// 2: Split by space into a string array.
// 4: Split by space and convert to an array of numbers.
// 6: Split into a character array.
// 7: Split into a character array and convert to an array of numbers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without a separator.
// Default: Return input as is.
function dataConverter(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((val) => Number(val));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((val) => Number(val));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (errorDetails) {
    return inputValue;
  }
}

// Implements a Disjoint Set Union (DSU) data structure.
// Each element initially forms its own set.
// The `parentOrSize` array stores either the parent index or
// a negative value representing the size of the set if it's a root.
function disjointSet(elementCount) {
  var dsStructure = {
    // Initialize all elements as roots of their own sets, with size 1.
    "parentOrSize" : new Array(elementCount).fill(-1),

    // Checks if two elements belong to the same set.
    "areConnected" : function(firstElement, secondElement) {
      return this.findRepresentative(firstElement) === this.findRepresentative(secondElement);
    },

    // Finds the representative (root) of the set containing the given element.
    // Performs path compression during traversal.
    "findRepresentative" : function(elementIndex) {
      if (this.parentOrSize[elementIndex] < 0) {
        return elementIndex; // This element is a root
      } else {
        // Path compression: set parent directly to the root
        this.parentOrSize[elementIndex] = this.findRepresentative(this.parentOrSize[elementIndex]);
        return this.parentOrSize[elementIndex];
      }
    },

    // Unites the sets containing two given elements.
    // Uses union by size heuristic.
    "uniteSets" : function(firstElement, secondElement) {
      var firstRoot = this.findRepresentative(firstElement);
      var secondRoot = this.findRepresentative(secondElement);

      if (!this.areConnected(firstRoot, secondRoot)) { // If they are not already in the same set
        // Attach the smaller tree under the root of the larger tree
        if (this.parentOrSize[firstRoot] >= this.parentOrSize[secondRoot]) {
          // firstRoot's set is smaller or equal in size (since sizes are negative)
          this.parentOrSize[firstRoot] += this.parentOrSize[secondRoot]; // Update size of new root
          this.parentOrSize[secondRoot] = firstRoot; // Make firstRoot the parent of secondRoot
        } else {
          // secondRoot's set is larger
          this.parentOrSize[secondRoot] += this.parentOrSize[firstRoot]; // Update size of new root
          this.parentOrSize[firstRoot] = secondRoot; // Make secondRoot the parent of firstRoot
        }
      }
    },

    // Returns the size of the set containing the given element.
    // The size is stored as a negative value at the root.
    "getSetSize" : function(elementIndex) {
      return -this.parentOrSize[this.findRepresentative(elementIndex)];
    }
  };
  return dsStructure;
}

function executeProgram() {
  var initialParams = getNextIntegerArray();
  var numNodes = initialParams[0];
  var numEdges = initialParams[1];

  var nodeValues = getNextIntegerArray();

  var dsInstance = disjointSet(numNodes);

  for (var loopCounter = 0; loopCounter < numEdges; loopCounter++) {
    var edgePair = getNextIntegerArray();
    // Adjusting to 0-based indexing
    dsInstance.uniteSets(edgePair[0] - 1, edgePair[1] - 1);
  }

  var matchingCount = 0;
  for (var loopCounter = 0; loopCounter < numNodes; loopCounter++) {
    var currentValue = nodeValues[loopCounter] - 1; // Adjusting to 0-based indexing
    if (dsInstance.areConnected(currentValue, loopCounter)) {
      matchingCount++;
    }
  }

  printOutput(matchingCount);
}
