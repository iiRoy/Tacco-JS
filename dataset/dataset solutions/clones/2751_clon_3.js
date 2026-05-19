var InputParser = (function() {
  function createInputParser(sourceString) {
    return new InputParserClass(sourceString);
  }

  function InputParserClass(sourceString) {
    this._sourceLines = sourceString.trim().split("\n");
    this._currentLineIndex = 0;
  }

  InputParserClass.prototype.readNextToken = function(asString) {
    let currentLineData = this._sourceLines[this._currentLineIndex];
    if (typeof currentLineData === "string") {
      this._sourceLines[this._currentLineIndex] = currentLineData.split(" ").reverse();
    }
    let tokenValue = this._sourceLines[this._currentLineIndex].pop();
    if (this._sourceLines[this._currentLineIndex].length === 0) {
      this._currentLineIndex++;
    }
    return asString ? tokenValue : Number(tokenValue);
  };

  InputParserClass.prototype.readLineTokens = function(asString) {
    const lineString = this._sourceLines[this._currentLineIndex++];
    const tokensArray = lineString.split(" ");
    return asString ? tokensArray : tokensArray.map(val => Number(val));
  };

  InputParserClass.prototype.readMatrix = function(numRows, asString) {
    const matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
    return asString ? matrixRows.map(row => row.split(" ")) : matrixRows.map(row => row.split(" ").map(val => Number(val)));
  };

  InputParserClass.prototype.readRows = function(numRows, asString) {
    const rows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
    return asString ? rows : rows.map(val => Number(val));
  };

  return createInputParser;
})();

var inputReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValueGenerator, ...dimensions) {
  const buildDimension = (dimIndex) => {
    if (dimIndex === dimensions.length - 1) {
      return Array(dimensions[dimIndex]).fill(0).map(() => initialValueGenerator());
    } else {
      return Array(dimensions[dimIndex]).fill(0).map(() => buildDimension(dimIndex + 1));
    }
  };
  return buildDimension(0);
}

function DisjointSet(size) {
  this._parentOrSize = Array(size + 1).fill(-1);
}

DisjointSet.prototype = {
  findRoot: function(nodeIndex) {
    if (this._parentOrSize[nodeIndex] < 0) {
      return nodeIndex;
    }
    const rootNode = this.findRoot(this._parentOrSize[nodeIndex]);
    this._parentOrSize[nodeIndex] = rootNode;
    return rootNode;
  },

  areConnected: function(nodeX, nodeY) {
    return this.findRoot(nodeX) === this.findRoot(nodeY);
  },

  unionSets: function(nodeX, nodeY) {
    let rootX = this.findRoot(nodeX);
    let rootY = this.findRoot(nodeY);

    if (rootX === rootY) {
      return 1;
    }

    if (this._parentOrSize[rootY] <= this._parentOrSize[rootX]) {
      this._parentOrSize[rootY] += this._parentOrSize[rootX];
      this._parentOrSize[rootX] = rootY;
    } else {
      this._parentOrSize[rootX] += this._parentOrSize[rootY];
      this._parentOrSize[rootY] = rootX;
    }
    return 0;
  },

  getSetSize: function(nodeIndex) {
    return -this._parentOrSize[this.findRoot(nodeIndex)];
  },
};

console.log(solveProblem());

function solveProblem() {
  var nodeCount = inputReader.readNextToken();
  var edgeCount = inputReader.readNextToken();

  if (edgeCount % 2 !== 0) {
    return -1;
  }

  var edgesInput = inputReader.readMatrix(edgeCount);
  var disjointSets = new DisjointSet(nodeCount);
  var resultEdges = [];

  var adjList = createMultiDimArray(() => [], nodeCount + 1);
  var parityFlags = createMultiDimArray(() => 0, nodeCount + 1);

  for (var edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    var nodeU = edgesInput[edgeIndex][0];
    var nodeV = edgesInput[edgeIndex][1];

    if (disjointSets.unionSets(nodeU, nodeV)) {
      adjList[nodeU].push(nodeV);
      adjList[nodeV].push(nodeU);
    } else {
      resultEdges.push(nodeU + " " + nodeV);
      parityFlags[nodeU] = 1 - parityFlags[nodeU];
    }
  }

  function depthFirstSearch(currentNode, parentNode) {
    for (var neighborNode of adjList[currentNode]) {
      if (neighborNode === parentNode) {
        continue;
      }
      depthFirstSearch(neighborNode, currentNode);
    }

    if (parentNode === 0) {
      return;
    }

    if (parityFlags[currentNode]) {
      resultEdges.push(currentNode + " " + parentNode);
    } else {
      resultEdges.push(parentNode + " " + currentNode);
      parityFlags[parentNode] = 1 - parityFlags[parentNode];
    }
  }

  depthFirstSearch(1, 0);
  return resultEdges.join("\n");
}
