// This JavaScript code processes input to find the maximum possible sum of two distinct item prices
// that does not exceed a specified maximum limit.
// It's a typical problem found in competitive programming or data processing tasks.

const   input   =   require('fs') .  readFileSync('/dev/stdin',    'utf8')    ; // Reads the entire standard input as a string using Node.js 'fs' module.

// The input string is then trimmed of any leading/trailing whitespace and split into an array of lines.
const   lines   =   input.trim()  .split('\n')                               ;


/*
 * The first line of input is expected to contain two space-separated numbers:
 * 'n' - the total number of items, and
 * 'max' - the maximum allowable sum for a purchase.
 * These are parsed into numbers.
 */
const   [n,   max]   =   lines[0] .  split(' ')  .map(Number)               ;


// The second line contains 'n' space-separated numbers, which represent the prices of the items.
// These are also parsed into an array of numbers.
const   prices   =   lines[1].split(' ') . map(Number)                      ;


// Initialize a variable 'purchase' to 0. This variable will store the maximum valid purchase sum found.
var     purchase    =   0                                                   ;


/*
 * We need to iterate through all possible unique pairs of items (i, j)
 * to find the pair whose sum of prices is:
 * 1. Less than or equal to 'max'.
 * 2. Greater than the current 'purchase' value.
 */
for     (var   i=0;   i<n;   i++)   { // Outer loop iterates from the first item to the last.

	for     (var   j=0;   j<n;   j++)   { // Inner loop also iterates through all items.

		/*
		 * Check three conditions for a potential valid and better purchase:
		 *   - i != j: Ensures that we are considering two distinct items.
		 *   - max >= prices[i]+prices[j]: The sum of prices must not exceed the global maximum 'max'.
		 *   - purchase < prices[i]+prices[j]: The current pair's sum must be greater than any previously recorded 'purchase'
		 *                                       to be considered a new maximum.
		 */
		if   (i!=j   &&   max   >=   prices[i]+prices[j]   &&   purchase   <   prices[i]+prices[j])   {

			// If all conditions are met, update 'purchase' with this new, higher sum.
			purchase   =   prices[i]+prices[j]                               ;
		}
	}
}


/*
 * Finally, output the result.
 * If 'purchase' is still 0, it means no valid pair was found that met the criteria (or all prices were 0, which is handled).
 * In this case, print "NONE".
 * Otherwise, print the value of 'purchase', which is the maximum valid sum found.
 */
purchase   ?   console.log(purchase)   :   console.log("NONE") ;

// End of program logic.