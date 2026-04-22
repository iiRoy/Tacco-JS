function solve( n,   x,   A,   S,   dp  )
{
    // This function recursively determines if a target sum 'x' can be achieved
    // given a set of numbers 'A' and a string of operations 'S'.
    // 'n' represents the current number of remaining operations to process.
    // 'dp' is a memoization table to store results of subproblems.

    /*
     *  The base case for the recursion:
     *  If no more operations are left (n === 0),
     *  the target 'x' must also be 0 for a valid solution.
     */
    if  (  n  ===  0  )
    {
        return   x  ===  0;
    }


    /*
     *  Retrieve the current operation character from string S.
     *  The index is calculated from the end of the string,
     *  corresponding to the 'n'-th operation from the end.
     */
    const   s   =   S[  S.length  -  n  ];

    // Check if the result for the current subproblem (n, x) has already been computed
    // and stored in the dynamic programming table.
    if  (  dp[ n ]  !==  undefined   &&   dp[ n ][ x ]  !==  undefined  )
    {
        // If it exists, return the memoized result directly.
        return   dp[ n ][ x ];
    }

    // Declare a variable 'r' to hold the result of the current computation.
    let   r;

    // Based on the current operation 's', perform different recursive calls.
    if  (  s  ===  '1'  )
    {
        // If 's' is '1', both recursive paths must lead to a solution (AND logic).
        // Path 1: Do not apply the XOR operation with A[S.length - n].
        // Path 2: Apply the XOR operation with A[S.length - n].
        r   =   solve( n - 1, x, A, S, dp )   &&
                solve( n - 1, x  ^  A[ S.length  -  n ], A, S, dp );
    }
    else
    {
        // If 's' is '0', at least one of the recursive paths must lead to a solution (OR logic).
        // Path 1: Do not apply the XOR operation.
        // Path 2: Apply the XOR operation.
        r   =   solve( n - 1, x, A, S, dp )   ||
                solve( n - 1, x  ^  A[ S.length  -  n ], A, S, dp );
    }

    // If the 'n'-th level of the dp table is not yet initialized, create an empty object for it.
    if  (  dp[ n ]  ===  undefined  )
    {
        dp[ n ]   =   {};
    }

    // Store the computed result 'r' in the memoization table for future use.
    dp[ n ][ x ]   =   r;

    // Return the calculated result.
    return   r;
}


function main( input )
{
    // The main function reads input, parses it, and calls the 'solve' function.

    const   inputs   =   input.split( '\n' );

    // The first line of input contains the number of test cases, T.
    const   T   =   Number( inputs[ 0 ] );

    // Loop through each test case. Each test case consists of 3 lines: N, A, S.
    // So, we iterate T * 3 lines, incrementing by 3 each time.
    for
    (
        let   i   =   0;
        i   <   T   *   3;
        i   +=   3
    )
    {
        // Parse the input for the current test case.
        // N is the length of the string S (or number of operations).
        const   N   =   Number( inputs[ i   +   1 ] );

        // A is an array of numbers, space-separated.
        // Convert string elements to numbers.
        const   A   =   inputs[ i   +   2 ].split( ' ' ).map( Number );

        // S is the string of operations ('0' or '1').
        const   S   =   inputs[ i   +   3 ];

        // Initialize an empty dynamic programming table for the current test case.
        const   dpTable   =   {};

        // Call the solve function with initial parameters:
        // n = N (total operations), x = 0 (initial target), A, S, and the dp table.
        const   result   =   solve( N,   0,   A,   S,   dpTable  );

        // Print '0' if the result is true (a solution exists), otherwise print '1'.
        // This seems to be an inverted output requirement.
        console.log( result   ?   '0'   :   '1' );
    }
}

// Read input from stdin and pass it to the main function.
main(  require( "fs" ).readFileSync( "/dev/stdin", "utf8" )  );