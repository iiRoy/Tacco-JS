var INPUT_PARSER_FACTORY=( function ( ) {
  // This factory function generates an input reader instance.
  function createInputReader ( rawInputText ) {
    return new LineBasedReader( rawInputText );
  }

  // The primary class responsible for parsing input line by line.
  function LineBasedReader ( rawInputText ) {
    this._sourceLinesBuffer = rawInputText.trim().split("\n"); // Stores the input lines.
    this._currentLinePointer = 0;                             // Tracks the current line being processed.
  }

  // Define prototype methods for the LineBasedReader.

  // Retrieves the next token from the current line.
  LineBasedReader.prototype.fetchToken = function ( returnAsString ) {
    var currentSourceLines = this._sourceLinesBuffer; // A reference to the array of lines.
    var linePointer = this._currentLinePointer;       // The index of the active line.
    var tokenValue;                                   // Variable to hold the extracted data unit.

    // If the current line is still a single string, split it into tokens (reversed for easy popping).
    if ( typeof currentSourceLines[linePointer] === "string" ) {
      currentSourceLines[linePointer] = currentSourceLines[linePointer].split(" ").reverse();
    }

    // Pop the last token from the (reversed) current line.
    tokenValue = currentSourceLines[linePointer].pop();

    // If the line becomes empty after popping, advance to the next line.
    if ( !currentSourceLines[linePointer].length ) {
      this._currentLinePointer++;
    }

    // Return the token, either as a string or converted to a number.
    return returnAsString ? tokenValue : +tokenValue;
  };

  // Reads all tokens from the current line and advances to the next line.
  LineBasedReader.prototype.readTokensOnLine = function ( asStringsOnly ) {
    // Retrieve the current line, split by spaces, and increment the line pointer.
    var lineTokens = this._sourceLinesBuffer[this._currentLinePointer++].split(" ");

    // Return the tokens; either as an array of strings or converted to numbers.
    return asStringsOnly ? lineTokens : lineTokens.map( tokenStr => +tokenStr );
  };

  // Reads a block of lines as a matrix of tokens.
  LineBasedReader.prototype.readTokenMatrix = function ( numInputRows, asStringTokens ) {
    // Extract a segment of lines and split each into tokens.
    var extractedMatrix = this._sourceLinesBuffer.slice( this._currentLinePointer, this._currentLinePointer += numInputRows )
                                                 .map( matrixRow => matrixRow.split(" ") );

    // If numeric conversion is not requested, return as strings. Otherwise, convert all elements.
    return asStringTokens ? extractedMatrix : extractedMatrix.map( matrixRow => matrixRow.map( itemValue => +itemValue ) );
  };

  // Reads a specified number of consecutive lines without further tokenization.
  LineBasedReader.prototype.readConsecutiveLines = function ( countOfLines, keepRawStrings ) {
    // Get a portion of lines directly from the buffer.
    var consecutiveLines = this._sourceLinesBuffer.slice( this._currentLinePointer, this._currentLinePointer += countOfLines );

    // Return lines as raw strings or as numbers.
    return keepRawStrings ? consecutiveLines : consecutiveLines.map( lineItem => +lineItem );
  };

  return createInputReader; // The factory function is exposed.
})();


// Instantiate the input processor by reading standard input.
var dataStream = INPUT_PARSER_FACTORY( require("fs").readFileSync("/dev/stdin", "utf8") );


// Implements a binary search to find the "lower bound" of a target value in a sorted array.
// Returns the index of the first element that is not less than the target.
function findLeftmostIndex ( sortedData, lowIdx, highIdx, targetElement ) {
  for ( var midIdx; 1 < highIdx - lowIdx; ) { // Continue as long as the search range is more than one element.
    midIdx = 0 | ( ( lowIdx + highIdx ) / 2 ); // Calculate the integer midpoint.
    // If the element at midIdx is less than the target, narrow the search to the upper half.
    if ( sortedData[midIdx] < targetElement ) {
      lowIdx = midIdx;
    } else {
      // Otherwise, narrow the search to the lower half, potentially including midIdx.
      highIdx = midIdx;
    }
  }
  // At loop termination, lowIdx and highIdx are adjacent. Determine the correct boundary.
  return sortedData[lowIdx] < targetElement ? highIdx : lowIdx;
}


// Execute the main problem-solving routine and print its output.
console.log( calculateXorSum() );


// The main function encapsulates the primary logic for solving the problem.
function calculateXorSum ( ) {
  var totalItems = dataStream.fetchToken();             // Read the total count of elements.
  var firstSequence = dataStream.readTokensOnLine();    // Read the first array of numbers.
  var secondSequence = dataStream.readTokensOnLine();   // Read the second array of numbers.
  var finalXorResult = 0;                               // Variable to accumulate the final XOR sum.

  // Initially sort the second sequence to enable efficient binary searches.
  secondSequence.sort( ( valA, valB ) => valA - valB );

  // Iterate through each bit position, from most significant down to zero.
  for ( var currentBit = 28; currentBit >= 0; currentBit-- ) {
    var bitMagnitude    = 1 << currentBit;          // The numerical value of the current bit (e.g., 2^28).
    var doubleMagnitude = bitMagnitude * 2;         // Two times the current bit's value.
    var tripleMagnitude = bitMagnitude * 3;         // Three times the current bit's value.
    var bitfieldMask    = bitMagnitude - 1;         // A mask for all bits less significant than the current bit.
    var cumulativeXorCount = firstSequence.length * firstSequence.length; // Initialize with a base count.

    // For each element in the first sequence, perform calculations.
    for ( var currentElementIdx = 0; currentElementIdx < firstSequence.length; currentElementIdx++ ) {
      // Find specific boundary indices within `secondSequence` using binary search.
      var upperBoundMatch = findLeftmostIndex( secondSequence, 0, secondSequence.length, doubleMagnitude - firstSequence[currentElementIdx] );
      var lowerBoundMatch = findLeftmostIndex( secondSequence, 0, upperBoundMatch, bitMagnitude - firstSequence[currentElementIdx] );
      var thirdBoundMatch = findLeftmostIndex( secondSequence, upperBoundMatch, secondSequence.length, tripleMagnitude - firstSequence[currentElementIdx] );

      // Adjust the cumulative count based on the calculated bounds.
      cumulativeXorCount += -thirdBoundMatch + upperBoundMatch - lowerBoundMatch;
    }

    // If the total cumulative count for this bit position is odd, this bit contributes to the final result.
    if ( cumulativeXorCount % 2 ) {
      finalXorResult += bitMagnitude;
    }

    // Mask both sequences with the current bitfield mask.
    secondSequence = secondSequence.map( itemValue => itemValue & bitfieldMask );
    firstSequence = firstSequence.map( itemValue => itemValue & bitfieldMask );

    // Apply special processing for lower bit positions.
    if ( currentBit < 18 ) {
      firstSequence = filterByOddCounts( firstSequence, currentBit );
      secondSequence = filterByOddCounts( secondSequence, currentBit );
    } else {
      // For higher bit positions, re-sort the second sequence after masking.
      secondSequence.sort( ( valA, valB ) => valA - valB );
    }
  }
  return finalXorResult; // Return the aggregate XOR sum.


  // A nested helper function that processes an array to find elements
  // whose frequencies are odd within the given bit length.
  function filterByOddCounts ( sourceArray, bitLength ) {
    var frequencyMap = Array( 1 << bitLength ).fill( 0 ); // Create an array to store counts for values up to 2^bitLength - 1.
    var filteredElements = [];                             // An array to collect elements with odd frequencies.

    // Iterate through the source array to populate the frequency map.
    for ( var indexCounter = 0; indexCounter < sourceArray.length; indexCounter++ ) {
      frequencyMap[sourceArray[indexCounter]]++;
    }

    // Iterate through the frequency map to identify and collect elements with odd counts.
    for ( indexCounter = 0; indexCounter < frequencyMap.length; indexCounter++ ) {
      if ( frequencyMap[indexCounter] & 1 ) { // Check for odd count using a bitwise AND.
        filteredElements.push( indexCounter );
      }
    }
    return filteredElements; // Return the array containing elements that appeared an odd number of times.
  }
}