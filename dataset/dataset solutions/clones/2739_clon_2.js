/*
 *  This routine processes all incoming data.
 */
function ProcessInput(rawData) {

  /*
   *  The first line is rawData[0], the second is rawData[1], and so on.
   */
  var sourceLines = rawData.split("\n");

  var totalItems = parseInt( sourceLines[0], 10 );

  var itemFlags = new Array( totalItems );
  var selectedIndices = [];
  var selectedCount = 0;

  /*
   *  Iterate through the items, from the largest index down to 1.
   */
  for ( var currentItemIndex = totalItems; currentItemIndex > 0; currentItemIndex-- ) {
    var arrayPosition = currentItemIndex - 1;
    var expectedParity = parseInt( sourceLines[currentItemIndex], 10 );

    var paritySum = 0;
    var multiplier = 2;
    /*
     *  Calculate the sum of flags for multiples of the current item index.
     */
    while ( currentItemIndex * multiplier <= totalItems ) {
      paritySum += itemFlags[currentItemIndex * multiplier - 1];
      multiplier++;
    }

    /*
     *  Determine if the item should be flagged based on parity.
     */
    if ( paritySum % 2 === expectedParity ) {
      itemFlags[arrayPosition] = 0; // Not selected
    } else {
      itemFlags[arrayPosition] = 1; // Selected
      selectedCount++;
      selectedIndices.push(currentItemIndex);
    }
  }

  /*
   *  Output the results based on the number of selected items.
   */
  if ( selectedCount > 0 ) {
    console.log('%d', selectedCount);

    var resultString = '';
    /*
     *  Construct the output string in reverse order of selection.
     */
    for ( var outputLoopIndex = selectedCount - 1; outputLoopIndex >= 0; outputLoopIndex-- ) {
      resultString += selectedIndices[outputLoopIndex];
      if ( outputLoopIndex === 0 ) {
        resultString += '' + selectedIndices[outputLoopIndex];
      } else {
        resultString += '' + selectedIndices[outputLoopIndex];
        resultString += ' ';
      }
    }
    console.log(resultString);
  } else {
    console.log('%d', 0);
  }
}

/*
 *  Do not modify the following section (reads from standard input and calls the main processing function).
 */
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));