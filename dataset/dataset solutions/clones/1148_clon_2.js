class EditDistanceProcessor {
  // Verification reference: http://judge.u-aizu.ac.jp/onlinejudge/review.jsp?rid=4313161#1
  /**
   * Dynamic programming matrix for edit distance calculation.
   * _costGrid[rowIdx][colIdx]: The minimum edit cost when considering
   * the first 'rowIdx' characters of the source and 'colIdx' characters of the target.
   */

  constructor ( referenceString ) {
    this._costGrid = [ [ ...Array(referenceString.length + 1) ].map( ( _item, indexValue ) => indexValue ) ];
    this._tracePath = [ [ ...Array(referenceString.length + 1) ].map( ( _item, indexValue ) => [ 0, indexValue - 1 ] ) ];
    this._tracePath[0][0] = [ -1, -1 ]; // Sentinel indicating no predecessor
    this._targetSequence = referenceString.split("");
    this._sourceSequence = [];
  }


  /**
   * Appends a new segment to the source sequence from a given insertion point,
   * recalculating the relevant parts of the DP table.
   * Time complexity: O(|target_length| * |new_segment_length|)
   * @param {Number} insertionPoint - The index in the source sequence where the new segment begins.
   * @param {String} newSegmentText - The string segment to append.
   */
  extendSourceSegment( insertionPoint, newSegmentText ) {
    if ( insertionPoint > this._sourceSequence.length ) {
      throw new Error("The specified insertion point is beyond the current length of the source sequence.");
    }
    this._sourceSequence.length = insertionPoint;
    this._sourceSequence.push( ...newSegmentText.split("") );

    this._costGrid.length = insertionPoint + 1;

    for ( let rowIterator = this._costGrid.length; rowIterator < this._sourceSequence.length + 1; rowIterator++ ) {
      this._costGrid[rowIterator] = [ ...Array(this._targetSequence.length + 1) ].map( () => Number.POSITIVE_INFINITY );
      this._costGrid[rowIterator][0] = rowIterator;

      this._tracePath[rowIterator] = [ ...Array(this._targetSequence.length + 1) ].map( () => [ -1, -1 ] );
      this._tracePath[rowIterator][0] = [ rowIterator - 1, 0 ];

      for ( let colIterator = 1; colIterator < this._targetSequence.length + 1; colIterator++ ) {
        // Evaluate substitution/match operation
        this._updateCostValue({
          currentR: rowIterator,
          currentC: colIterator,
          priorR: rowIterator - 1,
          priorC: colIterator - 1,
          operationCost: this._sourceSequence[rowIterator - 1] === this._targetSequence[colIterator - 1] ? 0 : 1
        });
        // Evaluate insertion into source (deletion from target)
        this._updateCostValue({ currentR: rowIterator, currentC: colIterator, priorR: rowIterator, priorC: colIterator - 1, operationCost: 1 });
        // Evaluate deletion from source (insertion into target)
        this._updateCostValue({ currentR: rowIterator, currentC: colIterator, priorR: rowIterator - 1, priorC: colIterator, operationCost: 1 });
      }
    }
  }

  _updateCostValue( cellData ) {
    const { currentR, currentC, priorR, priorC, operationCost } = cellData;
    if ( this._costGrid[priorR][priorC] + operationCost < this._costGrid[currentR][currentC] ) {
      this._costGrid[currentR][currentC] = this._costGrid[priorR][priorC] + operationCost;
      this._tracePath[currentR][currentC] = [ priorR, priorC ];
    }
  }

  /**
   * Traces back through the DP path to identify matching characters between the source and target.
   * Returns boolean arrays indicating which characters are part of a 'match' (zero-cost transition).
   * Time complexity: O(|source_length| + |target_length|)
   * @returns {Object} An object containing 'source' and 'target' boolean arrays.
   */
  generateMatchIndicators() {
    const sourceFlags = [ ...Array(this._sourceSequence.length) ].map( () => false );
    const targetFlags = [ ...Array(this._targetSequence.length) ].map( () => false );

    let currentR = this._sourceSequence.length;
    let currentC = this._targetSequence.length;

    while ( currentR > 0 || currentC > 0 ) {
      const [ nextR, nextC ] = this._tracePath[currentR][currentC];
      // If the cost remains the same, it implies a match or a series of zero-cost operations
      if ( this._costGrid[nextR][nextC] === this._costGrid[currentR][currentC] ) {
        for ( let iter = nextR; iter < currentR; iter++ ) sourceFlags[iter] = true;
        for ( let iter = nextC; iter < currentC; iter++ ) targetFlags[iter] = true;
      }
      [ currentR, currentC ] = [ nextR, nextC ];
    }
    return { source: sourceFlags, target: targetFlags };
  }

  get finalCostGrid() {
    return this._costGrid;
  }
}

const executeDistanceCalculation = inputStringData => {
  const [ referenceText, currentInput ] = inputStringData.split("\n");
  const distanceCalc = new EditDistanceProcessor(referenceText);
  distanceCalc.extendSourceSegment(0, currentInput);
  console.log(distanceCalc.finalCostGrid[currentInput.length][referenceText.length]);
};
// Process standard input
executeDistanceCalculation( require("fs").readFileSync("/dev/stdin", "utf8") );