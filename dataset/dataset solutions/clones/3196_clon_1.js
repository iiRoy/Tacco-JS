var    toInt    =    x    =>    parseInt    (    x    ,    10    )    ;    /* Helper function to convert a value to an integer with base 10. */


var    toIntArr    =    arr    =>    arr    .    map    (    x    =>    toInt    (    x    )    )    ;    /* Helper function to convert an array of values to an array of integers. */


var    abs    =    x    =>    x    >    0    ?    x    :    -    x    ;    // Returns the absolute value of a number.

/*
 *   Calculates the minimum value among the provided arguments.
 *   Uses `arguments` object for variadic input.
 */
function    min    (    )
{
    var    rest    =    arguments    ,    v    =    rest    [    0    ]    ;

    for    (    var    i    =    1    ;    i    <    rest    .    length    ;    i    ++    )
    {
        if    (    rest    [    i    ]    <    v    )
        {
            v    =    rest    [    i    ]    ;
        }
    }

    return    v    ;
}

/*
 *   Calculates the maximum value among the provided arguments.
 *   Uses `arguments` object for variadic input.
 */
function    max    (    )
{
    var    rest    =    arguments    ,    v    =    rest    [    0    ]    ;

    for    (    var    i    =    1    ;    i    <    rest    .    length    ;    i    ++    )
    {
        if    (    rest    [    i    ]    >    v    )
        {
            v    =    rest    [    i    ]    ;
        }
    }

    return    v    ;
}

/*
 *   Calculates the greatest common divisor (GCD) of the provided arguments.
 *   Uses a recursive helper function `temp` for the Euclidean algorithm.
 */
function    gcd    (    )
{
    var    rest    =    arguments    ,    v    =    rest    [    0    ]    ,
        temp    =    (    a    ,    b    )    =>    b    ?    temp    (    b    ,    a    %    b    )    :    a    ;

    for    (    var    i    =    1    ;    i    <    rest    .    length    ;    i    ++    )
    {
        v    =    temp    (    v    ,    rest    [    i    ]    )    ;
    }

    return    v    ;
}

/*
 *   This is the main entry point of the script.
 *   It reads input from standard input, processes it, and prints the result.
 */
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;


/*
 *   The primary function that encapsulates the problem's logic.
 *   It takes the raw input string as an argument.
 */
function    Main    (    input    )
{
    // Process the raw input: split by newlines, then by spaces, and convert to integers.
    var    input    =
        input
            .    split    (    '\n'    )
            .    map    (    (    el    ,    ind    ,    arr    )    =>
                toIntArr    (    el    .    split    (    ' '    )    )
            )    ;

    // Extract 'n' and 'm' from the first line of input.
    var    n    =    input    [    0    ]    [    0    ]    ;
    var    m    =    input    [    0    ]    [    1    ]    ;

    // Sort the second line of input ('as') in descending order.
    var    as    =    input    [    1    ]    .    sort    (    (    a    ,    b    )    =>    b    -    a    )    ;

    // Define the 'must' array representing costs for digits 0-9.
    var    must    =    [    0    ,    2    ,    5    ,    5    ,    4    ,    5    ,    6    ,    3    ,    7    ,    6    ]    ;

    // Initialize an empty array 'can' to store possible digit-cost pairs.
    var    can    =    [    ]    ;

    // Declare variables for internal loop use.
    var    x    ,    y    ,    z    ;

    /*
     *   Populate the 'can' array with unique digit-cost pairs
     *   from the sorted 'as' array.
     */
    for    (    var    i    =    0    ;    i    <    m    ;    i    ++    )
    {
        x    =    as    [    i    ]    ; // Get the current digit from 'as'.

        // If a digit with the same cost isn't already in 'can', add it.
        if    (    can    .    find    (    e    =>    e    [    1    ]    ===    must    [    x    ]    )    ===    undefined    )
        {
            can    .    push    (    [    x    ,    must    [    x    ]    ]    )    ;
        }
    }

    // Sort the 'can' array by cost in ascending order.
    can    .    sort    (    (    a    ,    b    )    =>    a    [    1    ]    -    b    [    1    ]    )    ;

    // console.log(can); // This line is commented out in the original, so it remains commented.

    // Initialize 'preans' array to store the structure of the answer.
    var    preans    =    [    ]    ;

    // Calculate the initial number of times the cheapest digit can be used.
    preans    [    0    ]    =    [    can    [    0    ]    [    0    ]    ,    Math    .    floor    (    n    /    can    [    0    ]    [    1    ]    )    ]    ;
    n    %=    can    [    0    ]    [    1    ]    ; // Update 'n' with the remaining cost.

    var    l    =    can    .    length    ; // Store the length of 'can' for loop optimization.

    /*
     *   Main loop to optimize the digit usage.
     *   It tries to replace some occurrences of the cheapest digit
     *   with more expensive, larger digits to maximize the final number.
     */
    while    (    n    !==    0    )
    {
        n    +=    can    [    0    ]    [    1    ]    ; // Add back the cost of one cheapest digit.
        preans    [    0    ]    [    1    ]    --    ; // Decrement its count in 'preans'.

        x    =    10    ;    // Initialize 'x' to an invalid index.
        y    =    10    ;    // Initialize 'y' to a high remainder value.

        // Iterate through 'can' (excluding the cheapest digit) to find the best replacement.
        for    (    var    i    =    1    ;    i    <    l    ;    i    ++    )
        {
            // If the current digit yields a smaller remainder, it's a better candidate.
            if    (    n    %    can    [    i    ]    [    1    ]    <    y    )
            {
                x    =    i    ; // Store the index of the best candidate.
                y    =    n    %    can    [    i    ]    [    1    ]    ; // Store the new minimum remainder.
            }
        }

        // If a suitable replacement (remainder less than 10) was found.
        if    (    y    <    10    )
        {
            // Add the new digit and its count to 'preans'.
            preans    .    push    (    [    can    [    x    ]    [    0    ]    ,    Math    .    floor    (    n    /    can    [    x    ]    [    1    ]    )    ]    )    ;
            n    =    y    ; // Update 'n' with the new remainder.
        }
    }

    // Sort 'preans' in descending order of digits to construct the largest number.
    preans    .    sort    (    (    a    ,    b    )    =>    b    [    0    ]    -    a    [    0    ]    )    ;

    var    ans    =    ''    ; // Initialize the final answer string.

    l    =    preans    .    length    ; // Get the length of 'preans' for the loop.

    // Construct the final answer string by repeating digits.
    for    (    var    i    =    0    ;    i    <    l    ;    i    ++    )
    {
        // The original code used padStart, but repeat is more direct for this case.
        // ans += ''.padStart(preans[i][1],preans[i][0]);
        ans    +=    String    (    preans    [    i    ]    [    0    ]    )    .    repeat    (    preans    [    i    ]    [    1    ]    )    ;
    }

    console    .    log    (    ans    )    ; // Print the final generated number.

    return    0    ; // Indicate successful execution.
}