var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var inputHandler = {
  "dataLines" : rawData,
  "currentLineIdx" : 0,
  "totalLines" : rawData.length,
  "fetchNextLine" : function() {
    if (!this.hasMoreLines()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    var retrievedItem = this.dataLines[this.currentLineIdx];
    this.currentLineIdx++;
    return retrievedItem;
  },
  "hasMoreLines" : function() {
    return (this.currentLineIdx < this.totalLines);
  }
};

ExecuteProgram();

function retrieveNext() {
  return inputHandler.fetchNextLine();
}

function retrieveNextInt() {
  return dataConverter(retrieveNext(), 1);
}

function retrieveNextStrArr() {
  return dataConverter(retrieveNext(), 2);
}

function retrieveNextIntArr() {
  return dataConverter(retrieveNext(), 4);
}

function retrieveNextCharArr() {
  return dataConverter(retrieveNext(), 6);
}

function checkMoreLines() {
  return inputHandler.hasMoreLines();
}

function printResult(content) {
  console.log(content);
}

function printError(errContent) {
  console.error(errContent);
}

// This function handles various data transformations.
// `conversionType` specifies the desired operation:
// 1: Convert to integer.
// 2: Split by space.
// 4: Split by space and convert elements to numbers.
// 6: Split into individual characters.
// 7: Split into individual characters and convert to numbers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without any separator.
// Default: Return input as is.
function dataConverter(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((itemVal) => Number(itemVal));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((itemVal) => Number(itemVal));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (e) {
    return inputValue;
  }
}

function ExecuteProgram() {
  var disjointSet = {
    "parentOrSize" : null,

    // Each index in `parentOrSize` stores either:
    // - A negative value (-X), indicating it's a root, and its absolute value X is the size of the set.
    // - A non-negative value, indicating it's a child, and the value is the index of its parent.
    // Initially, all elements are roots of their own sets, each with size 1.
    "initializeSets" : function(numElements) {
      this.parentOrSize = new Array(numElements).fill(-1);
    },

    // Checks if two elements belong to the same set.
    "areConnected" : function(elementA, elementB) {
      return this.findRepresentative(elementA) === this.findRepresentative(elementB);
    },

    // Finds the root (representative) of the set containing the given element.
    // Performs path compression during traversal to optimize future lookups.
    "findRepresentative" : function(targetIndex) {
      if (this.parentOrSize[targetIndex] < 0) {
        return targetIndex;
      } else {
        this.parentOrSize[targetIndex] = this.findRepresentative(this.parentOrSize[targetIndex]);
        return this.parentOrSize[targetIndex];
      }
    },

    // Merges the sets containing two elements.
    // If they are already in the same set, nothing happens.
    // The smaller set's root becomes a child of the larger set's root.
    // The size of the combined set is updated at the new root.
    "uniteSets" : function(elementA, elementB) {
      var rootA = this.findRepresentative(elementA);
      var rootB = this.findRepresentative(elementB);

      if (!this.areConnected(rootA, rootB)) {
        if (this.parentOrSize[rootA] >= this.parentOrSize[rootB]) { // rootA's set is smaller or equal in size
          this.parentOrSize[rootA] += this.parentOrSize[rootB]; // Update size at rootA
          this.parentOrSize[rootB] = rootA; // Make rootA the parent of rootB
        } else { // rootB's set is smaller
          this.parentOrSize[rootB] += this.parentOrSize[rootA]; // Update size at rootB
          this.parentOrSize[rootA] = rootB; // Make rootB the parent of rootA
        }
      }
    },

    // Returns the size of the set containing the given element.
    // The size is stored as a negative value at the set's root.
    "getSetSize" : function(targetIndex) {
      return -this.parentOrSize[this.findRepresentative(targetIndex)];
    }
  };

  var firstLineData = retrieveNextIntArr();
  var numNodes = firstLineData[0];
  var numQueries = firstLineData[1];

  disjointSet.initializeSets(numNodes);

  var resultMessages = [];

  for (var queryCounter = 0; queryCounter < numQueries; queryCounter++) {
    var currentQuery = retrieveNextIntArr();
    if (currentQuery[0] === 0) {
      disjointSet.uniteSets(currentQuery[1], currentQuery[2]);
    } else {
      if (disjointSet.areConnected(currentQuery[1], currentQuery[2])) {
        resultMessages.push("Yes");
      } else {
        resultMessages.push("No");
      }
    }
  }

  printResult(dataConverter(resultMessages, 9));
}
