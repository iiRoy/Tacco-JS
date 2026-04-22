// This script processes input from standard input.
// It reads a line, splits it by spaces, and then performs array manipulations.


var    a    =    (    require    (    "fs"    )    .    readFileSync    (    0    )    +    ""    )    .    split    (    " "    )


// 'a' now holds an array of strings, parsed from the input.
// The first element of 'a' will be used to determine the initial array size.


var    p    =    new    Array    (    a    [    0    ]    -    0    )    .    fill    (    7    )


// 'p' is an array initialized with a size derived from a[0].
// All elements in 'p' are initially set to the number 7.


console    .    log    (    p    .    fill    (    a    [    2    ]    -    0    ,    0    ,    a    [    1    ]    )    .    join    (    " "    )    )


// The array 'p' is then modified:
// - It's filled with the value derived from a[2] (converted to number).
// - The filling starts from index 0.
// - The filling ends at the index specified by a[1] (exclusive).
// Finally, the modified array 'p' is joined into a string with spaces between elements,
// and this resulting string is printed to the console.