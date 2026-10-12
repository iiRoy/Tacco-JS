const createInputParser = (function () {
  class InputReader {
    constructor(inputString) {
      this._sourceLines = inputString.trim().split("\n");
      this._currentLineIndex = 0;
    }

    readAtom(returnAsString = false) {
      if (typeof this._sourceLines[this._currentLineIndex] === "string") {
        this._sourceLines[this._currentLineIndex] = this._sourceLines[this._currentLineIndex].split(" ").reverse();
      }
      const value = this._sourceLines[this._currentLineIndex].pop();
      if (this._sourceLines[this._currentLineIndex].length === 0) {
        this._currentLineIndex++;
      }
      return returnAsString ? value : +value;
    }

    readLine(returnAsStringArray = false) {
      const lineParts = this._sourceLines[this._currentLineIndex++].split(" ");
      return returnAsStringArray ? lineParts : lineParts.map(val => +val);
    }

    readMatrix(numLines, returnAsStringMatrix = false) {
      const matrix = [];
      for (let i = 0; i < numLines; i++) {
        const lineParts = this._sourceLines[this._currentLineIndex++].split(" ");
        matrix.push(returnAsStringMatrix ? lineParts : lineParts.map(val => +val));
      }
      return matrix;
    }

    readRows(numLines, returnAsStringRows = false) {
      const rows = [];
      for (let i = 0; i < numLines; i++) {
        const rowContent = this._sourceLines[this._currentLineIndex++];
        rows.push(returnAsStringRows ? rowContent : +rowContent);
      }
      return rows;
    }
  }
  return (inputString) => new InputReader(inputString);
})();

function createMultiDimensionalArray(dimensions, initialValue) {
  if (!Array.isArray(dimensions) || dimensions.length === 0) {
    throw new Error("Dimensions must be a non-empty array.");
  }

  function recursiveArrayBuilder(currentDimIndex) {
    if (currentDimIndex === dimensions.length - 1) {
      return Array(dimensions[currentDimIndex]).fill(initialValue);
    } else {
      return Array(dimensions[currentDimIndex]).fill(0).map(() => recursiveArrayBuilder(currentDimIndex + 1));
    }
  }

  return recursiveArrayBuilder(0);
}

const inputReader = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

const LARGE_NUMBER_FOR_MIN = 900000000;

console.log(processMainLogic());

function processMainLogic() {
  const sequenceLength = inputReader.readAtom();
  const charSequence = inputReader.readAtom(true);

  let minChangesRequired = LARGE_NUMBER_FOR_MIN;

  const prefixHashCounts = createMultiDimensionalArray([sequenceLength + 1], 0);
  const suffixDotCounts = createMultiDimensionalArray([sequenceLength + 1], 0);

  for (let idx = 0; idx < sequenceLength; idx++) {
    prefixHashCounts[idx + 1] = prefixHashCounts[idx] + (charSequence[idx] === "#" ? 1 : 0);
  }

  for (let idx = sequenceLength - 1; idx >= 0; idx--) {
    suffixDotCounts[idx] = suffixDotCounts[idx + 1] + (charSequence[idx] === "." ? 1 : 0);
  }

  for (let idx = 0; idx <= sequenceLength; idx++) {
    const currentChanges = prefixHashCounts[idx] + suffixDotCounts[idx];
    minChangesRequired = Math.min(minChangesRequired, currentChanges);
  }

  return minChangesRequired;
}
