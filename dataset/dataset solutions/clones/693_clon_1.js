function   Main  (  input  )
{
    // Initialize the input by splitting it into lines
    input = input.split ( "\n" ) ;

    // Declare and initialize a counter variable for input lines
    var k = 0 ;

    // Start an infinite loop to process multiple test cases
    while ( true )
    {
        // Split the current line of input by spaces to get parameters
        input[k] = input[k].split ( " " ) ;

        // Parse integer values for n and r from the current input line
        var n = parseInt ( input[k][0] , 10 ) ;
        var r = parseInt ( input[k][1] , 10 ) ;

        // Check for the termination condition: n and r are both 0
        if ( n == 0  &&  r == 0 )
        {
            // Exit the loop if the termination condition is met
            break ;
        }

        // Increment the line counter for the next input line
        k++ ;

        // Declare an array to represent the deck of cards
        var card = [ ] ;

        // Populate the 'card' array with initial card values
        // Cards are numbered from 1 to n, in descending order
        for ( var i = 1 ; i <= n ; i++ )
        {
            card[i] = n - i + 1 ;
        }

        // Process 'r' operations on the card deck
        for ( var i = 0 ; i < r ; i++ )
        {
            // Split the next input line to get operation parameters p and c
            input[k] = input[k].split ( " " ) ;

            // Parse p (position) and c (count) for the current operation
            var p = parseInt ( input[k][0] , 10 ) ;
            var c = parseInt ( input[k][1] , 10 ) ;

            // Create a temporary array 'a' to hold the cards before position 'p'
            var a = [ ] ;

            // Copy cards from index 1 up to (but not including) 'p' into array 'a'
            for ( var j = 1 ; j < p ; j++ )
            {
                a[j] = card[j] ;
            }

            // Move cards from position 'p' onwards to the beginning of the deck
            // Specifically, move 'c' cards starting from 'p' to indices 1 to 'c'
            for ( var j = 1 ; j <= c ; j++ )
            {
                card[j] = card[j + p - 1] ;
            }

            // Place the cards from the temporary array 'a' back into the deck
            // These cards are placed after the 'c' cards that were just moved
            for ( var j = 1 ; j < p ; j++ )
            {
                card[j + c] = a[j] ;
            }

            // Increment the line counter for the next set of operation parameters
            k++ ;
        }

        // After all operations for a test case, print the value of the first card
        console.log ( card[1] ) ;
    } // End of while loop

    // The function ends here
}

// Read input from standard input and pass it to the Main function
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;