(function (dataSource) {
  var linesArray = dataSource.split('\n');
  var elementCount = linesArray.shift();
  var dataElements = linesArray.slice(0, elementCount);
  var swapOperations = 0;

  var gapSequence = [];
  var loopVar = 0;
  // This loop calculates a decreasing sequence of gap values.
  for (;; ++loopVar) {
    var currentGapValue = Math.pow(2, loopVar);
    if (currentGapValue > dataElements.length) {
      break;
    }
    gapSequence.unshift(currentGapValue);
  }

  // Invoke the primary sorting function.
  shellSortAlgorithm(dataElements, gapSequence);

  // Display the results.
  console.log(gapSequence.length);
  console.log(gapSequence.join(' '));
  console.log(swapOperations);
  console.log(dataElements.join('\n'));

  /**
   * Implements the Shell Sort algorithm, using a series of gapped insertion sorts.
   * @param {Array<string>} collection - The array of string elements to sort.
   * @param {Array<number>} gaps - The predefined sequence of gap values.
   */
  function shellSortAlgorithm(collection, gaps) {
    // Iterate through each gap in the sequence, from largest to smallest.
    for (var k = 0; k < gaps.length; k++) {
      insertionSortWithGap(collection, gaps[k]);
    }

    /**
     * Performs an insertion sort on a sub-array defined by a specific gap.
     * This function is a key component of the Shell Sort process.
     * @param {Array<string>} items - The array currently being sorted.
     * @param {number} currentGap - The interval between compared elements.
     */
    function insertionSortWithGap(items, currentGap) {
      // Begin iterating from the 'currentGap'-th element.
      for (var sortIndex = currentGap; sortIndex < items.length; sortIndex += currentGap) {
        var valueToInsert = items[sortIndex];
        var compareIndex = sortIndex - currentGap;

        // Shift elements that are larger than 'valueToInsert' to the right.
        while (compareIndex >= 0 && items[compareIndex] > valueToInsert) {
          items[compareIndex + currentGap] = items[compareIndex];
          compareIndex -= currentGap;
          swapOperations++; // Increment the global counter for element movements/comparisons.
        }
        items[compareIndex + currentGap] = valueToInsert; // Place the stored value into its sorted position.
      }
    }
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));