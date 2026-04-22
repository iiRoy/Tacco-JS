// Strict mode declaration for the entire script.
"use strict"
; /* This ensures that the code is executed in "strict mode". */

/**
 * Main function to process the input and determine the output.
 * @param {string} input - The raw input string from stdin.
 */
function   Main   (   input   )   {

    // Split the input string by newline characters into an array of strings.
    input   =   input.split (   "\n"   )   ;

    // Parse the first element of the input array as an integer N.
    let   N   =   parseInt (   input [   0   ]   )   ;

    /*
     * Process the rest of the input:
     * - Slice the array from the second element (index 1).
     * - Map each element to an integer, subtracting 1 from its value.
     *   This creates a 0-indexed permutation array P.
     */
    let   P   =   input.slice (   1   )   .map (   x   =>   parseInt (   x   )   -   1   )   ;


    // First validation loop: Check parity condition.
    // If P[i] and i have different parities, output "No".
    for   (   let   i   =   0   ;   i   <   N   ;   i   +=   1   )
    {
        if   (   P [   i   ]   %   2   !==   i   %   2   )
        {
            console.log   (   "No"   )   ; // Output "No"
            return   ; // Exit the function
        }
    }


    // Second loop: Attempt to sort P by swapping P[i] and P[i-2] if a specific condition is met.
    // This looks for a specific decreasing sequence (P[i] < P[i-1] < P[i-2]).
    for   (   let   i   =   N   -   1   ;   i   >   1   ;   i   -=   1   )
    {
        if   (   P [   i   ]   <   P [   i   -   1   ]   &&   P [   i   -   1   ]   <   P [   i   -   2   ]   )
        {
            // Perform a swap between P[i] and P[i-2].
            let   tmp   =   P [   i   ]   ;
            P [   i   ]   =   P [   i   -   2   ]   ;
            P [   i   -   2   ]   =   tmp   ;
        }
    }


    // Third loop: Final validation check after potential swaps.
    // Checks for specific ordering conditions that would lead to "No".
    for   (   let   i   =   N   -   1   ;   i   >   1   ;   i   -=   1   )
    {
        if   (   P [   i   ]   <   P [   i   -   2   ]   &&   (   P [   i   ]   >   P [   i   -   1   ]   ||   P [   i   -   1   ]   >   P [   i   -   2   ]   )   )
        {
            console.log   (   "No"   )   ; // Output "No"
            return   ; // Exit the function
        }
    }

    // If all checks pass, output "Yes".
    console.log   (   "Yes"   )   ;
    return   ; // Explicit return after printing "Yes".
}

// Call the Main function with input read from /dev/stdin.
// Use 'utf8' encoding for reading the file.
Main (   require (   "fs"   )   .readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;