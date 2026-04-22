/**
 * This JavaScript file contains the main logic for processing a series of inputs.
 * It reads data from standard input, performs calculations, and prints results to the console.
 *
 * The primary function is 'main', which orchestrates the entire process.
 * It's designed to handle multiple test cases within a single execution.
 */
function main  ( input )
{
    // The input string is expected to be multi-line.
    // We split it by newline characters to get an array of individual lines.
    var  array  =  input . split ( '\n' ) ;

    // The first line of the input typically contains the number of test cases.
    var  num  =  parseInt ( array [ 0 ] ,  10 ) ;


    /*
     * This loop iterates through each test case, starting from the second line
     * of the input array (index 1) up to the number specified by 'num'.
     * Each iteration processes one test case.
     */
    for ( var  i  =  1 ;  i  <=  num  ;  i ++ )
    {
        // Initialize a flag variable for each test case.
        // This flag will be used to determine the output later.
        var  flag  =  0 ;

        // For the current test case, split the line by spaces to get individual numbers.
        var  num_array  =  array [ i ] . split ( ' ' ) ;

        // Parse the first number from the current line as integer A.
        var  A  =  parseInt ( num_array [ 0 ] ) ;

        // Parse the second number as integer B.
        var  B  =  parseInt ( num_array [ 1 ] ) ;

        // Parse the third number as integer C.
        var  C  =  parseInt ( num_array [ 2 ] ) ;

        // Parse the fourth number as integer D.
        var  D  =  parseInt ( num_array [ 3 ] ) ;

        // Store the initial value of A for later comparison.
        var  oldA  =  A ;

        // Calculate a new value for A using the modulo operator.
        var  newA  =  A % B ;


        // First condition check: If A is less than B, print "No" and move to the next test case.
        if ( A  <  B )
        {
                console . log ( "No" ) ;
                continue ;
        }

        // Second condition check: If D is less than B, print "No" and move to the next test case.
        if ( D  <  B )
        {
                console . log ( "No" ) ;
                continue ;
        }

        // Third condition check: If A is less than C, print "Yes" and move to the next test case.
        if ( A  <  C )
        {
                console . log ( "Yes" ) ;
                continue ;
        }


        // Reassign A based on newA and B. This sets up the value for the while loop.
        A  =  newA  +  B ;

        // Begin a loop that continues as long as A is greater than or equal to B.
        while ( A  >=  B )
        {
                // Inner condition: If (A-B) is less than or equal to C.
                if ( ( A - B )  <=  C )
                {
                        // Update newA and A based on the specific calculation.
                        newA  =  A - B + D ;
                        A  = newA ;
                }
                else
                {
                        // If the above condition is false, update newA and A differently.
                        newA  =  A  -  B ;
                        A  =  newA ;
                }

                // Check for a specific condition involving A and oldA.
                if ( A  >=  2 * oldA  ||  A  ==  oldA )
                {
                        // If the condition is met, print "Yes", set the flag, and exit the while loop.
                        console . log ( "Yes" ) ;
                        flag  =  1 ;
                        break ;
                }
        }

        // After the while loop, if the flag was not set to 1, print "No".
        if ( flag  ==  0 )  console . log ( "No" ) ;
    }
}

// Read the entire content of standard input synchronously, using UTF-8 encoding.
// Then, pass this content to the main function for processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;