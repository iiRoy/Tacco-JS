/*
 * This is a JavaScript program designed to solve a specific problem.
 * It utilizes 'strict' mode for better error handling and code quality.
 */
'use strict' ; /* Enforces strict parsing and error handling in the code */

// The primary function that encapsulates the main logic of the program.
function   main   (   input   )       {

  // Step 1: Process the raw input string.
  // It's assumed the input consists of multiple lines, separated by newline characters.
  const   lines   =   input . split ( '\n' ) ; /* Divides the input into an array of strings, one for each line */


  /*
   * Step 2: Parse the first line of input.
   * This line is expected to contain an integer value, often representing a count or size.
   */
  const   N   =   parseInt ( lines [ 0 ] ) ; // Converts the first line string to an integer


  // Step 3: Extract and process data from the second line.
  // This involves several transformations: splitting, converting to numbers, and sorting.
  const   l   =   lines [ 1 ]
    . split ( ' ' ) /* Splits the second line by spaces into an array of string numbers */
    . map ( Number ) /* Transforms each string number in the array to an actual number type */
    . sort ( ( a , b ) => a - b ) ; // Sorts the array of numbers in ascending order


  /*
   * Step 4: Determine the maximum value.
   * Since the array 'l' is sorted, the largest element is at the end.
   * The 'pop()' method conveniently removes and returns this last element.
   */
  const   max   =   l . pop ( ) ; // Retrieves the largest number and removes it from 'l'


  // Step 5: Calculate the sum of the remaining elements.
  // The 'reduce()' method is used to aggregate all elements into a single sum.
  const   sum   =   l . reduce ( ( prev , curr , i , arr ) => prev + curr ) ; /* Sums all remaining numbers in the array 'l' */


  // Step 6: Output the final result based on a comparison.
  // The program checks if the 'max' value is less than the 'sum' of the others.
  console . log ( max   <   sum   ?   'Yes'   :   'No' ) ; // Prints 'Yes' or 'No' to the console

} // End of the 'main' function definition.


// This section handles the execution of the program.
// It reads input from standard input and passes it to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; /* Invokes the main function with content read from stdin */