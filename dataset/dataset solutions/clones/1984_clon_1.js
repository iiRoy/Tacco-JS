// This is the primary function definition for processing input.
function   Main   (   input   )
{


    // Declare a variable 'N' and convert the input string to a number.
    let   N   =   Number (   input   )   ;


    // Initialize a variable 'sum' to store the cumulative total.
    let   sum   =   0   ;


    // Loop through numbers from 1 up to N (inclusive).
    for   (   let   i   =   1   ;   i   <   (   N   +   1   )   ;   i++   )
    {

        // Check if the current number 'i' is not divisible by 3 AND not divisible by 5.
        if   (   (   i   %   3   !==   0   )   &&   (   i   %   5   !==   0   )   )
        {
            // If both conditions are true, add 'i' to the 'sum'.
            sum   +=   i   ;
        }

    }


    // Output the final calculated sum to the console.
    console.log   (   sum   )   ;
}


// --- Program Execution Start ---

// Read input from standard input, decode it as UTF-8, and pass it to the Main function.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// --- End of Program ---