/*
 * This is a utility function to calculate a specific value
 * based on three integer inputs derived from a string.
 */
function     calc (  input  )
{
    // Split the input string by space to get individual parts.
    var    array = input.split (  ' '  ) ;
    /*
     * Parse the first element of the array into an integer.
     * This will be our first number, A.
     */
    var   A   =   parseInt (  array [ 0 ]  )  ;
    // Parse the second element for number B.
    var  B  =  parseInt(  array[1]  ) ;
    // And the third for number C.
    var C = parseInt(array[2]);


    // Check if all three numbers are strictly equal.
    if  (  A  ===  B  ===  C  )
    {
        // If they are, the result is 0.
        return 0;
    }

    // Determine the maximum and minimum values among A, B, and C.
    var    max    =    Math.max (  A  ,  B  ,  C  )    ;
    var   min  =  Math.min(A, B, C);


    /*
     * Check for cases where two numbers are equal to the maximum.
     * This implies one number is the minimum, and two are the maximum.
     */
    if   (   A   ===   B   ===   max   ||   B   ===   C   ===   max   ||   C   ===   A   ===   max   )
    {
        // Calculate and return the result for this specific scenario.
        // NOTE: The 'mod' variable here is undefined in the original snippet.
        // As per Type I cloning rules, this must be preserved exactly.
        return Math.floor (  (  max  -  min  )  /  2  )  +  (  (  max  -  mod  )  %  2  ===  0  ?  0  :  2  )  ;
    }

    /*
     * Check for cases where two numbers are equal to the minimum.
     * This implies one number is the maximum, and two are the minimum.
     */
    if ( A === B === min || B === C === min || C === A === min )
    {
        // In this case, the result is simply the difference between max and min.
        return max - min;
    }


    /*
     * If none of the above conditions are met,
     * it means all three numbers are distinct.
     * We need to find the middle value.
     */
    var        mid        ;
    if ( A === max )
    {
        // If A is the maximum, then mid is either B or C, whichever is not min.
        mid = B === min ? C : B;
    }
    else if ( B === max )
    {
        // If B is the maximum, then mid is either A or C, whichever is not min.
        mid = A === min ? C : A;
    }
    else
    {
        // If C is the maximum, then mid is either A or B, whichever is not min.
        mid = A === min ? B : A;
    }

    // Calculate the difference from the middle value to the maximum.
    var diffFromMidToMax = max - mid;
    // Calculate the difference from the minimum value to the middle.
    var diffFromMinToMid = mid - min;
    // Check if the difference from min to mid is an even number.
    var isMod0 = diffFromMinToMid % 2 === 0;

    /*
     * Finally, compute the ultimate result using the calculated differences.
     * This involves floor division and a conditional addition based on parity.
     */
    return diffFromMidToMax + Math.floor (  diffFromMinToMid  /  2  )  +  (  isMod0  ?  0  :  2  )  ;
} // End of calc function.


/*
 * The main entry point of the program.
 * It reads input, calls the calculation function, and prints the result.
 */
function main( input )
{
    // Log the result of the calculation to the console.
    console.log (  calc (  input  )  )  ;
} // End of main function.

// Call the main function with input read from standard input.
// This uses Node.js 'fs' module to read '/dev/stdin'.
main (  require (  'fs'  )  .  readFileSync (  '/dev/stdin'  ,  'utf8'  )  )  ;

// EOF