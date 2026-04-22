/*
 * This is the main function that processes the input.
 * It calculates a specific sum based on the input array of numbers.
 * The input is expected to be a string containing multiple lines.
 */
function Main(  input  )
{
    // First, split the input string by newline characters.
    // This converts the single input string into an array of strings,
    // where each element represents a line from the original input.
    input = input.split(  "\n"  )  ;


    // The second line of the input (index 1) contains space-separated numbers.
    // We split this line by spaces and then convert each part to a BigInt.
    // BigInt is used to handle potentially large integer values without precision loss.
    let   An   =   input[1]  .  split(  " "  )  .  map(  BigInt  )  ;

    // Initialize a BigInt variable to store the sum of all elements in An.
    let   A_Sum   =   BigInt(  0  )  ;

    // Iterate over each value in the An array and add it to A_Sum.
    // This is an efficient way to sum all elements.
    An  .  forEach(  value   =>   A_Sum   +=   value  )  ;


    // Initialize another BigInt variable 'tmp' to 0.
    // This variable will accumulate the final result of the calculation.
    let   tmp   =   BigInt(  0  )  ;


    // Begin the main loop to perform the core calculation.
    // We iterate through each element 'A' in the 'An' array.
    for  (  const   A   of   An  )
    {

        // In each iteration, subtract the current element 'A' from 'A_Sum'.
        // This effectively gives us the sum of all *remaining* elements in An (those after A in the original sequence, plus those before A).
        A_Sum   -=   A  ;

        // Add to 'tmp' the product of the current element 'A' and the updated 'A_Sum'.
        // This is a key step in the algorithm's logic.
        tmp   +=   A   *   A_Sum  ;

    } // End of the for-loop iterating through 'An' array elements.


    // After the loop completes, 'tmp' holds the final BigInt result.
    // We need to take this result modulo 1000000007 (a common prime number for competitive programming).
    // Then, convert the BigInt result back to a standard JavaScript Number type for console output.
    console.log(  Number(  tmp   %   BigInt(  1000000007  )  )  )  ;

} // End of the Main function definition.

// This part of the code handles reading input from standard input
// and then calling the Main function with that input.
// require("fs").readFileSync("/dev/stdin", "utf8") reads the entire file
// at /dev/stdin (standard input in many Unix-like environments) as a UTF-8 string.
Main(  require(  "fs"  )  .  readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;

// EOF - End of File.