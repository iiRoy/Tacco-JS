"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// This function processes raw input to find equal elements.
function AreEqual(rawData) {

  // Deconstruct the processed input into its components.
  var _dataComponents = processRawData(rawData),
    nodeCount = _dataComponents.nodeCount,
    edgeCount = _dataComponents.edgeCount,
    checkIndices = _dataComponents.checkIndices,
    connectionPairs = _dataComponents.connectionPairs;

  // Build the union-find data structure from the given nodes and connections.
  var unionFindStructures = UnionFindSystem.createFrom(nodeCount, connectionPairs);

  // Return the count of elements that satisfy the condition, as a string.
  return checkIndices.filter(function(currentVal, idx) {
    return unionFindStructures.checkIfSameGroup(currentVal, idx + 1);
  }).length.toString();
}
exports.AreEqual = AreEqual;

// Implements a Disjoint Set Union (DSU) or Union-Find data structure.
var UnionFindSystem = /** @class */ (function() {
  function UnionFindSystem(elementTrees) {
    this.elementTrees = elementTrees;
  }

  // Static method to construct a UnionFindSystem from graph parameters.
  UnionFindSystem.createFrom = function(nodeCount, connectionPairs) {
    // Initialize an array of UnionFindTree instances for each node.
    var allTrees = Array.apply(this, Array(nodeCount + 1)).map(function() {
      return new UnionFindTree();
    });

    // Perform union operations for all given connection pairs.
    connectionPairs.forEach(function(_pairData) {
      var nodeA = _pairData.nodeA,
        nodeB = _pairData.nodeB;
      return allTrees[nodeA].unify(allTrees[nodeB]);
    });

    return new UnionFindSystem(allTrees);
  };

  // Checks if two values belong to the same disjoint set.
  UnionFindSystem.prototype.checkIfSameGroup = function(val1, val2) {
    return this.elementTrees[val1].isInSameGroupAs(this.elementTrees[val2]);
  };

  return UnionFindSystem;
}());

// Represents a single element within a Disjoint Set Union structure.
var UnionFindTree = /** @class */ (function() {
  function UnionFindTree() {
    this.representative = this; // Initially, each element is its own representative.
    this.depth = 0; // Rank/depth for union-by-rank optimization.
  }

  // Determines if this element is in the same set as another element.
  UnionFindTree.prototype.isInSameGroupAs = function(another) {
    return this.findRoot() === another.findRoot();
  };

  // Unites two sets by linking the root of one to the root of the other.
  // This uses the union-by-rank heuristic.
  UnionFindTree.prototype.unify = function(another) {
    var _tempSwap;
    var rootA = this.findRoot();
    var rootB = another.findRoot();

    if (rootA !== rootB) {
      // Attach the smaller rank tree under the root of the larger rank tree.
      if (rootA.depth < rootB.depth) {
        _tempSwap = [rootB, rootA], rootA = _tempSwap[0], rootB = _tempSwap[1];
      }
      rootB.representative = rootA;
      // If ranks were equal, increment the rank of the new root.
      if (rootB.depth === rootA.depth) {
        rootA.depth = rootA.depth + 1;
      }
    }
  };

  // Finds the representative (root) of the set this element belongs to.
  // Also performs path compression for efficiency.
  UnionFindTree.prototype.findRoot = function() {
    if (this.representative !== this) {
      this.representative = this.representative.findRoot();
    }
    return this.representative;
  };

  return UnionFindTree;
}());

// Parses the raw input string into structured data.
function processRawData(sourceData) {
  var _parsedLines = sourceData.split("\n"),
    initialLine = _parsedLines[0],
    secondLine = _parsedLines[1],
    remainingLines = _parsedLines.slice(2);

  var _dimensions = parseNumericLine(initialLine),
    nodeCount = _dimensions[0],
    edgeCount = _dimensions[1];

  var checkIndices = parseNumericLine(secondLine);

  var connectionPairs = remainingLines.map(function(currentLine) {
    var _pairVals = parseNumericLine(currentLine),
      nodeA = _pairVals[0],
      nodeB = _pairVals[1];
    return {
      nodeA: nodeA,
      nodeB: nodeB
    };
  });

  return {
    nodeCount: nodeCount,
    edgeCount: edgeCount,
    checkIndices: checkIndices,
    connectionPairs: connectionPairs
  };
}

// Helper function to parse a space-separated string of integers.
function parseNumericLine(textLine) {
  return textLine.split(" ").map(Number);
}

// Entry point for competitive programming platforms like AtCoder.
function runSolution(programInput) {
  console.log(AreEqual(programInput));
}

// Standard boilerplate for running on AtCoder or locally.
try {
  runSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
} catch (e) {
  // Error handling for local development or testing.
}
//# sourceMappingURL=SameGroups.js.map