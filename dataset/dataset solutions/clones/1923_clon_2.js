/* This module provides utilities for parsing input streams. */
function TokenStream ( sourceText ) {
  // Store a reference to the current object instance.
  var instance = this;

  // Initialize the index for the current token being processed.
  instance.tokenIndex = 0;

  // Keep the raw, original input data.
  instance.originalData = sourceText;

  // Immediately parse the input string into a list of tokens.
  instance.parsedTokens = ( function ( processingString ) {
    var tokenList = []; // Array to hold the separated tokens.
    // Replace multiple whitespace characters (spaces, tabs, newlines) with a single space to normalize.
    var normalizedString = processingString.replace( /[\s\t\n]+/g, " " );
    // Split the normalized string by space to get individual parts.
    var splitParts = normalizedString.split( " " );

    // Iterate through the parts and add them to the token list.
    for ( var idx = 0, count = splitParts.length; idx < count; idx++ ) {
      tokenList.push( splitParts[idx] );
    }
    return tokenList; // Return the fully populated list of tokens.
  } ( sourceText ) ); // Immediately invoked with the initial source text.

  // Method to retrieve the next available token as a string.
  instance.getNextToken = function () {
    var currentToken = instance.parsedTokens[instance.tokenIndex];
    instance.tokenIndex++; // Advance the token pointer.
    return ( currentToken !== null ) ? currentToken : null;
  };

  // Method to retrieve the next token and parse it as an integer.
  instance.getNextInteger = function () {
    var extractedToken = instance.parsedTokens[instance.tokenIndex];
    instance.tokenIndex++; // Move to the subsequent token position.
    return ( extractedToken !== null ) ? parseInt( extractedToken, 10 ) : null;
  };

  // Method to retrieve the next token and parse it as a floating-point number.
  instance.getNextDecimal = function () {
    var numericToken = instance.parsedTokens[instance.tokenIndex];
    instance.tokenIndex++; // Increment the token counter.
    return ( numericToken !== null ) ? parseFloat( numericToken ) : null;
  };

  // Method to retrieve the next token and convert it to a single-element Int8Array.
  instance.getNextByteValue = function () {
    var byteInput = instance.parsedTokens[instance.tokenIndex];
    instance.tokenIndex++; // Progress to the next token.
    // Convert the string token to an integer, then wrap it in an Int8Array.
    // This ensures the Int8Array contains the parsed byte value.
    return ( byteInput !== null ) ? new Int8Array( [ parseInt( byteInput, 10 ) ] ) : null;
  };
}


/* Main routine to execute the primary program logic. */
function ExecuteProgram ( dataReader ) {
  // Read initial configuration values from the data stream.
  var firstValue = dataReader.getNextInteger();
  var secondValue = dataReader.getNextInteger();
  var queryCount = dataReader.getNextInteger();

  // Array to store detailed query parameters.
  var queryDetails = [];
  // Variable to keep track of the highest score achieved.
  var maximumScore = 0;
  // Variable for calculating the score in the current iteration.
  var currentScore = 0;

  // Populate the query details array based on the queryCount.
  for ( var loopVar = 0; loopVar < queryCount; loopVar++ ) {
    var detailItem = {
      valA: dataReader.getNextInteger(),
      valB: dataReader.getNextInteger(),
      valC: dataReader.getNextInteger(),
      valD: dataReader.getNextInteger(),
    };
    queryDetails.push( detailItem ); // Add the new detail item.
  }

  // Initialize a sequence array with 'firstValue' number of 1s.
  var sequence = [];
  for ( var counter = 0; counter < firstValue; counter++ ) {
    sequence.push( 1 );
  }

  // Main loop to generate and evaluate sequences.
  // Iterates M^N times, representing all possible combinations.
  for ( var outerLoopCounter = 0; outerLoopCounter < Math.pow( secondValue, firstValue ); outerLoopCounter++ ) {

    // Increment the first element of the sequence.
    sequence[0]++;
    // Propagate carries through the sequence, ensuring elements don't exceed 'secondValue'.
    // If innerLoopCounter is firstValue - 1, this will attempt to increment sequence[firstValue],
    // potentially creating a NaN if sequence[firstValue] is undefined. This behavior is
    // intentionally replicated from the original source.
    for ( var innerLoopCounter = 0; innerLoopCounter < firstValue; innerLoopCounter++ ) {
      if ( sequence[innerLoopCounter] > secondValue ) {
        sequence[innerLoopCounter] = 1; // Reset to 1.
        sequence[innerLoopCounter + 1]++; // Increment the next element, may go out of bounds.
      }
    }

    // Check if the current sequence is strictly ascending.
    var isAscending = true;
    for ( var checkIndex = 0; checkIndex < firstValue - 1; checkIndex++ ) {
      if ( sequence[checkIndex] > sequence[checkIndex + 1] ) {
        isAscending = false; // Sequence is not ascending.
        break;
      }
    }
    // If not ascending, skip to the next iteration.
    if ( !isAscending ) continue;

    // Calculate score for the current valid sequence.
    currentScore = 0;
    for ( var detailIndex = 0; detailIndex < queryDetails.length; detailIndex++ ) {
      // Check the condition specified by the query details for scoring.
      if ( queryDetails[detailIndex].valC === sequence[queryDetails[detailIndex].valB - 1] - sequence[queryDetails[detailIndex].valA - 1] ) {
        currentScore += queryDetails[detailIndex].valD; // Add points if condition met.
      }
    }
    // Update the maximum score if the current score is higher.
    if ( maximumScore < currentScore ) maximumScore = currentScore;
  }

  // Output the final maximum score to the console.
  console.log( maximumScore );
}

// Initiate the program by creating a TokenStream from standard input
// and passing it to the main execution function.
ExecuteProgram( new TokenStream( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) );

// The following lines are provided as examples of how to utilize the TokenStream methods,
// similar to how the original code provided commented-out examples.
// var stringInput = dataReader.getNextToken();       // Fetches data as string.
// var integerInput = dataReader.getNextInteger();     // Obtains an integer value.
// var decimalInput = dataReader.getNextDecimal();     // Retrieves a floating-point number.
// var byteData = dataReader.getNextByteValue();       // Acquires a byte array.