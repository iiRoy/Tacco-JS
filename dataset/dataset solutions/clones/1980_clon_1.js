// This is the primary function definition.
function   Main (  input   )   {

	// Check if the input string contains the digit '7'.
	// First, split the string into an array of characters.
	// Then, find the index of '7'. If it's 0 or greater, '7' is present.
	if  (  input . split ( "" ) . indexOf ( "7" )   >=   0  )
	{
		// If '7' is found, output "Yes".
		console . log ( "Yes" ) ;


	}  else   {

		// Otherwise, if '7' is not found, output "No".
		console . log ( "No" ) ;


	} // End of the conditional block for checking '7'.

} // End of the Main function.


// IMPORTANT: Do not modify the following lines.
// These lines handle standard input/output operations
// and invoke the Main function with the input data.

Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ; // Call the main processing function.