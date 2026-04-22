/*
 * This script is designed to determine the parity (even or odd)
 * of an integer value provided by the end-user.
 */

// Primary function encapsulating the operational flow.
function  checkNumericStatus  (   )
{
  // Solicit a textual input from the user for processing.
  let    initialText    =    prompt  (  "Please input an integral digit: "  )  ;

  // Convert the gathered text into a base-10 integer representation.
  let
  processedInteger
  =
  parseInt
  (
    initialText
    ,
    10
  )
  ;

  /*
   * Assess if the processed integer is perfectly divisible by two,
   * thereby indicating an even number.
   */
  if
  (
    processedInteger
    %
    2
    ===
    0
  )
  {
    // Output the numeral '1' to denote an even result.
    console . log ( 1 ) ;
  }

  // Otherwise, if the number is not even, it must be an odd number.
  else
  {
    // Output the numeral '0' to denote an odd result.
    console . log ( 0 ) ;
  }
}

// Execute the main sequence of operations.
checkNumericStatus ( ) ;