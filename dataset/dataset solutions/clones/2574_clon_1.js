function   Main  (  input  )
{
  /*
   * This function is the primary entry point for processing the input.
   * It takes a single string 'input' which contains all the necessary data.
   */

  // First step: Split the entire input string by newline characters.
  // This separates the input into individual lines.
  input   =   input .   split ( "\n" ) ;


  // The first line of the input is expected to contain the value for 'n'.
  // It's then split into individual characters, which might be a specific requirement.
  n   =   input [ 0 ] .   split ( "" ) ;


  // The second line of input represents array 'a'.
  // It's split by spaces to get its elements.
  a   =   input [ 1 ] .   split ( " " ) ;

  // The third line of input represents array 'b'.
  // Its elements are also space-separated.
  b   =   input [ 2 ] .   split ( " " ) ;

  // The fourth line of input represents array 'c'.
  // Similarly, its elements are space-separated.
  c   =   input [ 3 ] .   split ( " " ) ;

  // Initialize a variable 'ans' to store the cumulative answer.
  // It starts with a value of zero.
  var   ans   =   0 ;


  // Begin a loop that iterates 'n' times.
  // The variable 'i' serves as the loop counter, starting from 0.
  for ( var   i   =   0 ;   i   <   n ;   i ++ )
  {
    // Add a value to 'ans'. This value is retrieved from array 'b'.
    // The index for 'b' is derived from `a[i] - 1`.
    ans   +=   Number ( b [ a [ i ] - 1 ] ) ;

    // This conditional statement checks for two conditions:
    // 1. If 'i' is greater than 0 (meaning it's not the first element).
    // 2. If the current element `a[i]` is exactly one greater than the previous element `a[i-1]`.
    if (   i   >   0   &&   a [ i ]   ==   Number ( a [ i - 1 ] )   +   1   )
    {
      // If both conditions are true, add another value to 'ans'.
      // This value comes from array 'c', indexed by `a[i-1] - 1`.
      ans   +=   Number ( c [ a [ i - 1 ] - 1 ] ) ;
    }
  }

  // After the loop completes, print the final calculated answer to the console.
  console .   log ( ans ) ;
}

/*
 * This part of the script handles reading the input from standard input
 * and then passes it to the `Main` function for processing.
 * It uses Node.js's 'fs' module to read the file.
 */
Main ( require ( "fs" ) .   readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;