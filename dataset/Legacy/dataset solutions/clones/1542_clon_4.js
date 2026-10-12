const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");

const tokenStream = (function* () {
  const rawTokens = inputSource.split(/ |\n/);
  for (const token of rawTokens) {
    yield token;
  }
})();

function retrieveNumeric() { return +tokenStream.next().value; }
function retrieveString() { return tokenStream.next().value; }
function retrieveBigInt() { return BigInt(tokenStream.next().value); }

function retrieveMultiple(count, transformer) {
  const collectedValues = [];
  for (let i = 0; i < count; i++) {
    collectedValues.push(tokenStream.next().value);
  }
  return transformer ? collectedValues.map(transformer) : collectedValues;
}

function retrieveNumericSequence(count, asStrings) {
  return retrieveMultiple(count, asStrings ? (val => val) : (val => +val));
}

function retrieveAndSortNumericSequence(count, ascendingOrder) {
  const numbers = retrieveMultiple(count, val => +val);
  return numbers.sort((a, b) => ascendingOrder ? (a - b) : (b - a));
}

function retrieveMatrix(rows, columns, asStrings) {
  return Array.from({ length: rows }, () => retrieveMultiple(columns, asStrings ? (val => val) : (val => +val)));
}

function constructMultiDimArray(initialValue, ...dimensions) {
  if (dimensions.length === 0) {
    return initialValue;
  }
  const currentDimensionSize = dimensions[0];
  const remainingDimensions = dimensions.slice(1);

  return Array.from({ length: currentDimensionSize }, () =>
    constructMultiDimArray(initialValue, ...remainingDimensions)
  );
}

class DisjointSetStructure {
  constructor(elementLimit) {
    this.parentMap = new Map();
    this.setSizes = new Map();
    for (let i = 1; i <= elementLimit; i++) {
      this.parentMap.set(i, i);
      this.setSizes.set(i, 1);
    }
  }

  findSetRepresentative(element) {
    let currentElement = element;
    const pathNodes = [];
    while (this.parentMap.get(currentElement) !== currentElement) {
      pathNodes.push(currentElement);
      currentElement = this.parentMap.get(currentElement);
    }
    for (const nodeOnPath of pathNodes) {
      this.parentMap.set(nodeOnPath, currentElement);
    }
    return currentElement;
  }

  areElementsInSameSet(elemA, elemB) {
    return this.findSetRepresentative(elemA) === this.findSetRepresentative(elemB);
  }

  uniteSets(elemA, elemB) {
    let rootA = this.findSetRepresentative(elemA);
    let rootB = this.findSetRepresentative(elemB);

    if (rootA === rootB) {
      return false;
    }

    let sizeA = this.setSizes.get(rootA);
    let sizeB = this.setSizes.get(rootB);

    if (sizeA < sizeB) {
      [rootA, rootB] = [rootB, rootA];
      [sizeA, sizeB] = [sizeB, sizeA];
    }

    this.parentMap.set(rootB, rootA);
    this.setSizes.set(rootA, sizeA + sizeB);
    this.setSizes.delete(rootB);

    return true;
  }

  getSetCardinality(element) {
    return this.setSizes.get(this.findSetRepresentative(element));
  }
}

const processedResult = (function executeQueryOperations() {
  const [nodeQuantity, queryQuantity] = retrieveNumericSequence(2);
  const setHandler = new DisjointSetStructure(nodeQuantity);

  const operationOutcomes = Array.from({ length: queryQuantity }, () => {
    const [opType, itemOne, itemTwo] = retrieveNumericSequence(3);
    if (opType === 1) {
      return setHandler.areElementsInSameSet(itemOne, itemTwo) ? 1 : 0;
    } else {
      setHandler.uniteSets(itemOne, itemTwo);
      return null;
    }
  }).filter(outcome => outcome !== null);

  return operationOutcomes.join("\n");
})();

if (processedResult !== undefined) {
  console.log(String(processedResult));
}
