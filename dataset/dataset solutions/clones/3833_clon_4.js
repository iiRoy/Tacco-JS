const getRawInput = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();

function* createLineIterator(rawText) {
  const lines = rawText.split("\n");
  for (const line of lines) {
    yield line;
  }
}

const inputLineGenerator = createLineIterator(getRawInput());

const parseOperations = new Map([
  [1, (val) => parseInt(val, 10)],
  [2, (val) => val.split(" ")],
  [4, (val) => val.split(" ").map(Number)],
  [6, (val) => val.split("")],
  [7, (val) => val.split("").map(Number)],
  [8, (arr) => arr.join(" ")],
  [9, (arr) => arr.join("\n")],
  [0, (arr) => arr.join("")],
]);

const applyConversion = (value, typeCode) => {
  const handler = parseOperations.get(typeCode);
  return handler ? handler(value) : value;
};

const obtainNextLine = () => {
  const { value, done } = inputLineGenerator.next();
  if (done) {
    throw new Error("NoMoreInputException: No further elements available.");
  }
  return value;
};

const obtainInt = () => applyConversion(obtainNextLine(), 1);
const obtainStringArray = () => applyConversion(obtainNextLine(), 2);
const obtainIntArray = () => applyConversion(obtainNextLine(), 4);
const obtainCharList = () => applyConversion(obtainNextLine(), 6);

const outputResult = (data) => console.log(data);
const outputError = (data) => console.error(data);

function DisjointSetStructure(elementCount) {
  const parentRegistry = new Map();
  const groupSizes = new Map();

  Array.from({ length: elementCount }).forEach((_, idx) => {
    parentRegistry.set(idx, idx);
    groupSizes.set(idx, 1);
  });

  const findRepresentative = (element) => {
    let current = element;
    const path = [];
    while (parentRegistry.get(current) !== current) {
      path.push(current);
      current = parentRegistry.get(current);
    }
    path.forEach(node => parentRegistry.set(node, current));
    return current;
  };

  const uniteComponents = (elemA, elemB) => {
    let rootA = findRepresentative(elemA);
    let rootB = findRepresentative(elemB);

    if (rootA !== rootB) {
      let sizeA = groupSizes.get(rootA);
      let sizeB = groupSizes.get(rootB);

      if (sizeA < sizeB) {
        [rootA, rootB] = [rootB, rootA];
        [sizeA, sizeB] = [sizeB, sizeA];
      }

      parentRegistry.set(rootB, rootA);
      groupSizes.set(rootA, sizeA + sizeB);
      groupSizes.delete(rootB);
    }
  };

  const areConnected = (elemA, elemB) => findRepresentative(elemA) === findRepresentative(elemB);

  const getComponentSize = (element) => groupSizes.get(findRepresentative(element));

  return {
    areConnected,
    uniteComponents,
    getComponentSize
  };
}

const executeSolution = () => {
  const initialParams = obtainIntArray();
  const nodeCount = initialParams[0];
  const edgeCount = initialParams[1];
  const targetPermutation = obtainIntArray();

  const disjointSets = DisjointSetStructure(nodeCount);

  Array.from({ length: edgeCount }).forEach(() => {
    const connectionPair = obtainIntArray();
    disjointSets.uniteComponents(connectionPair[0] - 1, connectionPair[1] - 1);
  });

  const finalCount = targetPermutation.reduce((accumulator, currentTarget, index) => {
    const actualTarget = currentTarget - 1;
    return disjointSets.areConnected(actualTarget, index) ? accumulator + 1 : accumulator;
  }, 0);

  outputResult(finalCount);
};

executeSolution();
