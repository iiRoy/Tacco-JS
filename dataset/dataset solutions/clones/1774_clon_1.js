// --- Start of Program: Finding the Closest Allowed Number ---

// This script reads input from standard input, processes it,
// and outputs a specific number based on certain criteria.

// Import the 'fs' (file system) module.
// The 'fs' module provides an API for interacting with the file system,
// which is used here to read from '/dev/stdin'.
fs =    require('fs');


// Read the entire content of the standard input asynchronously.
// The content is read as a UTF-8 encoded string.
input =   fs.readFileSync (    '/dev/stdin'    ,    'utf8'    );


// Split the input string into an array of strings,
// where each element represents a line from the input.
tmp = input.split('\n');


// Parse the first integer from the first line of the input.
// The first line is expected to contain two space-separated integers.
// `tmp[0].split(' ')[0]` gets the first part before the space.
X = parseInt(  tmp[0].split(' ')[0]   );


// Parse the second integer from the first line of the input.
// `tmp[0].split(' ')[1]` gets the second part after the space.
N = parseInt(  tmp[0].split(' ')[1]   );


// Special condition check: If N is 0.
// N represents the count of forbidden numbers.
if (  N  ==  0  ) {
    // If there are no forbidden numbers, X itself is the closest allowed number.
    console.log(X); // Output X.
    return;         // Terminate the script early.
}


// Split the second line of the input into an array of strings.
// This array 'p' will contain the forbidden numbers as strings.
p = tmp[1].split(' ');


// Initialize 'r' (result) to 0.
// This variable will store the closest allowed number found so far.
r = 0;


/*
 * Main loop: Iterate through a predefined range of numbers.
 * The loop starts from 100 and goes down to -10, inclusive.
 * This range is chosen to cover typical problem constraints for finding
 * a number closest to X, considering both positive and negative values.
 */
for (  i  =  100  ;  i  >=  -10  ;  i--  ) {

    // Initialize a boolean flag 'f' to true for each 'i'.
    // 'f' indicates whether the current number 'i' is allowed (not forbidden).
    f = true;

    // Inner loop: Iterate through the list of forbidden numbers.
    for (  j  =  0  ;  j  <  N  ;  j++  ) {

        // Convert the string representation of the forbidden number `p[j]` to an integer.
        // Use base 10 for parsing.
        if (  parseInt(p[j], 10)  ==  i  ) {
            // If the current number 'i' matches a forbidden number,
            // set 'f' to false, indicating 'i' is not allowed.
            f = false;
            break; // No need to check further forbidden numbers for this 'i'.
        }
    }

    // After checking all forbidden numbers, if 'f' is still true,
    // it means 'i' is an allowed number.
    if (  f  ==  true  ) {

        // If 'r' is currently 0, it implies this is the first allowed number found.
        // So, 'i' becomes the initial candidate for the closest allowed number.
        if (  r  ==  0  ) {
            r = i;
        }
        else {
            // If 'r' already holds a candidate, compare the current 'i' with 'r'.
            // The goal is to find the allowed number that has the minimum absolute difference from X.

            // Calculate the absolute difference between 'i' and 'X'.
            // Calculate the absolute difference between 'r' and 'X'.
            if (  Math.abs(i - X)  <=  Math.abs(r - X)  ) {
                // If 'i' is closer to X, or equally close (in which case the smaller 'i' is preferred
                // due to the loop iterating downwards, this condition will update 'r' to 'i'),
                // update 'r' to 'i'.
                r = i;
            }
        }
    }
}

// Output the final result: the closest allowed number found.
console.log(r);

// --- End of Program ---