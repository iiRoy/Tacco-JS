/* This is a Type I clone generated from the original source code.
 * Only whitespace and comments have been altered.
 * All identifiers, operators, and expressions remain identical. */
function   Main (  input )
{
    // Destructure the input string into two numbers, x and y.
    var  [ x , y ]  =  input .split ( " " ) .map ( Number ) ;

    var   min   =   Number . MAX_SAFE_INTEGER ; // Initialize min with the largest safe integer value.


    {   /* Block 1: First calculation set. */
        var   arr   =   [ 0 ,   0 ,   0 ] ; // Initialize a temporary array.

        // Calculate the first element of arr using floor division for x/3.
        arr [ 0 ]   =   Math . floor ( x / 3 )   *   y ;

        // Calculate an intermediate value 'p' using ceil for x/3*2.
        var   p   =   Math . ceil ( x / 3 * 2 ) ;

        // Calculate the second and third elements of arr.
        arr [ 1 ]   =   p   *   Math . ceil ( y / 2 ) ;
        arr [ 2 ]   =   p   *   Math . floor ( y / 2 ) ;

        // The following line was commented out in the original, keeping it commented.
        // console.log(arr)

        // Update 'min' with the difference between max and min values in 'arr'.
        min   =   Math . min ( Math . max . apply ( null , arr )   -   Math . min . apply ( null , arr ) ) ;
    }


    {   /* Block 2: Second calculation set, similar to the first but with different Math functions. */
        var   arr   =   [ 0 , 0 , 0 ] ; // Re-declare arr for this block scope.

        // Calculate the first element of arr using ceil division for x/3.
        arr [ 0 ]   =   Math . ceil ( x / 3 )   *   y ;

        // Calculate an intermediate value 'p' using floor for x/3*2.
        var   p   =   Math . floor ( x / 3 * 2 ) ;

        // Calculate the second and third elements of arr.
        arr [ 1 ]   =   p   *   Math . ceil ( y / 2 ) ;
        arr [ 2 ]   =   p   *   Math . floor ( y / 2 ) ;

        // Original comment preserved.
        // console.log(arr)

        // Update 'min' again based on the new 'arr' values.
        min   =   Math . min ( Math . max . apply ( null , arr )   -   Math . min . apply ( null , arr ) ) ;
    }


    // Swap x and y using a temporary variable implicitly with the comma operator.
    // This is a common JavaScript trick for swapping variables.
    x   =   y   +   ( y = x , 0 ) ;


    {   // Block 3: Third calculation set, identical to Block 1 but after x and y swap.
        var   arr   =   [ 0 ,   0 ,   0 ] ;

        arr [ 0 ]   =   Math . floor ( x / 3 )   *   y ;
        var   p   =   Math . ceil ( x / 3 * 2 ) ;
        arr [ 1 ]   =   p   *   Math . ceil ( y / 2 ) ;
        arr [ 2 ]   =   p   *   Math . floor ( y / 2 ) ;

        // Original comment.
        // console.log(arr)

        min   =   Math . min ( Math . max . apply ( null , arr )   -   Math . min . apply ( null , arr ) ) ;
    }


    {   // Block 4: Fourth calculation set, identical to Block 2 but after x and y swap.
        var   arr   =   [ 0 , 0 , 0 ] ;

        arr [ 0 ]   =   Math . ceil ( x / 3 )   *   y ;
        var   p   =   Math . floor ( x / 3 * 2 ) ;
        arr [ 1 ]   =   p   *   Math . ceil ( y / 2 ) ;
        arr [ 2 ]   =   p   *   Math . floor ( y / 2 ) ;

        // Original comment.
        // console.log(arr)

        min   =   Math . min ( Math . max . apply ( null , arr )   -   Math . min . apply ( null , arr ) ) ;
    }


    {   /* Conditional block for x. */
        if ( x % 3 == 0 ) // Check if x is perfectly divisible by 3.
        {
            min   =   0 ; // If x is divisible by 3, min can be 0.
        }
        else
        {
            min   =   Math . min ( min , y ) ; // Otherwise, update min with current min or y.
        }
    }


    {   /* Conditional block for y. */
        if ( y % 3 == 0 ) // Check if y is perfectly divisible by 3.
        {
            min   =   0 ; // If y is divisible by 3, min can be 0.
        }
        else
        {
            min   =   Math . min ( min , x ) ; // Otherwise, update min with current min or x.
        }
    }

    // Output the final calculated minimum value to the console.
    console . log ( min ) ;
}

// Call the Main function with input read from stdin.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;