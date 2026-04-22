function   Main   (   input   )
{
    /*
     * This function serves as the primary entry point for processing the input.
     * It takes a single string 'input' which typically contains multiple lines of data.
     */

    // First, we split the entire input string by newline characters.
    // This creates an array where each element is a line from the input.
    var   lines   =   input.split   (   "\n"   )   ;


    // The first line of the input (index 0) is expected to be a number 'n'.
    // We convert this string representation to a numerical type.
    var   n   =   Number   (   lines[0]   )   ;


    /*
     * The second line (index 1) contains a sequence of numbers,
     * separated by spaces. We first split this line into an array of strings,
     * and then use the 'map' function to convert each string element
     * into its numerical equivalent. This array is stored in 'A'.
     */
    var   A   =   lines[1]
                  .split   (   " "   )
                  .map   (   el   =>   Number   (   el   )   )   ;


    // We initialize an array called 'cumulativeSum'.
    // It starts with a zero, which will be the base for our cumulative sums.
    var   cumulativeSum   =   [   0   ]   ;


    // The 'reduce' method is used here to calculate the running total
    // of elements in array 'A'. For each element, we push the current
    // cumulative sum (pre + cur) into the 'cumulativeSum' array.
    A.reduce   (   (   pre   ,   cur   )   =>
    {
        cumulativeSum.push   (   pre   +   cur   )   ;
        return   pre   +   cur   ;
    }   ,   0   )   ;


    // For debugging or verification purposes, the entire cumulative sum array is logged to the console.
    console.log   (   cumulativeSum   )   ;


    // An empty array 'diffs' is created to store the absolute differences
    // between potential partitions of the total sum.
    var   diffs   =   [   ]   ;


    // We iterate from the first element up to (but not including) the last element
    // of the original array 'A' (which corresponds to 'n - 1' possible split points).
    for   (   var   i   =   0   ;   i   <   n   -   1   ;   i++   )
    {
        /*
         * In each iteration, we calculate the absolute difference between two parts:
         * 1. The sum of elements from the beginning up to index 'i' (cumulativeSum[i]).
         * 2. The sum of elements from index 'i+1' to the end. This is derived by
         *    subtracting the sum up to 'i' from the total sum (cumulativeSum[n] - cumulativeSum[i]).
         * The absolute value of this difference is then added to the 'diffs' array.
         */
        diffs.push   (   Math.abs   (   cumulativeSum[i]   -   (   cumulativeSum[n]   -   cumulativeSum[i]   )   )   )   ;
    }


    // Finally, we find the minimum value among all calculated differences
    // in the 'diffs' array and log it to the console.
    console.log   (   Math.min   (   ...diffs   )   )   ;
}


// This line reads input from standard input (typically a file named /dev/stdin on Unix-like systems).
// The input is read as a UTF-8 encoded string and then passed to the Main function.
Main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;