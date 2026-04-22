/*
 * This is the main function that processes the input.
 * It's designed to solve a specific problem by manipulating a 2D grid.
 */
function Main ( input )
{

    // Split the input string by newline characters to get individual lines.
    input = input . split ( "\n" ) ;

    // Parse the first number from the first line of input.
    var A = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;

    // Parse the second number from the first line of input.
    var B = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;

    // Initialize a 100x100 grid.
    grid = new Array ( 100 ) ;

    // Populate the grid based on conditions.
    for ( i = 0 ; i < 100 ; i ++ )
    {
        // For the first 50 rows, fill with '.'
        if ( i < 50 )
        {
            tmp = new Array ( 100 ) . fill ( "." ) ; // Create a row of '.'
        }
        else
        {
            // For the remaining 50 rows, fill with '#'
            tmp = new Array ( 100 ) . fill ( "#" ) ; // Create a row of '#'
        }
        grid [ i ] = tmp ; // Assign the created row to the grid.
    }

    // Modify the grid based on the value of B.
    // This loop places '#' characters in specific patterns.
    for ( i = 0 ; i < B - 1 ; i ++ )
    {
        grid [ Math . round ( i / 50 ) * 2 ] [ ( i % 50 ) * 2 ] = "#" ;
    }


    // Modify the grid based on the value of A.
    // This loop places '.' characters in specific patterns.
    for ( i = 0 ; i < A - 1 ; i ++ )
    {
        grid [ 99 - Math . round ( i / 50 ) * 2 ] [ ( i % 50 ) * 2 ] = "." ;
    }

    // Prepare an array to hold the joined rows.
    gridrow = new Array ( 100 ) ;

    // Join each row of the grid into a single string.
    for ( i = 0 ; i < 100 ; i ++ )
    {
        gridrow [ i ] = grid [ i ] . join ( "" ) ;
    }

    // Join all the row strings with newline characters to form the final answer.
    var ans = gridrow . join ( "\n" ) ;


    // Output the final answer to the console.
    console . log ( '%s' , ans ) ;
}


// This function is typically used for debugging purposes in a web environment.
// It retrieves input from a textarea and passes it to the Main function.
function debug ( )
{
    var input = document . getElementById ( "input" ) . value ;
    Main ( input ) ; // Call the main processing function.
}


// This line executes the Main function with input read from stdin.
// It's common in competitive programming environments.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;