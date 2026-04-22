/*
 * This JavaScript module defines a main function
 * to process input data, likely related to geometric calculations.
 * The input 'arg' is expected to be a multi-line string.
 * This code calculates a specific value based on coordinate pairs.
 */
function   main   (   arg   )   {
        // Declare a variable 'place' and assign it the first line of the input.
        // The input string is split by newline characters, and the first element is taken.
        var   place   =   arg.split   (   "\n"   )   [   0   ]   ;


        /*
         *  Declare 'zahyou_nama' and store all lines from the input.
         *  This array will contain strings, each representing a line.
         */
        var   zahyou_nama   =   arg.split   (   "\n"   )   ;

        // Initialize an empty array named 'zahyou'.
        // This array will eventually hold parsed coordinate pairs.
        var   zahyou   =   [   ]   ;

        // Loop through the 'zahyou_nama' array, starting from the second element (index 1).
        // The first element was already used for 'place'.
        for   (   i   =   1   ;   i   <   zahyou_nama.length   ;   i   ++   )   {
            // For each line, split it by any whitespace character(s) globally.
            // The resulting array of strings (representing coordinates) is then pushed into 'zahyou'.
            zahyou.push   (   zahyou_nama   [   i   ]   .split   (   /   \s   /   g   )   )   ;
        }

        // Initialize 'nagasa_wa' (total length) to zero.
        // This variable will accumulate the sum of distances between points.
        var   nagasa_wa   =   0   ;

        // Outer loop: Iterate through each coordinate pair 'j' in the 'zahyou' array,
        // excluding the very last element to ensure 'k' always has a valid next element.
        for   (   j   =   0   ;   j   <   zahyou.length   -   1   ;   j   ++   )   {
            // Inner loop: Iterate through coordinate pairs 'k' that come after 'j'.
            // This prevents duplicate distance calculations (e.g., A-B is same as B-A)
            // and avoids calculating distance from a point to itself.
            for   (   k   =   j   +   1   ;   k   <   zahyou.length   ;   k   ++   )   {
                // Calculate the Euclidean distance between point 'j' and point 'k'.
                // Distance = sqrt((x2-x1)^2 + (y2-y1)^2)
                nagasa_wa   +=   Math.sqrt   (
                                     Math.pow   (   zahyou   [   j   ]   [   0   ]   -   zahyou   [   k   ]   [   0   ]   ,   2   )
                                     +
                                     Math.pow   (   zahyou   [   j   ]   [   1   ]   -   zahyou   [   k   ]   [   1   ]   ,   2   )
                                 )   ;
            }
        }

        // Finally, print the computed result to the console.
        // The result is 'nagasa_wa' multiplied by 2, then divided by 'place'.
        console.log   (   nagasa_wa   *   2   /   place   )   ;
}

// This line executes the 'main' function.
// It reads input from standard input (/dev/stdin) using Node.js 'fs' module,
// decodes it as UTF-8, and passes the entire content as the 'arg' parameter.
main   (   require   (   'fs'   )   .readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;