/*
 * This is a Type I code clone generated according to strict rules.
 * No functional changes are present.
 * Only whitespace and comments have been altered or added.
 */

// Enables strict mode for the entire script, enforcing stricter parsing and error handling.
'use strict';


// Main function definition.
// It takes 'input' as a string parameter.
function main(   input   )
{

  // --- Variable Declaration and Initialization ---

  // Parses the first relevant number from the input string.
  // Input is expected to be a single line with space-separated numbers.
  // The first number is extracted, converted to a numeric type, and assigned to 'x'.
  const   x   =   Number (   input . split ( '\n' ) [ 0 ] . split ( ' ' ) [ 0 ]   ) ;


  /*
   * The following lines were commented out in the original code.
   * They are preserved here as comments to maintain Type I cloning fidelity.
   * These variables ('r', 'd') are not utilized in the current logic.
   */
  // let r = Number(input.split('\n')[0].split(' ')[1]);
  // let d = Number(input.split('\n')[0].split(' ')[2]);


  // Declare a variable 'ans' to hold the final computed result.
  // It is initialized later based on conditional logic.
  let   ans ;


  // --- Conditional Logic for 'ans' Assignment ---

  // Determines the value of 'ans' based on the range 'x' falls into.
  // Each 'else if' block checks a specific range, ordered from lowest to highest.
  if   (   x   >=   400   &&   x   <   600   )
  {
      ans   =   8 ; // Assigned for x in the [400, 600) range.
  }
  else   if   (   x   >=   600   &&   x   <   800   )
  {
      ans   =   7 ; // Assigned for x in the [600, 800) range.
  }
  else   if   (   x   >=   800   &&   x   <   1000   )
  {
      ans   =   6 ; // Assigned for x in the [800, 1000) range.
  }
  else   if   (   x   >=   1000   &&   x   <   1200   )
  {
      ans   =   5 ; // Assigned for x in the [1000, 1200) range.
  }
  else   if   (   x   >=   1200   &&   x   <   1400   )
  {
      ans   =   4 ; // Assigned for x in the [1200, 1400) range.
  }
  else   if   (   x   >=   1400   &&   x   <   1600   )
  {
      ans   =   3 ; // Assigned for x in the [1400, 1600) range.
  }
  else   if   (   x   >=   1600   &&   x   <   1800   )
  {
      ans   =   2 ; // Assigned for x in the [1600, 1800) range.
  }
  else   if   (   x   >=   1800   &&   x   <   2000   )
  {
      ans   =   1 ; // Assigned for x in the [1800, 2000) range.
  }


  // --- Output Result ---

  // Prints the final value of 'ans' to the standard output.
  console . log (   ans   ) ;

}


// --- Program Entry Point ---

// Reads input from '/dev/stdin' using Node.js 'fs' module.
// The content is read as 'utf8' and passed to the 'main' function.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;