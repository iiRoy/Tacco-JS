class InputReader {
  constructor(inputString) {
    this._sourceLines = inputString.split("\n");
    this._currentLineIndex = 0;
  }

  readNumber(returnAsString = false) {
    let currentLineSegments = this._sourceLines[this._currentLineIndex];

    if (typeof currentLineSegments === "string") {
      this._sourceLines[this._currentLineIndex] = currentLineSegments.split(" ").reverse();
    }

    const processedLineSegments = this._sourceLines[this._currentLineIndex];
    const extractedSegment = processedLineSegments.pop();

    if (!processedLineSegments.length) {
      this._currentLineIndex++;
    }

    return returnAsString ? extractedSegment : Number(extractedSegment);
  }

  readLineNumbers(returnAsStringArray = false) {
    const lineContent = this._sourceLines[this._currentLineIndex++];
    const segments = lineContent.split(" ");
    return returnAsStringArray ? segments : segments.map(Number);
  }

  readMatrix(numberOfRows, returnAsStringMatrix = false) {
    const matrixData = [];
    const startingLineIndex = this._currentLineIndex;

    const parseLineSegments = (lineString, asString) => {
      const parts = lineString.split(" ");
      return asString ? parts : parts.map(Number);
    };

    for (let i = 0; i < numberOfRows; i++) {
      matrixData.push(parseLineSegments(this._sourceLines[startingLineIndex + i], returnAsStringMatrix));
    }
    this._currentLineIndex += numberOfRows;
    return matrixData;
  }
}

const inputProcessor = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));
const moduloConstant = 1e9 + 7;

const safeAddMod = (val1, val2) => (val1 + val2) % moduloConstant;
const safeMultiplyMod = (val1, val2) => (val1 * val2) % moduloConstant;

function calculatePaths() {
  const gridHeight = inputProcessor.readNumber();
  const gridWidth = inputProcessor.readNumber();

  if (gridWidth === 1) {
    return 1;
  }

  const targetColumnIndex = inputProcessor.readNumber();

  const dynamicProgrammingTable = Array.from({ length: gridHeight + 1 }, () =>
    Array(gridWidth + 1).fill(0)
  );

  dynamicProgrammingTable[0][1] = 1;

  // This sequence represents combinations for paths, often related to Fibonacci numbers.
  // v[n] is F_{n+1} where F_0=0, F_1=1.
  const pathCombinations = [1, 1, 2, 3, 5, 8, 13, 21, 34]; // F_1 to F_9

  for (let currentRow = 1; currentRow <= gridHeight; currentRow++) {
    // Calculate for the first column (j=1)
    let valueForCol1 = safeMultiplyMod(dynamicProgrammingTable[currentRow - 1][1], pathCombinations[gridWidth - 1]);
    valueForCol1 = safeAddMod(valueForCol1, safeMultiplyMod(dynamicProgrammingTable[currentRow - 1][2], pathCombinations[gridWidth - 2]));
    dynamicProgrammingTable[currentRow][1] = valueForCol1;

    // Calculate for intermediate columns (j=2 to width-1)
    for (let currentColumn = 2; currentColumn < gridWidth; currentColumn++) {
      let currentColumnSum = 0;

      // Contribution from the left column (currentColumn - 1)
      let termFromLeft = safeMultiplyMod(dynamicProgrammingTable[currentRow - 1][currentColumn - 1], pathCombinations[currentColumn - 2]);
      termFromLeft = safeMultiplyMod(termFromLeft, pathCombinations[gridWidth - currentColumn]);
      currentColumnSum = safeAddMod(currentColumnSum, termFromLeft);

      // Contribution from the same column (currentColumn)
      let termFromSame = safeMultiplyMod(dynamicProgrammingTable[currentRow - 1][currentColumn], pathCombinations[currentColumn - 1]);
      termFromSame = safeMultiplyMod(termFromSame, pathCombinations[gridWidth - currentColumn]);
      currentColumnSum = safeAddMod(currentColumnSum, termFromSame);

      // Contribution from the right column (currentColumn + 1)
      let termFromRight = safeMultiplyMod(dynamicProgrammingTable[currentRow - 1][currentColumn + 1], pathCombinations[currentColumn - 1]);
      termFromRight = safeMultiplyMod(termFromRight, pathCombinations[gridWidth - currentColumn - 1]);
      currentColumnSum = safeAddMod(currentColumnSum, termFromRight);

      dynamicProgrammingTable[currentRow][currentColumn] = currentColumnSum;
    }

    // Calculate for the last column (j=width)
    let valueForColW = safeMultiplyMod(dynamicProgrammingTable[currentRow - 1][gridWidth - 1], pathCombinations[gridWidth - 2]);
    valueForColW = safeAddMod(valueForColW, safeMultiplyMod(dynamicProgrammingTable[currentRow - 1][gridWidth], pathCombinations[gridWidth - 1]));
    dynamicProgrammingTable[currentRow][gridWidth] = valueForColW;
  }

  return dynamicProgrammingTable[gridHeight][targetColumnIndex];
}

console.log(calculatePaths());
