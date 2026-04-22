/* This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly. */

function    main (  arg  )   {
        // The main function processes input and calculates a sum based on specific rules.

    arg  =  arg . split ( "\n" ) . map ( Number ) ; // Splits the input string by newlines and converts each part to a number.

    var   data   =   [     // Initializes an array 'data' with the first five numbers from the processed input.
        arg [ 0 ] ,  arg [ 1 ] ,  arg [ 2 ] ,  arg [ 3 ] ,  arg [ 4 ]
    ] ;


    data . sort ( ( a , b )  =>   {
        // Defines a custom sorting function for the 'data' array.
        // It sorts based on the last digit of each number, treating 0 as 10.

        var   _a   =   a % 10 ; // Gets the last digit of 'a'.
        var   _b   =   b % 10 ; // Gets the last digit of 'b'.

        if  ( _a   ==   0 )   {
            _a   =   10 ;   // If the last digit is 0, assign 10 for sorting.
        }

        if  ( _b   ==   0 )   {
            _b   =   10 ;   // If the last digit is 0, assign 10 for sorting.
        }

        return   Number ( _b )   -   Number ( _a ) ; // Sorts in descending order based on the modified last digit.
    } ) ;


    var   sum     =   0 ;   // Initializes a variable 'sum' to accumulate the result.

    for  ( var   i   =   0 ;   i   <   data . length ;   i ++ )   {
        // Iterates through the sorted 'data' array.

        var   ans   =   Math . ceil ( data [ i ]   /   10 ) ; // Calculates the ceiling of data[i] divided by 10.
        // The original `console.log(ans)` comment was removed here.

        if  ( i   ===   data . length   -   1 )   {
            sum   +=   data [ i ] ; // If it's the last element, add its original value to 'sum'.
        }   else   {
            sum   +=   ans   *   10 ; // For all other elements, add 'ans' multiplied by 10 to 'sum'.
        }
    }


    console . log ( sum ) ;   // Prints the final calculated sum to the console.

}

// This line executes the main function by reading input from standard input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;