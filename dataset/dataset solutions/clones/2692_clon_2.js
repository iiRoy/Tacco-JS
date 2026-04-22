// This module provides utilities for parsing input data streams.
var INPUT_PROCESSING_UTILITY_BUILDER = ( function () {

  // Primary function to create a new input stream handler instance.
  function buildStreamHandler( streamContentString ) {
    return new StreamDataSource( streamContentString );
  }

  // Constructor for the data stream parser object.
  // It initializes the internal buffer and line pointer.
  function StreamDataSource( textInputData ) {
    // Store lines from the input string after trimming and splitting.
    this._inputBuffer = textInputData.trim().split( "\n" );
    this._currentLineIndex = 0; // Initialize the pointer to the first line.
  }

  // Prototype methods for StreamDataSource:

  // Reads and returns a single element from the current line.
  // 'asString' parameter determines if the value should be returned as a string or number.
  StreamDataSource.prototype.getIndividualElement = function ( asString ) {
    var lineCollection = this._inputBuffer,
        currentLinePosition = this._currentLineIndex,
        parsedElement;

    // If the current line hasn't been processed into an array of elements yet, do so.
    if ( typeof lineCollection[ currentLinePosition ] === "string" ) {
      lineCollection[ currentLinePosition ] = lineCollection[ currentLinePosition ].split( " " ).reverse();
    }

    // Extract the last element from the processed line.
    parsedElement = lineCollection[ currentLinePosition ].pop();

    // If the current line is now empty, advance the line pointer to the next line.
    if ( !lineCollection[ currentLinePosition ].length ) {
      this._currentLineIndex++;
    }

    // Return the element either as its raw string form or converted to a number.
    return asString ? parsedElement : +parsedElement;
  };

  // Reads an entire line of elements and returns them as an array.
  // 'keepStrings' parameter controls whether elements are kept as strings or converted to numbers.
  StreamDataSource.prototype.retrieveLineAsArray = function ( keepStrings ) {
    // Split the current line into elements and advance the line pointer.
    var lineElements = this._inputBuffer[ this._currentLineIndex++ ].split( " " );

    // Return the elements as strings or map them to numbers.
    return keepStrings ? lineElements : lineElements.map( strVal => +strVal );
  };

  // Reads a block of 'linesToRead' lines and processes them as a matrix (2D array).
  // 'returnRawCells' flag determines if matrix cells are strings or numbers.
  StreamDataSource.prototype.readMatrixBlock = function ( linesToRead, returnRawCells ) {
    // Extract a slice of lines, then map each line to an array of its elements.
    var matrixData = this._inputBuffer.slice( this._currentLineIndex, this._currentLineIndex += linesToRead )
                                      .map( lineText => lineText.split( " " ) );

    // Return the matrix with string cells or convert all cells to numbers.
    return returnRawCells ? matrixData : matrixData.map( rowArray => rowArray.map( cellString => +cellString ) );
  };

  // Reads a block of 'linesToRead' raw lines without splitting them by spaces.
  // 'convertEachToNumber' flag controls if each line string is converted to a number.
  StreamDataSource.prototype.fetchLineBlock = function ( linesToRead, convertEachToNumber ) {
    // Extract a slice of raw lines.
    var blockOfLines = this._inputBuffer.slice( this._currentLineIndex, this._currentLineIndex += linesToRead );

    // Return raw line strings or map each line to a number.
    return convertEachToNumber ? blockOfLines : blockOfLines.map( lineStringVal => +lineStringVal );
  };

  // The module exposes only the factory function to create a StreamDataSource.
  return buildStreamHandler;

} )();


// Instantiate the input data handler by reading from standard input.
var inputDataSource = INPUT_PROCESSING_UTILITY_BUILDER(
  require( "fs" ).readFileSync( "/dev/stdin", "utf8" )
);

// Utility function to create multi-dimensional arrays initialized with a specific value.
function createNestedArray( initialContent ) {
  var passedArguments = arguments,
      currentArgCount = passedArguments.length,
      // Build the innermost array creation script.
      arrayInitializationScript = "Array(passedArguments[" + --currentArgCount + "]).fill(0).map( _ => { return " + initialContent + "; } )";

  // Wrap the script with outer array creations based on dimensions.
  while ( --currentArgCount ) {
    arrayInitializationScript = "Array(passedArguments[" + currentArgCount + "]).fill(0).map( _ => " + arrayInitializationScript + " )";
  }

  // Execute the dynamically generated script to create the array.
  return eval( arrayInitializationScript );
}

// Output the final result obtained from the main problem-solving function.
console.log( executeMainProblemSolver() );

// Main function encapsulating the problem's logic.
function executeMainProblemSolver() {

  // Read problem-specific parameters N and K from the input stream.
  var totalDataSetElements = inputDataSource.getIndividualElement();
  var maximumPermittedSum = inputDataSource.getIndividualElement();
  var initialNumericValues = inputDataSource.retrieveLineAsArray();

  // Calculate the sum of all elements in the input array.
  var aggregateSumOfValues = initialNumericValues.reduce( ( accumulator, currentVal ) => accumulator + currentVal );

  // Find all positive divisors of the aggregate sum, sorted in descending order.
  var potentialDivisors = calculateAllFactorsDescending( aggregateSumOfValues );

  // Iterate through each potential divisor to find the optimal one.
  for ( var divisorCandidateIdx = 0; divisorCandidateIdx < potentialDivisors.length; divisorCandidateIdx++ ) {

    // Calculate the remainders of each input value when divided by the current divisor.
    // Then sort these remainders in ascending order.
    var remainderValuesSorted = initialNumericValues.map( val => val % potentialDivisors[ divisorCandidateIdx ] )
                                                    .sort( ( valOne, valTwo ) => valOne - valTwo );

    var rightWindowBoundary = totalDataSetElements; // Pointer for the right end of the sliding window.
    var currentWindowSum = 0; // Sum of elements currently within the sliding window.
    var highestSumInWindow = 0; // The maximum sum achieved by a valid window.

    // Inner loop: Slide a window from left to right.
    // The loop continues as long as the left pointer is within bounds and the max sum is acceptable.
    for ( var leftWindowPointer = 0; leftWindowPointer < rightWindowBoundary && highestSumInWindow <= maximumPermittedSum; leftWindowPointer++ ) {

      // Add the current remainder value to both window sums.
      currentWindowSum += remainderValuesSorted[ leftWindowPointer ];
      highestSumInWindow += remainderValuesSorted[ leftWindowPointer ];

      // Adjust the window from the right if the current sum exceeds the divisor.
      // This effectively "wraps around" remainders.
      while ( currentWindowSum > 0 ) {
        currentWindowSum -= potentialDivisors[ divisorCandidateIdx ] - remainderValuesSorted[ --rightWindowBoundary ];
      }

    }

    // If the highest sum achieved within the window is within the 'maximumPermittedSum' constraint,
    // then this 'potentialDivisors[divisorCandidateIdx]' is the answer.
    if ( highestSumInWindow <= maximumPermittedSum ) {
      return potentialDivisors[ divisorCandidateIdx ];
    }
  }

  // If no suitable divisor is found after checking all possibilities, return 1 as a default.
  return 1;
}


// Function to compute all positive divisors of a given number, sorted in descending order.
function calculateAllFactorsDescending( targetNumber ) {
  var discoveredFactors = [ targetNumber ]; // Initialize with the number itself as a factor.
  var squareRootOfTarget = Math.sqrt( targetNumber );
  var integerSqrtPart = squareRootOfTarget | 0; // Get the integer part of the square root.

  // If the target number is a perfect square, its square root is also a divisor.
  if ( integerSqrtPart * integerSqrtPart === targetNumber ) {
    discoveredFactors.push( integerSqrtPart );
  }

  // Iterate from 2 up to (but not including) the square root of the target number.
  for ( var currentDivisorCandidate = 2; currentDivisorCandidate < squareRootOfTarget; currentDivisorCandidate++ ) {
    // If 'currentDivisorCandidate' divides 'targetNumber' evenly, then both
    // 'currentDivisorCandidate' and 'targetNumber / currentDivisorCandidate' are factors.
    if ( targetNumber % currentDivisorCandidate === 0 ) {
      discoveredFactors.push( currentDivisorCandidate, targetNumber / currentDivisorCandidate );
    }
  }

  // Sort the collected divisors in descending order before returning.
  return discoveredFactors.sort( ( valA, valB ) => valB - valA );
}