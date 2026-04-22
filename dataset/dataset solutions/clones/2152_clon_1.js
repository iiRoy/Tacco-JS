// This function serves as the primary entry point for processing the input data.
// The 'input' parameter is expected to contain the entire dataset as a single string.
function   Main   (   input   )
{
    // The input string is first broken down into an array of individual lines.
    input   =   input . split   (   "\n"   )   ;

    // The very first line of input is extracted.
    // In many competitive programming contexts, this line might represent the number of test cases or items.
    const   N   =   input . shift   (   )   ;

    // The remaining lines of input are then transformed into an array of integers.
    // Each string 'v' is parsed into its integer equivalent.
    const   A   =   input . map   (   v   =>   parseInt   (   v   )   )   ;

    // A boolean flag 'f' is initialized to 'false'.
    // This flag will be used to track whether a specific condition is met later in the logic.
    f   =   false   ;


    // A new array 'B' is created by filtering the 'A' array.
    // Only numbers 'v' that are perfectly divisible by 2 (i.e., even numbers) are included in 'B'.
    B   =   A . filter   (   v   =>   v   %   2   ==   0   )   ;

    // The code now iterates over each element 'v' in the 'B' array (which contains only even numbers).
    B . forEach   (   v   =>   {
        // Inside the loop, a conditional check is performed.
        // If an even number 'v' is neither divisible by 3 (remainder not 0)
        // AND it is also not divisible by 5 (remainder not 0),
        // then the flag 'f' is set to 'true'.
        if   (   v   %   3   !=   0   &&   v   %   5   !=   0   )   f   =   true   ;
    }   )   ;


    // Finally, based on the value of the flag 'f', an output message is printed to the console.
    if   (   f   )   {
        // If 'f' is true, it implies that at least one even number was found
        // that was not divisible by either 3 or 5.
        console . log   (   "DENIED"   )   ;
    }   else   {
        // If 'f' remains false, it means all even numbers encountered
        // were successfully divisible by either 3 or 5 (or both).
        console . log   (   "APPROVED"   )   ;
    }
}

// === DO NOT MODIFY THE FOLLOWING LINES ===
// This section is responsible for reading input from standard input
// and invoking the 'Main' function with the collected data.
Main   (   require   (   "fs"   ) . readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;