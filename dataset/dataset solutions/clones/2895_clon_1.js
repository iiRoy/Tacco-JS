'use    strict'
/*
 * This is the main function of the program.
 * It processes the input to calculate and display two results.
 */
function    Main    (    input    )    {

// Parse the input data into relevant variables.
    const    N    =    Number    (    input    .    split    (    "\n"    )    [    0    ]    )    ;
    const    A    =    input    .    split    (    "\n"    )    .    slice    (    1    ,    N    )    .    map    (    x    =>    x    .    split    (    " "    )    )    ; // A contains pairs of node connections
    const    B    =    input    .    split    (    "\n"    )    [    N    ]    .    split    (    " "    )    .    map    (    x    =>    Number    (    x    )    )    ;
// Sort array B in descending order.
    B    .    sort    (    (    a    ,    b    )    =>    b    -    a    )    ;

// Calculate M: sum of elements in B minus the largest element.
    const    M    =    B    .    reduce    (    (    acc    ,    x    )    =>    acc    +    x    )    -    Math    .    max    (    ...B    )    ;
// Output the first result.
    console    .    log    (    M    )    ;

// Initialize an array to hold node objects.
    const    nodes    =    [    ]    ;
// Populate the nodes array with basic node objects.
    for    (    let    i    =    0    ;    i    <    N    ;    i    ++    )    {
        nodes    .    push    (    {    "no"    :    i    +    1    }    )    ; // Each node gets a 'no' property
    }
// Determine 'layer' for each node based on connections in A.
    for    (    let    j    =    0    ;    j    <    N    -    1    ;    j    ++    )    {
        if    (    nodes    [    (    Number    (    A    [    j    ]    [    0    ]    )    -    1    )    ]    .    layer    ==    null    )    {
            nodes    [    (    Number    (    A    [    j    ]    [    0    ]    )    -    1    )    ]    .    layer    =    0    ; // Root nodes start at layer 0
        }
        nodes    [    (    Number    (    A    [    j    ]    [    1    ]    )    -    1    )    ]    .    layer    =    nodes    [    (    Number    (    A    [    j    ]    [    0    ]    )    -    1    )    ]    .    layer    +    1    ; // Child node layer is parent layer + 1
    }
// Sort the nodes array by their 'layer' property.
    nodes    .    sort    (    (    a    ,    b    )    =>    a    .    layer    -    b    .    layer    )    ;

// Prepare an array to store the final answer.
    const    ansArray    =    [    ]    ;
// Map sorted B values to nodes based on their sorted layer order.
    for    (    let    k    =    0    ;    k    <    N    ;    k    ++    )    {
        ansArray    [    nodes    [    k    ]    .    no    -    1    ]    =    B    [    k    ]    ;
    }

// Output the second result, joined by spaces.
    console    .    log    (    ansArray    .    join    (    " "    )    )    ;

} // End of Main function

// Read input from standard input, decode as UTF-8, and trim whitespace.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    .    trim    (    )    )    ;