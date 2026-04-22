'use strict' // Enforce a stricter parsing and error handling mode for the script.

function processSequence(  initialText  ) {
  // Parse the raw input string, splitting it by newline characters,
  // then converting each segment into an integer using bitwise NOT.
  let   numericValues   =   initialText.split( '\n' ).map( parsedElement => ~~parsedElement ) ;

  // The very first numeric value in the processed array defines the upper bound
  // for the loop operations.
  const   upperLimit   =   numericValues[0] ;

  // A separate immutable array is created to hold the sequence of index references.
  // This array is a full copy of the numeric values.
  const   indexReferences   =   numericValues.slice( 0, numericValues.length ) ;

  // Initialize a variable to track the current position or pointer within the sequence.
  let   currentPointer   =   1 ;

  // Initialize a variable to temporarily store the next calculated position.
  let   nextPointer   =   0 ;

  // Initialize a counter to keep track of the number of steps or operations performed.
  let   operationSteps   =   1 ;

  // Begin a loop that continues as long as the operation step count
  // remains below the defined upper limit.
  while (  operationSteps   <   upperLimit  ) {
    // Determine the subsequent position by looking up the value
    // at the 'currentPointer' in the 'indexReferences' array.
    nextPointer   =   indexReferences[  currentPointer  ] ; // This value indicates the next jump.

    // Check if the determined next position is the specific target value (2).
    if (  nextPointer   ===   2  ) {
      // If the target is found, output the total number of operations
      // taken to reach it and terminate the function.
      console.log(  operationSteps  ) ;
      return ; // Exit the function immediately.
    }

    // If the target was not 2, update the 'currentPointer' to the 'nextPointer'
    // to continue traversing the sequence.
    currentPointer   =   nextPointer ;

    // Increment the operation step counter for the next iteration of the loop.
    operationSteps++ ;
  }

  // If the loop completes without encountering the target value (2),
  // it signifies that the target was unreachable, so output -1.
  console.log(  -1  ) ;
}

// Invoke the sequence processing function, feeding it data read from
// the standard input stream, encoded as UTF-8.
processSequence(  require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' )  ) ;