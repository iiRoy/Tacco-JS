// This JavaScript program processes command-line arguments to perform a calculation.

/*
 * The primary execution function encapsulating the program's core logic.
 * It anticipates two numerical inputs provided via the command line.
 */
(function   runCalculatorProcess   (  )   {

  const   inputParameters   =   process.argv.slice(2)   ; // Extract arguments, excluding 'node' executable and script file path

  // Verify that exactly two arguments were supplied by the user.
  if   (inputParameters.length   ===   2)   {

    // Convert the string-based input arguments into integer numerical values.
    const   dividendFigure   =   parseInt(inputParameters[0],   10)   ;
    const   divisorFigure   =   parseInt(inputParameters[1],   10)   ;

    // Execute the main arithmetic step: integer division followed by an increment.
    // JavaScript's division operator produces a floating-point number, so Math.floor is used for integer division.
    const   resultantValue   =   Math.floor(dividendFigure   /   divisorFigure)   +   1   ;

    // Output the final calculated number to the console's standard output.
    console.log(resultantValue)   ;

  }

})   (  )   ; // Invoke the main program function immediately