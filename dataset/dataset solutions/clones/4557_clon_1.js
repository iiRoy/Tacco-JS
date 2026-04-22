/*
 * This JavaScript file begins with the 'use strict' directive,
 * ensuring that the code runs in strict mode, which helps catch
 * common coding errors and "unsafe" actions.
 */
'use strict' ;


// This is the primary function that processes the given input.
// It takes a single argument, 'INPUT', which is expected to be a string.
function Main ( INPUT )
{
  /*
   * The input string is first split by the newline character ("\n").
   * We then take the very first element of the resulting array,
   * which represents the first line of the input.
   * This first line is subsequently split by a space character (" ")
   * to yield an array of string components.
   */
  const   input   =   INPUT . split ( "\n" ) [ 0 ] . split ( " " ) ;


  // The first component from the 'input' array is parsed as an integer.
  // The radix '10' is explicitly provided to ensure decimal interpretation.
  // This parsed integer is assigned to the constant variable 'x'.
  const   x       =   parseInt ( input [ 0 ] ,   10 ) ;


  // Similarly, the second component from the 'input' array is parsed
  // as an integer, using radix '10'.
  // This integer value is then assigned to the constant variable 'y'.
  const   y       =   parseInt ( input [ 1 ] ,   10 ) ;


  /*
   * Here, we define a constant array named 'a'.
   * This array contains a specific sequence of integer values.
   * In the context of a "month days" problem, these often represent
   * months that have 31 days (e.g., January, March, May, July, August, October, December).
   */
  const   a       =   [ 1 ,   3 ,   5 ,   7 ,   8 ,   10 ,   12 ] ;


  // We define another constant array, 'b'.
  // This array also holds integer values.
  // Following the "month days" pattern, these would typically be months
  // with 30 days (e.g., April, June, September, November).
  const   b       =   [ 4 ,   6 ,   9 ,   11 ] ;


  // The core logic of the program resides within this 'if' statement.
  // It evaluates a complex boolean condition composed of three main parts,
  // joined by logical OR (||) operators.
  //
  // Condition 1: ( x == 2 && x == y )
  //   - This checks if both 'x' and 'y' are equal to '2' (often representing February).
  //
  // Condition 2: ( a.indexOf(x) >= 0 && a.indexOf(y) )
  //   - This checks if 'x' is found in array 'a' (meaning 'a.indexOf(x)' is not -1).
  //   - AND it checks the truthiness of 'a.indexOf(y)'. In JavaScript, '0' is falsy,
  //     while any other number (positive or negative) is truthy. So, this part is true
  //     if 'y' is in 'a' at an index other than '0' (e.g., if 'a.indexOf(y)' is 1, 2, -1, etc.,
  //     but not if 'a.indexOf(y)' is 0).
  //
  // Condition 3: ( b.indexOf(x) >= 0 && b.indexOf(y) )
  //   - Similar to Condition 2, this checks if 'x' is found in array 'b'.
  //   - AND it checks the truthiness of 'b.indexOf(y)', meaning 'y' is in 'b' at an index
  //     other than '0'.
  if
  (
      (   x   ==   2   &&   x   ==   y   )
    ||
      (   a . indexOf ( x )   >=   0   &&   a . indexOf ( y )   )
    ||
      (   b . indexOf ( x )   >=   0   &&   b . indexOf ( y )   )
  )
  {
    // If any of the three conditions above evaluate to true,
    // the program will print the string "Yes" to the console.
    console . log ( "Yes" ) ;
  }
  else
  {
    // If none of the conditions in the 'if' statement are met (i.e., all are false),
    // then the program will execute this 'else' block.
    // It will print the string "No" to the console.
    console . log ( "No" ) ;
  }
}


/*
 * This line is responsible for invoking the 'Main' function.
 * It reads the entire content of the standard input stream ("/dev/stdin")
 * as a UTF-8 encoded string.
 * The 'require("fs")' statement loads the Node.js file system module,
 * and 'readFileSync' is used to perform a synchronous file read operation.
 * The resulting string content is then passed as the 'INPUT' argument to 'Main'.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;