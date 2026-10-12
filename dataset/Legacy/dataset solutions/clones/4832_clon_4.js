const createZeroMatrix = (rows, cols = rows) =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));

class InputReader {
  constructor(rawContent) {
    this.lineBuffer = rawContent.split("\n");
    this.currentLineIndex = 0;
    this.currentLineTokens = [];
  }

  _ensureTokensAvailable() {
    if (this.currentLineTokens.length === 0 && this.currentLineIndex < this.lineBuffer.length) {
      this.currentLineTokens = this.lineBuffer[this.currentLineIndex].split(" ");
    }
  }

  readToken(asString = false) {
    this._ensureTokensAvailable();
    if (this.currentLineTokens.length === 0) {
      return undefined;
    }
    const token = this.currentLineTokens.shift();
    if (this.currentLineTokens.length === 0) {
      this.currentLineIndex++;
    }
    return asString ? token : Number(token);
  }

  readLineTokens(asString = false) {
    if (this.currentLineIndex >= this.lineBuffer.length) {
      return [];
    }
    const lineContent = this.lineBuffer[this.currentLineIndex];
    this.currentLineIndex++;
    const tokens = lineContent.split(" ");
    return asString ? tokens : tokens.map(Number);
  }

  readMatrix(numRows, asString = false) {
    return Array.from({ length: numRows }, () => this.readLineTokens(asString));
  }

  readAndCountPairs(numNodes, numPairs) {
    const frequencyMatrix = createZeroMatrix(numNodes + 1);
    Array.from({ length: numPairs }).forEach(() => {
      const [rowIdx, colIdx] = this.readLineTokens();
      frequencyMatrix[rowIdx][colIdx]++;
    });
    return frequencyMatrix;
  }
}

class DisjointSet {
  constructor(elementCount) {
    this.parents = Array.from({ length: elementCount + 1 }, (_, index) => index);
  }

  findRepresentative(element) {
    let current = element;
    const path = [];
    while (this.parents[current] !== current) {
      path.push(current);
      current = this.parents[current];
    }
    for (const node of path) {
      this.parents[node] = current;
    }
    return current;
  }

  uniteSets(element1, element2) {
    const root1 = this.findRepresentative(element1);
    const root2 = this.findRepresentative(element2);
    if (root1 !== root2) {
      this.parents[root1] = root2;
      return true;
    }
    return false;
  }
}

const processGraphData = () => {
  const inputSource = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

  const nodeCount = inputSource.readToken();
  const connCountA = inputSource.readToken();
  const connCountB = inputSource.readToken();

  const dsuStructureA = new DisjointSet(nodeCount);
  const dsuStructureB = new DisjointSet(nodeCount);

  Array.from({ length: connCountA }).forEach(() => {
    const [uNode, vNode] = inputSource.readLineTokens();
    dsuStructureA.uniteSets(uNode, vNode);
  });

  Array.from({ length: connCountB }).forEach(() => {
    const [uNode, vNode] = inputSource.readLineTokens();
    dsuStructureB.uniteSets(uNode, vNode);
  });

  const componentIdentifierKeys = Array.from({ length: nodeCount }, (_, index) => {
    const actualNodeIndex = index + 1;
    return `${dsuStructureA.findRepresentative(actualNodeIndex)},${dsuStructureB.findRepresentative(actualNodeIndex)}`;
  });

  const frequencyMap = componentIdentifierKeys.reduce((accumulator, key) => {
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const finalResultArray = componentIdentifierKeys.map(key => frequencyMap[key]);

  return finalResultArray.join(" ");
};

console.log(processGraphData());
