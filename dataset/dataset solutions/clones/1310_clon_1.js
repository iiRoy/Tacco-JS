/*
 * This JavaScript file processes numerical input from standard input.
 * It reads lines, sums the digits of each number, and prints the sum.
 * The processing stops when a line containing '0' is encountered.
 */


const    input   =   require('fs').readFileSync('/dev/stdin',  'utf8').split(/\n/);  // Reads all input from stdin, decodes as UTF-8, and splits into an array of lines.


// Loop through each line of the input array.
for
(
    let i = 0;  // Initialize loop counter.
    i < input.length;  // Loop condition: continue as long as 'i' is less than the total number of input lines.
    i++  // Increment loop counter after each iteration.
)
{
    // Check if the current input line is the termination signal '0'.
    if
    (
        input[i]   ===   '0'
    )
    {
        // If '0' is found, exit the loop immediately.
        break;
    }

    // Initialize a variable to store the sum of digits for the current number.
    let  ans   =   0;

    // Convert the current input line (a string) into an array of its digits (as numbers).
    let   num   =   input[i].split('').map(Number);


    // Inner loop: iterate over each digit in the 'num' array.
    for
    (
        let j   =   0;  // Initialize inner loop counter.
        j < num.length;  // Loop condition: continue as long as 'j' is less than the number of digits.
        j++  // Increment inner loop counter.
    )
    {
        // Add the current digit to the running total 'ans'.
        ans   +=   num[j];
    }

    // Print the calculated sum of digits for the current number to the console.
    console.log(ans);
}

// End of script.