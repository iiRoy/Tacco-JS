// This JavaScript code calculates a specific sum based on GCDs of numbers.
// The 'Main' function orchestrates the primary logic of the program.

function    Main    (   input   )   {
    // Define a helper function 'gcd' to compute the greatest common divisor of three integers.
    const   gcd   =   (   a   ,   b   ,   c   )   =>   {
        // Initialize the variable 'ans' to store the GCD.
        let ans = 0 ;

        // Iterate through possible divisors from 1 up to a predefined limit (200).
        // This loop finds the largest common divisor for a, b, and c within this range.
        for (   let   i   =   1   ;   i   <=   200   ;   i++   )   {
            // Check if 'i' divides all three numbers without any remainder.
            if  (   a   %   i   ===   0   &&   b   %   i   ===   0   &&   c   %   i   ===   0   )   {
                // If 'i' is a common divisor, update 'ans' to 'i'.
                // The last 'i' that satisfies this condition will be the greatest common divisor.
                ans   =   i   ;
            }
        }

        // Return the calculated greatest common divisor.
        return  ans   ;
    }   ;

    // Split the entire input string by newline characters to get an array of lines.
    // Each element in 'inputs' array corresponds to a line from the input.
    inputs   =   input.split   (   "\n"   )   ;

    // Parse the first line of input as an integer and assign it to the constant 'K'.
    // 'K' serves as the upper bound for the nested loops that follow.
    const   K   =   Number   (   inputs   [   0   ]   )   ;

    // The following line is commented out, possibly for an alternative approach not currently used.
    // const tupples = [];

    // Initialize a variable 'sum' to accumulate the results of GCD calculations.
    let   sum   =   0   ;

    // Begin three nested loops, each iterating from 1 to 'K' (inclusive).
    // These loops generate all possible combinations of (a, b, c) where a, b, c are integers.
    for   (   let   a   =   1   ;   a   <=   K   ;   a++   )   {
        for   (   let   b   =   1   ;   b   <=   K   ;   b++   )   {
            for   (   let   c   =   1   ;   c   <=   K   ;   c++   )   {
                // For each combination of (a, b, c), calculate their GCD and add it to the total sum.
                sum   +=   gcd   (   a   ,   b   ,   c   )   ;
            }
        }
    }

    // Print the final computed sum to the console.
    console.log   (   sum   )   ;


}
// ************************************************************************************************
// * The section below handles standard input/output and should NOT be modified.
// * It reads data from standard input and passes it to the 'Main' function for processing.
// ************************************************************************************************
Main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;