/* This JavaScript code defines a main function 'Main'
   that processes an input string, performs some calculations,
   and then prints a result to the console. */

function Main( ss )
{
    // The input string 'ss' is first split into an array of lines.
    ss = ss.split( "\n" ) ;


    /* The first element of the split array is converted to a number
       and stored in the constant 'n'. */
    const n = + ss[0] ;


    // An empty array 's' is declared using 'var'.
    var s = [ ] ;

    /* This loop initializes elements of the array 's'.
       It duplicates each line from 'ss' and stores it at two positions. */
    for ( var i = 0 ; i < n ; i ++ )
    {
        /* The (i+1)-th line from 'ss' is concatenated with itself,
           and this resulting string is assigned to s[i] and s[i+n]. */
        s [ i + n ] = s [ i ] = ss [ i + 1 ] + ss [ i + 1 ] ;
    } // End of initialization loop


    // A variable 'ans' is declared and initialized to 0. This will store the final answer.
    var ans = 0 ;

    /* These nested loops iterate through all possible pairs of (i, j)
       where i and j range from 0 to n-1. */
    for ( i = 0 ; i < n ; i ++ )
    for ( var j = 0 ; j < n ; j ++ )
    {
        // The function 'f' is called with current 'i' and 'j', and its result is added to 'ans'.
        ans += f ( i , j ) ;
    } // End of nested loops for calculating 'ans'


    // The final calculated answer is printed to the console.
    console . log ( ans ) ;


    /* This is a helper function 'f' that takes two arguments, 'a' and 'b'.
       It checks a specific condition based on the 's' array and returns either 0 or 1. */
    function f ( a , b )
    {

        /* This inner set of nested loops iterates through pairs (i, j)
           where i ranges from 0 to n-1, and j ranges from i+1 to n-1. */
        for ( var i = 0 ; i < n ; i ++ )
        for ( var j = i + 1 ; j < n ; j ++ )
        {
            /* It compares two elements from the 's' array.
               If they are not equal, the function immediately returns 0. */
            if ( s [ i + a ] [ j + b ] !== s [ j + b ] [ i + a ] )
                return 0 ;
        } // End of inner nested loops

        // If the condition holds true for all pairs, the function returns 1.
        return 1 ;
    } // End of function 'f'

} // End of Main function

/* The Main function is called here with the content of a file
   read from standard input. */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;