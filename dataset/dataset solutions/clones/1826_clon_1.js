/*
 * This is the main function that processes the input for a specific calculation.
 * It expects an array where the first element is a string of space-separated numbers.
 */
function   main ( input )
{
  // The first element of the input array is expected to be a string.
  // This string is split by spaces, and each part is converted into an integer.
  const  args  =  input[0] . split ( ' ' ) . map ( n  =>  parseInt ( n ,  10 ) ) ;


  // Calculate the 'hour' component by taking the difference of the first and third arguments,
  // then multiplying by 60 to convert it into minutes.
  const   hour   =   ( args[0]   -   args[2] )   *   60   ;   // Component 1: (arg0 - arg2) * 60 minutes


  // Calculate the 'minute' component by taking the difference of the fourth and second arguments.
  const   minute   =   args[3]   -   args[1]   ;   // Component 2: (arg3 - arg1) minutes


  /*
   * The final result is obtained by summing the 'hour' and 'minute' components,
   * and then subtracting the fifth argument (args[4]).
   * This represents a cumulative time difference or similar calculation.
   */
  const   result   =   hour   +   minute   -   args[4]   ;


  // The computed result is then printed to the standard output.
  console . log ( result ) ;
}

// This section handles the execution of the main function.
// It reads input from '/dev/stdin' using Node.js's 'fs' module.
// The entire content of the file is read as a UTF-8 string,
// and then passed as the sole element of an array to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) . split ( '\n' ) ) ; // Splitting by newline to match original behavior if input had multiple lines.