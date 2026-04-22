/*
 * This is a Type I clone of a JavaScript program.
 * It processes input from standard input,
 * extracting specific numeric values and performing a calculation.
 *
 * All original identifiers, variable names, function names,
 * operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered
 * to create a visually distinct but functionally identical version.
 */
'use strict'
; // Enforce strict mode for the entire script, improving code quality and catching common errors.

// --- Constant Definitions ---
// These constants define the delimiter for input splitting and the indices
// for accessing specific values within the parsed input array.
const  DELIMITER = " " ; // The character used to separate values in the input string.
const  A_INDEX   = 0   ; // Array index for the first numeric value, assigned to 'a'.
const  B_INDEX   = 1   ; // Array index for the second numeric value, assigned to 'b'.
const  C_INDEX   = 2   ; // Array index for the third numeric value, assigned to 'c' (parsed but not used in the final calculation in this specific logic).
const  K_INDEX   = 3   ; // Array index for the fourth numeric value, assigned to 'K', which determines the sign of the output.


/**
 * Processes a given input string to calculate and print a result.
 * The calculation involves parsing four space-separated integers,
 * computing the difference between the first two, and then
 * conditionally negating this difference based on the parity of the fourth integer.
 *
 * @param {string} input - A string containing space-separated integer values.
 *                         Example: "10 5 20 3"
 * @returns {void} - This function does not return a value; it prints the result directly to the console.
 */
const process =   input  =>  {

  // Step 1: Split the input string into an array of string numbers using the predefined delimiter.
  const  indexArr  =  input . split ( DELIMITER ) ;

  // Step 2: Parse the required string values from the array into integer variables.
  // Using parseInt() to convert string representations of numbers to actual integers.
  let  a   =  parseInt ( indexArr [ A_INDEX ] ) ;
  let  b   =  parseInt ( indexArr [ B_INDEX ] ) ;
  let  c   =  parseInt ( indexArr [ C_INDEX ] ) ; // Value 'c' is parsed but remains unused in the subsequent logic.

  // Step 3: Perform the initial calculation: find the difference between 'a' and 'b'.
  let  ans =   a  -  b ;

  // Step 4: Parse the 'K' value, which acts as a flag for the final result's sign.
  const  K   =  parseInt ( indexArr [ K_INDEX ] ) ;

  // Step 5: Determine the final output based on the parity of 'K'.
  // If K is an even number (K % 2 === 0), the result is 'ans'.
  // If K is an odd number, the result is '-ans' (negation of 'ans').
  console . log ( K  %  2  ===  0  ?  ans  :  -ans ) ;
}


// --- Main Execution Block ---
// This part reads data from standard input, typically used in competitive programming environments,
// and then passes that data to the 'process' function for calculation.
process ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// 'require("fs")' imports the Node.js file system module.
// '.readFileSync("/dev/stdin", "utf8")' reads the entire content of standard input synchronously
// and decodes it as a UTF-8 string.
// The resulting string is then passed to the 'process' function.