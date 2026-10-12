const readline = require('readline');
const util = require('util');

let inputLines = [];
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (line) => {
  inputLines.push(line);
});

rl.on('close', () => {
  console.error('\n↑入力 ↓出力');
  processMainLogic(inputLines);
});

class InputParser {
  constructor(lines) {
    this.dataLines = lines;
    this.currentPosition = 0;
  }

  hasMoreLines() {
    return this.currentPosition < this.dataLines.length;
  }

  retrieveNextLine() {
    if (!this.hasMoreLines()) {
      throw new Error('No more input available.');
    }
    return this.dataLines[this.currentPosition++];
  }

  getInteger() {
    return parseInt(this.retrieveNextLine(), 10);
  }

  getIntegerArray() {
    return this.retrieveNextLine().split(' ').map(Number);
  }

  getStringArray() {
    return this.retrieveNextLine().split(' ');
  }

  getCharacterArray() {
    return this.retrieveNextLine().split('');
  }
}

function printResult(content) {
  console.log(content);
}

function printDebug(content) {
  console.error('debug:' + util.inspect(content, false, null));
}

function joinArrayWithSpaces(arr) {
  return arr.join(' ');
}

class DisjointSetUnion {
  constructor(size) {
    this.parent = Array.from({
      length: size
    }, (_, i) => i);
    this.rank = Array(size).fill(0);
  }

  findRepresentative(element) {
    let currentElement = element;
    while (this.parent[currentElement] !== currentElement) {
      currentElement = this.parent[currentElement];
    }
    const root = currentElement;

    currentElement = element;
    while (this.parent[currentElement] !== root) {
      const nextElement = this.parent[currentElement];
      this.parent[currentElement] = root;
      currentElement = nextElement;
    }
    return root;
  }

  uniteElements(element1, element2) {
    let root1 = this.findRepresentative(element1);
    let root2 = this.findRepresentative(element2);

    if (root1 !== root2) {
      if (this.rank[root1] < this.rank[root2]) {
        this.parent[root1] = root2;
      } else if (this.rank[root1] > this.rank[root2]) {
        this.parent[root2] = root1;
      } else {
        this.parent[root2] = root1;
        this.rank[root1]++;
      }
      return true;
    }
    return false;
  }

  areConnected(element1, element2) {
    return this.findRepresentative(element1) === this.findRepresentative(element2);
  }
}

function processMainLogic(inputData) {
  const parser = new InputParser(inputData);

  const initialParams = parser.getIntegerArray();
  const totalNodes = initialParams[0];
  const roadConnections = initialParams[1];
  const railConnections = initialParams[2];

  const roadDSU = new DisjointSetUnion(totalNodes);
  const railDSU = new DisjointSetUnion(totalNodes);

  Array.from({
    length: roadConnections
  }).forEach(() => {
    const [nodeA, nodeB] = parser.getIntegerArray().map(val => val - 1).sort((a, b) => a - b);
    roadDSU.uniteElements(nodeA, nodeB);
  });

  Array.from({
    length: railConnections
  }).forEach(() => {
    const [nodeA, nodeB] = parser.getIntegerArray().map(val => val - 1).sort((a, b) => a - b);
    railDSU.uniteElements(nodeA, nodeB);
  });

  const combinedRootCounts = new Map();
  Array.from({
    length: totalNodes
  }).forEach((_, idx) => {
    const roadRoot = roadDSU.findRepresentative(idx);
    const railRoot = railDSU.findRepresentative(idx);
    const compositeKey = `${roadRoot}_${railRoot}`;
    combinedRootCounts.set(compositeKey, (combinedRootCounts.get(compositeKey) || 0) + 1);
  });

  const finalCounts = Array.from({
    length: totalNodes
  }, (_, idx) => {
    const roadRoot = roadDSU.findRepresentative(idx);
    const railRoot = railDSU.findRepresentative(idx);
    const compositeKey = `${roadRoot}_${railRoot}`;
    return combinedRootCounts.get(compositeKey);
  });

  printResult(joinArrayWithSpaces(finalCounts));
}
