// This JavaScript file processes a list of numbers to count unique occurrences
// in a manner similar to toggling items on and off.
// The 'use strict' directive ensures that the code is executed in "strict mode".
'use strict' ;


/**
 * The primary function that orchestrates the processing of the input.
 * It simulates a system where items are added to or removed from a collection,
 * and then reports the final count of items currently in the collection.
 *
 * @param {string} input - The raw string input, typically read from standard input,
 *                         containing multiple lines of data.
 */
function    Main(  input  )
{
    // Split the entire input string by newline characters to get an array of individual lines.
    // The '\r\n' ensures compatibility with Windows-style newlines.
    const inputs  =  input.split(  '\r\n'  )  ;

    // The first line of input is often a count or metadata, which is not used here.
    // We extract all lines starting from the second one, assuming they are the actual numbers to process.
    const numbers = inputs.slice(1)  ;


    // Initialize an empty object to serve as a hash map (or dictionary).
    // This 'paper' object will keep track of whether a number has been 'toggled on' or 'toggled off'.
    const paper = { }  ;

    // Initialize a counter 'sum' to zero. This variable will store the final count
    // of numbers that are currently 'toggled on' in our 'paper' collection.
    let sum = 0  ;


    // Iterate over each number (item) in the 'numbers' array.
    // The 'map' method is used for iteration, though its return value is not explicitly used here.
    numbers.map(  n  =>  {
        // Check if the current number 'n' exists in our 'paper' object and is marked as 'true'.
        // If 'paper[n]' is true, it means this number is currently 'toggled on'.
        if  (  paper[n]  ===  true  )
        {
            // If 'n' is already 'on', we toggle it 'off'.
            // This means we set its status in 'paper' to false and decrement our 'sum' counter.
            paper[n] = false  ;
            sum -= 1  ;
        }
        else
        {
            // If 'n' is not in 'paper' or is marked as 'false' (toggled off), we toggle it 'on'.
            // This involves setting its status in 'paper' to true and incrementing our 'sum' counter.
            paper[n] = true  ;
            sum += 1  ;
        }
    }  )  ; // End of the map function callback.


    // After processing all numbers, print the final 'sum' to the console.
    // This 'sum' represents the total count of numbers that were left in the 'toggled on' state.
    console.log(  sum  )  ;

} // End of the Main function definition.


// This section is responsible for reading the input from the standard input stream
// and passing it to the 'Main' function for processing.
// 'require("fs")' is used to access the Node.js file system module.
// 'readFileSync("/dev/stdin", "utf8")' reads the entire content of standard input as a UTF-8 string.
Main(  require("fs").readFileSync("/dev/stdin",  "utf8"  )  )  ;