function myout ( text ) { /* This helper function outputs text to the console, acting as a standard output mechanism. */ console.log ( text ) ; }

function Main ( input )
{
    // The input string is initially processed here.
    input = input.trim ( ) ;

    // The following lines are commented out as they represent alternative input parsing strategies.
    // input = input.trim().split(" ");
    input = input.trim ( ) .split ( "\n" ) ; // Split the input string by newline characters.
    // input = input.trim().split(" ").map((a)=>Number(a));
    // input = input.trim().split("\n").map((a)=>Number(a));

    // Extract the length from the first line of the input.
    var len = parseInt ( input [ 0 ] ) ;

    // Parse the second line of input into a list of numbers.
    var list = input [ 1 ] .split ( " " ) .map ( ( a ) => Number ( a ) ) ;

    // Initialize an object to keep track of checked numbers and their counts.
    var checked = { } ;

    // Loop through the 'list' array to count occurrences of each number.
    for ( var i = 0 ; i < len ; i ++ )
    {
        // If the number has not been encountered before, initialize its count to 1.
        if ( checked [ list [ i ] ] == null )
        {
            checked [ list [ i ] ] = 1 ;
        }
        // If the number has been encountered once, increment its count.
        else if ( checked [ list [ i ] ] == 1 )
        {
            checked [ list [ i ] ] ++ ;
        }
    }

    /*
     * The following commented block represents a conditional early exit
     * based on the length of the input, but it is currently disabled.
     *
     * if ( len == 1 ) {
     *    myout(1);
     *   return;
     * } else if ( len == 2 ) {
     *          myout(2);
     *   return;
     *          }
     */

    // For debugging purposes, one might output the 'checked' object.
    // myout(checked);

    // Sort the list of numbers in ascending order.
    list.sort ( ) ;

    // Filter out duplicate numbers to get a list of unique numbers, maintaining their original order after sort.
    list = list.filter ( function ( x , i , self )
    {
        return self.indexOf ( x ) === i ;
    } ) ;

    // Initialize the output variable, typically for accumulating results.
    var output = 1 ;

    // Iterate through the unique sorted list to perform checks and calculations.
    for ( var i = 0 ; i < list.length ; i ++ )
    {
        // Special handling for odd length inputs and the number 0.
        if ( len % 2 == 1 && list [ i ] == 0 )
        {
            // If 0 appears more than once in an odd-length input, the condition is not met.
            if ( checked [ list [ i ] ] != 1 )
            {
                myout ( "0" ) ;
                return ; // Exit early if condition fails.
            }
            continue ; // Skip to the next iteration if 0 is handled.
        }

        // For all other numbers, check if they appear exactly twice.
        if ( checked [ list [ i ] ] != 2 )
        {
            myout ( "0" ) ;
            return ; // Exit early if condition fails.
        }
    }

    // If the length of the input is odd, remove the first element (which would be 0 if present and valid).
    if ( len % 2 == 1 )
    {
        list.shift ( ) ;
    }

    // Calculate the final output by repeatedly multiplying by 2 modulo 1000000007.
    for ( var i = 0 ; i < list.length ; i ++ )
    {
        output *= 2 % 1000000007 ;
    }

    // Display the final calculated output.
    myout ( output ) ;
}

// Read input from standard input and pass it to the Main function.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;