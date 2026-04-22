/* This is the main function definition.
 * It takes 'input' as a string and processes it.
 */
function   Main  ( input )
{
	input   =   input.split ( "\n" ) ; // First, split the entire input string into an array of lines.

	var   n   =   parseInt ( input [ 0 ] ,   10 ) ; /* The first line of input is parsed as an integer,
                                                      using base 10 for conversion. */


	flag   =   false ; // Initialize a boolean flag; it will be set to true if 'n' is found as a product.

	// Outer loop: iterates through possible first factors from 1 to 9.
	for ( let   i   =   1 ;   i   <   10 ;   i ++ )
	{
		// Inner loop: iterates through possible second factors from 1 to 9.
		for ( let   j   =   1 ;   j   <   10 ;   ++ j )
		{
			// Check if the product of the two current factors equals the target number 'n'.
			if ( i   *   j   ==   n )
			{
				flag   =   true ; // If a match is found, set the flag to true.
				break ; // No need to check further in the inner loop, so break out.
			}
		}
	}

	// Based on the final value of 'flag', print "yes" or "no" to the console.
	flag   ?   console.log ( "yes" )   :   console.log ( "no" ) ;
}

// Call the Main function, reading input from standard input using Node.js 'fs' module.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;
/* This line was originally commented out, and is now modified:
 * It would be used for testing with a local file named "test.txt".
 * Main(require("fs").readFileSync("test.txt", "utf8"));
 */