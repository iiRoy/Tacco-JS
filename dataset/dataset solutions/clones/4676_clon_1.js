/*
 * This JavaScript file contains two primary functions:
 *   1. 'Main': The core logic processing function.
 *   2. 'debug': A helper function for testing within a browser environment.
 *
 * The script is designed to read input, process it based on specific conditions,
 * and then output a result.
 */

function   Main (   input   )    {

  // The input string is expected to contain two space-separated values.
  // These values are parsed into an array.
  input   =    input .   split (   " "   )   ;

  // The first element of the parsed input array is assigned to variable 'a'.
  var   a    =    input [   0   ]   ;

  // The second element of the parsed input array is assigned to variable 'b'.
  var   b    =    input [   1   ]   ;

  // A variable 's' is declared to store the final result of the conditional logic.
  var   s   ;

  /*
   * This complex conditional block determines the value of 's'
   * based on the values of 'a' and 'b'.
   *
   * It implements a logic similar to an XOR or XNOR gate depending on the interpretation.
   */
  if (   a   !=   "H"   )
  {
    // Case 1: 'a' is not "H"
    // Further check the value of 'b'
    if (   b   ==   "H"   )
    {
      s   =   "D"   ;   // If 'b' is "H", 's' becomes "D"
    }
    else
    {
      s   =   "H"   ;   // If 'b' is not "H", 's' becomes "H"
    }
  }
  else
  {
    // Case 2: 'a' is "H"
    // Further check the value of 'b'
    if (   b   ==   "H"   )
    {
      s   =   "H"   ;   // If 'b' is "H", 's' becomes "H"
    }
    else
    {
      s   =   "D"   ;   // If 'b' is not "H", 's' becomes "D"
    }
  }

  // The determined value of 's' is then printed to the console.
  console .   log (   '%s'   ,   s   )   ;

}


/*
 * The 'debug' function is provided for testing the 'Main' function
 * within a web browser environment.
 *
 * It retrieves input from an HTML element with the ID "input"
 * and passes it to the 'Main' function.
 */
function   debug   (   )    {

  var   input   =    document .   getElementById (   "input"   ) .   value   ;   // Fetches the value from the input field.

  Main (   input   )   ;   // Executes the main processing logic.

}


/*
 * This line is responsible for executing the 'Main' function
 * when the script is run in a Node.js environment.
 *
 * It reads the entire content of the standard input ("/dev/stdin")
 * as a UTF-8 encoded string and passes it to 'Main'.
 */
Main (   require (   "fs"   ) .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;