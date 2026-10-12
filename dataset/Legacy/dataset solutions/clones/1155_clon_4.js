class DisjointSetManager {
  constructor(nodeCount) {
    this.parentRegistry = new Map();
    this.componentSizes = new Map();

    for (let currentId = 0; currentId < nodeCount; currentId++) {
      this.parentRegistry.set(currentId, currentId);
      this.componentSizes.set(currentId, 1);
    }
  }

  findRepresentative(elementIdentifier) {
    let currentElement = elementIdentifier;
    const pathNodes = [];

    while (this.parentRegistry.get(currentElement) !== currentElement) {
      pathNodes.push(currentElement);
      currentElement = this.parentRegistry.get(currentElement);
    }

    for (const nodeToCompress of pathNodes) {
      this.parentRegistry.set(nodeToCompress, currentElement);
    }

    return currentElement;
  }

  combineSets(firstElement, secondElement) {
    let rootA = this.findRepresentative(firstElement);
    let rootB = this.findRepresentative(secondElement);

    if (rootA === rootB) {
      return;
    }

    let sizeA = this.componentSizes.get(rootA);
    let sizeB = this.componentSizes.get(rootB);

    if (sizeA < sizeB) {
      [rootA, rootB] = [rootB, rootA];
      [sizeA, sizeB] = [sizeB, sizeA];
    }

    this.parentRegistry.set(rootB, rootA);
    this.componentSizes.set(rootA, sizeA + sizeB);
    this.componentSizes.delete(rootB);
  }

  areConnected(firstElement, secondElement) {
    return this.findRepresentative(firstElement) === this.findRepresentative(secondElement);
  }
}

const fileContent = Buffer.from(require('fs').readFileSync('/dev/stdin')).toString();
const allLines = fileContent.split("\n");

const [nodeQuantity, queryQuantity] = allLines.shift().split(" ").map(val => parseInt(val, 10));

const managerInstance = new DisjointSetManager(nodeQuantity);

const queryDispatch = {
  0: (valX, valY) => managerInstance.combineSets(valX, valY),
  1: (valX, valY) => console.log(managerInstance.areConnected(valX, valY) ? 1 : 0)
};

for (const currentLine of allLines) {
  if (!currentLine.trim()) continue;
  const [operationType, valueA, valueB] = currentLine.split(" ").map(val => parseInt(val, 10));
  queryDispatch[operationType](valueA, valueB);
}
