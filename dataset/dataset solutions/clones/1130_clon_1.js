/*
 * This file processes input data to perform some calculations,
 * likely related to dynamic programming or a similar algorithm.
 *
 * It reads from standard input, parses numbers, and then
 * uses a data structure 'dp' (presumably a Map or similar)
 * along with a 'max' variable (which must be defined elsewhere
 * for this code to run, as it's not in the provided snippet).
 */


// Acquire the 'fs' module to handle file system operations.
const input = require('fs').readFileSync('/dev/stdin', 'utf8');


// Trim whitespace from the input string and split it into an array of lines.
const list = input.trim().split('\n');

// Destructure the first line of input to get 'n' and 'm' as strings.
let [ n, m ] = list[0].split(' ');

// Convert 'n' from string to a numeric type.
n = Number(n);

// Convert 'm' from string to a numeric type.
m = Number(m);


// Process the second line of input for 'cm' values.
let cm = list[1].trim().split(' ');

// Map each string element in 'cm' to its numeric equivalent.
cm = cm.map(c => Number(c));


// --- Debugging or initial state logging ---

// Output the current state of the 'dp' data structure.
console.log(dp);

// Output the value associated with 'n' in the 'dp' data structure,
// ensuring 'n' is treated as a number for the lookup.
console.log(dp.get(Number(n)));


// --- Main processing loop for dynamic programming ---

/*
 * This loop iterates from 0 up to 'n' (inclusive),
 * filling the 'dp' data structure based on previous calculations.
 */
for ( let i = 0; i <= n; i++ )
{
	// If 'dp' already contains a value for the current index 'i',
	// skip this iteration as it's already computed or initialized.
	if ( dp.has(i) )
	{
		continue; /* Move to the next iteration. */
	}

	// Initialize 'min' with the 'max' value, which serves as an upper bound
	// for finding the minimum count. 'max' must be defined globally or
	// elsewhere in the code.
	let min = max;

	/*
	 * Inner loop: Iterate through the 'cm' array to find potential
	 * predecessors for the current 'i' value.
	 */
	for ( let j = 0; j < m; j++ )
	{
		// Calculate the 'target' value, which is 'i' minus a 'cm' element.
		const target = i - cm[j];

		// Check if the 'target' is valid (non-negative) and
		// if 'dp' contains a value for this 'target'.
		if ( target < 0 || !dp.has(target) )
		{
			// If invalid or not computed, skip to the next 'cm' element.
			continue;
		}

		// Retrieve the count associated with the 'target' from 'dp'.
		const count = dp.get(target);

		// Update 'min' if the current 'count' is smaller.
		min = Math.min(count, min);
	}

	// After checking all 'cm' values, if a valid path was found
	// (i.e., 'min' was updated from its initial 'max' value),
	// then store the new minimum count for 'i' in 'dp'.
	if ( min < max )
	{
		dp.set(i, min + 1); // Store min count + 1 (for the current step).
	}
}

// --- Final Result Output ---

// Print the final result stored in 'dp' for the value of 'n'.
console.log(dp.get(n));