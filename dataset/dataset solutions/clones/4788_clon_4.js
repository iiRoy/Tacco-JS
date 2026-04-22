const acquireSourceData = () => require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const PARSING_MODE = {
  NUMERIC_SEQUENCE: 101,
  SINGLE_NUMBER: 102,
  CHARACTER_STREAM: 103
};

const processLineContent = (textEntry, modeIdentifier) => {
  switch (modeIdentifier) {
    case PARSING_MODE.NUMERIC_SEQUENCE:
      return textEntry.split(" ").map(Number);
    case PARSING_MODE.SINGLE_NUMBER:
      return Number(textEntry);
    case PARSING_MODE.CHARACTER_STREAM:
      return textEntry.split("");
    default:
      return textEntry;
  }
};

function* feedLineProvider(sourceEntries) {
  let pointer = 0;
  while (pointer < sourceEntries.length) {
    yield sourceEntries[pointer++];
  }
}

const orchestrateComputation = () => {
  const rawDataLines = acquireSourceData();
  const lineGenerator = feedLineProvider(rawDataLines);

  const obtainNextParsedValue = (mode) => processLineContent(lineGenerator.next().value, mode);

  const initialParameters = obtainNextParsedValue(PARSING_MODE.NUMERIC_SEQUENCE);
  const vertexCount = initialParameters[0];
  const edgeCount = initialParameters[1];

  const largeArbitraryValue = 1000000007;

  const shortestPathMatrix = Array.from({ length: vertexCount }, (_, rIdx) =>
    Array.from({ length: vertexCount }, (_, cIdx) => (rIdx === cIdx ? 0 : largeArbitraryValue))
  );

  const originalConnectionMatrix = Array.from({ length: vertexCount }, (_, rIdx) =>
    Array.from({ length: vertexCount }, (_, cIdx) => (rIdx === cIdx ? 0 : largeArbitraryValue))
  );

  Array.from({ length: edgeCount }).forEach(() => {
    const connectionDetails = obtainNextParsedValue(PARSING_MODE.NUMERIC_SEQUENCE);
    const startVertex = connectionDetails[0] - 1;
    const endVertex = connectionDetails[1] - 1;
    const edgeWeight = connectionDetails[2];

    shortestPathMatrix[startVertex][endVertex] = edgeWeight;
    shortestPathMatrix[endVertex][startVertex] = edgeWeight;
    originalConnectionMatrix[startVertex][endVertex] = edgeWeight;
    originalConnectionMatrix[endVertex][startVertex] = edgeWeight;
  });

  Array.from({ length: vertexCount }).forEach((_, pivotVertex) => {
    Array.from({ length: vertexCount }).forEach((_, startVertex) => {
      Array.from({ length: vertexCount }).forEach((_, endVertex) => {
        const currentDistance = shortestPathMatrix[startVertex][endVertex];
        const pathViaPivot = shortestPathMatrix[startVertex][pivotVertex] + shortestPathMatrix[pivotVertex][endVertex];
        if (currentDistance > pathViaPivot) {
          shortestPathMatrix[startVertex][endVertex] = pathViaPivot;
        }
      });
    });
  });

  let superfluousEdgeCounter = 0;
  Array.from({ length: vertexCount }).forEach((_, row) => {
    Array.from({ length: vertexCount }).forEach((_, col) => {
      if (originalConnectionMatrix[row][col] !== largeArbitraryValue &&
          originalConnectionMatrix[row][col] !== shortestPathMatrix[row][col]) {
        superfluousEdgeCounter++;
      }
    });
  });

  const presentFinalResult = (value) => console.log(value);
  presentFinalResult(superfluousEdgeCounter / 2);
};

orchestrateComputation();