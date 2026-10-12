class EditDistanceCalculator {
  constructor(targetStr) {
    this._targetWordChars = targetStr.split("");
    this._currentInputChars = [];
    this._dpMatrix = [];
    this._pathTracker = [];
    this._initializeBaseMatrices(targetStr.length);
  }

  _initializeBaseMatrices(targetLength) {
    const initialRowSize = targetLength + 1;
    // Initialize the first row of the DP matrix with costs for deletions
    this._dpMatrix.push(Array.from({ length: initialRowSize }, (_, i) => i));

    // Initialize the first row of the path tracker for deletions
    this._pathTracker.push(Array.from({ length: initialRowSize }, (_, i) => [0, i - 1]));
    this._pathTracker[0][0] = [-1, -1]; // Base case: no previous cell
  }

  /**
   * Updates the input string from a given start index with a new suffix.
   * This recalculates the relevant parts of the DP table.
   * @param {Number} startIndex - The index in the current input from which to apply the suffix.
   * @param {String} newSuffixStr - The new suffix to append.
   */
  updateInputSuffix(startIndex, newSuffixStr) {
    if (startIndex < 0) {
      throw new Error("開始インデックスは負の値にできません");
    }
    if (startIndex > this._currentInputChars.length) {
      throw new Error("入力の長さより後ろの位置が指定されました");
    }

    // Reconstruct the _currentInputChars array
    const suffixChars = newSuffixStr.split("");
    this._currentInputChars = this._currentInputChars.slice(0, startIndex).concat(suffixChars);

    const currentInputLength = this._currentInputChars.length;
    const targetWordLengthPlusOne = this._targetWordChars.length + 1;

    // Ensure DP matrices have enough rows for the new input length
    this._ensureMatrixCapacity(currentInputLength, targetWordLengthPlusOne);

    // Iterate through the rows that need recalculation (from startIndex + 1 up to the new input length)
    for (let rowIdx = startIndex + 1; rowIdx <= currentInputLength; rowIdx++) {
      // Initialize the first column of the current row (cost for deleting all input chars)
      this._dpMatrix[rowIdx][0] = rowIdx;
      this._pathTracker[rowIdx][0] = [rowIdx - 1, 0]; // Path for deletion

      // Fill the rest of the cells in the current row
      for (let colIdx = 1; colIdx < targetWordLengthPlusOne; colIdx++) {
        this._calculateCellMinDistance(rowIdx, colIdx);
      }
    }
  }

  _ensureMatrixCapacity(requiredRows, targetWordLengthPlusOne) {
    const currentRows = this._dpMatrix.length;
    for (let r = currentRows; r <= requiredRows; r++) {
      this._dpMatrix[r] = Array.from({ length: targetWordLengthPlusOne }, () => Infinity);
      this._pathTracker[r] = Array.from({ length: targetWordLengthPlusOne }, () => [-1, -1]);
    }
  }

  _calculateCellMinDistance(rowIdx, colIdx) {
    // Option 1: Match or Mismatch (diagonal transition)
    const matchCost = (this._currentInputChars[rowIdx - 1] === this._targetWordChars[colIdx - 1]) ? 0 : 1;
    this._applyDpTransition({
      rowIdx,
      colIdx,
      prevRow: rowIdx - 1,
      prevCol: colIdx - 1,
      transitionCost: matchCost
    });

    // Option 2: Insertion (horizontal transition from left)
    this._applyDpTransition({
      rowIdx,
      colIdx,
      prevRow: rowIdx,
      prevCol: colIdx - 1,
      transitionCost: 1
    });

    // Option 3: Deletion (vertical transition from top)
    this._applyDpTransition({
      rowIdx,
    colIdx,
      prevRow: rowIdx - 1,
      prevCol: colIdx,
      transitionCost: 1
    });
  }

  _applyDpTransition(dpUpdateParams) {
    const { rowIdx, colIdx, prevRow, prevCol, transitionCost } = dpUpdateParams;
    const potentialNewDistance = this._dpMatrix[prevRow][prevCol] + transitionCost;

    if (potentialNewDistance < this._dpMatrix[rowIdx][colIdx]) {
      this._dpMatrix[rowIdx][colIdx] = potentialNewDistance;
      this._pathTracker[rowIdx][colIdx] = [prevRow, prevCol];
    }
  }

  /**
   * Traces back through the DP table to identify matching characters.
   * Returns two boolean arrays indicating which characters in the input and target
   * were part of a "match" (zero-cost transition).
   */
  buildCorrections() {
    const inputLength = this._currentInputChars.length;
    const targetLength = this._targetWordChars.length;
    const inputMatchFlags = Array.from({ length: inputLength }, () => false);
    const targetMatchFlags = Array.from({ length: targetLength }, () => false);

    let currentRow = inputLength;
    let currentCol = targetLength;

    while (currentRow > 0 || currentCol > 0) {
      let [prevRow, prevCol] = this._pathTracker[currentRow][currentCol];

      // If the distance did not increase, it means a match or a no-cost operation occurred.
      if (this._dpMatrix[prevRow][prevCol] === this._dpMatrix[currentRow][currentCol]) {
        this._markCorrectionPath(inputMatchFlags, targetMatchFlags, prevRow, currentRow, prevCol, currentCol);
      }
      currentRow = prevRow;
      currentCol = prevCol;
    }
    return { input: inputMatchFlags, word: targetMatchFlags };
  }

  _markCorrectionPath(inputFlags, targetFlags, startInput, endInput, startTarget, endTarget) {
    for (let i = startInput; i < endInput; i++) {
      inputFlags[i] = true;
    }
    for (let i = startTarget; i < endTarget; i++) {
      targetFlags[i] = true;
    }
  }

  get distanceMatrix() {
    return this._dpMatrix;
  }
}

const processInputAndCalculate = inputData => {
  const lines = inputData.split("\n");
  const targetWord = lines[0];
  const currentInput = lines[1];

  const distanceCalc = new EditDistanceCalculator(targetWord);
  distanceCalc.updateInputSuffix(0, currentInput);

  const finalInputLength = currentInput.length;
  const finalTargetLength = targetWord.length;

  console.log(distanceCalc.distanceMatrix[finalInputLength][finalTargetLength]);
};

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
