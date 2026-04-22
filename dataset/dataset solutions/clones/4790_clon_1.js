// This is a Type I clone of the original JavaScript code.
// It performs calculations based on two input numbers read from stdin.

// Read the entire input, decode as UTF-8, and split into lines.
inp = require('fs').readFileSync('/dev/stdin', 'utf8') .split('\n');

// Take the first line from the input array and split it by spaces.
l = inp.shift() .split(' ');

// Convert the first part of the split line to a number and assign to x.
x = l[0] * 1;

// Convert the second part of the split line to a number and assign to y.
y = l[1] * 1;

// Initialize a counter variable.
cnt = 0;

// Begin the main conditional logic.
if ( x == y )
{
    // If x and y are equal, the counter remains unchanged in this block.
    // This block is intentionally empty, reflecting the original code's logic.
}
else
{
    // If x and y are not equal, proceed with further conditions.
    if ( x > y )
    {
        // Handle cases where x is strictly greater than y.
        if ( x > 0 && y > 0 )
        {
            // Both numbers are positive.
            cnt += 2;
        }
        else if ( x > 0 && y < 0 )
        {
            // x is positive, y is negative.
            cnt += 1;
        }
        else
        {
            // Covers cases like x > 0, y = 0; x = 0, y < 0; etc.
            cnt += 2;
        }
    }
    else
    {
        // Handle cases where x is strictly less than y.
        if ( x > 0 && y > 0 )
        {
            // Both numbers are positive, no change to cnt in this specific sub-case.
            /* The original code has an empty block here. */
        }
        else if ( x < 0 && y > 0 )
        {
            // x is negative, y is positive.
            cnt += 1;
        }
        // Other cases for x < y (e.g., x < 0, y = 0; x = 0, y > 0) are not explicitly handled
        // in this nested if-else structure in the original code, hence no 'else' here.
    }

    // After the initial conditional branches, add the absolute difference of their absolute values to the counter.
    cnt += Math.abs( Math.abs(x) - Math.abs(y) );
}

// Output the final calculated count to the console.
console.log(cnt);

// End of the program.