const STANDARD_INPUT_FILE_PATH = "/dev/stdin";
const OUT_OF_BOUNDS_ERROR_MESSAGE = "ArrayIndexOutOfBoundsException: No more input lines available.";

var inputReaderInstance = createInputReader();

executeGraphAlgorithm();

function readNextInteger() { return processInputLine(getLineFromReader(), 1); }
function readNextStringArray() { return processInputLine(getLineFromReader(), 2); }
function readNextIntegerArray() { return processInputLine(getLineFromReader(), 4); }
function readNextCharacterArray() { return processInputLine(getLineFromReader(), 6); }
function getLineFromReader() { return inputReaderInstance.retrieveNext(); }
function hasMoreInputLines() { return inputReaderInstance.canReadNext(); }

function fetchStandardInputLines() {
  return require("fs").readFileSync(STANDARD_INPUT_FILE_PATH, "utf8").trim().split("\n");
}

function createInputReader() {
  const allInputLines = fetchStandardInputLines();
  let currentLinePointer = 0;
  const totalAvailableLines = allInputLines.length;

  return {
    canReadNext: function() {
      return (currentLinePointer < totalAvailableLines);
    },
    retrieveNext: function() {
      if (!this.canReadNext()) {
        throw OUT_OF_BOUNDS_ERROR_MESSAGE;
      }
      const lineToReturn = allInputLines[currentLinePointer];
      currentLinePointer++;
      return lineToReturn;
    }
  };
}

function outputMessage(msg) { console.log(msg); }
function errorMessage(msg) { console.error(msg); }

const stringToNumber = (str) => Number(str);

function processInputLine(value, type) {
  try {
    switch (type) {
      case 1: return parseInt(value, 10);
      case 2: return value.split(" ");
      case 4: return value.split(" ").map(stringToNumber);
      case 6: return value.split("");
      case 7: return value.split("").map(stringToNumber);
      case 8: return value.join(" ");
      case 9: return value.join("\n");
      case 0: return value.join("");
      default: return value;
    }
  } catch (error) {
    return value;
  }
}

function calculateInitialPathSum(matrix, size) {
  let currentTotal = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      currentTotal += matrix[r][c];
    }
  }
  return currentTotal / 2;
}

function findRedundantPaths(matrix, size) {
  let redundantSum = 0;
  for (let k_node = 0; k_node < size; k_node++) {
    for (let i_node = 0; i_node < size; i_node++) {
      for (let j_node = 0; j_node < size; j_node++) {
        const directEdgeWeight = matrix[i_node][j_node];
        const pathThroughK = matrix[i_node][k_node] + matrix[k_node][j_node];

        if (directEdgeWeight > pathThroughK) {
          outputMessage(-1);
          return null;
        } else if (directEdgeWeight === pathThroughK && i_node !== k_node && j_node !== k_node) {
          redundantSum += directEdgeWeight;
        }
      }
    }
  }
  return redundantSum / 2;
}

function executeGraphAlgorithm() {
  const numberOfNodes = readNextInteger();
  const adjacencyMatrix = new Array(numberOfNodes);

  for (let r = 0; r < numberOfNodes; r++) {
    adjacencyMatrix[r] = readNextIntegerArray();
  }

  const initialTotalPathSum = calculateInitialPathSum(adjacencyMatrix, numberOfNodes);
  const redundantPathsSum = findRedundantPaths(adjacencyMatrix, numberOfNodes);

  if (redundantPathsSum !== null) {
    outputMessage(initialTotalPathSum - redundantPathsSum);
  }
}
