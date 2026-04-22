"use strict"

// This directive enforces strict mode in JavaScript.
// It helps catch common coding errors and "unsafe" actions.


let    arg_str    =    require (    'fs'    )    .    readFileSync (    '/dev/stdin'    ,    'UTF-8'    )
// Read the entire content of standard input as a UTF-8 string.

arg_str    =    arg_str    .    split (    '\n'    )
// Split the input string by newline characters to get an array of lines.


const    arg_str_0    =    arg_str [    0    ]    .    split (    ' '    )
// Take the first line and split it by spaces.

const    N    =    arg_str_0 [    0    ]
// N is the first element of the split first line.

const    K    =    arg_str_0 [    1    ]
// K is the second element of the split first line.

const    Q    =    arg_str_0 [    2    ]
// Q is the third element of the split first line.


const    A_array    =    arg_str    .    slice (    1    )
// A_array contains all lines from the second line onwards.


let    result_val    =    [    ]
// Initialize an empty array to store the results.


// Loop to initialize result_val array.
for    (    let    i    =    0    ;    i    <    N    ;    i    ++    )
{
    // Each element is initialized to K - Q.
    result_val [    i    ]    =    K    -    Q
}


// Process the A_array to update result_val.
A_array    .    map    (    x    =>    result_val [    x    -    1    ]    ++    )
// For each element 'x' in A_array, increment the (x-1)-th element in result_val.
// This accounts for 0-based indexing in JavaScript arrays.


// Output the final results based on result_val.
result_val    .    map    (    x    =>    x    >    0    ?    console    .    log (    'Yes'    )    :    console    .    log (    'No'    )    )
// If an element 'x' in result_val is greater than 0, print 'Yes'.
// Otherwise, print 'No'.
// This uses a ternary operator for conditional output.