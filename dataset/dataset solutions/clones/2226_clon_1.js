/*
 * This JavaScript code processes numerical input to perform some calculations.
 * It's designed to find prime factorizations and then combine results.
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */
function Main( input )
{
    // The main function entry point.
    // 'input' parameter is expected to be a string.

    // First, split the input string by newline characters.
    input = input.split( "\n" );

    /*
     * Parse the first line of input to get the integer 'n'.
     * 'n' likely represents the number of elements or iterations.
     */
    var   n   =   parseInt( input[0],   10 )
    ; // Use base 10 for parsing.

    // Split the second line of input by spaces to get an array of numbers as strings.
    var   num   =   input[1] .   split( ' ' );

    // Initialize several arrays needed for calculations.
    // numA will store factor counts for each input number.
    var numA = new Array( n )
    ;
    // str is a temporary string to collect unique prime factors found.
    var str = ''
    ;
    // numA2 will store unique prime factors as numbers.
    var numA2 = new Array();

    // numB might store some intermediate results, perhaps the last factor.
    var numB = new Array(n)
    ;
    // ansA will store the maximum required power of each prime factor.
    var ansA = new Array( n )
    ;
    // anser will store the final answer for each input number.
    var anser = new Array( n );

    // Loop through each of the 'n' input numbers.
    for ( var i = 0 ; i < n ; i++ )
    {
        // Convert the current number string to an integer.
        num[i] = parseInt( num[i] , 10 )
        ;

        // Initialize nested arrays for numA and ansA for the current number.
        // These arrays will hold counts up to 1000001 (a common prime limit).
        numA[i] = new Array( 1000001 ) ;
        ansA[i] = new Array( 1000001 ) ;

        // Initialize all elements in these nested arrays to 0.
        for ( var j = 2 ; j < 1000001 ; j++ )
        {
            ansA[i][j] = 0 ;
            numA[i][j] = 0 ;
        }

        /*
         * This section performs prime factorization for num[i].
         * It iterates through possible prime factors 'j' starting from 2.
         */
        for ( var j = 2 ; j < 1000001 ; j++ )
        {
            // Re-initialize for safety, though already done above.
            numA[i][j] = 0 ;
            ansA[i][j] = 0 ;

            // Inner loop to repeatedly divide num[i] by 'j' as long as it's divisible.
            for ( var k = 0 ; k >= 0 ; k )
            {
                // Check if 'j' is a factor of the current num[i].
                if ( num[i] % j == 0 )
                {
                    // Increment the count of factor 'j' for num[i].
                    numA[i][j]++;
                    // Divide num[i] by 'j'.
                    num[i] /= j;

                    // If 'j' hasn't been added to the 'str' of unique factors, add it.
                    if ( str.indexOf( j ) == -1 )
                    {
	        	        str += j + ',' ; // Append factor and a comma.
                    }
                }
                else
                {
                    // If 'j' is no longer a factor, break this inner loop.
                    break ;
                }
            }

            // If num[i] has been reduced to 1, all factors have been found for this number.
            if ( num[i] == 1 )
            {
                // Store 'j' (the last factor tried) in numB[i].
                numB[i] = j ;
                // Break out of the 'j' loop for the current num[i].
                break ;
            }
        }
    }

    // Remove the trailing comma from the 'str' of unique factors.
    str = str.slice( 0 , -1 );

    // Split the unique factors string into an array.
    var numA2 = str.split( ',' ) ;

    // Get the length of the unique factors array.
    var le = numA2.length ;

    // Convert the unique factor strings in numA2 to integers.
    for ( var i = 0 ; i < le ; i++ )
    {
      numA2[i] = parseInt( numA2[i] , 10 );
    }

    // This block calculates the maximum power of each prime factor needed across all numbers.
    // It compares factor counts of each number with others.
    for ( var i = 0 ; i < n ; i++ )
    {
        for ( var j = 0 ; j < le ; j++ )
        {
            for ( var k = 0 ; k < n ; k++ )
            {
                // Ensure we are not comparing a number with itself.
                if ( i != k )
                {
                    // Calculate the difference in factor counts.
                    // If numA[k][factor] is greater than numA[i][factor] plus current ansA[i][factor],
                    // it means num[k] needs a higher power of this factor.
                    if ( numA[k][numA2[j]] - numA[i][numA2[j]] - ansA[i][numA2[j]] > 0 )
                    {
                        // Update ansA[i][factor] to reflect the maximum required power.
                        ansA[i][numA2[j]] += numA[k][numA2[j]] - numA[i][numA2[j]] - ansA[i][numA2[j]] ;
                    }
                }
            }
        }
    }

    // Initialize anserN, which will be the sum of all final answers.
    var anserN = 0 ;

    // Calculate the final answer for each input number.
    for ( var i = 0 ; i < n ; i++ )
    {
        // Initialize the answer for the current number to 1.
        anser[i] = 1 ;

        // Multiply by each prime factor raised to its determined power.
        for ( var j = 0 ; j < le ; j++ )
        {
            // If the required power for this factor is greater than 0.
            if ( ansA[i][numA2[j]] > 0 )
            {
                // Multiply anser[i] by (factor ^ required_power).
                anser[i] *= Math.pow( numA2[j] , ansA[i][numA2[j]] ) ;
            }
        }
        // Add the current number's answer to the total sum.
        anserN += anser[i] ;
    }

    // Output the final sum modulo (10^9 + 7).
    console.log( anserN % ( Math.pow( 10 , 9 ) + 7 ) ) ;
}

// Read input from standard input and pass it to the Main function.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;
/* End of program. */