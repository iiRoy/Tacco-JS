/*
 * This module provides a utility for parsing structured input data from a string.
 * It's designed to read values, lines, and matrices efficiently from a text source.
 */
var INPUT_PROCESSOR = ( function() {

  // This factory function creates a new handler for an input data stream.
  function createStreamHandler( textContent ) {
    return new DataStream( textContent );
  }


  // The DataStream constructor initializes a new input source.
  function DataStream( sourceData ) {
    // Splits the raw input string into an array of lines, removing leading/trailing whitespace.
    this._linesOfText = sourceData.trim().split( "\n" );
    // Initializes the current line index, indicating the next line to be read.
    this._currentLineIdx = 0;
  }


  // Prototype method to retrieve a single atomic value from the current line.
  // If the current line is still a single string, it's parsed into individual items.
  // It then extracts the last item (due to internal reversal) and advances the line index
  // if the current line becomes empty.
  // The 'returnAsString' flag determines if the value is returned as a string or a number.
  DataStream.prototype.fetchNextAtom = function( returnAsString ) {
    var lineSegments = this._linesOfText;      // Reference to the array of all input lines.
    var currentPosition = this._currentLineIdx; // The index of the current line being processed.
    var extractedItem;                          // Variable to hold the value pulled from the line.

    // If the current line at 'currentPosition' is still a single string,
    // it means it hasn't been split into segments yet.
    if ( typeof lineSegments[ currentPosition ] === "string" ) {
      // Split the line by spaces and reverse the array. This allows `pop()`
      // to effectively retrieve items from the "front" of the original line.
      lineSegments[ currentPosition ] = lineSegments[ currentPosition ].split( " " ).reverse();
    }

    // Extract the last item from the (potentially reversed) array of line segments.
    extractedItem = lineSegments[ currentPosition ].pop();

    // If, after popping, the current line's array of segments is empty,
    // increment the line index to move to the next line for subsequent reads.
    if ( !lineSegments[ currentPosition ].length ) {
      this._currentLineIdx++;
    }

    // Return the extracted item. If 'returnAsString' is true, return it as-is (string).
    // Otherwise, convert it to a number using `Number()`.
    return returnAsString ? extractedItem : Number( extractedItem );
  };


  // Prototype method to read an entire line of values and return them as an array.
  // This method automatically advances the line index after reading.
  // The 'keepOriginalTypes' flag determines if values are returned as strings or numbers.
  DataStream.prototype.fetchLineValues = function( keepOriginalTypes ) {
    // Retrieve the current line, split it into space-separated items, and then
    // increment the line index (`this._currentLineIdx++`) for the next read.
    var currentLineItems = this._linesOfText[ this._currentLineIdx++ ].split( " " );

    // Return the items. If 'keepOriginalTypes' is true, return the string array.
    // Otherwise, map each item string to its numeric representation using `Number()`.
    return keepOriginalTypes ? currentLineItems : currentLineItems.map( ( itemStr ) => Number( itemStr ) );
  };


  // Prototype method to read a block of 'rowsToRead' lines and parse them into a matrix (array of arrays).
  // Each line is split into space-separated values.
  // This method advances the line index by the number of rows read.
  // The 'asRawStrings' flag determines if values in the matrix are returned as strings or numbers.
  DataStream.prototype.fetchMatrixData = function( rowsToRead, asRawStrings ) {
    // Extract a slice of lines from the current position up to 'rowsToRead' lines.
    // The line index is updated by adding 'rowsToRead' to it.
    var matrixBlock = this._linesOfText
      .slice( this._currentLineIdx, ( this._currentLineIdx += rowsToRead ) )
      .map( ( singleLine ) => singleLine.split( " " ) ); // Map each line string to an array of its parts.

    // If 'asRawStrings' is true, return the matrix with string values.
    // Otherwise, perform a nested map to convert all inner cell values to numbers.
    return asRawStrings
      ? matrixBlock
      : matrixBlock.map( ( rowEntry ) => rowEntry.map( ( cellValue ) => Number( cellValue ) ) );
  };


  // Prototype method to read a specified 'count' of lines directly as an array of strings.
  // This advances the line index by 'count'.
  // The 'asLiteralStrings' flag controls whether the elements are returned as strings or numbers.
  DataStream.prototype.fetchRowSlice = function( count, asLiteralStrings ) {
    // Extract a slice of lines from the current position, advancing the line index.
    var rowCollection = this._linesOfText.slice( this._currentLineIdx, ( this._currentLineIdx += count ) );

    // Return the collection of rows. If 'asLiteralStrings' is true, return as strings.
    // Otherwise, convert each row value to a number.
    return asLiteralStrings ? rowCollection : rowCollection.map( ( rowValue ) => Number( rowValue ) );
  };

  return createStreamHandler; // The factory function is exposed as the public interface of the module.

} )(); // This is an Immediately-Invoked Function Expression (IIFE) for encapsulation.


// Initialize the input handler by reading all content from standard input (`/dev/stdin`).
var inputHandler = INPUT_PROCESSOR( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );


/**
 * Dynamically constructs and evaluates code to create a multi-dimensional array.
 * The array is filled with a specified initial value across all dimensions.
 * Example: createMultiDimArray(0, 2, 3) would result in a 2x3 array initialized with zeros.
 *
 * @param {*} initialValue The value to fill all elements of the array with.
 * @param {...number} dimensions A variable number of arguments representing the size of each dimension.
 * @returns {Array} The newly created and initialized multi-dimensional array.
 */
function createMultiDimArray( initialValue ) {
  var argumentsList = arguments;       // Capture all arguments passed to this function.
  var dimensionsCount = argumentsList.length; // Get the total number of dimensions specified.

  // Start building the string representation of the array creation from the innermost dimension.
  // The `--dimensionsCount` decrements the count before using it to access the last dimension.
  var arrayConstructionCode =
    "Array(argumentsList[" +
    --dimensionsCount +
    "]).fill(0).map((_placeholder) => { return " +
    initialValue +
    "; })";

  // Loop backwards through the remaining dimensions to wrap the inner array definition.
  // Each iteration adds another `Array().map()` layer around the existing `arrayConstructionCode`.
  while ( --dimensionsCount ) {
    arrayConstructionCode =
      "Array(argumentsList[" + dimensionsCount + "]).fill(0).map((_placeholder) => " + arrayConstructionCode + ")";
  }

  // Use `eval()` to execute the constructed string, creating the multi-dimensional array.
  return eval( arrayConstructionCode );
}


// The result of the main problem-solving function is printed to the console.
console.log( solveOptimizationProblem() );


/**
 * This is the primary function that orchestrates reading input, performing calculations,
 * and finding an optimal solution using a binary search approach.
 * It solves a problem related to allocating capacity among items to maximize/minimize a value.
 *
 * @returns {number} The calculated optimal value derived from the input data.
 */
function solveOptimizationProblem() {
  // Read the total number of distinct items (N) from the input.
  var numberOfItems = inputHandler.fetchNextAtom();
  // Read the maximum capacity (X) associated with each item or a general capacity unit.
  var itemCapacity = inputHandler.fetchNextAtom();

  // Read the detailed data for all items from the input.
  // 'itemDataMatrix' will be an array of arrays, where each inner array represents an item.
  // Assuming each item's data structure is [weight, value, cost_per_unit_over_capacity].
  var itemDataMatrix = inputHandler.fetchMatrixData( numberOfItems );

  // Initialize a variable to accumulate a total value, starting from zero.
  var currentTotalValue = 0;

  // First pass: Process each item to calculate its base value and add a new derived property.
  for ( var itemIndex = 0; itemIndex < numberOfItems; itemIndex++ ) {
    // Calculate the base value of the current item: weight * value.
    var baseItemValue = itemDataMatrix[ itemIndex ][ 0 ] * itemDataMatrix[ itemIndex ][ 1 ];
    // Add this base value to the running total.
    currentTotalValue += baseItemValue;

    // Add a new element to the current item's data array. This element represents
    // the penalty/cost incurred if 'itemCapacity' is not fully utilized,
    // calculated as (itemCapacity - item_weight) * cost_per_unit_over_capacity.
    itemDataMatrix[ itemIndex ].push(
      ( itemCapacity - itemDataMatrix[ itemIndex ][ 0 ] ) * itemDataMatrix[ itemIndex ][ 2 ]
    );
  }

  // Sort the 'itemDataMatrix' in descending order based on the newly added fourth element (index 3).
  // This sorting is critical for the subsequent binary search and greedy selection strategy.
  itemDataMatrix.sort( ( firstItem, secondItem ) => secondItem[ 3 ] - firstItem[ 3 ] );

  // Initialize bounds for a binary search algorithm:
  // 'feasibleMax' represents an upper bound for the solution space (e.g., maximum possible total capacity).
  // 'infeasibleMin' represents a lower bound, initially set to an impossible value.
  var feasibleMax = numberOfItems * itemCapacity;
  var infeasibleMin = -1;

  // Execute the binary search loop. The loop continues as long as the gap between
  // the feasible maximum and infeasible minimum is greater than 1.
  while ( feasibleMax - infeasibleMin > 1 ) {
    // Calculate the midpoint between 'feasibleMax' and 'infeasibleMin'. This is the current guess.
    var currentGuess = Math.floor( ( feasibleMax + infeasibleMin ) / 2 );

    // Initialize variables for evaluating the current guess:
    // 'currentValue' starts with the pre-calculated total value.
    // 'remainingCapacity' is set to the 'currentGuess' to simulate available capacity.
    var currentValue = currentTotalValue;
    var remainingCapacity = currentGuess;

    // Iterate through the sorted items to check the feasibility of 'currentGuess'.
    // The loop continues as long as there are items, remaining capacity is positive, and 'currentValue' is positive.
    for (
      var checkIndex = 0;
      checkIndex < numberOfItems && remainingCapacity > 0 && currentValue > 0;
      checkIndex++
    ) {
      // Condition 1: If the 'itemCapacity' is fully covered by the 'remainingCapacity'.
      if ( itemCapacity <= remainingCapacity ) {
        // Deduct the item's full base value and its associated penalty/cost from 'currentValue'.
        currentValue -=
          itemDataMatrix[ checkIndex ][ 0 ] * itemDataMatrix[ checkIndex ][ 1 ] + itemDataMatrix[ checkIndex ][ 3 ];
        // Reduce the 'remainingCapacity' by the 'itemCapacity'.
        remainingCapacity -= itemCapacity;
      }
      // Condition 2: If 'remainingCapacity' is less than 'itemCapacity', indicating partial allocation.
      else {
        // This inner loop handles the scenario where remaining capacity is limited.
        // Note: The logic `tempCurrentValue = currentValue;` inside this loop means `tempCurrentValue`
        // is reset to the outer `currentValue` at the beginning of *each* inner iteration.
        // The `checkIndex` continues to advance within this inner loop.
        for (
          var tempCurrentValue = currentValue; // Initialize temp value with the current outer loop's value.
          checkIndex < numberOfItems && tempCurrentValue > 0; // Continue if items remain and temp value is positive.
          checkIndex++ // Increment item index within this inner loop.
        ) {
          tempCurrentValue = currentValue; // Crucial: Reset temp value to the outer loop's `currentValue`.

          // If the 'remainingCapacity' is less than the current item's base weight.
          if ( remainingCapacity < itemDataMatrix[ checkIndex ][ 0 ] ) {
            // Deduct value based on remaining capacity and item's value_per_unit.
            tempCurrentValue -= itemDataMatrix[ checkIndex ][ 1 ] * remainingCapacity;
          }
          // If 'remainingCapacity' is greater than or equal to the current item's base weight.
          else {
            // Deduct the item's base value plus an adjusted penalty based on excess capacity.
            tempCurrentValue -=
              itemDataMatrix[ checkIndex ][ 0 ] * itemDataMatrix[ checkIndex ][ 1 ] +
              ( remainingCapacity - itemDataMatrix[ checkIndex ][ 0 ] ) * itemDataMatrix[ checkIndex ][ 2 ];
          }
        }
        // After the inner loop completes, update the outer loop's 'currentValue'
        // with the final 'tempCurrentValue' from the last inner iteration.
        currentValue = tempCurrentValue;
      }
    }

    // After evaluating the 'currentGuess', adjust the binary search bounds.
    if ( currentValue > 0 ) {
      // If the value is still positive, it means 'currentGuess' was too low (infeasible).
      infeasibleMin = currentGuess;
    } else {
      // If the value is zero or negative, 'currentGuess' is feasible or too high.
      feasibleMax = currentGuess;
    }
  }

  // The 'feasibleMax' variable will converge to the optimal solution found by the binary search.
  return feasibleMax;
}