const readline = require('readline');
const util = require('util');

let inputLinesBuffer = [];
let inputLineIterator;

const rlInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rlInterface.on('line', (line) => {
  inputLinesBuffer.push(line);
});

rlInterface.on('close', () => {
  inputLineIterator = createLineReader(inputLinesBuffer);
  console.error('\n↑入力 ↓出力');
  executePrimaryLogic();
});

function createLineReader(lines) {
  let currentIdx = 0;
  return {
    retrieveNext: () => {
      if (currentIdx >= lines.length) {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
      return lines[currentIdx++];
    },
    hasMore: () => currentIdx < lines.length
  };
}

function printResult(content) {
  console.log(content);
}

function logDebug(data) {
  console.error('debug:' + util.inspect(data, false, null));
}

function parseNumericArray() {
  return inputLineIterator.retrieveNext().split(' ').map(Number);
}

function formatArrayForDisplay(arr) {
  return arr.join(' ');
}

class DisjointSet {
  constructor(count) {
    this.parents = Array.from({ length: count }, (_, i) => i);
    this.componentSizes = Array(count).fill(1);
  }

  findRepresentative(member) {
    let current = member;
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

  uniteComponents(first, second) {
    let rep1 = this.findRepresentative(first);
    let rep2 = this.findRepresentative(second);

    if (rep1 !== rep2) {
      if (this.componentSizes[rep1] < this.componentSizes[rep2]) {
        [rep1, rep2] = [rep2, rep1];
      }
      this.parents[rep2] = rep1;
      this.componentSizes[rep1] += this.componentSizes[rep2];
      return true;
    }
    return false;
  }

  areConnected(first, second) {
    return this.findRepresentative(first) === this.findRepresentative(second);
  }

  getComponentSize(member) {
    return this.componentSizes[this.findRepresentative(member)];
  }
}

function executePrimaryLogic() {
  const initialParams = parseNumericArray();
  const nodeCount = initialParams[0];
  const kConnections = initialParams[1];
  const lConnections = initialParams[2];

  const kSet = new DisjointSet(nodeCount);
  const lSet = new DisjointSet(nodeCount);

  for (let i = 0; i < kConnections; i++) {
    const connectionPair = parseNumericArray();
    const nodeA = connectionPair[0] - 1;
    const nodeB = connectionPair[1] - 1;
    kSet.uniteComponents(nodeA, nodeB);
  }

  for (let i = 0; i < lConnections; i++) {
    const connectionPair = parseNumericArray();
    const nodeA = connectionPair[0] - 1;
    const nodeB = connectionPair[1] - 1;
    lSet.uniteComponents(nodeA, nodeB);
  }

  const componentPairCounts = new Map();
  const nodeComponentPairs = new Array(nodeCount);

  for (let i = 0; i < nodeCount; i++) {
    const kRoot = kSet.findRepresentative(i);
    const lRoot = lSet.findRepresentative(i);
    const pairKey = `${kRoot}:${lRoot}`;

    nodeComponentPairs[i] = pairKey;
    componentPairCounts.set(pairKey, (componentPairCounts.get(pairKey) || 0) + 1);
  }

  const finalResults = new Array(nodeCount);
  for (let i = 0; i < nodeCount; i++) {
    finalResults[i] = componentPairCounts.get(nodeComponentPairs[i]);
  }

  printResult(formatArrayForDisplay(finalResults));
}
