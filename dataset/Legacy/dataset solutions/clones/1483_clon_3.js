class DisjointSet {
  constructor(elementCount) {
    this.parentArr = Array.from({ length: elementCount }, (_, index) => index);
    this.rankArr = new Array(elementCount).fill(0);
    this.componentSize = new Array(elementCount).fill(1);
  }

  unionElements(idxA, idxB) {
    const rootA = this.findRepresentative(idxA);
    const rootB = this.findRepresentative(idxB);
    this.mergeSets(rootA, rootB);
  }

  mergeSets(rootA, rootB) {
    if (rootA === rootB) {
      return;
    }

    const rankOfA = this.rankArr[rootA];
    const rankOfB = this.rankArr[rootB];

    if (rankOfA > rankOfB) {
      this.parentArr[rootB] = rootA;
      this.componentSize[rootA] += this.componentSize[rootB];
    } else {
      this.parentArr[rootA] = rootB;
      this.componentSize[rootB] += this.componentSize[rootA];

      if (rankOfA === rankOfB) {
        this.rankArr[rootB]++;
      }
    }
  }

  findRepresentative(elementIdx) {
    let currentElement = elementIdx;
    const pathNodes = [];

    while (this.parentArr[currentElement] !== currentElement) {
      pathNodes.push(currentElement);
      currentElement = this.parentArr[currentElement];
    }

    for (const nodeToCompress of pathNodes) {
      this.parentArr[nodeToCompress] = currentElement;
    }

    return currentElement;
  }
}

const processInput = (rawData) => {
  const trimmedData = rawData.trim();
  const allInputLines = trimmedData.split('\n');

  const firstConfigurationLine = allInputLines[0];
  const queryInstructionLines = allInputLines.slice(1);

  const [numNodes, numQueries] = firstConfigurationLine.split(' ').map(Number);

  const disjointSetInstance = new DisjointSet(numNodes);

  const processQuery = (queryLine) => {
    const [nodeOne, nodeTwo] = queryLine.split(' ').map(Number);
    disjointSetInstance.unionElements(nodeOne - 1, nodeTwo - 1);
  };

  queryInstructionLines.forEach(processQuery);

  const finalParentArrayState = disjointSetInstance.parentArr;
  const uniqueParentIdentifiers = new Set(finalParentArrayState);
  const distinctSetCount = uniqueParentIdentifiers.size;

  return console.log(distinctSetCount - 1);
};

const executionEnvironmentVariable = process.env.MYTEST;

executionEnvironmentVariable
  ? (executionEnvironmentVariable === 'test' ? test() : processInput(require('fs').readFileSync('dev/stdin', 'utf8')))
  : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
