/*
 * This file contains a JavaScript function named 'Main'.
 * Its primary purpose is to generate a textual pattern or grid
 * based on two numeric inputs.
 *
 * The solution involves careful manipulation of characters
 * (typically '.' and '#') within a dynamically sized grid.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source code.
 */


function   Main   (   s   )
{

    // Step 1: Parse the input string 's'.
    // The input 's' is expected to be a string containing two space-separated integers.
    // Example: "10 20"
    s   =   s   .   split   (   " "   )   .   map   (   a   =>   parseInt   (   a   )   )   ;

    // Declare the primary variables used for processing and pattern generation.
    // 'a' and 'b' will store the two input numbers, ordered by size.
    // 'c' and 'd' will store the specific characters used in the grid pattern.
    var   a   ,   b   ,   c   ,   d   ;


    // Step 2: Determine 'a', 'b', 'c', and 'd' based on input comparison.
    // 'a' will always hold the larger of the two numbers.
    // 'b' will always hold the smaller of the two numbers.
    if   (   s [   0   ]   >   s [   1   ]   )
    {

        a   =   s [   0   ]   ;   // Assign the first number to 'a' if it's larger.
        b   =   s [   1   ]   ;   // Assign the second number to 'b'.
        c   =   "."   ;             // Character 'c' is '.' in this case.
        d   =   "#"   ;             // Character 'd' is '#' in this case.

    }
    else
    {

        b   =   s [   0   ]   ;   // Assign the first number to 'b' if it's smaller or equal.
        a   =   s [   1   ]   ;   // Assign the second number to 'a'.
        d   =   "."   ;             // Character 'd' is '.' in this case.
        c   =   "#"   ;             // Character 'c' is '#' in this case.

    }


    // Step 3: Calculate the grid dimension 'h'.
    // 'h' represents both the height and width of the square grid.
    // It is calculated using the larger input number 'a', applying square root,
    // ceiling (round up), and then multiplying by 4.
    const   h   =   Math   .   ceil   (   Math   .   sqrt   (   a   )   )   *   4   ;


    // Step 4: Define character patterns for rows.
    // These are constant arrays that will be spread into the 'ans' array.
    const   a1   =   [   c   ,   c   ,   c   ,   d   ]   ;   // Pattern 1: three 'c's, one 'd'.
    const   ab   =   [   c   ,   d   ,   c   ,   d   ]   ;   // Pattern AB: alternating 'c' and 'd'.
    const   a0   =   [   d   ,   d   ,   d   ,   d   ]   ;   // Pattern 0: four 'd's.


    // Initialize the main array 'ans' which will hold the grid rows.
    // Each element of 'ans' will initially be an array of characters,
    // and later converted to a string.
    var   ans   =   [   ]   ;


    // Initialize counters 'aa' and 'bb'.
    // These counters are used to manage the logic for applying different patterns
    // within the nested loops, tracking specific conditions related to 'a' and 'b'.
    var   aa   =   1   ,   bb   =   1   ;


    // Step 5: Populate the grid ('ans' array) using nested loops.
    // The outer loop iterates through rows, processing 4 rows at a time.
    for   (   var   i   =   0   ;   i   <   h   ;   i   +=   4   )
    {

        // Initialize four consecutive rows as empty arrays for character insertion.
        ans [   i   ]       =   [   ]   ;
        ans [   i   +   1   ]   =   [   ]   ;
        ans [   i   +   2   ]   =   [   ]   ;
        ans [   i   +   3   ]   =   [   ]   ;


        // The inner loop iterates through columns, processing 4 columns at a time.
        for   (   var   j   =   0   ;   j   <   h   ;   j   +=   4   )
        {

            // Conditional logic to apply different 4x4 character blocks.

            // Condition A: Check if this is the very first block (top-left corner).
            if   (   i   ===   0   &&   j   ===   0   )
            {

                // Apply a specific initial pattern for the top-left block.
                ans [   i   ]       .   push   (   ...   a1   )   ;
                ans [   i   +   1   ]   .   push   (   ...   a1   )   ;
                ans [   i   +   2   ]   .   push   (   ...   a1   )   ;
                ans [   i   +   3   ]   .   push   (   ...   a0   )   ;

            }
            // Condition B: Check if counter 'aa' has reached the value of 'a'.
            else   if   (   aa   ===   a   )
            {

                // If 'aa' equals 'a', fill the entire 4x4 block with pattern 'a0'.
                ans [   i   ]       .   push   (   ...   a0   )   ;
                ans [   i   +   1   ]   .   push   (   ...   a0   )   ;
                ans [   i   +   2   ]   .   push   (   ...   a0   )   ;
                ans [   i   +   3   ]   .   push   (   ...   a0   )   ;

            }
            // Condition C: Check if counter 'bb' has reached the value of 'b'.
            else   if   (   bb   ===   b   )
            {

                // If 'bb' equals 'b', apply 'a1' three times, then 'a0', and increment 'aa'.
                ans [   i   ]       .   push   (   ...   a1   )   ;
                ans [   i   +   1   ]   .   push   (   ...   a1   )   ;
                ans [   i   +   2   ]   .   push   (   ...   a1   )   ;
                ans [   i   +   3   ]   .   push   (   ...   a0   )   ;
                aa   ++   ;   // Increment 'aa' counter.

            }
            // Condition D: Default case for all other blocks.
            else
            {

                // Apply a mixed pattern: 'a1', 'ab', 'a1', 'a0', and increment both 'aa' and 'bb'.
                ans [   i   ]       .   push   (   ...   a1   )   ;
                ans [   i   +   1   ]   .   push   (   ...   ab   )   ;
                ans [   i   +   2   ]   .   push   (   ...   a1   )   ;
                ans [   i   +   3   ]   .   push   (   ...   a0   )   ;
                aa   ++   ;   // Increment 'aa' counter.
                bb   ++   ;   // Increment 'bb' counter.

            }

        }   // End of inner loop (j)

    }   // End of outer loop (i)


    // Step 6: Finalize grid rows by joining characters.
    // Iterate through each row of the 'ans' array.
    // Convert each inner array of characters into a single string by joining them.
    for   (   i   =   0   ;   i   <   h   ;   i   ++   )
    {

        ans [   i   ]   =   ans [   i   ]   .   join   (   ""   )   ;

    }


    // Step 7: Print the final output to the console.
    // The output format includes the grid dimensions (h x h)
    // followed by the generated grid, with each row on a new line.
    console   .   log   (   "%d %d\n%s"   ,   h   ,   h   ,   ans   .   join   (   "\n"   )   )   ;

}   // End of Main function


// This is the entry point for the script execution.
// It reads the entire content of standard input (`/dev/stdin`),
// decodes it as UTF-8, removes any leading/trailing whitespace,
// and then passes this processed string to the 'Main' function.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   .   trim   (   )   )   ;