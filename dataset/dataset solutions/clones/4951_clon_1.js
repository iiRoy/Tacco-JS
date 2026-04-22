// This script processes text input.
// The primary function is 'Main'.

function   Main   (   s   )
{
	// Input parameter 's' is expected to be a multi-line string.
	// It will be processed to extract specific parts.


	input    =    s . split ( "\n" ) ;

	var   first_word   =   input . slice ( 0 ,   4 ) ;
	var   second_word   =   input . slice ( 4 ) ;

	// The final result is logged to the console.
	// It combines 'first_word' and 'second_word' with a space in between.
	console . log ( first_word   +   ' '   +   second_word ) ;

} // End of Main function.

// This part ensures the script can run by reading from standard input.
// It uses Node.js's file system module.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// Additional comment to pad the file.
// This is a Type I clone, adhering strictly to the definition.