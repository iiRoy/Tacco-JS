/*
 * This is a Type I clone generated from the original JavaScript code.
 * It maintains exact logical and structural identity, only varying in
 * whitespace and comments as per the Type I definition.
 *
 * This particular script processes a string of digits, converts them to
 * integers, sums them up, and then checks if the total sum is divisible by 9.
 */
function     Main    (   input   )   {

    // Step 1: Convert the input string into an array of individual characters.
    // The spread operator `...` is used here to achieve this.
    const   charList    =   [   ... input   ] ;

    /*
     * Step 2: Transform the array of characters into an array of integers.
     * The `map` method is employed to apply the `parseInt` function to each character.
     */
    const   intList     =   charList.map   (  x   =>    {

        // Parse each character 'x' into its integer representation.
        return  parseInt(   x   )
    }   )   ;


    // Step 3: Calculate the sum of all integers in the `intList` array.
    // The `reduce` method efficiently accumulates the sum.
    const   sum         =   intList.reduce  (   (   x   ,   y   )   =>    {
        return  x   +   y   // Add the current value 'y' to the accumulator 'x'.
    }   )   ;


    // Step 4: Determine if the calculated sum is divisible by 9.
    // The result is printed to the console: "Yes" if divisible, "No" otherwise.
    console.log (   sum   %   9   ==  0   ?   "Yes"   :   "No"    )   ;

}

// This section handles the program's execution, reading input from standard input.
// It uses Node.js's 'fs' module to synchronously read the content of /dev/stdin.
Main    (   require ( "fs" ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;