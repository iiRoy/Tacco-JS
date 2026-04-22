/*
 * This JavaScript code defines functions for permutation generation
 * and then processes standard input to calculate specific sums based on these permutations.
 *
 * This file demonstrates a Type I code clone,
 * where only whitespace and comments have been altered extensively.
 * All original identifiers, operators, and expressions remain strictly identical.
 */


// Function to generate all permutations of 'n' elements from array 'xs'.
// This is a recursive implementation.
function   perm (   xs  ,   n   ) {

    var   // Declare variables used within this function scope.
          x         // Stores the current element being processed.
        , i         // Loop counter.
        , len   =   xs.length   // Cache the length of the input array for efficiency.
        , ret   =   [ ]         // Array to accumulate the resulting permutations.
        ;


    // Base case for the recursion:
    // If 'n' is 0, it means we need permutations of length 0,
    // which is just an empty array contained within another array.
    if   (   n   ===   0   )
    {
        return   [   [ ]   ]   ;
    }


    // Iterate through each element of the input array 'xs'.
    for   (   i   =   0   ;   i   <   len   ;   i++   )
    {

        // Take the first element from the current 'xs' array.
        // `shift()` removes the first element and returns it.
        x   =   xs.shift (   )   ;


        // Recursively call 'perm' with the remaining elements and 'n - 1'.
        // Then, for each sub-permutation returned, prepend the current element 'x'.
        ret   =   ret.concat (   perm (   xs  ,   n   -   1   ).map (   function (   ys   )
        {

            // Prepend 'x' to the beginning of the sub-permutation 'ys'.
            // The comma operator ensures 'ys' (modified) is returned.
            return   (   ys.unshift (   x   )  ,   ys   )   ;

        }   )   )   ;


        // After processing 'x' with the rest of the elements,
        // put 'x' back to the end of 'xs'.
        // This restores 'xs' for the next iteration of the loop,
        // allowing each element to be considered as the "first" element in its turn.
        xs.push (   x   )   ;

    }


    // Return the complete list of permutations generated.
    return   ret   ;

} // End of the 'perm' function definition.


/*
 * The main function orchestrates the logic:
 * It reads input lines, parses them, generates permutations,
 * calculates a specific sum for each permutation, and logs the result.
 */
function   main (   )
{

    // Iterate over each line of the global 'input' array.
    // Each 'line' represents a test case.
    input.forEach (   function (   line   )
    {

        var   // Declare variables for processing the current line.
              n         // Represents the length of permutations to generate.
            , s         // The target sum to match.
            , r   =   0   ; // Counter for permutations that meet the sum condition.


        // If the line is empty or just whitespace, skip it.
        if   (   line.trim (   )   ===   ''   )
        {
            return   ;
        }


        // Process the line:
        // 1. Split the string by space.
        // 2. Convert each part to a floating-point number.
        line   =   line.split (   ' '   ).map (   parseFloat   )   ;


        // Extract 'n' and 's' from the parsed line.
        n   =   line[   0   ]   ;
        s   =   line[   1   ]   ;


        /*
         * Generate permutations of the digits [0-9] of length 'n'.
         * Then, for each generated permutation ('xs'), calculate a weighted sum.
         * The weights are (i+1), where 'i' is the index of the digit in the permutation.
         * If this weighted sum equals 's', increment the counter 'r'.
         */
        perm (   [   0,1,2,3,4,5,6,7,8,9   ]  ,   n   ).forEach (   function (   xs   )
        {

            // Use 'reduce' to calculate the weighted sum for the current permutation 'xs'.
            r   +=   xs.reduce (   function (   m  ,   x  ,   i   )
            {
                // m: accumulator (current sum)
                // x: current digit
                // i: index of the current digit
                return   m   +   x   *   (   i   +   1   )   ;
            }  ,   0   )   ===   s   ?   1   :   0   ; // Check if the sum matches 's', then add 1 or 0 to 'r'.

        }   )   ;


        // Log the final count 'r' for the current input line.
        console.log (   r   )   ;

    }   )   ;

} // End of the 'main' function.


// Global variable to store all incoming standard input data.
var
    input   =   ''   ; // Initialize as an empty string.


// Resume the standard input stream to start listening for data.
process.stdin.resume (   )   ;

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding (   'utf8'   )   ;


/*
 * Event handler for the 'data' event on process.stdin.
 * This event fires when new data chunks are available from the input stream.
 * Each chunk is appended to the global 'input' variable.
 */
process.stdin.on (   'data'  ,   function (   chunk   )
{
    input   +=   chunk   ; // Concatenate the new chunk to the existing input string.
}   )   ;


/*
 * Event handler for the 'end' event on process.stdin.
 * This event signifies that the entire input stream has been received.
 * At this point, the accumulated 'input' string is processed.
 */
process.stdin.on (   'end'  ,   function (   )
{
    // Split the complete input string into an array of lines, using newline characters as delimiters.
    input   =   input.split (   '\n'   )   ;

    // Call the main function to begin processing the parsed input.
    main (   )   ;

}   )   ;