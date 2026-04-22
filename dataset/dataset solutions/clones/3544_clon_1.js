var   toInt    =   x  =>  parseInt ( x , 10 ) ; // Converts a string to an integer base 10

var toIntArr = arr => arr . map ( x => toInt ( x ) ) ; // Maps an array of strings to an array of integers

var abs = x => x > 0 ? x : -x ; // Calculates the absolute value of a number

/*
 * This function finds the minimum value among its arguments.
 * It uses the 'arguments' object, which is an array-like object
 * corresponding to the arguments passed to a function.
 */
function min ( )
{
    var rest = arguments ;
    var val = rest [ 0 ] ;

    for ( var i = 1 ; i < rest . length ; i ++ )
    {
        if ( rest [ i ] < val )
        {
            val = rest [ i ] ;
        }
    }
    return val ;
}


/*
 * This function finds the maximum value among its arguments.
 * Similar to 'min', it also uses the 'arguments' object.
 */
function max ( )
{
    var rest = arguments ;
    var val = rest [ 0 ] ;

    for ( var i = 1 ; i < rest . length ; i ++ )
    {
        if ( rest [ i ] > val )
        {
            val = rest [ i ] ;
        }
    }
    return val ;
}

// Entry point of the program, reads input from stdin
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/**
 * The main function that processes the input and calculates the result.
 * @param {string} input - The raw input string from stdin.
 */
function Main ( input )
{
    // Split the input string by newlines to get individual lines
    var input = input . split ( '\n' ) ;

    // Parse the first line, split by spaces, into an array of integers
    var temp = toIntArr ( input [ 0 ] . split ( ' ' ) ) ;

    // Extract n and x from the parsed first line
    var n = temp [ 0 ] ;
    var x = temp [ 1 ] ;

    // Parse the second line, split by spaces, into an array of integers
    var xs = toIntArr ( input [ 1 ] . split ( ' ' ) ) ;

    // Initialize an array 'ss' with the first element of 'xs'
    var ss = [ xs [ 0 ] ] ;

    // Calculate prefix sums for the 'xs' array and store them in 'ss'
    for ( var i = 1 ; i < n ; i ++ )
    {
        ss [ i ] = xs [ i ] + ss [ i - 1 ] ;
    }

    // Initialize the answer with a base value
    var ans = ( n + 1 ) * x ;

    // Initialize a counter variable
    var has = 0 ;

    // Iterate backwards through the array 'xs'
    for ( var i = n - 1 ; i > -1 ; i -- )
    {
        has ++ ; // Increment the counter

        // Check a complex condition involving 'has', 'ss', 'xs', and 'x'
        if ( has < 3 || ss [ i ] * ( has - 1 ) * 2 - xs [ i ] * 2 < x )
        {
            // If condition is true, update 'ans' with a specific calculation
            ans += xs [ i ] * ( max ( has , 2 ) * 2 + 1 ) ;
        }
        else
        {
            // If condition is false, reset 'has' and update 'ans' differently
            has = 1 ;
            ans += xs [ i ] * 5 + x ;
        }
    }

    // Output the final calculated answer to the console
    console . log ( ans ) ;

}