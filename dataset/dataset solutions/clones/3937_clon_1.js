/*
 *  This JavaScript file is designed to calculate a travel budget based on input values.
 *  It demonstrates basic file I/O and array manipulation.
 */

"use strict"
; // Enforces stricter parsing and error handling in the code.


const   DEBUG_MODE  =   false ; // A flag to easily switch between debug data and live input.


// Variable to store the raw input data.
// It either uses a hardcoded string for debugging or reads from standard input.
const rawInput = DEBUG_MODE
  ? "600\n300\n220\n420" // Debugging values: two pairs of budget items.
  : require ( "fs" )      // Node.js 'fs' module for file system operations.
      . readFileSync ( "/dev/stdin" ,   "utf8" ) // Reads the entire content of '/dev/stdin' as UTF-8.
      . trim ( ) // Removes any leading or trailing whitespace from the input.
; // End of rawInput variable declaration.


/**
 *  @function process
 *  @param {string} inputRaw - The raw string input containing numbers separated by newlines.
 *  @description This function takes the raw input, parses it, and calculates the total minimum budget.
 */
const   process = inputRaw =>
{
  // Splits the input string by newlines, then converts each part into an integer.
  const   inputs  =   inputRaw . split ( "\n" ) . map ( input =>   parseInt ( input ) )
  ; // Semicolon for the 'inputs' declaration.


  // Calculates the sum of the minimums of two pairs of numbers.
  // The first pair is inputs[0] and inputs[1].
  // The second pair is inputs[2] and inputs[3].
  console . log (
      Math . min . apply ( Math ,   inputs . slice ( 0 ,   2 ) ) // Gets the minimum of the first two budget items.
    + // Addition operator to sum the two minimums.
      Math . min . apply ( Math ,   inputs . slice ( 2 ,   4 ) )   // Gets the minimum of the next two budget items.
  )
  ; // Semicolon for the console.log statement.
}
; // Semicolon for the 'process' function declaration.


// Invokes the main processing function with the raw input data.
process (   rawInput   )
; // Semicolon for the function call.