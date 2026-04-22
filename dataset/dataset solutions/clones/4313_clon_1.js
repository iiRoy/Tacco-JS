function    getLineByParam    (    param    )
{
    // Declare a variable to hold the extracted line segment.
    var    ret    ;

    // Loop through each character of the first element in the 'param' array.
    for    (    var    i    =    0    ;    i    <    param    [    0    ]    .    length    ;    i    ++    )
    {
        // Check if the current character is a newline character.
        if    (    "\n"    ==    param    [    0    ]    .    charAt    (    i    )    )
        {
            // Extract the substring from the beginning up to, but not including, the newline.
            ret    =    param    [    0    ]    .    slice    (    0    ,    i    )    ;

            // Update param[0] to contain the remaining part of the string after the newline.
            param    [    0    ]    =    param    [    0    ]    .    slice    (    ret    .    length    +    1    )    ;

            // Return the extracted line.
            return    ret    ;
        }
    }

    // If no newline character is found, the entire string in param[0] is considered the line.
    ret    =    param    [    0    ]    ;

    // Clear param[0] as its content has been fully consumed.
    param    [    0    ]    =    ""    ;

    // Return the last segment of the string.
    return    ret    ;
}


function    Main    (    input    )
{
    // Wrap the input string in an array, as getLineByParam expects an array.
    input    =    [    input    ]    ;

    // Extract the first line of input, which represents N.
    var    N    =    getLineByParam    (    input    )    ;

    // Convert the string N to an integer.
    N    =    parseInt    (    N    )    ;


    // This line appears to be a test call or an unused initialization for search2way.
    // Its return value is not captured or used.
    search2way    (    0.0002857959416976279    ,    3500    ,    1750    )    ;


    // Recalculate N as per the problem's specific formula (e.g., 4/N for the equation).
    var    N    =    4    /    N    ;

    // Declare a temporary variable for calculations.
    var    tmp    ;

    // Outer loop for variable 'h', ranging from 1 to 3500.
    for    (    var    h    =    1    ;    h    <=    3500    ;    h    ++    )
    {
        // Optimization: If N is already less than or equal to 1/h, then N - 1/h would be
        // non-positive, meaning 1/n + 1/w would need to be non-positive, which is not possible
        // for positive n and w. So, continue to the next 'h'.
        if    (    N    <=    1    /    h    )
            continue    ;

        // Inner loop for variable 'n', ranging from 1 to 3500.
        for    (    var    n    =    1    ;    n    <=    3500    ;    n    ++    )
        {
            // Calculate the sum of 1/h and 1/n.
            tmp    =    1    /    h    +    1    /    n    ;

            // Optimization: If N is already less than or equal to tmp, then N - tmp would be
            // non-positive, meaning 1/w would need to be non-positive. Continue to the next 'n'.
            if    (    N    <=    tmp    )
                continue    ;

            // Use the search2way function to find a suitable 'w' such that 1/w equals (N - tmp).
            tmp    =    search2way    (    N    -    tmp    ,    3500    ,    1750    )    ;

            // If search2way returns -1, it means no valid 'w' was found for the current h and n.
            if    (    -1    ==    tmp    )
                continue    ;

            // Check if the found combination (h, n, tmp as w) satisfies the main equation.
            if    (    isCorrect    (    N    ,    h    ,    n    ,    tmp    )    )
            {
                // If a correct solution is found, print it (handled by isCorrect) and exit the Main function.
                return    ;
            }
        }
    }

    // If no solution is found after checking all possible combinations, print "NG".
    console    .    log    (    "NG"    )    ;


    // Helper function: Implements a binary search-like algorithm to find a value 'w'.
    // 'ans' is the target value (e.g., N - 1/h - 1/n) that 1/w should equal.
    // 'val' is the current guess for 'w'.
    // 'diff' is the step size for adjusting 'val'.
    function    search2way    (    ans    ,    val    ,    diff    )
    {
        var    tmp    ; // Temporary variable to store 1/val.
        var    fix    =    0    ; // A flag to track the direction of adjustment (0: initial, 1: increasing, -1: decreasing).

        // Continue the search as long as the step size 'diff' is not zero.
        while    (    0    !=    diff    )
        {
            tmp    =    1    /    val    ; // Calculate 1/w for the current guess 'val'.

            // If the calculated 1/w matches the target 'ans', we've found the solution.
            if    (    ans    ==    tmp    )
            {
                return    val    ;
            }
            // If the target 'ans' is less than the current 1/w, it means 'val' (w) is too small.
            else    if    (    ans    <    tmp    )
            {
                val    +=    diff    ; // Increase 'val' by 'diff'.

                // If this is the first adjustment with diff=1, set 'fix' to indicate increasing direction.
                if    (    1    ==    diff    &&    0    ==    fix    )
                    fix    =    1    ;

                // If 'fix' was previously -1 (meaning we were decreasing 'val') and now we need to increase with diff=1,
                // it implies we've crossed the target without hitting it.
                if    (    -1    ==    fix    )
                    return    -1    ;

                // If 'val' exceeds the maximum allowed value, no solution in this branch.
                if    (    val    >    3500    )
                    return    -1    ;
            }
            // If the target 'ans' is greater than the current 1/w, it means 'val' (w) is too large.
            else
            {
                val    -=    diff    ; // Decrease 'val' by 'diff'.

                // If this is the first adjustment with diff=1, set 'fix' to indicate decreasing direction.
                if    (    1    ==    diff    &&    0    ==    fix    )
                    fix    =    -1    ;

                // If 'fix' was previously 1 (meaning we were increasing 'val') and now we need to decrease with diff=1,
                // it implies we've crossed the target without hitting it.
                if    (    1    ==    fix    )
                    return    -1    ;

                // If 'val' goes below the minimum allowed value, no solution in this branch.
                if    (    val    <    1    )
                    return    -1    ;
            }

            // Halve the step size for the next iteration.
            diff    =    Math    .    floor    (    diff    /    2    )    ;

            // Ensure 'diff' is at least 1 to prevent infinite loops if it becomes 0 prematurely.
            if    (    0    ==    diff    )
                diff    =    1    ;
        }

        // If the loop completes without finding an exact match, return -1.
        return    -1    ;
    }


    // Helper function: Checks if the given (N, h, n, w) combination satisfies the equation.
    function    isCorrect    (    N    ,    h    ,    n    ,    w    )
    {
        // Compare N with the sum of reciprocals.
        if    (    N    ==    (    1    /    h    +    1    /    n    +    1    /    w    )    )
        {
            // If the equation holds, print the solution in the specified format.
            console    .    log    (    [    h    ,    n    ,    w    ]    .    join    (    " "    )    )    ;
            return    true    ; // Indicate that a correct solution was found.
        }
        return    false    ; // Indicate that the combination is not correct.
    }


    // This helper function is present in the original code but appears to be unused in Main.
    // It checks if an array 'ary' contains a specific 'idx' (value).
    function    isInclude    (    ary    ,    idx    )
    {
        // Iterate through the array elements.
        for    (    var    i    =    0    ;    i    <    ary    .    length    ;    i    ++    )
        {
            // Use strict equality to check for a match.
            if    (    ary    [    i    ]    ===    idx    )
                return    true    ; // If found, return true.
        }
        return    false    ; // If loop finishes without a match, return false.
    }
}

// Call the Main function, reading input from standard input using Node.js 'fs' module.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;