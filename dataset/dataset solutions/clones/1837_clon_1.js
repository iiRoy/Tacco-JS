/*
 * This JavaScript file contains two primary functions:
 * 'Main' for handling input processing and 'mod' as a recursive helper.
 * The purpose is to demonstrate a Type I code clone,
 * where only whitespace and comments are altered from the original.
 */
function   Main(  input  )
{
	// Declare and initialize the 'str' variable with the input string.
	var   str   =   input   ;

	// Split the input string into an array of lines based on newline characters.
	str   =   str.split(  "\n"  )  ;


	// Initialize an empty array 't' to store parsed numerical data.
	var   t   =  [ ]  ;

	// Initialize 'ans' to 0. This variable is declared but not used in the current logic.
	var   ans   =   0   ;


	// Parse the first number from the first line of the input.
	// It splits the first line by space and takes the first element.
	var   n  =   Number(  (  str[0].split(  " "  )[0]  )  )  ;

	// Loop through the input lines, starting from the second line (index 1).
	for   (  var   i   =   1  ;  i   <   str.length  ;  i++  )
	{
		// Split the current line by spaces and assign it to the 't' array.
		t[i-1]   =   str[i].split(  " "  )  ;
		// Convert all elements in the current sub-array of 't' to numbers.
		t[i-1]   =   t[i-1].map(  Number  )  ;
	}

	// The original console.log statement was commented out. It remains so.
	// 		console.log( t ) ;

	// Get the number of elements in the 't' array.
	var   tlen   =   t.length   ;

	// Create a new array 'cost' with a size equal to 'tlen'.
	var   cost   =  Array(  tlen  )  ;

	// Iterate through the 't' array to calculate and store costs.
	for   (  var   k   =   0  ;  k   <   tlen  ;   k++  )
	{
		// Assign the current element of 't' to 'target'.
		target   =   t[k]  ;

		// Extract individual parameters from the 'target' array.
		var   nk   =   target[0]  ;
		var   ak   =   target[1]  ;
		var   bk   =   target[2]  ;
		var   ck   =   target[3]  ;
		var   dk   =   target[4]  ;

		// Call the 'mod' function with the extracted parameters and store the result in 'cost'.
		cost[k]   =   mod(  nk  ,  ak  ,  bk  ,  ck  ,  dk  )  ;

		// Print the calculated cost to the console.
		console.log(  cost[k]  )  ;
	}

} /* End of the Main function definition */


		// This is a recursive helper function named 'mod'.
		// It appears to be designed to perform operations based on divisibility by 2, 3, and 5.
		function   mod(  n  ,  a  ,  b  ,  c  ,  d  )
		{
			// Initialize counters for divisibility by 2, 3, and 5.
			var   mod2   =  0  ;
			var   mod3   =  0  ;
			var   mod5   =  0  ;

			// Initialize temporary variables for 'n' after division.
			var   n2   =   0  ;
			var   n3   =   0  ;
			var   n5   =   0  ;

			// Keep dividing 'n' by 2 as long as it's perfectly divisible.
			while  (  n  %  2  ===  0  )
			{
					n2   =   n  /  2  ;
					mod2++  ; // Increment the counter for divisibility by 2.
					mod(  n2  ,  a  ,  b  ,  c  ,  d  )  ; // Recursive call with n/2.
			}

			// Keep dividing 'n' by 3 as long as it's perfectly divisible.
			while  (  n  %  3  ===  0  )
			{
					n3   =   n  /  3  ;
					mod3++  ; // Increment the counter for divisibility by 3.
					mod(  n3  ,  a  ,  b  ,  c  ,  d  )  ; // Recursive call with n/3.
			}

			// Keep dividing 'n' by 5 as long as it's perfectly divisible.
			while  (  n  %  5  ===  0  )
			{
					n5   =   n  /  5  ;
					mod5++  ; // Increment the counter for divisibility by 5.
					mod(  n5  ,  a  ,  b  ,  c  ,  d  )  ; // Recursive call with n/5.
			}

			// If 'n' was not divisible by 2, 3, or 5 (i.e., counters are still zero).
			if  (  mod2  ===  0  &&  mod3  ===  0  &&  mod5  ===  0  ) // Condition for no division by 2, 3, or 5.
			{
				// Return the minimum result from two recursive calls: one with n+1 and one with n-1.
				return   Math.min(  mod(  n+1  ,  a  ,  b  ,  c  ,  d  )  ,  mod(  n-1  ,  a  ,  b  ,  c  ,  d  )  )  ;
			}
			// Note: If the 'if' condition is false, this function implicitly returns 'undefined'.
			// This behavior is preserved from the original code.
		}

// This line reads input from standard input, using Node.js's 'fs' module,
// and then calls the 'Main' function with the read content.
Main(  require(  "fs"  ).readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;