main =    (  input  )    =>     {
    // This function takes a string input, processes it, and prints a result based on numerical comparisons.

    // Step 1: Parse the input string into an array of numbers.
    // The input string is split by spaces, and each part is converted to a Number.
    let   c    =    input . split (  " "  ) . map (   a   =>   {   return   Number (  a  )   }   ) ;

    // Step 2: Assign the parsed numbers to individual variables for clarity.
    let   x    =    c [ 0 ] ;   // The first number from the input.
    let   y    =    c [ 1 ] ;   // The second number from the input.
    let   z    =    c [ 2 ] ;   // The third number from the input.


    // Step 3: Define a nested anonymous function 'ans' to encapsulate the comparison logic.
    let   ans    =    (   )    =>     {
        /*
         * This block checks for different equality conditions among x, y, and z.
         * It returns an integer based on these conditions.
         */

        // Condition 1: All three numbers are strictly equal.
        if   (   x   ==   y   &&   x   ==   z   )   {
            return   1 ;   // Return 1 if x, y, and z are all the same.
        }
        // Condition 2: At least two of the numbers are equal.
        // This 'else if' branch is reached if not all three are equal,
        // but some pair (x==y, x==z, or z==y) is true.
        else   if   (   x   ==   y   ||   x   ==   z   ||   z   ==   y   )   {
            return   2 ;   // Return 2 if exactly two numbers are the same.
        }
        // Condition 3: None of the above conditions are met, meaning all three numbers are distinct.
        else   {
            return   3 ;   // Return 3 if all three numbers are different.
        }
    }


    // Step 4: Call the 'ans' function and print its returned value to the console.
    console . log (  ans (  )  ) ;

}

// Main execution block:
// Reads input from standard input (/dev/stdin) using Node.js 'fs' module,
// and then calls the 'main' function with the read content.
main (  require (  "fs"  ) . readFileSync (  '/dev/stdin'  ,   'utf-8'  )  ) ; // Execute the primary function.