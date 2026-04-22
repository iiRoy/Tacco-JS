function ProcessInputData ( rawTextContent )
{
  // This function takes raw text input and processes it to find a specific numerical pattern.

  /*
   * The primary numerical value is initialized by parsing the input string.
   * Any leading or trailing whitespace is removed before the conversion.
   */
  let initialValue = parseFloat( rawTextContent.trim() ) ;

  // This variable is declared to hold a potential final outcome, mirroring the original structure.
  let calculatedOutcome = initialValue ;
  
  // Commence an iterative cycle, starting from one and continuing as long as the index is less than the current initialValue.
  for ( let outerLoopIndex = 1 ; outerLoopIndex < initialValue ; outerLoopIndex++ )
  {
    // The accumulator for the current iteration starts with the value of the outer loop's index.
    let currentAccumulator = outerLoopIndex ;

    // Calculate the difference and convert it into a string to process its individual digits.
    let digitString = ( initialValue - currentAccumulator ) . toString ( ) ;

    // Iterate through each character (which represents a digit) in the generated string.
    for ( let innerLoopIndex = 0 ; innerLoopIndex < digitString.length ; innerLoopIndex ++ )
    {
      // Convert each character back to a number and add it to the running total.
      currentAccumulator += parseFloat ( digitString [ innerLoopIndex ] ) ;
    }

    // Evaluate the relationship between the original initialValue and the newly computed currentAccumulator.
    if ( initialValue > currentAccumulator )
    {
      // If the currentAccumulator is smaller, it becomes the new target for subsequent iterations.
      initialValue = currentAccumulator ;
    }
    else if ( initialValue === currentAccumulator )
    {
      // If both values are identical, the desired pattern has been identified.
      // Output the result to the console and terminate the function's execution.
      console . log ( currentAccumulator ) ;
      return ;
    }
  }
} // End of the ProcessInputData function.

// Initiate the processing by reading data from standard input, using Node.js file system module.
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;