/* This
 * is a
 * Type I
 * clone
 * of the
 * original
 * JavaScript
 * code.
 *
 * It maintains
 * exact
 * functional
 * equivalence
 * by only
 * altering
 * whitespace
 * and comments.
 */

// Declare an array to store input lines.
var    lines = [];


// Define a modulo constant, though it's not used in the final calculation of this specific problem.
var MOD = Math.pow(10, 9) + 7; /* This constant might be used in other problems, but here it's just defined. */

// Initialize the 'result' variable, which will store the final computed value.
var result = 1;


/*
 * Import the 'readline' module
 * to handle input/output operations
 * from the standard streams.
 */
var readline = require('readline')    ;

// Create an interface for reading lines from standard input.
var rl = readline.createInterface(
    {
         input   :   process.stdin    , // Standard input stream
        output: process.stdout // Standard output stream
    }
);


// Event listener for each line of input received.
rl.on('line'  , function (  x  )
{
    // Push the received line into the 'lines' array.
    lines.push(x)      ;
}  );


// Event listener for when the input stream is closed.
rl.on('close' , function ( )
{
    // Parse the first line of input as the number N.
    var N = Number(lines[0])    ;

    // Convert the second line of input into an array of characters.
    var S = lines[1].split("")    ;

    /*
     * Sort the array of characters alphabetically.
     * The sorting is crucial for grouping identical characters together.
     */
    S.sort(  (a, b) => a.charCodeAt(0) - b.charCodeAt(0)  )  ;

    // Initialize an array to store counts of consecutive identical characters.
    var counter = []    ;
    // Initialize a counter for the current sequence of identical characters.
    var cnt = 1    ;

    /*
     * Iterate through the sorted character array
     * to count consecutive occurrences of each character.
     */
    for (var i = 1; i < N; i++)
    {
        // If the current character is different from the previous one...
        if (S[i - 1] !== S[i])
        {
            // Push the count of the previous character sequence into the 'counter' array.
            counter.push(cnt)    ;
            // Reset the counter for the new character sequence.
            cnt = 0    ;
        }
        // Increment the counter for the current character.
        cnt++    ;
    }

    // Push the count of the last character sequence into the 'counter' array.
    counter.push(cnt)    ;

    /*
     * Calculate the final result.
     * For each count 'c' in the 'counter' array,
     * multiply the 'result' by (c + 1).
     * This logic is specific to the problem being solved.
     */
    for (var i = 0; i < counter.length; i++)
    {
        result *= counter[i] + 1    ;
    }

    // Print the final result minus one to the console.
    console.log(result - 1)    ;
}  )    ;