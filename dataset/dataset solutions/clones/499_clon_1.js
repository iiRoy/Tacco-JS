// This JavaScript code defines a function for a specific mathematical operation
// and then processes input data based on that function.

// The `calc` function performs a calculation, potentially a quaternion multiplication
// or a similar vector/matrix operation, on eight input parameters.
// It takes two sets of four components (x1, y1, z1, w1) and (x2, y2, z2, w2).
function    calc    (    x1    ,    y1    ,    z1    ,    w1    ,    x2    ,    y2    ,    z2    ,    w2    )
{
    // Initialize a four-element array, `arr`, with all values set to zero.
    // This array will store the computed result.
    var    arr    =    [    0    ,    0    ,    0    ,    0    ]    ;

    // --- First set of calculations: contributions involving x1 ---
    arr    [    0    ]    +=    (    x1    *    x2    )    ;
    arr    [    1    ]    +=    (    x1    *    y2    )    ;
    arr    [    2    ]    +=    (    x1    *    z2    )    ;
    arr    [    3    ]    +=    (    x1    *    w2    )    ;

    // --- Second set of calculations: contributions involving y1 ---
    arr    [    1    ]    +=    (    y1    *    x2    )    ;
    arr    [    0    ]    -=    (    y1    *    y2    )    ;
    arr    [    3    ]    +=    (    y1    *    z2    )    ;
    arr    [    2    ]    -=    (    y1    *    w2    )    ;

    // --- Third set of calculations: contributions involving z1 ---
    arr    [    2    ]    +=    (    z1    *    x2    )    ;
    arr    [    3    ]    -=    (    z1    *    y2    )    ;
    arr    [    0    ]    -=    (    z1    *    z2    )    ;
    arr    [    1    ]    +=    (    z1    *    w2    )    ;

    // --- Fourth set of calculations: contributions involving w1 ---
    arr    [    3    ]    +=    (    w1    *    x2    )    ;
    arr    [    2    ]    +=    (    w1    *    y2    )    ;
    arr    [    1    ]    -=    (    w1    *    z2    )    ;
    arr    [    0    ]    -=    (    w1    *    w2    )    ;

    // The function returns the final computed array.
    return    arr    ;
}


// --- Main script execution block ---

// Read the entire content of standard input (`/dev/stdin`) as a UTF-8 string.
// The `require('fs')` call imports the Node.js file system module.
var    input    =    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    ;

// Trim any leading or trailing whitespace from the input string,
// then split it into an array of strings based on newline characters.
// Each element of `Arr` will be a line from the input.
var    Arr    =    (    input    .    trim    (    )    )    .    split    (    "\n"    )    ;

// The first element of `Arr` (which is the first line of input)
// is treated as the number of test cases, `N`.
// `shift()` removes this element from `Arr` and returns it.
// Subtracting `0` (`-0`) is a concise way to ensure the string is converted to a number.
var    N    =    Arr    .    shift    (    )    -    0    ;

// Loop `N` times to process each test case provided in the input.
for    (    var    I    =    0    ;    I    <    N    ;    I    ++    )
{
    // If the current line (Arr[I]) is exactly '0' (as a string),
    // it's interpreted as a signal to stop processing further test cases.
    if    (    Arr    [    I    ]    ==    0    )
    {
        break    ;
    }

    // Split the current line (Arr[I]) by spaces.
    // Then, use `map(Number)` to convert each resulting string segment into a number.
    // This creates an array `A` containing the numeric arguments for the `calc` function.
    var    A    =    Arr    [    I    ]    .    split    (    " "    )    .    map    (    Number    )    ;

    // Call the `calc` function. `apply(null, A)` passes the elements of array `A`
    // as individual arguments to `calc`. `null` is used as the `this` context.
    var    ans    =    calc    .    apply    (    null    ,    A    )    ;

    // Join the elements of the result array `ans` with a single space
    // and print the resulting string to the console.
    console    .    log    (    ans    .    join    (    " "    )    )    ;
}

// --- End of script execution ---