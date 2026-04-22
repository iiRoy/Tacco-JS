var     input    =   require   (   'fs'   ) . readFileSync (   '/dev/stdin'   ,   'utf8'   )   ; // Reads the entire input from standard input as a UTF-8 string

/*
 * This section processes the raw input string.
 * First, it removes any leading/trailing whitespace using .trim().
 * Then, it splits the cleaned string into an array of lines, using the newline character as a delimiter.
 * The resulting array is stored in the 'Arr' variable.
 */
var     Arr     =     (   input . trim ( )   ) . split (   "\n"   )   ;


// The main processing loop begins here. It is an infinite loop that will break based on a condition.
while   (   true   )
{
        // Extracts the first element from the 'Arr' array.
        // The '- 0' operation implicitly converts the string element to a number.
        // This number represents the 'Sum' for the current test case.
   var     Sum     =     Arr . shift ( )   -   0   ;

        // Checks if the 'Sum' value is zero.
        // A 'Sum' of zero acts as a sentinel value, indicating the end of input data.
   if   (   Sum   ==   0   )
   {
      break   ;   // If 'Sum' is zero, the loop terminates.
   }

        // Initializes a local variable 'sum' to zero.
        // This variable will accumulate the sum of the next nine numbers.
   var     sum     =     0   ;

        /*
         * This 'for' loop iterates exactly nine times.
         * In each iteration, it extracts the next element from 'Arr', converts it to a number,
         * and adds it to the 'sum' variable.
         * This effectively sums up the nine subsequent numbers related to the current 'Sum'.
         */
   for   (   var     i     =     0   ;   i   <   9   ;   i   ++   )
   {
      sum   +=   (   Arr . shift ( )   -   0   )   ; // Adds the next number from the array to 'sum'.
   }

        // After processing the nine numbers, this line calculates the difference
        // between the initial 'Sum' and the accumulated 'sum'.
        // The result of this calculation is then printed to the console.
   console . log (   Sum   -   sum   )   ;

}   // End of the while loop.

// The script finishes execution once the 'while' loop breaks.