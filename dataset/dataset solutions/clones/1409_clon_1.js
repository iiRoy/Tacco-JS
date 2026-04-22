/*
 * This JavaScript program reads pairs of integers (H and W)
 * from standard input. For each pair, it generates and prints
 * a checkerboard pattern of '#' and '.' characters to standard
 * output. The program terminates when it encounters a pair
 * where both H and W are 0.
 *
 * This version includes extensive whitespace variations and comments
 * to illustrate a Type I code clone.
 */


//  Import the 'fs' module, which provides file system functionality.
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
//  Read the entire content of '/dev/stdin' as a UTF-8 string.
var   lines   =   input . split ( '\n' ) ;
//  Split the input string into an array of strings, using the newline character as a delimiter.


//  Begin an infinite loop. This loop will continue until explicitly broken.
while   (   true   )
{
	//  Remove the first element (line) from the 'lines' array.
	//  Then, split that line by spaces to get an array of strings.
	var   arr   =   lines . shift ( ) . split ( ' ' ) ;

	//  Convert the first element of 'arr' to a number. This will be the height (H).
	var   H   =   + arr [ 0 ] ;
	//  Convert the second element of 'arr' to a number. This will be the width (W).
	var   W   =   + arr [ 1 ] ;


	//  Check if the sum of H and W is equal to 0.
	//  This is the termination condition for the program.
	if   (   H   +   W   ==   0   )
	{
		//  If the condition is met, exit the 'while' loop.
		break   ;
	}


	//  Outer loop: iterates 'H' times, representing each row of the pattern.
	for   (   var   i   =   0   ;   i   <   H   ;   i   ++   )
	{
		//  Inner loop: iterates 'W' times, representing each column in the current row.
		for   (   var   j   =   0   ;   j   <   W   ;   j   ++   )
		{
			//  Check the parity of the sum of the current row (i) and column (j) indices.
			if   (   (   i   +   j   )   %   2   ==   0   )
			{
				//  If the sum is even, print a '#' character.
				process . stdout . write ( '#' ) ;
			}
			else
			{
				//  If the sum is odd, print a '.' character.
				process . stdout . write ( '.' ) ;
			}
		}
		//  After completing all columns for a row, print a newline character
		//  to move to the next line for the subsequent row.
		console . log ( ) ;
	}
	//  After printing the entire HxW pattern, print an additional blank line
	//  to separate it from the next pattern (if any).
	console . log ( ) ;

}
//  The program concludes when the 'while' loop is broken.