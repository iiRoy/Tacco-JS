/*
 * This JavaScript file processes numerical input to determine a specific condition.
 * It demonstrates basic input parsing, arithmetic operations, and conditional logic.
 *
 * This code is a Type I clone, meaning it is functionally identical to the original,
 * with extensive changes only in whitespace and comments.
 * All identifiers, variable names, function names, operators, and expressions
 * remain absolutely unchanged as per the strict definition of Type I cloning.
 */


// The primary function definition begins here.
// It takes a single argument 'input', which is expected to be an array of strings.
function   Main   ( input )
{

  // Declare and initialize four variables by parsing the first four elements
  // of the 'input' array into base-10 integers.
  // Each line explicitly converts a string input to its numerical representation.
  var   A   =   parseInt(input[0], 10) ; // Variable A gets the first integer.
  var   B   =   parseInt(input[1], 10) ; // Variable B gets the second integer.
  var   C   =   parseInt(input[2], 10) ; // Variable C gets the third integer.
  var   D   =   parseInt(input[3], 10) ; // Variable D gets the fourth integer.


  // Perform the first calculation: Determine 'tNum'.
  // This calculates the ceiling of the division of C by B.
  var   tNum   =   Math.ceil(C/B) ;


  // Perform the second calculation: Determine 'aNum'.
  // This calculates the ceiling of the division of A by D.
  var   aNum   =   Math.ceil(A/D) ;


  // Output the result based on a comparison.
  // If 'tNum' is less than or equal to 'aNum', print 'Yes'; otherwise, print 'No'.
  console.log   ( tNum <= aNum ? 'Yes' : 'No' ) ;

} // End of the 'Main' function.


// This section handles the program's entry point and input preparation.
// It reads data from standard input, processes it, and then passes it to the 'Main' function.

/*
 * The following complex expression is responsible for reading and formatting the input:
 *
 * 1. `require("fs")`: Imports the Node.js 'fs' (file system) module.
 * 2. `.readFileSync("/dev/stdin", "utf8")`: Reads the content of standard input synchronously,
 *    interpreting it as UTF-8 encoded text. This returns the entire input as a single string.
 * 3. `.trim()`: Removes any leading or trailing whitespace (like newlines) from the input string.
 * 4. `.split(/\n|\s/)`: Splits the cleaned string into an array of substrings.
 *    The regular expression `/\n|\s/` means it splits by any newline character or any whitespace character.
 *    This effectively separates individual numbers provided in the input into an array of strings.
 *
 * The resulting array of string numbers is then passed as the 'input' argument to the 'Main' function.
 */
Main   ( require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/) ) ;


// The program concludes after the execution of the Main function.
// No further code or processing occurs beyond this point.