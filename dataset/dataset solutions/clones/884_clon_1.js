/*
 * This is a Type I clone generated from an original JavaScript source file.
 * All core logic, identifiers, and expressions remain identical to the source.
 * Only whitespace (spacing, indentation, blank lines) and comments have been extensively altered.
 *
 * Original file likely created around 2013-10-06.
 */


    var fs     = require ( 'fs' ) ; /* Import the Node.js file system module for I/O operations */


    var length = fs.fstatSync ( process.stdin.fd ) .size ; /* Determine the total size of the standard input stream */


    var buffer = new Buffer ( length ) ; /* Allocate a new Buffer object to hold the incoming data, sized to 'length' */


    var bytesRead = fs.readSync ( process.stdin.fd , buffer , 0 , length , 0 ) ; /* Synchronously read data from stdin into the buffer */


    var input = buffer.toString ( 'utf8' , 0 , bytesRead ) .split ( '\n' ) ; /* Convert the buffer content to a UTF-8 string and split it into an array of lines */


main ( ) ; /* Invoke the primary function to begin program execution */


function main ( )
{

  // Declaration of local variables for the main function.
  // These variables hold state and intermediate results during processing.

  var str = input [ 0 ] ; // The first line from the input array, which is the string to be converted.


  var ans = '' ; // The accumulating output string, representing the generated Brainfuck-like code.


  var i , len , j , diff , sqr , pmchar ; // General-purpose loop counters and temporary calculation variables.


  var prev = 0 ; // Stores the character code of the *previous* character processed, initialized to 0.


  var N = 16 ; // A constant threshold value used in conditional logic for generating output.


  var charCodeList = [ ] ; // An array to store the Unicode (UTF-16) character codes of the input string.


    // First processing loop: Populate the 'charCodeList' array.
    // This loop iterates through each character of the input string 'str'.
    for ( i = 0 , len = str.length ; i < len ; i ++ )
    {

      charCodeList [ i ] = str.charCodeAt ( i ) ; // Get the character code at index 'i' and store it.

    }


  // Main transformation loop: Generate the Brainfuck-like output string 'ans'.
  // This loop iterates through the 'charCodeList', calculating differences between consecutive characters.
  for ( i = 0 ; i < len ; prev = charCodeList [ i ] , i ++ )
  {

    // Calculate the raw difference between the current character's code and the previous character's code.
    diff = charCodeList [ i ] - prev ;


    // Determine the appropriate Brainfuck-like increment/decrement character based on the difference's sign.
    pmchar = diff > 0 ? '+' : '-' ;


    // Take the absolute value of the difference, as its magnitude is what matters for operations.
    diff = Math.abs ( diff ) ;


    // Conditional branching based on the magnitude of the absolute difference.
    if ( diff < N ) // If the difference is relatively small (less than N).
    {

      // Directly append the 'pmchar' character 'diff' number of times to 'ans'.
      for ( j = diff ; j > 0 ; j -- )
      {

        ans += pmchar ; // Append either '+' or '-' to the output.

      }

    }
    else // If the difference is large (equal to or greater than N).
    {

      // Calculate the integer square root of the difference using bitwise OR (~~) for truncation.
      sqr = ~~Math.sqrt ( diff ) ;


      ans += '>' ; // Append '>' (move data pointer right) to 'ans'.


      // Append '+' 'sqr' times to the output. This effectively sets a cell's value to 'sqr'.
      for ( j = sqr ; j > 0 ; j -- )
      {

        ans += '+' ;

      }


      ans += '[<' ; // Append '[<' (start loop, move pointer left) to 'ans'.


      // Inside the loop, append 'pmchar' 'sqr' times. This performs 'sqr' operations on the left cell.
      for ( j = sqr ; j > 0 ; j -- )
      {

        ans += pmchar ;

      }


      ans += '>-]<' ; // Append '>-]<' (move right, decrement cell, end loop, move left) to 'ans'.


      // Handle any remaining difference after the square root-based operation.
      // Append 'pmchar' (diff - sqr * sqr) times.
      for ( j = diff - sqr * sqr ; j > 0 ; j -- )
      {

        ans += pmchar ;

      }


    } // End of the 'if-else' block for handling differences.


    ans += '.' ; // Append '.' (print current cell value) to 'ans' after processing each character.

  } // End of the main character code processing loop.


  // Output the final generated Brainfuck-like string to the console.
  console.log ( ans ) ;

} // End of the 'main' function definition.