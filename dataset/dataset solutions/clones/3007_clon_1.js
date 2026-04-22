/**
 * This JavaScript code processes input to calculate a specific sum.
 * It's a re-formatted version of an existing script, maintaining
 * identical functionality and structure, only altering whitespace
 * and adding comments for visual distinction.
 */

function Main ( input )
{
    // The main function that orchestrates the data processing.

    // First, split the raw input string by newline characters.
    input = input.split ( "\n" ) ;

    // Extract arguments for values from the second line of input.
    v_args = input [ 1 ] . split ( " " ) ;

    // Extract arguments for costs from the third line of input.
    c_args = input [ 2 ] . split ( " " ) ;


    // Parse the number of items from the first line of input.
    var num = parseInt ( input [ 0 ] , 10 ) ;

    // Initialize an array to store the values of each item.
    var value = new Array ( num ) ;

    // Initialize an array to store the costs associated with each item.
    var cost = new Array ( num ) ;

    // Initialize a variable to accumulate the final sum.
    var sum = 0 ;


    // Loop through each item to populate the value and cost arrays.
    for ( var i = 0 ; i < num ; i ++ )
    {
        // Convert the string representation of value to an integer.
        value [ i ] = parseInt ( v_args [ i ] , 10 ) ;

        // Convert the string representation of cost to an integer.
        cost [ i ] = parseInt ( c_args [ i ] , 10 ) ;
    }


    // Second loop to calculate the sum of positive benefits.
    for ( var i = 0 ; i < num ; i ++ )
    {
        // Calculate the benefit (value minus cost) for the current item.
        var bnf = value [ i ] - cost [ i ] ;

        // If the calculated benefit is positive, add it to the total sum.
        if ( bnf > 0 )
        {
            sum += bnf ; // Accumulate the positive benefit.
        }
    }


    // Output the final calculated sum to the console.
    console . log ( sum ) ;
}

// Call the Main function with input read from standard input.
// This line uses Node.js specific file system operations.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf-8" ) ) ;