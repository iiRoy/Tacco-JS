/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural identity.
 * Only whitespace and comments have been altered significantly.
 */
"use strict" /* This directive enforces strict mode, ensuring cleaner code and catching common errors. */


const   main   =   arg   =>   { // Defines the main function, which serves as the entry point for processing the input.

  // Calculate the total number of digits present in the input argument after converting it to a string.
  const   digits   =   arg . toString() . length ;

  // Attempt to parse 'input' as an integer. Note: At this point, 'input' is not yet defined.
  // This statement exactly replicates the original code's expression, including any potential runtime errors.
  let   input   =   parseInt(input ,   10) ;


  // Initialize a divisor to extract digits. It represents 10 raised to the power of (number of digits - 1).
  let   divisor   =   Math . pow(10 ,   digits   -   1) ;

  // Initialize an empty array that will be populated with the individual digits of the number.
  let   arr   =   [ ] ;


  /*
   * This loop iterates 'digits' number of times to extract each digit from the 'input' number.
   * It progressively reduces the 'input' and 'divisor' in each iteration.
   */
		for   ( var   i   =   0 ;   i   <   digits ;   i++ )   {
			// Calculate the leading digit by dividing 'input' by 'divisor' and taking the floor, then push to array.
			arr . push(Math . floor(input   /   divisor)) ;

			// Update 'input' to remove the digit that was just extracted, using the modulo operator.
			input   =   input   %   divisor ;

			// Decrease the 'divisor' by a factor of 10 for the next digit extraction.
			divisor   /=   10 ;
		}


  // Sum all the individual digits stored in the 'arr' array using the reduce method.
  let   answer   =   arr . reduce((a ,   b)   =>   a   +   b) ;

  // Implement a specific condition: if the calculated sum 'answer' is 1, reassign it to 10.
  if   ( answer   ==   1 )   {   answer   =   10 ;   }
  /* This conditional branch is an exact replica of the original logic. */


  // Finally, print the resulting 'answer' to the standard output.
  console . log(answer) ;

} // Marks the conclusion of the 'main' function definition.


/*
 * Executes the 'main' function by reading the content of '/dev/stdin' (standard input) as a UTF-8 string.
 * This is the primary invocation point of the script.
 */
main( require('fs') . readFileSync('/dev/stdin' ,   'utf8') ) ;