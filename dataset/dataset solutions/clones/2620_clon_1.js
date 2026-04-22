// This is a JavaScript program designed to solve a specific algorithmic problem.
// The main function processes input to calculate a final 'count' value.
function    Main(input)   {
	// First, we split the entire input string by newline characters.
	input = input.split("\n") ;

	// Then, we parse the first line of input to get N and K.
	const input1 = input[0].split(" ") ; // Split the first line by space.
	const N = parseInt(input1[0]) ;     // N represents the number of elements.
	const K = parseInt(input1[1]) ;     // K is a multiplier or a parameter.

	// The second line of input contains the array 'As'.
	// We split it by spaces and convert each part to an integer.
	const As = input[1].split(" ").map(x => parseInt(x)) ;

	// Initialize a counter variable. This will accumulate the final result.
	var count = 0 ;

	// Define a large prime number for modulo operations to prevent overflow.
	// This is a common practice in competitive programming.
	const MOD = (1000000000 + 7) ;

	// Loop through each element of the array 'As'.
	// The loop variable 'i' represents the current index.
	for (  i = 0 ; i < N ; i++ ) {

		// Calculate 'u': number of elements AFTER the current element (As[i])
		// that are smaller than As[i].
		var u = As.slice(i+1).filter(x => x < As[i]).length ;

		// Calculate 'v': total number of elements in the entire array 'As'
		// that are smaller than As[i].
		var v = As.filter(x => x < As[i]).length ;

		// Update 'count' based on 'u' and 'K'.
		// This part handles contributions from elements appearing later in the array.
		count += (u * K) ;
		// Apply modulo operation to keep 'count' within bounds.
		count = count % MOD ;

		// Update 'count' based on 'v' and 'K'.
		// This part handles contributions from elements across multiple K repetitions.
		// The term (K-1)*K / 2 comes from the sum of an arithmetic series 1 + 2 + ... + (K-1).
		count += (v * (K-1)*K / 2)  % MOD ;
		// Apply modulo operation again after the second addition.
		count = count % MOD ;
	}

	// Finally, print the calculated total count to the console.
	console.log(count) ;

}
// The program reads input from standard input (/dev/stdin)
// and passes it to the Main function.
Main(require("fs").readFileSync("/dev/stdin", "utf8")) ;
// End of the JavaScript program.