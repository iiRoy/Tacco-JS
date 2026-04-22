/*
 * This JavaScript module encapsulates a specific data processing algorithm.
 * It's designed to read numerical input, perform calculations based on
 * certain thresholds, and then output a final computed value.
 */
const processInputData = ( receivedContent ) => {
  // Initially, we parse the entire incoming textual payload by line breaks.
  receivedContent = receivedContent .split ( "\n" ) ;

  // Extract the primary quantity from the first segment of the initial line.
  const totalItemsCount  =   Number ( receivedContent [ 0 ] .split ( " " ) [ 0 ] ) ;

  /*
   * Obtain the critical upper boundary value from the second segment of the same line.
   * This value acts as a stopping condition for our iterative accumulation.
   */
  const maximumThreshold = Number ( receivedContent [ 0 ] .split ( " " ) [ 1 ] ) ;

  // Process the second line of input to create an array of individual numerical lengths.
  const lengthSegments = receivedContent [ 1 ] .split ( " " ) .map ( ( aSegment ) => {
    return Number ( aSegment ) ; // Ensure each piece is a proper numeric type.
  } ) ;

  // Initialize a tally that will store our final outcome, starting from a base value of one.
  var resultCounter = 1 ;

  // Set up a variable to track the ongoing accumulated span, beginning at zero.
  var currentProgress = 0 ;


  // Commence an iteration over each element within our collection of length segments.
  for ( var loopIterator = 0 ; loopIterator < totalItemsCount ; loopIterator ++ )
  {
    // Evaluate if the current accumulated progress has reached or surpassed the defined maximum limit.
    if ( currentProgress >= maximumThreshold ) {
      // If the condition is met, it's time to exit the loop prematurely.
      break ;
    }

    // Augment the accumulated progress by adding the value of the current segment.
    currentProgress += lengthSegments [ loopIterator ] ;

    // Increment our final result counter for every segment that is processed.
    resultCounter += 1 ;
  }

  // Display the computed result to the standard output stream.
  console .log ( resultCounter ) ;
} ;

// Invocation point: Read data from standard input and pass it to our core processing routine.
processInputData ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;