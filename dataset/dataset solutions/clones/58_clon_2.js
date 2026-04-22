require ( "fs" )
  . readFileSync ( "/dev/stdin" , "utf8" )  // Retrieve input from standard source
  . trim ( )                                // Clear peripheral whitespace
  . split ( '\n' )                          // Divide content by newline characters
  . map ( function ( currentInputItem ) {   // Process each resulting string segment
    // Perform an iterative calculation for each input item
    for ( let accumulatedValue = 0 ,       // Initialize calculation accumulator
              decrementingCounter = 600 ;  // Initialize a counter
          decrementingCounter -= currentInputItem ; ) // Loop while counter is positive after subtraction
    {
      // Add the product of counter squared and input item to the accumulator
      accumulatedValue += decrementingCounter * decrementingCounter * currentInputItem ;
    }
    // Display the final computed value for the current item
    console . log ( accumulatedValue ) ;
  } ) ;