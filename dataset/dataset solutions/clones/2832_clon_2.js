var DATA_PARSER = ( function ( ) {
  // This factory function initializes an input source handler.
  function createParser ( sourceContent ) {
    return new InputSource ( sourceContent ) ;
  }

  // The InputSource class manages reading data line by line.
  function InputSource ( sourceContent ) {
    this._linesArray = sourceContent . trim ( ) . split ( "\n" ) ; // Store content as an array of lines.
    this._currentLineIndex = 0 ; // Tracks the current line being processed.
  }

  // Method to retrieve a single numeric or string token from the current line.
  InputSource.prototype.fetchValue = function ( asString ) {
    let linesArrayRef = this._linesArray ;
    let lineIndexRef = this._currentLineIndex ;
    let resultValue ;

    // If the current line is still a string, split it into tokens and reverse for efficient `pop()`.
    if ( typeof linesArrayRef [ lineIndexRef ] === "string" ) {
      linesArrayRef [ lineIndexRef ] = linesArrayRef [ lineIndexRef ] . split ( " " ) . reverse ( ) ;
    }
    
    // Extract the last token from the current line.
    resultValue = linesArrayRef [ lineIndexRef ] . pop ( ) ;
    
    // If the current line has no more tokens, advance to the next line.
    if ( ! linesArrayRef [ lineIndexRef ] . length ) {
      this._currentLineIndex ++ ;
    }
    
    // Return the value as a string or parsed as a number.
    return asString ? resultValue : Number ( resultValue ) ;
  } ;

  // Method to retrieve an entire line as an array of tokens.
  InputSource.prototype.fetchLine = function ( asString ) {
    // Fetch the current line, split it by spaces, and then increment the line index.
    let lineTokens = this._linesArray [ this._currentLineIndex ++ ] . split ( " " ) ;
    // Return the tokens as strings or parsed as numbers.
    return asString ? lineTokens : lineTokens . map ( val => Number ( val ) ) ;
  } ;

  // Method to retrieve a block of 'numLines' as a matrix of tokens.
  InputSource.prototype.fetchMatrix = function ( numLines , asString ) {
    // Extract the specified number of lines and process each into an array of tokens.
    let resultMatrix = this._linesArray . slice ( this._currentLineIndex , this._currentLineIndex += numLines ) . map ( line => line . split ( " " ) ) ;
    // Return the matrix with string tokens or number tokens.
    return asString ? resultMatrix : resultMatrix . map ( row => row . map ( val => Number ( val ) ) ) ;
  } ;

  // Method to retrieve a block of 'numLines' as a flat array of values (each line is one value).
  InputSource.prototype.fetchRange = function ( numLines , asString ) {
    // Extract the specified number of lines.
    let resultRange = this._linesArray . slice ( this._currentLineIndex , this._currentLineIndex += numLines ) ;
    // Return the range as strings or parsed as numbers.
    return asString ? resultRange : resultRange . map ( val => Number ( val ) ) ;
  } ;

  // The factory function is exposed as the module's interface.
  return createParser ;
} ) ( ) ;

// Initialize the input reader by parsing content from standard input.
var inputReader = DATA_PARSER ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// Utility function to create a multi-dimensional array initialized with a specific value.
function multiDimArray ( initialValue ) {
  let argsList = arguments ; // Capture all arguments passed to the function.
  let lengthCounter = argsList . length ; // Get the number of dimensions.
  // Construct the innermost array creation string.
  let arrayCreationString = "Array ( argsList [ --lengthCounter ] ) . fill ( 0 ) . map ( ( ) => { return " + initialValue + "; } )" ;
  
  // Loop to build nested array creation calls for each dimension.
  while ( --lengthCounter ) {
    arrayCreationString = "Array ( argsList [ lengthCounter ] ) . fill ( 0 ) . map ( ( ) => " + arrayCreationString + " )" ;
  }
  
  // Evaluate the dynamically constructed string to create the array.
  return eval ( arrayCreationString ) ;
}

// Define a constant for the modulo operation, commonly used in competitive programming.
const moduloConstant = 1_000_000_007 ; // A large prime number.

// Execute the main calculation routine and print its final result.
console.log ( calculateSequence ( ) ) ;

// The primary function to compute the longest common subsequence variation.
function calculateSequence ( ) {
  // Read the lengths of the two sequences from input.
  let firstLength = inputReader . fetchValue ( ) ;
  let secondLength = inputReader . fetchValue ( ) ;

  // Read the two sequences themselves from input.
  let firstSequence = inputReader . fetchLine ( ) ;
  let secondSequence = inputReader . fetchLine ( ) ;

  // Initialize a dynamic programming table with dimensions (firstLength+1) x (secondLength+1), filled with zeros.
  let dynamicProgrammingTable = multiDimArray ( 0 , firstLength + 1 , secondLength + 1 ) ;
  
  // Initialize the total count of valid subsequences.
  let totalCount = 1 ;

  // Iterate through the first sequence.
  for ( let idx1 = 0 ; idx1 < firstLength ; idx1 ++ ) {
    let currentSum = 0 ; // Accumulates values for the current row of the DP table.
    // Iterate through the second sequence.
    for ( let idx2 = 0 ; idx2 < secondLength ; idx2 ++ ) {
      // If the current elements from both sequences match.
      if ( firstSequence [ idx1 ] === secondSequence [ idx2 ] ) {
        // Update currentSum with the count from the previous diagonal cell plus one.
        currentSum += dynamicProgrammingTable [ idx1 ] [ idx2 ] + 1 ;
        // Update the overall total count.
        totalCount += dynamicProgrammingTable [ idx1 ] [ idx2 ] + 1 ;
        totalCount %= moduloConstant ; // Apply modulo to prevent overflow.
        
        // Update the DP table for a match: sum of counts from above, from left, and the current match.
        dynamicProgrammingTable [ idx1 + 1 ] [ idx2 + 1 ] = dynamicProgrammingTable [ idx1 + 1 ] [ idx2 ] + dynamicProgrammingTable [ idx1 ] [ idx2 + 1 ] + 1 ;
      } else {
        // If elements do not match, update DP table using the accumulated sum and the value from above.
        dynamicProgrammingTable [ idx1 + 1 ] [ idx2 + 1 ] = currentSum + dynamicProgrammingTable [ idx1 ] [ idx2 + 1 ] ;
      }
      // Apply modulo to the DP table entry.
      dynamicProgrammingTable [ idx1 + 1 ] [ idx2 + 1 ] %= moduloConstant ;
    }
  }
  // Return the final calculated total count.
  return totalCount ;
}