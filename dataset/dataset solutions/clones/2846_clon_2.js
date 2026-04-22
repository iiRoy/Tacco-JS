const DATA_PARSER = ( function ( ) {
  // Factory function to create a new data stream processor
  function createProcessor ( rawText ) {
    return new StreamProcessor( rawText ) ;
  }

  // Class definition for the stream processor
  function StreamProcessor ( sourceContent ) {
    // Store the input content, split into lines, and trim whitespace
    this. _dataRows = sourceContent . trim ( ) . split ( "\n" ) ;
    // Initialize the pointer to the current line
    this. _linePointer = 0 ;
  }

  // Prototype method to extract a single value from the current line
  StreamProcessor . prototype . fetchElement = function ( returnRaw ) {
    const currentLines = this. _dataRows ;
    let currentIndex = this. _linePointer ;
    let extractedToken ;

    // If the current line hasn't been processed into tokens yet, do it now
    if ( typeof currentLines[ currentIndex ] === "string" ) {
      currentLines[ currentIndex ] = currentLines[ currentIndex ] . split ( " " ) . reverse ( ) ;
    }

    // Pop the last token from the current line
    extractedToken = currentLines[ currentIndex ] . pop ( ) ;

    // If the current line is now empty, advance the line pointer
    if ( ! currentLines[ currentIndex ] . length ) {
      this. _linePointer ++ ;
    }

    // Return the token, either as raw string or converted to a number
    return returnRaw ? extractedToken : + extractedToken ;
  } ;

  // Prototype method to read an entire line and convert its tokens to numbers
  StreamProcessor . prototype . getLineElements = function ( keepStrings ) {
    // Get the current line, advance the pointer, and split into parts
    const lineParts = this. _dataRows[ this. _linePointer ++ ] . split ( " " ) ;
    // Return parts as strings or converted to numbers
    return keepStrings ? lineParts : lineParts . map ( ( value ) => + value ) ;
  } ;

  // Prototype method to read multiple lines as a matrix
  StreamProcessor . prototype . getGridData = function ( rowCount , stringMatrix ) {
    // Slice the required number of rows and split each into elements
    const matrixSlice = this. _dataRows . slice ( this. _linePointer , this. _linePointer += rowCount ) . map ( ( rowString ) => rowString . split ( " " ) ) ;
    // Return matrix as strings or converted to numbers
    return stringMatrix ? matrixSlice : matrixSlice . map ( ( row ) => row . map ( ( element ) => + element ) ) ;
  } ;

  // Prototype method to read a block of lines
  StreamProcessor . prototype . getLineBlock = function ( blockLength , keepAsStrings ) {
    // Slice the required number of rows
    const rowBlock = this. _dataRows . slice ( this. _linePointer , this. _linePointer += blockLength ) ;
    // Return block as strings or converted to numbers
    return keepAsStrings ? rowBlock : rowBlock . map ( ( lineVal ) => + lineVal ) ;
  } ;

  return createProcessor ; // Expose the factory function
} ) ( ) ;

// Initialize the data handler by reading from standard input
const inputProcessor = DATA_PARSER ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// Utility function to create multi-dimensional arrays (not used in main processing logic)
function buildNestedArray ( initialValue ) {
  const args = arguments ;
  let len = args . length ;
  let resultString = "Array(args[" + --len + "]).fill(0).map(x=>{return " + initialValue + ";})" ;
  while ( --len ) {
    resultString = "Array(args[" + len + "]).fill(0).map(x=>" + resultString + ")" ;
  }
  return eval ( resultString ) ;
}

// Execute the primary processing logic and print the result
console . log ( computeResult ( ) ) ;

// Main function to perform calculations
function computeResult ( ) {
  // Read the total count of elements
  const elementCount = inputProcessor . fetchElement ( ) ;
  // Read the array of numeric data
  const numericData = inputProcessor . getLineElements ( ) ;
  // Sort the data in ascending order
  numericData . sort ( ( first , second ) => first - second ) ;

  // Initialize the array for output lines
  const outputLines = [ - numericData[ 0 ] ] ;
  // Calculate the initial sum based on absolute values
  for ( let idx = 1 ; idx < elementCount ; idx ++ ) {
    outputLines[ 0 ] += Math . abs ( numericData[ idx ] ) ;
  }

  // Initialize a running total variable
  let runningTotal = numericData[ 0 ] ;

  // First pass to construct intermediate output lines
  for ( let iterationCounter = 1 ; iterationCounter < elementCount - 1 ; iterationCounter ++ ) {
    // Skip negative numbers in this specific part of the logic
    if ( numericData[ iterationCounter ] < 0 ) {
      continue ;
    }
    const currentLength = outputLines . length ;
    // Handle the first intermediate line differently
    if ( currentLength === 1 ) {
      outputLines . push ( numericData[ 0 ] + " " + numericData[ iterationCounter ] ) ;
      runningTotal = numericData[ 0 ] - numericData[ iterationCounter ] ;
    } else {
      outputLines . push ( runningTotal + " " + numericData[ iterationCounter ] ) ;
      runningTotal -= numericData[ iterationCounter ] ;
    }
  }
  // Add the final calculation for the last element
  outputLines . push ( numericData[ elementCount - 1 ] + " " + runningTotal ) ;
  runningTotal = numericData[ elementCount - 1 ] - runningTotal ;

  // Second pass to fill any remaining output lines
  for ( let iterationCounter = 1 ; outputLines . length !== elementCount ; iterationCounter ++ ) {
    const currentLength = outputLines . length ;
    outputLines . push ( runningTotal + " " + numericData[ iterationCounter ] ) ;
    runningTotal -= numericData[ iterationCounter ] ;
  }
  // Join all output lines with newline characters
  return outputLines . join ( "\n" ) ;
}