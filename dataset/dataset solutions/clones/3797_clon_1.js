/**
 * This is the main entry point function for the program.
 * It processes the input string to solve a specific problem.
 * @param {string} input - The raw input string, typically from standard input.
 */
function    main (   input   )
{

    // Split the input string by newline characters to get an array of lines.
    var     a     =  input .  split (  '\n'  )  ;

    // Parse the first line as an integer, which represents the number N.
    var     N     =  parseInt (  a[0]  ,  10  )  ;

    // Split the second line by spaces to get an array of string numbers.
    var     S     =  a[1]  .  split (  ' '  )  ;

    // Iterate through the array S to convert each string element to an integer.
    for (  i  =  0  ;  i  <  N  ;  i++  )
    {
        // Convert the current string element to an integer base 10.
        S[i]  =  parseInt (  S[i]  ,  10  )  ;
    }

    // Initialize a counter variable to keep track of certain conditions.
    count     =  0  ;

    /*
     * The following line was commented out in the original code.
     * It's left commented out here to maintain logical equivalence.
     * console.log(S);
     */

    // Outer loop: Iterate from the first element up to N-1.
    for (  i  =  0  ;  i  <  N  ;  i++  )
    {
        // Initialize x with the current element S[i].
        var     x     =  S[i]  ;
        // Initialize b with the current element S[i].
        var     b     =  S[i]  ;

        // Increment the counter for each starting element of the inner loop.
        count     +=  1  ;

        // Inner loop: Iterate from the next element after i up to N-1.
        for (  j  =  i  +  1  ;  j  <  N  ;  j++  )
        {
            // Perform a bitwise XOR operation between x and the current element S[j].
            x     =  x  ^  S[j]  ;
            // Perform an addition operation between b and the current element S[j].
            b     =  b  +  S[j]  ;

            /*
             * These console log statements were also commented in the original.
             * console.log(x);
             * console.log(b);
             */

            // Check if the values of x and b are strictly equal.
            if (  x  ===  b  )
            {
                // If they are equal, increment the counter.
                count     +=  1  ;
            }
        }
    }

    // Output the final calculated count to the console.
    console .  log (  count  )  ;
}

// Call the main function with input read from standard input.
// This uses Node.js 'fs' module to read the file '/dev/stdin' as UTF-8.
main (  require (  'fs'  )  .  readFileSync (  '/dev/stdin'  ,  'utf8'  )  )  ;