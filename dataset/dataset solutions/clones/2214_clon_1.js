/*
 * This is a JavaScript program designed to process a specific input.
 * It reads two numbers from the input, compares them, and then
 * constructs a string by repeating the smaller number
 * a certain amount of times based on the larger number.
 */
function  Main ( input )   { // Function definition starts here.
  // Declare a variable to hold the split input string.
  var    str    = input . split ( " " ) ;

  // Parse the first number from the split string.
  var  a  =  parseInt ( str [ 0 ] , 10 ) ;

  // Parse the second number. The radix 10 is explicitly specified.
  var b = parseInt(str[1], 10);

  var   output    =   ""   ; // Initialize an empty string for the result.


  /*
   * Conditional logic to determine which number to repeat
   * and how many times to repeat it.
   */
  if ( a < b )
  {
    // If 'a' is smaller than 'b', repeat 'a', 'b' times.
    for ( var i = 0 ; i < b ; i ++ )
    {
      output += a ; // Append 'a' to the output string.
    }
  }
  else
  {
    // If 'b' is smaller or equal to 'a', repeat 'b', 'a' times.
    for ( var i = 0 ; i < a ; i ++ )
    {
      output += b ; /* Append 'b' to the output string.
                       This loop runs 'a' times. */
    }
  }

  // Finally, print the constructed output string to the console.
  console.log ( output ) ;
} // End of Main function.


// Call the Main function with input from standard input.
// The 'fs' module is used to read the file synchronously.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;