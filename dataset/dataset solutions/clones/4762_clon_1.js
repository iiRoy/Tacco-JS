function    myin  (    )
{
    // This function reads input from standard input.
    // It uses Node.js 'fs' module to read the file.
    // The input is then trimmed of leading/trailing whitespace.
    return require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim (  ) ;
}


function  myout  (  t  )
{
    // Outputs the given value 't' to the console.
    // This serves as the standard output mechanism.
    console . log ( t ) ;
}


// --- myconv function parameter reference ---
// This function handles various input conversion scenarios.
// The 'no' parameter specifies the type of conversion to apply.
//
// Conversion options:
// 0: No conversion; returns the input as is.
// 1: Converts input to an integer using parseInt().
// 2: Splits the input string by single space (" ") into an array of strings.
// 3: Splits the input string by newline character ("\n") into an array of strings.
// 4: Splits by space, then converts each part to a number (array of numbers).
// 5: Splits by newline, then converts each part to a number (array of numbers).
// 6: Splits the input string into an array of individual characters.
// 7: Splits into individual characters, then converts each character to a number (array of numbers).
// -------------------------------------------
function myconv ( i , no )
{
    switch ( no )
    {
        case 0 :
            // Case 0: Return input as is, no conversion needed.
            return i ;

        case 1 :
            // Case 1: Convert the input string to an integer.
            return parseInt ( i ) ;

        case 2 :
            // Case 2: Split the input string by spaces.
            return i . split ( " " ) ;

        case 3 :
            // Case 3: Split the input string by newline characters.
            return i . split ( "\n" ) ;

        case 4 :
            // Case 4: Split by spaces, then map each element to a Number.
            return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;

        case 5 :
            // Case 5: Split by newlines, then map each element to a Number.
            return i . split ( "\n" ) . map ( ( a ) => Number ( a ) ) ;

        case 6 :
            // Case 6: Split the input string into individual characters.
            return i . split ( "" ) ;

        case 7 :
            // Case 7: Split into characters, then map each to a Number.
            return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
    }
}


function Main ( input )
{
    // Convert the initial input to an integer.
    input = myconv ( input , 1 ) ;

    // The number of divisors of N is calculated as:
    // (exponent of prime_factor_1 + 1) * (exponent of prime_factor_2 + 1) * ...
    // This section will store the counts of each prime factor.
    var list = new Array ( input + 1 ) . fill ( 0 ) ;

    // Define a modulo value for calculations to prevent overflow.
    var mod = 1000000007 ;

    // Iterate from 1 up to the input number to find prime factor counts.
    for ( var i = 1 ; i <= input ; i ++ )
    {
        if ( i == 1 )
        {
            // The number 1 has one divisor (itself), which is not a prime factor.
            // For the purpose of this calculation, we can treat its "prime count" as 1
            // or simply skip it as it doesn't contribute to prime factorization of other numbers.
            list [ 1 ] = 1 ;
            continue ; // Move to the next iteration.
        }
        else
        {
            // For numbers greater than 1, find their prime factors.
            var tmp = i ; // Use a temporary variable for factorization.
            var j   = 2 ; // Start checking for prime factors from 2.

            // Loop to find prime factors of 'tmp'.
            while ( j <= tmp )
            {
                if ( tmp % j == 0 )
                {
                    // If 'j' is a factor, increment its count in the 'list'.
                    list [ j ] ++ ;
                    // Divide 'tmp' by 'j' to continue factoring the remaining part.
                    tmp /= j ;
                }
                else
                {
                    // If 'j' is not a factor, try the next potential factor.
                    j ++ ;
                }
            }
        }
    }

    // Initialize the output variable for the total number of divisors.
    var output = 1 ;

    // Calculate the total number of divisors using the prime factor counts.
    // The loop starts from 2 because 1 is not a prime factor.
    for ( var i = 2 ; i < list . length ; i ++ )
    {
        if ( list [ i ] != 0 )
        {
            // Apply the formula: (count_of_prime_i + 1)
            // Multiply this into the total output, applying modulo at each step.
            output = ( output * ( list [ i ] + 1 ) ) % mod ;
        }
    }

    // myout ( list ) ; // This line is commented out, likely for debugging purposes.
    // Output the final calculated number of divisors.
    myout ( output ) ;
}


// Call the Main function with the input read from standard input.
Main ( myin ( ) ) ;