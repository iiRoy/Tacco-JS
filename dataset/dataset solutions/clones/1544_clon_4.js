const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputTokens = fileContent.split(/ |\n/);
let tokenIndex = 0;

function getNextNumber() {
  return +inputTokens[tokenIndex++];
}

class DisjointSetCollection {
  constructor(totalElements) {
    this.parentAndSize = new Array(totalElements);
    for (let i = 0; i < totalElements; i++) {
      this.parentAndSize[i] = -1; // Negative value indicates root, and its absolute value is the size of the component
    }
    this.componentCount = totalElements;
  }

  findRoot(elementIndex) {
    const path = [];
    while (this.parentAndSize[elementIndex] >= 0) { // While not a root (parent is not negative)
      path.push(elementIndex);
      elementIndex = this.parentAndSize[elementIndex];
    }
    // elementIndex is now the root
    for (const nodeOnPath of path) {
      this.parentAndSize[nodeOnPath] = elementIndex; // Path compression
    }
    return elementIndex;
  }

  mergeSets(elementA, elementB) {
    let rootA = this.findRoot(elementA);
    let rootB = this.findRoot(elementB);

    if (rootA === rootB) {
      return;
    }

    // Sizes are stored as negative values for roots
    let sizeA = -this.parentAndSize[rootA];
    let sizeB = -this.parentAndSize[rootB];

    // Union by size: attach smaller tree to larger tree
    if (sizeA < sizeB) {
      [rootA, rootB] = [rootB, rootA]; // Swap roots to ensure rootA is the larger tree
    }

    this.parentAndSize[rootB] = rootA; // Attach rootB's tree to rootA
    this.parentAndSize[rootA] -= sizeB; // Update size of rootA
    this.componentCount--;
  }

  areConnected(elementA, elementB) {
    return this.findRoot(elementA) === this.findRoot(elementB);
  }
}

function processQueries() {
  const elementCount = getNextNumber();
  let queryCount = getNextNumber();

  const disjointSets = new DisjointSetCollection(elementCount);

  while (queryCount--) {
    const operationType = getNextNumber();
    const firstElement = getNextNumber();
    const secondElement = getNextNumber();

    if (operationType === 0) {
      disjointSets.mergeSets(firstElement, secondElement);
    } else {
      if (disjointSets.areConnected(firstElement, secondElement)) {
        console.log(1);
      } else {
        console.log(0);
      }
    }
  }
}

processQueries();
