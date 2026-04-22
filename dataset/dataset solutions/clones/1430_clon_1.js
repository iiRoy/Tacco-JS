/*
 * This JavaScript code defines a function 'Main' that processes input text.
 * It searches for occurrences of a specific word within a stream of text lines.
 * The program terminates when it encounters the "END_OF_TEXT" marker.
 */
function     Main    (   input   )
{
    // The input is initially a single string; split it into an array of lines.
    input   =   input.split( "\n"   );

    // The first line of input contains the word 'w' to be searched for.
    var     w   =   input.shift   (   );

    // 's' stores the length of the search word 'w'.
    var     s   =   w.length;

    // 'str' will hold the current line being processed from the input.
    var     str =   input.shift   (   );

    // 'res' is the counter for the total number of occurrences of 'w'.
    var     res =   0;

    // Loop through each line of the input until the "END_OF_TEXT" sentinel is found.
    while   (   str     !=      "END_OF_TEXT"   )
    {
        // 'pos' tracks the starting position for the next search within the current line 'str'.
        var     pos     =   0;

        // 't' stores the total length of the current line 'str'.
        var     t       =   str.length;

        // This inner loop searches for 'w' multiple times within the current line 'str'.
        while   (   1   )
        {
            // Search for 'w' starting from 'pos' in 'str'.
            // 'idx' will be the index relative to the substring str.substr(pos).
            var     idx     =   str.substr  (   pos   )   .   indexOf (   w   )   ;

            // Check termination conditions for the inner loop:
            // 1. If the found index, adjusted by 'pos', exceeds the maximum possible starting position
            //    for 'w' to fit within the remaining part of 'str'.
            //    (t - s) is the last possible starting index for 'w' in 'str'.
            // 2. If 'w' is not found (indexOf returns -1).
            if  (   idx     +   pos     >   t   -   s   ||  idx   ==    -1  )
            {
                break   ;   // Exit the inner loop if 'w' cannot be found further in 'str'.
            }

            // If 'w' is found, increment the total count.
            res     +=  1   ;

            // Update 'pos' to start the next search immediately after the current occurrence of 'w'.
            pos     +=  idx     +   s   ;
        }

        // Move to the next line from the input array.
        str     =   input.shift   (   )   ;
    }

    // Print the final count of occurrences to the console.
    console.log   (   res   )   ;
}

// Call the Main function with input read from standard input.
Main    (   require (   "fs"    )   .   readFileSync    (   "/dev/stdin"    ,   "utf8"  )   )   ;