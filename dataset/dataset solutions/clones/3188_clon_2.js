var INPUT_PARSER = ( function ( ) {

  // This function serves as a factory to create an instance of our custom
  // input parsing utility. It encapsulates the core logic for reading data.
  function createInputReader ( sourceContent ) {
    return new InputReader( sourceContent );
  }

  // The primary constructor for the InputReader object.
  // It initializes the internal state required for sequential line processing.
  function InputReader ( sourceContent ) {
    // The raw input string is first trimmed of leading/trailing whitespace
    // and then split into an array of individual lines.
    this.lineFragments = sourceContent.trim().split( "\n" ) ;
    // This property keeps track of the index of the current line being processed
    // within the 'lineFragments' array. It starts at the very beginning (0).
    this.currentLineIdx = 0 ;
  }

  // Defines a prototype method for the InputReader. This method is designed
  // to extract a single data item from the current line.
  // The 'returnAsString' parameter dictates if the item should be returned
  // as its raw string form or converted to a numeric type.
  InputReader.prototype.extractNext = function ( returnAsString ) {
    var currentFragments = this.lineFragments , // Reference to the array of all lines.
        idx = this.currentLineIdx ,             // Current line's index.
        extractedValue ;                        // Variable to hold the retrieved item.

    // Before attempting to pop an item, check if the current line at 'idx'
    // is still a single string. If so, it means it hasn't been tokenized yet.
    if ( typeof currentFragments[ idx ] === "string" ) {
      // Split the line into individual tokens (words) based on spaces,
      // and then reverse the order. Reversing allows for efficient 'pop' operations
      // from the end of the array, which is generally faster than 'shift' from the beginning.
      currentFragments[ idx ] = currentFragments[ idx ].split( " " ).reverse() ;
    }

    // Retrieve the last element from the (possibly reversed) array of tokens
    // representing the current line. This effectively gets the 'next' item.
    extractedValue = currentFragments[ idx ].pop( ) ;

    // After extracting an item, check if the current line's token array is now empty.
    // If it is, it means all items on this line have been consumed.
    if ( ! currentFragments[ idx ].length ) {
      // Advance the line index to move to the subsequent line for future operations.
      this.currentLineIdx++ ;
    }
    // Finally, return the extracted item. If 'returnAsString' is truthy,
    // the item is returned as a string; otherwise, it's converted to a number
    // using the unary plus operator.
    return returnAsString ? extractedValue : +extractedValue ;
  } ;

  // This prototype method reads an entire line of input and provides it
  // as an array of its constituent parts.
  InputReader.prototype.readEntireLine = function ( returnAsString ) {
    // Access the current line, split it into parts based on spaces,
    // and then immediately increment 'currentLineIdx' to point to the next line.
    var lineParts = this.lineFragments[ this.currentLineIdx++ ].split( " " ) ;
    // If 'returnAsString' is true, return the array of string parts as-is.
    // Otherwise, use 'map' to convert each string part into a numeric value.
    return returnAsString ? lineParts : lineParts.map( item => +item ) ;
  } ;

  // A method designed to read a specified number of consecutive lines
  // and process them into a two-dimensional array (matrix).
  InputReader.prototype.readMatrix = function ( numberOfLines , returnAsString ) {
    // Utilize 'slice' to extract 'numberOfLines' from the 'lineFragments' array,
    // starting from 'currentLineIdx'. The 'currentLineIdx' is then advanced.
    // Each extracted line string is then split into an array of strings.
    var extractedValue = this.lineFragments.slice( this.currentLineIdx , this.currentLineIdx += numberOfLines ).map( element => element.split( " " ) ) ;
    // If numeric conversion is not requested, return the matrix of strings.
    // Otherwise, iterate through each row and then each cell to convert all
    // string representations to numbers.
    return returnAsString ? extractedValue : extractedValue.map( row => row.map( cell => +cell ) ) ;
  } ;

  // This method reads a block of 'numberOfLines' from the input,
  // returning them as a one-dimensional array.
  InputReader.prototype.readLinesAsArray = function ( numberOfLines , returnAsString ) {
    // Extract a contiguous block of lines using 'slice', and advance the index.
    var extractedValue = this.lineFragments.slice( this.currentLineIdx , this.currentLineIdx += numberOfLines ) ;
    // Convert elements to numbers if 'returnAsString' is not true.
    return returnAsString ? extractedValue : extractedValue.map( element => +element ) ;
  } ;

  // The module exports the factory function, allowing external code to create
  // new InputReader instances without directly interacting with the constructor.
  return createInputReader ;

} ) ( ) ; // This is an Immediately Invoked Function Expression (IIFE) for module scope.


// Instantiate the input reader by passing it the content of standard input.
// The 'fs' module is used to synchronously read the file at '/dev/stdin' as UTF-8 text.
var readerInstance = INPUT_PARSER( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;

// Execute the main processing function and output its return value to the console.
console.log( processInputData( ) ) ;

/**
 * This is the primary function that encapsulates the problem-solving logic.
 * It interacts with the 'readerInstance' to consume input and compute a final result.
 * @returns {number} The integer result derived from processing the input data.
 */
function processInputData ( ) {
  // Read the first numeric value from the input, which represents the total
  // number of subsequent data lines to process.
  const totalIterations = readerInstance.extractNext( ) ;
  // Read the second numeric value, which specifies the required size
  // for an array used to track item counts.
  const arraySize = readerInstance.extractNext( ) ;

  // Initialize an array named 'itemCounts'. Its size is determined by 'arraySize',
  // and all its elements are initially set to zero (as floating-point numbers).
  const itemCounts = Array( arraySize ).fill( 0.0 ) ;

  // Declare a variable to store the cumulative final result.
  // Initialized to zero point zero.
  let finalResult = 0.0 ;

  // Begin a loop that iterates 'totalIterations' times. Each iteration
  // processes a distinct line of input data.
  for ( let outerLoopIndex = 0 ; outerLoopIndex < totalIterations ; outerLoopIndex++ ) {
    // Read the current line of input as an array of numbers.
    // The first element of 'currentLineData' indicates how many actual items
    // are present on this line (following the count itself).
    const currentLineData = readerInstance.readEntireLine( ) ;

    // Start an inner loop to process each item within the 'currentLineData'.
    // The loop begins from index 1 because index 0 holds the count of items.
    for ( let innerLoopIndex = 1 ; innerLoopIndex <= currentLineData[ 0 ] ; innerLoopIndex++ ) {
      // Increment the count for the specific item in the 'itemCounts' array.
      // We subtract 1 from 'currentLineData[innerLoopIndex]' to convert it
      // from a 1-based item ID (common in problem statements) to a 0-based array index.
      itemCounts[ currentLineData[ innerLoopIndex ] - 1 ]++ ;
    }
  }

  // After all input lines have been processed, iterate through the 'itemCounts' array.
  // This loop determines how many distinct items have been encountered exactly
  // 'totalIterations' times.
  for ( let outerLoopIndex = 0 ; outerLoopIndex < arraySize ; outerLoopIndex++ ) {
    // If the count of an item in 'itemCounts' is precisely equal to 'totalIterations',
    // it means this item was present in every single input line/set.
    if ( itemCounts[ outerLoopIndex ] === totalIterations ) {
      // Increment the 'finalResult' for each such item found.
      finalResult++ ;
    }
  }
  // Return the accumulated 'finalResult', which represents the answer to the problem.
  return finalResult ;
}