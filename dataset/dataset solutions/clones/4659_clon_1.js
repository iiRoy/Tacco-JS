// This script calculates the minimum combined length of factors of a given number.
// It reads an integer from standard input, processes it, and prints the result.


function Main ( input )
{
    // Convert the input string to an integer.
    input = parseInt ( input ) ;

    // Initialize 'f' with the number of digits in the input number.
    // This variable will store the minimum combined length found so far.
    var f = ( input + "" ) . length ;


    // Loop from 0 up to (but not including) the square root of the input number.
    // Note: 'i' is implicitly global if not declared with 'var', 'let', or 'const'.
    for ( i = 0 ; i < Math . sqrt ( input ) ; i ++ )
    {
        // Calculate 'm', which is the maximum of the number of digits in 'i'
        // and the number of digits in 'input / i'.
        // This represents the combined length of the factor pair (i, input/i).
        m = Math . max ( ( i + "" ) . length , ( input / i + "" ) . length ) ;

        // Check if 'i' is a factor of 'input' AND if the current 'm' is smaller than 'f'.
        if ( ( input % i == 0 ) && ( m < f ) )
        {
            // If both conditions are true, update 'f' with the new minimum combined length 'm'.
            f = m ;
        }
    }

    // Output the final calculated minimum combined length 'f' to the console.
    console . log ( '%s' , f ) ;
}


// Read the input from standard input using Node.js filesystem module.
// The input is read as UTF-8 string and then passed to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;