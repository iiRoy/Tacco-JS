/*
 * This section defines global variables used throughout the program.
 * 'n' will store the number of inputs.
 * 's' will store an array of input strings.
 * 'p' will store an array of simplified parenthesis counts for each string.
 */
var   n;
var     s = [];
var   p = [];


/**
 * The simplify function processes a given string 's'
 * to count unbalanced parentheses.
 * It returns an array [open_needed, close_unmatched].
 *
 * @param {string} s The input string to simplify.
 * @returns {number[]} An array containing two integers:
 *                     [count_of_open_needed, count_of_close_unmatched].
 */
function simplify ( s ) {

	// p[0] will count unmatched ')' that need a preceding '('.
	// p[1] will count unmatched '(' that need a following ')'.
	var p = [ 0 , 0 ] ;

	// Iterate over each character of the input string.
	rep ( s . length , function ( i ) {
		// If the current character is an opening parenthesis.
		if ( s . charAt ( i ) === '(' ) {
			// Increment the count of open parentheses that are currently unmatched.
			++ p [ 1 ] ;
		}
		// If the current character is a closing parenthesis.
		else {
			// If there's an unmatched opening parenthesis available.
			if ( p [ 1 ] > 0 ) {
				// Decrement the count of unmatched open parentheses, as this ')' matches one.
				-- p [ 1 ] ;
			}
			// If there are no unmatched opening parentheses.
			else {
				// Increment the count of unmatched closing parentheses (needs a preceding '(').
				++ p [ 0 ] ;
			}
		}
	} ) ;

	// Return the final counts.
	return p ;
}


/**
 * The main function orchestrates the entire program logic.
 * It reads input, simplifies strings, and determines if a valid
 * parenthesis sequence can be formed by concatenating simplified parts.
 */
function main ( ) {

	// Read the number of strings to process.
	n = scan ( ) ;

	// Read 'n' strings and store them in the 's' array.
	rep ( n , function ( i ) {
		s [ i ] = scan_string ( ) ;
	} ) ;

	// Simplify each string and store the results in the 'p' array.
	// Each p[i] will be an array [open_needed, close_unmatched].
	rep ( n , function ( i ) {
		p [ i ] = simplify ( s [ i ] ) ;
	} ) ;


	// 'q' represents the current balance of open parentheses.
	var q = 0 ;

	// 'ans' tracks whether a valid sequence can be formed.
	var ans = true ;

	// Attempt to process each simplified string 'n' times.
	// This loop continues as long as updates are being made.
	rep ( n , function ( ) {
		// 'update' flag to check if any string was processed in this iteration.
		var update = false ;

		// Iterate through the simplified strings.
		rep ( n , function ( i ) {
			// Check if the current string (p[i]) has not been processed yet (is not null).
			// And if the current balance 'q' is sufficient to cover the 'open_needed' count of p[i].
			if ( p [ i ] !== null && q >= p [ i ] [ 0 ] ) {
				// Update the balance 'q' by adding the net change from this string.
				// (close_unmatched - open_needed)
				q += ( p [ i ] [ 1 ] - p [ i ] [ 0 ] ) ;

				// Mark this string as processed.
				p [ i ] = null ;

				// Set the update flag to true.
				update = true ;

				// Stop iterating through p in this inner loop, and restart the outer loop.
				return false ;
			}
		} ) ;

		// If no string was processed in this iteration, it means we're stuck or done.
		if ( ! update ) {
			// If we couldn't process any more strings, it's not a valid sequence.
			ans = false ;

			// Stop the outer loop.
			return false ;
		}
	} ) ;

	// Print 'Yes' if the sequence is valid and all parentheses are balanced (q is 0), otherwise 'No'.
	print ( ans && q === 0 ? 'Yes' : 'No' ) ;
}


/**
 * A general-purpose repetition function.
 * It acts as a flexible loop similar to Python's range.
 *
 * @param {number} a Starting index (inclusive) or loop count if 'b' is a function.
 * @param {function|number} b Ending index (exclusive) or callback function.
 * @param {function} [c] Callback function if 'a' and 'b' are numbers.
 */
function rep ( a , b , c ) {
	// If 'c' is undefined, it means 'b' is the callback and 'a' is the count.
	if ( c === undefined ) {
		c = b ; // 'b' becomes the callback.
		b = a ; // 'a' becomes the loop count (end).
		a = 0 ; // Start from 0.
	}

	// Loop from 'a' up to (but not including) 'b'.
	for ( var i = a ; i < b ; ++ i ) {
		// If the callback function 'c' returns false, break the loop.
		if ( c ( i ) === false ) {
			break ;
		}
	}
}


// Resume standard input stream.
process . stdin . resume ( ) ;
// Set the encoding for standard input.
process . stdin . setEncoding ( 'utf8' ) ;

// A buffer to accumulate input chunks.
var input = '' ;
// An index to keep track of the current position in the processed input array.
var input_index = 0 ;


/**
 * Reads and returns the next number from the processed input.
 * @returns {number} The next number from input.
 */
function scan ( ) {
	return + input [ input_index ++ ] ;
}


/**
 * Reads and returns the next string from the processed input.
 * @returns {string} The next string from input.
 */
function scan_string ( ) {
	return input [ input_index ++ ] ;
}


/**
 * Prints a value to the console.
 * @param {*} val The value to print.
 */
function print ( val ) {
	console . log ( val ) ;
}


// Event listener for incoming data chunks on standard input.
process . stdin . on ( 'data' , function ( chunk ) {
	// Append the received chunk to the input buffer.
	input += chunk ;
} ) ;

// Event listener for the 'end' of standard input.
process . stdin . on ( 'end' , function ( ) {
	// Trim whitespace from the accumulated input and split it by any whitespace characters.
	input = input . trim ( ) . split ( / \s + / ) ;
	// Call the main function to start program execution.
	main ( ) ;
} ) ;