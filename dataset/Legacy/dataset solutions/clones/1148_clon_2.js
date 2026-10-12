class StringSimilarityCalculator {
  // This class computes the Levenshtein distance between two strings.
  // Verification: http://judge.u-aizu.ac.jp/onlinejudge/review.jsp?rid=4313161#1

  /**
   * Dynamic programming table for edit distance.
   * _dpTable[rowIdx][colIdx]: The edit distance considering the first 'rowIdx' characters
   * of the source string and the first 'colIdx' characters of the target string.
   */

  constructor(targetStr) {
    this._dpTable = [[...Array(targetStr.length + 1)].map((_, index) => index)];
    this._pathTracker = [[...Array(targetStr.length + 1)].map((_, index) => [0, index - 1])];
    this._pathTracker[0][0] = [-1, -1];
    this._targetChars = targetStr.split("");
    this._sourceChars = [];
  }

  /**
   * Replaces the source string from 'startIndex' onwards with 'newSegment'.
   * Time complexity: O(|targetString| * |newSegment|)
   * @param {Number} startIndex The index from which to update the source string.
   * @param {String} newSegment The new suffix to append.
   */
  updateSourceSuffix(startIndex, newSegment) {
    if (startIndex > this._sourceChars.length) {
      throw new Error("入力の長さより後ろの位置が指定されました"); // Preserve error message
    }
    this._sourceChars.length = startIndex;
    this._sourceChars.push(...newSegment.split(""));

    this._dpTable.length = startIndex + 1;
    for (let rowIdx = this._dpTable.length; rowIdx < this._sourceChars.length + 1; rowIdx++) {
      this._dpTable[rowIdx] = [...Array(this._targetChars.length + 1)].map(() => Infinity);
      this._dpTable[rowIdx][0] = rowIdx;
      this._pathTracker[rowIdx] = [...Array(this._targetChars.length + 1)].map(() => [-1, -1]);
      this._pathTracker[rowIdx][0] = [rowIdx - 1, 0];

      for (let colIdx = 1; colIdx < this._targetChars.length + 1; colIdx++) {
        // Match/Mismatch operation
        this._applyDpUpdate({
          currRow: rowIdx,
          currCol: colIdx,
          prevRow: rowIdx - 1,
          prevCol: colIdx - 1,
          transitionCost: this._sourceChars[rowIdx - 1] === this._targetChars[colIdx - 1] ? 0 : 1
        });
        // Insertion operation
        this._applyDpUpdate({ currRow: rowIdx, currCol: colIdx, prevRow: rowIdx, prevCol: colIdx - 1, transitionCost: 1 });
        // Deletion operation
        this._applyDpUpdate({ currRow: rowIdx, currCol: colIdx, prevRow: rowIdx - 1, prevCol: colIdx, transitionCost: 1 });
      }
    }
  }

  _applyDpUpdate(cellInfo) {
    const { currRow, currCol, prevRow, prevCol, transitionCost } = cellInfo;
    if (this._dpTable[prevRow][prevCol] + transitionCost < this._dpTable[currRow][currCol]) {
      this._dpTable[currRow][currCol] = this._dpTable[prevRow][prevCol] + transitionCost;
      this._pathTracker[currRow][currCol] = [prevRow, prevCol];
    }
  }

  /**
   * Constructs arrays indicating which characters in the source and target strings
   * are part of a "correct" match (zero-cost transition).
   * Time complexity: O(|sourceString| + |targetString|)
   */
  generateMatchFlags() {
    const sourceMatchFlags = [...Array(this._sourceChars.length)].map(() => false);
    const targetMatchFlags = [...Array(this._targetChars.length)].map(() => false);
    let currRow = this._sourceChars.length;
    let currCol = this._targetChars.length;
    while (currRow > 0 || currCol > 0) {
      const [nextRow, nextCol] = this._pathTracker[currRow][currCol];
      // If the transition cost was zero, mark characters as correct
      if (this._dpTable[nextRow][nextCol] === this._dpTable[currRow][currCol]) {
        for (let i = nextRow; i < currRow; i++) sourceMatchFlags[i] = true;
        for (let i = nextCol; i < currCol; i++) targetMatchFlags[i] = true;
      }
      [currRow, currCol] = [nextRow, nextCol];
    }
    return { input: sourceMatchFlags, word: targetMatchFlags }; // Preserve object keys
  }

  get finalDistanceTable() {
    return this._dpTable;
  }
}

const calculateAndOutputDistance = (inputContent) => {
  const [targetString, sourceString] = inputContent.split("\n");
  const distanceProcessor = new StringSimilarityCalculator(targetString);
  distanceProcessor.updateSourceSuffix(0, sourceString);
  console.log(distanceProcessor.finalDistanceTable[sourceString.length][targetString.length]);
};
// Read from standard input
calculateAndOutputDistance(require("fs").readFileSync("/dev/stdin", "utf8"));
