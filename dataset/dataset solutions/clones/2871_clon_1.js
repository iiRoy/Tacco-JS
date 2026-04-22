/*
 * This is a Type I clone of a JavaScript program.
 * It calculates a specific value based on input parameters.
 * The core logic remains identical to the original.
 */
function   Main (   input   ) { // Function definition starts here

    // Temporary variable to store split input
	tmp  =  input . split ( " " ) ;

    // Parse integer values from the temporary array
	var l   =   parseInt (   tmp [ 0 ]   ) ; // Length parameter
	var a   =   parseInt (   tmp [ 1 ]   ) ; // Starting value parameter
	var b   =   parseInt (   tmp [ 2 ]   ) ; // Increment parameter
	var m   =   parseInt (   tmp [ 3 ]   ) ; // Modulo parameter

    // Initialize result string
	var rs  =  "" ; // Accumulator for the concatenated numbers

    /*
     * Loop to generate the sequence of numbers.
     * The loop runs 'l' times.
     */
	for (   var i   =   0 ;   i   <   l ;   i ++   )   {
        // Calculate the current number in the sequence
		var kz  =  a   +   (   b   *   i   ) ; // Calculate current term: a + (b * i)
        // Concatenate the current number to the result string
		var rs  =  rs   +   ""   +   kz ; // Append 'kz' to 'rs'
	}

    // After the loop, parse the accumulated string to an integer
    // and then apply the modulo operation.
	var r   =   parseInt (   rs   )   %   m ;

    // Output the final result to the console.
	console . log (   r   ) ;

} // End of Main function

// This part reads input from standard input and passes it to the Main function.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;