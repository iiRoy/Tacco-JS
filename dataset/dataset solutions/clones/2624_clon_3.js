const DATA_PARSER_FACTORY = (function() {
  const convertToNumber = (value) => +value;

  class InputParser {
    constructor(rawInputString) {
      this._lines = rawInputString.trim().split("\n");
      this._currentLineIndex = 0;
    }

    readNextValue(returnAsString = false) {
      const currentLineSegments = this._lines;
      const linePosition = this._currentLineIndex;
      let extractedSegment;

      if (typeof currentLineSegments[linePosition] === "string") {
        currentLineSegments[linePosition] = currentLineSegments[linePosition].split(" ").reverse();
      }

      extractedSegment = currentLineSegments[linePosition].pop();

      if (!currentLineSegments[linePosition].length) {
        this._currentLineIndex++;
      }

      return returnAsString ? extractedSegment : convertToNumber(extractedSegment);
    }

    readLine(returnStrings = false) {
      const lineContent = this._lines[this._currentLineIndex++];
      const lineParts = lineContent.split(" ");
      return returnStrings ? lineParts : lineParts.map(convertToNumber);
    }

    readMatrix(numberOfRows, returnStringMatrix = false) {
      const startIndex = this._currentLineIndex;
      const endIndex = startIndex + numberOfRows;
      const rawMatrixRows = this._lines.slice(startIndex, endIndex);
      this._currentLineIndex = endIndex;

      const parsedMatrix = rawMatrixRows.map(rowString => rowString.split(" "));
      return returnStringMatrix ? parsedMatrix : parsedMatrix.map(row => row.map(convertToNumber));
    }

    readRows(count, asStrings = false) {
      const startIndex = this._currentLineIndex;
      const endIndex = startIndex + count;
      const selectedRows = this._lines.slice(startIndex, endIndex);
      this._currentLineIndex = endIndex;

      return asStrings ? selectedRows : selectedRows.map(convertToNumber);
    }
  }

  function createParserInstance(inputString) {
    return new InputParser(inputString);
  }

  return createParserInstance;
})();

const inputReader = DATA_PARSER_FACTORY(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeMultiDimArray(initialValueExpression) {
  const dimensions = arguments;
  let dimensionCount = dimensions.length;
  let arrayCreationCode = `Array(dimensions[${--dimensionCount}]).fill(0).map(x=>{return ${initialValueExpression};})`;
  while (--dimensionCount) {
    arrayCreationCode = `Array(dimensions[${dimensionCount}]).fill(0).map(x=>${arrayCreationCode})`;
  }
  return eval(arrayCreationCode);
}

function calculateTrailingZeroCount(firstVal, secondVal) {
  let currentTrailingZeroes = 1;
  let xorResult = firstVal ^ secondVal;
  while (xorResult % 2 === 0) {
    xorResult >>= 1;
    currentTrailingZeroes++;
  }
  return currentTrailingZeroes;
}

console.log(processInputAndCompute());

function processInputAndCompute() {
  const numElements = inputReader.readNextValue();

  if (numElements <= 0) {
    return "";
  }

  const resultMatrix = initializeMultiDimArray("[]", numElements - 1);

  for (let outerIndex = 0; outerIndex < numElements; outerIndex++) {
    for (let innerIndex = outerIndex + 1; innerIndex < numElements; innerIndex++) {
      const targetColumnIndex = innerIndex - outerIndex - 1;
      const computedValue = calculateTrailingZeroCount(outerIndex, innerIndex);
      resultMatrix[outerIndex][targetColumnIndex] = computedValue;
    }
  }

  const formattedRows = resultMatrix.map(row => row.join(" "));
  const finalOutputString = formattedRows.join("\n");

  return finalOutputString;
}
