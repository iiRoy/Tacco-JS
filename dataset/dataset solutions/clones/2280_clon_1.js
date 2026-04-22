/*
 * This JavaScript program, named 'Main', processes input
 * to find and count occurrences of the "ABC" substring.
 * It's designed to be executed in an environment where
 * 'fs' module is available for reading standard input.
 */

function   Main   (   input   )
{
    // Split the input string by newline characters.
    // This assumes the input consists of multiple lines.
    var   nums   =   input . split (   '\n'   ) ;


    // The first element of the 'nums' array is expected to be a number.
    // It's parsed as an integer and stored in 'num'.
    var   num   =   Math . floor (   nums [   0   ]   ) ;

    // The second element of the 'nums' array is treated as the primary string.
    var   str   =   nums [   1   ] ;


    // Initialize a counter variable. This will store the total number of
    // "ABC" sequences found within the 'str' variable.
    var   ans   =   0 ;


    // Begin a loop to iterate through the characters of the 'str' string.
    // The loop condition `i < num - 2` ensures that we always have
    // at least two more characters (str[i+1] and str[i+2]) to check,
    // preventing out-of-bounds errors.
    for   (   var   i   =   0 ;   i   <   num   -   2 ;   i++   )
    {
        // First condition: Check if the current character is 'A'.
        if   (   str [   i   ]   ===   'A'   )
        {
            // Second condition: If the current character is 'A',
            // then check if the next character is 'B'.
            if   (   str [   i   +   1   ]   ===   'B'   )
            {
                // Third condition: If the first two conditions are met,
                // then check if the character after 'B' is 'C'.
                if   (   str [   i   +   2   ]   ===   'C'   )
                {
                    // All three conditions are met, meaning "ABC" sequence is found.
                    // Increment the counter.
                    ans++ ;
                }
            }
        }
    }


    // After the loop finishes iterating through the entire string,
    // print the final count of "ABC" occurrences to the console.
    console . log (   ans   ) ;
}


// This line is responsible for initiating the program.
// It reads the entire content from standard input ('/dev/stdin')
// as a UTF-8 encoded string and then passes it to the 'Main' function.
Main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;