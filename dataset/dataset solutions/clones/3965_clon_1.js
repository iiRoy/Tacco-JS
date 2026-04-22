/*
 * This JavaScript file processes input lines to count occurrences of strings.
 * It reads N strings, then M strings, and calculates the maximum count.
 */

// Array to store all input lines read from stdin.
var    lines =    [];



/*
 *  The 'readline' module provides an interface for reading data from a Readable stream
 *  (like process.stdin) one line at a time.
 */
var     readline        =       require('readline')       ;




// Create a readline interface instance.
//   Input stream is standard input.
//   Output stream is standard output (though not used for direct output by rl itself here).
var     rl =       readline.createInterface(
    {
        input   :   process.stdin,         // Standard input stream
        output  :   process.stdout         // Standard output stream
    }
)       ;



// Event listener for each 'line' received from the input stream.
rl.on(
    'line'
    ,
    function (  x   )
    {
        // Add the current line (x) to our 'lines' array.
        lines.push(  x  )    ;
    }
)       ;



/*
 *  Event listener for the 'close' event, which is emitted when the input stream
 *  has received its 'end' signal and is no longer providing data.
 *  This is where the main processing logic for the problem resides.
 */
rl.on(
    'close'
    ,
    function (  )
    {

        // Parse the first line to get the value of N (number of initial strings).
        var     N       =       Number(  lines[0]  )        ;


        // Parse the line at index N + 1 to get the value of M (number of subsequent strings).
        var     M       =       Number(  lines[N + 1]  )           ;


        // This array 's' is declared but appears to be unused in the current logic.
        var    s    =    []        ;


        // Initialize an object 'moji' to store counts of strings.
        // It will act as a hash map or dictionary.
        var     moji    =       {}     ;


        /*
         *   First loop: Iterate through the first N strings (from index 1 to N inclusive).
         *   These strings are meant to be 'added' to our count.
         */
        for
        (
            var     i       =       1       ;          // Start from the second line of input (index 1).
            i       -       1       <       N       ;  // Loop N times.
            i       ++                                 // Increment loop counter.
        )
        {
            // If the string 'lines[i]' is not yet in 'moji', initialize its count to 1.
            // Otherwise, increment its existing count.
            moji[  lines[i]  ]       ===     undefined   ?   moji[  lines[i]  ]       =       1   :   moji[  lines[i]  ]       ++     ;
        }


        // This array 't' is declared but also appears to be unused.
        var    t    =    []        ;


        /*
         *   Second loop: Iterate through the next M strings (starting from index N + 2).
         *   These strings are meant to be 'subtracted' from our count.
         */
        for
        (
            var     i       =       N       +       2       ;          // Start reading from the line after N+1.
            i       -       (N      +       2)      <       M       ;  // Loop M times.
            i       ++                                                 // Increment loop counter.
        )
        {
            // If the string 'lines[i]' is not yet in 'moji', initialize its count to -1.
            // Otherwise, decrement its existing count.
            moji[  lines[i]  ]       ===     undefined   ?   moji[  lines[i]  ]       =       -1   :   moji[  lines[i]  ]       --     ;
        }


        // Initialize 'ans' (answer) to 0. This will store the maximum count found.
        var     ans     =       0       ;


        // Iterate over each unique string (key) in the 'moji' object.
        Object.keys(  moji  )
        .forEach(
            value   =>
            {
                // If the current string's count is greater than the current maximum 'ans',
                // update 'ans' with this new maximum.
                if      (  ans       <       moji[  value  ]  )
                {
                    ans     =       moji[  value  ]        ;
                }
            }
        )       ;


        // Output the final maximum count to the console.
        console.log(  ans  )       ;

    }
)       ;