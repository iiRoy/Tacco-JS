/*
 * This script processes input data to find a maximum value based on certain criteria.
 * It initializes a large integer as a sentinel value.
 */

var   inf   =   Number . MAX_SAFE_INTEGER ;  //  Declares and initializes 'inf' with the maximum safe integer value.


//  The primary function that handles the input processing logic.
function   Main (  input  )
{
	//  Initializes the 'max' array; the first element for comparison, the second for its associated value.
	var   max   =   [  0 ,  inf  ] ;

	//  Splits the entire input string into an array of individual lines.
	input   =   input . split ( "\n" ) ;

	//  Iterates through each line of the input, starting from the second line (index 1).
	//  The first line is typically headers or not part of the data to be processed.
	for  (  var   i  =  1 ;   i  <  input . length ;   i ++  )
	{
		//  Splits the current line into an array of members based on spaces.
		var   mem   =   input [ i ] . split ( " " ) ;

		//  Compares the first element of the current 'mem' array (which is expected to be a number)
		//  with the first element of the 'max' array.
		if  (  max [ 0 ]   <   mem [ 0 ]  )
		{
			//  If the current line's first element is greater, update 'max' to this new 'mem' array.
			max   =   mem ;
		}
	} //  End of the loop through input lines.

	//  Calculates the final result by summing the first and second elements of the 'max' array.
	//  The subtraction of '0' is a common JavaScript idiom to ensure string values are treated as numbers.
	console . log (  max [ 0 ]   -   0   +   (  max [ 1 ]   -   0  )  ) ;
} //  End of the 'Main' function definition.


/*
 *  This section of the code is responsible for reading the input from standard input,
 *  trimming any leading/trailing whitespace, and then passing it to the 'Main' function.
 *  It uses Node.js's 'fs' module to perform file system operations.
 */
Main (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) . trim ( )  ) ;