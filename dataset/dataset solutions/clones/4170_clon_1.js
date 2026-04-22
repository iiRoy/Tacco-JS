/*
 * This JavaScript file processes an array of numbers
 * to find the minimum number of times each element can be divided by 2.
 * It reads input from standard input.
 */


const    fs    =   require   (    'fs'    )   ;  //  Import the Node.js file system module.


function   main   (   input   )   {

    // Parse the first line of input to get the number of elements.
    n   =   parseInt   (   input   [   0   ]   )   ;

    // The following line was likely used for debugging purposes.
    // console.log(n);

    /*
     * Split the input string:
     * First, by newline to get lines.
     * Then, take the second line (index 1).
     * Finally, split that line by space to get individual number strings.
     */
    var   a   =   input   .   split   (   '\n'   )   [   1   ]   .   split   (   ' '   )   ;

    // Convert all string elements in array 'a' to integers.
    a   =   a   .   map   (   n   =>   parseInt   (   n   )   )   ;


    var   res   =   100   ;  // Initialize 'res' with a large enough value. This will store the minimum count.

    // Iterate through each number in the array 'a'.
    for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )   {

        var   j   =   a   [   i   ]   ;  // Current number being processed.
        var   c   =   0   ;  // Counter for divisions by 2.

        // Continuously divide 'j' by 2 as long as it is an even number.
        while   (   j   %   2   ===   0   )   {

            j   /=   2   ;     // Divide j by 2.
            c   ++   ;         // Increment the counter.
        }

        // Update 'res' with the minimum count found so far.
        res   =   Math   .   min   (   res   ,   c   )   ;
    }

    // Output the final result to the console.
    console   .   log   (   res   )   ;
}


// Read the entire input from standard input as UTF-8.
input   =   fs   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;

// Call the main function with the read input.
main   (   input   )   ;