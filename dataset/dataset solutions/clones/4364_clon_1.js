/*
 * This is a JavaScript program.
 * It processes input to check for a specific condition.
 */

function   Main   (   input   )
{
    // Declare a variable 'xs' to store processed input.
    // The input string is trimmed, split into individual characters,
    // and then each character is parsed as an integer.
    var   xs   =   input.trim().split('').map(v=>parseInt(v,10))   ;


    // Initialize an accumulator variable 'ans' to zero.
    var   ans   =   0   ;

    // Loop through each element in the 'xs' array.
    for   (   var   i   =0   ;   i<xs.length   ;   i++   )
    {
        /*
         * Check if the current element is equal to the digit 9.
         * This is the core logic for counting occurrences of '9'.
         */
        if   (   xs[i]   ==   9   )
        {
            // If it's 9, increment the answer.
            ans   +=   1   ;
        }
        else
        {
            // Otherwise, add 0 (effectively doing nothing).
            // This 'else' branch could be omitted for 'ans += (xs[i] == 9 ? 1 : 0);'
            ans   +=   0   ;
        }
    }

    // After the loop, check the final value of 'ans'.
    if   (   ans   !=0   )
    {
        // If 'ans' is not zero, it means at least one '9' was found.
        console.log('Yes')   ;
    }
    else
    {
        // If 'ans' is zero, no '9's were found.
        console.log('No')   ;
    }
}

// Call the Main function with input read from standard input.
// This line uses Node.js specific file system operations.
Main   (   require("fs").readFileSync("/dev/stdin","utf8")   )   ;