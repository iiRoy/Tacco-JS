const fileSystem = require("fs");

const INFINITY_VALUE = 9999999999;

const calculateAllShortestPaths = (graphMatrix) => {
  const nodeCount = graphMatrix.length;
  const distanceMatrix = Array.from(graphMatrix, (row) => Array.from(row));

  for (let intermediateVertex = 0; intermediateVertex < nodeCount; intermediateVertex++) {
    for (let sourceVertex = 0; sourceVertex < nodeCount; sourceVertex++) {
      for (let destinationVertex = 0; destinationVertex < nodeCount; destinationVertex++) {
        const pathViaIntermediate =
          distanceMatrix[sourceVertex][intermediateVertex] +
          distanceMatrix[intermediateVertex][destinationVertex];
        if (distanceMatrix[sourceVertex][destinationVertex] > pathViaIntermediate) {
          distanceMatrix[sourceVertex][destinationVertex] = pathViaIntermediate;
        }
      }
    }
  }
  return distanceMatrix;
};

const createInputReader = (rawInputString) => {
  const inputTokens = rawInputString.trim().split(/\s+/g);
  let currentTokenIndex = 0;

  const fetchNextString = () => {
    if (currentTokenIndex >= inputTokens.length) {
      throw new Error("Input exhausted: Attempted to read beyond available tokens.");
    }
    return inputTokens[currentTokenIndex++];
  };

  const fetchNextInteger = () => {
    return parseInt(fetchNextString(), 10);
  };

  return {
    readNextString: fetchNextString,
    readNextInteger: fetchNextInteger,
    resetReaderPosition: () => {
      currentTokenIndex = 0;
    },
  };
};

const processGraphQueries = (inputSource) => {
  const totalNodes = inputSource.readNextInteger();
  const totalEdges = inputSource.readNextInteger();
  const pathThreshold = inputSource.readNextInteger();

  const initialAdjacencyMatrix = Array.from({ length: totalNodes }, (_, rowIndex) =>
    Array.from({ length: totalNodes }, (_, colIndex) =>
      rowIndex === colIndex ? 0 : INFINITY_VALUE
    )
  );

  let edgeIterator = 0;
  while (edgeIterator < totalEdges) {
    const nodeOne = inputSource.readNextInteger();
    const nodeTwo = inputSource.readNextInteger();
    const edgeWeight = inputSource.readNextInteger();
    initialAdjacencyMatrix[nodeOne - 1][nodeTwo - 1] = edgeWeight;
    initialAdjacencyMatrix[nodeTwo - 1][nodeOne - 1] = edgeWeight;
    edgeIterator++;
  }

  const firstShortestPaths = calculateAllShortestPaths(initialAdjacencyMatrix);

  const transformedAdjacencyMatrix = firstShortestPaths.map((rowContent, rIdx) =>
    rowContent.map((distanceValue, cIdx) => {
      if (rIdx === cIdx) return 0;
      return distanceValue <= pathThreshold ? 1 : INFINITY_VALUE;
    })
  );

  const secondShortestPaths = calculateAllShortestPaths(transformedAdjacencyMatrix);

  const queryCount = inputSource.readNextInteger();

  Array.from({ length: queryCount }, () => {
    const queryStartNode = inputSource.readNextInteger();
    const queryEndNode = inputSource.readNextInteger();
    const finalDistance =
      secondShortestPaths[queryStartNode - 1][queryEndNode - 1];

    if (finalDistance === INFINITY_VALUE) {
      console.log(-1);
    } else {
      console.log(finalDistance - 1);
    }
  });
};

const executeMainLogic = () => {
  const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
  const inputProcessor = createInputReader(standardInputContent);
  processGraphQueries(inputProcessor);
};

executeMainLogic();
