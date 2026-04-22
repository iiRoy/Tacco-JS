'use strict' ;


/*
 * This function calculates the median of a given array of numbers.
 * Note: The input array 'arr' will be sorted in place.
 */
const    median    =    (    arr    )    =>    {

    // The array 'arr' will be modified by the sort() method.
    // This is an in-place sort operation.
    return    arr . sort ( ) [    0    |    (    arr . length    /    2    )    ]    ;

}    ;


/*
 * The main function to process the input and calculate the median of medians.
 * It reads input, parses it, and then applies a specific algorithm.
 */
const    main    =    (    input    )    =>    {


    const    lines    =    input . split    (    '\n'    )    ;

    // The first line contains N, but it's not directly used for N itself,
    // rather for the number of elements in the second line.
    const    header    =    lines    [    0    ]    .    split    (    ' '    )    ;
    const    N    =    parseInt    (    header    [    0    ]    ,    10    )    ;


    // Parse the array 'a' from the second line of input.
    const    a    =    lines    [    1    ]    .    split    (    ' '    )    .    map    (    v    =>    parseInt    (    v    ,    10    )    )    ;


    // 'm' will store the medians of all possible subarrays.
    const    m    =    [    ]    ;


    /*
     * Iterate through all possible subarrays of 'a'.
     * A subarray is defined by its starting index 'l' and ending index 'r'.
     */
    for    (    let    r    =    0    ;    r    <    N    ;    r    ++    )    {

        for    (    let    l    =    0    ;    l    <=    r    ;    l    ++    )    {

            // Extract the current subarray.
            const    n    =    a    .    slice    (    l    ,    r    +    1    )    ;

            // Calculate the median of the current subarray.
            const    med_n    =    median    (    n    )    ;

            // Add this median to our list 'm'.
            m    .    push    (    med_n    )    ;
        }
    }

    // Finally, print the median of all the collected medians.
    console    .    log    (    median    (    m    )    )    ;
}    ;


// A flag to determine if the script is running in test mode.
const    isTest    =    false    ;


/*
 * Conditional execution block:
 * If 'isTest' is true, run with predefined test cases.
 * Otherwise, read input from standard input.
 */
if    (    isTest    )    {

    // Test case 1
    main    (    '3\n10 30 20'    )    ;

    // Test case 2
    main    (    '1\n10'    )    ;

    // Test case 3
    main    (    '10\n5 9 5 9 8 9 3 5 4 3'    )    ;
}    else    {

    // Read input from /dev/stdin for production environment.
    main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    )    ;
}