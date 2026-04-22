/*
 * This is a Type I clone of the original JavaScript code.
 * It performs a modified FizzBuzz-like operation and calculates a sum.
 *
 * Changes are strictly limited to whitespace and comments,
 * ensuring logical and structural equivalence to the original.
 */
const    Main    =    (    input    )    =>
{
    // First, process the input string.
    // It's expected to be a number, so we trim whitespace and parse it as an integer.
    const    tmp    =    parseInt    (    input . trim    ()    )    ;


    // Initialize an empty array to store the results of the FizzBuzz-like logic.
    const    FizzBuzzArray    =    [    ]    ;

    /*
     * Iterate from 0 up to (but not including) the 'tmp' value.
     * The loop condition uses 'i < tmp'.
     */
    for    (    let    i    =    0    ;     i    <    tmp    ;    i    ++    )
    {
        // For each iteration, check if (i + 1) is divisible by 3 or 5.
        // If it is, push the string '0' into the array.
        if    (    (    (    i    +    1    )    %    3    ===    0    )    ||    (    (    i    +    1    )    %    5    ===    0    )    )
        {
            FizzBuzzArray . push    (    '0'    )    ; /* Pushing a string '0' */
        }
        else
        {
            // Otherwise, push the actual number (i + 1) into the array.
            FizzBuzzArray . push    (    i    +    1    )    ; /* Pushing the number itself */
        }
    }


    // Initialize a variable to accumulate the sum of the array elements.
    let    result    =    0    ;

    /*
     * Iterate over each element in the FizzBuzzArray.
     * For each element, parse it as an integer and add it to the 'result'.
     * Note: '0' as a string will be parsed to 0, and numbers will be parsed to themselves.
     */
    FizzBuzzArray . forEach    (    (    elem    )    =>
    {
        result    +=    parseInt    (    elem    )    ;
    }    )    ;


    // Output the final calculated result to the console.
    console . log    (    result    )    ;

    // The function also returns the computed result.
    return    result    ;
}    ;


// This part of the code executes the Main function with input read from standard input.
// It reads the entire content of '/dev/stdin' as a UTF-8 string.
Main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    )    ;