/*
 * This JavaScript module processes input data received from standard input.
 * The 'input' parameter is expected to contain the entire input string,
 * which will then be parsed and analyzed.
 *
 * The primary objective of this function is to determine if a specific
 * set of digits ('1', '9', '7', '4') are all present within the
 * space-separated tokens of the input string.
 */

 function   Main  (   input   )
 {
    // First, the input string is split into an array of substrings
    // using a single space character as the delimiter.
    // This effectively breaks the input into individual tokens.
    input  =  input . split (  " "  ) ;


    // Next, we evaluate a complex boolean expression.
    // This expression checks for the presence of four specific digit strings:
    // '1', '9', '7', and '4'.
    // The 'indexOf' method returns the first index at which a given element
    // can be found in the array, or -1 if it is not present.
    // Therefore, 'indexOf(digit) >= 0' evaluates to true if the digit is found.
    // All four conditions must be true for the overall expression to be true.
    console . log (
                   input . indexOf (  '1'  )  >=  0
                && input . indexOf (  '9'  )  >=  0
                && input . indexOf (  '7'  )  >=  0
                && input . indexOf (  '4'  )  >=  0

             // If all conditions are met, output 'YES'.
             ?   'YES'

             // Otherwise, if any condition is not met, output 'NO'.
             :   'NO'
    ) ;

 }


 //  ************************************************************************************************
 //  *  IMPORTANT: DO NOT MODIFY THE CODE BEYOND THIS POINT.                                        *
 //  *  This section is responsible for reading input from standard I/O                            *
 //  *  and invoking the 'Main' function with the retrieved data.                                   *
 //  *  Any changes here could disrupt the execution environment.                                   *
 //  ************************************************************************************************
 Main (  require ( "fs" ) . readFileSync (  "/dev/stdin"  ,  "utf8"  )  ) ;