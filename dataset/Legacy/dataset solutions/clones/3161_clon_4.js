const createInputParser = (sourceText) => {
  let textLines = sourceText.trim().split('\n');
  let currentLinePointer = 0;
  let currentLineSegments = [];

  const extractNextNumber = () => {
    if (currentLineSegments.length === 0) {
      if (currentLinePointer >= textLines.length) {
        return undefined;
      }
      currentLineSegments = textLines[currentLinePointer].split(' ').reverse();
      currentLinePointer++;
    }
    return Number(currentLineSegments.pop());
  };

  const extractLineNumbers = () => {
    if (currentLinePointer >= textLines.length) {
      return undefined;
    }
    const result = textLines[currentLinePointer].split(' ').map(Number);
    currentLinePointer++;
    return result;
  };

  const extractMultiLineNumberArrays = (numRows) => {
    const result = [];
    for (let i = 0; i < numRows; i++) {
      if (currentLinePointer >= textLines.length) {
        break;
      }
      result.push(textLines[currentLinePointer].split(' ').map(Number));
      currentLinePointer++;
    }
    return result;
  };

  return {
    readSingleValue: extractNextNumber,
    readFullLine: extractLineNumbers,
    readMatrix: extractMultiLineNumberArrays,
  };
};

const createDisjointSet = (totalNodes) => {
  const parentReferences = new Map();
  const setSizes = new Map();

  for (let i = 1; i <= totalNodes; i++) {
    parentReferences.set(i, i);
    setSizes.set(i, 1);
  }

  const locateRepresentative = (nodeIdentifier) => {
    let currentPath = [];
    let currentElement = nodeIdentifier;
    while (parentReferences.get(currentElement) !== currentElement) {
      currentPath.push(currentElement);
      currentElement = parentReferences.get(currentElement);
    }
    for (const pathNode of currentPath) {
      parentReferences.set(pathNode, currentElement);
    }
    return currentElement;
  };

  const checkConnectivity = (node1, node2) => {
    return locateRepresentative(node1) === locateRepresentative(node2);
  };

  const mergeComponents = (node1, node2) => {
    let rep1 = locateRepresentative(node1);
    let rep2 = locateRepresentative(node2);

    if (rep1 === rep2) {
      return;
    }

    let sizeOfSet1 = setSizes.get(rep1);
    let sizeOfSet2 = setSizes.get(rep2);

    if (sizeOfSet1 < sizeOfSet2) {
      [rep1, rep2] = [rep2, rep1];
      [sizeOfSet1, sizeOfSet2] = [sizeOfSet2, sizeOfSet1];
    }

    parentReferences.set(rep2, rep1);
    setSizes.set(rep1, sizeOfSet1 + sizeOfSet2);
    setSizes.delete(rep2);
  };

  const retrieveComponentSize = (nodeIdentifier) => {
    return setSizes.get(locateRepresentative(nodeIdentifier));
  };

  return {
    findRoot: locateRepresentative,
    areConnected: checkConnectivity,
    uniteSets: mergeComponents,
    getComponentSize: retrieveComponentSize,
  };
};

const executeAlgorithm = () => {
  const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
  const dataReader = createInputParser(fileContent);

  const totalNodes = dataReader.readSingleValue();
  const totalEdges = dataReader.readSingleValue();
  const edgeData = dataReader.readMatrix(totalEdges);

  const componentManager = createDisjointSet(totalNodes);

  const finalResults = edgeData.slice(1).reduceRight((accumulator, currentEdgePair) => {
    const [firstNode, secondNode] = currentEdgePair;
    const previousPairCount = accumulator[0];

    let currentPairCount;
    if (componentManager.areConnected(firstNode, secondNode)) {
      currentPairCount = previousPairCount;
    } else {
      const sizeOfFirst = componentManager.getComponentSize(firstNode);
      const sizeOfSecond = componentManager.getComponentSize(secondNode);
      const newlyConnectedPairs = sizeOfFirst * sizeOfSecond;
      currentPairCount = previousPairCount - newlyConnectedPairs;
      componentManager.uniteSets(firstNode, secondNode);
    }
    return [currentPairCount, ...accumulator];
  }, [totalNodes * (totalNodes - 1) / 2]);

  return finalResults.join("\n");
};

console.log(executeAlgorithm());