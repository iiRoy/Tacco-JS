/*
 * This JavaScript code snippet defines a function 'Main' that processes
 * an input string, typically from standard input in a competitive programming context.
 * It performs calculations based on an array of numbers derived from the input
 * and then prints a "Yes" or "No" result to the console.
 */
function     Main  (   input   )
{


  // The raw input string is first split into an array of lines using the newline character as a delimiter.
  input   = input . split (   "\n"   ) ;


  /*
   * The first element of the 'input' array (which is the first line)
   * is parsed as an integer and assigned to the variable 'n'.
   * This 'n' typically represents the count or size of something.
   */
  var   n   =   parseInt (   input[0]   ) ;


  // The second line of input is split by spaces, producing an array of string tokens.
  tmp   =   input[1] . split (   " "   ) ;


  // A new array named 'a' is instantiated with a length of 'n' and all its elements are initialized to 0.
  a   =   new   Array (   n   ) . fill (   0   ) ;


  // This 'for' loop iterates 'n' times to populate the array 'a'.
  for (   i   =   0   ;   i   <   n   ;   i ++   )
  {
    // Each string token from 'tmp' is converted into an integer and stored in the corresponding position in 'a'.
    a[i]   =   parseInt (   tmp[i]   ) ;
  }


  // Initialize two counter variables: 'odd' for odd numbers and 'four' for multiples of four.
  var   odd   =   0   ;

  var   four   =   0   ;


  /*
   * Another 'for' loop iterates through the array 'a' to categorize its elements.
   * It counts numbers that are odd and numbers that are multiples of four.
   */
  for (   i   =   0   ;   i   <   n   ;   i ++   )
  {

    // Check if the current number 'a[i]' is odd (remainder of division by 2 is 1).
    if   (   a[i]   %   2   ==   1   )
    {
      odd ++   ; // If it's odd, increment the 'odd' counter.
    }
    // If the number is not odd (meaning it's even), then check if it's a multiple of four.
    else if   (   a[i]   %   4   ==   0   )
    {
      four ++   ; // If it's a multiple of four, increment the 'four' counter.
    }
  }


  // Initialize the result string 'ans' to "No" as a default value.
  var   ans   =   "No"   ;


  // Now, a series of conditional checks determine if the answer should be "Yes".
  if   (   odd   ==   0   )
  {
    ans   =   "Yes"   ; // Condition 1: If there are no odd numbers at all.
  }
  else if   (   odd   -   four   <=   0   )
  {
    ans   =   "Yes"   ; // Condition 2: If the count of odd numbers minus the count of multiples of four is less than or equal to zero.
  }
  else if   (   n   %   2   ==   1   &&   odd   -   four   <=   1   &&   four   >   0   )
  {
    // Condition 3: If 'n' is odd, AND the difference (odd - four) is 0 or 1, AND there is at least one multiple of four.
    ans   =   "Yes"   ;
  }


  // Finally, the determined answer ('ans') is printed to the console.
  console . log   (   '%s'   ,   ans   ) ;

} // End of the 'Main' function definition.


/*
 * This line is crucial for executing the program in environments
 * where input is provided via standard input (like /dev/stdin).
 * It reads the entire content of the specified file ('/dev/stdin'),
 * decodes it as UTF-8, and then passes this string to the 'Main' function.
 */
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   ) ;