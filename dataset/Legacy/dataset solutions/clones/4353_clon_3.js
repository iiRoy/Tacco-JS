const STD_IN_FILE_PATH = "/dev/stdin";
const OUT_OF_BOUNDS_ERROR_MSG = "ArrayIndexOutOfBoundsException これ以上ないよ";

var inputReader = createInputReader();
processMainLogic();

function getRawInputLines() {
  return require("fs").readFileSync(STD_IN_FILE_PATH, "utf8").trim().split("\n");
}

function createInputReader() {
  const allInputLines = getRawInputLines();
  let currentLineIndex = 0;
  const totalLines = allInputLines.length;

  const readerMethods = {
    hasMore: function() {
      return currentLineIndex < totalLines;
    },
    readNext: function() {
      if (!this.hasMore()) {
        throw OUT_OF_BOUNDS_ERROR_MSG;
      }
      const lineContent = allInputLines[currentLineIndex];
      currentLineIndex++;
      return lineContent;
    }
  };

  return readerMethods;
}

function readNextInteger() { return processConversion(inputReader.readNext(), 1); }
function readNextStringArray() { return processConversion(inputReader.readNext(), 2); }
function readNextIntegerArray() { return processConversion(inputReader.readNext(), 4); }
function readNextCharacterArray() { return processConversion(inputReader.readNext(), 6); }

function printResult(data) { console.log(data); }
function printDebug(data) { console.error(data); }

function processConversion(value, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(value);
      case 2: return value.split(" ");
      case 4: return value.split(" ").map(numStr => Number(numStr));
      case 6: return value.split("");
      case 7: return value.split("").map(charStr => Number(charStr));
      case 8: return value.join(" ");
      case 9: return value.join("\n");
      case 0: return value.join("");
      default: return value;
    }
  } catch (error) {
    return value;
  }
}

function generateSortedPairKey(idxA, idxB) {
  const minIdx = Math.min(idxA, idxB);
  const maxIdx = Math.max(idxA, idxB);
  return `${minIdx}:${maxIdx}`;
}

function processMainLogic() {
  const dimension = readNextInteger();
  const distanceMatrix = new Array(dimension);

  for (let r = 0; r < dimension; r++) {
    distanceMatrix[r] = readNextIntegerArray();
  }

  let totalMatrixSum = 0;
  for (let r = 0; r < dimension; r++) {
    for (let c = 0; c < dimension; c++) {
      totalMatrixSum += distanceMatrix[r][c];
    }
  }
  printDebug(totalMatrixSum);
  totalMatrixSum /= 2;

  let sumOfRedundantPaths = 0;
  const identifiedRedundantPairs = new Set();

  for (let k_intermediate = 0; k_intermediate < dimension; k_intermediate++) {
    for (let i_start = 0; i_start < dimension; i_start++) {
      for (let j_end = 0; j_end < dimension; j_end++) {
        const directPathValue = distanceMatrix[i_start][j_end];
        const indirectPathValue = distanceMatrix[i_start][k_intermediate] + distanceMatrix[k_intermediate][j_end];

        if (directPathValue > indirectPathValue) {
          printResult(-1);
          return;
        } else if (directPathValue === indirectPathValue && i_start !== k_intermediate && j_end !== k_intermediate) {
          const currentPairKey = generateSortedPairKey(i_start, j_end);
          if (!identifiedRedundantPairs.has(currentPairKey)) {
            sumOfRedundantPaths += directPathValue;
            identifiedRedundantPairs.add(currentPairKey);
          }
        }
      }
    }
  }

  printDebug(sumOfRedundantPaths);
  printResult(totalMatrixSum - sumOfRedundantPaths);
}
