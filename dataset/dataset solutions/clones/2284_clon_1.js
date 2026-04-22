"use strict"
/* This line enforces strict parsing and error handling in the script */ ;

/**
 * The primary function that processes the input data.
 * @param {string[]} input - An array of strings, where each string represents a line of input.
 */
function main  ( input )
{
    // Parse the first input line as integer 'n'.
    const n = parseInt ( input [ 0 ] ) ;

    /*
     * Parse the second input line to get 'p'.
     * It trims whitespace, splits by spaces, and rejoins, then parses as an integer.
     */
    let p   =   parseInt ( input[1] . trim () . split ( " " ) . join ( "" ) ) ;

    // Similarly, parse the third input line to get 'q'.
    let q = parseInt ( input [ 2 ] . trim () . split ( " " ) . join ( "" ) ) ;

    // An array containing starting numbers for different 'n' values.
    let start = [ 12 , 123 , 1234 , 12345 , 123456 , 1234567 , 12345678 ] ;

    // Check if p and q are already equal.
    if ( p === q )
    {
        // If they are, the counter should be 0.
        console . log ( 0 ) ;
    }
    else
    {
        // If q is less than p, swap p and q.
        // This uses a comma operator trick for swapping values.
        if ( q < p )
        {
            p = q + ( q = p , 0 ) ; // This effectively performs a swap: [p, q] = [q, p];
        }

        // A flag to indicate when the counting should begin.
        let startFlag = false ;
        // Initialize a counter for valid numbers.
        let counter = 0 ;

        // Loop through numbers starting from a calculated 'start' value up to 87654321.
        for ( let i = start [ n - 2 ] ; i <= 87654321 ; i ++ )
        {
            // Only proceed if the start flag is true AND the number 'i' has 'n' digits.
            if ( startFlag && ( ( i + "" ) . length === n ) )
            {
                // Convert the number to a string, trim any potential whitespace, and split into characters.
                const str = ( i + "" ) . trim () . split ( "" ) ;
                // A flag to judge if the current number 'i' is valid.
                let judge = false ;
                // An array to count digit occurrences (initialized to all zeros).
                let kari = [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ] ;

                // Iterate over each digit in the string representation of 'i'.
                for ( let j = 0 ; j < str . length ; j ++ )
                {
                    // Increment the count for the current digit.
                    kari [ str [ j ] - 1 ] ++ ;
                    // If a digit is greater than 'n', it's invalid.
                    if ( str [ j ] > n )
                    {
                        judge = true ;
                        break ; // Exit inner loop.
                    }
                    // If a digit appears more than once, it's invalid.
                    else if ( kari [ str [ j ] - 1 ] > 1 )
                    {
                        judge = true ;
                        break ; // Exit inner loop.
                    }
                }

                // If the number passes all checks (no invalid conditions and no '0' digit).
                if ( ! judge && ( ( i + "" ) . indexOf ( "0" ) === -1 ) )
                {
                    counter ++ ; // Increment the valid number counter.
                    // console.log(i); // This line is commented out, potentially for debugging purposes.
                }
            }

            // Set the startFlag to true once 'i' reaches the value of 'p'.
            if ( i === p )
            {
                startFlag = true ;
            }

            // If 'i' reaches the value of 'q', print the counter and exit the loop.
            if ( i === q )
            {
                console . log ( counter ) ;
                break ; // Terminate the for loop.
            }
        }
    }
}

// Read input from standard input, process it, and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim () . split ( "\n" ) ) ;