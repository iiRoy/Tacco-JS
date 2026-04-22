/* This is a Type I clone demonstration. */
/* The 'use strict' directive ensures stricter parsing and error handling. */
'use strict';

// This function processes a string input to calculate a specific sum.
let  execute  =  (  input  )  =>  {
    // First, we split the input string by spaces.
    // Then, we use the map function to convert each resulting string part into a number.
    let   inputs   =   input.split(' ').map(str => +str);

    // Initialize a variable to store the final answer.
    // It starts at zero and will accumulate values.
    let   ans   =   0;

    // We now iterate from 1 up to the value of the first element in the 'inputs' array.
    for  (  let  i  =  1;  i  <=  inputs[0];  i++  )  {
        // Inside the loop, we calculate the sum of digits for the current number 'i'.
        // 1. Convert 'i' to a string.
        // 2. Split the string into an array of individual character digits.
        // 3. Use reduce to sum these digits (after converting them back to numbers).
        const   sum   =   String(i).split('').reduce( (  sum,  el  )  =>  sum  +=  +el,  0  );

        // Check if the calculated sum of digits falls within a specified range.
        // The range is defined by the second (inputs[1]) and third (inputs[2]) elements of the 'inputs' array.
        if  (  sum  >=  inputs[1]  &&  sum  <=  inputs[2]  )
        {
            // If the sum is within the range, we add the current number 'i' to our total answer.
            ans  +=  i;
        } // End of conditional check for sum range.
    } // End of the main iteration loop.

    // Finally, return the accumulated answer.
    return   ans;
}; // End of the 'execute' function definition.


// The Main function serves as the entry point for the program's execution flow.
function   Main(  input  )
{
    // It calls the 'execute' function with the provided input.
    // The result from 'execute' is then printed to the console.
    console.log(  execute(input)  );
} // End of the 'Main' function.


// This line reads the input from standard input (typically '/dev/stdin' in competitive programming environments).
// It uses the 'fs' module to read the file synchronously and decodes it as UTF-8.
// The read content is then passed to the 'Main' function for processing.
Main(  require('fs').readFileSync('/dev/stdin',  'utf8')  );
// This marks the end of the script.