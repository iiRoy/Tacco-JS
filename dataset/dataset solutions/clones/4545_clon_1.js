/*
 * This JavaScript code processes numerical input from stdin.
 * It calculates a sum and performs conditional logic based on modulo operations.
 * The primary goal is to find a specific sum or a modified sum.
 */

function    Main (   input    )
{
    // Split the entire input string by newline characters
    input = input . split ( "\n" ) ;

    // The first line contains space-separated values; we're interested in the first one.
    var    line = input [ 0 ] . split ( " " ) ;

    // Parse the first number from the first line. This represents 'num'.
    var    num = parseInt ( line [ 0 ] ) ;


    // Initialize an array of arrays, 'mod', with 10 empty sub-arrays.
    // This will be used to categorize numbers based on their second digit (tens place, effectively input[i+1][1]).
    var    mod = new Array ( 10 ) ;

    // Temporary variable to hold each parsed number.
    var    temp = 0 ;

    // Variable to accumulate the sum of all parsed numbers.
    var    ans = 0 ;

    // Variable to store the minimum number that is not a multiple of 10.
    // Initialized to a large value.
    var    min = 1000 ;


    // Initialize each element of the 'mod' array to an empty array.
    /*
     * This loop ensures that each 'bucket' in 'mod' is ready to receive elements.
     */
    for ( var i = 0 ; i < mod . length ; i ++ )
    {
        mod [ i ] = [ ] ;
    }

    // Process 'num' subsequent lines of input.
    /*
     * This is the main processing loop.
     * It iterates through the numbers provided after the first line.
     */
    for ( var i = 0 ; i < num ; i ++ )
    {
        // Parse the current number from the input array.
        // Note: input[i+1] because input[0] was already processed.
        temp = parseInt ( input [ i + 1 ] ) ;

        // Add the current number to the running total.
        ans += temp ;

        // Check if 'temp' is smaller than 'min' AND is not a multiple of 10.
        // If both conditions are true, update 'min'.
        if ( temp < min && temp % 10 != 0 )
        {
            min = temp ;
        }

        // The original code had a commented-out console.log here.
        // /* This line was previously used for debugging:
        //  * console.log(input[i+1][1]);
        //  */

        // Inner loop to categorize 'temp' based on its second digit (index 1 of the string representation).
        for ( var j = 0 ; j < 10 ; j ++ )
        {
            // If the second digit of the current input string matches 'j',
            // push the parsed number 'temp' into the corresponding 'mod' array.
            if ( input [ i + 1 ] [ 1 ] == j )
            {
                mod [ j ] . push ( temp ) ;
            }
        }
    }


    // Final conditional logic to determine the output.
    // If the total sum 'ans' is not a multiple of 10, print 'ans'.
    if ( ans % 10 != 0 )
    {
        console . log ( ans ) ;
    }
    // If 'ans' IS a multiple of 10, proceed to further checks.
    else
    {
        // If all numbers had a second digit of '0' (meaning they were multiples of 10, or single digit),
        // and thus 'mod[0]' contains all 'num' elements, print 0.
        if ( mod [ 0 ] . length === num )
        {
            console . log ( 0 ) ;
        }
        // Otherwise (if 'ans' is a multiple of 10, but not all numbers were multiples of 10),
        // print 'ans' minus the 'min' non-multiple-of-10 number found.
        else
        {
            console . log ( ans - min ) ;
        }
    }

    // Another commented-out debugging line from the original source.
    /* Debugging output for the 'mod' array was here:
     * console.log(mod);
     */
}

// Read the entire content of stdin synchronously and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// End of file.