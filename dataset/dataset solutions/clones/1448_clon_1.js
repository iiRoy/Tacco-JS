/*
 * This JavaScript program reads numerical data from standard input.
 * It is designed to calculate and display the standard deviation
 * for multiple sets of numbers provided sequentially.
 *
 * Each set of numbers is preceded by a count (which is ignored by this specific logic,
 * as it processes numbers until a '0' is encountered as the first number of a set).
 * The standard deviation is computed for each set and outputted
 * with a precision of five decimal places.
 *
 * This implementation strictly adheres to standard JavaScript syntax.
 */


//  Import the 'fs' (file system) module, which is necessary for reading input data.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

//  Split the entire input string into an array of individual lines.
//  Each element in the 'lines' array will correspond to one line from the input.
var lines = input . split ( '\n' ) ;


//  Begin the main processing loop. This loop continues indefinitely
//  until an explicit 'break' statement is encountered within its body.
while ( true )
{
	//  Extract the first line from the 'lines' array, convert it to a number,
	//  and store it in the 'num' variable. The unary plus operator '+'
	//  is used for concise type conversion to a number.
	var num = + lines . shift ( ) ;

	//  Check if the 'num' variable is zero. A value of zero signals
	//  the end of input data sets, indicating that no more calculations
	//  are required.
	if ( num == 0 )
	{
		//  If 'num' is zero, terminate the 'while' loop.
		break ;
	}

	//  Retrieve the next line from the 'lines' array. This line is expected
	//  to contain a series of numbers separated by spaces.
	//  - 'split(' ')' divides the string into an array of string numbers.
	//  - 'map(function(p){return +p;})' iterates through this array,
	//    converting each string number to an actual number.
	var points = lines . shift ( ) . split ( ' ' ) . map ( function ( p ) { return + p ; } ) ;

	//  Calculate the sum of all numbers in the 'points' array.
	//  The 'reduce' method iteratively applies a function to each element,
	//  accumulating a single result (the sum in this case).
	var sum = points . reduce ( function ( prev , now ) { return prev + now ; } ) ;

	//  Compute the average (mean) of the 'points'.
	//  This is done by dividing the total 'sum' by the count of 'points'.
	var avg = sum / points . length ;


	//  Calculate 'a2', which represents the variance of the 'points'.
	//  Variance is the average of the squared differences from the mean.
	//  - 'reduce' accumulates the sum of (number - average)^2 for all numbers.
	//  - 'Math.pow(now - avg, 2)' calculates the square of the difference.
	//  - The initial value for the accumulator is 0.
	//  - The final sum is then divided by the number of points to get the average.
	var a2 = points . reduce ( function ( prev , now )
	{
		return prev + Math . pow ( now - avg , 2 ) ;
	} , 0 ) / points . length ;


	//  Calculate the standard deviation by taking the square root of the variance ('a2').
	//  Then, format the result to exactly five decimal places using 'toFixed(5)'.
	//  Finally, print the formatted standard deviation to the console.
	console . log ( Math . sqrt ( a2 ) . toFixed ( 5 ) ) ;
}

//  End of program execution.
//  All input sets have been processed as per the defined logic.
/*
 * Script finished successfully.
 */