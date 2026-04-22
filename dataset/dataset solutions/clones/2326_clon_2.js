// This function computes the least common multiple (LCM) of two positive integers.
// It internally uses a helper function to determine the greatest common divisor (GCD).
function calculateLcmValue(  valueA  ,  valueB  )
{
    // Helper function to find the greatest common divisor (GCD) using the Euclidean algorithm.
    // The GCD is recursively calculated until the second number becomes zero.
    var   determineGcd = ( operandOne , operandTwo  )   =>
      operandTwo
        ?
          determineGcd( operandTwo , operandOne % operandTwo )
        :
          operandOne
    ; // End of determineGcd function definition.

    // The LCM of two numbers (valueA, valueB) is their product divided by their GCD.
    return   (valueA  *  valueB)   /   determineGcd( valueA , valueB )   ;
} // End of calculateLcmValue function.


// This is the primary function that orchestrates the program's execution.
// It takes raw input, parses it, performs calculations, and outputs the result.
function   runProgramLogic ( inputDataSource )
{
    // First, process the raw input string.
    //   1. Remove leading/trailing whitespace using .trim().
    //   2. Split the string by spaces into an array of string components.
    //   3. Convert each string component into an integer using parseInt.
    const   numericDataSet   =   inputDataSource.
                                  trim().
                                  split( ' ' ).
                                  map( stringComponent => parseInt( stringComponent, 10 ) )   ;

    // Calculate the least common multiple for the first two numbers in our parsed dataset.
    const   finalCalculationResult   =   calculateLcmValue( numericDataSet[ 0 ] ,   numericDataSet[ 1 ] )   ;

    // Display the computed result to the standard output.
    console.log(   finalCalculationResult   )   ;
} // End of runProgramLogic function.


// Execute the main program logic.
// It reads content from standard input (typically /dev/stdin for competitive programming environments)
// as a UTF-8 encoded string and passes it to the primary processing function.
runProgramLogic(
  require( "fs" ).
    readFileSync( "/dev/stdin" ,   "utf8" )
); // End of program execution.