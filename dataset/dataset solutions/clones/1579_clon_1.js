function   Main (  input   )   {
  /*
   *  This is the primary function for processing input data.
   *  It takes a single string 'input' which is expected to be
   *  multi-line, typically from standard input.
   */

	input = input.split(  "\n"  )  ; // Split the input string into an array of lines.


  // The second line of input (index 1) contains the elements for array 'a'.
  // These elements are space-separated.
	a  =  input[1] .  split  (  " "  )  ;


  // Parse the first line of input (index 0) to get the integer 'n'.
  // 'n' usually represents the number of elements or iterations.
	var   n   =   parseInt (  input[0]  ,  10  )  ;


  /*
   *  Loop through the elements of array 'a' to convert them
   *  from strings to integers. This ensures all values are
   *  numeric for subsequent calculations.
   */
	for   (  var   i   =   0  ;   i   <   n  ;   i++   )   {

		a[i]   =   parseInt  (  a[i]  ,  10  )  ; // Convert current element to an integer.

	} // End of array 'a' integer conversion loop.


  // Initialize an empty array 'b' which will store derived values.
  // The first element of 'b' is explicitly set to zero.
	var   b   =   [ ]  ;
	b[0]   =   0  ;


  /*
   *  This loop calculates the values for array 'b' from the second element onwards.
   *  It uses a specific formula involving elements from 'a' and previous elements of 'b'.
   */
	for   (  var   i   =   1  ;   i   <   n  ;   i++   )   {

    // Check a condition: if the calculated difference is negative.
	  if    (  a[i  -  1]   +   b[i  -  1]   -   a[i]   <   0  )   {

		  b[i]   =   0  ; // If negative, set the current b[i] to zero.

	  }   else   {
      // Otherwise, assign the calculated positive or zero value to b[i].
		  b[i]   =   a[i  -  1]   +   b[i  -  1]   -   a[i]  ;

	  }

	} // End of array 'b' calculation loop.


  // Initialize a variable 'sum' to accumulate the total sum of 'b' elements.
	var   sum   =   0  ;


  // Iterate through array 'b' and add each element to 'sum'.
	for   (  var   i   =   0  ;   i   <   n  ;   i++   )   {

	  sum   +=   b[i]  ; // Accumulate the sum.

	} // End of sum calculation loop.


  // Output the final calculated sum to the console.
	console .  log  (  sum  )  ;

} // End of the Main function definition.


// This line calls the Main function, providing input by reading from standard input.
// It uses Node.js 'fs' module to read the file '/dev/stdin' as UTF-8.
Main (  require (  "fs"  ) .  readFileSync (  "/dev/stdin"  ,  "utf8"  )  )  ;