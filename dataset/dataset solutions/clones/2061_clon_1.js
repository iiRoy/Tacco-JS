/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical identity.
 * Only whitespace and comments have been altered significantly.
 */

// Define the main function to process the given input
function        Main(   input   )
{
  // First, split the entire input string into an array of lines,
  // using the newline character as the delimiter.
  input   =   input.split( "\n" ) ;


  /*
   * This loop iterates through the input array, processing data in pairs of lines.
   * 'i' is incremented by 2 in each step to pick up the next set of N and 'a'.
   */
  for (  i   =   0  ;   i   <   input.length  ;   i   =   i   +   2   )
  {
    // The first line of each pair represents an integer N.
    var     N       =       parseInt(   input[ i ]   )
    ;

    // The second line of each pair represents a string 'a', which is split into characters.
    var     a       =       input[ i + 1 ].split( "" )
    ;

    // Convert the array of character-digits into an array of actual numbers.
    var     aa      =       a.map(  Number  )
    ;

    /*
     * This nested loop structure performs a specific transformation on the 'aa' array.
     * The outer loop decrements 'j' from N down to 2.
     * Each iteration effectively reduces the length of the sequence being processed.
     */
    for (   j   =   N   ;   j   >   1   ;   j--    )
    {
      /*
       * The inner loop processes the current 'aa' array 'j' times.
       * It calculates differences, adds them, and shifts elements.
       */
      for (   k   =   0   ;   k   <   j   ;   k++    )
      {
        // Calculate the absolute difference between the first two elements of 'aa'.
        var     e       =       Math.abs(   aa[   0   ]   -   aa[   1   ]   )
        ;

        // Append this calculated difference 'e' to the end of the 'aa' array.
        aa.push(    e   )
        ;

        // Remove the first element from the 'aa' array, effectively shifting all elements.
        aa.shift()
        ;
      }

      // After the inner loop completes, remove the last element from 'aa'.
      aa.pop()
      ;
    }

    // Finally, print the single remaining element in the 'aa' array to the console.
    console.log(    aa[   0   ]   )
    ;
  }
}

// This line reads the input from standard input (typically a file in competitive programming)
// and then calls the Main function with that input.
Main(   require("fs").readFileSync( "/dev/stdin" ,   "utf8" )   )
;