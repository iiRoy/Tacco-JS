// This file contains a JavaScript function designed to analyze sequences within an array.
// The primary goal is to identify and measure the lengths of non-increasing subsequences.

const    main    =    H    =>    {
    /*
     * This function processes an array 'H' to find consecutive
     * elements that are in non-increasing order.
     * It returns an array 'r' containing the lengths of these sequences.
     */
    const    r    =    [    ]    ;

    var    count    =    0    ;    // Initialize a counter for the current sequence length.

    // Iterate through the array 'H', including an extra iteration to handle the last sequence.
    for    (    var    i    =    0    ;    i    <=    H.length    ;    i++    )
    {

        // Check if the current element is greater than or equal to the next one.
        if    (    H[i]    >=    H[i+1]    )
        {
            count++    ;    // If so, increment the counter for the current non-increasing sequence.
        }
        else
        {
            /*
             * If the current element is smaller than the next,
             * the non-increasing sequence has ended.
             */
            r.push    (    count    )    ;    // Add the length of the completed sequence to the results array.
            count    =    0    ;    // Reset the counter for the next potential sequence.
        }
    }
    // Return the array containing all recorded sequence lengths.
    return    r    ;
}


/*
 * Below this point is the script's main execution block.
 * It handles reading input from standard input, parsing it,
 * and then calling the 'main' function to process the data.
 * Finally, it outputs the maximum sequence length found.
 */
const    input    =    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    .    split    (    '\n'    )    ;
const    H    =    input    [    1    ]    .    split    (    " "    )    .    map    (    x    =>    Number    (    x    )    )    ;

// Call the 'main' function with the parsed array 'H'
// then find the maximum value within the returned array of sequence lengths.
// Finally, print this maximum value to the console.
console.log    (    Math.max    (    ...main    (    H    )    )    )    ;

// End of JavaScript program.