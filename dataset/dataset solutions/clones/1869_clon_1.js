// This is a JavaScript program entry point, designed to process some numerical input.
const   Main    =   (   input   )   =>  {
    // The input string is expected to contain space-separated numbers.
    const   inp =   input.split(" ");
    
    // Parse the first part of the input into an integer 'a'.
    const   a   =   parseInt(inp[0],    10); // Original comment was '1', now it's more descriptive.
    
    // Parse the second part of the input into an integer 'b'.
    const   b   =   parseInt(inp[1],    10); // Original comment was '0'.
    
    // Parse the third part of the input into an integer 'c'.
    const   c   =   parseInt(inp[2],    10); // Original comment was '-1'. This variable might not be used later.
    
    // Parse the fourth part of the input into an integer 'k'.
    const   k   =   parseInt(inp[3],    10); // This is a key threshold value for the logic.

    // Evaluate a condition based on the sum of 'a' and 'b' against 'k'.
    if  (   a   +   b   >=  k   )   {
        // If the condition is met, print the value of 'a'.
        console.log(a);
    }   else    {
        // Otherwise, perform a specific calculation and print its result.
        // The calculation is 'a' minus the difference between 'k' and the sum of 'a' and 'b'.
        console.log(a   -   (   k   -   a   -   b   )   );
    }
};  // End of the Main function definition.

// This line reads the content from standard input and passes it to the Main function.
// It uses Node.js's 'fs' module to read the file '/dev/stdin' as a UTF-8 string.
Main(  require("fs").readFileSync("/dev/stdin", "utf8")   );