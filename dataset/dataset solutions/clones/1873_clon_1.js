/*
 * This JavaScript file processes input to solve a specific problem.
 * It identifies the minimum cost to acquire a set of books
 * such that all required skills reach a certain level.
 *
 * The algorithm explores all possible combinations of buying books
 * and calculates the total skill levels and costs for each combination.
 */

function Main( input )
{
    // Split the entire input string by newline characters into an array of lines.
    input = input.split( "\n" ) ;

    /*
     * Parse the first line of input, which contains global parameters.
     * These parameters define the problem's scope.
     */
    const N = input[0].split( ' ' )[0] - 0 ; // N: Represents the total number of books available.
    const M = input[0].split( ' ' )[1] - 0 ; // M: Denotes the number of distinct skills.
    const X = input[0].split( ' ' )[2] - 0 ; // X: The target minimum skill level required for each skill.

    // Declare arrays to store book-specific data.
    var c = [] ; // 'c' will store the cost of each book.
    var a = [] ; // 'a' will store skill improvements offered by each book.

    var temp ; // A temporary variable used for parsing and calculations.

    // Iterate through the input lines starting from the second line (index 1).
    // Each subsequent line describes a book.
    for ( var i = 1 ; i < input.length ; i ++ )
    {
        // Split the current line by spaces and convert all parts to numbers.
        temp = input[i].split( ' ' ).map( e => { return e - 0 ; } ) ;

        // The first element of the parsed line is the cost of the current book.
        c.push( temp[0] ) ;

        // Remove the cost from the 'temp' array, leaving only skill improvement values.
        temp.shift() ;

        // Add the remaining skill improvement values as an array to 'a'.
        // Using `concat([])` ensures that a new array instance is pushed, preventing reference issues.
        a.push( temp.concat( [] ) ) ;
    }


    // 'isBought' is a boolean array to keep track of which books are currently selected.
    var isBought = new Array( N ) ;
    isBought.fill( false ) ; // Initialize all books as not bought.

    // 'min' will store the minimum cost found so far to satisfy all skill requirements.
    // Initialize it to Infinity to ensure any valid cost will be smaller.
    var min = Infinity ;


    // Label for the main loop, allowing 'continue' to jump directly to its beginning.
    loop1 :
    do
    {
        /*
         * This nested loop effectively generates all 2^N combinations of buying books.
         * It works like a binary counter, incrementing 'isBought' array as a binary number.
         * For example, if N=3, it goes from [F,F,F] to [T,T,T].
         */
        for ( var i = 0 ; i < N ; i ++ )
        {
            if ( isBought[i] )
            {
                // If the current book was bought in the previous combination, un-buy it.
                isBought[i] = false ;
            }
            else
            {
                // If the current book was not bought, buy it. This completes the "increment"
                // for this position in the binary counter, so we can break and evaluate.
                isBought[i] = true ;
                break ;
            }
        }


        // Now, evaluate the current combination of bought books.
        // Check if all skill requirements are met by the selected books.
        for ( var i = 0 ; i < M ; i ++ ) // Iterate through each skill.
        {
            temp = 0 ; // Reset 'temp' to calculate the total level for the current skill.

            for ( var j = 0 ; j < N ; j ++ ) // Iterate through each book.
            {
                if ( isBought[j] )
                {
                    // If the book 'j' is bought, add its contribution to skill 'i'.
                    temp += a[j][i] ;
                }
            }

            // If the total skill level for skill 'i' is less than the target 'X',
            // this combination is invalid. Skip to the next book combination.
            if ( temp < X )
            {
                continue loop1 ; // Jump back to the 'do' part of the outer loop.
            }
        }

        // If all skill requirements (for all M skills) are met by this combination,
        // calculate the total cost of the selected books.
        temp = 0 ; // Reset 'temp' to calculate the total cost.
        for ( var i = 0 ; i < N ; i ++ )
        {
            if ( isBought[i] )
            {
                // Add the cost of each bought book to the total.
                temp += c[i] ;
            }
        }

        // Update 'min' if the current combination's cost is lower than the previously found minimum.
        if ( min > temp )
        {
            min = temp ;
        }

    } while ( !isBought.every( e => { return !e ; } ) ) ; // Continue looping until 'isBought' becomes all 'false',
                                                      // which signifies that all 2^N combinations have been checked.


    // Output the final result. If 'min' is still Infinity, it means no combination
    // satisfied the skill requirements, so output -1. Otherwise, output the minimum cost.
    console.log( min === Infinity ? -1 : min ) ;
}


// --- Standard input/output handling (do not modify this section) ---
// This part reads all input from standard input and passes it to the Main function.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;