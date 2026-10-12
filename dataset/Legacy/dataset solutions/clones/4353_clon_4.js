class InputHandler {
  #sourceLines;
  #currentLineIndex;
  #maxLines;

  constructor(inputContent) {
    this.#sourceLines = inputContent.trim().split("\n");
    this.#currentLineIndex = 0;
    this.#maxLines = this.#sourceLines.length;
  }

  hasMoreData() {
    return this.#currentLineIndex < this.#maxLines;
  }

  retrieveNextLine() {
    if (!this.hasMoreData()) {
      throw new Error("EndOfInputException: No more lines to read.");
    }
    const currentLine = this.#sourceLines[this.#currentLineIndex];
    this.#currentLineIndex++;
    return currentLine;
  }
}

const dataConverter = (inputValue, conversionType) => {
  const conversionStrategies = new Map([
    [1, (val) => parseInt(val, 10)],
    [2, (val) => val.split(" ")],
    [4, (val) => val.split(" ").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
    [8, (val) => val.join(" ")],
    [9, (val) => val.join("\n")],
    [0, (val) => val.join("")],
  ]);

  try {
    const strategy = conversionStrategies.get(conversionType);
    return strategy ? strategy(inputValue) : inputValue;
  } catch (e) {
    return inputValue;
  }
};

const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
const inputProcessor = new InputHandler(rawInput);

const fetchInteger = () => dataConverter(inputProcessor.retrieveNextLine(), 1);
const fetchIntegerArray = () => dataConverter(inputProcessor.retrieveNextLine(), 4);

const emitResult = (content) => console.log(content);
const emitDiagnostic = (content) => console.error(content);

const executeAlgorithm = () => {
  const matrixDimension = fetchInteger();
  const adjacencyMatrix = Array.from({ length: matrixDimension }, () => fetchIntegerArray());

  let totalPathSum = adjacencyMatrix.flat().reduce((accumulator, value) => accumulator + value, 0);
  emitDiagnostic(totalPathSum);

  totalPathSum /= 2;

  let redundantPathSum = 0;
  const processedEdges = new Set();
  let earlyExitTriggered = false;

  Array.from({ length: matrixDimension }, (_, intermediateNode) => intermediateNode).forEach(intermediateNode => {
    Array.from({ length: matrixDimension }, (_, sourceNode) => sourceNode).forEach(destinationNode => {
      Array.from({ length: matrixDimension }, (_, targetNode) => targetNode).forEach(pathNode => {
        if (earlyExitTriggered) return;

        const directPath = adjacencyMatrix[destinationNode][pathNode];
        const indirectPath = adjacencyMatrix[destinationNode][intermediateNode] + adjacencyMatrix[intermediateNode][pathNode];

        if (directPath > indirectPath) {
          emitResult(-1);
          earlyExitTriggered = true;
          return;
        } else if (directPath === indirectPath && destinationNode !== intermediateNode && pathNode !== intermediateNode) {
          const edgeIdentifier = `${Math.min(destinationNode, pathNode)}:${Math.max(destinationNode, pathNode)}`;

          if (!processedEdges.has(edgeIdentifier)) {
            redundantPathSum += directPath;
            processedEdges.add(edgeIdentifier);
          }
        }
      });
    });
  });

  if (earlyExitTriggered) {
    return;
  }

  emitDiagnostic(redundantPathSum);
  emitResult(totalPathSum - redundantPathSum);
};

executeAlgorithm();
