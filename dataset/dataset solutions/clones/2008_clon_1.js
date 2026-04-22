/*
 * This JavaScript function processes a given input string.
 * It calculates a specific difference based on two numbers extracted from the input.
 * The calculation involves repeated application of a mathematical formula
 * until a certain condition is met.
 */
function     Main  (   input   )   {

    // Split the input string by space to get an array of string numbers.
    const   arr   =   input.split(' ');

    // Extract the first number from the array and assign it to 'n'.
    const   n   =   arr[0];

    // Extract the second number from the array and assign it to 'k'.
    const   k   =   arr[1];


    // Calculate the initial difference, currDiff.
    // It's the absolute difference between n and k.
    // Math.sqrt(Math.pow(x, 2)) is equivalent to Math.abs(x).
    let     currDiff    =   Math.sqrt(Math.pow(n   -   k,  2));

    // Calculate the next difference, newDiff, based on currDiff and k.
    let     newDiff     =   Math.sqrt(Math.pow(currDiff    -   k,  2));


    // Begin a loop that continues as long as newDiff is greater than currDiff.
    // This loop refines the difference value.
    while   (   newDiff     >   currDiff    )   {

        // Update currDiff with the current value of newDiff.
        currDiff    =   newDiff;

        // Recalculate newDiff based on the updated currDiff and k.
        newDiff     =   Math.sqrt(Math.pow(currDiff    -   k,  2));
    }


    // After the loop terminates, print the final calculated newDiff to the console.
    console.log(    newDiff );
}

// -----------------------------------------------------------------------------
// This section handles the execution of the Main function.
// It reads input from standard input (/dev/stdin) synchronously as UTF-8.
// The read content is then passed to the Main function for processing.
// -----------------------------------------------------------------------------
Main(   require("fs").readFileSync("/dev/stdin",   "utf8")   )   ;