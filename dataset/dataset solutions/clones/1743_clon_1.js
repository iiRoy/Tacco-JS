/*
 * This JavaScript application is designed to process
 * specific numerical input from standard input.
 * It calculates a sum based on a subset of the provided numbers.
 */
process.    stdin.    resume(  )   ; // Ensure the standard input stream stays open.

// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding (   "utf8"    )   ;

process.stdin.on   ( "data"   ,   (   input   )   =>
{
    // This asynchronous callback fires whenever data is received on stdin.
    // First, we parse the raw input string into structured data.
    const analyzed   =   analyzeInput   (   input   )   ;

    // Then, we use the parsed data to compute the final result.
    const result = getResult   (   analyzed.K   ,   analyzed.Pk   )   ;


    // The computed result is printed to standard output.
    console.log   (   result   )   ;
}   )   ;


/*
 * This function takes the raw input string and
 * transforms it into a structured object.
 * It expects two lines of space-separated numbers.
 */
const analyzeInput   =   (   input   )   =>
{
    // Split the entire input block into individual lines.
    const   lines   =   input.split   (   "\n"   )   ;

    // The first line contains parameters N and K.
    const line1 =   lines   [   0   ]   .split   (   " "   )   ;

    // The second line contains the array of Pk values.
    const line2 =   lines   [   1   ]   .split   (   " "   )   ;


    const   N   =   line1   [   0   ]   ; // N is extracted but not used in the problem logic.
    const   K   =   line1   [   1   ]   ; // K specifies how many smallest elements to consider.

    // Convert the string array of Pk values to an array of actual numbers.
    const   pk   =   line2.map   (   num   =>   Number   (   num   )   )   ;


    // Return an object containing all the parsed components.
    return   {
        N   :   N   ,
        K   :   K   ,
        Pk   :   pk   ,
    }   ;
}   ;


/**
 * Calculates the sum of the 'k' smallest elements
 * from the given array 'pk'.
 * @param {number} k - The number of smallest elements to sum.
 * @param {number[]} pk - The array of numbers to process.
 * @returns {number} The sum of the 'k' smallest elements.
 */
const getResult   =   (   k   ,   pk   )   =>
{
    // Sort the array 'pk' in ascending numerical order.
    pk.sort   (   (   p1   ,   p2   )   =>
    {
        // Standard comparison function for numerical sort.
        if   (   p1   >   p2   )   return   1   ;
        if   (   p1   <   p2   )   return   -1   ;
        return   0   ; // Elements are equal.
    }   )   ;


    // Slice the array to get only the first 'k' elements (which are the smallest).
    // Then, use reduce to sum these 'k' elements.
    const   sum   =   pk.slice   (   0   ,   k   )   .reduce   (   (   total   ,   curr   )   =>
    {
        return   total   +   curr   ; // Accumulate the current element to the total.
    }   ,   0   )   ; // Initialize the accumulator 'total' to zero.


    return   sum   ; // Return the final calculated sum.
}   ;