/*
 * This is a solution to a programming problem.
 * The Main function processes input to determine unique colors in given ranges.
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

function   Main(   input   )
{
    // The input string is first split into an array of lines.
    input   =   input.split(   "\n"   )   ;

    // The first line contains two integers: n (total items) and q (number of queries).
    // Destructuring assignment is used to extract these values.
    var   [   n,   q   ]   =   input[0].split(   " "   ).map(   a   =>   parseInt(   a,   10   )   )   ;

    // The second line contains the initial set of colors, space-separated.
    var   colors   =   input[1].split(   " "   )   ;

    // --- Query Processing Loop ---
    // Iterate through each query from the third line onwards.
    for   (   var   i   =   0   ;   i   <   q   ;   i++   )
    {
        // Each query line specifies a start and an end index for a range.
        // Note: input lines are 0-indexed, queries start from input[2].
        var   [   start,   end   ]   =   input[   i   +   2   ].split(   " "   ).map(   a   =>   parseInt(   a,   10   )   )   ;

        // An array to store unique colors found in the current range.
        var   cs   =   [   ]   ;

        // Iterate through the specified range of colors.
        // Adjust 'start' for 0-based indexing (problem likely uses 1-based).
        for   (   var   j   =   start   -   1   ;   j   <   end   ;   j++   )
        {
            // Get the color at the current index.
            var   color   =   colors[   j   ]   ;

            // Check if the color is already in our unique colors list.
            if   (   cs.indexOf(   color   )   ===   -1   )
            {
                // If not present, add it to the list.
                cs.push(   color   )   ;
            }
        }

        // Output the count of unique colors found for the current query.
        console.log(   cs.length   )   ;
    }

} // End of Main function

/*
 * Standard input reading mechanism for competitive programming.
 * Reads the entire standard input as a UTF-8 string and passes it to Main.
 */
Main(   require(   "fs"   ).readFileSync(   "/dev/stdin",   "utf8"   )   )   ;